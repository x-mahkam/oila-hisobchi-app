import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "../locales/uz.json";
import en from "../locales/en.json";
import ru from "../locales/ru.json";

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
 * Dynamically registers a translation resource bundle at runtime.
 * Prepared for Firebase Firestore / Remote Config dynamic language fetching
 * without requiring a new APK release.
 * 
 * @param {string} lng - Language code (e.g. 'tr', 'ar', 'fr', 'de')
 * @param {object} translations - Translation dictionary JSON
 */
export const loadDynamicLanguage = (lng, translations) => {
  try {
    if (!i18n.hasResourceBundle(lng, "translation")) {
      i18n.addResourceBundle(lng, "translation", translations, true, true);
      console.log(`[i18n] Dynamically loaded resource bundle for language: ${lng}`);
    }
  } catch (e) {
    console.error(`[i18n] Error loading dynamic language ${lng}:`, e);
  }
};

export default i18n;
