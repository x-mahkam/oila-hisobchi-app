// ═══════════════════════════════════════════════════════════
//  NOTIFY — bildirishnomalarning YAGONA markazi (Sprint 3C)
//  • Kategoriya + priority mavjud `type` dan HOSILA qilinadi —
//    shuning uchun ESKI bildirishnomalar ham avtomatik toifalanadi
//    (Firebase sxemasi o'zgarmaydi; faqat qo'shimcha `cat`/`prio`).
//  • Barcha yangi push'lar shu yerdagi notify* funksiyalari orqali.
//  • Emoji YO'Q — har toifa uchun outline SVG.
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";
import i18n from "../i18n/index.js";

// ── Toifalar (id barqaror, matn tilга qarab) ──────────────────
export const NCATS = ["goal", "budget", "debt", "family", "garden", "premium", "ai", "reminder"];

export const NCAT_LABEL = {
  goal:     { uz: "Maqsad",   ru: "Цель",       en: "Goal",     kk: "Мақсат",   ky: "Максат",   tg: "Ҳадаф",     qr: "Maqset" },
  budget:   { uz: "Byudjet",  ru: "Бюджет",     en: "Budget",   kk: "Бюджет",   ky: "Бюджет",   tg: "Буҷет",     qr: "Byudjet" },
  debt:     { uz: "Qarz",     ru: "Долг",       en: "Debt",     kk: "Қарыз",    ky: "Карыз",    tg: "Қарз",      qr: "Qarız" },
  family:   { uz: "Oila",     ru: "Семья",      en: "Family",   kk: "Отбасы",   ky: "Үй-бүлө",  tg: "Оила",      qr: "Shańaraq" },
  garden:   { uz: "Bog'",     ru: "Сад",        en: "Garden",   kk: "Бақ",      ky: "Бак",      tg: "Боғ",       qr: "Baǵ" },
  premium:  { uz: "Premium",  ru: "Premium",    en: "Premium",  kk: "Premium",  ky: "Premium",  tg: "Premium",   qr: "Premium" },
  ai:       { uz: "AI",       ru: "AI",         en: "AI",       kk: "AI",       ky: "AI",       tg: "AI",        qr: "AI" },
  reminder: { uz: "Eslatma",  ru: "Напоминание",en: "Reminder", kk: "Ескерту",  ky: "Эскертүү", tg: "Ёдрасонӣ",  qr: "Eskertiw" },
};

// ── Toifa rangi — FAQAT tokenlardan (th orqali) ──────────────
export const catColor = (cat, th, PREMIUM) => ({
  goal: th.ac, budget: th.am, debt: th.rd, family: th.ac2 || th.ac,
  garden: th.gr, premium: (PREMIUM && PREMIUM.gold) || th.am, ai: th.ac, reminder: th.t2,
}[cat] || th.ac);

// ── Priority → rang (token) ──────────────────────────────────
export const PRIOS = ["critical", "high", "normal", "low"];
export const prioColor = (prio, th) => ({
  critical: th.rd, high: th.am, normal: th.ac, low: th.t3,
}[prio] || th.ac);

