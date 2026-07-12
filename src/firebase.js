import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, onAuthStateChanged, signOut, signInAnonymously, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGXVfk0W24o9Y_Q5hntQzxhg2fz8y-IxA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oila-hisobchi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "oila-hisobchi",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oila-hisobchi.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571641132083",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:571641132083:web:31c9790b4c92a8d05ddf46",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-446VWEM9XZ"
};

const app = initializeApp(firebaseConfig);
export const fbDB = getFirestore(app);
export const fbAuth = getAuth(app);

// Enable Firestore offline persistence (IndexedDB cache)
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(fbDB)
    .catch((err) => {
      if (err.code === "failed-precondition") {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        return enableIndexedDbPersistence(fbDB);
      } else if (err.code === "unimplemented") {
        // The current browser does not support all of the features required to enable persistence.
        console.warn("Firestore offline persistence is not supported by this browser.");
      }
    })
    .catch((err) => {
      console.error("Error enabling Firestore offline persistence:", err);
    });
}

// ===== AUTHENTICATION (email + parol) =====
export const auth = {
  // Ro'yxatdan o'tish: email + parol
  async register(email, password) {
    const cred = await createUserWithEmailAndPassword(fbAuth, email, password);
    // Tasdiqlash xati yuborish (ixtiyoriy, blokirovka qilmaymiz)
    try { await sendEmailVerification(cred.user); } catch (e) {}
    return cred.user; // user.uid - Firebase Auth ID
  },
  // Kirish: email + parol
  async login(email, password) {
    const cred = await signInWithEmailAndPassword(fbAuth, email, password);
    return cred.user;
  },
  // Parolni tiklash (email orqali)
  async resetPassword(email) {
    await sendPasswordResetEmail(fbAuth, email);
  },
  // Anonim kirish (bolalar uchun - emailsiz)
  async loginAnon() {
    const cred = await signInAnonymously(fbAuth);
    return cred.user;
  },
  // Google bilan kirish - popup usuli (vercel.json da COOP header bor)
  async googleLogin() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const cred = await signInWithPopup(fbAuth, provider);
      return { user: cred.user, method: "popup" };
    } catch(e) {
      // Popup ishlamasa redirect ga o'tish
      if(e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user") {
        throw e;
      }
      await signInWithRedirect(fbAuth, provider);
      return { user: null, method: "redirect" };
    }
  },
  // Redirect qaytgandan keyin natijani olish
  async getGoogleResult() {
    const result = await getRedirectResult(fbAuth);
    return result ? result.user : null;
  },
  // Chiqish
  async logout() {
    await signOut(fbAuth);
  },
  // Chala yaratilgan akkauntni o'chirish (ro'yxatdan o'tish yarim to'xtaganda)
  async deleteCurrentUser() {
    try {
      const u = fbAuth.currentUser;
      if (u) { await u.delete(); return true; }
    } catch (e) { try { await signOut(fbAuth); } catch (e2) {} }
    return false;
  },
  // Joriy foydalanuvchi
  current() {
    return fbAuth.currentUser;
  },
  // Holat kuzatuvi (kirgan/chiqqan)
  onChange(cb) {
    return onAuthStateChanged(fbAuth, cb);
  }
};

