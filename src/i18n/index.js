import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "../locales/uz.json";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import { fetchMeta, getTranslationBundle } from "./translationService.js";

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
    resources: {
      uz: { translation: uz },
      en: { translation: en },
      ru: { translation: ru }
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
 */
export const loadDynamicLanguage = (lng, translations) => {
  try {
    i18n.addResourceBundle(lng, "translation", translations, true, true);
  } catch (e) {
    console.error(`[i18n] "${lng}" tilini yuklashda xato:`, e);
  }
};

/**
 * Joriy til uchun Firestore'dagi eng so'nggi tarjimani fonda tekshiradi.
 * Build ichidagi zaxira (uz/en/ru) darhol ko'rsatiladi — bu funksiya faqat
 * undan keyin, orqadan, agar Firestore'da yangiroq versiya bo'lsa, uni
 * jonli (hot) almashtiradi. Oflayn/xato holatda jim o'tadi — ilova zaxira
 * tarjima bilan ishlashda davom etadi.
 */
export const syncTranslations = async (lng = i18n.language) => {
  try {
    const meta = await fetchMeta();
    const knownVersion = meta?.versions?.[lng] ?? null;
    const bundle = await getTranslationBundle(lng, knownVersion);
    if (bundle?.data) loadDynamicLanguage(lng, bundle.data);
  } catch (e) {
    console.warn(`[i18n] "${lng}" Firestore bilan sinxronlanmadi:`, e);
  }
};

if (typeof window !== "undefined") {
  // Ilova ochilishida joriy til fonda Firestore bilan sinxronlanadi.
  syncTranslations(initialLanguage);
}

export default i18n;
