// Posts storage.
// - Vercel / production: Upstash Redis (posts ek JSON ki tarah ek key mein)
// - Local computer (Redis env na ho): data/posts.json file
const fs = require('fs');
const path = require('path');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = 'che:posts';
const FILE = path.join(__dirname, '..', 'data', 'posts.json');
const useRedis = !!(REDIS_URL && REDIS_TOKEN);

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

// repo mein rakhi hui pehli post (read-only copy)
function seed() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return []; }
}

async function readPosts() {
  if (useRedis) {
    const v = await redis(['GET', KEY]);
    if (v == null) {            // pehli baar: database mein seed post daal do
      const s = seed();
      await redis(['SET', KEY, JSON.stringify(s)]);
      return s;
    }
    return JSON.parse(v);
  }
  return seed();
}

async function writePosts(posts) {
  if (useRedis) { await redis(['SET', KEY, JSON.stringify(posts)]); return; }
  if (process.env.VERCEL) {
    throw new Error('Database connect nahi hai. Vercel mein Upstash Redis add karein (README dekhein).');
  }
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}

module.exports = { readPosts, writePosts, useRedis };
