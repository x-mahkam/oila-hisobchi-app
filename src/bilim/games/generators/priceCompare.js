// ═══════════════════════════════════════════════════════════
//  PRICE COMPARE GENERATOR — qaysi biri foydaliroq?
// ═══════════════════════════════════════════════════════════
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const SCENARIOS = [
  {
    icon: "🥛",
    name: { uz: "Sut", ru: "Молоко", en: "Milk", kk: "Сүт", ky: "Сүт", tg: "Шир", qr: "Süt" },
    unit: { uz: "litr", ru: "л", en: "L", kk: "л", ky: "л", tg: "литр", qr: "litr" },
    easy: [
      { q1: 1, p1: 10000, q2: 2, p2: 18000 }, // B is cheaper: 9k vs 10k
      { q1: 1, p1: 12000, q2: 3, p2: 30000 }, // B is cheaper: 10k vs 12k
    ],
    medium: [
      { q1: 1, p1: 10000, q2: 3, p2: 27000 }, // B is cheaper: 9k vs 10k
      { q1: 2, p1: 18000, q2: 5, p2: 40000 }, // B is cheaper: 8k vs 9k
    ],
    hard: [
      { q1: 1.5, p1: 15000, q2: 4, p2: 36000 }, // B is cheaper: 9k vs 10k
      { q1: 2, p1: 19000, q2: 3, p2: 27000 }, // B is cheaper: 9k vs 9.5k
      { q1: 2, p1: 19000, q2: 4, p2: 38000 }, // TENG: 9.5k vs 9.5k
    ]
  },
  {
    icon: "🌾",
    name: { uz: "Guruch", ru: "Рис", en: "Rice", kk: "Күріш", ky: "Күрүч", tg: "Биринҷ", qr: "Kúrish" },
    unit: { uz: "kg", ru: "кг", en: "kg", kk: "кг", ky: "кг", tg: "кг", qr: "kg" },
    easy: [
      { q1: 1, p1: 15000, q2: 2, p2: 26000 }, // B is cheaper: 13k vs 15k
      { q1: 1, p1: 16000, q2: 5, p2: 70000 }, // B is cheaper: 14k vs 16k
      { q1: 2, p1: 30000, q2: 4, p2: 60000 }, // TENG: 15k vs 15k
    ],
    medium: [
      { q1: 3, p1: 45000, q2: 5, p2: 70000 }, // B is cheaper: 14k vs 15k
      { q1: 2, p1: 34000, q2: 4, p2: 64000 }, // B is cheaper: 16k vs 17k
    ],
    hard: [
      { q1: 2.5, p1: 35000, q2: 6, p2: 78000 }, // B is cheaper: 13k vs 14k
      { q1: 3, p1: 48000, q2: 7, p2: 105000 }, // B is cheaper: 15k vs 16k
    ]
  },
  {
    icon: "🧼",
    name: { uz: "Sovun", ru: "Мыло", en: "Soap", kk: "Сабын", ky: "Самын", tg: "Собун", qr: "Sabın" },
    unit: { uz: "dona", ru: "шт", en: "pcs", kk: "дана", ky: "даана", tg: "дона", qr: "dana" },
    easy: [
      { q1: 1, p1: 4000, q2: 3, p2: 9000 }, // B is cheaper: 3k vs 4k
      { q1: 1, p1: 5000, q2: 4, p2: 16000 }, // B is cheaper: 4k vs 5k
    ],
    medium: [
      { q1: 2, p1: 9000, q2: 6, p2: 24000 }, // B is cheaper: 4k vs 4.5k
      { q1: 3, p1: 15000, q2: 5, p2: 22000 }, // B is cheaper: 4.4k vs 5k
      { q1: 2, p1: 8000, q2: 5, p2: 20000 }, // TENG: 4k vs 4k
    ],
    hard: [
      { q1: 4, p1: 18000, q2: 7, p2: 28000 }, // B is cheaper: 4k vs 4.5k
      { q1: 5, p1: 23000, q2: 8, p2: 35000 }, // B is cheaper: 4.37k vs 4.6k
    ]
  },
  {
    icon: "🧃",
    name: { uz: "Sharbat", ru: "Сок", en: "Juice", kk: "Шырын", ky: "Шире", tg: "Шарбат", qr: "Sharbat" },
    unit: { uz: "litr", ru: "л", en: "L", kk: "л", ky: "л", tg: "литр", qr: "litr" },
    easy: [
      { q1: 1, p1: 12000, q2: 2, p2: 20000 }, // B is cheaper: 10k vs 12k
      { q1: 1, p1: 15000, q2: 3, p2: 39000 }, // B is cheaper: 13k vs 15k
      { q1: 2, p1: 24000, q2: 3, p2: 36000 }, // TENG: 12k vs 12k
    ],
    medium: [
      { q1: 2, p1: 24000, q2: 5, p2: 55000 }, // B is cheaper: 11k vs 12k
      { q1: 1.5, p1: 18000, q2: 3, p2: 33000 }, // B is cheaper: 11k vs 12k
    ],
    hard: [
      { q1: 1.5, p1: 19000, q2: 4, p2: 46000 }, // B is cheaper: 11.5k vs 12.6k
      { q1: 2, p1: 25000, q2: 5, p2: 58000 }, // B is cheaper: 11.6k vs 12.5k
    ]
  }
];

