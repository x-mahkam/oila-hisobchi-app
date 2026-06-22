# Oila Hisobchi — O'rnatish va ishga tushirish

Oilaviy byudjet ilovasi (React + Vite + Firebase).

## 📋 Talablar
- Node.js 18+ (https://nodejs.org dan yuklang)

## 🚀 Lokal ishga tushirish (kompyuterda sinash)

```bash
npm install      # kutubxonalarni o'rnatish (bir marta)
npm run dev      # ishga tushirish
```
Brauzerда oching: http://localhost:5173

## 🌐 Netlify'ga yuklash (ONLINE qilish — eng oson)

### A variant — Netlify saytida (kod bilmasa ham)
1. Avval loyihani build qiling:
   ```bash
   npm install
   npm run build
   ```
   Bu `dist/` papkasini yaratadi.
2. https://app.netlify.com/drop ga kiring
3. `dist` papkasini sudrab tashlang
4. Havola olasiz → telefonда oching!

### B variant — GitHub orqali (avtomatik yangilanish)
1. Loyihani GitHub'ga yuklang
2. Netlify'da "Import from Git" → loyihani tanlang
3. Build: `npm run build`, Publish: `dist`
4. Deploy bosing

## ☁️ Firebase sozlash (MUHIM!)

Ma'lumotlar saqlanishi uchun Firestore qoidasini sozlang:

1. https://console.firebase.google.com/project/oila-hisobchi/firestore/rules
2. `firestore.rules` faylidagi qoidani qo'ying
3. "Publish" bosing

⚠️ Bu sinov rejimi. Real ishga Firebase Authentication qo'shing.

## 📱 Mobil ilova (keyinroq)

Web ilova tayyor bo'lgach, Capacitor bilan APK qilish mumkin:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npm run build && npx cap sync
npx cap open android
```

## 📂 Loyiha tuzilishi
```
oila-app/
├── index.html          # Vite kirish nuqtasi
├── package.json        # kutubxonalar
├── vite.config.js      # Vite sozlamasi
├── netlify.toml        # Netlify sozlamasi
├── firestore.rules     # Firebase xavfsizlik
└── src/
    ├── main.jsx        # React kirish
    ├── App.jsx         # asosiy ilova (barcha funksiyalar)
    └── firebase.js     # Firebase ulanish + db qatlami
```

## 🔑 Firebase konfiguratsiya
`src/firebase.js` faylida. Loyiha: `oila-hisobchi`.
