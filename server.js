// Che Story - server
// Only the admin can post / edit / delete. Visitors can only read, search and subscribe.
// Local: npm start.  Vercel: api/index.js runs this app.
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./lib/store');

const app = express();
app.set('trust proxy', 1);          // so req.ip is the real visitor behind Vercel's proxy
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const ON_VERCEL = !!process.env.VERCEL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';
// On Vercel with no password set, login stays locked (the default password is not safe online)
const LOGIN_LOCKED = ON_VERCEL && !process.env.ADMIN_PASSWORD;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const LANGS = ['en', 'ur', 'rur'];
const TAGS = ['biography', 'cuba', 'africa', 'bolivia', 'legacy', 'analysis'];
const MAX_IMAGE = 3 * 1024 * 1024;  // Vercel limits request size, base64 adds ~33%

app.use(express.json({ limit: '5mb' }));

// basic security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  next();
});
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// async route wrapper: errors become clean JSON
const h = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  });

// ---------- page templates (read once; literal paths so Vercel bundles them) ----------
const PAGES = {
  index: fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8'),
  blog: fs.readFileSync(path.join(__dirname, 'views', 'blog.html'), 'utf8'),
  about: fs.readFileSync(path.join(__dirname, 'views', 'about.html'), 'utf8'),
  timeline: fs.readFileSync(path.join(__dirname, 'views', 'timeline.html'), 'utf8'),
  post: fs.readFileSync(path.join(__dirname, 'views', 'post.html'), 'utf8'),
  admin: fs.readFileSync(path.join(__dirname, 'views', 'admin.html'), 'utf8'),
  notfound: fs.readFileSync(path.join(__dirname, 'views', '404.html'), 'utf8'),
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// public address of the site (set SITE_URL on Vercel for exact links; otherwise taken from the request)
function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!/^https?$/.test(proto) || !/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return '';
  return proto + '://' + host;
}

function sendPage(res, html, base, status) {
  res.status(status || 200).type('html').send(html.split('{{SITE}}').join(esc(base)));
}

// ---------- helpers ----------
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

// simple in-memory rate limiter (best effort on serverless: each server instance keeps its own count)
function rateHit(map, key, max, windowMs) {
  const now = Date.now();
  const a = map.get(key);
  if (!a || now - a.first > windowMs) { map.set(key, { count: 1, first: now }); return false; }
  a.count++;
  return a.count > max;
}

// ---------- admin session (signed cookie, no server memory needed) ----------
const SESSION_MS = 1000 * 60 * 60 * 8; // 8 hours
const SECRET = process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('che-session:' + ADMIN_PASSWORD).digest('hex');
const sign = (exp) => crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
const makeToken = () => { const exp = Date.now() + SESSION_MS; return exp + '.' + sign(exp); };

