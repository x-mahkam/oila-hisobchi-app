// ═══════════════════════════════════════════════════════════
//  ADDITION GENERATOR — qo'shish savollari.
//  Interfeys: generator(difficulty) → { prompt, answer, options[4] }
//  Bu interfeys barcha "quiz" o'yinlari uchun standart (reusable).
//  Easy 1–10 · Medium 10–50 · Hard 50–200.
// ═══════════════════════════════════════════════════════════
const RANGES = {
  easy:   [1, 10],
  medium: [10, 50],
  hard:   [50, 200],
};

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const additionGenerator = (difficulty = "easy") => {
  const [min, max] = RANGES[difficulty] || RANGES.easy;
  const a = rnd(min, max);
  const b = rnd(min, max);
  const answer = a + b;

  // 3 ta ishonchli chalg'ituvchi (takrorlanmas, manfiy emas)
  const opts = new Set([answer]);
  let guard = 0;
  while (opts.size < 4 && guard < 40) {
    guard++;
    const delta = rnd(1, Math.max(3, Math.round((max) * 0.15)));
    const cand = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (cand >= 0 && cand !== answer) opts.add(cand);
  }
  // zaxira: agar yetmasa
  let extra = answer + 1;
  while (opts.size < 4) { if (extra !== answer && extra >= 0) opts.add(extra); extra++; }

  return {
    prompt: a + " + " + b + " = ?",
    answer,
    options: shuffle([...opts]).slice(0, 4),
    meta: { a, b, difficulty },
  };
};
