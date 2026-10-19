// Shared code: language, translations, helpers
const I18N = {
  en: {
    brand: 'CHE', nav_home: 'Home', nav_about: 'About', nav_blog: 'Blog',
    badge: 'The real story, 3 languages',
    hero_title: 'The man behind the <em>T-shirt</em>',
    hero_sub: 'Che Guevara: doctor, revolutionary, hero to some, controversial to others. Read the full story with facts, courage and mistakes.',
    cta: 'Read the story', latest: 'Latest stories', all: 'All stories',
    f1t: 'Honest history', f1d: 'Both his courage and his failures, with no propaganda.',
    f2t: '3 languages', f2d: 'English, Urdu and Roman Urdu. Switch anytime.',
    f3t: 'Lessons for today', f3d: 'What a young generation can learn: discipline, sacrifice and working before talking.',
    read_more: 'Read more', back: 'Back to blog', no_posts: 'No stories yet. Check back soon.',
    blog_title: 'Blog', blog_sub: 'All stories in one place.',
    about_title: 'About this project',
    about_p1: 'This website tells the real story of Ernesto "Che" Guevara. Not a poster, not a slogan, but the full human story.',
    about_p2: 'It was started by a young web developer from Karachi, who sees courage, sacrifice and consistency in Che\'s life, and who is learning to build things for the people around him.',
    about_p3: 'We do not hide the controversial parts of history. Readers deserve the whole picture and can decide for themselves.',
    footer: 'All rights reserved.', min: 'min read', loading: 'Loading...',
    not_available: 'This story is not available in this language yet. Showing English.',
    notfound: 'Story not found.'
  },
  ur: {
    brand: 'چے', nav_home: 'ہوم', nav_about: 'ہمارے بارے میں', nav_blog: 'بلاگ',
    badge: 'اصل کہانی، تین زبانوں میں',
    hero_title: 'ٹی شرٹ کے پیچھے <em>اصل انسان</em>',
    hero_sub: 'چے گویرا: ڈاکٹر، انقلابی، کسی کے لیے ہیرو اور کسی کے لیے متنازع۔ پوری کہانی پڑھیں، حقائق، ہمت اور غلطیوں کے ساتھ۔',
    cta: 'کہانی پڑھیں', latest: 'تازہ کہانیاں', all: 'تمام کہانیاں',
    f1t: 'ایماندار تاریخ', f1d: 'ان کی ہمت بھی اور ناکامیاں بھی، بغیر پروپیگنڈے کے۔',
    f2t: 'تین زبانیں', f2d: 'انگریزی، اردو اور رومن اردو۔ جب چاہیں بدلیں۔',
    f3t: 'آج کے لیے سبق', f3d: 'نوجوان نسل کیا سیکھ سکتی ہے: نظم و ضبط، قربانی اور بولنے سے پہلے عمل۔',
    read_more: 'مزید پڑھیں', back: 'بلاگ پر واپس', no_posts: 'ابھی کوئی کہانی نہیں۔ جلد واپس آئیں۔',
    blog_title: 'بلاگ', blog_sub: 'تمام کہانیاں ایک جگہ۔',
    about_title: 'اس پروجیکٹ کے بارے میں',
    about_p1: 'یہ ویب سائٹ ارنیسٹو "چے" گویرا کی اصل کہانی بیان کرتی ہے۔ کوئی پوسٹر نہیں، کوئی نعرہ نہیں، بلکہ مکمل انسانی کہانی۔',
    about_p2: 'اسے کراچی کے ایک نوجوان ویب ڈیولپر نے شروع کیا ہے، جو چے کی زندگی میں ہمت، قربانی اور استقامت دیکھتا ہے اور اپنے آس پاس کے لوگوں کے لیے کچھ بنانا سیکھ رہا ہے۔',
    about_p3: 'ہم تاریخ کے متنازع حصے نہیں چھپاتے۔ قارئین پوری تصویر کے حقدار ہیں اور خود فیصلہ کر سکتے ہیں۔',
    footer: 'تمام حقوق محفوظ ہیں۔', min: 'منٹ کا مطالعہ', loading: 'لوڈ ہو رہا ہے...',
    not_available: 'یہ کہانی ابھی اس زبان میں دستیاب نہیں۔ انگریزی دکھائی جا رہی ہے۔',
    notfound: 'کہانی نہیں ملی۔'
  },
  rur: {
    brand: 'CHE', nav_home: 'Home', nav_about: 'Hamare Bare Mein', nav_blog: 'Blog',
    badge: 'Asal kahani, 3 zubanon mein',
    hero_title: 'T-shirt ke peechay <em>asal insaan</em>',
    hero_sub: 'Che Guevara: doctor, inqilabi, kisi ke liye hero aur kisi ke liye mutanaza. Poori kahani parhein, haqaiq, himmat aur ghaltiyon ke saath.',
    cta: 'Kahani parhein', latest: 'Taza kahaniyan', all: 'Tamam kahaniyan',
    f1t: 'Imandar tareekh', f1d: 'Unki himmat bhi aur nakamiyan bhi, bagair propaganda ke.',
    f2t: '3 zubanein', f2d: 'English, Urdu aur Roman Urdu. Jab chahein badlein.',
    f3t: 'Aaj ke liye sabaq', f3d: 'Nai nasal kya seekh sakti hai: discipline, qurbani aur bolne se pehle amal.',
    read_more: 'Mazeed parhein', back: 'Blog par wapis', no_posts: 'Abhi koi kahani nahi. Jald wapis aayein.',
    blog_title: 'Blog', blog_sub: 'Tamam kahaniyan ek jagah.',
    about_title: 'Is project ke bare mein',
    about_p1: 'Ye website Ernesto "Che" Guevara ki asal kahani bayan karti hai. Koi poster nahi, koi nara nahi, balkeh mukammal insani kahani.',
    about_p2: 'Isay Karachi ke ek nojawan web developer ne shuru kiya hai, jo Che ki zindagi mein himmat, qurbani aur istiqamat dekhta hai aur apne aas paas ke logon ke liye kuch banana seekh raha hai.',
    about_p3: 'Hum tareekh ke mutanaza hisse nahi chhupate. Qareen poori tasveer ke haqdar hain aur khud faisla kar sakte hain.',
    footer: 'Tamam huqooq mehfooz hain.', min: 'minute ka mutala', loading: 'Load ho raha hai...',
    not_available: 'Ye kahani abhi is zubaan mein dastiyab nahi. English dikhayi ja rahi hai.',
    notfound: 'Kahani nahi mili.'
  }
};

