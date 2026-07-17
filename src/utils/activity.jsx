// ═══════════════════════════════════════════════════════════
//  ACTIVITY — Family Activity Timeline qatlami (Sprint 3D)
//  MUHIM: Firebase sxemasi/handlerlar O'ZGARMAYDI. Timeline mavjud
//  ma'lumotdan (xar, dar, maq, qarzlar, vazifalar) HOSILA qilinadi.
//  Ikonka/rang notify.jsx dan qayta ishlatiladi (DRY). Emoji yo'q.
//  Ixtiyoriy trackActivity() — kelajakdagi aniq loglar uchun
//  (act_<oilaId> kaliti; timeline usiz ham to'liq ishlaydi).
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";
import i18n from "../i18n/index.js";
import { fullName } from "./formatters.js";
import { catIcon as nIcon, catColor as nColor } from "./notify.jsx";

// ── Timeline toifalari (spec bo'yicha) ──────────────────────
export const ACATS = ["budget", "goals", "debt", "tasks", "garden", "family", "premium", "ai", "notification"];
export const ACAT_LABEL = {
  budget:       { uz: "Byudjet",   ru: "Бюджет",  en: "Budget",  kk: "Бюджет",       ky: "Бюджет",      tg: "Буҷет",       qr: "Byudjet" },
  goals:        { uz: "Maqsad",    ru: "Цель",    en: "Goal",    kk: "Мақсат",       ky: "Максат",      tg: "Ҳадаф",       qr: "Maqset" },
  debt:         { uz: "Qarz",      ru: "Долг",    en: "Debt",    kk: "Қарыз",        ky: "Карыз",       tg: "Қарз",        qr: "Qarız" },
  tasks:        { uz: "Vazifa",    ru: "Задача",  en: "Task",    kk: "Тапсырма",     ky: "Тапшырма",    tg: "Вазифа",      qr: "Tapsırma" },
  garden:       { uz: "Bog'",      ru: "Сад",     en: "Garden",  kk: "Бақ",          ky: "Бак",         tg: "Боғ",         qr: "Baǵ" },
  family:       { uz: "Oila",      ru: "Семья",   en: "Family",  kk: "Отбасы",       ky: "Үй-бүлө",     tg: "Оила",        qr: "Shańaraq" },
  premium:      { uz: "Premium",   ru: "Premium", en: "Premium", kk: "Premium",      ky: "Premium",     tg: "Premium",     qr: "Premium" },
  ai:           { uz: "AI",        ru: "AI",      en: "AI",      kk: "AI",           ky: "AI",          tg: "AI",          qr: "AI" },
  notification: { uz: "Bildirishnoma", ru: "Уведомл.", en: "Notification", kk: "Хабарландыру", ky: "Билдирүү", tg: "Огоҳинома", qr: "Bildiriw" },
};

// Activity toifa -> notify toifa (ikonka/rangni qayta ishlatish uchun)
const N_MAP = { budget: "budget", goals: "goal", debt: "debt", tasks: "family", garden: "garden", family: "family", premium: "premium", ai: "ai", notification: "reminder" };
export const actIcon  = (cat, c) => nIcon(N_MAP[cat] || "reminder", c);
export const actColor = (cat, th, PREMIUM) => nColor(N_MAP[cat] || "reminder", th, PREMIUM);

// ── Qaysi ekranga o'tish (action tugmasi) ───────────────────
export const actScreen = (cat) => ({
  budget: "hisobot", goals: "maqsad", debt: "qarzlar", tasks: "vazifa",
  garden: "profil", family: "vazifa", premium: "profil", ai: "hisobot", notification: null,
}[cat] || null);
export const actScreenLabel = (cat) => {
  return {
    budget:  i18n.t("act_openReport"),
    goals:   i18n.t("act_openGoal"),
    debt:    i18n.t("act_openDebt"),
    tasks:   i18n.t("act_goToTask"),
    garden:  i18n.t("act_goToGarden"),
    family:  i18n.t("act_goToFamily"),
    premium: "Premium",
    ai:      i18n.t("act_usefulAnalysis"),
  }[cat] || null;
};

