// ═══════════════════════════════════════════════════════════════════
//  TRANSLATION SERVICE — Firestore bilan aloqa qatlami.
//  Faqat shu fayl Firestore'ni biladi; i18n/index.js va React
//  komponentlari faqat i18next ("t") orqali ishlaydi.
//
//  Xarajatni past ushlab turish sxemasi:
//   1) i18n_meta/current — bitta arzon o'qish, barcha tillarning joriy
//      versiya raqamini beradi.
//   2) translations/{lang} to'liq hujjati faqat versiya farq qilganda
//      o'qiladi — aks holda localStorage keshi ishlatiladi.
// ═══════════════════════════════════════════════════════════════════
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { fbDB } from "../firebase.js";

const BUNDLE_CACHE_PREFIX = "oilaV7_i18n_bundle_";

function readCachedBundle(lang) {
  try {
    const raw = localStorage.getItem(BUNDLE_CACHE_PREFIX + lang);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

function writeCachedBundle(lang, bundle) {
  try {
    localStorage.setItem(BUNDLE_CACHE_PREFIX + lang, JSON.stringify(bundle));
  } catch (_e) {
    // Kesh yozib bo'lmasa ham ilova ishlashda davom etadi — keyingi safar
    // qayta Firestore'dan o'qiladi, xolos.
  }
}

/** i18n_meta/current hujjatini o'qiydi. Oflayn/xato bo'lsa null. */
export async function fetchMeta() {
  try {
    const snap = await getDoc(doc(fbDB, "i18n_meta", "current"));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("[i18n] meta o'qilmadi (oflaynmi?):", e.message);
    return null;
  }
}

/**
 * Berilgan til uchun eng so'nggi tarjima to'plamini qaytaradi:
 * kesh versiyasi joriy versiyaga teng bo'lsa — Firestore'ga so'rov
 * yubormasdan keshni qaytaradi; aks holda to'liq hujjatni oladi va
 * keshni yangilaydi.
 */
export async function getTranslationBundle(lang, knownVersion) {
  const cached = readCachedBundle(lang);
  if (cached && knownVersion != null && cached.version === knownVersion) {
    return cached;
  }
  try {
    const snap = await getDoc(doc(fbDB, "translations", lang));
    if (snap.exists()) {
      const bundle = snap.data(); // { version, updatedAt, data }
      writeCachedBundle(lang, bundle);
      return bundle;
    }
  } catch (e) {
    console.warn(`[i18n] "${lang}" tarjimasi Firestore'dan olinmadi (oflaynmi?):`, e.message);
  }
  return cached || null;
}

/** Yoqilgan (enabled: true) tillar ro'yxati — til tanlash UI'si uchun. */
export async function fetchLanguageList() {
  try {
    const snap = await getDocs(query(collection(fbDB, "languages"), where("enabled", "==", true)));
    return snap.docs.map((d) => d.data()).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  } catch (e) {
    console.warn("[i18n] til ro'yxati olinmadi:", e.message);
    return [];
  }
}
