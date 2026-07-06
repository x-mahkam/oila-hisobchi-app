// ═══════════════════════════════════════════════════════════
//  SMART GOALS — computation engine (PURE, no React / no I/O)
//  ───────────────────────────────────────────────────────────
//  Kirish: (goal, meta, now)  →  Chiqish: barcha SMART ko'rsatkichlar.
//  Barcha hisob real ma'lumotdan: goal.jamg, goal.maqsad,
//  goal.createdAt, goal.contribs (real hissa tarixi), meta.deadline.
//  Firebase yoki App state'ga bog'liq emas → 100% test qilinadigan.
// ═══════════════════════════════════════════════════════════

import { T } from "./i18n.js";

const DAY = 24 * 60 * 60 * 1000;
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const toDate = s => { const d = new Date(s); return isNaN(d) ? null : d; };
const dayStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysBetween = (a, b) => Math.round((dayStart(b) - dayStart(a)) / DAY);

/** Health holati kalitlari — UI ranglari shu asosda tanlanadi. */
export const STATUS = {
  ON_TRACK: "onTrack",
  AHEAD:    "ahead",
  SLIGHTLY: "slightly",
  SERIOUS:  "serious",
  OVERDUE:  "overdue",
  DONE:     "done",
};

/**
 * computeSmart(goal, meta, now = new Date())
 * → {
 *     progress, remaining, complete,
 *     hasDeadline, deadline, overdue,
 *     daysLeft, weeksLeft, monthsLeft,
 *     perDay, perWeek, perMonth,
 *     expectedByNow, deltaAmount, behindDays,
 *     status, healthScore,
 *     pace: { ratePerDay, hasPace },
 *     prediction: { hasPace, finishDate, diffDays, onTime },
 *   }
 */
export function computeSmart(goal, meta = {}, now = new Date()) {
  const maqsad = Math.max(0, Number(goal?.maqsad) || 0);
  const jamg = Math.max(0, Number(goal?.jamg) || 0);
  const progress = maqsad > 0 ? clamp((jamg / maqsad) * 100) : 0;
  const remaining = Math.max(0, maqsad - jamg);
  const complete = maqsad > 0 && jamg >= maqsad;

  const created = toDate(goal?.createdAt) || toDate(firstContribAt(goal)) || now;
  const deadline = toDate(meta?.deadline);
  const hasDeadline = !!deadline;

  // ── Elapsed / left (kun) ──
  const daysElapsed = Math.max(0, daysBetween(created, now));
  const daysLeftRaw = hasDeadline ? daysBetween(now, deadline) : null;
  const daysLeft = hasDeadline ? Math.max(0, daysLeftRaw) : null;
  const overdue = hasDeadline && daysLeftRaw < 0 && !complete;
  const weeksLeft = hasDeadline ? Math.max(0, Math.ceil(daysLeft / 7)) : null;
  const monthsLeft = hasDeadline ? Math.max(0, Math.ceil(daysLeft / 30)) : null;

  // ── Yig'ish rejasi (muddatga aynan yetish uchun) ──
  const dDiv = Math.max(1, daysLeft || 0);
  const wDiv = Math.max(1, weeksLeft || 0);
  const mDiv = Math.max(1, monthsLeft || 0);
  const perDay = hasDeadline && !complete ? Math.ceil(remaining / dDiv) : 0;
  const perWeek = hasDeadline && !complete ? Math.ceil(remaining / wDiv) : 0;
  const perMonth = hasDeadline && !complete ? Math.ceil(remaining / mDiv) : 0;

  // ── Jadval bo'yicha kutilgan summa ──
  const daysTotal = hasDeadline ? Math.max(1, daysBetween(created, deadline)) : null;
  const elapsedRatio = hasDeadline ? clamp(daysElapsed / daysTotal, 0, 1) : null;
  const expectedByNow = hasDeadline ? Math.round(maqsad * elapsedRatio) : null;
  const deltaAmount = hasDeadline ? Math.round(jamg - expectedByNow) : null; // + oldinda, − ortda

  // "Necha kun ortdasiz": jamg'ga jadval bo'yicha yetish kerak bo'lgan kun
  let behindDays = 0;
  if (hasDeadline && maqsad > 0) {
    const shouldHaveDay = daysTotal * (jamg / maqsad); // shu summaga rejada qaysi kun yetiladi
    behindDays = Math.round(daysElapsed - shouldHaveDay); // + ortda, − oldinda
  }

  // ── Pace (real sur'at) — contribs yoki jamg/elapsed ──
  const ratePerDay = pacePerDay(goal, created, now, daysElapsed);
  const hasPace = ratePerDay > 0 && remaining > 0;

  // ── Prediction ──
  let prediction = { hasPace: false, finishDate: null, diffDays: null, onTime: false };
  if (complete) {
    prediction = { hasPace: true, finishDate: toDate(goal?.completedAt) || now, diffDays: 0, onTime: true, complete: true };
  } else if (hasPace) {
    const daysToFinish = Math.ceil(remaining / ratePerDay);
    const finishDate = new Date(dayStart(now).getTime() + daysToFinish * DAY);
    const diffDays = hasDeadline ? daysBetween(finishDate, deadline) : null; // + oldin, − kech
    prediction = {
      hasPace: true,
      finishDate,
      daysToFinish,
      diffDays,
      onTime: hasDeadline ? Math.abs(diffDays) <= 2 : true,
    };
  }

  // ── Status + Health Score ──
  const { status, healthScore } = healthOf({
    complete, overdue, hasDeadline, progress, deltaAmount, maqsad,
    behindDays, prediction,
  });

  return {
    maqsad, jamg, progress, remaining, complete,
    hasDeadline, deadline, overdue,
    daysElapsed, daysLeft, weeksLeft, monthsLeft,
    perDay, perWeek, perMonth,
    expectedByNow, deltaAmount, behindDays,
    status, healthScore,
    pace: { ratePerDay, hasPace },
    prediction,
    lastContribDaysAgo: lastContribDaysAgo(goal, now),
  };
}

