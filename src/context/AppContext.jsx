import { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";
import { db, auth } from "../firebase.js";
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
  const [tst,     setTst]     = useState({ msg: "", type: "ok" });
  const [boot,    setBoot]    = useState(true);
  const [onbStep, setOnbStep] = useState(() => { try { return localStorage.getItem("oilaV7Onb") === "1" ? -1 : 0; } catch { return 0; } });
  const [confetti, setConfetti] = useState(false);

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

  // ── Confetti ─────────────────────────────────────────────
  const fireConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2500);
  }, []);

  // ── addStar ──────────────────────────────────────────────
  const addStar = useCallback(async (count = 1, reason = "") => {
    if (!user?.oilaId) return;
    try {
      const cur = (await db.g("stars_" + user.oilaId)) || 0;
      const next = cur + count;
      await db.s("stars_" + user.oilaId, next);
      setStars(next);
      const coinMap = { "Xarajat kiritildi": 5, "Expense added": 5, "Daromad kiritildi": 10, "Income added": 10, "Vazifa bajarildi": 15, "Task completed": 15, "Maqsadga yetildi": 50, "Goal reached": 50 };
      const coinAmt = coinMap[reason] || count;
      const curC = (await db.g("baraka_coins_" + user.oilaId)) || 0;
      await db.s("baraka_coins_" + user.oilaId, curC + coinAmt);
      const log = (await db.g("starlog_" + user.oilaId)) || [];
      log.unshift({ uid: user.id, ism: user.ism, count, reason, sana: new Date().toISOString() });
      await db.s("starlog_" + user.oilaId, log.slice(0, 50));
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
    scr, setScr, tst, boot, setBoot, onbStep, setOnbStep,
    th, t, confetti, setConfetti,
    maqsadConfirmNotif, setMaqsadConfirmNotif,
    // Functions
    ok$, buzz, addStar, addNotif, logout, fireConfetti,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
