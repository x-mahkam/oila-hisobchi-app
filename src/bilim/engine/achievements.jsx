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
  leaf:   (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 20C4 20 8 12 14 12c3 0 6 3 6 8M14 12c2-4 6-10 8-10-4 2-8 6-8 10z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={c} fillOpacity=".15"/></svg>,
};

// Sessiyalardan fan bo'yicha sanoq
const subjectCount = (sessions, cat) => sessions.filter(x => (x.gameId || "").split("/")[0] === cat).length;

const ladder = (idBase, titles, icon, colors, thresholds, cur) =>
  thresholds.map((goal, i) => ({
    id: idBase + "_" + (i + 1),
    t: titles[i] || titles[titles.length - 1],
    icon,
    color: colors[i] || colors[colors.length - 1],
    cur,
    goal,
  }));

/**
 * @param totals { coins, xp, streak }
 * @param sessions [] (bilim_games_)
 * @returns achievement ro'yxati [{ id, title{uz,ru,en}, icon, color, unlocked, cur, goal }]
 */
export function computeAchievements(totals, sessions = [], lg = "uz", behaviorData = {}) {
  const { xp = 0, streak = 0 } = totals || {};
  const games = sessions.length;

  const colors5 = ["#cd7f32", "#94a3b8", "#f59e0b", "#38bdf8", "#ec4899"]; // Bronze, Silver, Gold, Platinum, Diamond
  const colors6 = ["#cd7f32", "#64748b", "#94a3b8", "#f59e0b", "#38bdf8", "#ec4899"];
  const colors4 = ["#cd7f32", "#94a3b8", "#f59e0b", "#ec4899"];
  const colors3 = ["#cd7f32", "#94a3b8", "#f59e0b"];

  const t_tasks = [
    { uz: "Mehnatkash I", ru: "Труженик I", en: "Worker I" },
    { uz: "Mehnatkash II", ru: "Труженик II", en: "Worker II" },
    { uz: "Mehnatkash III", ru: "Труженик III", en: "Worker III" },
    { uz: "Mehnatkash IV", ru: "Труженик IV", en: "Worker IV" },
    { uz: "Mehnatkash V", ru: "Труженик V", en: "Worker V" },
  ];
  const t_games = [
    { uz: "O'yinboz I", ru: "Игрок I", en: "Gamer I" },
    { uz: "O'yinboz II", ru: "Игрок II", en: "Gamer II" },
    { uz: "O'yinboz III", ru: "Игрок III", en: "Gamer III" },
    { uz: "O'yinboz IV", ru: "Игрок IV", en: "Gamer IV" },
    { uz: "O'yinboz V", ru: "Игрок V", en: "Gamer V" },
  ];
  const t_coins = [
    { uz: "Boyvachcha I", ru: "Богач I", en: "Wealthy I" },
    { uz: "Boyvachcha II", ru: "Богач II", en: "Wealthy II" },
    { uz: "Boyvachcha III", ru: "Богач III", en: "Wealthy III" },
    { uz: "Boyvachcha IV", ru: "Богач IV", en: "Wealthy IV" },
    { uz: "Boyvachcha V", ru: "Богач V", en: "Wealthy V" },
  ];
  const t_xp = [
    { uz: "Bilimdon I", ru: "Знаток I", en: "Scholar I" },
    { uz: "Bilimdon II", ru: "Знаток II", en: "Scholar II" },
    { uz: "Bilimdon III", ru: "Знаток III", en: "Scholar III" },
    { uz: "Bilimdon IV", ru: "Знаток IV", en: "Scholar IV" },
    { uz: "Bilimdon V", ru: "Знаток V", en: "Scholar V" },
  ];
  const t_streak = [
    { uz: "Doimiy I", ru: "Постоянный I", en: "Consistent I" },
    { uz: "Doimiy II", ru: "Постоянный II", en: "Consistent II" },
    { uz: "Doimiy III", ru: "Постоянный III", en: "Consistent III" },
    { uz: "Doimiy IV", ru: "Постоянный IV", en: "Consistent IV" },
    { uz: "Doimiy V", ru: "Постоянный V", en: "Consistent V" },
  ];
  const t_garden = [
    { uz: "Bog'bon I", ru: "Садовник I", en: "Gardener I" },
    { uz: "Bog'bon II", ru: "Садовник II", en: "Gardener II" },
    { uz: "Bog'bon III", ru: "Садовник III", en: "Gardener III" },
    { uz: "Bog'bon IV", ru: "Садовник IV", en: "Gardener IV" },
    { uz: "Bog'bon V", ru: "Садовник V", en: "Gardener V" },
    { uz: "Bog'bon VI", ru: "Садовник VI", en: "Gardener VI" },
  ];
  const t_goals = [
    { uz: "Orzular sari I", ru: "Мечтатель I", en: "Dreamer I" },
    { uz: "Orzular sari II", ru: "Мечтатель II", en: "Dreamer II" },
    { uz: "Orzular sari III", ru: "Мечтатель III", en: "Dreamer III" },
    { uz: "Orzular sari IV", ru: "Мечтатель IV", en: "Dreamer IV" },
  ];
  const t_trades = [
    { uz: "Tadbirkor I", ru: "Предприниматель I", en: "Entrepreneur I" },
    { uz: "Tadbirkor II", ru: "Предприниматель II", en: "Entrepreneur II" },
    { uz: "Tadbirkor III", ru: "Предприниматель III", en: "Entrepreneur III" },
    { uz: "Tadbirkor IV", ru: "Предприниматель IV", en: "Entrepreneur IV" },
  ];
  const t_math = [
    { uz: "Matematika ustasi I", ru: "Мастер математики I", en: "Math master I" },
    { uz: "Matematika ustasi II", ru: "Мастер математики II", en: "Math master II" },
    { uz: "Matematika ustasi III", ru: "Мастер математики III", en: "Math master III" },
  ];
  const t_english = [
    { uz: "Ingliz tili ustasi I", ru: "Мастер английского I", en: "English master I" },
    { uz: "Ingliz tili ustasi II", ru: "Мастер английского II", en: "English master II" },
    { uz: "Ingliz tili ustasi III", ru: "Мастер английского III", en: "English master III" },
  ];
  const t_logic = [
    { uz: "Mantiq ustasi I", ru: "Мастер логики I", en: "Logic master I" },
    { uz: "Mantiq ustasi II", ru: "Мастер логики II", en: "Logic master II" },
    { uz: "Mantiq ustasi III", ru: "Мастер логики III", en: "Logic master III" },
  ];
  const t_finance = [
    { uz: "Moliya ustasi I", ru: "Мастер финансов I", en: "Finance master I" },
    { uz: "Moliya ustasi II", ru: "Мастер финансов II", en: "Finance master II" },
    { uz: "Moliya ustasi III", ru: "Мастер финансов III", en: "Finance master III" },
  ];
  const t_memory = [
    { uz: "Xotira ustasi I", ru: "Мастер памяти I", en: "Memory master I" },
    { uz: "Xotira ustasi II", ru: "Мастер памяти II", en: "Memory master II" },
    { uz: "Xotira ustasi III", ru: "Мастер памяти III", en: "Memory master III" },
  ];

  const list = [
    ...ladder("worker", t_tasks, B.play, colors5, [1, 5, 15, 30, 60], behaviorData.tasksApproved || 0),
    ...ladder("player", t_games, B.play, colors5, [5, 15, 30, 60, 100], games),
    ...ladder("coin", t_coins, B.coin, colors5, [50, 200, 500, 1000, 5000], behaviorData.lifetimeCoins || 0),
    ...ladder("xp", t_xp, B.xp, colors5, [100, 500, 1000, 2500, 5000], xp),
    ...ladder("streak", t_streak, B.flame, colors5, [3, 7, 14, 30, 60], streak),
    ...ladder("garden", t_garden, B.leaf, colors6, [1, 2, 3, 4, 5, 6], behaviorData.gardenLevel || 0),
    ...ladder("goal", t_goals, B.crown, colors4, [1, 3, 5, 10], behaviorData.goalsCompleted || 0),
    ...ladder("trader", t_trades, B.coin, colors4, [1, 5, 10, 20], behaviorData.tradesAccepted || 0),
    ...ladder("math", t_math, B.crown, colors3, [5, 15, 30], subjectCount(sessions, "math")),
    ...ladder("english", t_english, B.crown, colors3, [5, 15, 30], subjectCount(sessions, "english")),
    ...ladder("logic", t_logic, B.brain, colors3, [5, 15, 30], subjectCount(sessions, "logic")),
    ...ladder("finance", t_finance, B.coin, colors3, [5, 15, 30], subjectCount(sessions, "finance")),
    ...ladder("memory", t_memory, B.book, colors3, [5, 15, 30], subjectCount(sessions, "memory")),
  ];

  return list.map(a => ({
    ...a,
    title: a.t[lg] || a.t.uz,
    unlocked: a.cur >= a.goal,
    pct: Math.min(100, Math.round((a.cur / a.goal) * 100)),
  }));
}

export const achievementBadges = B;
