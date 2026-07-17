// ═══════════════════════════════════════════════════════════
//  DISCOUNT GENERATOR — chegirma hisoblash savollari.
// ═══════════════════════════════════════════════════════════
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const ITEMS = [
  { icon: "🍫", name: { uz: "Shokolad", ru: "Шоколад", en: "Chocolate", kk: "Шоколад", ky: "Шоколад", tg: "Шоколад", qr: "Shokolad" } },
  { icon: "🧸", name: { uz: "O'yinchoq", ru: "Игрушка", en: "Toy", kk: "Ойыншық", ky: "Оюнчук", tg: "Бозича", qr: "Oyınshıq" } },
  { icon: "📚", name: { uz: "Kitob", ru: "Книга", en: "Book", kk: "Кітап", ky: "Китеп", tg: "Китоб", qr: "Kitap" } },
  { icon: "👕", name: { uz: "Futbolka", ru: "Футболка", en: "T-shirt", kk: "Футболка", ky: "Футболка", tg: "Футболка", qr: "Futbolka" } },
  { icon: "🎒", name: { uz: "Portfel", ru: "Рюкзак", en: "Backpack", kk: "Рюкзак", ky: "Рюкзак", tg: "Рюкзак", qr: "Ryukzak" } },
  { icon: "⌚", name: { uz: "Soat", ru: "Часы", en: "Watch", kk: "Сағат", ky: "Саат", tg: "Соат", qr: "Saǵat" } }
];

export const discountGenerator = (difficulty = "easy") => {
  const item = ITEMS[rnd(0, ITEMS.length - 1)];

  let origPrice = 10000;
  let discountPct = 10; // in percent

  if (difficulty === "easy") {
    const choices = [
      { p: 10000, d: 10 },  // easy 10% of 10k -> 9k
      { p: 20000, d: 50 },  // 50% of 20k -> 10k
      { p: 10000, d: 50 },  // 50% of 10k -> 5k
      { p: 30000, d: 10 },  // 10% of 30k -> 27k
    ];
    const choice = choices[rnd(0, choices.length - 1)];
    origPrice = choice.p;
    discountPct = choice.d;
  } else if (difficulty === "medium") {
    const choices = [
      { p: 40000, d: 20 },  // 20% of 40k -> 32k
      { p: 30000, d: 30 },  // 30% of 30k -> 21k
      { p: 50000, d: 15 },  // 15% of 50k -> 42.5k
      { p: 60000, d: 25 },  // 25% of 60k -> 45k
    ];
    const choice = choices[rnd(0, choices.length - 1)];
    origPrice = choice.p;
    discountPct = choice.d;
  } else { // hard
    const choices = [
      { p: 80000, d: 15 },  // 15% of 80k -> 68k
      { p: 120000, d: 20 }, // 20% of 120k -> 96k
      { p: 75000, d: 20 },  // 20% of 75k -> 60k
      { p: 90000, d: 30 },  // 30% of 90k -> 63k
    ];
    const choice = choices[rnd(0, choices.length - 1)];
    origPrice = choice.p;
    discountPct = choice.d;
  }

  const discountAmt = origPrice * (discountPct / 100);
  const answer = origPrice - discountAmt;

  // Construct standard wrong options
  const opts = new Set([answer]);

  // Distractors
  opts.add(origPrice - (origPrice * ((discountPct + 5) / 100))); // wrong percent
  opts.add(origPrice - (origPrice * ((discountPct - 5) / 100))); // wrong percent 2
  opts.add(origPrice); // original price without discount
  opts.add(answer + 2000); // random offset
  opts.add(answer - 1000); // random offset 2

  const finalOpts = shuffle(Array.from(opts).filter(o => o > 0)).slice(0, 4);
  if (!finalOpts.includes(answer)) {
    finalOpts[0] = answer;
  }
  const sortedOpts = shuffle(finalOpts);

  const prompt = {
    uz: `${item.icon} ${item.name.uz}:\nAsl narxi: ${origPrice.toLocaleString()} so'm.\nChegirma: ${discountPct}%.\nYangi narxni toping!`,
    ru: `${item.icon} ${item.name.ru}:\nИсходная цена: ${origPrice.toLocaleString()} сум.\nСкидка: ${discountPct}%.\nНайдите новую цену!`,
    en: `${item.icon} ${item.name.en}:\nOriginal price: ${origPrice.toLocaleString()} UZS.\nDiscount: ${discountPct}%.\nFind the new price!`,
    kk: `${item.icon} ${item.name.kk}:\nБастапқы бағасы: ${origPrice.toLocaleString()} сум.\nЖеңілдік: ${discountPct}%.\nЖаңа бағаны табыңыз!`,
    ky: `${item.icon} ${item.name.ky}:\nБаштапкы баасы: ${origPrice.toLocaleString()} сум.\nАрзандатуу: ${discountPct}%.\nЖаңы баасын табыңыз!`,
    tg: `${item.icon} ${item.name.tg}:\nНархи аслӣ: ${origPrice.toLocaleString()} сум.\nТахфиф: ${discountPct}%.\nНархи навро ёбед!`,
    qr: `${item.icon} ${item.name.qr}:\nBaslanǵısh bahası: ${origPrice.toLocaleString()} sum.\nShegirim: ${discountPct}%.\nJańa bahanı tabıń!`
  };

  const options = sortedOpts.map(val => ({
    id: val,
    text: {
      uz: `${val.toLocaleString()} so'm`,
      ru: `${val.toLocaleString()} сум`,
      en: `${val.toLocaleString()} UZS`,
      kk: `${val.toLocaleString()} сум`,
      ky: `${val.toLocaleString()} сум`,
      tg: `${val.toLocaleString()} сум`,
      qr: `${val.toLocaleString()} sum`
    }
  }));

  return {
    prompt,
    answer,
    options,
  };
};
