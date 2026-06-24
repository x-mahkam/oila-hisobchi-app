import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, onAuthStateChanged, signOut, signInAnonymously, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGXVfk0W24o9Y_Q5hntQzxhg2fz8y-IxA",
  authDomain: "oila-hisobchi.firebaseapp.com",
  projectId: "oila-hisobchi",
  storageBucket: "oila-hisobchi.firebasestorage.app",
  messagingSenderId: "571641132083",
  appId: "1:571641132083:web:31c9790b4c92a8d05ddf46",
  measurementId: "G-446VWEM9XZ"
};

const app = initializeApp(firebaseConfig);
export const fbDB = getFirestore(app);
export const fbAuth = getAuth(app);

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
  // Google bilan kirish (redirect usuli - COOP xatosini oldini oladi)
  async googleLogin() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(fbAuth, provider);
    // Bu funksiya redirect qiladi - natija getGoogleResult() da
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
  // ADMIN: barcha hujjatlarni olish (statistika uchun)
  async all() {
    try {
      const snap = await getDocs(collection(fbDB, "appdata"));
      const out = [];
      snap.forEach(d => { out.push({ id: d.id, ...d.data() }); });
      return out;
    } catch (e) { console.error("db.all", e); return []; }
  },
  async s(k, v) {
    try {
      const ref = doc(fbDB, "appdata", safeKey(k));
      await setDoc(ref, { v: v, t: Date.now() });
      try { localStorage.setItem("cache_" + k, JSON.stringify(v)); } catch (e) {}
      return true;
    } catch (e) {
      console.error("db.s ERROR:", k, e.code, e.message);
      throw e;
    }
  }
};
