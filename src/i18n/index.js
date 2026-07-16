import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "../locales/uz.json";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import goalsUz from "../locales/goals.uz.json";
import goalsEn from "../locales/goals.en.json";
import goalsRu from "../locales/goals.ru.json";
import budgetaiUz from "../locales/budgetai.uz.json";
import budgetaiEn from "../locales/budgetai.en.json";
import budgetaiRu from "../locales/budgetai.ru.json";
import gardenUz from "../locales/garden.uz.json";
import gardenEn from "../locales/garden.en.json";
import gardenRu from "../locales/garden.ru.json";
import weddingUz from "../locales/wedding.uz.json";
import weddingEn from "../locales/wedding.en.json";
import weddingRu from "../locales/wedding.ru.json";
import { fetchMeta, getTranslationBundle } from "./translationService.js";

// ═══════════════════════════════════════════════════════════════════
//  NAMESPACE SIYOSATI
//  "translation" — asosiy ilova matnlari (default namespace).
//  "goals"       — Smart Goals moduli (src/goals/*).
//  "budgetai"    — Smart Budget AI moduli (src/ai/*).
//  "garden"      — Baraka Bog'i (Garden.jsx + garden/*).
//  "wedding"     — To'y kalkulyatori (components/WeddingCalc.jsx).
//
//  Qoida: yangi mustaqil modul o'z lug'atini asosiy "translation"
//  fazosiga aralashtirmaydi — bu kalit nomlari to'qnashuvining oldini
//  oladi (masalan "overdue" goals'da ham, boshqa modulda ham bo'lishi
//  mumkin — namespace ular orasida chegara qo'yadi). Batafsil:
//  docs/i18n-architecture.md
// ═══════════════════════════════════════════════════════════════════
export const NAMESPACES = ["translation", "goals", "budgetai", "garden", "wedding"];

// Clean detection logic for Device / Browser Language
const getInitialLanguage = () => {
  try {
    // 1. Check local storage first (both i18next standard key and existing oila lg key)
    const saved = localStorage.getItem("i18nextLng") || localStorage.getItem("oilaV7_lg") || localStorage.getItem("oilaV7_lg_active");
    if (saved && ["uz", "en", "ru"].includes(saved)) {
      return saved;
    }

    // 2. Fall back to Phone/Capacitor device browser system language
    const deviceLang = (
      navigator.language ||
      navigator.languages?.[0] ||
      navigator.userLanguage ||
      "en"
    ).toLowerCase();

    if (deviceLang.startsWith("uz")) return "uz";
    if (deviceLang.startsWith("ru")) return "ru";
  } catch (e) {
    console.error("i18n language detection error:", e);
  }

  // 3. Fallback to English for any other language (e.g., Turkish, Arabic, French)
  return "en";
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    ns: NAMESPACES,
    defaultNS: "translation",
    resources: {
      uz: { translation: uz, goals: goalsUz, budgetai: budgetaiUz, garden: gardenUz, wedding: weddingUz },
      en: { translation: en, goals: goalsEn, budgetai: budgetaiEn, garden: gardenEn, wedding: weddingEn },
      ru: { translation: ru, goals: goalsRu, budgetai: budgetaiRu, garden: gardenRu, wedding: weddingRu },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    },
    react: {
      useSuspense: false // avoids issues with async loading
    }
  });

// Keep local storage keys in perfect sync
try {
  localStorage.setItem("i18nextLng", initialLanguage);
  localStorage.setItem("oilaV7_lg", initialLanguage);
} catch (e) {
  console.error("Could not write initial language to localStorage:", e);
}

/**
 * Runtime'da tarjima to'plamini (qayta) ro'yxatdan o'tkazadi. Firestore'dan
 * kelgan yangi versiya build ichidagi zaxira ustiga yoziladi (overwrite),
 * shuning uchun mavjud til ham yangilanishi mumkin — faqat yangi til emas.
 *
 * @param {string} lng - Til kodi (masalan "uz", "kk", "ar")
 * @param {object} translations - Kalit-qiymat tarjima lug'ati
 * @param {string} ns - Namespace ("translation" | "goals" | "budgetai")
 */
export const loadDynamicLanguage = (lng, translations, ns = "translation") => {
  try {
    i18n.addResourceBundle(lng, ns, translations, true, true);
  } catch (e) {
    console.error(`[i18n] "${lng}" (${ns}) tilini yuklashda xato:`, e);
  }
};

/**
 * Berilgan til+namespace uchun Firestore'dagi eng so'nggi tarjimani fonda
 * tekshiradi. Build ichidagi zaxira darhol ko'rsatiladi — bu funksiya faqat
 * undan keyin, orqadan, agar Firestore'da yangiroq versiya bo'lsa, uni
 * jonli (hot) almashtiradi. Oflayn/xato holatda jim o'tadi — ilova zaxira
 * tarjima bilan ishlashda davom etadi.
 */
export const syncTranslations = async (lng = i18n.language, ns = "translation") => {
  try {
    const meta = await fetchMeta();
    const versionKey = ns === "translation" ? lng : `${lng}__${ns}`;
    const knownVersion = meta?.versions?.[versionKey] ?? null;
    const bundle = await getTranslationBundle(lng, knownVersion, ns);
    if (bundle?.data) loadDynamicLanguage(lng, bundle.data, ns);
  } catch (e) {
    console.warn(`[i18n] "${lng}" (${ns}) Firestore bilan sinxronlanmadi:`, e);
  }
};

/** Joriy til uchun BARCHA namespace'larni fonda sinxronlaydi (ilova ochilishida). */
export const syncAllNamespaces = async (lng = i18n.language) => {
  await Promise.all(NAMESPACES.map((ns) => syncTranslations(lng, ns)));
};

if (typeof window !== "undefined") {
  syncAllNamespaces(initialLanguage);
}

export default i18n;
