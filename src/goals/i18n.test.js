import { describe, test, expect } from "vitest";
import { T } from "./i18n.js";

// Bu testlar HAQIQIY i18n instansiga qarshi ishlaydi (mock emas) — chunki
// aynan T()ning i18next resurs do'konidan to'g'ri o'qiyotganini
// tekshirish kerak (avvalgi mahalliy DICT o'rniga). src/i18n/index.js
// import qilinganda "goals" namespace'ini build ichidagi
// locales/goals.{uz,en,ru}.json'dan sinxron ravishda yuklab qo'yadi.

describe("goals T() — i18next \"goals\" namespace'idan o'qiydi", () => {
  test("oddiy kalitni to'g'ri tilda qaytaradi", () => {
    expect(T("overdue", "uz")).toBe("Muddat o'tdi");
    expect(T("overdue", "ru")).toBe("Срок истёк");
    expect(T("overdue", "en")).toBe("Overdue");
  });

  test("%d pozitsion argumentni to'g'ri almashtiradi", () => {
    expect(T("finishEarly", "uz", 5)).toBe("Maqsadga 5 kun oldin erishasiz");
    expect(T("finishEarly", "ru", 5)).toBe("Достигнете цели на 5 дн. раньше");
  });

  test("bir nechta %d/%s bo'lsa, ketma-ketlikda almashtiradi", () => {
    // aiNoContrib bitta %d ishlatadi — ketma-ketlik uchun boshqa ko'p argumentli kalit yo'q,
    // shuning uchun bitta argument bilan tekshiramiz.
    expect(T("aiNoContrib", "uz", 12)).toBe("Siz oxirgi 12 kun ichida maqsadga mablag' qo'shmadingiz");
  });

  test("hali to'ldirilmagan til (masalan \"kk\") uz'ga qaytadi, qulamaydi", () => {
    expect(T("overdue", "kk")).toBe("Muddat o'tdi");
  });

  test("mavjud bo'lmagan kalit — kalitning o'zini qaytaradi (xato bermaydi)", () => {
    expect(T("bunday_kalit_yoq")).toBe("bunday_kalit_yoq");
  });
});
