// ═══════════════════════════════════════════════════════════
//  ACTIVITY — Family Activity Timeline qatlami (Sprint 3D)
//  MUHIM: Firebase sxemasi/handlerlar O'ZGARMAYDI. Timeline mavjud
//  ma'lumotdan (xar, dar, maq, qarzlar, vazifalar) HOSILA qilinadi.
//  Ikonka/rang notify.jsx dan qayta ishlatiladi (DRY). Emoji yo'q.
//  Ixtiyoriy trackActivity() — kelajakdagi aniq loglar uchun
//  (act_<oilaId> kaliti; timeline usiz ham to'liq ishlaydi).
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";
import { fullName } from "./formatters.js";
import { catIcon as nIcon, catColor as nColor } from "./notify.jsx";
import i18n from "../i18n/index.js";

// ── Timeline toifalari (spec bo'yicha) ──────────────────────
export const ACATS = ["budget", "goals", "debt", "tasks", "garden", "family", "premium", "ai", "notification"];

export const ACAT_LABEL = {
  budget:       { get uz() { return i18n.t("acat_label_budget", { defaultValue: "Byudjet" }); }, get ru() { return i18n.t("acat_label_budget", { defaultValue: "Бюджет" }); }, get en() { return i18n.t("acat_label_budget", { defaultValue: "Budget" }); } },
  goals:        { get uz() { return i18n.t("acat_label_goals", { defaultValue: "Maqsadlar" }); }, get ru() { return i18n.t("acat_label_goals", { defaultValue: "Цели" }); }, get en() { return i18n.t("acat_label_goals", { defaultValue: "Goals" }); } },
  debt:         { get uz() { return i18n.t("acat_label_debt", { defaultValue: "Qarzlar" }); }, get ru() { return i18n.t("acat_label_debt", { defaultValue: "Долги" }); }, get en() { return i18n.t("acat_label_debt", { defaultValue: "Debts" }); } },
  tasks:        { get uz() { return i18n.t("acat_label_tasks", { defaultValue: "Vazifalar" }); }, get ru() { return i18n.t("acat_label_tasks", { defaultValue: "Задачи" }); }, get en() { return i18n.t("acat_label_tasks", { defaultValue: "Tasks" }); } },
  garden:       { get uz() { return i18n.t("acat_label_garden", { defaultValue: "Bog'bonlik" }); }, get ru() { return i18n.t("acat_label_garden", { defaultValue: "Сад" }); }, get en() { return i18n.t("acat_label_garden", { defaultValue: "Garden" }); } },
  family:       { get uz() { return i18n.t("acat_label_family", { defaultValue: "Oila" }); }, get ru() { return i18n.t("acat_label_family", { defaultValue: "Семья" }); }, get en() { return i18n.t("acat_label_family", { defaultValue: "Family" }); } },
  premium:      { get uz() { return i18n.t("acat_label_premium", { defaultValue: "Premium" }); }, get ru() { return i18n.t("acat_label_premium", { defaultValue: "Premium" }); }, get en() { return i18n.t("acat_label_premium", { defaultValue: "Premium" }); } },
  ai:           { get uz() { return i18n.t("acat_label_ai", { defaultValue: "AI maslahatchi" }); }, get ru() { return i18n.t("acat_label_ai", { defaultValue: "AI советник" }); }, get en() { return i18n.t("acat_label_ai", { defaultValue: "AI assistant" }); } },
  notification: { get uz() { return i18n.t("acat_label_notification", { defaultValue: "Bildirishnoma" }); }, get ru() { return i18n.t("acat_label_notification", { defaultValue: "Уведомление" }); }, get en() { return i18n.t("acat_label_notification", { defaultValue: "Notification" }); } },
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

export const actScreenLabel = (cat, lg) => {
  return i18n.t("act_screen_label_" + cat, { defaultValue: cat });
};

// ── Sana+vaqt -> ms (vaqt yo'q bo'lsa tush payti) ────────────
const toTs = (sana, vaqt) => {
  if (!sana) return 0;
  const t = /^\d{2}:\d{2}$/.test(vaqt || "") ? vaqt : "12:00";
  const ms = Date.parse(sana + "T" + t + ":00");
  return isNaN(ms) ? (Date.parse(sana) || 0) : ms;
};

// ── Relativ vaqt ("2 soat oldin", "Kecha", ...) ─────────────
export const relTime = (ts, lg = "uz", now = Date.now()) => {
  const d = Math.max(0, now - ts), min = Math.floor(d / 60000), hr = Math.floor(d / 3600000), day = Math.floor(d / 86400000);
  if (min < 1) return i18n.t("rel_now", { defaultValue: "Now" });
  if (min < 60) return i18n.t("rel_min_ago", { count: min, defaultValue: `${min}m ago` });
  if (hr < 24) return i18n.t("rel_hr_ago", { count: hr, defaultValue: `${hr}h ago` });
  if (day === 1) return i18n.t("rel_yesterday", { defaultValue: "Yesterday" });
  if (day < 7) return i18n.t("rel_day_ago", { count: day, defaultValue: `${day}d ago` });
  if (day < 31) {
    const w = Math.floor(day / 7);
    return i18n.t("rel_week_ago", { count: w, defaultValue: `${w}w ago` });
  }
  const m = Math.floor(day / 30);
  return i18n.t("rel_month_ago", { count: m, defaultValue: `${m}mo ago` });
};

export const clockTime = (ts) => {
  try {
    const lg = i18n.language;
    return new Date(ts).toLocaleTimeString(lg === "ru" ? "ru-RU" : lg === "en" ? "en-US" : "uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }
  catch (e) { return ""; }
};

// ── Barcha faoliyatni mavjud ma'lumotdan HOSILA qilish ──────
export function deriveActivities({ xar = [], dar = [], maq = [], qarzlar = [], vazifalar = [], azolar = [], acts = [], lg = "uz" }) {
  const byId = {}; azolar.forEach(a => { byId[a.id] = a; });
  const who = (uid) => { const a = byId[uid]; return { uid, name: a ? fullName(a) : i18n.t("mb2", { defaultValue: "A'zo" }), photo: a ? a.photo : null }; };
  const out = [];
  const push = (uid, cat, action, desc, ts, ref) => { const w = who(uid); out.push({ id: cat + "_" + (ref ?? ts) + "_" + uid, ...w, cat, action, desc, ts }); };

  // Xarajat
  for (const x of xar) push(x.uid, "budget", i18n.t("act_added_expense", { defaultValue: "Xarajat qo'shdi" }), x.izoh || "", toTs(x.sana, x.vaqt), "x" + x.id);
  // Daromad
  for (const d of dar) push(d.uid, "budget", i18n.t("act_added_income", { defaultValue: "Daromad qo'shdi" }), d.izoh || "", toTs(d.sana, d.vaqt), "d" + d.id);
  // Maqsad yaratildi + hissa
  for (const m of maq) {
    push(m.uid, "goals", i18n.t("act_created_goal", { defaultValue: "Maqsad yaratdi" }), m.ism || "", toTs(m.createdAt), "mg" + m.id);
    if (m.lastContrib && m.lastContrib.uid && m.lastContrib.sana)
      push(m.lastContrib.uid, "goals", i18n.t("act_added_to_goal", { defaultValue: "Maqsadga pul qo'shdi" }), m.ism || "", toTs(m.lastContrib.sana, m.lastContrib.vaqt), "mc" + m.id + (m.lastContrib.sana || ""));
  }
  // Qarz qo'shildi + qaytarildi
  for (const q of qarzlar) {
    push(q.uid, "debt", i18n.t("act_added_debt", { defaultValue: "Qarz qo'shdi" }), q.kim || q.izoh || "", toTs(q.sana), "qn" + q.id);
    if (q.paid && q.paidSana) push(q.uid, "debt", i18n.t("act_repaid_debt", { defaultValue: "Qarzni qaytardi" }), q.kim || "", toTs(q.paidSana), "qp" + q.id);
  }
  // Vazifa: berildi / bajarildi / tasdiqlandi
  for (const v of vazifalar) {
    if (v.createdBy && v.sana) push(v.createdBy, "tasks", i18n.t("act_assigned_task", { defaultValue: "Vazifa berdi" }), v.title || "", toTs(v.sana), "vn" + v.id);
    if (v.doneSana && v.assignedTo) push(v.assignedTo, "tasks", i18n.t("act_completed_task", { defaultValue: "Vazifani bajardi" }), v.title || "", toTs(v.doneSana), "vd" + v.id);
    if (v.paidSana && v.createdBy) push(v.createdBy, "tasks", i18n.t("act_approved_task", { defaultValue: "Vazifani tasdiqladi" }), v.title || "", toTs(v.paidSana), "vp" + v.id);
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
      res.push({ ...n, _group: true, _count: cnt,
        desc: i18n.t("group_desc", { count: cnt, cat: i18n.t("acat_" + n.cat, { defaultValue: n.cat }).toLowerCase(), defaultValue: `${cnt} items` }) });
      i = j;
    } else { res.push(n); i++; }
  }
  return res;
}

// ── Vaqt bo'yicha bo'limlarga ajratish ──────────────────────
export function groupByTime(list, lg = "uz", now = new Date()) {
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
  const L = {
    today: i18n.t("today", { defaultValue: "Today" }),
    yest: i18n.t("yesterday", { defaultValue: "Yesterday" }),
    week: i18n.t("last_7_days", { defaultValue: "Last 7 days" }),
    month: i18n.t("last_month", { defaultValue: "Last month" }),
    old: i18n.t("older", { defaultValue: "Older" }),
  };
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