const LANG_LABELS = { en: 'EN', ur: 'اردو', rur: 'Roman' };
let LANG = (() => { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } })();
if (!I18N[LANG]) LANG = 'en';

const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// post text -> safe HTML ("## Heading" and blank-line paragraphs)
function renderContent(text) {
  return String(text || '').split(/\n{2,}/).map((block) => {
    block = block.trim();
    if (!block) return '';
    const lines = block.split('\n');
    let out = '';
    let para = [];
    const flush = () => { if (para.length) { out += '<p>' + para.map(esc).join('<br>') + '</p>'; para = []; } };
    lines.forEach((ln) => {
      if (/^##\s+/.test(ln)) { flush(); out += '<h2>' + esc(ln.replace(/^##\s+/, '')) + '</h2>'; }
      else para.push(ln);
    });
    flush();
    return out;
  }).join('');
}

// pick text for current language, fall back to English, then any
function pick(obj) {
  if (!obj) return '';
  return obj[LANG] || obj.en || obj.rur || obj.ur || '';
}
const hasLang = (obj) => !!(obj && obj[LANG]);

function fmtDate(iso) {
  try {
    const loc = LANG === 'ur' ? 'ur-PK' : 'en-GB';
    return new Date(iso).toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return ''; }
}
function readMinutes(text) {
  return Math.max(1, Math.round(String(text || '').split(/\s+/).length / 200));
}

function applyLang() {
  document.documentElement.lang = LANG === 'ur' ? 'ur' : 'en';
  document.documentElement.dir = LANG === 'ur' ? 'rtl' : 'ltr';
  document.body.classList.remove('lang-en', 'lang-ur', 'lang-rur');
  document.body.classList.add('lang-' + LANG);
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === LANG));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem('lang', l); } catch (e) {}
  applyLang();
  if (typeof onLangChange === 'function') onLangChange();
}

function buildHeader(active) {
  const h = document.getElementById('header');
  if (!h) return;
  h.innerHTML = `
  <header class="site"><div class="wrap nav">
    <a class="brand" href="/"><span>★</span> <b data-i18n="brand"></b></a>
    <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
    <ul id="menu">
      <li><a class="link ${active === 'home' ? 'active' : ''}" href="/" data-i18n="nav_home"></a></li>
      <li><a class="link ${active === 'blog' ? 'active' : ''}" href="/blog.html" data-i18n="nav_blog"></a></li>
      <li><a class="link ${active === 'about' ? 'active' : ''}" href="/about.html" data-i18n="nav_about"></a></li>
      <li><div class="lang">${Object.keys(LANG_LABELS).map((l) => `<button data-l="${l}">${LANG_LABELS[l]}</button>`).join('')}</div></li>
    </ul>
  </div></header>`;
  h.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.l)));
  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('menu').classList.toggle('open'));
}

function buildFooter() {
  const f = document.getElementById('footer');
  if (!f) return;
  f.innerHTML = `<footer class="site"><div class="wrap"><span>© <span id="year"></span> Che Story</span><span data-i18n="footer"></span></div></footer>`;
}

async function api(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }, opts));
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}

function postCard(p) {
  const title = pick(p.title);
  const img = p.image ? `<img src="${esc(p.image)}" alt="${esc(title)}" loading="lazy">` : esc((title || '?').charAt(0).toUpperCase());
  return `<a class="card" href="/post.html?slug=${encodeURIComponent(p.slug)}">
    <div class="thumb">${img}</div>
    <div class="body">
      <span class="meta">${esc(fmtDate(p.createdAt))} · ${readMinutes(pick(p.content))} ${esc(t('min'))}</span>
      <h3>${esc(title)}</h3>
      <p>${esc(pick(p.excerpt))}</p>
    </div></a>`;
}

function initPage(active) {
  buildHeader(active);
  buildFooter();
  applyLang();
}