// ── Sana+vaqt -> ms (vaqt yo'q bo'lsa tush payti) ────────────
const toTs = (sana, vaqt) => {
  if (!sana) return 0;
  const t = /^\d{2}:\d{2}$/.test(vaqt || "") ? vaqt : "12:00";
  const ms = Date.parse(sana + "T" + t + ":00");
  return isNaN(ms) ? (Date.parse(sana) || 0) : ms;
};

// ── Relativ vaqt ("2 soat oldin", "Kecha", ...) ─────────────
export const relTime = (ts, now = Date.now()) => {
  const d = Math.max(0, now - ts), min = Math.floor(d / 60000), hr = Math.floor(d / 3600000), day = Math.floor(d / 86400000);
  if (min < 1) return i18n.t("act_now");
  if (min < 60) return i18n.t("act_minutesAgo", { n: min });
  if (hr < 24) return i18n.t("act_hoursAgo", { n: hr });
  if (day === 1) return i18n.t("kh_yesterday");
  if (day < 7) return i18n.t("kh_daysAgo", { n: day });
  if (day < 31) return i18n.t("act_weeksAgo", { n: Math.floor(day / 7) });
  return i18n.t("act_monthsAgo", { n: Math.floor(day / 30) });
};
export const clockTime = (ts, lg = "uz") => {
  try { return new Date(ts).toLocaleTimeString(lg === "ru" ? "ru-RU" : lg === "en" ? "en-US" : "uz-UZ", { hour: "2-digit", minute: "2-digit" }); }
  catch (e) { return ""; }
};

// ── Barcha faoliyatni mavjud ma'lumotdan HOSILA qilish ──────
export function deriveActivities({ xar = [], dar = [], maq = [], qarzlar = [], vazifalar = [], azolar = [], acts = [] }) {
  const byId = {}; azolar.forEach(a => { byId[a.id] = a; });
  const who = (uid) => { const a = byId[uid]; return { uid, name: a ? fullName(a) : i18n.t("act_memberFallback"), photo: a ? a.photo : null }; };
  const out = [];
  const push = (uid, cat, action, desc, ts, ref) => { const w = who(uid); out.push({ id: cat + "_" + (ref ?? ts) + "_" + uid, ...w, cat, action, desc, ts }); };

  // Xarajat
  for (const x of xar) push(x.uid, "budget", i18n.t("act_addedExpense"), x.izoh || "", toTs(x.sana, x.vaqt), "x" + x.id);
  // Daromad
  for (const d of dar) push(d.uid, "budget", i18n.t("act_addedIncome"), d.izoh || "", toTs(d.sana, d.vaqt), "d" + d.id);
  // Maqsad yaratildi + hissa
  for (const m of maq) {
    push(m.uid, "goals", i18n.t("act_createdGoal"), m.ism || "", toTs(m.createdAt), "mg" + m.id);
    if (m.lastContrib && m.lastContrib.uid && m.lastContrib.sana)
      push(m.lastContrib.uid, "goals", i18n.t("act_addedToGoal"), m.ism || "", toTs(m.lastContrib.sana, m.lastContrib.vaqt), "mc" + m.id + (m.lastContrib.sana || ""));
  }
  // Qarz qo'shildi + qaytarildi
  for (const q of qarzlar) {
    push(q.uid, "debt", i18n.t("act_addedDebt"), q.kim || q.izoh || "", toTs(q.sana), "qn" + q.id);
    if (q.paid && q.paidSana) push(q.uid, "debt", i18n.t("act_repaidDebt"), q.kim || "", toTs(q.paidSana), "qp" + q.id);
  }
  // Vazifa: berildi / bajarildi / tasdiqlandi
  for (const v of vazifalar) {
    if (v.createdBy && v.sana) push(v.createdBy, "tasks", i18n.t("act_assignedTask"), v.title || "", toTs(v.sana), "vn" + v.id);
    if (v.doneSana && v.assignedTo) push(v.assignedTo, "tasks", i18n.t("act_completedTask"), v.title || "", toTs(v.doneSana), "vd" + v.id);
    if (v.paidSana && v.createdBy) push(v.createdBy, "tasks", i18n.t("act_approvedTask"), v.title || "", toTs(v.paidSana), "vp" + v.id);
  }
  // Ixtiyoriy aniq loglar (trackActivity yozgan bo'lsa)
  for (const a of acts) {
    if (!a || !a.cat) continue;
    const w = who(a.uid);
    out.push({ id: a.id || (a.cat + "_" + a.ts + "_" + a.uid), ...w, name: a.name || w.name, cat: a.cat, action: a.action || "", desc: a.desc || "", ts: a.ts || 0 });
  }

  out.sort((a, b) => b.ts - a.ts);
  return out;
}

