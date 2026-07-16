import { describe, test, expect } from "vitest";
import uz from "./uz.json";
import en from "./en.json";
import ru from "./ru.json";

// "ai_*" kalitlari — src/App.jsx'dagi buildLocalAdvice funksiyasi ishlatadigan
// tarjimalar. Bu testlar aynan shu tur muammoni ushlab qolish uchun: bitta
// tilda o'zgaruvchi nomi ({{amount}}) o'zgartirilib, boshqasida eskicha
// qolib ketishi — bu aynan avval App.jsx'da haqiqiy runtime xatoga
// (ReferenceError) olib kelgan naqsh edi.

const LOCALES = { uz, en, ru };
const AI_KEYS = Object.keys(uz).filter((k) => k.startsWith("ai_"));

function placeholders(str) {
  if (typeof str !== "string") return null;
  return [...str.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
}

describe("ai_* tarjima kalitlari — uz/en/ru orasida izchillik", () => {
  test("uz.json'da kamida ai_* kalitlari mavjud", () => {
    expect(AI_KEYS.length).toBeGreaterThan(10);
  });

  for (const key of AI_KEYS) {
    test(`"${key}" — barcha 3 tilda mavjud`, () => {
      expect(en).toHaveProperty(key);
      expect(ru).toHaveProperty(key);
    });

    test(`"${key}" — placeholder'lar ({{...}}) uz/en/ru orasida bir xil`, () => {
      const uzPh = placeholders(uz[key]);
      if (uzPh === null) return; // massiv qiymat (ai_tips/ai_motiv) — alohida tekshiriladi
      expect(placeholders(en[key])).toEqual(uzPh);
      expect(placeholders(ru[key])).toEqual(uzPh);
    });
  }
});

describe("ai_tips / ai_motiv — massiv uzunliklari mos", () => {
  for (const key of ["ai_tips", "ai_motiv"]) {
    test(`"${key}" — uz/en/ru'da bir xil sondagi element`, () => {
      for (const [name, locale] of Object.entries(LOCALES)) {
        expect(Array.isArray(locale[key]), `${name}.json'da "${key}" massiv emas`).toBe(true);
      }
      expect(en[key].length).toBe(uz[key].length);
      expect(ru[key].length).toBe(uz[key].length);
    });
  }
});
