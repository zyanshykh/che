// Shared code for every page: languages, theme, header, footer + newsletter, helpers.
const I18N = {
  en: {
    brand: 'CHE', skip: 'Skip to content', theme: 'Switch light/dark theme',
    nav_home: 'Home', nav_about: 'About', nav_blog: 'Blog', nav_timeline: 'Timeline',
    badge: 'The real story, in 3 languages',
    hero_title: 'The man behind the <em style="white-space:nowrap">T-shirt</em>',
    hero_sub: 'Che Guevara: doctor, revolutionary, hero to some, controversial to others. Read the full story with facts, courage and mistakes, and every source listed.',
    cta: 'Read the story', cta2: 'See the timeline', latest: 'Latest stories', all: 'All stories',
    f1t: 'Honest history', f1d: 'Both his courage and his failures, with no propaganda.',
    f2t: '3 languages', f2d: 'English, Urdu and Roman Urdu. Switch anytime.',
    f3t: 'Sources you can check', f3d: 'Every story ends with its sources, so you can verify the facts yourself.',
    read_more: 'Read more', back: 'Back to blog', no_posts: 'No stories yet. Check back soon.',
    blog_title: 'Blog', blog_sub: 'All stories in one place.',
    search_ph: 'Search stories...', all_tags: 'All', no_results: 'No stories match your search.',
    tag_biography: 'Life story', tag_cuba: 'Cuba', tag_africa: 'Africa', tag_bolivia: 'Bolivia', tag_legacy: 'Legacy', tag_analysis: 'Analysis',
    about_title: 'About this project',
    about_p1: 'This website tells the real story of Ernesto "Che" Guevara. Not a poster, not a slogan, but the full human story.',
    about_p2: 'It was started by a young web developer from Karachi, who sees courage, sacrifice and consistency in Che\'s life, and who is learning to build things for the people around him.',
    about_p3: 'We do not hide the controversial parts of history. Readers deserve the whole picture and can decide for themselves.',
    about_p4: 'Every story lists its sources at the bottom. Where historians disagree on a number or a date, we say so.',
    tl_title: 'Che Guevara: a timeline', tl_sub: 'His life, year by year, from Rosario in 1928 to La Higuera in 1967 and the return of his remains in 1997.',
    tl_cta: 'Read the full story',
    share: 'Share', copy_link: 'Copy link', copied: 'Copied!',
    sources_title: 'Sources', quotes_title: 'In his own words, and others\'',
    related: 'You may also like', newer: 'Newer story', older: 'Older story',
    nl_title: 'Get new stories by email', nl_sub: 'Leave your email and we will let you know when a new story is published.',
    nl_ph: 'Your email', nl_btn: 'Subscribe',
    nl_ok: 'Thank you! You are subscribed.', nl_already: 'You are already subscribed.',
    nl_bad: 'Please enter a valid email.', nl_err: 'Something went wrong. Please try again later.',
    footer: 'All rights reserved.', min: 'min read', loading: 'Loading...',
    not_available: 'This story is not available in this language yet. Showing English.',
    notfound: 'Story not found.'
  },
  ur: {
    brand: 'چے', skip: 'مواد پر جائیں', theme: 'روشن/تاریک تھیم بدلیں',
    nav_home: 'ہوم', nav_about: 'ہمارے بارے میں', nav_blog: 'بلاگ', nav_timeline: 'ٹائم لائن',
    badge: 'اصل کہانی، تین زبانوں میں',
    hero_title: 'ٹی شرٹ کے پیچھے <em>اصل انسان</em>',
    hero_sub: 'چے گویرا: ڈاکٹر، انقلابی، کسی کے لیے ہیرو اور کسی کے لیے متنازع۔ پوری کہانی پڑھیں، حقائق، ہمت اور غلطیوں کے ساتھ، اور ہر ماخذ کے ساتھ۔',
    cta: 'کہانی پڑھیں', cta2: 'ٹائم لائن دیکھیں', latest: 'تازہ کہانیاں', all: 'تمام کہانیاں',
    f1t: 'ایماندار تاریخ', f1d: 'ان کی ہمت بھی اور ناکامیاں بھی، بغیر پروپیگنڈے کے۔',
    f2t: 'تین زبانیں', f2d: 'انگریزی، اردو اور رومن اردو۔ جب چاہیں بدلیں۔',
    f3t: 'ماخذ جنہیں آپ جانچ سکتے ہیں', f3d: 'ہر کہانی کے آخر میں اس کے ماخذ درج ہیں، تاکہ آپ خود حقائق کی تصدیق کر سکیں۔',
    read_more: 'مزید پڑھیں', back: 'بلاگ پر واپس', no_posts: 'ابھی کوئی کہانی نہیں۔ جلد واپس آئیں۔',
    blog_title: 'بلاگ', blog_sub: 'تمام کہانیاں ایک جگہ۔',
    search_ph: 'کہانیوں میں تلاش کریں...', all_tags: 'سب', no_results: 'آپ کی تلاش سے کوئی کہانی نہیں ملی۔',
    tag_biography: 'سوانح', tag_cuba: 'کیوبا', tag_africa: 'افریقہ', tag_bolivia: 'بولیویا', tag_legacy: 'میراث', tag_analysis: 'تجزیہ',
    about_title: 'اس پروجیکٹ کے بارے میں',
    about_p1: 'یہ ویب سائٹ ارنیسٹو "چے" گویرا کی اصل کہانی بیان کرتی ہے۔ کوئی پوسٹر نہیں، کوئی نعرہ نہیں، بلکہ مکمل انسانی کہانی۔',
    about_p2: 'اسے کراچی کے ایک نوجوان ویب ڈیولپر نے شروع کیا ہے، جو چے کی زندگی میں ہمت، قربانی اور استقامت دیکھتا ہے اور اپنے آس پاس کے لوگوں کے لیے کچھ بنانا سیکھ رہا ہے۔',
    about_p3: 'ہم تاریخ کے متنازع حصے نہیں چھپاتے۔ قارئین پوری تصویر کے حقدار ہیں اور خود فیصلہ کر سکتے ہیں۔',
    about_p4: 'ہر کہانی کے آخر میں اس کے ماخذ درج ہیں۔ جہاں مؤرخین کسی عدد یا تاریخ پر اختلاف رکھتے ہیں، وہاں ہم یہ بتا دیتے ہیں۔',
    tl_title: 'چے گویرا: ٹائم لائن', tl_sub: 'ان کی زندگی سال بہ سال، 1928 میں روزاریو سے 1967 میں لا ایگیرا تک، اور 1997 میں باقیات کی واپسی تک۔',
    tl_cta: 'مکمل کہانی پڑھیں',
    share: 'شیئر کریں', copy_link: 'لنک کاپی کریں', copied: 'کاپی ہو گیا!',
    sources_title: 'ماخذ', quotes_title: 'ان کے اپنے الفاظ، اور دوسروں کے',
    related: 'یہ بھی پڑھیں', newer: 'نئی کہانی', older: 'پرانی کہانی',
    nl_title: 'نئی کہانیاں ای میل پر حاصل کریں', nl_sub: 'اپنی ای میل چھوڑیں، نئی کہانی شائع ہونے پر ہم آپ کو بتائیں گے۔',
    nl_ph: 'آپ کی ای میل', nl_btn: 'سبسکرائب کریں',
    nl_ok: 'شکریہ! آپ سبسکرائب ہو گئے۔', nl_already: 'آپ پہلے سے سبسکرائب ہیں۔',
    nl_bad: 'براہِ کرم درست ای میل لکھیں۔', nl_err: 'کچھ غلط ہو گیا۔ براہِ کرم بعد میں کوشش کریں۔',
    footer: 'تمام حقوق محفوظ ہیں۔', min: 'منٹ کا مطالعہ', loading: 'لوڈ ہو رہا ہے...',
    not_available: 'یہ کہانی ابھی اس زبان میں دستیاب نہیں۔ انگریزی دکھائی جا رہی ہے۔',
    notfound: 'کہانی نہیں ملی۔'
  },
  rur: {
    brand: 'CHE', skip: 'Content par jayein', theme: 'Roshan/tareek theme badlein',
    nav_home: 'Home', nav_about: 'Hamare Bare Mein', nav_blog: 'Blog', nav_timeline: 'Timeline',
    badge: 'Asal kahani, 3 zubanon mein',
    hero_title: '<span style="white-space:nowrap">T-shirt</span> ke peechay <em>asal insaan</em>',
    hero_sub: 'Che Guevara: doctor, inqilabi, kisi ke liye hero aur kisi ke liye mutanaza. Poori kahani parhein, haqaiq, himmat aur ghaltiyon ke saath, aur har maakhaz ke saath.',
    cta: 'Kahani parhein', cta2: 'Timeline dekhein', latest: 'Taza kahaniyan', all: 'Tamam kahaniyan',
    f1t: 'Imandar tareekh', f1d: 'Unki himmat bhi aur nakamiyan bhi, bagair propaganda ke.',
    f2t: '3 zubanein', f2d: 'English, Urdu aur Roman Urdu. Jab chahein badlein.',
    f3t: 'Maakhaz jinhein aap jaanch sakte hain', f3d: 'Har kahani ke aakhir mein uske maakhaz darj hain, taake aap khud haqaiq ki tasdeeq kar sakein.',
    read_more: 'Mazeed parhein', back: 'Blog par wapis', no_posts: 'Abhi koi kahani nahi. Jald wapis aayein.',
    blog_title: 'Blog', blog_sub: 'Tamam kahaniyan ek jagah.',
    search_ph: 'Kahaniyon mein talash karein...', all_tags: 'Sab', no_results: 'Aapki talash se koi kahani nahi mili.',
    tag_biography: 'Sawaneh', tag_cuba: 'Cuba', tag_africa: 'Africa', tag_bolivia: 'Bolivia', tag_legacy: 'Meeras', tag_analysis: 'Tajziya',
    about_title: 'Is project ke bare mein',
    about_p1: 'Ye website Ernesto "Che" Guevara ki asal kahani bayan karti hai. Koi poster nahi, koi nara nahi, balkeh mukammal insani kahani.',
    about_p2: 'Isay Karachi ke ek nojawan web developer ne shuru kiya hai, jo Che ki zindagi mein himmat, qurbani aur istiqamat dekhta hai aur apne aas paas ke logon ke liye kuch banana seekh raha hai.',
    about_p3: 'Hum tareekh ke mutanaza hisse nahi chhupate. Qareen poori tasveer ke haqdar hain aur khud faisla kar sakte hain.',
    about_p4: 'Har kahani ke aakhir mein uske maakhaz darj hain. Jahan mu\'arrikhin kisi adad ya tareekh par ikhtilaf rakhte hain, wahan hum ye bata dete hain.',
    tl_title: 'Che Guevara: Timeline', tl_sub: 'Unki zindagi saal ba saal, 1928 mein Rosario se 1967 mein La Higuera tak, aur 1997 mein baqiyat ki wapsi tak.',
    tl_cta: 'Mukammal kahani parhein',
    share: 'Share karein', copy_link: 'Link copy karein', copied: 'Copy ho gaya!',
    sources_title: 'Maakhaz', quotes_title: 'Unke apne alfaz, aur doosron ke',
    related: 'Ye bhi parhein', newer: 'Nayi kahani', older: 'Purani kahani',
    nl_title: 'Nayi kahaniyan email par hasil karein', nl_sub: 'Apni email chhodein, nayi kahani shaya hone par hum aapko bata denge.',
    nl_ph: 'Aapki email', nl_btn: 'Subscribe karein',
    nl_ok: 'Shukriya! Aap subscribe ho gaye.', nl_already: 'Aap pehle se subscribed hain.',
    nl_bad: 'Barah-e-karam durust email likhein.', nl_err: 'Kuch ghalat ho gaya. Baad mein dobara koshish karein.',
    footer: 'Tamam huqooq mehfooz hain.', min: 'minute ka mutala', loading: 'Load ho raha hai...',
    not_available: 'Ye kahani abhi is zubaan mein dastiyab nahi. English dikhayi ja rahi hai.',
    notfound: 'Kahani nahi mili.'
  }
};

