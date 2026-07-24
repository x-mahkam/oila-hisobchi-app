import { ODD_ONE_OUT_SETS } from "../data/oddOneOutSets.js";

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const oddOneOutGenerator = (difficulty = "easy") => {
  // Filter sets by difficulty
  let eligible = ODD_ONE_OUT_SETS.filter(s => s.difficulty === difficulty);
  if (eligible.length === 0) {
    eligible = ODD_ONE_OUT_SETS; // fallback
  }

  // Pick a random set
  const set = eligible[rnd(0, eligible.length - 1)];

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
