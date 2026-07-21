# Oila Hisobchi — Admin panel (web)

Asosiy ilovadan **mustaqil** kichik web-sayt. Faqat admin(lar) kira oladi.
Barcha ma'lumot **Cloud Functions** orqali olinadi (Firestore qoidalari ochilmaydi).

## Imkoniyatlar
- **📊 Statistika** — foydalanuvchi/oila/premium/bola sonlari, oxirgi ro'yxatdan o'tganlar.
- **👨‍👩‍👧 Oilalar** — ro'yxat + qidiruv, qo'lda **premium berish/olib qo'yish**.
- **🌐 Tarjima** — ilova matnlarini tahrirlash. Saqlangach ilova **APK chiqarmasdan**,
  keyingi ochilishda yangi matnlarni oladi (`translations/{lang}/sections/admin_overrides`).

## 1) Adminni belgilash (MUHIM)
Admin amallari `functions/index.js` dagi callable funksiyalar orqali ishlaydi va
`ADMIN_UIDS` muhit o'zgaruvchisini tekshiradi. O'zingizning Firebase Auth UID'ingizni qo'shing:

1. Firebase Console → Authentication → o'z qatoringiz → **User UID** ni nusxa oling.
   (Yoki: admin panelga kiring — "Ruxsat yo'q" ekranida UID ko'rsatiladi.)
2. Functions muhitiga qo'shing:
   ```bash
   # Firebase Functions (v2/.env usuli): functions/.env fayliga
   ADMIN_UIDS=UID1,UID2
   ```
   yoki deploy muhitida `ADMIN_UIDS` o'zgaruvchisini bering.
3. Funksiyalarni deploy qiling:
   ```bash
   firebase deploy --only functions
   ```

## 2) Ishga tushirish (lokal)
```bash
cd admin
npm install
npm run dev      # http://localhost:5174
```
Admin Firebase hisobingiz (email+parol) bilan kiring.

## 3) Build va deploy
```bash
cd admin
npm run build    # dist/ hosil bo'ladi
```
`dist/` ni istalgan statik hostingga qo'ying (Netlify drop, Firebase Hosting,
Vercel). Tavsiya: alohida subdomen, masalan `admin.oila-hisobchi.app`.

> Firebase konfiguratsiyasi asosiy ilova bilan bir xil (`src/firebase.js`).
> Kerak bo'lsa `.env` orqali `VITE_FIREBASE_*` bilan override qiling.

## Xavfsizlik
- Firebase config (apiKey va h.k.) maxfiy emas — himoya **admin UID tekshiruvi**da.
- Har bir callable funksiya `assertAdmin()` bilan boshlanadi; admin bo'lmasa `permission-denied`.
- Firestore Security Rules o'zgartirilmaydi — admin bazani faqat funksiya orqali ko'radi.
