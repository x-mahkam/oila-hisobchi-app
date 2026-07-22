import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { fbDB } from "../firebase.js";

// ═══════════════════════════════════════════════════════════
//  Masofaviy tizim sozlamalari (admin panel boshqaradi).
//  app_config/main hujjatini JONLI (onSnapshot) o'qiydi:
//   - maintenance: { on, message } — texnik tanaffus ekrani
//   - flags: { bilim, garden, ... } — false = funksiya o'chiq
//   - minVersion, forceUpdate — majburiy yangilash
//  Oflayn/xato holatda: standart qiymatlar (hammasi yoqiq) —
//  ilova hech qachon sozlama tufayli ishlamay qolmaydi.
// ═══════════════════════════════════════════════════════════

const DEFAULTS = {
  maintenance: { on: false, message: "" },
  minVersion: "",
  forceUpdate: false,
  flags: {},
  testers: [], // sinovchi foydalanuvchi ID'lari (cheat/test vositalari faqat ularga)
};

export function useAppConfig() {
  const [cfg, setCfg] = useState(DEFAULTS);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(fbDB, "app_config", "main"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data() || {};
          setCfg({
            maintenance: { on: d.maintenance?.on === true, message: d.maintenance?.message || "" },
            minVersion: d.minVersion || "",
            forceUpdate: d.forceUpdate === true,
            flags: d.flags || {},
            testers: Array.isArray(d.testers) ? d.testers : [],
          });
        }
      },
      () => { /* o'qib bo'lmasa — standart (hammasi yoqiq) qoladi */ }
    );
    return unsub;
  }, []);

  return cfg;
}

// Flag yoqiqmi? Standart — yoqiq (faqat aniq false bo'lsa o'chiq).
export const flagOn = (cfg, key) => cfg?.flags?.[key] !== false;

// "1.2.3" > "1.1.0" kabi taqqoslash. Noto'g'ri format = 0.
export function versionLess(a, b) {
  const pa = String(a || "").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b || "").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) < (pb[i] || 0)) return true;
    if ((pa[i] || 0) > (pb[i] || 0)) return false;
  }
  return false;
}
