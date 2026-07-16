import { fbDB, handleFirestoreError } from "../firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { getRemoteConfig, getValue, fetchAndActivate } from "firebase/remote-config";

// Local cache keys
const CACHE_VERSION_KEY = "oila_translation_version";
const CACHE_LANG_KEY_PREFIX = "oila_translations_";
const CACHE_AVAILABLE_LANGS_KEY = "oila_available_langs";

export class TranslationRepository {
  /**
   * Gets the translation version from Remote Config.
   * Falls back to Firestore /config/translations_metadata doc if Remote Config is unavailable.
   */
  async getRemoteVersion() {
    try {
      const rc = getRemoteConfig();
      // Configure minimum fetch interval to 0 in development, 1 hour in prod
      rc.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === "production" ? 3600000 : 0;
      rc.settings.fetchTimeoutMillis = 5000;
      
      await fetchAndActivate(rc);
      const versionVal = getValue(rc, "translation_version").asString();
      if (versionVal) {
        console.log(`[TranslationRepository] Remote Config version: ${versionVal}`);
        return versionVal;
      }
    } catch (e) {
      console.warn("[TranslationRepository] Remote Config error, falling back to Firestore config:", e);
    }

    // Firestore fallback for version config
    try {
      const metaRef = doc(fbDB, "translations", "metadata");
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        const data = metaSnap.data();
        console.log(`[TranslationRepository] Firestore metadata version:`, data.version);
        return data.version || "1.0.0";
      }
    } catch (fsErr) {
      console.warn("[TranslationRepository] Firestore version fetch failed (permissions or missing doc):", fsErr.message || fsErr);
    }

    return "1.0.0"; // ultimate default
  }

  /**
   * Retrieves all available languages from Remote Config/Firestore metadata
   */
  async getAvailableLanguages() {
    try {
      const metaRef = doc(fbDB, "translations", "metadata");
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        const data = metaSnap.data();
        if (data.languages && Array.isArray(data.languages)) {
          this.setLocalAvailableLanguages(data.languages);
          return data.languages;
        }
      }
    } catch (e) {
      console.warn("[TranslationRepository] Failed to fetch available languages, using cached/fallback:", e.message || e);
    }
    return this.getLocalAvailableLanguages() || ["uz", "en", "ru"];
  }

  /**
   * Fetches translations for a language from Firestore translations/{lang}/sections/*
   */
  async fetchLanguageTranslations(lang) {
    try {
      console.log(`[TranslationRepository] Fetching translations from Firestore for: ${lang}`);
      const sectionsColl = collection(fbDB, "translations", lang, "sections");
      const snapshot = await getDocs(sectionsColl);
      
      const merged = {};
      snapshot.forEach((docSnap) => {
        const sectionData = docSnap.data() || {};
        // Merge the section's key-values (flat or nested)
        Object.entries(sectionData).forEach(([key, val]) => {
          merged[key] = val;
        });
      });

      // Also try fetching a single flat doc translations/{lang} as a fallback/alternative structure
      if (snapshot.empty) {
        const flatDocRef = doc(fbDB, "translations", lang);
        const flatSnap = await getDoc(flatDocRef);
        if (flatSnap.exists()) {
          const flatData = flatSnap.data() || {};
          Object.assign(merged, flatData);
        }
      }

      return Object.keys(merged).length > 0 ? merged : null;
    } catch (e) {
      console.warn(`[TranslationRepository] Firestore fetch error for ${lang} (permissions or missing doc):`, e.message || e);
      return null;
    }
  }

  // ===== Local Cache Accessors =====
  getLocalVersion() {
    return localStorage.getItem(CACHE_VERSION_KEY) || "0.0.0";
  }

  setLocalVersion(version) {
    localStorage.setItem(CACHE_VERSION_KEY, version);
  }

  getLocalTranslations(lang) {
    try {
      const cached = localStorage.getItem(`${CACHE_LANG_KEY_PREFIX}${lang}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error(`[TranslationRepository] Error parsing local translations for ${lang}:`, e);
      return null;
    }
  }

  setLocalTranslations(lang, translations) {
    try {
      localStorage.setItem(`${CACHE_LANG_KEY_PREFIX}${lang}`, JSON.stringify(translations));
    } catch (e) {
      console.error(`[TranslationRepository] Error writing local translations for ${lang}:`, e);
    }
  }

  getLocalAvailableLanguages() {
    try {
      const cached = localStorage.getItem(CACHE_AVAILABLE_LANGS_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }

  setLocalAvailableLanguages(langs) {
    try {
      localStorage.setItem(CACHE_AVAILABLE_LANGS_KEY, JSON.stringify(langs));
    } catch (e) {}
  }
}

export const translationRepository = new TranslationRepository();
