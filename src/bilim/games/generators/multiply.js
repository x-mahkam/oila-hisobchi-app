// ═══════════════════════════════════════════════════════════
//  MULTIPLICATION GENERATOR — ko'paytirish savollari.
//  Interfeys: generator(difficulty) → { prompt, answer, options[4] }
//  Easy [2-9] x [2-5] · Medium [2-10] x [2-10] · Hard [10-20] x [2-12].
// ═══════════════════════════════════════════════════════════
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const multiplyGenerator = (difficulty = "easy") => {
  let a, b;
  if (difficulty === "easy") {
    a = rnd(2, 9);
    b = rnd(2, 5);
  } else if (difficulty === "medium") {
    a = rnd(2, 10);
    b = rnd(2, 10);
  } else {
    a = rnd(10, 20);
    b = rnd(2, 12);
  }
  
  const answer = a * b;

  // 3 ta ishonchli chalg'ituvchi (takrorlanmas, manfiy emas)
  const opts = new Set([answer]);
  let guard = 0;
  const maxFactor = Math.max(a, b);
  while (opts.size < 4 && guard < 50) {
    guard++;
    // Distractors close to multiplication results, e.g. a * (b +- 1) or a * b +- small step
    const delta = rnd(1, 3) * (Math.random() < 0.5 ? a : b);
    const step = rnd(1, 5);
    const cand = Math.random() < 0.5 ? answer + delta : Math.random() < 0.5 ? answer - delta : Math.random() < 0.5 ? answer + step : answer - step;
    if (cand > 0 && cand !== answer) opts.add(cand);
  }
  // zaxira: agar yetmasa
  let extra = answer + 1;
  while (opts.size < 4) { if (extra !== answer && extra > 0) opts.add(extra); extra++; }

  return {
    prompt: a + " × " + b + " = ?",
    answer,
    options: shuffle([...opts]).slice(0, 4),
    meta: { a, b, difficulty },
  };
};
