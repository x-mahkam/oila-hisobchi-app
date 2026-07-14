// ═══════════════════════════════════════════════════════════
//  SMART GOALS — Push Notification ARCHITECTURE
//  ───────────────────────────────────────────────────────────
//  DIQQAT: bu FAQAT arxitektura. Firebase Cloud Messaging (FCM)
//  hali ULANMAGAN. Bu qatlam:
//    1) goal holatidan qaysi bildirishnomalar "kerak"ligini hisoblaydi
//       (pure scheduler — computeDueNotifications);
//    2) dispatch interfeysini beradi (registerChannel) — default kanal
//       no-op (dev'da console). FCM keyin shu yerga ulanadi;
//    3) dedupe'ni smartStore orqali qiladi (bir xil notif takror emas).
//
//  FCM ULASH NUQTASI (kelajak):
//    import { registerChannel } from "./notifications.js";
//    registerChannel(async (n) => {
//      await sendFcm(n.token, { title: n.title, body: n.body, data: n.data });
//    });
//  Boshqa kod o'zgarmaydi.
// ═══════════════════════════════════════════════════════════

import { T } from "./i18n.js";
import { markNotif, getMeta } from "./smartStore.js";
import { computeSmart, STATUS } from "./smartEngine.js";

// ── Bildirishnoma turlari ───────────────────────────────────
export const NOTIF = {
  SAVE_TODAY:  "save_today",   // Bugun maqsadga pul qo'shing
  BEHIND:      "behind",       // Rejadan ortda qolyapsiz
  DEADLINE_30: "deadline_30",  // Maqsadga 30 kun qoldi
  DEADLINE_7:  "deadline_7",   // Maqsadga 7 kun qoldi
  DONE:        "done",         // Tabriklaymiz!
};

const TITLE = {
  [NOTIF.SAVE_TODAY]:  "ntSaveToday",
  [NOTIF.BEHIND]:      "ntBehind",
  [NOTIF.DEADLINE_30]: "ntDeadline30",
  [NOTIF.DEADLINE_7]:  "ntDeadline7",
  [NOTIF.DONE]:        "ntDone",
};

// ── Dedupe oynasi (kun) — bir notif shu muddatda takrorlanmaydi ──
const DEDUPE_DAYS = {
  [NOTIF.SAVE_TODAY]:  1,    // kunlik
  [NOTIF.BEHIND]:      3,    // 3 kunda bir
  [NOTIF.DEADLINE_30]: 365,  // bir marta
  [NOTIF.DEADLINE_7]:  365,  // bir marta
  [NOTIF.DONE]:        365,  // bir marta
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * computeDueNotifications(goal, now, lg) — PURE.
 * Goal holatidan kerakli notiflar ro'yxati (dedupe HISOBGA olinmagan).
 * → [{ type, key, title, body, data }]
 */
export function computeDueNotifications(goal, now = new Date(), lg = "uz") {
  const meta = getMeta(goal.id);
  const s = computeSmart(goal, meta, now);
  const out = [];
  const push = (type, extra = {}) => out.push({
    type,
    key: goal.id + ":" + type,
    title: T(TITLE[type], lg),
    body: goalBody(goal, type, lg),
    data: { goalId: String(goal.id), type, ...extra },
  });

  if (s.complete) { push(NOTIF.DONE); return out; }
  if (!s.hasDeadline) return out; // muddatsiz maqsad → jadval notiflari yo'q

  if (s.daysLeft === 30) push(NOTIF.DEADLINE_30);
  if (s.daysLeft === 7)  push(NOTIF.DEADLINE_7);

  if (s.status === STATUS.SERIOUS || s.status === STATUS.SLIGHTLY || s.overdue) push(NOTIF.BEHIND);

  // Kunlik eslatma: faol maqsad va bugun hali hissa qo'shilmagan
  if (!fundedToday(goal, now) && !s.overdue) push(NOTIF.SAVE_TODAY);

  return out;
}

function goalBody(goal, type, lg) {
  const name = goal?.ism || "";
  if (type === NOTIF.DONE) return name;
  return name;
}

function fundedToday(goal, now) {
  const contribs = Array.isArray(goal?.contribs) ? goal.contribs : [];
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  return contribs.some(c => { const t = new Date(c.at); return !isNaN(t) && t >= d0; });
}

// ── Dispatch qatlami (pluggable channel) ────────────────────
let _channel = null;

/** FCM (yoki boshqa) kanalni ro'yxatdan o'tkazish. */
export function registerChannel(fn) { _channel = fn; }

/** Default kanal: dev'da log, prod'da jim (FCM ulanmagani uchun). */
function defaultChannel(n) {
  if (typeof window !== "undefined" && import.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
    console.info("[notif:preview]", n.type, "→", n.title, n.data);
  }
}

/**
 * dispatchDue(goals, now, lg) — dedupe bilan yuboradi (arxitektura).
 * Real yuborish _channel orqali (hozircha no-op). Returns yuborilganlar.
 */
export function dispatchDue(goals = [], now = new Date(), lg = "uz") {
  const sent = [];
  for (const g of goals) {
    const due = computeDueNotifications(g, now, lg);
    for (const n of due) {
      const meta = getMeta(g.id);
      const last = meta.notif?.[n.type];
      const win = (DEDUPE_DAYS[n.type] || 1) * DAY;
      if (last && (now - new Date(last)) < win) continue; // dedupe
      try { (_channel || defaultChannel)(n); } catch {}
      markNotif(g.id, n.type);
      sent.push(n);
    }
  }
  return sent;
}

/**
 * previewSchedule(goal, now, lg) — UI uchun: bu maqsad bo'yicha
 * rejalashtirilgan/keladigan notiflar ro'yxati (yuborilmaydi).
 */
export function previewSchedule(goal, now = new Date(), lg = "uz") {
  const meta = getMeta(goal.id);
  const s = computeSmart(goal, meta, now);
  const items = [];
  const add = (type, when) => items.push({ type, title: T(TITLE[type], lg), when });

  if (s.complete) { add(NOTIF.DONE, "now"); return items; }
  add(NOTIF.SAVE_TODAY, "daily");
  if (s.status !== STATUS.ON_TRACK && s.status !== STATUS.AHEAD) add(NOTIF.BEHIND, "active");
  if (s.hasDeadline && !s.overdue) {
    // Faqat muddat haqiqatan yaqinlashganda ko'rsatiladi (uzoq muddatda chalkashlik bo'lmasin).
    if (s.daysLeft <= 7) add(NOTIF.DEADLINE_7, s.daysLeft + " " + T("day", lg));
    else if (s.daysLeft <= 30) add(NOTIF.DEADLINE_30, s.daysLeft + " " + T("day", lg));
  }
  return items;
}
