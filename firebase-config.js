// ══════════════════════════════════════════════════════════════════
//  🔥 إعداد Firebase — Child Link
//  ⚠️  ضع بيانات مشروعك من Firebase Console هنا
// ══════════════════════════════════════════════════════════════════

// الخطوات:
// 1. اذهب إلى https://console.firebase.google.com
// 2. أنشئ مشروعاً جديداً أو افتح مشروعك
// 3. Project Settings > Your apps > Web app
// 4. انسخ الـ firebaseConfig وضعها هنا 👇

const firebaseConfig = {
  apiKey:            "AIzaSyCoU4gnEiWa8lcVCs8IMTHtjYb6XTikiCU",
  authDomain:        "child-link-ac4ac.firebaseapp.com",
  projectId:         "child-link-ac4ac",
  storageBucket:     "child-link-ac4ac.firebasestorage.app",
  messagingSenderId: "79812028626",
  appId:             "1:79812028626:web:0c845a491c9d250282e50b",
  measurementId:     "G-E6BR8LE65P"
};

// ══════════════════════════════════════════════════════════════════
//  تهيئة Firebase SDK
// ══════════════════════════════════════════════════════════════════
import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore,
         collection,
         addDoc,
         getDocs,
         query,
         orderBy,
         serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── اسم المجموعات في Firestore ──
const MISSING_COL = "missing_children";
const FOUND_COL   = "found_children";

// ══════════════════════════════════════════════════════════════════
//  📥 جلب البيانات من Firestore
// ══════════════════════════════════════════════════════════════════
async function fbLoadMissing() {
  const q   = query(collection(db, MISSING_COL), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbLoadFound() {
  const q   = query(collection(db, FOUND_COL), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ══════════════════════════════════════════════════════════════════
//  📷 الصور بتتحفظ كـ Base64 في Firestore مباشرة (مجاني 100%)
//  لو الصورة كبيرة أكتر من 500KB بنضغطها الأول
// ══════════════════════════════════════════════════════════════════
async function fbUploadImage(base64DataUrl, type) {
  // لو الصورة أكبر من 500KB نضغطها
  if (base64DataUrl.length > 500000) {
    base64DataUrl = await compressImage(base64DataUrl);
  }
  // بنرجع الـ base64 مباشرة — هيتحفظ في Firestore
  return base64DataUrl;
}

// ضغط الصورة للحجم المناسب
function compressImage(base64DataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64DataUrl;
  });
}

// ══════════════════════════════════════════════════════════════════
//  💾 حفظ بلاغ في Firestore
// ══════════════════════════════════════════════════════════════════
async function fbSaveReport(colName, data) {
  const docRef = await addDoc(collection(db, colName), {
    ...data,
    created_at: serverTimestamp()
  });
  return docRef.id;
}

// ══════════════════════════════════════════════════════════════════
//  صدّر الدوال للاستخدام في app.js
// ══════════════════════════════════════════════════════════════════
export {
  fbLoadMissing,
  fbLoadFound,
  fbUploadImage,
  fbSaveReport,
  MISSING_COL,
  FOUND_COL
};
