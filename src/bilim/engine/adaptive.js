// ═══════════════════════════════════════════════════════════
//  ADAPTIVE — moslashuvchi qiyinlik algoritmi (barcha o'yinlar uchun).
//  Sof funksiya: joriy holat + javob → yangi holat.
//  Ketma-ket N to'g'ri → daraja oshadi; M xato → pasayadi.
// ═══════════════════════════════════════════════════════════
export const LEVELS = ["easy", "medium", "hard"];

export const initAdaptive = (start = "easy") => ({
  level: LEVELS.includes(start) ? start : "easy",
  up: 0,     // ketma-ket to'g'ri (oshirish uchun)
  down: 0,   // ketma-ket xato (pasaytirish uchun)
});

/**
 * @param state {level, up, down}
 * @param correct boolean
 * @param opts { upAfter=3, downAfter=2 }
 * @returns yangi state (level o'zgargan bo'lishi mumkin)
 */
export const stepAdaptive = (state, correct, opts = {}) => {
  const upAfter = opts.upAfter ?? 3;
  const downAfter = opts.downAfter ?? 2;
  let { level, up, down } = state;
  const idx = LEVELS.indexOf(level);

  if (correct) {
    up += 1; down = 0;
    if (up >= upAfter && idx < LEVELS.length - 1) { level = LEVELS[idx + 1]; up = 0; }
  } else {
    down += 1; up = 0;
    if (down >= downAfter && idx > 0) { level = LEVELS[idx - 1]; down = 0; }
  }
  return { level, up, down };
};
