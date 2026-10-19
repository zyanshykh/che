// Admin panel logic. Server checks the admin cookie on every write.
const $ = (id) => document.getElementById(id);
const LANGS = [['en', 'English', 'ltr'], ['ur', 'اردو', 'rtl'], ['rur', 'Roman Urdu', 'ltr']];
let editingId = null;
let imageUrl = '';
let posts = [];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }, opts));
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && url !== '/api/login') { showLogin(); throw new Error(data.error || 'Login required'); }
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}

function flash(el, text, ok) {
  el.className = 'msg ' + (ok ? 'ok' : 'err');
  el.textContent = text;
  if (ok) setTimeout(() => { el.className = 'msg'; }, 3000);
}

// build the 3 language panes once
$('panes').innerHTML = LANGS.map(([l, name, dir], i) => `
  <div class="langpane ${i === 0 ? 'on' : ''}" data-l="${l}" dir="${dir}">
    <label>Title (${name})</label>
    <input type="text" id="title_${l}">
    <label>Short summary (${name})</label>
    <textarea id="excerpt_${l}"></textarea>
    <label>Article (${name})</label>
    <textarea class="big" id="content_${l}"></textarea>
  </div>`).join('');

$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('on', x === b));
  document.querySelectorAll('.langpane').forEach((p) => p.classList.toggle('on', p.dataset.l === b.dataset.l));
});

function showLogin() {
  $('loginBox').classList.remove('hidden');
  $('dash').classList.add('hidden');
  $('logoutBtn').classList.add('hidden');
}
function showDash() {
  $('loginBox').classList.add('hidden');
  $('dash').classList.remove('hidden');
  $('logoutBtn').classList.remove('hidden');
  loadPosts();
}

async function loadPosts() {
  posts = await api('/api/posts?all=1');
  $('list').innerHTML = posts.length ? posts.map((p) => `
    <div class="post-row">
      <div>
        <b>${esc(p.title.en || p.title.rur || p.title.ur || '(no title)')}</b>
        <span class="tag ${p.published ? 'live' : ''}">${p.published ? 'Published' : 'Draft'}</span>
        <div class="meta">${esc(new Date(p.createdAt).toLocaleDateString())} · /${esc(p.slug)}</div>
      </div>
      <div class="row">
        <a class="btn ghost sm" href="/post.html?slug=${encodeURIComponent(p.slug)}" target="_blank">View</a>
        <button class="btn ghost sm" data-edit="${esc(p.id)}">Edit</button>
        <button class="btn danger sm" data-del="${esc(p.id)}">Delete</button>
      </div>
    </div>`).join('') : '<p class="hint">No posts yet. Click "+ New post".</p>';
}

$('list').addEventListener('click', async (e) => {
  const ed = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-del]');
  if (ed) openEditor(posts.find((p) => p.id === ed.dataset.edit));
  if (del && confirm('Delete this post permanently?')) {
    try { await api('/api/posts/' + del.dataset.del, { method: 'DELETE' }); loadPosts(); closeEditor(); }
    catch (err) { alert(err.message); }
  }
});

function setImage(url) {
  imageUrl = url || '';
  $('imgPrev').classList.toggle('hidden', !imageUrl);
  $('rmImg').classList.toggle('hidden', !imageUrl);
  if (imageUrl) $('imgPrev').src = imageUrl;
}

function openEditor(p) {
  editingId = p ? p.id : null;
  $('editorTitle').textContent = p ? 'Edit post' : 'New post';
  LANGS.forEach(([l]) => {
    $('title_' + l).value = p ? p.title[l] : '';
    $('excerpt_' + l).value = p ? p.excerpt[l] : '';
    $('content_' + l).value = p ? p.content[l] : '';
  });
  $('slug').value = p ? p.slug : '';
  $('published').checked = p ? p.published : true;
  $('file').value = '';
  setImage(p ? p.image : '');
  $('saveMsg').className = 'msg';
  $('editor').classList.remove('hidden');
  $('editor').scrollIntoView({ behavior: 'smooth' });
}
function closeEditor() { $('editor').classList.add('hidden'); editingId = null; }

$('newBtn').onclick = () => openEditor(null);
$('cancelBtn').onclick = closeEditor;
$('rmImg').onclick = () => setImage('');

$('file').addEventListener('change', () => {
  const f = $('file').files[0];
  if (!f) return;
  if (f.size > 3 * 1024 * 1024) { flash($('saveMsg'), 'Image is bigger than 3MB', false); $('file').value = ''; return; }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const r = await api('/api/upload', { method: 'POST', body: JSON.stringify({ data: reader.result }) });
      setImage(r.url);
      flash($('saveMsg'), 'Image uploaded', true);
    } catch (err) { flash($('saveMsg'), err.message, false); }
  };
  reader.readAsDataURL(f);
});

$('saveBtn').onclick = async () => {
  const body = { title: {}, excerpt: {}, content: {}, slug: $('slug').value, image: imageUrl, published: $('published').checked };
  LANGS.forEach(([l]) => {
    body.title[l] = $('title_' + l).value.trim();
    body.excerpt[l] = $('excerpt_' + l).value.trim();
    body.content[l] = $('content_' + l).value.trim();
  });
  if (!body.title.en && !body.title.ur && !body.title.rur) { flash($('saveMsg'), 'Write a title in at least one language', false); return; }
  if (!body.content.en && !body.content.ur && !body.content.rur) { flash($('saveMsg'), 'Write the article in at least one language', false); return; }
  try {
    const p = await api(editingId ? '/api/posts/' + editingId : '/api/posts', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body) });
    editingId = p.id;
    $('slug').value = p.slug;
    flash($('saveMsg'), 'Saved. ' + (p.published ? 'It is live.' : 'Saved as draft.'), true);
    loadPosts();
  } catch (err) { flash($('saveMsg'), err.message, false); }
};

async function login() {
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('pw').value }) });
    $('pw').value = '';
    showDash();
  } catch (err) { flash($('loginMsg'), err.message, false); }
}
$('loginBtn').onclick = login;
$('pw').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
$('logoutBtn').onclick = async () => { await api('/api/logout', { method: 'POST' }); closeEditor(); showLogin(); };

api('/api/me').then((r) => (r.admin ? showDash() : showLogin())).catch(showLogin);
