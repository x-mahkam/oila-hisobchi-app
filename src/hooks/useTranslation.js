import { useTranslation as useI18nTranslation } from "react-i18next";
import { useCallback } from "react";
import { translationService } from "../i18n/translationService";

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = useCallback(async (lang) => {
    await translationService.changeLanguage(lang);
  }, []);

  return {
    t,
    i18n,
    currentLanguage: i18n.language || "en",
    languages: translationService.getLanguages(),
    changeLanguage,
  };
}
