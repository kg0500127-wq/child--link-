/**
 * ═══════════════════════════════════════════════════════════════
 *  Child Link – بوت الذكاء الاصطناعي الذكي
 *  ملف مستقل يُضاف إلى الموقع بسطر واحد
 *  يتحدث بالعربية العامية المصرية ويملأ الفورم بالكلام
 * ═══════════════════════════════════════════════════════════════
 *
 *  طريقة الإضافة للموقع:
 *  أضف في نهاية <body> قبل </body>:
 *    <script src="linkchild_bot.js"></script>
 *
 *  ملاحظة: لو عندك HARDCODED_KEY أو API KEY، حطه في المتغير ده:
 *    window.LINKCHILD_API_KEY = AQ.Ab8RN6KD-5NR0dStGr9crrD22Jn0f-_tvmJ0M2fDxSmMUd1iMg;
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  /* API key بيتقرأ من window.LINKCHILD_API_KEY — حدده قبل تحميل هذا الملف */
  // window.LINKCHILD_API_KEY = 'sk-ant-api03-...';

  'use strict';

  /* ── إعدادات البوت ── */
  const BOT_NAME   = 'مساعد Child Link';
  const BOT_EMOJI  = '🧒';
  const BOT_COLOR  = '#0D3B1E';
  const BOT_ACCENT = '#28A745';
  const BOT_GOLD   = '#F9A825';

  /* ── الحقول المطلوبة لكل فورم ── */
  const FORM_FIELDS = {
    missing: [
      { id: 'mName',     label: 'اسم الطفل',          type: 'text',   required: true,  hint: 'الاسم بالكامل' },
      { id: 'mAge',      label: 'العمر',               type: 'number', required: true,  hint: 'بالسنوات (0-17)' },
      { id: 'mArea',     label: 'منطقة الاختفاء',      type: 'select', required: true,  hint: 'اختار المنطقة' },
      { id: 'mGuardian', label: 'اسم ولي الأمر',       type: 'text',   required: true,  hint: 'الاسم الكامل' },
      { id: 'mPhone',    label: 'رقم التليفون',        type: 'tel',    required: true,  hint: '01XXXXXXXXX' },
    ],
    found: [
      { id: 'fName',  label: 'اسم الطفل (إن عُرف)', type: 'text',   required: false, hint: 'لو مش عارف اكتب: مجهول' },
      { id: 'fAge',   label: 'العمر التقريبي',       type: 'text',   required: true,  hint: 'مثال: 5-7 سنوات' },
      { id: 'fArea',  label: 'مكان العثور على الطفل', type: 'select', required: true,  hint: 'اختار المنطقة' },
      { id: 'fPhone', label: 'رقم تليفونك',          type: 'tel',    required: true,  hint: '01XXXXXXXXX' },
    ]
  };

  /* ── قائمة المناطق (من الفورم الأصلي) ── */
  const AREAS = [
    { value: 'cairo',      text: 'القاهرة' },
    { value: 'giza',       text: 'الجيزة' },
    { value: 'alex',       text: 'الإسكندرية' },
    { value: 'hay1',       text: 'الحي الأول – ٦ أكتوبر' },
    { value: 'hay2',       text: 'الحي الثاني – ٦ أكتوبر' },
    { value: 'hay3',       text: 'الحي الثالث – ٦ أكتوبر' },
    { value: 'hay4',       text: 'الحي الرابع – ٦ أكتوبر' },
    { value: 'sheikh',     text: 'الشيخ زايد' },
    { value: 'obour',      text: 'العبور' },
    { value: 'shuruq',     text: 'الشروق' },
    { value: 'badr',       text: 'مدينة بدر' },
    { value: 'other',      text: 'منطقة أخرى' },
  ];

  /* ── الـ System Prompt ── */
  const SYSTEM_PROMPT = `أنت مساعد ذكاء اصطناعي ذكي ومتعدد المعرفة، اسمك "مساعد Child Link"، تعمل على موقع Child Link المصري الإنساني المتخصص في البحث عن الأطفال المفقودين.

## شخصيتك وأسلوبك:
- تتحدث بالعربية العامية المصرية الودودة، وتفهم أي لهجة أو لغة يكتب بها المستخدم
- أسلوبك دافئ ومحترم وسريع، تستخدم: "حضرتك"، "تمام"، "يلا"
- تفهم الأخطاء الإملائية والكتابة غير الرسمية — مثلاً "ريسه" = رئيسية، "عاصمه" = عاصمة، "مادا" = ماذا
- لو الكلام مكتوب غلط، افهم المقصود وأجب بدون تعليق على الأخطاء

## قدراتك الكاملة:

### 1. معرفة عامة (زي ChatGPT):
- تجاوب على أي سؤال: علوم، تاريخ، جغرافيا، برمجة، طب، رياضيات، طبخ، سفر، رياضة، فن، لغات
- أمثلة: "ما عاصمة مصر؟" → القاهرة | "كم ٥×٧؟" → ٣٥ | "إيه هو الـ HTML؟" → شرح وافي

### 2. معرفة محتوى موقع Child Link بالتفصيل:

**الصفحة الرئيسية (home):**
- شعار الموقع: منصة إنسانية للبحث عن الأطفال المفقودين في مصر
- أزرار: الإبلاغ عن مفقود، قائمة المفقودين
- مميزات: إبلاغ فوري، بحث ذكي، تواصل مباشر، خريطة حالات
- أرقام الطوارئ في الهيدر

**صفحة الإبلاغ عن مفقود (report-missing):**
- فورم: اسم الطفل، العمر، منطقة الاختفاء، اسم ولي الأمر، رقم الهاتف، صورة اختيارية
- المناطق: القاهرة، الجيزة، الإسكندرية، 6 أكتوبر، الشيخ زايد، العبور، الشروق، مدينة بدر

**صفحة الإبلاغ عن موجود (report-found):**
- فورم: اسم الطفل (لو معروف)، العمر التقريبي، مكان العثور، رقم هاتف المُبلِّغ، صورة

**قائمة المفقودين (missing-list):**
- بتعرض كل البلاغات المفتوحة: صورة الطفل، اسمه، عمره، المنطقة، تاريخ البلاغ

**قائمة الموجودين (found-list):**
- بتعرض حالات الأطفال اللي تم العثور عليهم

**صفحة الطوارئ (emergency):**
- الشرطة: 122 | الإسعاف: 123 | خط نجدة الطفل: 16000 | الإطفاء: 180

**عن الموقع (about):** معلومات عن المنصة ورسالتها الإنسانية وكيفية عملها

**من نحن (team):** الفريق المؤسس وأعضاء المنصة

### 3. مساعدة في الإبلاغ:
- لو المستخدم عايز يسجل بلاغ، اسأله البيانات واحدة واحدة ثم أضف في آخر ردك:
  <<<FILL_FORM:{"type":"missing","fields":{"mName":"الاسم","mAge":"8","mGuardian":"الولي","mPhone":"01012345678","mArea":"cairo"}}>>>

## مهم جداً:
- دايماً أجب بشكل مباشر ومفيد على أي سؤال
- لو السؤال عن محتوى صفحة، اشرح محتواها بالتفصيل
- لو السؤال عام (تاريخ، علوم، إلخ) أجب بمعرفتك العامة
- متقولش "مش عارف" إلا لو السؤال خارج معرفتك فعلاً`;

  /* ══════════════════════════════════════════════════
     بناء الواجهة
  ══════════════════════════════════════════════════ */
  function buildUI() {
    injectStyles();
    buildFAB();
    buildOverlay();
  }

  function injectStyles() {
    const css = `
/* ══ Child Link Bot Styles ══ */
#lc-fab {
  position: fixed; bottom: 28px; left: 28px; z-index: 9000;
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, ${BOT_COLOR}, ${BOT_ACCENT});
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(13,59,30,.45);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; transition: transform .25s, box-shadow .25s;
  animation: lc-pulse 3s ease-in-out infinite;
}
#lc-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(13,59,30,.6); }
@keyframes lc-pulse {
  0%,100% { box-shadow: 0 4px 20px rgba(13,59,30,.45); }
  50% { box-shadow: 0 4px 32px rgba(40,167,69,.6); }
}
#lc-fab-badge {
  position: absolute; top: -4px; right: -4px;
  background: ${BOT_GOLD}; color: #000; font-size: 10px; font-weight: 800;
  border-radius: 99px; padding: 2px 6px; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,.3);
  animation: lc-badge-in .4s .8s ease both;
  font-family: 'Cairo', sans-serif;
}
@keyframes lc-badge-in { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }

#lc-overlay {
  position: fixed; inset: 0; z-index: 8999;
  display: flex; align-items: flex-end; justify-content: flex-start;
  padding: 0 0 100px 20px;
  pointer-events: none; opacity: 0;
  transition: opacity .3s;
}
#lc-overlay.open { pointer-events: all; opacity: 1; }

#lc-panel {
  width: 380px; max-width: calc(100vw - 40px);
  height: 600px; max-height: calc(100vh - 120px);
  background: #fff; border-radius: 20px;
  box-shadow: 0 20px 80px rgba(13,59,30,.3);
  display: flex; flex-direction: column; overflow: hidden;
  transform: translateY(40px) scale(.96);
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s;
  opacity: 0; direction: rtl;
  font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
}
#lc-overlay.open #lc-panel { transform: translateY(0) scale(1); opacity: 1; }

/* Header */
#lc-header {
  background: linear-gradient(135deg, ${BOT_COLOR} 0%, ${BOT_ACCENT} 100%);
  padding: 16px 20px; display: flex; align-items: center; gap: 12px;
  flex-shrink: 0;
}
#lc-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,.15); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center; font-size: 22px;
  flex-shrink: 0;
}
#lc-header-info { flex: 1; }
#lc-header-name { color: #fff; font-size: 1rem; font-weight: 800; }
#lc-header-status {
  color: rgba(255,255,255,.75); font-size: .75rem; display: flex; align-items: center; gap: 5px;
}
#lc-status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #4cfe84;
  animation: lc-blink 1.5s ease infinite;
}
@keyframes lc-blink { 0%,100%{opacity:1} 50%{opacity:.4} }
#lc-close {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
#lc-close:hover { background: rgba(255,255,255,.3); }
#lc-mute {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: rgba(255,255,255,.15); color: #fff; cursor: pointer;
  font-size: 15px; margin-left: 4px;
}
#lc-mute:hover { background: rgba(255,255,255,.3); }

/* Quick Nav */
#lc-quicknav {
  background: #f0f9f0; border-bottom: 1px solid #d4edda;
  padding: 8px 12px; display: flex; gap: 6px; overflow-x: auto;
  flex-shrink: 0; scrollbar-width: none;
}
#lc-quicknav::-webkit-scrollbar { display: none; }
.lc-nav-chip {
  background: #fff; border: 1.5px solid #c3e6cb; color: ${BOT_COLOR};
  padding: 5px 12px; border-radius: 99px; font-size: .75rem; font-weight: 700;
  cursor: pointer; white-space: nowrap; transition: all .2s;
  font-family: 'Cairo', sans-serif;
}
.lc-nav-chip:hover { background: ${BOT_ACCENT}; border-color: ${BOT_ACCENT}; color: #fff; }

/* Messages */
#lc-messages {
  flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 12px;
  scroll-behavior: smooth;
}
#lc-messages::-webkit-scrollbar { width: 4px; }
#lc-messages::-webkit-scrollbar-thumb { background: #c8e6c9; border-radius: 99px; }

.lc-row { display: flex; gap: 8px; align-items: flex-end; animation: lc-msg-in .3s ease; }
@keyframes lc-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.lc-row.user { flex-direction: row-reverse; }
.lc-bubble-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
  background: #e8f5e9;
}
.lc-row.user .lc-bubble-avatar { background: #e3f2fd; }
.lc-bubble {
  max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: .875rem; line-height: 1.5;
  white-space: pre-wrap; word-break: break-word;
}
.lc-row.bot .lc-bubble { background: #f1f8f1; color: #1a2e1a; border-radius: 16px 16px 16px 4px; }
.lc-row.user .lc-bubble { background: ${BOT_ACCENT}; color: #fff; border-radius: 16px 16px 4px 16px; }

/* Typing dots */
.lc-typing { display: flex; gap: 4px; padding: 4px 0; }
.lc-dot { width: 7px; height: 7px; border-radius: 50%; background: #aaa; animation: lc-bounce .9s ease infinite; }
.lc-dot:nth-child(2) { animation-delay: .18s; }
.lc-dot:nth-child(3) { animation-delay: .36s; }
@keyframes lc-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

/* Suggestions */
.lc-suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 0 4px; }
.lc-suggestion {
  background: #fff; border: 1.5px solid ${BOT_ACCENT}; color: ${BOT_COLOR};
  padding: 6px 12px; border-radius: 99px; font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .2s; font-family: 'Cairo', sans-serif;
}
.lc-suggestion:hover { background: ${BOT_ACCENT}; color: #fff; }

/* Input */
#lc-input-wrap {
  padding: 12px 14px; border-top: 1px solid #e8f5e9; display: flex; gap: 8px;
  background: #fff; flex-shrink: 0;
}
#lc-input {
  flex: 1; border: 1.5px solid #c3e6cb; border-radius: 12px;
  padding: 10px 14px; font-size: .875rem; outline: none; resize: none;
  font-family: 'Cairo', sans-serif; max-height: 100px; overflow-y: auto;
  transition: border-color .2s; direction: rtl; line-height: 1.4;
}
#lc-input:focus { border-color: ${BOT_ACCENT}; }
#lc-send {
  width: 42px; height: 42px; border-radius: 12px; border: none;
  background: ${BOT_ACCENT}; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background .2s, transform .15s;
  flex-shrink: 0; align-self: flex-end;
}
#lc-send:hover { background: ${BOT_COLOR}; }
#lc-send:active { transform: scale(.92); }
#lc-mic {
  width: 42px; height: 42px; border-radius: 12px; border: 1.5px solid #c3e6cb;
  background: #fff; color: #333; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: all .2s; flex-shrink: 0; align-self: flex-end;
}
#lc-mic:hover { background: #e8f5e9; border-color: ${BOT_ACCENT}; }
#lc-mic.listening { background: #ff4444; border-color: #ff4444; color: #fff; animation: lc-pulse 1s infinite; }
@keyframes lc-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

/* Welcome screen */
#lc-welcome {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 24px; text-align: center; gap: 12px;
}
#lc-welcome-icon { font-size: 3.5rem; animation: lc-float 3s ease-in-out infinite; }
@keyframes lc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
#lc-welcome h2 { font-size: 1.2rem; font-weight: 900; color: ${BOT_COLOR}; margin: 0; }
#lc-welcome p { font-size: .85rem; color: #5a7a5a; margin: 0; line-height: 1.6; }
#lc-welcome-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 8px; }
.lc-welcome-chip {
  background: #f1f8f1; border: 1.5px solid #c3e6cb; border-radius: 12px;
  padding: 10px 8px; text-align: center; cursor: pointer; transition: all .2s;
  font-family: 'Cairo', sans-serif;
}
.lc-welcome-chip:hover { background: ${BOT_ACCENT}; border-color: ${BOT_ACCENT}; color: #fff; }
.lc-welcome-chip:hover .lc-chip-sub { color: rgba(255,255,255,.8); }
.lc-chip-title { font-size: .8rem; font-weight: 800; color: ${BOT_COLOR}; }
.lc-welcome-chip:hover .lc-chip-title { color: #fff; }
.lc-chip-sub { font-size: .7rem; color: #5a7a5a; margin-top: 2px; }

/* Mobile */
@media (max-width: 500px) {
  #lc-panel { width: calc(100vw - 24px); height: 70vh; }
  #lc-overlay { padding: 0 12px 90px; }
}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildFAB() {
    /* أخفي الـ chatOverlay والـ chatFab القديمين نهائياً بـ CSS */
    const hideCss = document.createElement('style');
    hideCss.textContent = '#chatFab{display:none!important}#chatOverlay{display:none!important}';
    document.head.appendChild(hideCss);

    /* Override toggleChat القديمة عشان الروابط في الموقع تشتغل مع البوت الجديد */
    window.toggleChat = function() { toggleBot(); };
    window.openChat   = function() { if (!isOpen) toggleBot(); };

    const fab = document.createElement('button');
    fab.id = 'lc-fab';
    fab.title = 'التحدث إلى بوت Child Link';
    fab.innerHTML = BOT_EMOJI + '<span id="lc-fab-badge">بوت</span>';
    fab.onclick = toggleBot;
    document.body.appendChild(fab);
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'lc-overlay';
    overlay.innerHTML = `
      <div id="lc-panel">
        <!-- Header -->
        <div id="lc-header">
          <div id="lc-avatar">${BOT_EMOJI}</div>
          <div id="lc-header-info">
            <div id="lc-header-name">${BOT_NAME}</div>
            <div id="lc-header-status">
              <div id="lc-status-dot"></div>
              <span>متاح دلوقتي</span>
            </div>
          </div>
          <button id="lc-mute" onclick="window.__lcToggleMute()" title="كتم الصوت">🔊</button>
          <button id="lc-close" onclick="window.__lcToggle()">✕</button>
        </div>

        <!-- Quick Nav -->
        <div id="lc-quicknav">
          <button class="lc-nav-chip" onclick="window.__lcNav('home')">🏠 الرئيسية</button>
          <button class="lc-nav-chip" onclick="window.__lcNav('report-missing')">🚨 بلاغ مفقود</button>
          <button class="lc-nav-chip" onclick="window.__lcNav('report-found')">🤝 بلاغ موجود</button>
          <button class="lc-nav-chip" onclick="window.__lcNav('missing-list')">📋 المفقودين</button>
          <button class="lc-nav-chip" onclick="window.__lcNav('found-list')">📋 الموجودين</button>
          <button class="lc-nav-chip" onclick="window.__lcNav('emergency')">🆘 الطوارئ</button>
        </div>

        <!-- Welcome / Messages area -->
        <div id="lc-messages">
          <div id="lc-welcome">
            <div id="lc-welcome-icon">${BOT_EMOJI}</div>
            <h2>أهلاً وسهلاً!</h2>
            <p>أنا مساعد Child Link<br>أقدر أساعدك تسجّل بيانات وتتنقل في الموقع</p>
            <div id="lc-welcome-chips">
              <button class="lc-welcome-chip" onclick="window.__lcSend('عاوز أبلّغ عن طفل مفقود')">
                <div class="lc-chip-title">🚨 الإبلاغ عن مفقود</div>
                <div class="lc-chip-sub">سجّل بلاغ بالكلام</div>
              </button>
              <button class="lc-welcome-chip" onclick="window.__lcSend('لقيت طفل وعاوز أبلّغ عنه')">
                <div class="lc-chip-title">🤝 وجدت طفلاً</div>
                <div class="lc-chip-sub">سجّل بلاغ موجود</div>
              </button>
              <button class="lc-welcome-chip" onclick="window.__lcSend('اعرضلي قائمة الأطفال المفقودين')">
                <div class="lc-chip-title">📋 قائمة المفقودين</div>
                <div class="lc-chip-sub">شوف الحالات المفتوحة</div>
              </button>
              <button class="lc-welcome-chip" onclick="window.__lcSend('أرقام الطوارئ المهمة')">
                <div class="lc-chip-title">🆘 أرقام الطوارئ</div>
                <div class="lc-chip-sub">شرطة وإسعاف ونجدة</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div id="lc-input-wrap">
          <button id="lc-mic" onclick="window.__lcToggleMic()" title="تحدث بالميكروفون">🎤</button>
          <textarea id="lc-input" rows="1" placeholder="اكتب أو تكلم..."></textarea>
          <button id="lc-send" onclick="window.__lcSend()">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    /* Auto-resize textarea */
    const inp = document.getElementById('lc-input');
    inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.__lcSend(); }
    });
  }

  /* ══════════════════════════════════════════════════
     حالة البوت
  ══════════════════════════════════════════════════ */
  let isOpen    = false;
  let isTyping  = false;
  let history   = [];   /* محادثة كاملة */
  let formState = null; /* حالة ملء الفورم */

  /* ══════════════════════════════════════════════════
     وظائف التحكم
  ══════════════════════════════════════════════════ */
  function toggleBot() {
    isOpen = !isOpen;
    document.getElementById('lc-overlay').classList.toggle('open', isOpen);
    document.getElementById('lc-fab').style.display = isOpen ? 'none' : 'flex';
    if (isOpen) {
      setTimeout(() => document.getElementById('lc-input')?.focus(), 350);
      /* إظهار رسالة ترحيب أول مرة */
      if (history.length === 0) {
        /* ابدأ الكلام مباشرة هنا (user gesture مباشر = مفيش حجب) */
        const welcomeVoice = 'أهلاً وسهلاً بيك! أنا مساعد لينك تشايلد، المنصة المصرية الإنسانية المتخصصة في البحث عن الأطفال المفقودين. أقدر أساعد حضرتك في تسجيل بلاغ عن طفل مفقود، أو الإبلاغ عن طفل تم العثور عليه، أو عرض قوائم المفقودين. أقدر أساعد حضرتك بإيه؟';
        speakText(welcomeVoice);
        setTimeout(() => {
          addBotMessage('أهلاً وسهلاً بيك! 😊\n\n🧒 أنا **مساعد Child Link** — المنصة المصرية الإنسانية المتخصصة في البحث عن الأطفال المفقودين.\n\nممكن أساعدك في:\n• 🚨 تسجيل بلاغ عن **طفل مفقود**\n• 🙌 الإبلاغ عن **طفل تم العثور عليه**\n• 📋 الاطلاع على **قوائم المفقودين**\n• 📞 الحصول على **أرقام الطوارئ**\n\nأقدر أساعد حضرتك بإيه؟');
          showSuggestions([
            'عاوز أسجّل طفل مفقود',
            'لقيت طفل ضائع',
            'اعرضلي المفقودين',
            'أرقام الطوارئ'
          ]);
        }, 300);
      }
    }
  }
  window.__lcToggle = toggleBot;

  function navigateTo(pageId) {
    /* استخدام الـ showPage الموجود في الموقع */
    if (typeof window.showPage === 'function') {
      window.showPage(pageId);
    } else {
      /* fallback */
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const page = document.getElementById('page-' + pageId);
      if (page) page.classList.add('active');
    }
    /* إغلاق البوت وفتح الصفحة */
    setTimeout(() => {
      isOpen = false;
      document.getElementById('lc-overlay').classList.remove('open');
      document.getElementById('lc-fab').style.display = 'flex';
    }, 600);
  }
  window.__lcNav = function(pageId) {
    navigateTo(pageId);
    addBotMessage('تمام ✅ روّحتلك صفحة "' + getPageName(pageId) + '"');
  };

  function getPageName(pageId) {
    const names = {
      'home': 'الرئيسية', 'report-missing': 'الإبلاغ عن مفقود',
      'report-found': 'الإبلاغ عن موجود', 'missing-list': 'قائمة المفقودين',
      'found-list': 'قائمة الموجودين', 'emergency': 'الطوارئ',
      'about': 'عن الموقع', 'team': 'من نحن'
    };
    return names[pageId] || pageId;
  }

  /* ── ملء الفورم ── */
  function fillForm(data) {
    const { type, fields } = data;
    /* الانتقال للصفحة الصح */
    navigateTo('report-' + type);

    setTimeout(() => {
      let filled = 0;
      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'SELECT') {
          /* بحث عن القيمة في الـ select */
          const opt = Array.from(el.options).find(o =>
            o.value === value || o.text.includes(value)
          );
          if (opt) { el.value = opt.value; filled++; }
        } else {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          filled++;
        }
      });
      addBotMessage(`✅ تمام! ملّيت ${filled} حقل في الفورم.\n\nراجع البيانات وبعدين اضغط زرار "إرسال البلاغ" ✔️`);
      formState = null;
    }, 800);
  }

  /* ══════════════════════════════════════════════════
     الرسائل
  ══════════════════════════════════════════════════ */
  function hideWelcome() {
    const w = document.getElementById('lc-welcome');
    if (w) w.style.display = 'none';
  }

  function addUserMessage(text) {
    hideWelcome();
    const msgs = document.getElementById('lc-messages');
    const row = document.createElement('div');
    row.className = 'lc-row user';
    row.innerHTML = `<div class="lc-bubble-avatar">👤</div><div class="lc-bubble">${escHtml(text)}</div>`;
    msgs.appendChild(row);
    scrollBottom();
  }

  function addBotMessage(text) {
    hideWelcome();
    const msgs = document.getElementById('lc-messages');
    const row = document.createElement('div');
    row.className = 'lc-row bot';
    const formatted = formatText(text);
    row.innerHTML = `<div class="lc-bubble-avatar">${BOT_EMOJI}</div><div class="lc-bubble">${formatted}</div>`;
    msgs.appendChild(row);
    scrollBottom();
    return row;
  }

  function addTypingIndicator() {
    hideWelcome();
    const msgs = document.getElementById('lc-messages');
    const row = document.createElement('div');
    row.className = 'lc-row bot';
    row.id = 'lc-typing-row';
    row.innerHTML = `<div class="lc-bubble-avatar">${BOT_EMOJI}</div><div class="lc-bubble"><div class="lc-typing"><div class="lc-dot"></div><div class="lc-dot"></div><div class="lc-dot"></div></div></div>`;
    msgs.appendChild(row);
    scrollBottom();
  }

  function removeTypingIndicator() {
    document.getElementById('lc-typing-row')?.remove();
  }

  function showSuggestions(chips) {
    hideWelcome();
    const msgs = document.getElementById('lc-messages');
    const div = document.createElement('div');
    div.className = 'lc-suggestions';
    div.innerHTML = chips.map(c =>
      `<button class="lc-suggestion" onclick="window.__lcSend('${escHtml(c)}')">${escHtml(c)}</button>`
    ).join('');
    msgs.appendChild(div);
    scrollBottom();
  }

  function scrollBottom() {
    const msgs = document.getElementById('lc-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function formatText(text) {
    return escHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#e8f5e9;padding:1px 5px;border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  }

  /* ══════════════════════════════════════════════════
     إرسال الرسالة والـ API
  ══════════════════════════════════════════════════ */
  async function sendMessage(text) {
    if (isTyping) return;
    if (!text || !text.trim()) return;
    text = text.trim();

    addUserMessage(text);
    history.push({ role: 'user', content: text });

    isTyping = true;
    addTypingIndicator();

    /* جمع السياق الحالي للموقع */
    const siteContext = buildSiteContext();

    try {
      const apiKey = window.LINKCHILD_API_KEY
        || (typeof window.HARDCODED_KEY !== 'undefined' && window.HARDCODED_KEY)
        || '';

      if (!apiKey) {
        removeTypingIndicator();
        isTyping = false;
        addBotMessage('⚠️ محتاج مفتاح API علشان أشتغل.\n\nاطلب من المطور يضيف `window.LINKCHILD_API_KEY` في الكود.');
        return;
      }

      const groqMessages = history.slice(-20).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + siteContext },
            ...groqMessages
          ]
        })
      });

      const data = await res.json();
      removeTypingIndicator();
      isTyping = false;

      if (data?.error) {
        addBotMessage('⚠️ ' + (data.error.message || 'خطأ في الاتصال'));
        return;
      }

      let reply = data?.choices?.[0]?.message?.content || 'معلش مفيش رد';

      /* معالجة أوامر التنقل */
      const navMatch = reply.match(/<<<NAVIGATE:([^>]+)>>>/);
      if (navMatch) {
        reply = reply.replace(/<<<NAVIGATE:[^>]+>>>/g, '').trim();
        const pageId = navMatch[1].trim();
        navigateTo(pageId);
      }

      /* معالجة أوامر ملء الفورم */
      const fillMatch = reply.match(/<<<FILL_FORM:([\s\S]*?)>>>/);
      if (fillMatch) {
        reply = reply.replace(/<<<FILL_FORM:[\s\S]*?>>>/g, '').trim();
        try {
          const formData = JSON.parse(fillMatch[1]);
          fillForm(formData);
        } catch(e) {
          console.warn('LC Bot: لم يمكن تحليل بيانات الفورم', e);
        }
      }

      history.push({ role: 'assistant', content: reply });

      if (reply) {
        addBotMessage(reply);
        speakText(reply);
        /* اقتراحات تلقائية */
        const suggestions = extractSuggestions(reply);
        if (suggestions.length) showSuggestions(suggestions);
      }

    } catch(err) {
      removeTypingIndicator();
      isTyping = false;
      addBotMessage('⚠️ تعذر الاتصال. تأكد من الإنترنت.\n\nأو اتصل بـ **16000** (خط نجدة الطفل)');
      console.error('LC Bot Error:', err);
    }
  }

  window.__lcSend = function(override) {
    const input = document.getElementById('lc-input');
    const text = override || input?.value || '';
    if (!text.trim()) return;
    if (input) { input.value = ''; input.style.height = 'auto'; }

    /* ── كشف أوامر التنقل محلياً قبل API ── */
    const navPage = detectNavIntent(text.trim());
    if (navPage) {
      addUserMessage(text.trim());
      navigateTo(navPage);
      setTimeout(() => addBotMessage('تمام ✅ روّحتلك صفحة "' + getPageName(navPage) + '"'), 400);
      return;
    }

    sendMessage(text);
  };

  /* كشف نية التنقل من النص العربي محلياً */
  function detectNavIntent(text) {
    const rules = [
      { page: 'report-missing', words: ['مفقود','بلاغ مفقود','سجل مفقود','اسجل مفقود','طفل ضائع','ابلغ عن مفقود','بلغ مفقود','فقد'] },
      { page: 'report-found',   words: ['موجود','لقيت طفل','وجدت طفل','بلاغ موجود','عثرت','ابلغ عن موجود','بلغ موجود'] },
      { page: 'missing-list',   words: ['قائمة المفقودين','المفقودين','اعرضلي المفقودين','شوف المفقودين','عرض المفقودين','قائمة مفقودين'] },
      { page: 'found-list',     words: ['قائمة الموجودين','الموجودين','اعرضلي الموجودين','شوف الموجودين','عرض الموجودين'] },
      { page: 'emergency',      words: ['طوارئ','أرقام الطوارئ','ارقام الطوارئ','رقم الطوارئ','نجدة','16000','122','إسعاف','اسعاف'] },
      { page: 'home',           words: ['الرئيسية','الصفحة الرئيسية','روح الرئيسية','رجوع للرئيسية','هوم'] },
      { page: 'about',          words: ['عن الموقع','عن المنصة','معلومات الموقع','اعرف اكثر'] },
      { page: 'team',           words: ['من نحن','الفريق','فريق العمل'] },
    ];
    for (const rule of rules) {
      for (const word of rule.words) {
        if (text.includes(word)) return rule.page;
      }
    }
    return null;
  }

  /* ══════════════════════════════════════════════════
     🎤 الصوت – تحدث وسمّع
  ══════════════════════════════════════════════════ */

  let recognition = null;
  let isListening = false;
  let voiceEnabled = true; /* البوت يرد بصوت بشكل افتراضي */

  /* ── Text-to-Speech: البوت يتكلم ── */
  let _voicesLoaded = false;

  function speakText(text) {
    if (!voiceEnabled) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    /* نظّف النص من الإيموجي والماركداون */
    const clean = text
      .replace(/[*_`#>\u2022•]/g, '')
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  /* إيموجي */
      .replace(/[^\u0600-\u06FF\u0020-\u007E\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);
    if (!clean) return;

    /* إلغاء أي كلام شغّال */
    synth.cancel();

    function doSpeak() {
      /* بعض المتصفحات بتوقف الـ synth، لازم resume أول */
      if (synth.paused) synth.resume();

      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = 'ar-EG';
      utt.rate = 0.9;
      utt.pitch = 1;
      utt.volume = 1;

      /* اختر أحسن صوت عربي */
      const voices = synth.getVoices();
      const arVoice =
        voices.find(v => v.lang === 'ar-EG') ||
        voices.find(v => v.lang === 'ar-SA') ||
        voices.find(v => v.lang.startsWith('ar')) ||
        null;
      if (arVoice) utt.voice = arVoice;

      /* حل مشكلة Chrome اللي بيوقف الكلام الطويل */
      utt.onstart  = () => { _speakInterval = setInterval(() => { if (!synth.speaking) clearInterval(_speakInterval); synth.pause(); synth.resume(); }, 10000); };
      utt.onend    = () => clearInterval(_speakInterval);
      utt.onerror  = () => clearInterval(_speakInterval);

      synth.speak(utt);
    }

    /* انتظر تحميل الأصوات لو لسه ما اتحملتش */
    const voices = synth.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        doSpeak();
      };
    }
  }

  let _speakInterval = null;

  /* ── Speech-to-Text: المستخدم يتكلم ── */
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addBotMessage('⚠️ المتصفح ده مش بيدعم التعرف على الصوت. جرب Chrome أو Edge.');
      return;
    }

    if (recognition) { recognition.abort(); recognition = null; }

    recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    const mic = document.getElementById('lc-mic');
    isListening = true;
    if (mic) { mic.classList.add('listening'); mic.title = 'بيسمعك... اضغط للإيقاف'; mic.textContent = '🔴'; }

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const input = document.getElementById('lc-input');
      if (input) input.value = transcript;
      stopListening();
      setTimeout(() => window.__lcSend(), 200);
    };

    recognition.onerror = (e) => {
      stopListening();
      if (e.error === 'no-speech') addBotMessage('😕 معرفتش أسمع حاجة. جرب تاني.');
      else if (e.error === 'not-allowed') addBotMessage('⚠️ محتاج إذن الميكروفون في المتصفح.');
    };

    recognition.onend = () => { stopListening(); };
    recognition.start();
  }

  function stopListening() {
    isListening = false;
    const mic = document.getElementById('lc-mic');
    if (mic) { mic.classList.remove('listening'); mic.title = 'تحدث بالميكروفون'; mic.textContent = '🎤'; }
    if (recognition) { try { recognition.stop(); } catch(e){} recognition = null; }
  }

  window.__lcToggleMic = function() {
    if (isListening) stopListening();
    else startListening();
  };

  window.__lcToggleMute = function() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById('lc-mute');
    if (btn) btn.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  /* ── تأكد من تحميل الأصوات قبل الاستخدام ── */
  function ensureVoicesLoaded(cb) {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) { cb(); return; }
    window.speechSynthesis.onvoiceschanged = () => cb();
  }

  /* ── سياق الموقع الحالي ── */
  function buildSiteContext() {
    const activePage = document.querySelector('.page.active');
    const pageId = activePage?.id?.replace('page-', '') || 'unknown';
    return `[سياق الموقع الحالي: المستخدم على صفحة "${getPageName(pageId)}" (${pageId})]`;
  }

  /* ── استخراج اقتراحات من الرد ── */
  function extractSuggestions(reply) {
    const keywords = {
      'مفقود': ['سجّل بلاغ مفقود', 'قائمة المفقودين'],
      'موجود': ['سجّل بلاغ موجود', 'قائمة الموجودين'],
      'بلاغ': ['ابدأ التسجيل', 'رجوع للرئيسية'],
      'طوارئ': ['122 شرطة', '16000 نجدة الطفل'],
    };
    const lowerReply = reply.toLowerCase();
    for (const [key, suggestions] of Object.entries(keywords)) {
      if (lowerReply.includes(key)) return suggestions;
    }
    return [];
  }

  /* ══════════════════════════════════════════════════
     التشغيل
  ══════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }

})();