// ── Smart grouping: ketma-ket bir xil (uid+cat+action) ──────
export function smartGroup(list, lg = "uz") {
  const res = []; let i = 0;
  while (i < list.length) {
    const n = list[i]; let j = i, cnt = 0;
    while (j < list.length && list[j].uid === n.uid && list[j].cat === n.cat && list[j].action === n.action) { cnt++; j++; }
    if (cnt >= 3) {
      const label = ACAT_LABEL[n.cat] ? (ACAT_LABEL[n.cat][lg] || ACAT_LABEL[n.cat].uz).toLowerCase() : "";
      res.push({ ...n, _group: true, _count: cnt,
        desc: i18n.t("act_groupedItems", { n: cnt, label }) });
      i = j;
    } else { res.push(n); i++; }
  }
  return res;
}

// ── Vaqt bo'yicha bo'limlarga ajratish ──────────────────────
export function groupByTime(list, now = new Date()) {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86400000;
  const buckets = { today: [], yest: [], week: [], month: [], old: [] };
  for (const a of list) {
    if (a.ts >= startToday) buckets.today.push(a);
    else if (a.ts >= startToday - dayMs) buckets.yest.push(a);
    else if (a.ts >= startToday - 7 * dayMs) buckets.week.push(a);
    else if (a.ts >= startToday - 30 * dayMs) buckets.month.push(a);
    else buckets.old.push(a);
  }
  const L = { today: i18n.t("kh_today"), yest: i18n.t("kh_yesterday"),
    week: i18n.t("act_last7Days"), month: i18n.t("act_lastMonth"),
    old: i18n.t("act_older") };
  return ["today", "yest", "week", "month", "old"].filter(k => buckets[k].length).map(k => ({ key: k, title: L[k], items: buckets[k] }));
}

// ── Statistika: bugun/hafta/oy + eng faol a'zo ──────────────
export function activityStats(list, azolar = [], lg = "uz", now = new Date()) {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 86400000;
  let today = 0, week = 0, month = 0;
  const byUid = {};
  for (const a of list) {
    if (a.ts >= startToday) today++;
    if (a.ts >= startToday - 6 * dayMs) week++;
    if (a.ts >= startToday - 29 * dayMs) { month++; byUid[a.uid] = (byUid[a.uid] || 0) + 1; }
  }
  let topUid = null, topN = 0;
  for (const uid in byUid) if (byUid[uid] > topN) { topN = byUid[uid]; topUid = uid; }
  const topA = azolar.find(a => a.id === topUid);
  return { today, week, month, top: topA ? { name: fullName(topA), photo: topA.photo, count: topN } : null };
}

// ── Ixtiyoriy: aniq activity yozish (kelajak uchun) ─────────
//  Timeline usiz ham ishlaydi; bu faqat qo'shimcha qatlam.
export async function trackActivity(oilaId, { uid, cat, action, desc = "", name = "" }) {
  if (!oilaId || !cat) return;
  try {
    const cur = (await db.g("act_" + oilaId)) || [];
    const item = { id: cat + "_" + Date.now() + "_" + (uid || ""), uid, cat, action, desc, name, ts: Date.now() };
    await db.s("act_" + oilaId, [item, ...cur].slice(0, 200));
  } catch (e) { /* sokin — asosiy oqimni to'xtatmaydi */ }
}
