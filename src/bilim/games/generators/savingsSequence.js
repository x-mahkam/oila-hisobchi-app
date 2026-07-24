import { f } from "../../../utils/formatters.js";

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const savingsSequenceGenerator = (difficulty = "easy") => {
  let startValue = 5000;
  let step = 5000;
  let weeksCount = 3;
  let isGeometric = false;

  if (difficulty === "easy") {
    const starts = [2000, 5000, 10000];
    const steps = [1000, 2000, 5000];
    startValue = starts[rnd(0, starts.length - 1)];
    step = steps[rnd(0, steps.length - 1)];
    weeksCount = 3;
  } else if (difficulty === "medium") {
    const starts = [3000, 6000, 10000, 15000];
    const steps = [3000, 4000, 5000, 10000];
    startValue = starts[rnd(0, starts.length - 1)];
    step = steps[rnd(0, steps.length - 1)];
    weeksCount = 4;
  } else {
    // Hard
    weeksCount = 4;
    isGeometric = Math.random() < 0.5;
    if (isGeometric) {
      startValue = [2000, 5000, 10000][rnd(0, 2)];
      step = 2; // multiply by 2 each week
    } else {
      const starts = [10000, 15000, 20000];
      const steps = [7000, 12000, 15000, 20000];
      startValue = starts[rnd(0, starts.length - 1)];
      step = steps[rnd(0, steps.length - 1)];
    }
  }

  // Build the values
  const values = [];
  let current = startValue;
  for (let i = 0; i < weeksCount; i++) {
    values.push(current);
    if (isGeometric) {
      current = current * step;
    } else {
      current = current + step;
    }
  }

  // Goal (Maqsad) is the sum of all weeks or a rounded target higher than last week
  const lastVal = values[values.length - 1];
  const goal = Math.ceil((lastVal * 1.5) / 10000) * 10000;

  // Pick a missing index (0-based)
  const missingIdx = rnd(0, weeksCount - 1);
  const answerVal = values[missingIdx];
  const answer = f(answerVal, true);

  // Generate options
  const opts = new Set([answerVal]);
  let guard = 0;
  while (opts.size < 4 && guard < 50) {
    guard++;
    let cand = answerVal;
    const diff = isGeometric ? answerVal : step;
    const change = [1000, 2000, 5000, diff][rnd(0, 3)];
    cand = Math.random() < 0.5 ? answerVal + change : answerVal - change;
    if (cand > 0 && cand !== answerVal) {
      opts.add(cand);
    }
  }

  // Backup if options are fewer than 4
  let offset = 1000;
  while (opts.size < 4) {
    if (answerVal - offset > 0) opts.add(answerVal - offset);
    opts.add(answerVal + offset);
    offset += 1000;
  }

  const options = shuffle([...opts]).slice(0, 4).map(v => f(v, true));

  // Lokalizatsiyalangan prompt (ilgari faqat o'zbekcha "1-hafta"/"Maqsad" edi)
  const WEEK = { uz: (n) => `${n}-hafta`, ru: (n) => `${n}-неделя`, en: (n) => `Week ${n}`, kk: (n) => `${n}-апта`, ky: (n) => `${n}-жума`, tg: (n) => `Ҳафтаи ${n}`, qr: (n) => `${n}-hápte` };
  const GOAL = { uz: "Maqsad", ru: "Цель", en: "Goal", kk: "Мақсат", ky: "Максат", tg: "Ҳадаф", qr: "Maqset" };
  const prompt = {};
  for (const lang of ["uz", "ru", "en", "kk", "ky", "tg", "qr"]) {
    const weeksStr = values.map((v, i) => `${WEEK[lang](i + 1)}: ${i === missingIdx ? "?" : f(v, false)}`).join(", ");
    prompt[lang] = `${weeksStr}. ${GOAL[lang]}: ${f(goal, true)}`;
  }

  return {
    prompt,
    answer,
    options,
    meta: {
      values,
      goal,
      missingIdx,
      answerVal,
      isGeometric,
      step,
      weeksCount,
      difficulty
    }
  };
};