// Ma'lumotlar qatlami (db.g / db.s) - Firestore bilan
const DB = "oilaV7_";
// Firestore document ID xavfsizligi: maxsus belgilarni tozalash
const safeKey = (k) => (DB + k).replace(/[+\/\\#?]/g, "_").replace(/\s/g, "_");

// ─────────────────────────────────────────────────────────────
//  XAVFSIZLIK METADATASI (_o = oilaId, _u = yozuvchi auth uid)
//  Har yozuvda hujjatga ko'rinmas egalik yorlig'i qo'shiladi.
//  Firestore Rules aynan shu yorliqlarni tekshirib, begonaning
//  o'qishi/yozishini rad etadi. UI'ga umuman ta'sir qilmaydi —
//  ilova doim faqat `d.v` ni o'qiydi, `_o`/`_u` ni "ko'rmaydi".
//
//  ownerCtx: ilova joriy foydalanuvchi kontekstini shu yerga beradi
//  (setOwnerCtx orqali). Rules tekshiruvi uchun yagona haqiqat manbai.
// ─────────────────────────────────────────────────────────────
let ownerCtx = { uid: null, oilaId: null };
export const setOwnerCtx = (uid, oilaId) => { ownerCtx = { uid: uid || null, oilaId: oilaId || null }; };

// Kalitdan oilaId'ni ajratib olish (oila-umumiy hujjatlar uchun).
// Masalan "x_<oilaId>_<uid>" yoki "maq_<oilaId>" dan <oilaId> chiqadi.
const OILA_PREFIXES = ["x_", "d_", "maq_", "qarz_", "vazifa_", "kidbal_", "stars_", "starlog_", "oila_", "fam_", "toy_", "bilim_offer_"];

// Oila-umumiy hujjatning oilaId'sini kalitdan aniqlash.
const oilaIdFromKey = (k) => {
  for (const p of OILA_PREFIXES) {
    if (k.startsWith(p)) {
      const rest = k.slice(p.length);
      // "x_<oilaId>_<uid>" / "d_<oilaId>_<uid>": oxirgi "_<uid>" bo'lagini olib
      // tashlaymiz — qolgani oilaId. (oilaId ichida "_" bo'lsa ham to'g'ri
      // ishlaydi, chunki faqat OXIRGI segmentni — uid'ni — kesamiz.)
      if (p === "x_" || p === "d_") {
        // x_/d_ hujjatiga faqat o'z oilangga yozasan — ownerCtx.oilaId ishonchli.
        // (Kalitni parslash mo'rt: oilaId ichida "_" bor-yo'qligi noaniq.)
        if (ownerCtx.oilaId) return ownerCtx.oilaId;
        const i = rest.lastIndexOf("_");
        return i > 0 ? rest.slice(0, i) : rest;
      }
      return rest;   // maq_/qarz_/vazifa_/kidbal_/stars_/starlog_/oila_/fam_/toy_ = to'g'ridan-to'g'ri oilaId
    }
  }
  return null;
};

// Shaxsiy hujjatlar (baraka_, bilim_, kidgame_, notif_ ...) uchun ham _o qo'yamiz,
// chunki BOLA anonim auth'i har sessiyada o'zgaradi — _u bo'yicha o'z hujjatini
// qayta o'qiy olmaydi. Shuning uchun bu hujjatlarni ham oilaga bog'laymiz:
// oila a'zosi (katta yoki bola) o'qiy oladi. Login-qidiruv va ommaviy
// hujjatlarga (em_, kidlogin_, kb_, fb_, ksess_) _o QO'YILMAYDI.
const NO_OILA_TAG = ["em_", "tphone_", "tel_", "tel9_", "kidlogin_", "kb_", "fb_", "ksess_", "qreq_", "refi_"];
const shouldTagOila = (k) => !NO_OILA_TAG.some(p => k.startsWith(p));

// Yakuniy _o aniqlovchi: avval kalitdan, bo'lmasa joriy kontekst oilaId'si.
const resolveOila = (k) => {
  const fromKey = oilaIdFromKey(k);
  if (fromKey) return fromKey;
  if (shouldTagOila(k) && ownerCtx.oilaId) return ownerCtx.oilaId;
  return null;
};
export const db = {
  // Keshsiz to'g'ridan-to'g'ri o'qish (mavjudligini aniq tekshirish uchun)
  async gFresh(k) {
    const ref = doc(fbDB, "appdata", safeKey(k));
    const snap = await getDoc(ref);
    if (snap.exists()) { const d = snap.data(); return d.v !== undefined ? d.v : null; }
    return null;
  },
  async g(k) {
    try {
      const ref = doc(fbDB, "appdata", safeKey(k));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        const val = d.v !== undefined ? d.v : null;
        // Keshga saqlash (keyingi tez ochilish uchun)
        try { localStorage.setItem("cache_" + k, JSON.stringify(val)); } catch (e) {}
        return val;
      }
      return null;
    } catch (e) {
      console.error("db.g", k, e);
      // Internet yo'q bo'lsa - keshdan o'qish
      try { const c = localStorage.getItem("cache_" + k); if (c) return JSON.parse(c); } catch (e2) {}
      return null;
    }
  },
  // Keshdan tezkor o'qish (Firebase kutmasdan)
  gCache(k) {
    try { const c = localStorage.getItem("cache_" + k); return c ? JSON.parse(c) : null; } catch (e) { return null; }
  },
  // XAVFSIZLIK: "kanal" bo'yicha hujjatlar ro'yxati (where c == chan).
  // Rules faqat o'zingizga tegishli kanallarni (masalan "qreq_<sizning tel>")
  // o'qishga ruxsat beradi — begona kanal so'ralsa Firestore o'zi rad etadi.
  async q(chan) {
    try {
      const qq = query(collection(fbDB, "appdata"), where("c", "==", chan));
      const snap = await getDocs(qq);
      const out = [];
      snap.forEach(d => { const v = d.data()?.v; if (v !== undefined && v !== null) out.push({ _id: d.id.replace(DB, ""), ...((typeof v === "object") ? v : { v }) }); });
      return out;
    } catch (e) { console.error("db.q", chan, e); return []; }
  },
  // db.all() OLIB TASHLANDI: butun bazani o'qish oddiy foydalanuvchi
  // ilovasida bo'lmasligi kerak. Admin statistikasi alohida admin-sayt
  // orqali (Firestore Rules'da faqat admin UID'ga ruxsat) olinadi.

  // meta.c — hujjatni "kanal"ga bog'laydi (db.q bilan o'qish uchun)
  async s(k, v, meta) {
    try {
      const ref = doc(fbDB, "appdata", safeKey(k));
      const payload = { v: v, t: Date.now() };
      if (meta && meta.c) payload.c = meta.c;
      // XAVFSIZLIK YORLIG'I: yozuvchi uid va oila. Rules shularni tekshiradi.
      const au = (fbAuth.currentUser && fbAuth.currentUser.uid) || ownerCtx.uid || null;
      if (au) payload._u = au;                         // kim yozdi (auth uid)
      const oid = resolveOila(k);
      if (oid) payload._o = oid;                       // qaysi oilaga tegishli
      await setDoc(ref, payload);
      try { localStorage.setItem("cache_" + k, JSON.stringify(v)); } catch (e) {}
      return true;
    } catch (e) {
      console.error("db.s ERROR:", k, e.code, e.message);
      throw e;
    }
  },
  // Hujjatni HAQIQATDA o'chirish (setDoc(null) {v:null} qoldiradi — bu esa yo'q qiladi)
  async del(k) {
    try {
      await deleteDoc(doc(fbDB, "appdata", safeKey(k)));
    } catch (e) { console.error("db.del", k, e.code, e.message); }
    try { localStorage.removeItem("cache_" + k); } catch (e) {}
    return true;
  }
};