const TAGS = ['biography', 'cuba', 'africa', 'bolivia', 'legacy', 'analysis'];
const LANG_LABELS = { en: 'EN', ur: 'اردو', rur: 'Roman' };
let LANG = (() => { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } })();
if (!I18N[LANG]) LANG = 'en';

const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
const tagLabel = (x) => t('tag_' + x);

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// post text -> safe HTML.
// Supported: "## heading", "> quote", "- bullet", **bold**, *italic*, blank line = new paragraph
function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}
function renderContent(text) {
  const out = []; let para = [], list = [], quote = [];
  const flush = () => {
    if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; }
    if (list.length) { out.push('<ul>' + list.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ul>'); list = []; }
    if (quote.length) { out.push('<blockquote>' + quote.map(inline).join('<br>') + '</blockquote>'); quote = []; }
  };
  String(text || '').split('\n').forEach((raw) => {
    const ln = raw.trimEnd();
    if (!ln.trim()) { flush(); return; }
    let m;
    if ((m = /^##\s+(.*)$/.exec(ln))) { flush(); out.push('<h2>' + inline(m[1]) + '</h2>'); }
    else if ((m = /^>\s?(.*)$/.exec(ln))) { if (para.length || list.length) flush(); quote.push(m[1]); }
    else if ((m = /^-\s+(.*)$/.exec(ln))) { if (para.length || quote.length) flush(); list.push(m[1]); }
    else { if (list.length || quote.length) flush(); para.push(ln); }
  });
  flush();
  return out.join('');
}

// pick text for the current language, then English, then anything
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
function readMin(p) {
  if (p.readMin) return p.readMin[LANG] || p.readMin.en || 1;
  return Math.max(1, Math.round(String(pick(p.content)).split(/\s+/).length / 200));
}

function applyLang() {
  document.documentElement.lang = LANG === 'ur' ? 'ur' : 'en';
  document.documentElement.dir = LANG === 'ur' ? 'rtl' : 'ltr';
  document.body.classList.remove('lang-en', 'lang-ur', 'lang-rur');
  document.body.classList.add('lang-' + LANG);
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === LANG));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem('lang', l); } catch (e) {}
  applyLang();
  if (typeof onLangChange === 'function') onLangChange();
}

