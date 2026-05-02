
// ══════════════════════════════════════════════════════════════════
//  🔥 Firebase Integration — Child Link
// ══════════════════════════════════════════════════════════════════
import {
  fbLoadMissing,
  fbLoadFound,
  fbUploadImage,
  fbSaveReport,
  MISSING_COL,
  FOUND_COL
} from './firebase-config.js';

/* ── SECURITY: XSS sanitization ── */
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;')
    .replace(/\//g,'&#x2F;');
}

/* ── PAGE ROUTING ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) {
    page.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = {
    'home':'home','report-missing':'report-missing','report-found':'report-found',
    'missing-list':'missing-list','found-list':'found-list',
    'emergency':'emergency','about':'about','team':'team'
  };
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + id + "'")) {
      n.classList.add('active');
    }
  });
  closeSidebar();
  if (id === 'missing-list') renderMissingList();
  if (id === 'found-list') renderFoundList();
}

/* ── SIDEBAR ── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainEl = document.querySelector('main');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen = sidebar.classList.toggle('open');
  if (mainEl) mainEl.classList.toggle('sidebar-open', isOpen);
  if (overlay) overlay.classList.toggle('show', isOpen);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
}

/* ── PARTICLES ── */
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      animation-duration:${6+Math.random()*10}s;
      animation-delay:${Math.random()*8}s;
      width:${2+Math.random()*4}px;
      height:${2+Math.random()*4}px;
      opacity:${.2+Math.random()*.5};
    `;
    container.appendChild(p);
  }
}

/* ── COUNTER ANIMATION ── */
function animateCounter(id, target, suffix='') {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    document.getElementById(id).textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 25);
}

/* ── PHOTO STRIP ── */
const photoUrls = [
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1484665754804-74b091211472?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=200&fit=crop',
];
function buildPhotoStrip() {
  const strip = document.getElementById('photoStrip');
  const doubled = [...photoUrls, ...photoUrls];
  strip.innerHTML = doubled.map(url =>
    `<img src="${url}" class="strip-photo" loading="lazy" alt="صورة طفل" onerror="this.style.display='none'">`
  ).join('');
}

/* ── DATA STORE (reports submitted via forms) ── */
const missingChildren = [
  {
    id: 'demo-001',
    name: 'يوسف محمد السيد',
    age: '3',
    phone: '01093847562',
    guardian: 'محمد السيد إبراهيم',
    area: 'الحي الثالث – ٦ أكتوبر',
    region: 'hay3',
    date: '2026-04-20T14:30',
    desc: 'طفل في الثالثة من عمره، بشرة قمحية، شعر مجعد، كان يرتدي قميصاً كارو ملون وبنطلون بيج وحذاء أبيض. اختفى أثناء اللعب أمام المنزل في الحي الثالث.',
    img: '/uploads/child_missing_1.jpg'
  },
  {
    id: 'demo-002',
    name: 'كريم أحمد عبد الله',
    age: '7',
    phone: '01154738291',
    guardian: 'أحمد عبد الله حسن',
    area: 'الحي السابع – ٦ أكتوبر',
    region: 'hay7',
    date: '2026-04-24T10:15',
    desc: 'طفل في السابعة من عمره، شعر أسود ناعم، بشرة قمحية، كان يرتدي بلوفر رمادي وبنطلون رياضي أسود. خرج للعب بالدراجة أمام العمارة ولم يعد.',
    img: '/uploads/child_missing_2.jpg'
  }
];
const foundChildren = [
  {
    id: 'demo-f001',
    name: 'نور محمد عبد الرحمن',
    age: '8',
    phone: '01278364950',
    area: 'الحي الأول – ٦ أكتوبر',
    region: 'hay1',
    date: '2026-04-25T16:45',
    desc: 'طفلة تبدو في الثامنة من عمرها، شعر أسود قصير، ترتدي بلوفر برتقالي فروي وبنطلون أسود وشبشب فاتح. وُجدت تبكي بجوار إشارة المرور في الحي الأول، لا تعرف عنوانها.',
    img: '/uploads/child_found_1.jpg'
  },
  {
    id: 'demo-f002',
    name: 'رضيع / مجهول الاسم',
    age: '1',
    phone: '01065473829',
    area: 'الحي الخامس – ٦ أكتوبر',
    region: 'hay5',
    date: '2026-04-26T09:20',
    desc: 'رضيع يبدو في عمر 6 أشهر تقريباً، ذكر، بشرة فاتحة، عيون واسعة بنية، كان يرتدي جاكيت صفراء فاتحة. عُثر عليه أمام أحد المحلات في الحي الخامس.',
    img: '/uploads/child_found_2.jpg'
  }
];
let missingFilter = 'all', foundFilter = 'all';

function renderMissingList(filter) {
  if (filter) missingFilter = filter;
  const grid = document.getElementById('missingGrid');
  const q = document.querySelector('#page-missing-list .search-box input')?.value?.toLowerCase() || '';
  const filtered = missingChildren.filter(c =>
    (missingFilter === 'all' || c.region === missingFilter) &&
    (c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q))
  );
  document.getElementById('missingCount').textContent = filtered.length + ' حالة';
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888"><div style="font-size:3rem;margin-bottom:12px">📋</div><div>لا توجد حالات بعد — كن أول من يُبلّغ</div></div>';
    return;
  }
  grid.innerHTML = filtered.map(function(c, i) {
    var imgHtml = c.img
      ? '<img src="' + c.img + '" alt="' + sanitize(c.name) + '" style="width:100%;height:220px;object-fit:cover;display:block;">'
      : '<div style="width:100%;height:220px;background:linear-gradient(135deg,#C8E6C9,#81C784);display:flex;align-items:center;justify-content:center;font-size:5rem;">👤</div>';
    var phoneHtml = (c.phone && c.phone !== '—')
      ? '<a href="tel:' + c.phone + '" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:6px;background:#e8f5e9;color:#0D3B1E;border-radius:8px;padding:6px 14px;font-size:.85rem;font-weight:700;text-decoration:none;margin-top:6px;">📞 ولي الأمر: ' + sanitize(c.phone) + '</a>'
      : '';
    return '<div class="child-card" style="animation:fadeUp .4s ' + (i * 0.08) + 's ease both;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.1);cursor:pointer;" onclick="showChildModal(' + i + ',\'missing\')">'
      + '<div style="position:relative;">' + imgHtml
      + '<div style="position:absolute;top:10px;right:10px;background:rgba(198,40,40,.9);color:#fff;border-radius:20px;padding:4px 12px;font-size:.75rem;font-weight:700;">🔴 مفقود</div>'
      + '</div>'
      + '<div style="padding:14px 16px 18px;text-align:center;">'
      + '<div style="font-size:1.1rem;font-weight:900;color:#0D3B1E;margin-bottom:4px;">' + sanitize(c.name) + '</div>'
      + '<div style="font-size:.85rem;color:#5A7A5A;margin-bottom:3px;">العمر: ' + sanitize(String(c.age)) + ' سنة</div>'
      + '<div style="font-size:.8rem;color:#888;margin-bottom:4px;">📍 ' + sanitize(c.area) + '</div>'
      + phoneHtml
      + '</div></div>';
  }).join('');
  window._missingFiltered = filtered;
}

function renderFoundList(filter) {
  if (filter) foundFilter = filter;
  const grid = document.getElementById('foundGrid');
  const q = document.querySelector('#page-found-list .search-box input')?.value?.toLowerCase() || '';
  const filtered = foundChildren.filter(c =>
    (foundFilter === 'all' || c.region === foundFilter) &&
    ((c.name||'').toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || (c.desc||'').toLowerCase().includes(q))
  );
  const countEl = document.getElementById('foundCount');
  if (countEl) countEl.textContent = filtered.length + ' حالة';
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888"><div style="font-size:3rem;margin-bottom:12px">✅</div><div>لا توجد حالات بعد</div></div>';
    return;
  }
  grid.innerHTML = filtered.map(function(c, i) {
    var imgHtml = c.img
      ? '<img src="' + c.img + '" alt="' + sanitize(c.name || 'مجهول') + '" style="width:100%;height:220px;object-fit:cover;display:block;">'
      : '<div style="width:100%;height:220px;background:linear-gradient(135deg,#C8E6C9,#A5D6A7);display:flex;align-items:center;justify-content:center;font-size:5rem;">👤</div>';
    var phoneHtml = (c.phone && c.phone !== '—')
      ? '<a href="tel:' + c.phone + '" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:6px;background:#e8f5e9;color:#0D3B1E;border-radius:8px;padding:6px 14px;font-size:.85rem;font-weight:700;text-decoration:none;margin-top:6px;">📞 المُبلّغ: ' + sanitize(c.phone) + '</a>'
      : '';
    return '<div class="child-card" style="animation:fadeUp .4s ' + (i * 0.08) + 's ease both;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.1);cursor:pointer;" onclick="showChildModal(' + i + ',\'found\')">'
      + '<div style="position:relative;">' + imgHtml
      + '<div style="position:absolute;top:10px;right:10px;background:rgba(40,167,69,.9);color:#fff;border-radius:20px;padding:4px 12px;font-size:.75rem;font-weight:700;">✅ تم العثور عليه</div>'
      + '</div>'
      + '<div style="padding:14px 16px 18px;text-align:center;">'
      + '<div style="font-size:1.1rem;font-weight:900;color:#0D3B1E;margin-bottom:4px;">' + sanitize(c.name || 'مجهول الهوية') + '</div>'
      + '<div style="font-size:.85rem;color:#5A7A5A;margin-bottom:3px;">العمر التقريبي: ' + sanitize(String(c.age)) + ' سنة</div>'
      + '<div style="font-size:.8rem;color:#888;margin-bottom:4px;">📍 ' + sanitize(c.area) + '</div>'
      + phoneHtml
      + '</div></div>';
  }).join('');
  window._foundFiltered = filtered;
}


function filterCards(q, type) {
  if (type === 'missing') renderMissingList();
  else renderFoundList();
}
function setFilter(val, type, btn) {
  const container = btn.closest('.list-toolbar');
  container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (type === 'missing') renderMissingList(val);
  else renderFoundList(val);
}

/* ── FORM ── */
function previewPhoto(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(input.files[0]);
  }
}
// ══════════════════════════════════════════════════════
//  🔗 ضع هنا رابط الـ Web App بعد نشر الـ Apps Script
//  (راجع ملف دليل_الإعداد.md لمعرفة كيفية الحصول عليه)
// ══════════════════════════════════════════════════════
// ── تحويل صورة إلى Base64 ──
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ══════════════════════════════════════════════════════════════════
//  🔥 جلب البيانات من Firebase Firestore
// ══════════════════════════════════════════════════════════════════
async function loadReports() {
  try {
    // جلب المفقودين والمعثور عليهم بالتوازي
    const [missingDocs, foundDocs] = await Promise.all([
      fbLoadMissing(),
      fbLoadFound()
    ]);

    // ── دمج المفقودين ──
    const existingMisIds = new Set(missingChildren.map(c => String(c.id)));
    missingDocs.forEach(r => {
      if (!existingMisIds.has(String(r.id))) {
        missingChildren.push({
          id:        r.id,
          name:      r.name     || '—',
          age:       r.age      || '—',
          phone:     r.phone    || '—',
          guardian:  r.guardian || '—',
          area:      r.area     || '—',
          region:    r.region   || '',
          date:      r.created_at?.toDate?.()?.toLocaleDateString('ar-EG') || r.created_at || '—',
          desc:      r.description || '',
          img:       r.image_url   || '',
          image_url: r.image_url   || ''   // ← للـ modal
        });
      }
    });
    renderMissingList('all');

    // ── دمج المعثور عليهم ──
    const existingFoIds = new Set(foundChildren.map(c => String(c.id)));
    foundDocs.forEach(r => {
      if (!existingFoIds.has(String(r.id))) {
        foundChildren.push({
          id:        r.id,
          name:      r.name   || 'مجهول الهوية',
          age:       r.age    || '—',
          phone:     r.phone  || '—',
          area:      r.area   || '—',
          region:    r.region || '',
          date:      r.created_at?.toDate?.()?.toLocaleDateString('ar-EG') || r.created_at || '—',
          desc:      r.description || '',
          img:       r.image_url   || '',
          image_url: r.image_url   || ''   // ← للـ modal
        });
      }
    });
    renderFoundList('all');

  } catch(e) {
    console.error('🔥 تعذر الاتصال بـ Firebase:', e);
  }
}

function submitForm(e, type) {
  e.preventDefault();
  if (!rateLimit(type)) return;

  const form   = e.target;
  const getVal = (id) => (document.getElementById(id)?.value || '').trim();

  const btn      = form.querySelector('.form-submit');
  const origText = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = '⏳ جاري الإرسال...'; btn.disabled = true; }

  const imgFileEl = document.getElementById(type === 'missing' ? 'missingPhoto' : 'foundPhoto');
  const imgFile   = imgFileEl && imgFileEl.files[0] ? imgFileEl.files[0] : null;

  // بناء الـ payload
  const makePayload = (imageBase64) => {
    const p = { type };
    if (imageBase64) p.imageBase64 = imageBase64;
    if (type === 'missing') {
      const areaEl = document.getElementById('mArea');
      p.name        = getVal('mName');
      p.age         = getVal('mAge');
      p.phone       = getVal('mPhone');
      p.guardian    = getVal('mGuardian');
      p.area        = areaEl?.options[areaEl.selectedIndex]?.text || '';
      p.region      = areaEl?.value || '';
      p.description = getVal('mDesc');
      p.lost_at     = getVal('mDate');
    } else {
      const areaEl = document.getElementById('fArea');
      p.name        = getVal('fName') || 'مجهول الهوية';
      p.age         = getVal('fAge');
      p.phone       = getVal('fPhone');
      p.area        = areaEl?.options[areaEl.selectedIndex]?.text || '';
      p.region      = areaEl?.value || '';
      p.description = getVal('fDesc');
      p.found_at    = getVal('fDate');
    }
    return p;
  };

  const doSubmit = async (payload) => {
    const localId = Date.now();
    const imgSrc  = imgFile ? URL.createObjectURL(imgFile) : '';

    // ══════════════════════════════════════════════════════════════
    //  🔥 رفع الصورة إلى Firebase Storage ثم حفظ البلاغ في Firestore
    // ══════════════════════════════════════════════════════════════
    try {
      let imageUrl = '';

      // رفع الصورة إن وُجدت
      if (payload.imageBase64) {
        imageUrl = await fbUploadImage(payload.imageBase64, payload.type);
      }

      // بناء مستند Firestore
      const colName  = payload.type === 'missing' ? MISSING_COL : FOUND_COL;
      const docData  = {
        name:        payload.name        || '',
        age:         payload.age         || '',
        phone:       payload.phone       || '',
        area:        payload.area        || '',
        region:      payload.region      || '',
        description: payload.description || '',
        image_url:   imageUrl,
        ...(payload.type === 'missing' && {
          guardian: payload.guardian || '',
          lost_at:  payload.lost_at  || ''
        }),
        ...(payload.type === 'found' && {
          found_at: payload.found_at || ''
        })
      };

      const newId = await fbSaveReport(colName, docData);
      console.log('✅ Firebase: تم الحفظ بمعرّف', newId);
    } catch (err) {
      console.error('🔥 Firebase error:', err);
      // نكمل عرض الكارت محلياً حتى لو فشل الحفظ
    }

    // اعرض النتيجة فوراً
    if (btn) { btn.innerHTML = origText; btn.disabled = false; }
    if (type === 'missing') {
      missingChildren.unshift({
        id: localId, name: payload.name, age: payload.age,
        phone: payload.phone, guardian: payload.guardian,
        area: payload.area, region: payload.region,
        date: new Date().toLocaleDateString('ar-EG'),
        desc: payload.description,
        img:       imageUrl || imgSrc,
        image_url: imageUrl || imgSrc
      });
      renderMissingList('all');
    } else {
      foundChildren.unshift({
        id: localId, name: payload.name, age: payload.age,
        phone: payload.phone, area: payload.area,
        region: payload.region,
        date: new Date().toLocaleDateString('ar-EG'),
        desc: payload.description,
        img:       imageUrl || imgSrc,
        image_url: imageUrl || imgSrc
      });
      renderFoundList('all');
    }
    showThankYouModal(type, payload.name);
    form.reset();
    clearPreviews();
    setTimeout(() => showPage(type === 'missing' ? 'missing-list' : 'found-list'), 3200);
  if (imgFile) {
    fileToBase64(imgFile).then(b64 => doSubmit(makePayload(b64)));
  } else {
    doSubmit(makePayload(null));
  }
}

/* ── THANK YOU MODAL ── */
function clearPreviews() {
  ['missingPreview','foundPreview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.src = ''; el.style.display = 'none'; }
    const wrap = document.getElementById(id + 'Wrap');
    if (wrap) wrap.style.display = 'none';
  });
  document.querySelectorAll('.form-upload').forEach(zone => {
    zone.style.backgroundImage = '';
    zone.style.border = '';
    const icon = zone.querySelector('.form-upload-icon');
    const txt  = zone.querySelector('.form-upload-text');
    if (icon) icon.textContent = '📷';
    if (txt)  txt.innerHTML = '<strong>اضغط لرفع صورة حديثة</strong><br>PNG, JPG (حتى 10MB)';
  });
}

function showThankYouModal(type, name) {
  var existing = document.getElementById('thankYouModal');
  if (existing) existing.remove();
  var isMissing = type === 'missing';
  var modal = document.createElement('div');
  modal.id = 'thankYouModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease;';
  modal.innerHTML = '<div style="background:#fff;border-radius:24px;padding:44px 36px;max-width:400px;width:90%;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.3);">'
    + '<div style="font-size:4rem;margin-bottom:14px;">' + (isMissing ? '🙏' : '💚') + '</div>'
    + '<h2 style="font-size:1.4rem;font-weight:900;color:#0D3B1E;margin-bottom:12px;">' + (isMissing ? 'شكراً لك على الإبلاغ' : 'جزاك الله خيراً') + '</h2>'
    + '<p style="color:#5A7A5A;line-height:1.8;margin-bottom:8px;">'
    + (isMissing
      ? 'تم استلام بلاغك عن <strong style="color:#0D3B1E;">' + sanitize(name) + '</strong> بنجاح.<br>سيتم نشر البلاغ فوراً في قائمة المفقودين.'
      : 'شكراً لتبليغك عن الطفل الذي عثرت عليه.<br>تصرفك هذا قد يُعيد طفلاً إلى أسرته.')
    + '</p>'
    + '<p style="color:#28A745;font-size:.9rem;margin-bottom:22px;">📞 للمساعدة الفورية: <strong>16000</strong></p>'
    + '<button onclick="document.getElementById(\'thankYouModal\').remove()" style="background:linear-gradient(135deg,#0D3B1E,#28A745);color:#fff;border:none;border-radius:12px;padding:12px 32px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;">حسناً ✓</button>'
    + '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

/* ── TOAST ── */
function showToast(msg, duration) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration || 3000);
}

/* ══════════════════════════════════════════
   CHATGPT-STYLE AI — Child Link
══════════════════════════════════════════ */
let cgptOpen = false;
let cgptHistory = [];
let cgptTyping = false;

/* API key stored in localStorage */
/* ═══ ضع مفتاحك هنا مباشرة ═══ */
const HARDCODED_KEY = '';

function cgptGetKey() {
  return HARDCODED_KEY || localStorage.getItem('lc_api_key') || '';
}
function cgptSetKey(k) {
  localStorage.setItem('lc_api_key', k);
}

const CGPT_SYSTEM = `أنت مساعد ذكاء اصطناعي متقدم تابع لموقع Child Link المصري الإنساني.
أجب على أي سؤال يطرحه المستخدم بأسلوب ذكي وواضح ومفيد — تماماً مثل ChatGPT.
تحدث باللغة التي يكتب بها المستخدم: عربية أو إنجليزية.
يمكنك الإجابة على: العلوم، التاريخ، البرمجة، الطب، القانون، الرياضيات، اللغات، الفن، الطبخ، السفر، وأي موضوع آخر.
للأطفال المفقودين: الشرطة 122، الإسعاف 123، خط نجدة الطفل 16000.`;

function toggleChat() {
  cgptOpen = !cgptOpen;
  document.getElementById('chatOverlay').classList.toggle('open', cgptOpen);
  document.getElementById('chatFab').style.display = cgptOpen ? 'none' : 'flex';
  if (cgptOpen) {
    setTimeout(() => document.getElementById('cgptInput').focus(), 300);
  }
}
function openChat() { if (!cgptOpen) toggleChat(); }

function cgptHideWelcome() {
  const w = document.getElementById('cgptWelcome');
  if (w) w.style.display = 'none';
}

function cgptAddRow(role, html) {
  cgptHideWelcome();
  const msgs = document.getElementById('cgptMessages');
  const row = document.createElement('div');
  row.className = 'cgpt-row ' + role;
  const initial = role === 'user' ? '👤' : '✦';
  row.innerHTML = '<div class="cgpt-avatar ' + role + '">' + initial + '</div>'
    + '<div class="cgpt-bubble">' + html + '</div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  return row;
}

function cgptAddTyping() {
  cgptHideWelcome();
  const msgs = document.getElementById('cgptMessages');
  const row = document.createElement('div');
  row.className = 'cgpt-row bot';
  row.id = 'cgptTypingRow';
  row.innerHTML = '<div class="cgpt-avatar bot">🤖</div>'
    + '<div class="cgpt-bubble"><div class="cgpt-typing">'
    + '<div class="cgpt-dot"></div><div class="cgpt-dot"></div><div class="cgpt-dot"></div>'
    + '</div></div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}
function cgptRemoveTyping() {
  const el = document.getElementById('cgptTypingRow');
  if (el) el.remove();
}

function cgptTypewriter(text) {
  cgptRemoveTyping();
  const msgs = document.getElementById('cgptMessages');
  const row = document.createElement('div');
  row.className = 'cgpt-row bot';
  row.innerHTML = '<div class="cgpt-avatar bot">🤖</div><div class="cgpt-bubble" id="cgptLiveBubble"></div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  const bubble = document.getElementById('cgptLiveBubble');
  bubble.removeAttribute('id');
  let i = 0;
  const iv = setInterval(() => {
    if (i < text.length) {
      if (text[i] === '<') {
        const end = text.indexOf('>', i);
        if (end !== -1) { bubble.innerHTML += text.substring(i, end + 1); i = end + 1; }
        else { bubble.innerHTML += text[i++]; }
      } else {
        bubble.innerHTML += text[i++];
      }
      msgs.scrollTop = msgs.scrollHeight;
    } else {
      clearInterval(iv);
      cgptTyping = false;
    }
  }, 14);
}

async function cgptSend(overrideText) {
  if (cgptTyping) return;

  const input = document.getElementById('cgptInput');
  const text = (overrideText || input.value).trim();
  if (!text) return;

  /* Check API key */
  if (!cgptGetKey()) {
    cgptHideWelcome();
    const msgs = document.getElementById('cgptMessages');
    /* Show inline key prompt */
    const row = document.createElement('div');
    row.className = 'cgpt-row bot';
    row.id = 'cgptKeyRow';
    row.innerHTML = '<div class="cgpt-avatar bot">🤖</div>'
      + '<div class="cgpt-bubble">'
      + '<div style="background:#2f2f2f;border:1px solid #10a37f;border-radius:12px;padding:20px;">'
      + '<div style="font-size:1rem;font-weight:700;color:#ececec;margin-bottom:8px;">🔑 مطلوب مفتاح API</div>'
      + '<div style="font-size:.85rem;color:#8e8ea0;margin-bottom:14px;">أدخل مفتاح Anthropic API للبدء.<br>احصل عليه من <a href="https://console.anthropic.com" target="_blank" style="color:#10a37f;">console.anthropic.com</a></div>'
      + '<div style="display:flex;gap:8px;">'
      + '<input id="cgptKeyInput" type="password" placeholder="أدخل مفتاح API هنا" '
      + 'style="flex:1;background:#212121;border:1px solid #3a3a3a;border-radius:8px;padding:10px 12px;color:#ececec;font-family:monospace;font-size:.85rem;outline:none;" />'
      + '<button onclick="cgptSaveKey()" '
      + 'style="background:#10a37f;border:none;border-radius:8px;padding:10px 18px;color:#fff;font-weight:700;cursor:pointer;font-family:inherit;">حفظ</button>'
      + '</div></div></div>';
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => document.getElementById('cgptKeyInput')?.focus(), 100);
    return;
  }

  input.value = '';
  input.style.height = 'auto';
  cgptTyping = true;

  cgptAddRow('user', sanitize(text));
  cgptHistory.push({ role: 'user', content: text });

  cgptAddTyping();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': cgptGetKey(),
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: CGPT_SYSTEM,
        messages: cgptHistory
      })
    });

    const data = await res.json();
    cgptRemoveTyping();

    let reply;
    if (data?.error) {
      if (data.error.type === 'authentication_error') {
        cgptSetKey('');
        reply = '❌ المفتاح غير صحيح. تم حذفه — اضغط إرسال مرة أخرى لإدخال مفتاح جديد.';
      } else {
        reply = '⚠️ ' + (data.error.message || 'خطأ غير معروف');
      }
      cgptTyping = false;
      cgptAddRow('bot', reply);
    } else {
      reply = data?.content?.[0]?.text || '⚠️ لا يوجد رد';
      /* Format markdown-lite */
      reply = reply
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:#1a1a1a;padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      cgptHistory.push({ role: 'assistant', content: data.content[0].text });
      cgptTypewriter(reply);
    }
  } catch(err) {
    cgptRemoveTyping();
    cgptTyping = false;
    cgptAddRow('bot', '⚠️ تعذر الاتصال. تحقق من الإنترنت أو اتصل بـ <strong>16000</strong>');
  }
}

function cgptSaveKey() {
  const input = document.getElementById('cgptKeyInput');
  const key = input?.value?.trim();
  const row = document.getElementById('cgptKeyRow');
  if (key && key.startsWith('sk-')) {
    cgptSetKey(key);
    if (row) row.remove();
    cgptAddRow('bot', '✅ تم حفظ المفتاح! اسألني أي سؤال الآن.');
  } else {
    input.style.borderColor = '#e53935';
    input.placeholder = 'المفتاح يجب أن يبدأ بـ أدخل مفتاح API هنا';
  }
}

/* Voice input */
let cgptRecognition = null;
let cgptRecording = false;

function cgptToggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    cgptAddRow('bot', '⚠️ المتصفح لا يدعم الإدخال الصوتي. استخدم Chrome.');
    return;
  }
  if (cgptRecording) {
    cgptStopVoice();
  } else {
    cgptStartVoice();
  }
}

function cgptStartVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  cgptRecognition = new SR();
  cgptRecognition.lang = 'ar-EG';
  cgptRecognition.interimResults = true;
  cgptRecognition.continuous = false;
  const btn = document.getElementById('cgptMicBtn');
  btn.classList.add('recording'); btn.textContent = '⏹';
  cgptRecording = true;
  const inp = document.getElementById('cgptInput');
  inp.placeholder = '🎤 جاري الاستماع...';
  cgptRecognition.onresult = (e) => {
    const t = Array.from(e.results).map(r => r[0].transcript).join('');
    inp.value = t;
    if (e.results[e.results.length-1].isFinal) {
      cgptStopVoice();
      setTimeout(() => cgptSend(), 300);
    }
  };
  cgptRecognition.onerror = cgptStopVoice;
  cgptRecognition.onend = cgptStopVoice;
  cgptRecognition.start();
}

function cgptStopVoice() {
  try { if (cgptRecognition) cgptRecognition.stop(); } catch(e){}
  cgptRecording = false;
  const btn = document.getElementById('cgptMicBtn');
  if (btn) { btn.classList.remove('recording'); btn.textContent = '🎤'; }
  const inp = document.getElementById('cgptInput');
  if (inp) inp.placeholder = 'اكتب رسالتك...';
}

/* Keep old function names working */
function toggleChat_old() {}
function sendSuggestion(t) { document.getElementById('cgptInput').value = t; cgptSend(); }

/* ── FILE UPLOADS PAGE ── */
function handleFileSelect(input) {
  var files = Array.from(input.files);
  processUploadFiles(files);
  input.value = '';
}

function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('filesDropZone').classList.remove('drag-over');
  processUploadFiles(Array.from(e.dataTransfer.files));
}

function processUploadFiles(files) {
  var MAX = 10 * 1024 * 1024;
  files.forEach(function(file) {
    if (file.size > MAX) { showToast('⚠️ ' + file.name + ' أكبر من 10MB'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      if (typeof uploadedFiles === 'undefined') window.uploadedFiles = [];
      uploadedFiles.unshift({ id: Date.now()+Math.random(), name: file.name, type: file.type, size: file.size, data: e.target.result, date: new Date().toLocaleDateString('ar-EG') });
      if (typeof renderFilesGrid === 'function') renderFilesGrid();
      if (typeof updateFilesStats === 'function') updateFilesStats();
      showToast('✅ تم رفع ' + file.name);
    };
    reader.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════════
   🖼️ CHILD DETAIL MODAL — بيظهر الصورة من Firebase
══════════════════════════════════════════ */
function showChildModal(index, type) {
  const list = type === 'missing' ? window._missingFiltered : window._foundFiltered;
  if (!list || !list[index]) return;
  const c = list[index];

  const isMissing = type === 'missing';
  const badge = isMissing
    ? '<span style="background:rgba(198,40,40,.9);color:#fff;border-radius:20px;padding:5px 14px;font-size:.8rem;font-weight:700;">🔴 مفقود</span>'
    : '<span style="background:rgba(40,167,69,.9);color:#fff;border-radius:20px;padding:5px 14px;font-size:.8rem;font-weight:700;">✅ تم العثور عليه</span>';

  // الصورة — من Firebase Storage (image_url) أو blob محلي (img)
  const imgSrc = c.image_url || c.img || '';
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${sanitize(c.name||'')}"
          style="width:100%;max-height:320px;object-fit:cover;border-radius:16px 16px 0 0;display:block;"
          onerror="this.style.display='none'">`
    : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#C8E6C9,#81C784);
          display:flex;align-items:center;justify-content:center;font-size:6rem;
          border-radius:16px 16px 0 0;">👤</div>`;

  const phoneLabel = isMissing ? 'ولي الأمر' : 'المُبلّغ';
  const phoneHtml = (c.phone && c.phone !== '—')
    ? `<a href="tel:${c.phone}" style="display:inline-flex;align-items:center;gap:8px;
          background:#e8f5e9;color:#0D3B1E;border-radius:10px;padding:10px 20px;
          font-size:.95rem;font-weight:700;text-decoration:none;margin-top:10px;">
          📞 ${phoneLabel}: ${sanitize(c.phone)}</a>`
    : '';

  const guardianHtml = (isMissing && c.guardian && c.guardian !== '—')
    ? `<div style="font-size:.85rem;color:#5A7A5A;margin-top:4px;">👨‍👧 ولي الأمر: <strong>${sanitize(c.guardian)}</strong></div>`
    : '';

  const existing = document.getElementById('childDetailModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'childDetailModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .25s ease;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.35);position:relative;">
      <button onclick="document.getElementById('childDetailModal').remove()"
        style="position:absolute;top:12px;left:12px;z-index:10;background:rgba(0,0,0,.45);color:#fff;
               border:none;border-radius:50%;width:36px;height:36px;font-size:1.2rem;cursor:pointer;
               display:flex;align-items:center;justify-content:center;">✕</button>
      ${imgHtml}
      <div style="padding:20px 22px 28px;text-align:center;">
        <div style="margin-bottom:10px;">${badge}</div>
        <h2 style="font-size:1.35rem;font-weight:900;color:#0D3B1E;margin:8px 0 4px;">${sanitize(c.name||'مجهول الهوية')}</h2>
        <div style="font-size:.9rem;color:#5A7A5A;margin-bottom:3px;">العمر: <strong>${sanitize(String(c.age||'—'))}</strong> سنة</div>
        <div style="font-size:.85rem;color:#888;margin-bottom:6px;">📍 ${sanitize(c.area||'—')}</div>
        <div style="font-size:.8rem;color:#aaa;margin-bottom:10px;">📅 ${sanitize(String(c.date||'—'))}</div>
        ${guardianHtml}
        ${c.desc ? `<p style="font-size:.9rem;color:#444;line-height:1.8;margin:14px 0;text-align:right;background:#f9f9f9;border-radius:10px;padding:12px 14px;">${sanitize(c.desc)}</p>` : ''}
        ${phoneHtml}
        <div style="margin-top:18px;">
          <button onclick="document.getElementById('childDetailModal').remove()"
            style="background:linear-gradient(135deg,#0D3B1E,#28A745);color:#fff;border:none;
                   border-radius:12px;padding:11px 30px;font-size:.95rem;font-weight:700;
                   cursor:pointer;font-family:inherit;">إغلاق</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ── REVEAL ON SCROLL ── */
function checkReveal() {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) el.classList.add('visible');
  });
}
window.addEventListener('scroll', checkReveal);

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  renderMissingList('all');
  renderFoundList('all');
  checkReveal();
  loadReports();
  
  // Feature cards scroll reveal
  document.querySelectorAll('.feature-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
});

/* ── KEYBOARD SHORTCUTS ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSidebar(); if(chatOpen) toggleChat(); }
});

/* ── RATE LIMITING (simple client-side) ── */
const formSubmits = {};
function rateLimit(key) {
  const now = Date.now();
  if (formSubmits[key] && now - formSubmits[key] < 30000) {
    showToast('⚠️ يُرجى الانتظار 30 ثانية قبل إرسال بلاغ آخر');
    return false;
  }
  formSubmits[key] = now;
  return true;
}
