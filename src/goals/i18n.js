// ═══════════════════════════════════════════════════════════
//  SMART GOALS — i18n
//  Yagona matn manbasi: i18next "goals" namespace'i (Firestore-backed,
//  bootda src/locales/goals.{uz,en,ru}.json orqali zaxiralangan).
//  T(key, lg, ...args) imzosi va %d/%s pozitsion almashtirish o'zgarmadi
//  — faqat ma'lumot manbai o'zgardi (mahalliy DICT → i18next resurs
//  do'koni). Barcha chaqiruv joylari (Goals.jsx, SmartComponents.jsx,
//  smartEngine.js, GoalFormFields.jsx, notifications.js) tegilmagan.
//
//  MUHIM: bu qatlam hamon "pure" — i18n instansi faqat statik import
//  qilinadi (getResource — hech qanday I/O, hech qanday side-effect),
//  smartEngine.js kabi modullar hali ham sinxron test qilinadi.
// ═══════════════════════════════════════════════════════════
import i18n from "../i18n/index.js";

const NS = "goals";

/** T(key, lg, ...args) — %d / %s pozitsion almashtirish bilan. */
export function T(key, lg = "uz", ...args) {
  const raw = i18n.getResource(lg, NS, key)
    ?? i18n.getResource("uz", NS, key)
    ?? i18n.getResource("en", NS, key);
  let s = typeof raw === "string" ? raw : key;
  let i = 0;
  s = s.replace(/%[ds]/g, () => (i < args.length ? String(args[i++]) : ""));
  return s;
}
