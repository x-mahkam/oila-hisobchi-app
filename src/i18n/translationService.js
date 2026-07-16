import i18n, { loadDynamicLanguage } from "./index";
import { translationRepository } from "./translationRepository";
import uzFallback from "../locales/uz.json";
import enFallback from "../locales/en.json";
import ruFallback from "../locales/ru.json";

// Fallback registry for bundled languages
const fallbackResources = {
  uz: uzFallback,
  en: enFallback,
  ru: ruFallback,
};

export class TranslationService {
  constructor() {
    this.initialized = false;
    this.availableLanguages = ["uz", "en", "ru"];
  }

  /**
   * Initializes the Enterprise-grade Translation System
   * This is called on App startup.
   */
  async initialize() {
    if (this.initialized) return;

    console.log("[TranslationService] Initializing dynamic translations...");
    
    // 1. Determine active language
    const activeLang = i18n.language || "en";

    try {
      // 2. Fetch remote version and list of languages
      const remoteVersion = await translationRepository.getRemoteVersion();
      const localVersion = translationRepository.getLocalVersion();
      
      const remoteLangs = await translationRepository.getAvailableLanguages();
      this.availableLanguages = remoteLangs;

      console.log(`[TranslationService] Local Version: ${localVersion} | Remote Version: ${remoteVersion}`);

      if (remoteVersion === localVersion) {
        // Versions match! Load all from Cache (much faster, zero Firestore reads)
        console.log("[TranslationService] Versions match. Loading from Cache...");
        this.loadAllFromCache();
      } else {
        // Version changed!
        console.log("[TranslationService] Version changed or first load. Fetching from Firestore...");
        
        // Fetch active language first so UI is unblocked and updated immediately
        await this.loadLanguageFromFirestore(activeLang);

        // Fetch remaining languages in background
        this.loadRemainingLanguagesInBackground(activeLang, remoteVersion);
      }
    } catch (e) {
      console.warn("[TranslationService] Sync error, falling back to cached or bundled:", e);
      this.loadAllFromCache();
    }

    this.initialized = true;
    console.log("[TranslationService] Dynamic Translation System initialized.");
  }

  /**
   * Loads all available languages from Local Storage Cache into i18n
   */
  loadAllFromCache() {
    this.availableLanguages.forEach((lang) => {
      const cached = translationRepository.getLocalTranslations(lang);
      if (cached) {
        loadDynamicLanguage(lang, cached);
      } else if (fallbackResources[lang]) {
        // Bundled fallback
        loadDynamicLanguage(lang, fallbackResources[lang]);
      }
    });
  }

  /**
   * Fetches specific language from Firestore, caches it, and registers in i18n
   */
  async loadLanguageFromFirestore(lang) {
    const data = await translationRepository.fetchLanguageTranslations(lang);
    if (data && Object.keys(data).length > 0) {
      // Register in i18n
      loadDynamicLanguage(lang, data);
      // Cache locally
      translationRepository.setLocalTranslations(lang, data);
      console.log(`[TranslationService] Successfully fetched and cached language: ${lang}`);
      return true;
    } else {
      // Fallback if Firestore fetch failed or is empty
      const cached = translationRepository.getLocalTranslations(lang);
      if (cached) {
        loadDynamicLanguage(lang, cached);
      } else if (fallbackResources[lang]) {
        loadDynamicLanguage(lang, fallbackResources[lang]);
      }
      return false;
    }
  }

  /**
   * Background fetches the other languages to avoid blocking app startup
   */
  async loadRemainingLanguagesInBackground(activeLang, newVersion) {
    setTimeout(async () => {
      try {
        const remaining = this.availableLanguages.filter(l => l !== activeLang);
        const promises = remaining.map(lang => this.loadLanguageFromFirestore(lang));
        
        await Promise.all(promises);
        
        // Once all fetched and saved, update local version identifier
        translationRepository.setLocalVersion(newVersion);
        console.log(`[TranslationService] Background fetch complete. Translation version updated to: ${newVersion}`);
      } catch (e) {
        console.error("[TranslationService] Background translations sync failed:", e);
      }
    }, 1000); // defer slightly
  }

  /**
   * Returns list of all available languages (e.g., ['uz', 'en', 'ru', 'tr', 'ar'])
   */
  getLanguages() {
    return this.availableLanguages;
  }

  /**
   * Dynamically switch active interface language
   */
  async changeLanguage(lang) {
    if (i18n.language === lang) return;

    console.log(`[TranslationService] Switching interface language to: ${lang}`);
    
    // Check if we need to load this language from Firestore dynamically
    const hasCache = !!translationRepository.getLocalTranslations(lang);
    if (!hasCache && !fallbackResources[lang]) {
      // Totally new language from admin panel! Fetch it on demand
      await this.loadLanguageFromFirestore(lang);
    }

    await i18n.changeLanguage(lang);
    
    // Keep local storage keys synchronized
    try {
      localStorage.setItem("i18nextLng", lang);
      localStorage.setItem("oilaV7_lg", lang);
      localStorage.setItem("oilaV7_lg_active", lang);
    } catch (e) {
      console.error("[TranslationService] Error saving selected language:", e);
    }
  }
}

export const translationService = new TranslationService();
