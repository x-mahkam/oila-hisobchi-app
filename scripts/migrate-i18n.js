// ═══════════════════════════════════════════════════════════════════
//  BIR MARTALIK SKRIPT: src/locales/*.json → Firestore (translations/,
//  languages/, i18n_meta/current). Shundan keyin ilova tarjimalarni
//  Firestore'dan o'qiydi — yangi til qo'shish uchun kodga tegish
//  shart emas.
//
//  Ishga tushirish:
//   1) Firebase Console → Project settings → Service accounts →
//      "Generate new private key" — yuklab olingan faylni loyiha
//      papkasiga "serviceAccountKey.json" nomi bilan saqlang
//      (bu fayl .gitignore'da — hech qachon GitHub'ga yuklanmaydi).
//   2) npm install firebase-admin  (agar hali o'rnatilmagan bo'lsa)
//   3) node scripts/migrate-i18n.js
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "..", "serviceAccountKey.json");

if (!existsSync(keyPath)) {
  console.error(
    "XATO: serviceAccountKey.json topilmadi.\n" +
    "Firebase Console → Project settings → Service accounts → \"Generate new private key\"\n" +
    "orqali yuklab oling va loyiha papkasining tub qismiga (root) shu nom bilan saqlang."
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// To'liq tarjima qilingan va yoqiladigan (enabled: true) tillar. Har biri
// uchun src/locales/{code}.json, goals.{code}.json, budgetai.{code}.json
// mavjud bo'lishi shart. kk/ky/tg/qr — AI yordamida tarjima qilingan
// (uz/ru asosida, 4800+ avtomatik placeholder-izchillik testi bilan
// tekshirilgan); asl (native) so'zlashuvchi tomonidan tekshiruvdan
// o'tishi tavsiya etiladi, ayniqsa moliyaviy atamalar uchun.
const READY_LANGUAGES = [
  { code: "uz", nativeName: "O'zbekcha", englishName: "Uzbek", flag: "🇺🇿", rtl: false, sort: 1 },
  { code: "en", nativeName: "English",   englishName: "English", flag: "🇬🇧", rtl: false, sort: 2 },
  { code: "ru", nativeName: "Русский",   englishName: "Russian", flag: "🇷🇺", rtl: false, sort: 3 },
  { code: "kk", nativeName: "Қазақша",  englishName: "Kazakh",     flag: "🇰🇿", rtl: false, sort: 4 },
  { code: "ky", nativeName: "Кыргызча", englishName: "Kyrgyz",     flag: "🇰🇬", rtl: false, sort: 5 },
  { code: "tg", nativeName: "Тоҷикӣ",   englishName: "Tajik",      flag: "🇹🇯", rtl: false, sort: 6 },
  { code: "qr", nativeName: "Qaraqalpaqsha", englishName: "Karakalpak", flag: "🏳️", rtl: false, sort: 7 },
];

// Kelajakda qo'shiladigan, hali tarjimasi yo'q tillar shu yerga
// { code, nativeName, englishName, flag, rtl, sort } shaklida qo'shiladi —
// "enabled: false" bilan yoziladi, Settings ekranida ko'rinmaydi.
const PLANNED_LANGUAGES = [];

// Asosiy "translation" fazosidan tashqari mustaqil modul lug'atlari.
// Har biri src/locales/{ns}.{lang}.json fayllaridan o'qiladi va
// Firestore'da "translations/{lang}__{ns}" hujjatiga yoziladi — bir xil
// kolleksiya, alohida qoida yozish shart emas (docs/i18n-architecture.md).
const NAMESPACES = ["goals", "budgetai"];

async function main() {
  const now = Date.now();
  const versions = {};

  console.log("→ translations/{lang} yozilmoqda (asosiy)...");
  for (const { code } of READY_LANGUAGES) {
    const localePath = join(__dirname, "..", "src", "locales", `${code}.json`);
    const data = JSON.parse(readFileSync(localePath, "utf8"));
    // MUHIM: versiya sifatida "now" (Date.now()) ishlatiladi, "1" emas —
    // aks holda skriptni qayta ishga tushirib mazmun yangilansa ham,
    // avval keshlagan qurilmalar buni "o'zgarish yo'q" deb hisoblab,
    // yangi kalitlarni hech qachon qayta yuklamaydi (translationService.js
    // versiyalarni solishtirib, teng bo'lsa keshdan qaytaradi).
    await db.collection("translations").doc(code).set({ version: now, updatedAt: now, data });
    versions[code] = now;
    console.log(`  ✓ translations/${code} (${Object.keys(data).length} kalit)`);
  }

  console.log("→ translations/{lang}__{ns} yozilmoqda (goals, budgetai)...");
  for (const ns of NAMESPACES) {
    for (const { code } of READY_LANGUAGES) {
      const localePath = join(__dirname, "..", "src", "locales", `${ns}.${code}.json`);
      const data = JSON.parse(readFileSync(localePath, "utf8"));
      const docId = `${code}__${ns}`;
      await db.collection("translations").doc(docId).set({ version: now, updatedAt: now, data });
      versions[docId] = now;
      console.log(`  ✓ translations/${docId} (${Object.keys(data).length} kalit)`);
    }
  }

  console.log("→ languages/{code} yozilmoqda...");
  for (const lang of READY_LANGUAGES) {
    await db.collection("languages").doc(lang.code).set({ ...lang, enabled: true });
    console.log(`  ✓ languages/${lang.code} (enabled: true)`);
  }
  for (const lang of PLANNED_LANGUAGES) {
    await db.collection("languages").doc(lang.code).set({ ...lang, enabled: false });
    versions[lang.code] = 0;
    console.log(`  ✓ languages/${lang.code} (enabled: false — tarjima kutilmoqda)`);
  }

  console.log("→ i18n_meta/current yozilmoqda...");
  await db.collection("i18n_meta").doc("current").set({ versions, updatedAt: now });
  console.log("  ✓ i18n_meta/current");

  console.log("\nTayyor. Firestore Console'da \"translations\", \"languages\", \"i18n_meta\" kolleksiyalarini tekshiring.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migratsiya xatosi:", e);
  process.exit(1);
});
