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

// ── Timeline toifalari (spec bo'yicha) ──────────────────────
export const ACATS = ["budget", "goals", "debt", "tasks", "garden", "family", "premium", "ai", "notification"];
export const ACAT_LABEL = {
  budget:       { uz: "Byudjet",   ru: "Бюджет",  en: "Budget" },
  goals:        { uz: "Maqsad",    ru: "Цель",    en: "Goal" },
  debt:         { uz: "Qarz",      ru: "Долг",    en: "Debt" },
  tasks:        { uz: "Vazifa",    ru: "Задача",  en: "Task" },
  garden:       { uz: "Bog'",      ru: "Сад",     en: "Garden" },
  family:       { uz: "Oila",      ru: "Семья",   en: "Family" },
  premium:      { uz: "Premium",   ru: "Premium", en: "Premium" },
  ai:           { uz: "AI",        ru: "AI",      en: "AI" },
  notification: { uz: "Bildirishnoma", ru: "Уведомл.", en: "Notification" },
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
  const uz = lg === "uz", ru = lg === "ru";
  return {
    budget:  uz ? "Hisobotni ochish" : ru ? "Открыть отчёт" : "Open report",
    goals:   uz ? "Maqsadni ochish" : ru ? "Открыть цель" : "Open goal",
    debt:    uz ? "Qarzni ochish" : ru ? "Открыть долг" : "Open debt",
    tasks:   uz ? "Vazifaga o'tish" : ru ? "К задаче" : "Go to task",
    garden:  uz ? "Bog'ga o'tish" : ru ? "В сад" : "Go to garden",
    family:  uz ? "Oilaga o'tish" : ru ? "К семье" : "Go to family",
    premium: "Premium",
    ai:      uz ? "Foydali tahlil" : ru ? "Полезный анализ" : "Useful analysis",
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
export const relTime = (ts, lg = "uz", now = Date.now()) => {
  const uz = lg === "uz", ru = lg === "ru";
  const d = Math.max(0, now - ts), min = Math.floor(d / 60000), hr = Math.floor(d / 3600000), day = Math.floor(d / 86400000);
  if (min < 1) return uz ? "Hozir" : ru ? "Сейчас" : "Now";
  if (min < 60) return uz ? min + " daqiqa oldin" : ru ? min + " мин назад" : min + "m ago";
  if (hr < 24) return uz ? hr + " soat oldin" : ru ? hr + " ч назад" : hr + "h ago";
  if (day === 1) return uz ? "Kecha" : ru ? "Вчера" : "Yesterday";
  if (day < 7) return uz ? day + " kun oldin" : ru ? day + " дн назад" : day + "d ago";
  if (day < 31) return uz ? Math.floor(day / 7) + " hafta oldin" : ru ? Math.floor(day / 7) + " нед назад" : Math.floor(day / 7) + "w ago";
  return uz ? Math.floor(day / 30) + " oy oldin" : ru ? Math.floor(day / 30) + " мес назад" : Math.floor(day / 30) + "mo ago";
};
export const clockTime = (ts, lg = "uz") => {
  try { return new Date(ts).toLocaleTimeString(lg === "ru" ? "ru-RU" : lg === "en" ? "en-US" : "uz-UZ", { hour: "2-digit", minute: "2-digit" }); }
  catch (e) { return ""; }
};

// ── Barcha faoliyatni mavjud ma'lumotdan HOSILA qilish ──────
export function deriveActivities({ xar = [], dar = [], maq = [], qarzlar = [], vazifalar = [], azolar = [], acts = [], lg = "uz" }) {
  const uz = lg === "uz";
  const byId = {}; azolar.forEach(a => { byId[a.id] = a; });
  const who = (uid) => { const a = byId[uid]; return { uid, name: a ? fullName(a) : (uz ? "A'zo" : "Member"), photo: a ? a.photo : null }; };
  const out = [];
  const push = (uid, cat, action, desc, ts, ref) => { const w = who(uid); out.push({ id: cat + "_" + (ref ?? ts) + "_" + uid, ...w, cat, action, desc, ts }); };

  // Xarajat
  for (const x of xar) push(x.uid, "budget", uz ? "Xarajat qo'shdi" : "Added expense", x.izoh || "", toTs(x.sana, x.vaqt), "x" + x.id);
  // Daromad
  for (const d of dar) push(d.uid, "budget", uz ? "Daromad qo'shdi" : "Added income", d.izoh || "", toTs(d.sana, d.vaqt), "d" + d.id);
  // Maqsad yaratildi + hissa
  for (const m of maq) {
    push(m.uid, "goals", uz ? "Maqsad yaratdi" : "Created a goal", m.ism || "", toTs(m.createdAt), "mg" + m.id);
    if (m.lastContrib && m.lastContrib.uid && m.lastContrib.sana)
      push(m.lastContrib.uid, "goals", uz ? "Maqsadga pul qo'shdi" : "Added to goal", m.ism || "", toTs(m.lastContrib.sana, m.lastContrib.vaqt), "mc" + m.id + (m.lastContrib.sana || ""));
  }
  // Qarz qo'shildi + qaytarildi
  for (const q of qarzlar) {
    push(q.uid, "debt", uz ? "Qarz qo'shdi" : "Added debt", q.kim || q.izoh || "", toTs(q.sana), "qn" + q.id);
    if (q.paid && q.paidSana) push(q.uid, "debt", uz ? "Qarzni qaytardi" : "Repaid debt", q.kim || "", toTs(q.paidSana), "qp" + q.id);
  }
  // Vazifa: berildi / bajarildi / tasdiqlandi
  for (const v of vazifalar) {
    if (v.createdBy && v.sana) push(v.createdBy, "tasks", uz ? "Vazifa berdi" : "Assigned a task", v.title || "", toTs(v.sana), "vn" + v.id);
    if (v.doneSana && v.assignedTo) push(v.assignedTo, "tasks", uz ? "Vazifani bajardi" : "Completed a task", v.title || "", toTs(v.doneSana), "vd" + v.id);
    if (v.paidSana && v.createdBy) push(v.createdBy, "tasks", uz ? "Vazifani tasdiqladi" : "Approved a task", v.title || "", toTs(v.paidSana), "vp" + v.id);
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
  const uz = lg === "uz";
  const res = []; let i = 0;
  while (i < list.length) {
    const n = list[i]; let j = i, cnt = 0;
    while (j < list.length && list[j].uid === n.uid && list[j].cat === n.cat && list[j].action === n.action) { cnt++; j++; }
    if (cnt >= 3) {
      res.push({ ...n, _group: true, _count: cnt,
        desc: uz ? cnt + " ta " + (ACAT_LABEL[n.cat] ? ACAT_LABEL[n.cat].uz.toLowerCase() : "") : cnt + " items" });
      i = j;
    } else { res.push(n); i++; }
  }
  return res;
}

// ── Vaqt bo'yicha bo'limlarga ajratish ──────────────────────
export function groupByTime(list, lg = "uz", now = new Date()) {
  const uz = lg === "uz", ru = lg === "ru";
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
  const L = { today: uz ? "Bugun" : ru ? "Сегодня" : "Today", yest: uz ? "Kecha" : ru ? "Вчера" : "Yesterday",
    week: uz ? "Oxirgi 7 kun" : ru ? "Последние 7 дней" : "Last 7 days", month: uz ? "Oxirgi oy" : ru ? "Последний месяц" : "Last month",
    old: uz ? "Eski" : ru ? "Ранее" : "Older" };
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
