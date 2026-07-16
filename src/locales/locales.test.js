import { describe, test, expect } from "vitest";
import uz from "./uz.json";
import en from "./en.json";
import ru from "./ru.json";
import kk from "./kk.json";
import ky from "./ky.json";
import tg from "./tg.json";
import qr from "./qr.json";
import goalsUz from "./goals.uz.json";
import goalsEn from "./goals.en.json";
import goalsRu from "./goals.ru.json";
import goalsKk from "./goals.kk.json";
import goalsKy from "./goals.ky.json";
import goalsTg from "./goals.tg.json";
import goalsQr from "./goals.qr.json";
import budgetaiUz from "./budgetai.uz.json";
import budgetaiEn from "./budgetai.en.json";
import budgetaiRu from "./budgetai.ru.json";
import budgetaiKk from "./budgetai.kk.json";
import budgetaiKy from "./budgetai.ky.json";
import budgetaiTg from "./budgetai.tg.json";
import budgetaiQr from "./budgetai.qr.json";
import gardenUz from "./garden.uz.json";
import gardenEn from "./garden.en.json";
import gardenRu from "./garden.ru.json";
import gardenKk from "./garden.kk.json";
import gardenKy from "./garden.ky.json";
import gardenTg from "./garden.tg.json";
import gardenQr from "./garden.qr.json";

// Bu fayl BARCHA tillar (uz/en/ru/kk/ky/tg/qr) va namespace'lar
// (translation/goals/budgetai) uchun ikkita narsani avtomatik tekshiradi:
//  1) uz.json'dagi har bir kalit boshqa barcha tillarda ham mavjudmi.
//  2) placeholder'lar ({{amount}} yoki %d/%s) barcha tillarda bir xilmi.
// Aynan shu ikkinchisi App.jsx'dagi haqiqiy ReferenceError bug'iga sabab
// bo'lgan edi (bir tilda o'zgaruvchi bor, ikkinchisida yo'q) — shuning
// uchun bu tekshiruv har safar CI'da avtomatik ishlaydi.

function curlyPlaceholders(str) {
  if (typeof str !== "string") return null;
  return [...str.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
}

function positionalCount(str) {
  if (typeof str !== "string") return null;
  const m = str.match(/%[ds]/g);
  return m ? m.length : 0;
}

/** Bitta namespace uchun barcha tillarni bir-biriga solishtiradi. */
function describeNamespace(nsName, base, locales) {
  describe(`${nsName} — kalit va placeholder izchilligi`, () => {
    const keys = Object.keys(base).filter((k) => !Array.isArray(base[k]));
    const arrayKeys = Object.keys(base).filter((k) => Array.isArray(base[k]));

    for (const [lg, dict] of Object.entries(locales)) {
      test(`${lg} — barcha kalitlar mavjud (kamida bittasi yo'qolmagan)`, () => {
        const missing = Object.keys(base).filter((k) => !(k in dict));
        expect(missing, `${nsName}.${lg}.json'da yo'q: ${missing.join(", ")}`).toEqual([]);
      });

      for (const key of keys) {
        test(`${lg}.${key} — {{...}} placeholder'lar uz bilan bir xil`, () => {
          const baseCurly = curlyPlaceholders(base[key]);
          if (baseCurly && baseCurly.length) {
            expect(curlyPlaceholders(dict[key])).toEqual(baseCurly);
          }
        });

        test(`${lg}.${key} — %d/%s soni uz bilan bir xil`, () => {
          const baseCount = positionalCount(base[key]);
          if (baseCount) {
            expect(positionalCount(dict[key])).toBe(baseCount);
          }
        });
      }

      for (const key of arrayKeys) {
        test(`${lg}.${key} — massiv uzunligi uz bilan bir xil`, () => {
          expect(Array.isArray(dict[key]), `${lg}.json'da "${key}" massiv emas`).toBe(true);
          expect(dict[key].length).toBe(base[key].length);
        });
      }
    }
  });
}

describeNamespace("translation", uz, { en, ru, kk, ky, tg, qr });
describeNamespace("goals", goalsUz, { en: goalsEn, ru: goalsRu, kk: goalsKk, ky: goalsKy, tg: goalsTg, qr: goalsQr });
describeNamespace("budgetai", budgetaiUz, { en: budgetaiEn, ru: budgetaiRu, kk: budgetaiKk, ky: budgetaiKy, tg: budgetaiTg, qr: budgetaiQr });
describeNamespace("garden", gardenUz, { en: gardenEn, ru: gardenRu, kk: gardenKk, ky: gardenKy, tg: gardenTg, qr: gardenQr });
