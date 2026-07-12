import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { db, auth, fbDB } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { td, nt, hp, fmtN } from "../utils/formatters.js";
import { MK, VALS, TL } from "../utils/constants.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  // ── Auth & User ──────────────────────────────────────────
  const [user,       setUser]      = useState(null);
  const [oila,       setOila]      = useState(null);
  const [azolar,     setAzolar]    = useState([]);
  const [isPremium,  setIsPremium] = useState(() => { try { return localStorage.getItem("oilaV7Prem") === "1"; } catch { return false; } });

  // ── Data ─────────────────────────────────────────────────
  const [xar,         setXar]         = useState([]);
  const [dar,         setDar]         = useState([]);
  const [maq,         setMaq]         = useState([]);
  const [qarzlar,     setQarzlar]     = useState([]);
  const [vazifalar,   setVazifalar]   = useState([]);
  const [kidBalances, setKidBalances] = useState({});
  const [notifs,      setNotifs]      = useState([]);
  const [qarzReqs,    setQarzReqs]    = useState([]);
  const [xReqs,       setXReqs]       = useState([]);
  const [rates,       setRates]       = useState([]);
  const [rateL,       setRateL]       = useState(false);
  const [stars,       setStars]       = useState(0);
  const [gardenData,  setGardenData]  = useState({ level: 0, watered: null, totalStars: 0 });

  // ── UI ───────────────────────────────────────────────────
  const [dark,    setDark]    = useState(true);
  const [lg,      setLg]      = useState("uz");
  const [val,     setVal]     = useState(VALS[0]);
  const [scr,     setScr]     = useState("login");
  const [bilimInitialView, setBilimInitialView] = useState("cats");
  const [tst,     setTst]     = useState({ msg: "", type: "ok" });
  const [boot,    setBoot]    = useState(true);
  const [onbStep, setOnbStep] = useState(() => { try { return localStorage.getItem("oilaV7Onb") === "1" ? -1 : 0; } catch { return 0; } });
  const [confetti, setConfetti] = useState(false);
  const [showPremModal, setShowPremModal] = useState(false);

  // ── Listen to Oila / Premium status in real-time ──────────
  useEffect(() => {
    if (!user?.oilaId) {
      setIsPremium(false);
      return;
    }

    const safeKey = (k) => ("oilaV7_" + k).replace(/[+\/\\#?]/g, "_").replace(/\s/g, "_");
    const docRef = doc(fbDB, "appdata", safeKey("oila_" + user.oilaId));

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const oVal = data.v || {};
        const premiumActive = oVal.premium === true;
        
        setIsPremium(premiumActive);
        try {
          localStorage.setItem("oilaV7Prem", premiumActive ? "1" : "0");
        } catch {}
        
        setOila(prev => ({ ...prev, ...oVal, premium: premiumActive }));
      }
    }, (err) => {
      console.error("Real-time premium listener error:", err);
    });

    return () => unsub();
  }, [user?.oilaId]);

  // ── Maqsad confirm modal ─────────────────────────────────
  const [maqsadConfirmNotif, setMaqsadConfirmNotif] = useState(null);

  // ── Computed ─────────────────────────────────────────────
  const th = useMemo(() => MK(dark), [dark]);
  const t  = useMemo(() => TL[lg] || TL.uz, [lg]);

  // ── Toast ────────────────────────────────────────────────
  const tstRef = useRef(null);
  const ok$ = useCallback((msg, type = "ok") => {
    try { if (navigator.vibrate) navigator.vibrate(type === "err" ? [8, 40, 8] : 12); } catch {}
    setTst({ msg, type });
    clearTimeout(tstRef.current);
    tstRef.current = setTimeout(() => setTst({ msg: "", type: "ok" }), 3000);
  }, []);

  // ── Buzz ─────────────────────────────────────────────────
  const buzz = useCallback((ms = 10) => { try { navigator.vibrate?.(ms); } catch {} }, []);

  const [coinEarnedTrigger, setCoinEarnedTrigger] = useState({ count: 0, ts: 0 });

  // ── Confetti ─────────────────────────────────────────────
  const fireConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  }, []);

  // ── addStar ──────────────────────────────────────────────
  const addStar = useCallback(async (count = 1, reason = "") => {
    if (!user?.oilaId) return;
    try {
      const cur = Math.max(0, (await db.g("stars_" + user.oilaId)) || 0);
      const next = Math.max(0, cur + count);
      await db.s("stars_" + user.oilaId, next);
      setStars(next);
      const coinMap = { "Xarajat kiritildi": 5, "Expense added": 5, "Daromad kiritildi": 10, "Income added": 10, "Vazifa bajarildi": 15, "Task completed": 15, "Maqsadga yetildi": 50, "Goal reached": 50 };
      const coinAmt = coinMap[reason] || count;
      const curC = (await db.g("baraka_coins_" + user.oilaId)) || 0;
      await db.s("baraka_coins_" + user.oilaId, curC + coinAmt);
      const log = (await db.g("starlog_" + user.oilaId)) || [];
      log.unshift({ uid: user.id, ism: user.ism, count, reason, sana: new Date().toISOString() });
      await db.s("starlog_" + user.oilaId, log.slice(0, 50));
      setCoinEarnedTrigger({ count, ts: Date.now() });
    } catch {}
  }, [user]);

  // ── addNotif ─────────────────────────────────────────────
  const addNotif = useCallback(async (type, title, body) => {
    if (!user?.id) return;
    const n = { id: Date.now() + Math.random(), type, title, body, sana: new Date().toISOString(), read: false };
    setNotifs(prev => [n, ...prev]);
    try {
      const cur = (await db.g("notif_" + user.id)) || [];
      await db.s("notif_" + user.id, [n, ...cur].slice(0, 100));
    } catch {}
  }, [user]);

  // ── Premium ──────────────────────────────────────────────
  const activatePremium = useCallback(async (purchaseToken, productId) => {
    if (!user?.oilaId) return { success: false, message: "Oila ID topilmadi" };
    
    try {
      const functionsInstance = getFunctions();
      const verifyFn = httpsCallable(functionsInstance, "verifyPurchase");
      const res = await verifyFn({
        purchaseToken,
        productId
      });
      
      if (res.data?.success) {
        ok$(lg === "uz" ? "Xarid muvaffaqiyatli tasdiqlandi!" : "Purchase verified successfully!");
        return { success: true, data: res.data };
      } else {
        throw new Error(res.data?.message || "Xaridni tasdiqlashda xatolik yuz berdi");
      }
    } catch (e) {
      console.error("activatePremium Error:", e);
      ok$(lg === "uz" ? "To'lovni tasdiqlashda xato yuz berdi" : "Error verifying payment", "err");
      return { success: false, error: e };
    }
  }, [user, lg, ok$]);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    try { auth.logout(); } catch {}
    localStorage.removeItem("oilaV7");
    setUser(null); setOila(null); setAzolar([]);
    setXar([]); setDar([]); setMaq([]); setQarzlar([]);
    setVazifalar([]); setNotifs([]); setScr("login");
  }, []);

  const value = {
    // Auth
    user, setUser, oila, setOila, azolar, setAzolar, isPremium, setIsPremium,
    // Data
    xar, setXar, dar, setDar, maq, setMaq,
    qarzlar, setQarzlar, vazifalar, setVazifalar,
    kidBalances, setKidBalances, notifs, setNotifs,
    qarzReqs, setQarzReqs, xReqs, setXReqs,
    rates, setRates, rateL, setRateL,
    stars, setStars, gardenData, setGardenData,
    // UI
    dark, setDark, lg, setLg, val, setVal,
    scr, setScr, bilimInitialView, setBilimInitialView, tst, boot, setBoot, onbStep, setOnbStep,
    th, t, confetti, setConfetti,
    maqsadConfirmNotif, setMaqsadConfirmNotif,
    coinEarnedTrigger,
    showPremModal, setShowPremModal,
    // Functions
    ok$, buzz, addStar, addNotif, logout, fireConfetti, activatePremium,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
