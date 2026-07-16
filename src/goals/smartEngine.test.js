import { describe, test, expect } from "vitest";
import { computeSmart, STATUS } from "./smartEngine.js";

describe("computeSmart — muddatsiz maqsad", () => {
  test("progress va oddiy holatni to'g'ri hisoblaydi", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const goal = { maqsad: 1_000_000, jamg: 250_000, createdAt: "2026-01-01" };
    const r = computeSmart(goal, {}, now);

    expect(r.progress).toBe(25);
    expect(r.remaining).toBe(750_000);
    expect(r.complete).toBe(false);
    expect(r.hasDeadline).toBe(false);
    expect(r.status).toBe(STATUS.SLIGHTLY); // progress < 50% => "biroz ortda"
    expect(r.healthScore).toBe(50);
  });
});

describe("computeSmart — bajarilgan maqsad", () => {
  test("complete=true bo'lsa status DONE va ball 100", () => {
    const now = new Date("2026-02-01T00:00:00.000Z");
    const goal = { maqsad: 500_000, jamg: 500_000, createdAt: "2026-01-01", completedAt: "2026-02-01" };
    const r = computeSmart(goal, {}, now);

    expect(r.complete).toBe(true);
    expect(r.progress).toBe(100);
    expect(r.status).toBe(STATUS.DONE);
    expect(r.healthScore).toBe(100);
    expect(r.prediction.onTime).toBe(true);
  });
});

describe("computeSmart — muddati o'tgan maqsad", () => {
  test("deadline o'tib ketgan va hali to'lanmagan bo'lsa OVERDUE beradi", () => {
    const now = new Date("2026-02-01T00:00:00.000Z");
    const goal = { maqsad: 1_000_000, jamg: 100_000, createdAt: "2026-01-01" };
    const meta = { deadline: "2026-01-10" };
    const r = computeSmart(goal, meta, now);

    expect(r.overdue).toBe(true);
    expect(r.daysLeft).toBe(0);
    expect(r.status).toBe(STATUS.OVERDUE);
    expect(r.healthScore).toBe(15);
  });
});

describe("computeSmart — real hissalar asosida bashorat (pace)", () => {
  test("kunlik sur'at asosida yakunlanish sanasini hisoblaydi", () => {
    const now = new Date("2026-01-11T00:00:00.000Z");
    const goal = {
      maqsad: 200_000,
      jamg: 100_000,
      createdAt: "2026-01-01",
      contribs: [{ at: "2026-01-01", summa: 100_000 }],
    };
    const r = computeSmart(goal, {}, now);

    // 10 kunda 100 000 yig'ilgan => sur'at 10 000/kun, qolgan 100 000 => yana 10 kun kerak.
    expect(r.pace.hasPace).toBe(true);
    expect(r.pace.ratePerDay).toBe(10_000);
    expect(r.prediction.daysToFinish).toBe(10);
  });
});
