import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// Asosiy ilova bilan bir xil Firebase loyihasi. Bu qiymatlar maxfiy emas.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGXVfk0W24o9Y_Q5hntQzxhg2fz8y-IxA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oila-hisobchi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "oila-hisobchi",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oila-hisobchi.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571641132083",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:571641132083:web:31c9790b4c92a8d05ddf46",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const functions = getFunctions(app);

// Callable funksiya chaqiruvi — xatoni tushunarli qaytaradi.
export async function call(name, data) {
  try {
    const fn = httpsCallable(functions, name);
    const res = await fn(data || {});
    return res.data;
  } catch (e) {
    const code = e?.code || "";
    let msg = e?.message || String(e);
    // "internal" / "not-found" — odatda funksiya serverga hali deploy
    // qilinmaganida chiqadi. Foydalanuvchiga aniq yo'l ko'rsatamiz.
    if (code === "functions/internal" || code === "functions/not-found" || msg === "internal") {
      msg = `"${name}" funksiyasi serverda topilmadi — katta ehtimol hali deploy qilinmagan. ` +
        `Yechim: kompyuterda "firebase deploy --only functions --project oila-hisobchi" ni ishga tushiring (yangi kod bilan).`;
    }
    const err = new Error(msg);
    err.code = code;
    throw err;
  }
}

export async function loginEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Google bilan kirish (admin hisob Google bo'lsa ham kira olsin)
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export { signOut, onAuthStateChanged };
