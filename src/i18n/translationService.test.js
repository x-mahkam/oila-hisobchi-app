import { describe, test, expect, vi, beforeEach } from "vitest";

// Firestore va firebase.js'ni to'liq soxtalashtiramiz — bu test haqiqiy
// tarmoq/Firebase loyihasiga bog'liq bo'lmasligi kerak, faqat
// translationService.js'ning kesh/versiya mantig'ini tekshiradi.
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();

vi.mock("firebase/firestore", () => ({
  doc: (...args) => args,
  getDoc: (...args) => mockGetDoc(...args),
  collection: (...args) => args,
  getDocs: (...args) => mockGetDocs(...args),
  query: (...args) => args,
  where: (...args) => args,
}));
vi.mock("../firebase.js", () => ({ fbDB: {} }));

import { fetchMeta, getTranslationBundle, fetchLanguageList } from "./translationService.js";

function makeMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.localStorage = makeMemoryStorage();
});

describe("fetchMeta", () => {
  test("hujjat mavjud bo'lsa ma'lumotini qaytaradi", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ versions: { uz: 3 } }) });
    const meta = await fetchMeta();
    expect(meta).toEqual({ versions: { uz: 3 } });
  });

  test("Firestore xato bersa (masalan oflayn) null qaytaradi, exception otmaydi", async () => {
    mockGetDoc.mockRejectedValue(new Error("network error"));
    const meta = await fetchMeta();
    expect(meta).toBeNull();
  });
});

describe("getTranslationBundle — kesh va versiya mantig'i", () => {
  test("kesh versiyasi joriy versiyaga teng bo'lsa, Firestore'ga so'rov yubormaydi", async () => {
    localStorage.setItem("oilaV7_i18n_bundle_uz", JSON.stringify({ version: 5, data: { hi: "Salom" } }));
    const bundle = await getTranslationBundle("uz", 5);
    expect(bundle.data.hi).toBe("Salom");
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  test("versiya farq qilsa, Firestore'dan to'liq hujjatni oladi va keshni yangilaydi", async () => {
    localStorage.setItem("oilaV7_i18n_bundle_uz", JSON.stringify({ version: 5, data: { hi: "Salom" } }));
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ version: 6, data: { hi: "Salom", bye: "Xayr" } }),
    });

    const bundle = await getTranslationBundle("uz", 6);

    expect(mockGetDoc).toHaveBeenCalledTimes(1);
    expect(bundle.version).toBe(6);
    expect(bundle.data.bye).toBe("Xayr");
    expect(JSON.parse(localStorage.getItem("oilaV7_i18n_bundle_uz")).version).toBe(6);
  });

  test("kesh yo'q va Firestore ham topilmasa (birinchi oflayn ochilish) — null qaytaradi", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const bundle = await getTranslationBundle("kk", null);
    expect(bundle).toBeNull();
  });

  test("Firestore xato bersa, eski keshni (bo'lsa ham) qaytarib, ilovani buzmaydi", async () => {
    localStorage.setItem("oilaV7_i18n_bundle_uz", JSON.stringify({ version: 5, data: { hi: "Salom" } }));
    mockGetDoc.mockRejectedValue(new Error("offline"));
    const bundle = await getTranslationBundle("uz", 6); // versiya mos kelmaydi -> Firestore'ga urinadi -> xato
    expect(bundle.data.hi).toBe("Salom"); // eski kesh saqlanib qoladi
  });
});

describe("fetchLanguageList", () => {
  test("yoqilgan tillarni sort maydoni bo'yicha tartiblab qaytaradi", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { data: () => ({ code: "ru", sort: 3 }) },
        { data: () => ({ code: "uz", sort: 1 }) },
        { data: () => ({ code: "en", sort: 2 }) },
      ],
    });
    const list = await fetchLanguageList();
    expect(list.map((l) => l.code)).toEqual(["uz", "en", "ru"]);
  });

  test("xato bo'lsa bo'sh ro'yxat qaytaradi", async () => {
    mockGetDocs.mockRejectedValue(new Error("permission-denied"));
    const list = await fetchLanguageList();
    expect(list).toEqual([]);
  });
});