// ── type → kategoriya xaritasi (mavjud + yangi turlar) ───────
const TYPE_CAT = {
  // mavjud turlar
  qarz: "debt", payment: "debt", pay_result: "debt",
  maqsad_confirm: "goal", maqsad_kid_confirm: "goal", self_confirm: "goal",
  vazifa: "family", link_status: "family",
  vazifa_proposed: "family", vazifa_accepted: "family", vazifa_done: "family",
  budjet: "budget", xarajat: "budget",
  yangilik: "premium",
  // yangi (helperlar yozadi)
  goal_deadline: "goal", goal_done: "goal", goal_behind: "goal",
  budget_over: "budget", budget_80: "budget", budget_100: "budget",
  debt_new: "debt", debt_confirmed: "debt", debt_repaid: "debt",
  garden_harvest: "garden", garden_energy: "garden", garden_daily: "garden",
  family_member: "family", family_kid: "family", family_task_sent: "family", family_task_done: "family",
  bilim_proposal: "family", bilim_approved: "family", bilim_done: "family",
  bilim_offer: "family", bilim_offer_accepted: "family", bilim_offer_rejected: "family", bilim_offer_countered: "family",
  premium_ended: "premium", trial_ended: "premium",
  ai_weekly: "ai", ai_monthly: "ai",
  reminder: "reminder", daily_reminder: "reminder",
  vaqt_sorov: "family", vaqt_tasdiq: "family", vaqt_rad: "family",
  yordam: "family", support_new: "family",
};
export const catOf = (n) => (n && (n.cat || TYPE_CAT[n.type])) || "reminder";

// ── type/holat → priority ────────────────────────────────────
const TYPE_PRIO = {
  budget_over: "critical", budget_100: "critical", premium_ended: "critical", trial_ended: "high",
  debt_new: "high", goal_deadline: "high", budget_80: "high", family_kid: "high",
  bilim_proposal: "high", bilim_approved: "high", bilim_done: "high",
  bilim_offer: "high", bilim_offer_accepted: "high", bilim_offer_rejected: "high", bilim_offer_countered: "high",
  goal_behind: "normal", debt_confirmed: "normal", debt_repaid: "normal",
  goal_done: "normal", family_member: "normal", family_task_sent: "normal", family_task_done: "normal",
  garden_harvest: "normal", garden_energy: "low", garden_daily: "low",
  ai_weekly: "low", ai_monthly: "normal", reminder: "low", daily_reminder: "low",
  vaqt_sorov: "high", vaqt_tasdiq: "high", vaqt_rad: "normal",
  vazifa_proposed: "high", vazifa_accepted: "normal", vazifa_done: "normal",
  // mavjud turlar
  maqsad_confirm: "high", maqsad_kid_confirm: "high", qarz: "high", budjet: "high", yangilik: "low",
  yordam: "high", support_new: "high",
};
export const prioOf = (n) => (n && (n.prio || TYPE_PRIO[n.type])) || "normal";
const PRIO_RANK = { critical: 0, high: 1, normal: 2, low: 3 };
export const prioRank = (n) => PRIO_RANK[prioOf(n)] ?? 2;

// ── Toifadan qaysi ekranga o'tish (action tugmasi) ───────────
export const catAction = (cat) => ({
  goal: "maqsad", budget: "hisobot", debt: "qarz", family: "vazifa",
  garden: "profil", premium: "profil", ai: "hisobot", reminder: null,
}[cat] || null);

export const catActionLabel = (cat) => {
  return {
    goal:    i18n.t("ntf_goToGoal"),
    budget:  i18n.t("ntf_openReport"),
    debt:    i18n.t("ntf_debts"),
    family:  i18n.t("ntf_tasks"),
    garden:  i18n.t("ntf_openGarden"),
    premium: "Premium",
    ai:      i18n.t("ntf_usefulAnalysis"),
  }[cat] || null;
};