// ── Yordamchilar ────────────────────────────────────────────
function firstContribAt(goal) {
  const c = Array.isArray(goal?.contribs) ? goal.contribs : [];
  return c.length ? c[0].at : null;
}

function pacePerDay(goal, created, now, daysElapsed) {
  const contribs = Array.isArray(goal?.contribs) ? goal.contribs : [];
  const jamg = Math.max(0, Number(goal?.jamg) || 0);
  // Contribs bo'lsa: birinchi hissadan bugungacha bo'lgan real oyna
  if (contribs.length) {
    const first = toDate(contribs[0].at) || created;
    const span = Math.max(1, daysBetween(first, now) || 1);
    const sum = contribs.reduce((s, c) => s + (Number(c.summa) || 0), 0);
    return sum / span;
  }
  // Fallback: jamg / elapsed
  if (jamg > 0 && daysElapsed > 0) return jamg / daysElapsed;
  return 0;
}

function lastContribDaysAgo(goal, now) {
  const contribs = Array.isArray(goal?.contribs) ? goal.contribs : [];
  if (!contribs.length) return null;
  const last = toDate(contribs[contribs.length - 1].at);
  if (!last) return null;
  return Math.max(0, daysBetween(last, now));
}

function healthOf({ complete, overdue, hasDeadline, progress, deltaAmount, maqsad, behindDays, prediction }) {
  if (complete) return { status: STATUS.DONE, healthScore: 100 };
  if (overdue)  return { status: STATUS.OVERDUE, healthScore: 15 };
  if (!hasDeadline) {
    // Muddatsiz: faqat progress asosida yumshoq baho
    return { status: progress >= 50 ? STATUS.ON_TRACK : STATUS.SLIGHTLY, healthScore: Math.round(clamp(40 + progress * 0.4)) };
  }
  // Jadval bo'yicha nisbatan chetlanish (maqsadga nisbatan foizda)
  const deltaPct = maqsad > 0 ? (deltaAmount / maqsad) * 100 : 0; // + oldinda, − ortda
  // Health score: 70 = aynan rejada; oldinda → yuqori; ortda → past
  let score = clamp(Math.round(70 + deltaPct * 1.5));
  let status;
  if (deltaPct >= 3) status = STATUS.AHEAD;
  else if (deltaPct >= -3) status = STATUS.ON_TRACK;
  else if (deltaPct >= -15) status = STATUS.SLIGHTLY;
  else status = STATUS.SERIOUS;
  // Prediction kech bo'lsa, statusni yomonlashtirmaydi lekin scoreni biroz pasaytiradi
  if (prediction?.diffDays != null && prediction.diffDays < -14 && status === STATUS.ON_TRACK) {
    status = STATUS.SLIGHTLY; score = Math.min(score, 60);
  }
  return { status, healthScore: score };
}

