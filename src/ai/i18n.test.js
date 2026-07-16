import { describe, test, expect } from "vitest";
import { T } from "./i18n.js";

// Bu testlar HAQIQIY i18n instansiga qarshi ishlaydi (mock emas) — T()ning
// i18next "budgetai" namespace resurs do'konidan to'g'ri o'qiyotganini
// tekshiradi (avvalgi mahalliy DICT o'rniga).

describe("budgetai T() — i18next \"budgetai\" namespace'idan o'qiydi", () => {
  test("oddiy kalitni to'g'ri tilda qaytaradi", () => {
    expect(T("cardHealth", "uz")).toBe("Byudjet salomatligi");
    expect(T("cardHealth", "ru")).toBe("Здоровье бюджета");
    expect(T("cardHealth", "en")).toBe("Budget health");
  });

  test("%s pozitsion argumentni to'g'ri almashtiradi", () => {
    expect(T("fcSpend", "uz", "1 500 000 so'm")).toBe(
      "Agar shu tezlikda davom etsangiz, oy oxirida 1 500 000 so'm xarajat qilasiz."
    );
  });

  test("bir nechta argument ketma-ketlikda almashtiriladi", () => {
    expect(T("riskCatUp", "uz", "Transport", 3)).toBe(
      "Transport xarajatlari ketma-ket 3 oy oshmoqda."
    );
    expect(T("riskCatUp", "ru", "Транспорт", 3)).toBe(
      "Расходы «Транспорт» растут 3 мес. подряд."
    );
  });

  test("hali to'ldirilmagan til uz'ga qaytadi, qulamaydi", () => {
    expect(T("cardHealth", "kk")).toBe("Byudjet salomatligi");
  });

  test("mavjud bo'lmagan kalit — kalitning o'zini qaytaradi", () => {
    expect(T("bunday_kalit_yoq")).toBe("bunday_kalit_yoq");
  });
});