// ── Outline SVG ikonkalar (emoji o'rniga) ─────────────────────
const svg = (d, c, extra) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d={d} stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={c} fillOpacity="0.12" />
    {extra}
  </svg>
);
export const catIcon = (cat, c) => ({
  goal:     svg("M10 3l1.9 3.9 4.3.6-3.1 3 .7 4.3L10 16.8 6.2 18l.8-4.3-3.1-3 4.3-.6L10 3z", c),
  budget:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.12"/><path d="M3 8.5h14" stroke={c} strokeWidth="1.5"/><circle cx="13.5" cy="12.5" r="1.3" fill={c}/></svg>,
  debt:     <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.12"/><path d="M10 6v4l2.5 2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  family:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.4" stroke={c} strokeWidth="1.4"/><circle cx="13.5" cy="8" r="2" stroke={c} strokeWidth="1.4"/><path d="M2.5 16c0-2.7 2-4.5 4.5-4.5s4.5 1.8 4.5 4.5M12 16c.2-2.1 1.5-3.4 3.2-3.4 1.6 0 2.6 1.1 3 3.4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  garden:   svg("M16 4C9 4 5 7 5 12c0 1 .2 2 .5 3 5.5 0 10.5-3 10.5-11z", c, <path d="M5.5 15C8 11 11 8.5 14 6.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>),
  premium:  svg("M3 7l3.5 2.5L10 4l3.5 5.5L17 7l-1.5 8h-11L3 7z", c),
  ai:       <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="5" width="12" height="10" rx="2.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.12"/><circle cx="7.8" cy="10" r="1" fill={c}/><circle cx="12.2" cy="10" r="1" fill={c}/><path d="M10 5V3M7 15v1.5M13 15v1.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  reminder: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3a5 5 0 00-5 5v3l-1.5 2.5h13L15 11V8a5 5 0 00-5-5z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.12"/><path d="M8.5 16a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
}[cat] || (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3a5 5 0 00-5 5v3l-1.5 2.5h13L15 11V8a5 5 0 00-5-5z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.12"/><path d="M8.5 16a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>
));

// ── Smart grouping: bir xil (cat,type) ketma-ketligini yig'ish ─
export const groupNotifs = (list) => {
  const out = [];
  let i = 0;
  while (i < list.length) {
    const n = list[i];
    // faqat "family/task_done" kabi qaytariluvchi turlarni guruhlaymiz
    const groupable = n.type === "family_task_done" || n.type === "vazifa";
    if (groupable) {
      let j = i, cnt = 0, anyUnread = false;
      while (j < list.length && list[j].type === n.type) { cnt++; anyUnread = anyUnread || !list[j].read; j++; }
      if (cnt >= 3) {
        out.push({
          ...n, _group: true, _count: cnt, read: !anyUnread,
          title: i18n.t("ntf_kidCompletedTasks", { n: cnt }),
          text: i18n.t("ntf_tapToView"),
        });
        i = j; continue;
      }
    }
    out.push(n); i++;
  }
  return out;
};

// ── Yagona yozuvchi (schema o'zgarmaydi + cat/prio qo'shiladi) ─
const pushNotif = async (uid, cat, type, title, text, extra = {}) => {
  if (!uid) return;
  try {
    const cur = (await db.g("notif_" + uid)) || [];
    const item = { id: Date.now() + Math.random(), cat, prio: TYPE_PRIO[type] || "normal", type, title, text, sana: new Date().toISOString(), read: false, ...extra };
    await db.s("notif_" + uid, [item, ...cur].slice(0, 100));
  } catch (e) { /* sokin — bildirishnoma biznes-oqimni to'xtatmasin */ }
};

// ── Commit qilingan API — boshqa modullar SHULARNI chaqiradi ──
export const notifyGoal    = (uid, type, title, text, extra) => pushNotif(uid, "goal",     type, title, text, extra);
export const notifyBudget  = (uid, type, title, text, extra) => pushNotif(uid, "budget",   type, title, text, extra);
export const notifyDebt    = (uid, type, title, text, extra) => pushNotif(uid, "debt",     type, title, text, extra);
export const notifyGarden  = (uid, type, title, text, extra) => pushNotif(uid, "garden",   type, title, text, extra);
export const notifyPremium = (uid, type, title, text, extra) => pushNotif(uid, "premium",  type, title, text, extra);
export const notifyFamily  = (uid, type, title, text, extra) => pushNotif(uid, "family",   type, title, text, extra);
export const notifyAI      = (uid, type, title, text, extra) => pushNotif(uid, "ai",       type, title, text, extra);
export const notifyReminder= (uid, type, title, text, extra) => pushNotif(uid, "reminder", type, title, text, extra);
