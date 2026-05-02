# 🔥 دليل ربط Child Link بـ Firebase
## خطوة بخطوة — بالعربي

---

## المتطلبات
- حساب Google (مجاني)
- الملفات المعدّلة (childlink_firebase)

---

## الخطوة 1 — إنشاء مشروع Firebase

1. افتح **https://console.firebase.google.com**
2. اضغط **"Add project"** أو **"إضافة مشروع"**
3. اكتب اسم المشروع مثلاً: `childlink-egypt`
4. اضغط Continue → اختر إعدادات Google Analytics حسب رغبتك → **Create project**
5. انتظر 30 ثانية لحين إنشاء المشروع

---

## الخطوة 2 — إضافة Web App

1. في صفحة المشروع، اضغط أيقونة **`</>`** (Web)
2. اكتب اسم التطبيق مثلاً: `childlink-web`
3. لا تفعّل Firebase Hosting الآن
4. اضغط **"Register app"**
5. ستظهر لك بيانات كالتالي — **احتفظ بها**:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "childlink-egypt.firebaseapp.com",
  projectId:         "childlink-egypt",
  storageBucket:     "childlink-egypt.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

---

## الخطوة 3 — إعداد Firestore Database

1. في القائمة الجانبية: **Build → Firestore Database**
2. اضغط **"Create database"**
3. اختر **"Start in test mode"** (للاختبار — سنأمنها لاحقاً)
4. اختر الموقع الأقرب: `europe-west1` (أوروبا — الأقرب لمصر) أو `me-central1` (الشرق الأوسط)
5. اضغط **"Enable"**

### 📋 قواعد Firestore الآمنة (ضعها بعد الاختبار)
اذهب إلى: Firestore → Rules → الصق هذا:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // السماح بالقراءة للجميع، الكتابة للجميع (للإبلاغ)
    match /missing_children/{docId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['name','area','phone'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() > 0;
    }

    match /found_children/{docId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['area','phone'])
                    && request.resource.data.phone is string;
    }
  }
}
```

---

## الخطوة 4 — إعداد Firebase Storage (للصور)

1. في القائمة: **Build → Storage**
2. اضغط **"Get started"**
3. اختر **"Start in test mode"** → اضغط Next → Done

### 📋 قواعد Storage (ضعها بعد الاختبار)
اذهب إلى: Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // السماح برفع صور المفقودين والمعثور عليهم فقط
    match /missing/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /found/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## الخطوة 5 — تعديل ملف firebase-config.js

افتح ملف **`firebase-config.js`** وضع بياناتك:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",          // ← من Firebase Console
  authDomain:        "childlink-egypt.firebaseapp.com",
  projectId:         "childlink-egypt",
  storageBucket:     "childlink-egypt.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

---

## الخطوة 6 — تحديث index.html لاستخدام Firebase

في ملف `index.html`، ابحث عن السكريبت الداخلي (inline) الذي فيه `APPS_SCRIPT_URL`
وابدّل الجزء الخاص بـ `loadReports` و`submitForm` بالكود المحدّث في `app.js`.

**أو:** إذا أردت الطريقة الأسهل — ابحث عن هذا السطر في `index.html`:

```html
const APPS_SCRIPT_URL = 'https://script.google.com/...'
```

واحذف كل دوال `loadReports` و`submitForm` القديمة من `index.html`،
ثم أضف في آخر الـ `<body>`:

```html
<script type="module" src="app.js"></script>
```

---

## الخطوة 7 — رفع الموقع (Hosting)

### خيار A: Firebase Hosting (مجاني)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### خيار B: Netlify (أسهل)
1. اذهب إلى https://netlify.com
2. اسحب مجلد المشروع وأفلته في المتصفح
3. خلاص! ✅

### خيار C: أي استضافة عادية
ارفع كل الملفات على الاستضافة كما هي.
تأكد أن السيرفر يدعم HTTPS (مطلوب لـ Firebase).

---

## ✅ اختبار الربط

بعد ما تعمل كل الخطوات:

1. افتح الموقع في المتصفح
2. اذهب لـ Developer Tools (F12) → Console
3. يجب أن ترى: `✅ Firebase: تم الحفظ بمعرّف xxxxx`
4. اذهب لـ Firebase Console → Firestore → ستجد المستند اتحفظ!

---

## 🔒 الأمان (مهم قبل الإطلاق)

1. **غيّر قواعد Firestore** من "test mode" للقواعد المكتوبة في الخطوة 3
2. **غيّر قواعد Storage** من "test mode" للقواعد المكتوبة في الخطوة 4
3. **قيّد الـ API Key**: Firebase Console → Project Settings → API Keys → Add restrictions
4. **فعّل App Check** لمنع الإساءة: Firebase Console → App Check

---

## 🆘 مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| `CORS error` | تأكد إن الموقع على HTTPS مش HTTP |
| `Permission denied` | راجع قواعد Firestore وStorage |
| `Firebase not defined` | تأكد من إضافة `type="module"` للسكريبت |
| الصور مش بتتحمل | تأكد إن Storage مفعّل وقواعده صح |

---

## 📊 هيكل قاعدة البيانات في Firestore

```
📁 missing_children/
   📄 doc_id_1
      name: "يوسف محمد"
      age: "3"
      phone: "010xxxxxxxx"
      guardian: "محمد السيد"
      area: "الحي الثالث – ٦ أكتوبر"
      region: "hay3"
      description: "طفل..."
      image_url: "https://storage.googleapis.com/..."
      created_at: Timestamp

📁 found_children/
   📄 doc_id_1
      name: "مجهول"
      age: "8"
      phone: "012xxxxxxxx"
      area: "الحي الأول"
      region: "hay1"
      description: "طفلة..."
      image_url: "https://storage.googleapis.com/..."
      created_at: Timestamp
```

---

*تم إعداد هذا الدليل خصيصاً لمشروع Child Link 🇪🇬*
