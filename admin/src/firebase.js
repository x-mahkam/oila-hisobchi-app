import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// Asosiy ilova bilan bir xil Firebase loyihasi (oila-hisobchi).
// Bu qiymatlar maxfiy emas (Firebase web konfiguratsiyasi commit qilinadi).
// Kerak bo'lsa .env orqali override qilinadi.
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

// Funksiya regioni asosiy ilova bilan bir xil (default us-central1).
const functions = getFunctions(app);

// Admin callable funksiyalarni chaqirish yordamchisi.
// Xatoni tushunarli qilib qaytaradi.
export async function call(name, data) {
  try {
    const fn = httpsCallable(functions, name);
    const res = await fn(data || {});
    return res.data;
  } catch (e) {
    const msg = e?.message || String(e);
    const code = e?.code || "";
    const err = new Error(msg);
    err.code = code;
    throw err;
  }
}

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
