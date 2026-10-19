// Che Guevara Blog - server
// Sirf admin post/edit/delete kar sakta hai. Visitors sirf parh sakte hain.
// Local chalane ke liye: npm start.  Vercel par: api/index.js is app ko chalata hai.
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readPosts, writePosts } = require('./lib/store');

const app = express();
app.set('trust proxy', 1); // Vercel proxy ke peechay asli IP milay

const PORT = process.env.PORT || 3000;
const ON_VERCEL = !!process.env.VERCEL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';
// Vercel par password set na ho to login band rakho (default password khatarnak hai)
const LOGIN_LOCKED = ON_VERCEL && !process.env.ADMIN_PASSWORD;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const LANGS = ['en', 'ur', 'rur'];
const MAX_IMAGE = 3 * 1024 * 1024; // Vercel request limit ~4.5MB, base64 se barhta hai

app.use(express.json({ limit: '5mb' }));

// async routes ke errors ko saaf JSON mein bhejo
const h = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  });

// ---------- helpers ----------
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

// ---------- admin session (signed cookie: server memory ki zaroorat nahi) ----------
const SESSION_MS = 1000 * 60 * 60 * 8; // 8 ghante
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

// login par brute-force se bachao (har server instance ke liye alag hisab)
const attempts = new Map(); // ip -> {count, first}
function tooManyAttempts(ip) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.first > 15 * 60 * 1000) { attempts.set(ip, { count: 0, first: now }); return false; }
  return a.count >= 5;
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

app.post('/api/login', (req, res) => {
  if (LOGIN_LOCKED) return res.status(503).json({ error: 'ADMIN_PASSWORD set nahi hai. Vercel Environment Variables mein set karein.' });
  const ip = req.ip;
  if (tooManyAttempts(ip)) return res.status(429).json({ error: 'Bohat koshishen. 15 minute baad dobara try karein.' });
  if (!safeEqual((req.body && req.body.password) || '', ADMIN_PASSWORD)) {
    attempts.get(ip).count++;
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
// image: local /uploads/... ya Vercel Blob ka https link
const IMAGE_OK = /^(\/uploads\/[\w.-]+|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./%-]+)$/i;

function buildPost(body, existing) {
  const title = cleanLangObj(body.title, 200);
  const slug = slugify(body.slug || title.en || title.rur || '') || 'post-' + Date.now();
  const image = typeof body.image === 'string' && IMAGE_OK.test(body.image) ? body.image : '';
  return {
    id: existing ? existing.id : crypto.randomBytes(6).toString('hex'),
    slug,
    published: !!body.published,
    image,
    title,
    excerpt: cleanLangObj(body.excerpt, 400),
    content: cleanLangObj(body.content, 60000),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

app.get('/api/posts', h(async (req, res) => {
  let posts = await readPosts();
  if (!(req.query.all && isAdmin(req))) posts = posts.filter((p) => p.published);
  posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(posts);
}));

app.get('/api/posts/:slug', h(async (req, res) => {
  const p = (await readPosts()).find((x) => x.slug === req.params.slug);
  if (!p || (!p.published && !isAdmin(req))) return res.status(404).json({ error: 'Post nahi mili' });
  res.json(p);
}));

app.post('/api/posts', requireAdmin, h(async (req, res) => {
  const posts = await readPosts();
  const post = buildPost(req.body || {});
  if (posts.some((p) => p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts.push(post);
  await writePosts(posts);
  res.json(post);
}));

app.put('/api/posts/:id', requireAdmin, h(async (req, res) => {
  const posts = await readPosts();
  const i = posts.findIndex((p) => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Post nahi mili' });
  const post = buildPost(req.body || {}, posts[i]);
  if (posts.some((p, j) => j !== i && p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts[i] = post;
  await writePosts(posts);
  res.json(post);
}));

app.delete('/api/posts/:id', requireAdmin, h(async (req, res) => {
  const posts = await readPosts();
  const next = posts.filter((p) => p.id !== req.params.id);
  if (next.length === posts.length) return res.status(404).json({ error: 'Post nahi mili' });
  await writePosts(next);
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

  if (process.env.BLOB_READ_WRITE_TOKEN) {            // Vercel Blob
    const { put } = await import('@vercel/blob');
    const blob = await put('uploads/' + name, buf, { access: 'public', contentType: m[1] });
    return res.json({ url: blob.url });
  }
  if (ON_VERCEL) return res.status(500).json({ error: 'Image storage connect nahi hai. Vercel mein Blob add karein (README dekhein).' });

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });       // local computer
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  res.json({ url: '/uploads/' + name });
}));

// ---------- static files ----------
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Website chal rahi hai: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    if (!process.env.ADMIN_PASSWORD) console.log('WARNING: default password use ho raha hai. ADMIN_PASSWORD set karein!');
  });
}