export const priceCompareGenerator = (difficulty = "easy") => {
  // select a random scenario
  const sc = SCENARIOS[rnd(0, SCENARIOS.length - 1)];
  const diffList = sc[difficulty] || sc.easy;
  const rawSet = diffList[rnd(0, diffList.length - 1)];

  // sometimes, let's randomize which option is A or B (q1 vs q2)
  const swap = Math.random() < 0.5;
  const itemA = swap ? { q: rawSet.q2, p: rawSet.q2 * (rawSet.p2/rawSet.q2) } : { q: rawSet.q1, p: rawSet.q1 * (rawSet.p1/rawSet.q1) };
  const itemB = swap ? { q: rawSet.q1, p: rawSet.q1 * (rawSet.p1/rawSet.q1) } : { q: rawSet.q2, p: rawSet.q2 * (rawSet.p2/rawSet.q2) };

  // Calculate actual unit price
  const unitPriceA = itemA.p / itemA.q;
  const unitPriceB = itemB.p / itemB.q;

  let correctAnswer = "";
  if (Math.abs(unitPriceA - unitPriceB) < 0.01) {
    correctAnswer = "equal";
  } else if (unitPriceA < unitPriceB) {
    correctAnswer = "A";
  } else {
    correctAnswer = "B";
  }

  // Construct prompt object for localized rendering
  const prompt = {
    uz: `${sc.icon} ${sc.name.uz}:\n🔹 A taklif: ${itemA.q} ${sc.unit.uz} — ${itemA.p.toLocaleString()} so'm\n🔹 B taklif: ${itemB.q} ${sc.unit.uz} — ${itemB.p.toLocaleString()} so'm`,
    ru: `${sc.icon} ${sc.name.ru}:\n🔹 Опция А: ${itemA.q} ${sc.unit.ru} — ${itemA.p.toLocaleString()} сум\n🔹 Опция Б: ${itemB.q} ${sc.unit.ru} — ${itemB.p.toLocaleString()} сум`,
    en: `${sc.icon} ${sc.name.en}:\n🔹 Offer A: ${itemA.q} ${sc.unit.en} — ${itemA.p.toLocaleString()} UZS\n🔹 Offer B: ${itemB.q} ${sc.unit.en} — ${itemB.p.toLocaleString()} UZS`,
    kk: `${sc.icon} ${sc.name.kk}:\n🔹 A ұсынысы: ${itemA.q} ${sc.unit.kk} — ${itemA.p.toLocaleString()} сум\n🔹 B ұсынысы: ${itemB.q} ${sc.unit.kk} — ${itemB.p.toLocaleString()} сум`,
    ky: `${sc.icon} ${sc.name.ky}:\n🔹 A сунушу: ${itemA.q} ${sc.unit.ky} — ${itemA.p.toLocaleString()} сум\n🔹 B сунушу: ${itemB.q} ${sc.unit.ky} — ${itemB.p.toLocaleString()} сум`,
    tg: `${sc.icon} ${sc.name.tg}:\n🔹 Пешниҳоди A: ${itemA.q} ${sc.unit.tg} — ${itemA.p.toLocaleString()} сум\n🔹 Пешниҳоди B: ${itemB.q} ${sc.unit.tg} — ${itemB.p.toLocaleString()} сум`,
    qr: `${sc.icon} ${sc.name.qr}:\n🔹 A usınıs: ${itemA.q} ${sc.unit.qr} — ${itemA.p.toLocaleString()} sum\n🔹 B usınıs: ${itemB.q} ${sc.unit.qr} — ${itemB.p.toLocaleString()} sum`
  };

  // 3 variant: A arzon / B arzon / Teng. "Aniqmas" olib tashlandi — raqamlar
  // to'liq berilganda u HECH QACHON to'g'ri bo'lolmaydi, faqat "tanlamaslik"
  // hiylasini o'rgatardi. Endi uchala variant ham chin javob bo'lishi mumkin.
  const options = [
    { id: "A", text: { uz: "A taklif arzonroq", ru: "Опция А выгоднее", en: "Offer A is cheaper", kk: "A ұсынысы тиімдірек", ky: "A сунушу пайдалуу", tg: "Пешниҳоди A арзонтар", qr: "A usınıs arzanıraq" } },
    { id: "B", text: { uz: "B taklif arzonroq", ru: "Опция Б выгоднее", en: "Offer B is cheaper", kk: "B ұсынысы тиімдірек", ky: "B сунушу пайдалуу", tg: "Пешниҳоди B арзонтар", qr: "B usınıs arzanıraq" } },
    { id: "equal", text: { uz: "Ikkalasi bir xil", ru: "Оба одинаковы", en: "Both are the same", kk: "Екеуі бірдей", ky: "Экөө тең", tg: "Ҳарду якхела", qr: "Ekewi birdey" } }
  ];

  return {
    prompt,
    answer: correctAnswer,
    options: shuffle(options), // pozitsiya tasodifiy bo'lsin
  };
};