/**
 * buildTimeline(goal, meta) → sana bo'yicha tartiblangan hodisalar.
 * Real manbalar: createdAt, contribs[], completedAt (Firebase).
 * Lokal manbalar: meta.events (edited / deadline).
 */
export function buildTimeline(goal, meta = {}, lg = "uz") {
  const items = [];
  if (goal?.createdAt) items.push({ type: "created", at: normAt(goal.createdAt), label: T("evCreated", lg) });

  (Array.isArray(meta?.events) ? meta.events : []).forEach(e => {
    if (e.t === "deadline") items.push({ type: "deadline", at: e.at, label: T("evDeadline", lg) });
    else if (e.t === "edited") items.push({ type: "edited", at: e.at, label: T("evEdited", lg) });
  });

  (Array.isArray(goal?.contribs) ? goal.contribs : []).forEach(c => {
    items.push({ type: "added", at: c.at, label: T("evAdded", lg), amount: Number(c.summa) || 0, who: c.ism || "" });
  });

  if (goal?.completedAt) items.push({ type: "done", at: normAt(goal.completedAt), label: T("evDone", lg) });

  return items
    .filter(i => i.at)
    .sort((a, b) => new Date(a.at) - new Date(b.at));
}

function normAt(s) {
  // "YYYY-MM-DD" → ISO (kun boshi), aks holda o'zicha
  if (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s + "T00:00:00.000Z";
  return s;
}

/**
 * aiTips(smart, goal, lg, f) → [{ tone, text }]
 * tone: "danger" | "warn" | "ok" | "info"
 * f — ilova formatteri (summa uchun), majburiy.
 */
export function aiTips(smart, goal, lg, f) {
  const tips = [];
  const fm = (n) => (typeof f === "function" ? f(n, true) : String(n));

  if (smart.complete) { tips.push({ tone: "ok", text: T("aiDone", lg) }); return tips; }

  if (!smart.hasDeadline) {
    tips.push({ tone: "info", text: T("aiSetDeadline", lg) });
    return tips;
  }

  if (smart.overdue) {
    tips.push({ tone: "danger", text: T("aiOverdue", lg) });
  }

  // Uzoq vaqt hissa yo'q
  if (smart.lastContribDaysAgo != null && smart.lastContribDaysAgo >= 12) {
    tips.push({ tone: "warn", text: T("aiNoContrib", lg, smart.lastContribDaysAgo) });
  }

  // Ortda / oldinda
  if (smart.status === STATUS.SERIOUS || smart.status === STATUS.SLIGHTLY) {
    if (smart.behindDays > 0) tips.push({ tone: smart.status === STATUS.SERIOUS ? "danger" : "warn", text: T("aiBehindDays", lg, smart.behindDays) });
    if (smart.perMonth > 0) tips.push({ tone: "info", text: T("aiAddMonthly", lg, fm(smart.perMonth)) });
  } else if (smart.status === STATUS.AHEAD && smart.prediction?.diffDays > 0) {
    tips.push({ tone: "ok", text: T("aiAheadDays", lg, smart.prediction.diffDays) });
  } else if (smart.status === STATUS.ON_TRACK) {
    tips.push({ tone: "ok", text: T("aiKeepGoing", lg) });
  }

  return tips.slice(0, 3);
}
