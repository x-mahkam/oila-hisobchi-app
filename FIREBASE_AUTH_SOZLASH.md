# 🔐 Firebase Authentication sozlash (MUHIM)

Kod tayyor, lekin Firebase Console'da 2 ta sozlama qilish kerak:

## 1. Email/Parol auth'ni yoqish

1. Oching: https://console.firebase.google.com/project/oila-hisobchi/authentication
2. "Get started" (agar birinchi marta)
3. "Sign-in method" yorlig'i
4. "Email/Password" ni tanlang → "Enable" (yoqing) → "Save"

## 2. Xavfsizlik qoidalarini yangilash

1. Oching: https://console.firebase.google.com/project/oila-hisobchi/firestore/rules
2. Eski qoidani o'chirib, firestore.rules faylidagi yangi qoidani qo'ying:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appdata/{docId} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. "Publish" bosing

## ⚠️ MUHIM: Eski sinov akkauntlari

Eski akkauntlar (Firebase Auth'siz yaratilgan) endi kira olmaydi.
Yangi tizimda qaytadan ro'yxatdan o'ting (email bilan).

Sinov ma'lumotlarini tozalash uchun (ixtiyoriy):
- Firestore'da eski 'oilaV7_user_...' hujjatlarni o'chirib, toza boshlang.
