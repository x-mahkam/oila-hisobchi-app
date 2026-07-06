// ═══════════════════════════════════════════════════════════
//  SCORING — ball/coin mantiqi (barcha o'yinlar uchun reusable).
//  Sof funksiyalar. Standart sozlama brifga mos:
//   • to'g'ri javob: +10
//   • ketma-ket 5 (combo): +20 bonus
//   • perfect (barchasi to'g'ri): +50 bonus
// ═══════════════════════════════════════════════════════════
export const DEFAULT_SCORING = {
  perCorrect: 10,
  comboEvery: 5,   // har 5 ketma-ketlikda
  comboBonus: 20,
  perfectBonus: 50,
};

export const initScore = () => ({
  correct: 0, wrong: 0, combo: 0, maxCombo: 0, coins: 0, comboHits: 0,
});

/**
 * Bitta javobni hisobga olish.
 * @returns { state, gained } — gained: shu javobda topilgan coin (animatsiya uchun)
 */
export const applyAnswer = (state, correct, cfg = DEFAULT_SCORING) => {
  const s = { ...state };
  let gained = 0;
  if (correct) {
    s.correct += 1;
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    gained += cfg.perCorrect;
    if (cfg.comboEvery > 0 && s.combo % cfg.comboEvery === 0) { gained += cfg.comboBonus; s.comboHits += 1; }
  } else {
    s.wrong += 1;
    s.combo = 0;
  }
  s.coins += gained;
  return { state: s, gained };
};

/** O'yin oxiri: perfect bonusni qo'shish. */
export const finalizeScore = (state, total, cfg = DEFAULT_SCORING) => {
  const s = { ...state };
  const perfect = total > 0 && s.correct === total && s.wrong === 0;
  if (perfect) s.coins += cfg.perfectBonus;
  const pct = total > 0 ? Math.round(s.correct / total * 100) : 0;
  return { ...s, perfect, pct, total, perfectBonus: perfect ? cfg.perfectBonus : 0 };
};
