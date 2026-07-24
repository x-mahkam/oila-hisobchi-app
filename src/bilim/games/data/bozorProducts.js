// ═══════════════════════════════════════════════════════════
//  BOZOR — mahsulotlar katalogi (savdo simulyatori uchun).
//  cost = ombordan olish narxi (xarid)
//  fair = bozordagi odil sotuv narxi (mijoz shu atrofda to'laydi)
//  demand = nisbiy talab (mijozlar qay tez-tez shu molni so'raydi)
//  Narxlar so'mda, 10+ yosh uchun realga yaqin.
// ═══════════════════════════════════════════════════════════
export const BOZOR_PRODUCTS = [
  {
    id: "olma",
    icon: "🍎",
    name: { uz: "Olma", ru: "Яблоко", en: "Apple", kk: "Алма", ky: "Алма", tg: "Себ", qr: "Alma" },
    unit: { uz: "kg", ru: "кг", en: "kg", kk: "кг", ky: "кг", tg: "кг", qr: "kg" },
    cost: 6000,
    fair: 9000,
    demand: 3,
  },
  {
    id: "non",
    icon: "🥖",
    name: { uz: "Non", ru: "Хлеб", en: "Bread", kk: "Нан", ky: "Нан", tg: "Нон", qr: "Nan" },
    unit: { uz: "dona", ru: "шт", en: "pc", kk: "дана", ky: "даана", tg: "дона", qr: "dana" },
    cost: 2500,
    fair: 4000,
    demand: 4,
  },
  {
    id: "sharbat",
    icon: "🧃",
    name: { uz: "Sharbat", ru: "Сок", en: "Juice", kk: "Шырын", ky: "Шире", tg: "Шарбат", qr: "Sharbat" },
    unit: { uz: "dona", ru: "шт", en: "pc", kk: "дана", ky: "даана", tg: "дона", qr: "dana" },
    cost: 9000,
    fair: 14000,
    demand: 2,
  },
];

// Qaytim uchun ishlatiladigan pul nominallar (so'm)
export const NOTES = [5000, 10000, 20000, 50000, 100000];
