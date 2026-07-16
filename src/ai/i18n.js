// ─────────────────────────────────────────────────────────────
//  SMART BUDGET AI — i18n
//  Yagona matn manbasi: i18next "budgetai" namespace'i (Firestore-backed,
//  bootda src/locales/budgetai.{uz,en,ru}.json orqali zaxiralangan).
//  T(key, lg, ...args) imzosi va %d/%s pozitsion almashtirish o'zgarmadi
//  — faqat ma'lumot manbai o'zgardi (mahalliy DICT → i18next resurs
//  do'koni). Barcha chaqiruv joylari (BudgetComponents.jsx) tegilmagan.
// ─────────────────────────────────────────────────────────────
import i18n from "../i18n/index.js";

const NS = "budgetai";

export function T(key, lg = "uz", ...args) {
  const raw = i18n.getResource(lg, NS, key)
    ?? i18n.getResource("uz", NS, key)
    ?? i18n.getResource("en", NS, key);
  let s = typeof raw === "string" ? raw : key;
  let i = 0;
  s = s.replace(/%[ds]/g, () => (i < args.length ? String(args[i++]) : ""));
  return s;
}