// ---------- light / dark theme ----------
function themeIcon() { return document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️'; }
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  const b = document.getElementById('themeBtn'); if (b) b.textContent = themeIcon();
}

function buildHeader(active) {
  const h = document.getElementById('header');
  if (!h) return;
  const link = (href, key, id) => `<li><a class="link ${active === id ? 'active' : ''}" href="${href}" data-i18n="${key}"></a></li>`;
  h.innerHTML = `
  <a class="skip" href="#main" data-i18n="skip"></a>
  <header class="site"><div class="wrap nav">
    <a class="brand" href="/"><span>★</span> <b data-i18n="brand"></b></a>
    <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false">☰</button>
    <ul id="menu">
      ${link('/', 'nav_home', 'home')}
      ${link('/blog', 'nav_blog', 'blog')}
      ${link('/timeline', 'nav_timeline', 'timeline')}
      ${link('/about', 'nav_about', 'about')}
      <li><div class="lang">${Object.keys(LANG_LABELS).map((l) => `<button data-l="${l}">${LANG_LABELS[l]}</button>`).join('')}</div></li>
      <li><button class="icon-btn" id="themeBtn" data-i18n-label="theme">${themeIcon()}</button></li>
    </ul>
  </div></header>`;
  h.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.l)));
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  const mb = document.getElementById('menuBtn');
  mb.addEventListener('click', () => {
    const open = document.getElementById('menu').classList.toggle('open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// ---------- footer + newsletter ----------
function buildFooter() {
  const f = document.getElementById('footer');
  if (!f) return;
  f.innerHTML = `
  <section class="newsletter"><div class="wrap">
    <h2 data-i18n="nl_title"></h2>
    <p class="sub" data-i18n="nl_sub"></p>
    <form class="nl-form" id="nlForm" novalidate>
      <input type="email" id="nlEmail" name="email" autocomplete="email" required data-i18n-ph="nl_ph" data-i18n-label="nl_ph">
      <input class="hp" type="text" id="nlHp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn" type="submit" data-i18n="nl_btn"></button>
    </form>
    <div class="nl-msg" id="nlMsg" role="status" aria-live="polite"></div>
  </div></section>
  <footer class="site"><div class="wrap"><span>© <span id="year"></span> Che Story</span><span data-i18n="footer"></span></div></footer>`;

  document.getElementById('nlForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('nlMsg');
    const email = document.getElementById('nlEmail').value.trim();
    const say = (key, ok) => { msg.className = 'nl-msg ' + (ok ? 'ok' : 'err'); msg.textContent = t(key); };
    if (!/^\S+@\S+\.\S{2,}$/.test(email)) return say('nl_bad', false);
    try {
      const r = await api('/api/subscribe', { method: 'POST', body: JSON.stringify({ email, lang: LANG, website: document.getElementById('nlHp').value }) });
      say(r.already ? 'nl_already' : 'nl_ok', true);
      document.getElementById('nlEmail').value = '';
    } catch (err) {
      say(err.message === 'invalid_email' ? 'nl_bad' : 'nl_err', false);
    }
  });
}

async function api(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }, opts));
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}

function tagChips(tags) {
  if (!tags || !tags.length) return '';
  return '<div class="tags">' + tags.map((x) => `<a class="chip" href="/blog?tag=${encodeURIComponent(x)}">${esc(tagLabel(x))}</a>`).join('') + '</div>';
}

function postCard(p) {
  const title = pick(p.title);
  const img = p.image ? `<img src="${esc(p.image)}" alt="${esc(title)}" loading="lazy">` : esc((title || '?').charAt(0).toUpperCase());
  return `<a class="card" href="/post/${encodeURIComponent(p.slug)}">
    <div class="thumb">${img}</div>
    <div class="body">
      <span class="meta">${esc(fmtDate(p.createdAt))} · ${readMin(p)} ${esc(t('min'))}</span>
      <h3>${esc(title)}</h3>
      <p>${esc(pick(p.excerpt))}</p>
    </div></a>`;
}

function initPage(active) {
  buildHeader(active);
  buildFooter();
  applyLang();
}
