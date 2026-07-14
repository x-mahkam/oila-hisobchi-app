// ═══════════════════════════════════════════════════════════
//  AI SUMMARY — natijadan baholash matni (offline, qoidaviy).
//  Tashqi AI YO'Q — faqat o'yin natijasidan hosila.
//  Har o'yin o'z `subject` (matn andozalari) beradi → reusable.
// ═══════════════════════════════════════════════════════════

// Standart mavzu andozalari (matematika/qo'shish uchun mos, boshqasiga o'zgartiriladi)
export const mathSubject = {
  uz: {
    great: (n) => n + " qo'shish amallarini juda yaxshi bajarmoqda.",
    good: (n) => n + " qo'shishni yaxshi o'zlashtirmoqda.",
    mid: (n) => n + " qo'shishni o'rganmoqda — biroz mashq foydali.",
    low: (n) => n + " ikki xonali sonlarni qo'shishda qiynalmoqda.",
    tipDaily: "Har kuni 5 daqiqa mashq tavsiya qilinadi.",
    tipCombo: "Ketma-ket to'g'ri javoblar zo'r — shu ruhni saqlang!",
    tipSlow: "Shoshilmasdan, aniqlik bilan yechishga undang.",
  },
  ru: {
    great: (n) => n + " отлично справляется со сложением.",
    good: (n) => n + " хорошо освоил(а) сложение.",
    mid: (n) => n + " учится складывать — полезна практика.",
    low: (n) => n + " затрудняется со сложением двузначных чисел.",
    tipDaily: "Рекомендуется 5 минут практики в день.",
    tipCombo: "Серия верных ответов — так держать!",
    tipSlow: "Поощряйте решать точно, не спеша.",
  },
  en: {
    great: (n) => n + " is excellent at addition.",
    good: (n) => n + " has a good grasp of addition.",
    mid: (n) => n + " is learning addition — practice helps.",
    low: (n) => n + " struggles with two-digit addition.",
    tipDaily: "5 minutes of daily practice is recommended.",
    tipCombo: "Great answer streak — keep it up!",
    tipSlow: "Encourage solving accurately, without rushing.",
  },
};

/**
 * @param result { pct, correct, total, maxCombo, difficulty }
 * @param name bola ismi
 * @param lg til
 * @param subject mavzu andozasi (default: math)
 * @returns { verdict, tip } — ikkita jumla
 */
export const buildAISummary = (result, name, lg = "uz", subject = mathSubject) => {
  const S = subject[lg] || subject.uz;
  const who = name || (lg === "uz" ? "Bola" : lg === "ru" ? "Ребёнок" : "The child");
  const pct = result.pct ?? 0;

  let verdict;
  if (pct >= 90) verdict = S.great(who);
  else if (pct >= 70) verdict = S.good(who);
  else if (pct >= 45) verdict = S.mid(who);
  else verdict = (result.difficulty === "hard" || result.difficulty === "medium") ? S.low(who) : S.mid(who);

  let tip;
  if (pct >= 90 && (result.maxCombo || 0) >= 5) tip = S.tipCombo;
  else if (pct < 60) tip = S.tipSlow;
  else tip = S.tipDaily;

  return { verdict, tip };
};
