import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { db, auth, fbDB } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { td, nt, hp, fmtN } from "../utils/formatters.js";
import { MK, VALS, TL } from "../utils/constants.js";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index.js";

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
  const { t: tFunc } = useTranslation();
  const [dark,    setDark]    = useState(true);
  const [lg,      setLgState] = useState(() => i18n.language || "uz");

  const setLg = useCallback((newLang) => {
    if (newLang) {
      i18n.changeLanguage(newLang);
      setLgState(newLang);
      try {
        localStorage.setItem("oilaV7L", newLang);
        localStorage.setItem("oilaV7_lg", newLang);
        localStorage.setItem("i18nextLng", newLang);
      } catch (e) {
        console.error("Error setting language:", e);
      }
    }
  }, []);

  // Listen to language changes from i18n instance to keep state synced
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLgState(lng);
    };
    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

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

    const safeKey = (k) => ("oilaV7_" + k).replace(/[+\\#?]/g, "_").replace(/\//g, "_").replace(/\s/g, "_");
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

  // ── Faollik pingi (admin statistikasi: DAU/WAU/MAU) ─────
  // Kuniga 1 marta act_<uid> hujjatiga engil meta yoziladi.
  // User profilini QAYTA YOZMAYMIZ (stale-overwrite xavfi yo'q) —
  // alohida kichik hujjat. Xato bo'lsa jim o'tamiz (UXga ta'sirsiz).
  useEffect(() => {
    if (!user?.id) return;
    const day = new Date().toISOString().slice(0, 10);
    const lsKey = "oilaV7ActPing";
    try {
      const prev = JSON.parse(localStorage.getItem(lsKey) || "{}");
      if (prev.uid === user.id && prev.day === day) return; // bugun yozilgan
    } catch { /* buzuq kesh — davom etamiz */ }
    const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
    db.s("act_" + user.id, {
      t: Date.now(), day,
      platform: isNative ? "android" : "web",
      lg, rol: user.rol || null, oilaId: user.oilaId || null,
    }).then(() => {
      try { localStorage.setItem(lsKey, JSON.stringify({ uid: user.id, day })); } catch { /* joy yo'q */ }
    }).catch(() => {});
  }, [user?.id, user?.rol, user?.oilaId, lg]);

  // ── Maqsad confirm modal ─────────────────────────────────
  const [maqsadConfirmNotif, setMaqsadConfirmNotif] = useState(null);
  const syncDailyReminderRef = useRef(null);

  // Ro'yxatdan o'tish/kirish davomida App.jsx'ning fon rejimidagi
  // onAuthStateChanged tinglovchisi aralashmasligi uchun. App.jsx va
  // Login.jsx BITTA shu ref'ni ishlatishi kerak (context orqali) — ilgari
  // ikkalasi o'zining alohida useRef'ini yaratgan edi, shu sabab bu himoya
  // hech qachon ishlamagan (Login.jsx'da true qilingan bo'lsa ham, App.jsx
  // buni hech qachon ko'rmagan).
  const authBusyRef = useRef(false);

  // ── Computed ─────────────────────────────────────────────
  const th = useMemo(() => MK(dark), [dark]);
  const t = useMemo(() => {
    const p = (key, options) => tFunc(key, options);
    return new Proxy(p, {
      get(target, prop) {
        if (typeof prop === "string" && prop !== "then" && prop !== "length" && prop !== "name") {
          return tFunc(prop);
        }
        return target[prop];
      }
    });
  }, [tFunc]);

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
  // MUHIM: ilgari bu funksiya 3 ta KETMA-KET tarmoq o'qishini (stars,
  // baraka_coins, starlog — har biri o'z yozuvidan oldin) bajarardi —
  // shu sabab xarajat/daromad qo'shilgandan keyin "bog'ga tanga berish"
  // sezilarli kech bo'lardi. Sonli maydonlar (stars, baraka_coins) endi
  // db.inc() orqali SERVERDA ATOMIK oshiriladi — bir nechta addStar
  // chaqiruvi bir vaqtda ishlasa (yoki boshqa kod, masalan bog'ni
  // sug'orish, xuddi shu hujjatni parallel o'qib-yozsa) ham hech biri
  // yo'qolib qolmaydi (avvalgi "o'qi-eskisiga qo'sh-yoz" usulida kesh
  // eskirgan bo'lsa bitta yozuv boshqasini "yutib yuborishi" mumkin edi).
  // UI esa keshdan darhol (taxminiy) yangilanadi — aniq qiymat keyingi
  // db.g/gCache o'qishida serverdan tabiiy ravishda to'g'irlanadi.
  // MUHIM (dedupKey): xarajat/daromad qo'shilganda "bir marta kiritilgan
  // xarajat uchun ilova fondan qaytarilganda ham, qayta kirilganda ham
  // tanga qayta-qayta berilaveradi" degan shikoyat aniqlandi. Buni chaqirgan
  // aniq joyni ko'plab tekshiruvlar bilan ham topib bo'lmadi (barcha
  // addStar chaqiruvlari faqat foydalanuvchi harakati bilan bog'liq va
  // qayta-qayta ishga tushirilmaydi ko'rinadi) — shu sabab HIMOYA to'g'ridan-to'g'ri
  // shu yerga, markazlashtirilgan holda qo'yildi: agar chaqiruvchi o'ziga xos
  // dedupKey (masalan, xarajat hujjatining id'si) uzatsa, o'sha ID uchun
  // tanga FAQAT BIR MARTA beriladi — necha marta addStar shu ID bilan
  // chaqirilmasin (qayta render, qayta kirish, noma'lum sabab bo'lsa ham).
  // localStorage'da saqlanadi — ilova process o'chib qayta ishga tushsa ham
  // (Android fondan qaytarganda ko'pincha shunday bo'ladi) saqlanib qoladi.
  const addStar = useCallback(async (count = 1, reason = "", dedupKey = null) => {
    if (!user?.oilaId) return;
    try {
      if (dedupKey) {
        const seenLsKey = "oilaV7_starDedup_" + user.oilaId;
        let seen = [];
        try { seen = JSON.parse(localStorage.getItem(seenLsKey) || "[]"); } catch {}
        if (seen.includes(String(dedupKey))) return;
        seen.push(String(dedupKey));
        if (seen.length > 500) seen = seen.slice(-500);
        try { localStorage.setItem(seenLsKey, JSON.stringify(seen)); } catch {}
      }
      const cachedStars = db.gCache("stars_" + user.oilaId);
      const optimisticStars = Math.max(0, (cachedStars != null ? cachedStars : 0) + count);
      setStars(optimisticStars);
      db.inc("stars_" + user.oilaId, count).catch(() => {});

      const coinMap = { "Xarajat kiritildi": 5, "Expense added": 5, "Daromad kiritildi": 10, "Income added": 10, "Vazifa bajarildi": 15, "Task completed": 15, "Maqsadga yetildi": 50, "Goal reached": 50 };
      const coinAmt = coinMap[reason] || count;
      db.inc("baraka_coins_" + user.oilaId, coinAmt).catch(() => {});

      setCoinEarnedTrigger({ count, ts: Date.now() });

      const cachedLog = db.gCache("starlog_" + user.oilaId);
      const log = (cachedLog != null ? cachedLog : await db.g("starlog_" + user.oilaId)) || [];
      log.unshift({ uid: user.id, ism: user.ism, count, reason, sana: new Date().toISOString() });
      db.s("starlog_" + user.oilaId, log.slice(0, 50)).catch(() => {});
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
      
      const L = (uz, ru, en, kk, ky, tg, qr) => {
        return lg === "uz" ? uz :
               lg === "ru" ? ru :
               lg === "kk" ? kk :
               lg === "ky" ? ky :
               lg === "tg" ? tg :
               lg === "qr" ? qr :
               en;
      };

      if (res.data?.success) {
        ok$(L("Xarid muvaffaqiyatli tasdiqlandi!", "Покупка успешно подтверждена!", "Purchase verified successfully!", "Сатып алу сәтті расталды!", "Сатып алуу ийгиликтүү тастыкталды!", "Харид бомуваффақият тасдиқ шуд!", "Satıp alıw tabıslı tastıyıqlandı!"));
        return { success: true, data: res.data };
      } else {
        throw new Error(res.data?.message || "Xaridni tasdiqlashda xatolik yuz berdi");
      }
    } catch (e) {
      console.error("activatePremium Error:", e);
      const L = (uz, ru, en, kk, ky, tg, qr) => {
        return lg === "uz" ? uz :
               lg === "ru" ? ru :
               lg === "kk" ? kk :
               lg === "ky" ? ky :
               lg === "tg" ? tg :
               lg === "qr" ? qr :
               en;
      };
      ok$(L("To'lovni tasdiqlashda xato yuz berdi", "Произошла ошибка при подтверждении платежа", "Error verifying payment", "Төлемді растау кезінде қате кетті", "Төлөмдү тастыктоодо ката кетти", "Ҳангоми тасдиқи пардохт хатогӣ рӯй дод", "To'lemdi tastıyıqlawda qa'telik ju'z berdi"), "err");
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
    syncDailyReminderRef, authBusyRef,
    // Functions
    ok$, buzz, addStar, addNotif, logout, fireConfetti, activatePremium,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
