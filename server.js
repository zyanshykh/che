// Che Guevara Blog - server
// Sirf admin post/edit/delete kar sakta hai. Visitors sirf parh sakte hain.
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const LANGS = ['en', 'ur', 'rur'];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json({ limit: '6mb' }));

// ---------- helpers ----------
const readPosts = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writePosts = (posts) => fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

// ---------- admin session ----------
const sessions = new Map(); // token -> expiry time
const SESSION_MS = 1000 * 60 * 60 * 8; // 8 ghante

function isAdmin(req) {
  const t = parseCookies(req).sid;
  if (!t || !sessions.has(t)) return false;
  if (sessions.get(t) < Date.now()) { sessions.delete(t); return false; }
  return true;
}
function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Admin login zaroori hai' });
  next();
}

// login par brute-force se bachao
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
  const ip = req.ip;
  if (tooManyAttempts(ip)) return res.status(429).json({ error: 'Bohat koshishen. 15 minute baad dobara try karein.' });
  if (!safeEqual(req.body.password || '', ADMIN_PASSWORD)) {
    attempts.get(ip).count++;
    return res.status(401).json({ error: 'Password ghalat hai' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_MS);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const t = parseCookies(req).sid;
  if (t) sessions.delete(t);
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
function buildPost(body, existing) {
  const title = cleanLangObj(body.title, 200);
  const slug = slugify(body.slug || title.en || title.rur || '') || 'post-' + Date.now();
  const image = typeof body.image === 'string' && /^\/uploads\/[\w.-]+$/.test(body.image) ? body.image : '';
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

app.get('/api/posts', (req, res) => {
  let posts = readPosts();
  if (!(req.query.all && isAdmin(req))) posts = posts.filter((p) => p.published);
  posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(posts);
});

app.get('/api/posts/:slug', (req, res) => {
  const p = readPosts().find((x) => x.slug === req.params.slug);
  if (!p || (!p.published && !isAdmin(req))) return res.status(404).json({ error: 'Post nahi mili' });
  res.json(p);
});

app.post('/api/posts', requireAdmin, (req, res) => {
  const posts = readPosts();
  const post = buildPost(req.body);
  if (posts.some((p) => p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts.push(post);
  writePosts(posts);
  res.json(post);
});

app.put('/api/posts/:id', requireAdmin, (req, res) => {
  const posts = readPosts();
  const i = posts.findIndex((p) => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Post nahi mili' });
  const post = buildPost(req.body, posts[i]);
  if (posts.some((p, j) => j !== i && p.slug === post.slug)) post.slug += '-' + Date.now().toString(36);
  posts[i] = post;
  writePosts(posts);
  res.json(post);
});

app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  const posts = readPosts();
  const next = posts.filter((p) => p.id !== req.params.id);
  if (next.length === posts.length) return res.status(404).json({ error: 'Post nahi mili' });
  writePosts(next);
  res.json({ ok: true });
});

// ---------- image upload (base64 JSON, max 4MB) ----------
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
app.post('/api/upload', requireAdmin, (req, res) => {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(req.body.data || '');
  if (!m || !TYPES[m[1]]) return res.status(400).json({ error: 'Sirf JPG, PNG, WEBP ya GIF image' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'Image 4MB se choti honi chahiye' });
  const name = crypto.randomBytes(8).toString('hex') + '.' + TYPES[m[1]];
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  res.json({ url: '/uploads/' + name });
});

// ---------- static files ----------
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => {
  console.log(`Website chal rahi hai: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
  if (!process.env.ADMIN_PASSWORD) console.log('WARNING: default password use ho raha hai. ADMIN_PASSWORD set karein!');
});
