// ═══════════════════════════════════════════════════════════
//  DIVISION GENERATOR — bo'lish savollari (bo'linuvchi butun chiqadi).
//  Interfeys: generator(difficulty) → { prompt, answer, options[4] }
//  Easy: b in [1-5], c in [2-5] -> a = b * c -> prompt: a / c = b
//  Medium: b in [2-10], c in [2-10] -> a = b * c -> prompt: a / c = b
//  Hard: b in [5-20], c in [2-12] -> a = b * c -> prompt: a / c = b
// ═══════════════════════════════════════════════════════════
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const divisionGenerator = (difficulty = "easy") => {
  let answer, divisor; // b (answer), c (divisor) -> a (prompt)
  if (difficulty === "easy") {
    answer = rnd(1, 5);
    divisor = rnd(2, 5);
  } else if (difficulty === "medium") {
    answer = rnd(2, 10);
    divisor = rnd(2, 10);
  } else {
    answer = rnd(5, 20);
    divisor = rnd(2, 12);
  }

  const dividend = answer * divisor;

  // 3 ta ishonchli chalg'ituvchi (takrorlanmas, manfiy emas)
  const opts = new Set([answer]);
  let guard = 0;
  while (opts.size < 4 && guard < 50) {
    guard++;
    const delta = rnd(1, 3);
    const cand = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (cand > 0 && cand !== answer) opts.add(cand);
  }
  // zaxira: agar yetmasa
  let extra = answer + 1;
  while (opts.size < 4) { if (extra !== answer && extra > 0) opts.add(extra); extra++; }

  return {
    prompt: dividend + " ÷ " + divisor + " = ?",
    answer,
    options: shuffle([...opts]).slice(0, 4),
    meta: { dividend, divisor, difficulty },
  };
};
