import { ODD_ONE_OUT_SETS } from "../data/oddOneOutSets.js";

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Yaqinda ko'rsatilgan to'plamlar (sessiya ichida ketma-ket takror bo'lmasin).
// Hovuz kichik (ayniqsa hard'da) — oxirgi ko'rsatilganlarni chetlab o'tamiz.
let recentIds = [];

export const oddOneOutGenerator = (difficulty = "easy") => {
  // Filter sets by difficulty
  let eligible = ODD_ONE_OUT_SETS.filter(s => s.difficulty === difficulty);
  if (eligible.length === 0) {
    eligible = ODD_ONE_OUT_SETS; // fallback
  }

  // Takror oldini olish: yaqinda chiqmaganlardan tanlaymiz (iloji bo'lsa)
  const fresh = eligible.filter(s => !recentIds.includes(s.id));
  const pool = fresh.length > 0 ? fresh : eligible;
  const set = pool[rnd(0, pool.length - 1)];
  recentIds.push(set.id);
  // Xotira hajmi: hovuzning yarmigacha (kamida 1) — hovuz to'liq bloklanmasin
  const memSize = Math.max(1, Math.floor(eligible.length / 2));
  if (recentIds.length > memSize) recentIds = recentIds.slice(-memSize);

  // MUHIM: kartalarni ARALASHTIRAMIZ. Ilgari toq narsa DOIM oxirgi kartada
  // (barcha to'plamda oddIndex:3) turardi — bola o'qimasdan "4-chisini bos"
  // hiylasini o'rganib, o'yin ma'nosi yo'qolardi. Endi har o'ynashda pozitsiya
  // tasodifiy. Javob ID bo'yicha tekshiriladi, shuning uchun bu xavfsiz.
  const oddItem = set.items[set.oddIndex];
  const shuffled = [...set.items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newOddIndex = shuffled.indexOf(oddItem);

  return {
    prompt: "Guruhdagi toq/boshqacha narsani toping:",
    answer: oddItem.id,
    options: shuffled.map(item => item.id),
    meta: {
      set,
      oddIndex: newOddIndex,
      items: shuffled,
      explanation: set.explanation,
      difficulty
    }
  };
};
