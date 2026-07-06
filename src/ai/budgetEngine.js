// ─────────────────────────────────────────────────────────────
//  SMART BUDGET AI — ENGINE (Sprint 3B)
//  100% PURE funksiyalar. I/O yo'q, React yo'q — to'liq test qilinadi.
//  Barcha kirish real ma'lumot: xar (xarajat), dar (daromad), qarzlar,
//  maq (maqsadlar), bdj (byudjet limiti), toy (to'y smetalari).
//  Firebase sxemasi/biznes logikasiga TEGMAYDI — faqat o'qiydi.
// ─────────────────────────────────────────────────────────────

// ── Sana yordamchilari ──────────────────────────────────────
const pad = n => String(n).padStart(2, "0");
/** offset: 0 = shu oy, -1 = o'tgan oy … → "YYYY-MM" */
export function monthKey(offset = 0, base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function daysInMonth(base = new Date()) {
  return new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
}
function monthsBetween(from, toStr) {
  const to = new Date(toStr);
  if (isNaN(to)) return null;
  const d = Math.ceil((to - from) / 86400000);
  return d <= 0 ? 0 : d / 30.44;
}
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const sum = (arr, mine) => arr.reduce((s, x) => s + (mine && !mine(x) ? 0 : Number(x.summa || 0)), 0);
const inMonth = (arr, mk, mine) =>
  arr.filter(x => typeof x.sana === "string" && x.sana.startsWith(mk) && (!mine || mine(x)))
     .reduce((s, x) => s + Number(x.summa || 0), 0);

// ══════════════════════════════════════════════════════════════
//  1) BUDGET HEALTH SCORE
// ══════════════════════════════════════════════════════════════
/**
 * @returns { score 0-100, level, color-key, factors:[{key,state}] }
 * level: excellent | attention | risk | critical
 */
export function budgetHealth({ income = 0, expense = 0, budgetLimit = 0, debtOutstanding = 0, goalMomentum = 0 }) {
  let score = 50;
  const factors = [];

  // Jamg'arma darajasi (eng muhim omil)
  const savingsRate = income > 0 ? (income - expense) / income : (expense > 0 ? -1 : 0);
  if (income > 0) {
    if (savingsRate >= 0) score += Math.min(30, savingsRate * 75);   // 40% → +30
    else score += Math.max(-32, savingsRate * 32);                    // manfiy → jarima
  }
  factors.push({ key: "facSavings", state: savingsRate >= 0.15 ? "good" : savingsRate >= 0 ? "mid" : "bad" });

  // Byudjet ishlatilishi
  if (budgetLimit > 0) {
    const usage = expense / budgetLimit;
    if (usage <= 0.85) score += 10;
    else if (usage <= 1) score += 2;
    else score += Math.max(-25, -(usage - 1) * 60);
    factors.push({ key: "facBudget", state: usage <= 0.85 ? "good" : usage <= 1 ? "mid" : "bad" });
  }

  // Qarz yuki
  const debtRatio = income > 0 ? debtOutstanding / income : (debtOutstanding > 0 ? 2 : 0);
  if (debtOutstanding > 0) {
    score += Math.max(-20, -debtRatio * 10);
    factors.push({ key: "facDebt", state: debtRatio < 0.5 ? "good" : debtRatio < 1.5 ? "mid" : "bad" });
  }

  // Maqsad sur'ati (0..1)
  if (goalMomentum > 0) {
    score += Math.min(10, goalMomentum * 10);
    factors.push({ key: "facGoals", state: goalMomentum >= 0.6 ? "good" : goalMomentum >= 0.3 ? "mid" : "bad" });
  }

  score = Math.round(clamp(score));
  const level = score >= 75 ? "excellent" : score >= 55 ? "attention" : score >= 35 ? "risk" : "critical";
  return { score, level, savingsRate, factors };
}

// ══════════════════════════════════════════════════════════════
//  2) MONTHLY FORECAST
// ══════════════════════════════════════════════════════════════
export function monthlyForecast({ monthExpense = 0, budgetLimit = 0, now = new Date() }) {
  const day = now.getDate();
  const dim = daysInMonth(now);
  if (day < 3 || monthExpense <= 0) {
    return { hasData: false, projected: 0, dailyRate: 0, overBudget: false, daysEarly: 0, hasBudget: budgetLimit > 0 };
  }
  const dailyRate = monthExpense / day;
  const projected = Math.round(dailyRate * dim);
  let overBudget = false, daysEarly = 0, runOutDay = null;
  if (budgetLimit > 0) {
    overBudget = projected > budgetLimit;
    if (dailyRate > 0) {
      runOutDay = budgetLimit / dailyRate;
      if (runOutDay < dim) daysEarly = Math.max(0, Math.round(dim - runOutDay));
    }
  }
  return { hasData: true, projected, dailyRate: Math.round(dailyRate), overBudget, daysEarly, runOutDay, hasBudget: budgetLimit > 0, dim, day };
}

// ══════════════════════════════════════════════════════════════
//  3) EXPENSE TREND (kategoriya bo'yicha, oy vs o'tgan oy)
// ══════════════════════════════════════════════════════════════
/**
 * @param cats [{id,name,color}]
 * @returns [{id,name,color,cur,prev,pct,dir}] — |pct| bo'yicha kamayuvchi
 */
export function expenseTrends({ xar = [], cats = [], mine = null, now = new Date() }) {
  const cur = monthKey(0, now), prev = monthKey(-1, now);
  const rows = cats.map(c => {
    const curV = xar.filter(x => x.kategoriya === c.id && x.sana?.startsWith(cur) && (!mine || mine(x)))
      .reduce((s, x) => s + Number(x.summa || 0), 0);
    const prevV = xar.filter(x => x.kategoriya === c.id && x.sana?.startsWith(prev) && (!mine || mine(x)))
      .reduce((s, x) => s + Number(x.summa || 0), 0);
    let pct;
    if (prevV > 0) pct = Math.round((curV - prevV) / prevV * 100);
    else pct = curV > 0 ? 100 : 0;
    const dir = pct > 5 ? "up" : pct < -5 ? "down" : "flat";
    return { id: c.id, name: c.name, color: c.color, cur: curV, prev: prevV, pct, dir };
  }).filter(r => r.cur > 0 || r.prev > 0);
  rows.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  return rows;
}

/** 3 oy ketma-ket o'sgan kategoriyalar (risk uchun). */
export function risingCategories({ xar = [], cats = [], mine = null, now = new Date() }) {
  const m0 = monthKey(0, now), m1 = monthKey(-1, now), m2 = monthKey(-2, now);
  const s = (cid, mk) => xar.filter(x => x.kategoriya === cid && x.sana?.startsWith(mk) && (!mine || mine(x)))
    .reduce((a, x) => a + Number(x.summa || 0), 0);
  return cats.filter(c => {
    const a = s(c.id, m2), b = s(c.id, m1), d = s(c.id, m0);
    return a > 0 && b > a && d > b;
  }).map(c => c.name);
}

// ══════════════════════════════════════════════════════════════
//  4) SAVINGS COACH
// ══════════════════════════════════════════════════════════════
export function savingsCoach({ income = 0, expense = 0, avgMonthlyExpense = 0 }) {
  if (income <= 0) return { hasData: false, saved: 0, positive: false };
  const saved = income - expense;
  const target = (avgMonthlyExpense || expense) * 3;      // 3 oylik favqulodda fond
  const positive = saved > 0;
  let monthsToFund = null, fundReady = false;
  if (positive && target > 0) {
    monthsToFund = Math.max(1, Math.ceil(target / saved));
    fundReady = target <= 0;
  }
  return { hasData: true, saved: Math.round(saved), positive, monthsToFund, target: Math.round(target), fundReady };
}

// ══════════════════════════════════════════════════════════════
//  8) WEDDING (to'y smetasi integratsiyasi)
// ══════════════════════════════════════════════════════════════
/** @param weddings toy.saved massivi: [{name,total,date,status,snapshot:{savedSum}}] */
export function weddingInsight({ weddings = [], now = new Date() }) {
  const active = weddings
    .filter(w => w && Number(w.total) > 0 && w.status !== "done")
    .map(w => {
      const savedSum = Number(w.snapshot?.savedSum ?? w.savedSum ?? 0);
      const remain = Math.max(0, Number(w.total) - savedSum);
      const months = w.date ? monthsBetween(now, w.date) : null;
      const perMonth = months && months > 0 ? Math.round(remain / months) : remain;
      return { name: w.name || "", total: Number(w.total), savedSum, remain, months, perMonth, onPlan: remain <= 0 };
    })
    .sort((a, b) => (a.months ?? 1e9) - (b.months ?? 1e9));
  return { has: active.length > 0, top: active[0] || null, all: active };
}

// ══════════════════════════════════════════════════════════════
//  9) FAMILY GOALS integratsiyasi
//  computeSmart bilan status oladi (deadline meta bo'lsa), aks holda progress.
// ══════════════════════════════════════════════════════════════
export function familyGoalsInsight({ sharedGoals = [], computeSmart = null, getMeta = null, now = new Date() }) {
  const goals = sharedGoals.filter(g => g && !g.paid && Number(g.maqsad) > 0);
  if (!goals.length) return { has: false, pct: 0, count: 0 };
  let onPlan = 0;
  goals.forEach(g => {
    if (computeSmart && getMeta) {
      const s = computeSmart(g, getMeta(g.id), now);
      const bad = s.status === "overdue" || s.status === "serious";
      if (!bad) onPlan++;
    } else {
      // Fallback: 50%+ progress = rejada
      if (Number(g.jamg || 0) / Number(g.maqsad) >= 0.5 || g.status === "completed") onPlan++;
    }
  });
  return { has: true, pct: Math.round(onPlan / goals.length * 100), count: goals.length };
}

// ══════════════════════════════════════════════════════════════
//  5) RISK DETECTION
// ══════════════════════════════════════════════════════════════
export function riskDetection({ xar = [], cats = [], qarzlar = [], maq = [], mine = null,
  income = 0, monthExpense = 0, budgetLimit = 0, wedding = null, now = new Date() }) {
  const risks = [];

  // (a) 3 oy ketma-ket o'sgan kategoriyalar
  risingCategories({ xar, cats, mine, now }).slice(0, 2).forEach(name => {
    risks.push({ id: "cat_" + name, severity: "warn", key: "riskCatUp", args: [name, 3] });
  });

  // (b) Byudjetdan oshish
  if (budgetLimit > 0 && monthExpense > budgetLimit) {
    risks.push({ id: "overbudget", severity: "danger", key: "riskOverBudget", args: [] });
  }

  // (c) Yuqori qarz yuki
  const debtOut = qarzlar.filter(q => !q.paid && (!mine || !q.uid || mine(q)))
    .reduce((s, q) => s + Number(q.summa || 0), 0);
  if (debtOut > 0 && income > 0 && debtOut / income >= 1.5) {
    risks.push({ id: "debt", severity: "danger", key: "riskDebt", args: [debtOut], fmtArg0: true });
  }

  // (d) Maqsadlarga uzoq vaqt hissa qo'shilmagan
  const active = maq.filter(m => !m.paid && m.status !== "completed" && Number(m.maqsad) > 0);
  if (active.length) {
    const lastContrib = active.reduce((mx, m) => {
      const cs = Array.isArray(m.contribs) ? m.contribs : [];
      const last = cs.length ? Math.max(...cs.map(c => new Date(c.at).getTime() || 0)) : 0;
      return Math.max(mx, last);
    }, 0);
    if (lastContrib > 0) {
      const days = Math.floor((now.getTime() - lastContrib) / 86400000);
      if (days >= 12) risks.push({ id: "goalidle", severity: "warn", key: "riskGoalIdle", args: [days] });
    }
  }

  // (e) To'y jamg'armasi sustlashgan
  if (wedding && wedding.top && !wedding.top.onPlan && wedding.top.perMonth > 0 && (wedding.top.months == null || wedding.top.months < 12)) {
    risks.push({ id: "wedding", severity: "warn", key: "riskWedding", args: [wedding.top.perMonth], fmtArg0: true });
  }

  return risks.slice(0, 4);
}

// ══════════════════════════════════════════════════════════════
//  10) QUICK INSIGHT (kunlik aylanma, deterministik)
// ══════════════════════════════════════════════════════════════
export function quickInsight({ trends = [], savings = null, forecast = null, now = new Date() }) {
  const cands = [];
  const transport = trends.find(t => t.id === "transport");
  if (transport && transport.dir === "up" && transport.cur > 0) {
    cands.push({ key: "qiTransport", args: [Math.round(transport.cur * 0.15)], fmtArg0: true });
  }
  const dine = trends.find(t => t.id === "konil");
  if (dine && dine.dir === "up" && dine.cur > 0) {
    cands.push({ key: "qiDineOut", args: [Math.round(dine.cur * 0.2)], fmtArg0: true });
  }
  if (savings && savings.positive && savings.saved > 0) {
    cands.push({ key: "qiSaveStreak", args: [savings.saved], fmtArg0: true });
  }
  const top = trends[0];
  if (top && top.cur > 0) cands.push({ key: "qiTopCat", args: [top.name] });
  if (forecast && forecast.hasData && !forecast.overBudget) cands.push({ key: "qiOnPace", args: [] });
  if (!cands.length) cands.push({ key: "qiOnPace", args: [] });

  // Kun bo'yicha aylantirish (har kuni boshqa maslahat, lekin barqaror)
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return cands[doy % cands.length];
}

// ══════════════════════════════════════════════════════════════
//  7) REPORTS — AI SUMMARY (jumlalar ro'yxati)
// ══════════════════════════════════════════════════════════════
export function aiSummary({ trends = [], savings = null, forecast = null, now = new Date() }) {
  const out = [];
  const mover = trends.find(t => Math.abs(t.pct) >= 10);
  if (mover) {
    out.push({ key: "sumTrend", args: [mover.name, Math.abs(mover.pct), mover.dir], tone: mover.dir === "up" ? "warn" : "ok" });
  }
  const normal = trends.find(t => t.dir === "flat" && t.cur > 0);
  if (normal) out.push({ key: "sumNormal", args: [normal.name], tone: "ok" });

  if (savings && savings.hasData) {
    out.push(savings.positive
      ? { key: "sumSavingsOk", args: [], tone: "ok" }
      : { key: "sumSavingsBad", args: [], tone: "warn" });
  }
  if (forecast && forecast.hasData && forecast.hasBudget) {
    out.push(forecast.overBudget
      ? { key: "sumBudgetBad", args: [], tone: "warn" }
      : { key: "sumBudgetOk", args: [], tone: "ok" });
  }
  return out.slice(0, 4);
}

// ══════════════════════════════════════════════════════════════
//  MASTER: bitta joydan hamma narsani hisoblab beradi (Dashboard uchun)
// ══════════════════════════════════════════════════════════════
export function computeBudgetAI({
  xar = [], dar = [], qarzlar = [], maq = [], cats = [],
  budgetLimit = 0, mine = null, weddings = [], sharedGoals = [],
  computeSmart = null, getMeta = null, now = new Date(),
}) {
  const cur = monthKey(0, now);
  const income = inMonth(dar, cur, mine);
  const expense = inMonth(xar, cur, mine);
  const debtOutstanding = qarzlar.filter(q => !q.paid && (!mine || !q.uid || mine(q)))
    .reduce((s, q) => s + Number(q.summa || 0), 0);

  // 6 oylik o'rtacha xarajat (favqulodda fond uchun)
  let hist = 0, hn = 0;
  for (let i = 1; i <= 6; i++) { const mk = monthKey(-i, now); const v = inMonth(xar, mk, mine); if (v > 0) { hist += v; hn++; } }
  const avgMonthlyExpense = hn ? hist / hn : expense;

  // Maqsad sur'ati (oxirgi 30 kun ichida hissa qo'shilgan aktiv maqsadlar ulushi)
  const activeGoals = maq.filter(m => !m.paid && m.status !== "completed" && Number(m.maqsad) > 0);
  let goalMomentum = 0;
  if (activeGoals.length) {
    const recent = activeGoals.filter(m => {
      const cs = Array.isArray(m.contribs) ? m.contribs : [];
      return cs.some(c => (now.getTime() - (new Date(c.at).getTime() || 0)) < 30 * 86400000);
    }).length;
    goalMomentum = recent / activeGoals.length;
  }

  const health = budgetHealth({ income, expense, budgetLimit, debtOutstanding, goalMomentum });
  const forecast = monthlyForecast({ monthExpense: expense, budgetLimit, now });
  const trends = expenseTrends({ xar, cats, mine, now });
  const savings = savingsCoach({ income, expense, avgMonthlyExpense });
  const wedding = weddingInsight({ weddings, now });
  const family = familyGoalsInsight({ sharedGoals, computeSmart, getMeta, now });
  const risks = riskDetection({ xar, cats, qarzlar, maq, mine, income, monthExpense: expense, budgetLimit, wedding, now });
  const insight = quickInsight({ trends, savings, forecast, now });
  const summary = aiSummary({ trends, savings, forecast, now });

  return { income, expense, debtOutstanding, avgMonthlyExpense, goalMomentum,
    health, forecast, trends, savings, wedding, family, risks, insight, summary };
}
