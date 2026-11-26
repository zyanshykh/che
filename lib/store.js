// Storage layer.
// - Online (Vercel): Upstash Redis (posts, view counters, newsletter list)
// - On your own computer (no Redis variables): small JSON files inside data/
const fs = require('fs');
const path = require('path');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const useRedis = !!(REDIS_URL && REDIS_TOKEN);
const ON_VERCEL = !!process.env.VERCEL;

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const VIEWS_FILE = path.join(DATA_DIR, 'views.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscribers.json');

const K_POSTS = 'che:posts';
const K_SUBS = 'che:subs';
const K_VIEWS = 'che:views:';

const NO_DB = 'Database connect nahi hai. Vercel mein Upstash Redis add karein (README dekhein).';

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error('Database error: ' + (d.error || r.status));
  return d.result;
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- posts ----------
// data/posts.json = starter content that ships with the code
const seedPosts = () => readJson(POSTS_FILE, []);

async function readPosts() {
  if (useRedis) {
    const v = await redis(['GET', K_POSTS]);
    if (v == null) {                       // first run: copy starter posts into the database
      const s = seedPosts();
      await redis(['SET', K_POSTS, JSON.stringify(s)]);
      return s;
    }
    return JSON.parse(v);
  }
  return seedPosts();
}

async function writePosts(posts) {
  if (useRedis) { await redis(['SET', K_POSTS, JSON.stringify(posts)]); return; }
  if (ON_VERCEL) throw new Error(NO_DB);
  writeJson(POSTS_FILE, posts);
}

// Admin button: copy updated starter posts from the code into the database (same id = replaced)
async function syncSeed() {
  if (!useRedis) return { updated: 0, added: 0, note: 'Local mode: data/posts.json is already the live data.' };
  const stored = await readPosts();
  const seed = seedPosts();
  let updated = 0, added = 0;
  seed.forEach((sp) => {
    const i = stored.findIndex((p) => p.id === sp.id);
    if (i >= 0) { stored[i] = sp; updated++; } else { stored.push(sp); added++; }
  });
  await writePosts(stored);
  return { updated, added };
}

// ---------- view counters ----------
async function incrView(id) {
  if (useRedis) { await redis(['INCR', K_VIEWS + id]); return; }
  if (ON_VERCEL) return;                  // no database: skip silently
  const v = readJson(VIEWS_FILE, {});
  v[id] = (v[id] || 0) + 1;
  writeJson(VIEWS_FILE, v);
}

async function getViews(ids) {
  const out = {};
  if (!ids.length) return out;
  if (useRedis) {
    const vals = await redis(['MGET', ...ids.map((i) => K_VIEWS + i)]);
    ids.forEach((id, n) => { out[id] = Number(vals[n]) || 0; });
    return out;
  }
  const v = readJson(VIEWS_FILE, {});
  ids.forEach((id) => { out[id] = v[id] || 0; });
  return out;
}

// ---------- newsletter subscribers ----------
async function addSubscriber(email, info) {
  const rec = JSON.stringify(Object.assign({ at: new Date().toISOString() }, info || {}));
  if (useRedis) return (await redis(['HSETNX', K_SUBS, email, rec])) === 1;   // true = new
  if (ON_VERCEL) throw new Error(NO_DB);
  const s = readJson(SUBS_FILE, {});
  if (s[email]) return false;
  s[email] = JSON.parse(rec);
  writeJson(SUBS_FILE, s);
  return true;
}

async function listSubscribers() {
  let rows = [];
  if (useRedis) {
    const flat = (await redis(['HGETALL', K_SUBS])) || [];
    for (let i = 0; i < flat.length; i += 2) {
      let meta = {};
      try { meta = JSON.parse(flat[i + 1]); } catch (e) {}
      rows.push(Object.assign({ email: flat[i] }, meta));
    }
  } else if (!ON_VERCEL) {
    const s = readJson(SUBS_FILE, {});
    rows = Object.keys(s).map((e) => Object.assign({ email: e }, s[e]));
  }
  return rows.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}

async function removeSubscriber(email) {
  if (useRedis) { await redis(['HDEL', K_SUBS, email]); return; }
  if (ON_VERCEL) throw new Error(NO_DB);
  const s = readJson(SUBS_FILE, {});
  delete s[email];
  writeJson(SUBS_FILE, s);
}

module.exports = {
  useRedis, readPosts, writePosts, syncSeed,
  incrView, getViews, addSubscriber, listSubscribers, removeSubscriber,
};
