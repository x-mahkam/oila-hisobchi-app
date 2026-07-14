// ═══════════════════════════════════════════════════════════
//  ACHIEVEMENT MANAGER — umumiy yutuqlar (o'yindan qat'iy nazar).
//  Totals (coin/xp/streak) + sessiyalardan HOSILA. SVG badge, emoji yo'q.
// ═══════════════════════════════════════════════════════════

// Badge SVG'lari (rang bilan)
const B = {
  play:   (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.6" fill={c} fillOpacity=".15"/><path d="M10 8l6 4-6 4V8z" fill={c}/></svg>,
  coin:   (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.6" fill={c} fillOpacity=".15"/><path d="M12 8v8M9 12h6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  xp:     (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  flame:  (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3c1.5 4-2.5 5.5-2.5 9A3.5 3.5 0 0012 15.5 4 4 0 0016 12c0-1.5-.8-3-1.6-3.8.4 1.4-.8 2.3-1.4 2.3.8-3-1-6-1-7.5z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  crown:  (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 8l3 9h10l3-9-4.5 4L12 5 8.5 12 4 8z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  book:   (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 6C10 4 7 3.5 4 3.5v15c3 0 6 .5 8 2 2-1.5 5-2 8-2v-15c-3 0-6 .5-8 2z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".15"/><path d="M12 6v14" stroke={c} strokeWidth="1.3"/></svg>,
  brain:  (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 6a3 3 0 00-3 3c-1.5.5-2 3 0 4-1 2 1 4 3 3.5M15 6a3 3 0 013 3c1.5.5 2 3 0 4 1 2-1 4-3 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M12 5v14" stroke={c} strokeWidth="1.4"/></svg>,
};

// Sessiyalardan fan bo'yicha sanoq
const subjectCount = (sessions, cat) => sessions.filter(x => (x.gameId || "").split("/")[0] === cat).length;

/**
 * @param totals { coins, xp, streak }
 * @param sessions [] (bilim_games_)
 * @returns achievement ro'yxati [{ id, title{uz,ru,en}, icon, color, unlocked, cur, goal }]
 */
export function computeAchievements(totals, sessions = [], lg = "uz", behaviorData = {}) {
  const { coins = 0, xp = 0, streak = 0 } = totals || {};
  const games = sessions.length;
  const list = [
    { id: "first",   t: { uz: "Birinchi o'yin", ru: "Первая игра", en: "First game" }, icon: B.play,  color: "#22c55e", cur: games,  goal: 1 },
    { id: "coin100", t: { uz: "100 Coin", ru: "100 монет", en: "100 Coins" },           icon: B.coin,  color: "#f59e0b", cur: coins,  goal: 100 },
    { id: "xp1000",  t: { uz: "1000 XP", ru: "1000 XP", en: "1000 XP" },                 icon: B.xp,    color: "#8b5cf6", cur: xp,     goal: 1000 },
    { id: "streak7", t: { uz: "7 kun ketma-ket", ru: "7 дней", en: "7-day streak" },     icon: B.flame, color: "#ef4444", cur: streak, goal: 7 },
    { id: "streak10",t: { uz: "10 kun ketma-ket", ru: "10 дней", en: "10-day streak" },  icon: B.flame, color: "#dc2626", cur: streak, goal: 10 },
    { id: "math",    t: { uz: "Matematika ustasi", ru: "Мастер математики", en: "Math master" }, icon: B.crown, color: "#6366f1", cur: subjectCount(sessions, "math"), goal: 10 },
    { id: "english", t: { uz: "Ingliz eksperti", ru: "Эксперт англ.", en: "English expert" },     icon: B.crown, color: "#059669", cur: subjectCount(sessions, "english"), goal: 10 },
    { id: "logic",   t: { uz: "Logic Master", ru: "Мастер логики", en: "Logic Master" }, icon: B.brain, color: "#0ea5e9", cur: subjectCount(sessions, "logic"), goal: 10 },
    
    // Financial Behavior Achievements
    { id: "firstTask",  t: { uz: "Birinchi vazifa", ru: "Первое задание", en: "First task" },       icon: B.play,  color: "#22c55e", cur: behaviorData.tasksApproved || 0, goal: 1 },
    { id: "task10",     t: { uz: "10 ta vazifa",     ru: "10 заданий",     en: "10 tasks" },          icon: B.crown, color: "#16a34a", cur: behaviorData.tasksApproved || 0, goal: 10 },
    { id: "firstGoal",  t: { uz: "Birinchi orzu",    ru: "Первая мечта",   en: "First dream" },       icon: B.xp,    color: "#f59e0b", cur: behaviorData.goalsCompleted || 0, goal: 1 },
    { id: "trader",     t: { uz: "Birinchi savdo",   ru: "Первая сделка",  en: "First trade" },       icon: B.coin,  color: "#0ea5e9", cur: behaviorData.tradesAccepted || 0, goal: 1 },
  ];
  return list.map(a => ({ ...a, title: a.t[lg] || a.t.uz, unlocked: a.cur >= a.goal, pct: Math.min(100, Math.round(a.cur / a.goal * 100)) }));
}

export const achievementBadges = B;
