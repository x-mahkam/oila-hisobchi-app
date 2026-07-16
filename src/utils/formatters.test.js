import { describe, test, expect } from "vitest";
import { f, fmtN, pct, normTel, sonSoz, daysDiff, fullName } from "./formatters.js";

describe("f — summani formatlash (probel bilan ajratish)", () => {
  test("mingliklarni probel bilan ajratadi", () => {
    expect(f(1234567)).toBe("1 234 567");
  });
  test("kichik sonlarni o'zgartirmaydi", () => {
    expect(f(500)).toBe("500");
  });
  test("manfiy sonni musbat qilib ko'rsatadi (belgisiz)", () => {
    expect(f(-1000)).toBe("1 000");
  });
  test("showUnit=true bo'lsa 'so'm' qo'shadi", () => {
    expect(f(1000, true)).toBe("1 000 so'm");
  });
  test("noto'g'ri kirishni (NaN/undefined) 0 sifatida ishlaydi", () => {
    expect(f(undefined)).toBe("0");
    expect(f("abc")).toBe("0");
  });
});

describe("fmtN — valyutaga qarab formatlash", () => {
  const UZS = { id: "uzs", k: 1, b: "so'm" };
  const USD = { id: "usd", k: 12700, b: "$" };

  test("so'mda oddiy formatlash", () => {
    expect(fmtN(1500000, UZS, false)).toBe("1 500 000 so'm");
  });
  test("boshqa valyutaga aylantiradi (kursga bo'linadi)", () => {
    expect(fmtN(127000, USD, false)).toBe("10 $");
  });
  test("qisqartirilgan (sh=true) rejimda millionni 'mln' bilan ko'rsatadi", () => {
    expect(fmtN(2_000_000, UZS, true)).toBe("2 mln so'm");
  });
  test("qisqartirilgan rejimda milliardni 'mlrd' bilan ko'rsatadi", () => {
    expect(fmtN(3_000_000_000, UZS, true)).toBe("3 mlrd so'm");
  });
});

describe("pct — foiz hisoblash", () => {
  test("oddiy foizni hisoblaydi", () => {
    expect(pct(25, 200)).toBe(13); // 12.5 -> yaxlitlanadi
  });
  test("total 0 bo'lsa 0 qaytaradi (bo'lishga xato bermaydi)", () => {
    expect(pct(10, 0)).toBe(0);
  });
});

describe("normTel — telefon raqamini normallashtirish", () => {
  test("+998 kodini olib tashlaydi, 9 ta raqam qoladi", () => {
    expect(normTel("+998 90 123 45 67")).toBe("901234567");
  });
  test("harflar va belgilarni tozalaydi", () => {
    expect(normTel("(90) 123-45-67")).toBe("901234567");
  });
  test("bo'sh kirishni bo'sh qatorga aylantiradi", () => {
    expect(normTel("")).toBe("");
    expect(normTel(null)).toBe("");
  });
});

describe("sonSoz — summani so'z bilan yozish", () => {
  test("nol", () => {
    expect(sonSoz(0)).toBe("nol");
  });
  test("mingliklarni so'zga aylantiradi", () => {
    expect(sonSoz(1500)).toBe("bir ming besh yuz");
  });
  test("millionni so'zga aylantiradi", () => {
    expect(sonSoz(2_000_000)).toBe("ikki million");
  });
});

describe("daysDiff — kunlar farqi", () => {
  test("kelajakdagi sana musbat son beradi", () => {
    const future = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    expect(daysDiff(future)).toBeGreaterThanOrEqual(4);
    expect(daysDiff(future)).toBeLessThanOrEqual(6);
  });
});

describe("fullName — to'liq ism", () => {
  test("familya + ism birlashtiradi", () => {
    expect(fullName({ familya: "Karimov", ism: "Ali" })).toBe("Karimov Ali");
  });
  test("familya bo'lmasa faqat ismni qaytaradi", () => {
    expect(fullName({ ism: "Ali" })).toBe("Ali");
  });
  test("odam obyekti bo'lmasa bo'sh qator qaytaradi", () => {
    expect(fullName(null)).toBe("");
  });
});
