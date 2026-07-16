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
import admin from "firebase-admin";

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
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Hozircha to'liq tarjima qilingan tillar (build ichidagi zaxira bilan bir xil).
const READY_LANGUAGES = [
  { code: "uz", nativeName: "O'zbekcha", englishName: "Uzbek", flag: "🇺🇿", rtl: false, sort: 1 },
  { code: "en", nativeName: "English",   englishName: "English", flag: "🇬🇧", rtl: false, sort: 2 },
  { code: "ru", nativeName: "Русский",   englishName: "Russian", flag: "🇷🇺", rtl: false, sort: 3 },
];

// Kelajakda tarjima to'ldirilib, "enabled: true" qilinishini kutayotgan tillar.
// Hozircha "data" yo'q — Settings ekranida ko'rinmaydi.
const PLANNED_LANGUAGES = [
  { code: "kk", nativeName: "Қазақша",  englishName: "Kazakh",     flag: "🇰🇿", rtl: false, sort: 4 },
  { code: "ky", nativeName: "Кыргызча", englishName: "Kyrgyz",     flag: "🇰🇬", rtl: false, sort: 5 },
  { code: "tg", nativeName: "Тоҷикӣ",   englishName: "Tajik",      flag: "🇹🇯", rtl: false, sort: 6 },
  { code: "qr", nativeName: "Qaraqalpaqsha", englishName: "Karakalpak", flag: "🏳️", rtl: false, sort: 7 },
];

async function main() {
  const now = Date.now();
  const versions = {};

  console.log("→ translations/{lang} yozilmoqda...");
  for (const { code } of READY_LANGUAGES) {
    const localePath = join(__dirname, "..", "src", "locales", `${code}.json`);
    const data = JSON.parse(readFileSync(localePath, "utf8"));
    await db.collection("translations").doc(code).set({ version: 1, updatedAt: now, data });
    versions[code] = 1;
    console.log(`  ✓ translations/${code} (${Object.keys(data).length} kalit)`);
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
