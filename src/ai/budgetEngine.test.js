import { describe, test, expect } from "vitest";
import { budgetHealth, monthlyForecast } from "./budgetEngine.js";

describe("budgetHealth — moliyaviy salomatlik balli", () => {
  test("yaxshi jamg'arma va byudjet ichida bo'lsa 'excellent' beradi", () => {
    const r = budgetHealth({
      income: 5_000_000,
      expense: 3_000_000,
      budgetLimit: 3_500_000,
      debtOutstanding: 0,
      goalMomentum: 0,
    });

    expect(r.score).toBe(82);
    expect(r.level).toBe("excellent");
    expect(r.savingsRate).toBeCloseTo(0.4);
  });

  test("daromadga nisbatan katta qarz bo'lsa 'critical' darajasiga tushiradi", () => {
    const r = budgetHealth({
      income: 1_000_000,
      expense: 1_000_000,
      budgetLimit: 0,
      debtOutstanding: 5_000_000,
      goalMomentum: 0,
    });

    expect(r.score).toBe(30);
    expect(r.level).toBe("critical");
  });

  test("daromad yo'q, faqat xarajat bo'lsa jamg'arma darajasi 'bad' bo'ladi", () => {
    const r = budgetHealth({ income: 0, expense: 1_000_000 });
    const savingsFactor = r.factors.find(f => f.key === "facSavings");
    expect(savingsFactor.state).toBe("bad");
  });
});

describe("monthlyForecast — oy oxirigacha xarajat bashorati", () => {
  test("kunlik sur'at asosida oy oxirigi xarajatni proyeksiya qiladi", () => {
    const now = new Date(2026, 0, 15); // 15-yanvar, oyda 31 kun
    const r = monthlyForecast({ monthExpense: 300_000, budgetLimit: 1_000_000, now });

    expect(r.hasData).toBe(true);
    expect(r.dailyRate).toBe(20_000);
    expect(r.projected).toBe(620_000);
    expect(r.overBudget).toBe(false);
  });

  test("byudjetdan oshib ketishni to'g'ri aniqlaydi", () => {
    const now = new Date(2026, 0, 15);
    const r = monthlyForecast({ monthExpense: 900_000, budgetLimit: 1_000_000, now });

    expect(r.projected).toBe(1_860_000);
    expect(r.overBudget).toBe(true);
  });

  test("oyning boshida (3 kungacha) hali ma'lumot yetarli emas deb hisoblaydi", () => {
    const now = new Date(2026, 0, 2);
    const r = monthlyForecast({ monthExpense: 50_000, budgetLimit: 1_000_000, now });

    expect(r.hasData).toBe(false);
  });
});
