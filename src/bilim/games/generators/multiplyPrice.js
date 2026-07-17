// ═══════════════════════════════════════════════════════════
//  MULTIPLY PRICE GENERATOR — ko'paytirish (narx × miqdor)
//  Interfeys: generator(difficulty) → { prompt, answer, options[4], meta }
// ═══════════════════════════════════════════════════════════
import { f } from "../../../utils/formatters.js";

const ITEMS = [
  { uz: "shokolad", ru: "шоколад", en: "chocolate", kk: "шоколад", ky: "шоколад", tg: "шоколад", qr: "shokolad" },
  { uz: "muzqaymoq", ru: "мороженое", en: "ice cream", kk: "балмұздақ", ky: "балмуздак", tg: "яхмос", qr: "balmuzlıq" },
  { uz: "ruchka", ru: "ручка", en: "pen", kk: "қалам", ky: "калем", tg: "қалам", qr: "qalam" },
  { uz: "daftar", ru: "тетрадь", en: "notebook", kk: "дәптер", ky: "дептер", tg: "дафтар", qr: "defter" },
  { uz: "sharbat", ru: "сок", en: "juice", kk: "шырын", ky: "шире", tg: "шарбат", qr: "sharbat" }
];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const multiplyPriceGenerator = (difficulty = "easy") => {
  let qty, price;

  if (difficulty === "easy") {
    qty = rnd(2, 5);
    price = rnd(1, 3) * 1000;
  } else if (difficulty === "medium") {
    qty = rnd(3, 7);
    price = rnd(2, 6) * 1000;
  } else {
    qty = rnd(4, 10);
    price = rnd(3, 10) * 1000;
  }

  const answer = qty * price;
  const item = ITEMS[rnd(0, ITEMS.length - 1)];

  // Generate 3 distractors
  const opts = new Set([answer]);
  let guard = 0;
  while (opts.size < 4 && guard < 50) {
    guard++;
    let cand;
    const randType = Math.random();
    if (randType < 0.3) {
      cand = (qty + (Math.random() < 0.5 ? 1 : -1)) * price;
    } else if (randType < 0.6) {
      cand = qty * (price + (Math.random() < 0.5 ? 1000 : -1000));
    } else {
      cand = answer + (Math.random() < 0.5 ? 1000 : -1000) * rnd(1, 3);
    }
    if (cand > 0 && cand !== answer) opts.add(cand);
  }

  // Backup if we don't have 4 options
  let extra = answer + 1000;
  while (opts.size < 4) {
    if (extra !== answer && extra > 0) opts.add(extra);
    extra += 1000;
  }

  const formattedOptions = shuffle([...opts]).slice(0, 4).map(val => f(val, true));

  return {
    prompt: {
      uz: `${qty} ta ${item.uz}, har biri ${f(price, true)}. Jami qancha?`,
      ru: `${qty} шт. ${item.ru}, по ${f(price, true)} за штуку. Сколько всего?`,
      en: `${qty} ${item.en}(s), each ${f(price, true)}. What is the total?`,
      kk: `${qty} дана ${item.kk}, әрқайсысы ${f(price, true)}. Барлығы қанша?`,
      ky: `${qty} даана ${item.ky}, ар бири ${f(price, true)}. Баары канча?`,
      tg: `${qty} дона ${item.tg}, ҳар кадом ${f(price, true)}. Ҳамагӣ чанд?`,
      qr: `${qty} dana ${item.qr}, hár qaysısı ${f(price, true)}. Jámi qansha?`
    },
    answer: f(answer, true),
    options: formattedOptions,
    meta: { qty, price, difficulty }
  };
};