function isAdmin(req) {
  const t = parseCookies(req).sid;
  if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  if (sig.length !== good.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Admin login zaroori hai' });
  next();
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const loginTries = new Map();
app.post('/api/login', (req, res) => {
  if (LOGIN_LOCKED) return res.status(503).json({ error: 'ADMIN_PASSWORD set nahi hai. Vercel Environment Variables mein set karein.' });
  const ip = req.ip;
  const rec = loginTries.get(ip);
  if (rec && Date.now() - rec.first < 15 * 60 * 1000 && rec.count >= 5) {
    return res.status(429).json({ error: 'Bohat koshishen. 15 minute baad dobara try karein.' });
  }
  if (!safeEqual((req.body && req.body.password) || '', ADMIN_PASSWORD)) {
    rateHit(loginTries, ip, 999, 15 * 60 * 1000);
    return res.status(401).json({ error: 'Password ghalat hai' });
  }
  const secure = process.env.NODE_ENV === 'production' || ON_VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sid=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => res.json({ admin: isAdmin(req) }));

// ---------- posts ----------
function cleanLangObj(obj, max) {
  const out = {};
  LANGS.forEach((l) => { out[l] = String((obj && obj[l]) || '').slice(0, max); });
  return out;
}
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
// cover image: a local /uploads file or a Vercel Blob https link
const IMAGE_OK = /^(\/uploads\/[\w.-]+|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./%-]+)$/i;
const URL_OK = /^https:\/\/[^\s<>"'`]{4,500}$/;

function cleanSources(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 25).map((s) => ({
    title: String((s && s.title) || '').trim().slice(0, 160),
    url: String((s && s.url) || '').trim(),
  })).filter((s) => s.title && URL_OK.test(s.url));
}
function cleanTags(list) {
  if (!Array.isArray(list)) return [];
  return TAGS.filter((t) => list.includes(t));
}

function buildPost(body, existing) {
  const title = cleanLangObj(body.title, 200);
  const slug = slugify(body.slug || title.en || title.rur || '') || 'post-' + Date.now();
  const image = typeof body.image === 'string' && IMAGE_OK.test(body.image) ? body.image : '';
  const post = {
    id: existing ? existing.id : crypto.randomBytes(6).toString('hex'),
    slug,
    published: !!body.published,
    image,
    tags: cleanTags(body.tags),
    title,
    excerpt: cleanLangObj(body.excerpt, 400),
    content: cleanLangObj(body.content, 60000),
    sources: cleanSources(body.sources),
    quotes: cleanLangObj(body.quotes, 2000),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return post;
}

const wordCount = (t) => (String(t || '').trim() ? String(t).trim().split(/\s+/).length : 0);

// small version of a post for lists (no full text)
function summary(p) {
  const readMin = {}, has = {};
  LANGS.forEach((l) => {
    readMin[l] = Math.max(1, Math.round(wordCount(p.content && p.content[l]) / 200));
    has[l] = !!(p.content && p.content[l]);
  });
  return {
    id: p.id, slug: p.slug, published: p.published, image: p.image || '', tags: p.tags || [],
    title: p.title, excerpt: p.excerpt, createdAt: p.createdAt, updatedAt: p.updatedAt, readMin, has,
  };
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

function matches(p, q) {
  const hay = [];
  LANGS.forEach((l) => { hay.push(p.title[l], p.excerpt[l], p.content[l]); });
  return hay.join(' \n ').toLowerCase().includes(q);
}

app.get('/api/posts', h(async (req, res) => {
  const admin = isAdmin(req);
  let posts = await store.readPosts();
  if (!(req.query.all && admin)) posts = posts.filter((p) => p.published);
  const q = String(req.query.q || '').trim().toLowerCase().slice(0, 80);
  if (q) posts = posts.filter((p) => matches(p, q));
  const tag = String(req.query.tag || '');
  if (TAGS.includes(tag)) posts = posts.filter((p) => (p.tags || []).includes(tag));
  posts = posts.slice().sort(newestFirst);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 100);
  if (limit) posts = posts.slice(0, limit);

  if (req.query.all && admin) {            // admin panel: full posts + view counts
    const views = await store.getViews(posts.map((p) => p.id));
    return res.json(posts.map((p) => Object.assign({}, p, { views: views[p.id] || 0 })));
  }
  res.json(posts.map(summary));
}));

app.get('/api/posts/:slug', h(async (req, res) => {
  const admin = isAdmin(req);
  const all = await store.readPosts();
  const p = all.find((x) => x.slug === req.params.slug);
  if (!p || (!p.published && !admin)) return res.status(404).json({ error: 'Post nahi mili' });

  const live = all.filter((x) => x.published).sort(newestFirst);
  const i = live.findIndex((x) => x.id === p.id);
  const newer = i > 0 ? summary(live[i - 1]) : null;
  const older = i >= 0 && i < live.length - 1 ? summary(live[i + 1]) : null;

  const others = live.filter((x) => x.id !== p.id);
  const mine = p.tags || [];
  const scored = others.map((x) => ({ x, n: (x.tags || []).filter((t) => mine.includes(t)).length }));
  let related = scored.filter((s) => s.n > 0).sort((a, b) => b.n - a.n || newestFirst(a.x, b.x)).map((s) => s.x);
  if (!related.length) related = others;
  related = related.slice(0, 3).map(summary);

  res.json(Object.assign({}, p, { newer, older, related }));
}));

// count one view (readers only, never the admin). Ignores repeats from the same visitor for 30 minutes.
const viewSeen = new Map();
app.post('/api/posts/:slug/view', h(async (req, res) => {
  if (isAdmin(req)) return res.json({ ok: true });
  const p = (await store.readPosts()).find((x) => x.slug === req.params.slug && x.published);
  if (!p) return res.json({ ok: true });
  if (rateHit(viewSeen, req.ip + ':' + p.id, 1, 30 * 60 * 1000)) return res.json({ ok: true });
  try { await store.incrView(p.id); } catch (e) { console.error('view count failed', e.message); }
  res.json({ ok: true });
}));

app.post('/api/posts', requireAdmin, h(async (req, res) => {
  const posts = await store.readPosts();
  const post = buildPost(req.body || {});
  if (posts.some((p) => p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts.push(post);
  await store.writePosts(posts);
  res.json(post);
}));

app.put('/api/posts/:id', requireAdmin, h(async (req, res) => {
  const posts = await store.readPosts();
  const i = posts.findIndex((p) => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Post nahi mili' });
  const post = buildPost(req.body || {}, posts[i]);
  if (posts.some((p, j) => j !== i && p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts[i] = post;
  await store.writePosts(posts);
  res.json(post);
}));

app.delete('/api/posts/:id', requireAdmin, h(async (req, res) => {
  const posts = await store.readPosts();
  const next = posts.filter((p) => p.id !== req.params.id);
  if (next.length === posts.length) return res.status(404).json({ error: 'Post nahi mili' });
  await store.writePosts(next);
  res.json({ ok: true });
}));

// copy the starter story from the code into the database (overwrites the same post id)
app.post('/api/admin/sync-seed', requireAdmin, h(async (req, res) => {
  res.json(await store.syncSeed());
}));

// ---------- newsletter ----------
const subTries = new Map();
const EMAIL_OK = /^[^\s@<>"'`;,]+@[^\s@<>"'`;,]+\.[^\s@<>"'`;,]{2,}$/;
app.post('/api/subscribe', h(async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true });                     // hidden field: bots fill it in
  if (rateHit(subTries, req.ip, 5, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many tries. Please try again later.' });
  const email = String(b.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_OK.test(email)) return res.status(400).json({ error: 'invalid_email' });
  const lang = LANGS.includes(b.lang) ? b.lang : 'en';
  const added = await store.addSubscriber(email, { lang });
  res.json({ ok: true, already: !added });
}));

app.get('/api/subscribers', requireAdmin, h(async (req, res) => {
  res.json(await store.listSubscribers());
}));

app.get('/api/subscribers.csv', requireAdmin, h(async (req, res) => {
  const cell = (v) => {
    let s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;                        // stop spreadsheet formula injection
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const rows = await store.listSubscribers();
  const csv = ['email,language,subscribed_at']
    .concat(rows.map((r) => [cell(r.email), cell(r.lang), cell(r.at)].join(','))).join('\n');
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="subscribers.csv"');
  res.send(csv);
}));

app.delete('/api/subscribers', requireAdmin, h(async (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email missing' });
  await store.removeSubscriber(email);
  res.json({ ok: true });
}));

// ---------- image upload (base64 JSON, max 3MB) ----------
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
app.post('/api/upload', requireAdmin, h(async (req, res) => {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec((req.body && req.body.data) || '');
  if (!m || !TYPES[m[1]]) return res.status(400).json({ error: 'Sirf JPG, PNG, WEBP ya GIF image' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_IMAGE) return res.status(400).json({ error: 'Image 3MB se choti honi chahiye' });
  const name = crypto.randomBytes(8).toString('hex') + '.' + TYPES[m[1]];

  if (process.env.BLOB_READ_WRITE_TOKEN) {                            // Vercel Blob
    const { put } = await import('@vercel/blob');
    const blob = await put('uploads/' + name, buf, { access: 'public', contentType: m[1] });
    return res.json({ url: blob.url });
  }
  if (ON_VERCEL) return res.status(500).json({ error: 'Image storage connect nahi hai. Vercel mein Blob add karein (README dekhein).' });

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });                      // your own computer
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  res.json({ url: '/uploads/' + name });
}));

// ---------- pages ----------
app.get(['/', '/index.html'], (req, res) => sendPage(res, PAGES.index, siteUrl(req)));
app.get(['/blog', '/blog.html'], (req, res) => sendPage(res, PAGES.blog, siteUrl(req)));
app.get(['/about', '/about.html'], (req, res) => sendPage(res, PAGES.about, siteUrl(req)));
app.get(['/timeline', '/timeline.html'], (req, res) => sendPage(res, PAGES.timeline, siteUrl(req)));
app.get(['/admin', '/admin.html'], (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  sendPage(res, PAGES.admin, siteUrl(req));
});

// old links: /post.html?slug=abc  ->  /post/abc
app.get('/post.html', (req, res) => {
  const s = String(req.query.slug || '');
  res.redirect(301, /^[a-z0-9-]{1,80}$/.test(s) ? '/post/' + s : '/blog');
});

// post page: the server adds the title, description and share-preview tags so
// Google, WhatsApp and Facebook can read them. The article itself is drawn by the browser.
function postHead(p, base) {
  const title = (p.title.en || p.title.rur || p.title.ur || 'Story') + ' | Che Story';
  const desc = (p.excerpt.en || p.excerpt.rur || p.excerpt.ur || '').slice(0, 300);
  const url = base + '/post/' + p.slug;
  let img = base + '/img/og-default.png';
  if (p.image) img = /^https:/.test(p.image) ? p.image : base + p.image;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.title.en || p.title.rur || p.title.ur, description: desc, image: [img],
    datePublished: p.createdAt, dateModified: p.updatedAt, inLanguage: 'en',
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Che Story' },
    publisher: { '@type': 'Organization', name: 'Che Story' },
  };
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Che Story">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

app.get('/post/:slug', h(async (req, res) => {
  const base = siteUrl(req);
  const p = (await store.readPosts()).find((x) => x.slug === req.params.slug && (x.published || isAdmin(req)));
  if (!p) return sendPage(res, PAGES.post.replace('<!--SEO-->', '<meta name="robots" content="noindex">'), base, 404);
  const html = PAGES.post.replace(/<title>[^<]*<\/title>/, '').replace('<!--SEO-->', () => postHead(p, base));
  sendPage(res, html, base);
}));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);
});

app.get('/sitemap.xml', h(async (req, res) => {
  const base = siteUrl(req);
  const posts = (await store.readPosts()).filter((p) => p.published).sort(newestFirst);
  const day = (iso) => String(iso || '').slice(0, 10);
  const urls = [['/', ''], ['/blog', ''], ['/timeline', ''], ['/about', '']]
    .map(([u, d]) => `<url><loc>${esc(base + u)}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`)
    .concat(posts.map((p) => `<url><loc>${esc(base + '/post/' + p.slug)}</loc><lastmod>${esc(day(p.updatedAt))}</lastmod></url>`));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}));

// ---------- static files (css, js, images, uploads) ----------
app.use(express.static(path.join(__dirname, 'public'), { index: false, maxAge: '1h' }));
app.use((req, res) => sendPage(res, PAGES.notfound, siteUrl(req), 404));

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Website chal rahi hai: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    if (!process.env.ADMIN_PASSWORD) console.log('WARNING: default password use ho raha hai. ADMIN_PASSWORD set karein!');
  });
}
