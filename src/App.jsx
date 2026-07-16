// App.jsx v40 — refactored: hooks ajratildi, App.jsx kichraytirildi
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useApp } from "./context/AppContext.jsx";

// Pages
import DashboardPage  from "./pages/Dashboard.jsx";
import ReportsPage    from "./pages/Reports.jsx";
import GoalsPage      from "./pages/Goals.jsx";
import DebtsPage      from "./pages/Debts.jsx";
import ProfilePage    from "./pages/Profile.jsx";
import TasksPage      from "./pages/Tasks.jsx";
import ChartsPage     from "./pages/Charts.jsx";
import LoginPage      from "./pages/Login.jsx";
import OnboardingPage from "./pages/Onboarding.jsx";
import Garden         from "./Garden.jsx";
import BilimBozor     from "./BilimBozor.jsx";
import BilimHub       from "./bilim/BilimHub.jsx";

// Components
import BottomNav             from "./components/ui/BottomNav.jsx";
import AddTransactionModal   from "./components/transaction/AddTransactionModal.jsx";
import { Tst, Av }           from "./components/common/index.jsx";
import { Ico }               from "./utils/icons.jsx";
import { makeS }             from "./utils/styles.js";
import Confetti              from "./components/common/Confetti.jsx";
import NotifCenter          from "./components/common/NotifCenter.jsx";
import ActivityCenter       from "./pages/ActivityCenter.jsx";
import PremiumModal          from "./components/modals/PremiumModal.jsx";
import QarzDonePrompt        from "./components/modals/QarzDonePrompt.jsx";
import PartialQarzModal      from "./components/modals/PartialQarzModal.jsx";
import InviteQarzModal       from "./components/modals/InviteQarzModal.jsx";
import MaqsadConfirmModal    from "./components/modals/MaqsadConfirmModal.jsx";
import AddVazifaModal        from "./components/modals/AddVazifaModal.jsx";
import KidCreatedModal       from "./components/modals/KidCreatedModal.jsx";
import AddGiftModal          from "./components/modals/AddGiftModal.jsx";
import VerifyTilxatModal     from "./components/modals/VerifyTilxatModal.jsx";
import AskTelModal           from "./components/modals/AskTelModal.jsx";
import VoiceInputModal       from "./components/modals/VoiceInputModal.jsx";
import ReceiptScannerModal   from "./components/modals/ReceiptScannerModal.jsx";
import TilxatViewModal       from "./components/modals/TilxatViewModal.jsx";
import HelpModal             from "./components/modals/HelpModal.jsx";
import ProductTour           from "./components/ProductTour.jsx";
import { DASHBOARD_TOUR_STEPS } from "./utils/tourSteps.js";
import { BarakaLeafFloating } from "./components/ui/BarakaLeafFloating.jsx";

// Hooks
import { useAuth }           from "./hooks/useAuth.js";
import { useTransactions }   from "./hooks/useTransactions.js";
import { useGoals }          from "./hooks/useGoals.js";
import { useFamily }         from "./hooks/useFamily.js";
import { useDebts }          from "./hooks/useDebts.jsx";
import { useAIAdvice }       from "./hooks/useAIAdvice.js";
import { useNotifications }  from "./hooks/useNotifications.js";
import { useGarden }         from "./hooks/useGarden.js";
import { usePremium }        from "./hooks/usePremium.js";
import { useExchangeRates }  from "./hooks/useExchangeRates.js";
import { useVoiceInput }     from "./hooks/useVoiceInput.js";
import { useQRScanner }      from "./hooks/useQRScanner.js";
import { useExport }         from "./hooks/useExport.js";
import { useScreenTime }     from "./hooks/useScreenTime.js";
import { useDailyReminder }  from "./hooks/useDailyReminder.js";
import { usePushToken }      from "./hooks/usePushToken.js";
import ScreenTimeLockScreen  from "./components/ScreenTimeLockScreen.jsx";
import AppLockScreen         from "./components/AppLockScreen.jsx";
import { Capacitor }         from "@capacitor/core";
import { App as CapApp }     from "@capacitor/app";

// Utils
import { td, nt, tm, fmtN, normTel, hp, sonSoz, fullName } from "./utils/formatters.js";
import { MK, KATS, KN, DARS, DN, VALS, COUNTRIES, ONB_SLIDES, TL } from "./utils/constants.js";
import { db, auth, setOwnerCtx, fbAuth } from "./firebase.js";
import { canAssignTask, canDeleteTask } from "./utils/permissions.js";

export default function App() {
  const {
    user, setUser, oila, setOila, azolar, setAzolar,
    isPremium, setIsPremium,
    xar, setXar, dar, setDar, maq, setMaq,
    qarzlar, setQarzlar, vazifalar, setVazifalar,
    kidBalances, setKidBalances, notifs, setNotifs,
    qarzReqs, setQarzReqs, xReqs, setXReqs,
    rates, setRates, rateL, stars, setStars, gardenData, setGardenData,
    dark, setDark, lg, setLg, val, setVal,
    scr, setScr, bilimInitialView, setBilimInitialView, tst, boot, setBoot, onbStep, setOnbStep,
    th, t, confetti, fireConfetti,
    maqsadConfirmNotif, setMaqsadConfirmNotif,
    ok$, buzz, addStar, addNotif, logout,
    syncDailyReminderRef,
  } = useApp();

  const [appUnlocked, setAppUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  // Load PIN status
  useEffect(() => {
    if (user?.id) {
      db.g("security_" + user.id).then(sec => {
        if (sec && typeof sec === "object" && sec.pinHash) {
          setHasPin(true);
        } else {
          setHasPin(false);
        }
      }).catch(err => {
        console.error("Failed to load security settings", err);
        setHasPin(false);
      });
    } else {
      setHasPin(false);
      setAppUnlocked(false);
    }
  }, [user?.id]);

  // Background state lock listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = document.visibilityState === "visible";
      if (!active && user?.id && hasPin) {
        setAppUnlocked(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    let capListener = null;
    if (Capacitor.isNativePlatform()) {
      try {
        CapApp.addListener("appStateChange", ({ isActive }) => {
          if (!isActive && user?.id && hasPin) {
            setAppUnlocked(false);
          }
        }).then(listener => {
          capListener = listener;
        });
      } catch (e) {
        console.warn("Capacitor state listener error", e);
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (capListener) {
        try {
          capListener.remove();
        } catch (e) {}
      }
    };
  }, [user?.id, hasPin]);

  // ── Hooks ────────────────────────────────────────────────
  const { loadFam } = useAuth();
  const { addX, addD, delTx, editTx } = useTransactions();
  const {
    tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq,
    editMq, setEditMq, editMqS, setEditMqS, editMqN, setEditMqN,
    confirmMaqParent, confirmMaqKid, parentBoughtMaqsad, parentLaterMaqsad,
    kidAcceptMaqsad, kidRejectMaqsad, confirmMaqBought, cancelMaqReturn, saveEditMq
  } = useGoals();

  const {
    vazifaDone, vazifaApprove,
    showGift,  setShowGift,
    giftSum,   setGiftSum,
    giftFrom,  setGiftFrom,
    addGiftMoney,
    showAddKid, setShowAddKid,
    kidName,   setKidName,
    kidSurname,   setKidSurname,
    kidBirthYear, setKidBirthYear,
    kidGender,    setKidGender,
    kidGrade,     setKidGrade,
    kidLogin,  setKidLogin,
    kidPw,     setKidPw,
    kidCreated, setKidCreated,
    addKidAccount, delKidAccount,
    showAddVazifa, setShowAddVazifa,
    vTitle,    setVTitle,
    vReward,   setVReward,
    vAssignee, setVAssignee,
    vEmoji,    setVEmoji,
    vDeadline, setVDeadline,
    vTargetParentId, setVTargetParentId,
    addVazifa, delVazifa, vazifaAcceptProposed,
    purgeData
  } = useFamily();
  const debts = useDebts();
  const aiAdvice = useAIAdvice();
  const screenTime = useScreenTime();
  const dailyReminder = useDailyReminder();
  
  // Register push tokens on native platforms for authenticated users
  usePushToken(user?.id);

  // Qarz sahifasi ochilganda avtomatik sinxronizatsiya (holat + balans)
  useEffect(() => {
    if (scr === "qarz" && user?.id) debts.refreshQarzReqs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scr]);

  // Vazifalar sinxronizatsiyasi: vazifa sahifasi, bola bosh sahifasi yoki login tugagach
  // XAVFSIZLIK: joriy foydalanuvchi kontekstini firebase qatlamiga uzatamiz.
  // db.s har yozuvda shu asosda _u/_o yorlig'ini qo'yadi (rules tekshiruvi uchun).
  useEffect(() => { setOwnerCtx(user?.id || null, user?.oilaId || null); }, [user?.id, user?.oilaId]);

  // (ota-ona bergan vazifa bola qurilmasida darhol ko'rinishi uchun)
  useEffect(() => {
    if (!user?.oilaId) return;
    if (!(scr === "vazifa" || (scr === "bosh" && isKid))) return;
    const loadVaz = () => {
      db.g("vazifa_" + user.oilaId).then(v => { if (Array.isArray(v)) setVazifalar(v); }).catch(() => {});
      if (isKid) db.g("notif_" + user.id).then(n => { if (Array.isArray(n)) setNotifs(n); }).catch(() => {});
      db.g("kidbal_" + user.oilaId).then(k => {
        if (!k || typeof k !== "object") return;
        // Bola: dublikat (eski) yozuv id'laridagi pul o'z akkauntiga jamlanadi
        if (isKid) {
          const nmx = x => (x || "").trim().toLowerCase();
          const twins = azolar.filter(a => a.rol === "kid" && a.id !== user.id &&
            ((a.login && user.login && a.login === user.login) || (a.ism && user.ism && nmx(a.ism) === nmx(user.ism))));
          let moved = 0;
          twins.forEach(t => { if (k[t.id]) { moved += Number(k[t.id]) || 0; delete k[t.id]; } });
          if (moved > 0) { k[user.id] = (k[user.id] || 0) + moved; db.s("kidbal_" + user.oilaId, k).catch(() => {}); }
        }
        setKidBalances(k);
      }).catch(() => {});
    };
    loadVaz();
    const iv = setInterval(loadVaz, 20000); // har 20 soniyada avtomatik yangilanadi
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scr, user?.oilaId]);

  // Dublikat bola akkauntlarini tozalash (oila boshi uchun): login xaritasidagi
  // HAQIQIY akkaunt qoladi, qolganlari o'chiriladi, pullari haqiqiysiga jamlanadi
  const cleanupKidDuplicates = async () => {
    if (!isBosh) return;
    try {
      const nmx = x => (x || "").trim().toLowerCase();
      const kidsAll = azolar.filter(a => a.rol === "kid");
      const groups = {};
      kidsAll.forEach(k => { const key = nmx(k.login || k.ism); (groups[key] = groups[key] || []).push(k); });
      const kb = { ...(kidBalances || {}) };
      const removeIds = [];
      for (const key of Object.keys(groups)) {
        const group = groups[key];
        if (group.length < 2) continue;
        let realId = null;
        for (const g of group) {
          if (g.login) {
            try { const uid = await db.gFresh("kidlogin_" + g.login); if (uid && group.find(x => x.id === uid)) { realId = uid; break; } } catch (e) {}
          }
        }
        if (!realId) realId = group.sort((a, b) => String(b.id).localeCompare(String(a.id)))[0].id;
        for (const g of group) {
          if (g.id === realId) continue;
          removeIds.push(g.id);
          if (kb[g.id]) { kb[realId] = (Number(kb[realId]) || 0) + (Number(kb[g.id]) || 0); delete kb[g.id]; }
          try { await db.s("user_" + g.id, null); } catch (e) {}
        }
      }
      if (!removeIds.length) return ok$(lg === "uz" ? "Dublikat topilmadi — hammasi toza ✅" : "No duplicates found ✅");
      const ids = (oila.azolarIds || oila.azolar || []).filter(id => !removeIds.includes(id));
      const o2 = { ...oila, azolarIds: ids };
      if (oila.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: ids });
      await db.s("kidbal_" + user.oilaId, kb);
      setOila(o2); setKidBalances(kb);
      setAzolar(azolar.filter(a => !removeIds.includes(a.id)));
      ok$(lg === "uz" ? "✅ " + removeIds.length + " ta eski bola yozuvi o'chirildi, pullar jamlandi!" : "✅ Cleaned " + removeIds.length + " duplicates");
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.message || ""), "err"); }
  };

  // Maqsadlar sinxronizatsiyasi: bola pul yig'ib bo'lganda ota bannerni DARHOL ko'rsin
  useEffect(() => {
    if (!user?.oilaId) return;
    if (!(scr === "maqsad" || scr === "bosh")) return;
    const lm = () => { db.g("maq_" + user.oilaId).then(m => { if (Array.isArray(m)) setMaq(m); }).catch(() => {}); };
    lm();
    const iv = setInterval(lm, 20000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scr, user?.oilaId]);

  // Qo'lda yangilash (Vazifalar sahifasidagi tugma uchun)
  const refreshVazifalar = async () => {
    if (!user?.oilaId) return;
    try {
      const v = await db.g("vazifa_" + user.oilaId);
      if (Array.isArray(v)) setVazifalar(v);
      const k = await db.g("kidbal_" + user.oilaId);
      if (k && typeof k === "object") setKidBalances(k);
      ok$(lg === "uz" ? "Yangilandi" : "Refreshed");
    } catch (e) {}
  };
  const { markNotifRead, markAllRead, clearNotifs, unreadCount } = useNotifications();
  const { waterGarden } = useGarden();
  const { showPremModal, setShowPremModal, activatePremium } = usePremium();
  const { fetchRates } = useExchangeRates();

  // ── Local UI state ───────────────────────────────────────
  const [showNotifs,   setShowNotifs]   = useState(false);
  // Panel ochilganda bildirishnomalar bazadan yangilanadi (bola tasdiq xabarini darhol ko'rsin)
  useEffect(() => {
    if (showNotifs && user?.id) {
      db.g("notif_" + user.id).then(n => { if (Array.isArray(n)) setNotifs(n); }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotifs]);
  const [showS,        setShowS]        = useState(false);
  const [showHelp,     setShowHelp]     = useState(false);
  const [showTour,     setShowTour]     = useState(false);
  // ── Ovoz bilan kiritish ──
  const authBusyRef = useRef(false);  // ro'yxatdan o'tish/kirish davomida onChange'ni to'xtatadi
  // Boshqa sahifaga o'tilganda qidiruv yopiladi
  useEffect(() => { setShowS(false); setSrch(""); /* eslint-disable-next-line */ }, [scr]);
  const [srch,         setSrch]         = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab,  setAddModalTab]  = useState("xarajat");
  const [addStep,      setAddStep]      = useState("kat");
  const [addKat,       setAddKat]       = useState(null);
  const [hisFil,       setHisFil]       = useState("all");
  const [ctab,         setCtab]         = useState("line");
  const [showBilim,    setShowBilim]    = useState(false);
  const [showGardenInfo, setShowGardenInfo] = useState(false);
  const [pTab,         setPTab]         = useState("main");
  const [askTel,       setAskTel]       = useState(false);
  const [newT,         setNewT]         = useState("");
  const [notifEnabled, setNotifEnabled] = useState(() => { try { return localStorage.getItem("oilaV7Notif") === "1"; } catch { return false; } });
  const [notifTime,    setNotifTime]    = useState(() => { try { return localStorage.getItem("oilaV7NotifT") || "20:00"; } catch { return "20:00"; } });
  const [verifyTilxat, setVerifyTilxat] = useState(null);

  // Goals local state
  const [mN,       setMN]       = useState("");
  const [mS,       setMS]       = useState("");
  const [mR,       setMR]       = useState("#10b981");

  const importFileRef = useRef(null);
  const APP_VER = "1.0.0";
  const adminStats = null;
  const adminLoad = false;
  const loadAdminStats = () => {};

  // ── Computed ─────────────────────────────────────────────
  const STY = useMemo(() => makeS(th), [th]);
  const f = useCallback((n, sh) => fmtN(n, val, sh), [val]);
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh";
  const hasKids = azolar.some(a => a.rol === "kid");
  // Admin ilova ichida YO'Q — statistika alohida admin-sayt orqali ko'riladi.
  const isAdmin = false;
  const canSeeReport = isBosh || (oila?.reportAccess || []).includes(user?.id);

  // Auto-start Product Tour for parents on first load of Dashboard
  useEffect(() => {
    if (scr === "bosh" && user && !isKid && localStorage.getItem("oilaV7Tour") !== "1") {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [scr, isKid, user]);

  // Sync daily local notification reminder for parents when transactions or user changes
  useEffect(() => {
    if (user && !isKid) {
      dailyReminder.syncDailyReminder();
    }
  }, [xar, dar, user, isKid, dailyReminder]);

  // Assign dailyReminder.syncDailyReminder to the shared context ref
  useEffect(() => {
    syncDailyReminderRef.current = dailyReminder.syncDailyReminder;
    return () => {
      syncDailyReminderRef.current = null;
    };
  }, [dailyReminder.syncDailyReminder, syncDailyReminderRef]);

  const gN = useCallback(uid => azolar.find(a => a.id === uid)?.ism || "?", [azolar]);
  const gP = useCallback(uid => azolar.find(a => a.id === uid)?.photo || null, [azolar]);

  const bX = useMemo(() => xar.filter(x => x.sana?.startsWith(tm())), [xar]);
  const bD = useMemo(() => dar.filter(d => d.sana?.startsWith(tm())), [dar]);
  const jX  = bX.reduce((s, x) => s + Number(x.summa || 0), 0);
  const jD  = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
  const myX = bX.filter(x => x.uid === user?.id).reduce((s, x) => s + Number(x.summa || 0), 0);
  const myD = bD.filter(d => d.uid === user?.id).reduce((s, d) => s + Number(d.summa || 0), 0);
  const myBal = myD - myX;
  const bdj   = oila?.budjet || 2000000;
  const bal   = jD - jX;
  const pct   = Math.min(100, Math.round((jX / bdj) * 100));
  const bRng  = pct >= 90 ? th.rd : pct >= 70 ? th.am : th.gr;

  const srchR = useMemo(() => {
    if (!srch.trim()) return [];
    const q = srch.toLowerCase();
    return [...xar.filter(x => x.izoh?.toLowerCase().includes(q)), ...dar.filter(d => d.izoh?.toLowerCase().includes(q))].slice(0, 20);
  }, [srch, xar, dar]);

  const lineD = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      days.push({ k: d.toLocaleDateString("uz-UZ", { weekday: "short" }), x: Math.round(xar.filter(x => x.sana === k).reduce((s, x) => s + Number(x.summa || 0), 0) / 1000), d: Math.round(dar.filter(x => x.sana === k).reduce((s, x) => s + Number(x.summa || 0), 0) / 1000) });
    }
    return days;
  }, [xar, dar]);

  const barD = useMemo(() => {
    const m = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = d.toISOString().slice(0, 7);
      m.push({ o: d.toLocaleDateString("uz-UZ", { month: "short" }), v: Math.round(xar.filter(x => x.sana?.startsWith(k)).reduce((s, x) => s + Number(x.summa || 0), 0) / 1000) });
    }
    return m;
  }, [xar]);

  const pieD = useMemo(() => KATS.map((k, i) => ({
    name: (KN[lg] || KN.uz)[i], value: bX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0), color: k.c,
  })).filter(d => d.value > 0), [bX, lg]);

  const {
    showVoice, setShowVoice,
    voiceOn, setVoiceOn,
    voiceText, setVoiceText,
    voiceParsed, setVoiceParsed,
    startVoice, stopVoice, applyVoice
  } = useVoiceInput();

  const {
    showScanner, setShowScanner,
    scanMsg, setScanMsg,
    scanPrefill, setScanPrefill,
    scanVideoRef, scanStreamRef, scanRafRef,
    startScanner, stopScanner, openWithPrefill
  } = useQRScanner({ setShowAddModal, setAddModalTab, setAddStep, setAddKat });

  const {
    exportLoading, exportExcel, exportPDF, downloadFile
  } = useExport({ bX, bD, bdj, gN, canSeeReport, tm, qarzlar });



  // ── Boot / Auth ──────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn("Safety boot trigger activated (Firebase check took longer than 1.5s)");
        setBoot(false);
      }
    }, 1500);

    (async () => {
      try {
        // Google redirect tekshirish
        try {
          const { getRedirectResult } = await import("firebase/auth");
          const { fbAuth: _fbAuth } = await import("./firebase.js");
          const result = await getRedirectResult(_fbAuth);
          if (result?.user) {
            const gUser = result.user;
            localStorage.removeItem("oilaV7GooglePending");
            let u = await db.g("user_" + gUser.uid);
            const pendingJoinR = (localStorage.getItem("oilaV7GoogleJoin") || "").trim();
            localStorage.removeItem("oilaV7GoogleJoin");
            if (!u && pendingJoinR) {
              // Join rejimi (redirect orqali): kodi bo'yicha mavjud oilaga qo'shamiz
              u = await googleJoinFamily(gUser, pendingJoinR);
              if (!u) { if (active) setBoot(false); return; }
              localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
              if (active) {
                setUser(u); await loadFam(u); setScr("bosh"); if (!u.tel) setAskTel(true); setBoot(false);
              }
              return;
            }
            if (!u) {
              const uid = gUser.uid;
              const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
              const email = (gUser.email || "").toLowerCase();
              const famId = "fam_" + uid + "_" + Date.now();
              setOwnerCtx(uid, famId);  // xavfsizlik: yozuvlardan oldin kontekst
              u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg: "uz", dark: false, registeredAt: new Date().toISOString(), loginMethod: "google" };
              await db.s("user_" + uid, u);
              const gFam = { id: famId, nomi: displayName + " oilasi", boshId: uid, azolar: [uid], azolarIds: [uid], budjet: 2000000, katLimits: {}, yaratilgan: new Date().toISOString() };
              await db.s("fam_" + famId, gFam); await db.s("oila_" + famId, gFam);
              if (email) await db.s("em_" + email, uid);
            }
            localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
            if (active) {
              setUser(u); await loadFam(u); setScr("bosh"); if (!u.tel) setAskTel(true); setBoot(false);
            }
            return;
          }
          localStorage.removeItem("oilaV7GooglePending");
        } catch (e) { localStorage.removeItem("oilaV7GooglePending"); console.error("Google redirect:", e); }

        auth.onChange(async (fbUser) => {
          // Ro'yxatdan o'tish/kirish jarayoni ketayotgan bo'lsa — aralashmaymiz.
          // doAuth() o'zi to'g'ri user'ni o'rnatadi va ma'lumot yuklaydi.
          if (authBusyRef.current) return;
          if (fbUser) {
            let uid = null;
            try { const s = localStorage.getItem("oilaV7"); if (s) uid = JSON.parse(s).uid; } catch {}
            if (!uid) uid = fbUser.uid;
            let u = await db.g("user_" + uid);
            if (!u && uid !== fbUser.uid) u = await db.g("user_" + fbUser.uid);
            if (u && active) { localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id })); setUser(u); setScr("bosh"); loadFam(u); }
          }
        });

        const dl = localStorage.getItem("oilaV7L"); if (dl) setLg(dl);
        const dd = localStorage.getItem("oilaV7D"); if (dd != null) setDark(dd !== "false");
        const dv = localStorage.getItem("oilaV7V"); if (dv) { const v = VALS.find(x => x.id === dv); if (v) setVal(v); }

        try {
          const params = new URLSearchParams(window.location.search);
          const tx = params.get("tilxat"); if (tx) { try { setVerifyTilxat(JSON.parse(tx)); } catch {} }
        } catch {}
      } catch (e) {
        console.error("Boot error:", e);
      } finally {
        if (active) {
          setBoot(false);
          clearTimeout(safetyTimeout);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const generateTilxat = (q) => {
    debts.generateTilxat(q);
  };

  // ── Notification handlers ────────────────────────────────
  const toggleNotif = async () => {
    if (!notifEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") { setNotifEnabled(true); localStorage.setItem("oilaV7Notif", "1"); ok$(t("notif_enabled")); }
        else ok$(t("permission_denied"), "err");
      }
    } else { setNotifEnabled(false); localStorage.setItem("oilaV7Notif", "0"); ok$(t("disabled")); }
  };
  const saveNotifTime = (time) => { setNotifTime(time); localStorage.setItem("oilaV7NotifT", time); ok$(t("time_saved") + time); };

  // ── Accept/Reject xReqs ───────────────────────────────────
  const acceptXReq = async (req) => {
    // Xarajat so'rovi: qabul qilishdan OLDIN balans tekshiruvi (minusga tushmaslik)
    if (req.kind !== "income") {
      const chkD = dar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
      const chkX = xar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
      if (chkD - chkX < Number(req.summa)) {
        ok$(t("insufficient_balance") + f(Math.max(0, chkD - chkX), true), "err");
        return;
      }
    }
    const newReqs = xReqs.filter(r => r.id !== req.id);
    setXReqs(newReqs); await db.s("xreq_" + user.id, newReqs);
    if (req.kind === "income") {
      const item = { id: req.id, tur: req.tur || "sovga", summa: req.summa, izoh: req.izoh, sana: req.sana, vaqt: nt() };
      const key = "d_" + user.oilaId + "_" + user.id;
      await db.s(key, [item, ...((await db.g(key)) || [])]); setDar(d => [{ ...item, uid: user.id }, ...d]);
      ok$(t("added_to_income")); return;
    }
    const item = { id: req.id, kategoriya: req.kategoriya, summa: req.summa, izoh: req.izoh + " (so'rov: " + req.fromIsm + ")", sana: req.sana, vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]); setXar(x => [{ ...item, uid: user.id }, ...x]);
    ok$(t("expense_added"));
  };
  const rejectXReq = async (req) => {
    const newReqs = xReqs.filter(r => r.id !== req.id);
    setXReqs(newReqs); await db.s("xreq_" + user.id, newReqs);
    ok$(t("rejected"), "warn");
  };

  // ── AI maslahat ───────────────────────────────────────────
  // Lokal tahlil dvigateli — internetga bog'liq emas, HAR DOIM tahlil natijasini taqdim etadi.
  // Barcha matn t() (Firestore-backed tarjima tizimi) orqali — til qo'shish/tuzatish
  // uchun kodga tegish shart emas (locales/*.json → Firestore translations/{lang}).
  const buildLocalAdvice = () => {
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const budget = oila && oila.budjet ? oila.budjet : 2000000;
    const bal2 = totD - totX;
    const dayN = new Date().getDate();
    const tips = [];

    if (totD > 0 || totX > 0) {
      tips.push(bal2 >= 0
        ? t("ai_positiveBalance", { amount: f(bal2, true) })
        : t("ai_negativeBalance", { amount: f(-bal2, true) }));
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) tips.push(t("ai_budgetOver", { pct: bpct }));
    else if (bpct >= 80) tips.push(t("ai_budgetWarn", { pct: bpct }));
    else if (bpct > 0 && dayN <= 15 && bpct < 40) tips.push(t("ai_budgetGreat", { pct: bpct }));

    const katTotals = KATS.map((k, i) => ({ nom: (KN[lg] || KN.uz)[i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) {
      const top = katTotals[0];
      const topPct = Math.round(top.sum / totX * 100);
      tips.push(t("ai_topSpending", { category: top.nom, pct: topPct }));
    }

    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) tips.push(t("ai_savingsGood", { pct: savePct }));
      else if (savePct > 0) tips.push(t("ai_savingsSome", { pct: savePct }));
      else if (bal2 < 0) tips.push(t("ai_savingsNone"));
    }

    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) {
        if (ng.pct >= 80 && ng.pct < 100) tips.push(t("ai_goalNear", { goal: ng.ism, pct: ng.pct }));
        else if (ng.pct < 30) tips.push(t("ai_goalLow", { goal: ng.ism }));
      }
    } else {
      tips.push(t("ai_noGoal"));
    }

    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) tips.push(t("ai_debtOwed", { amount: f(meOwe, true) }));

    const genTips = t("ai_tips", { returnObjects: true });
    if (Array.isArray(genTips) && genTips.length) tips.push(t("ai_tipPrefix") + genTips[dayN % genTips.length]);

    const MOTIV = t("ai_motiv", { returnObjects: true });
    if (Array.isArray(MOTIV) && MOTIV.length) tips.push(t("ai_motivPrefix") + MOTIV[dayN % MOTIV.length]);

    if (totX === 0 && totD === 0) return t("ai_noData");

    const salom = bal2 >= 0
      ? t("ai_greetingPositive", { name: user?.ism || "" })
      : t("ai_greetingCareful", { name: user?.ism || "" });

    return salom + "\n\n" + t("ai_analysisHeader", { month: tm() }) + "\n\n" + tips.join("\n\n");
  };

  // Masofaviy maslahat o'chirildi (faqat offline va tezkor lokal tizim ishlaydi)
  const fetchRemoteAdvice = async () => {
    return null;
  };

  const aiAdv = async () => {
    return aiAdvice.aiAdv();
  };
  const _old_aiAdv = async () => {
    if (!isPremium) { setShowPremModal(true); return; }        // Premium logikasi saqlanadi
    setAdvL(true); setAdv(""); setAdvErr(""); setScr("maslahat");
    try {
      let text = null;
      try { text = await fetchRemoteAdvice(); }                // 1) masofaviy AI (sozlangan bo'lsa)
      catch (e) { text = null; }                               //    xato/oflayn → lokalga tushamiz
      if (!text) text = buildLocalAdvice();                    // 2) lokal tahlil — oflaynda ham ishlaydi
      setAdv(text);
    } catch (e) {
      // Kutilmagan runtime xato — tushunarli xabar + Retry tugmasi (Reports sahifasida)
      setAdvErr(t("ai_errorGeneric"));
    } finally {
      setTimeout(() => setAdvL(false), 400);
    }
  };


  if (boot) {
    return (
      <div style={{ ...makeS(th).pg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {Ico.logo(100, true)}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: th.t1, letterSpacing: -0.5 }}>Oila Hisobchi</div>
      </div>
    );
  }

  // ── TILXAT TEKSHIRUV SAHIFASI (QR skanerlaganda) ──────────
  if (verifyTilxat) {
    return (
      <VerifyTilxatModal
        verifyTilxat={verifyTilxat}
        th={th}
        lg={lg}
        STY={STY}
        f={f}
        onClose={() => {
          setVerifyTilxat(null);
          try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
        }}
      />
    );
  }
  if (onbStep >= 0 && onbStep < ONB_SLIDES.length) return <OnboardingPage th={th} lg={lg} setLg={setLg} dark={dark} onbStep={onbStep} setOnbStep={setOnbStep} />;
  if (scr === "login") return (
    <LoginPage
      th={th}
      STY={STY}
      lg={lg}
      setLg={setLg}
      dark={dark}
      setDark={setDark}
      setUser={setUser}
      setScr={setScr}
      setBoot={setBoot}
      loadFam={loadFam}
      t={t}
      ok$={ok$}
      isPremium={isPremium}
      val={val}
      setVal={setVal}
    />
  );

  // Application Lock Screen Security Check
  if (user?.id && hasPin && !appUnlocked) {
    return <AppLockScreen th={th} lg={lg} uid={user.id} onUnlock={() => setAppUnlocked(true)} />;
  }

  // ── Nav items ─────────────────────────────────────────────
  const navItems = isKid
    ? [{ id: "bosh", lb: t.home }, { id: "vazifa", lb: t.tasks }, { id: "bilim", lb: t.learn }, { id: "maqsad", lb: t.goal }]
    : [{ id: "bosh", lb: t.home }, { id: "qarz", lb: t.debts }, { id: "qoshish", pr: true }, { id: "maqsad", lb: t.goal }, { id: "hisobot", lb: t.rep }];

  // ── Shared page props ─────────────────────────────────────
  const pageProps = {
    user, oila, azolar, xar, dar, maq, qarzlar, vazifalar,
    kidBalances, notifs, qarzReqs, xReqs, rates, stars, gardenData,
    setXar, setDar, setMaq, setQarzlar, setVazifalar,
    setKidBalances, setNotifs, setStars,
    dark, lg, val, setScr, scr, isPremium, isKid, isBosh, hasKids, isAdmin,
    th, STY, t, f, ok$, buzz, addStar, addNotif, fireConfetti,
    showPremModal, setShowPremModal, activatePremium,
    gN, gP, bX, bD, jX, jD, myX, myD, myBal, bal, bdj, pct, bRng,
    canSeeReport, srchR, lineD, barD, pieD,
    acceptXReq, rejectXReq, delTx, editTx,
  };

  return (
    <div style={STY.pg}>
      <Tst msg={tst.msg} type={tst.type} th={th} />

      {/* Global Modals */}
      {isKid && screenTime.isOverLimit && (
        <ScreenTimeLockScreen
          th={th}
          lg={lg}
          todayMinutes={screenTime.todayMinutes}
          dailyLimit={screenTime.dailyLimit}
          extraMinutesToday={screenTime.extraMinutesToday}
          requestExtraTime={screenTime.requestExtraTime}
        />
      )}
      {confetti && <Confetti th={th} />}
      {showNotifs && <NotifCenter notifs={notifs} th={th} lg={lg} isKid={isKid} onClose={() => setShowNotifs(false)} onMarkRead={markNotifRead} onMarkAll={markAllRead} onClear={clearNotifs} onConfirmParent={confirmMaqParent} onConfirmKid={confirmMaqKid} setScr={setScr} setBilimInitialView={setBilimInitialView} onApproveTime={screenTime.approveExtraTime} onDenyTime={screenTime.denyExtraTime} />}
      {showHelp && <HelpModal th={th} lg={lg} onClose={() => setShowHelp(false)} onReplayTour={() => { setShowHelp(false); setShowTour(true); }} />}
      {showTour && <ProductTour th={th} lg={lg} steps={DASHBOARD_TOUR_STEPS} onFinish={() => { localStorage.setItem("oilaV7Tour", "1"); setShowTour(false); }} />}
      {showPremModal && <PremiumModal th={th} STY={STY} lg={lg} onActivate={activatePremium} onClose={() => setShowPremModal(false)} />}
      {askTel && user && (
        <AskTelModal
          th={th}
          lg={lg}
          newT={newT}
          setNewT={setNewT}
          saveTel={saveTel}
          onClose={() => { setAskTel(false); setNewT(""); }}
        />
      )}
      {showBilim && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: th.bg, zIndex: 1500, overflowY: "auto", padding: "16px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 430, margin: "0 auto" }}>
            <BilimHub user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} initialView={bilimInitialView} onBack={() => setShowBilim(false)} gardenData={gardenData} onGarden={() => { setShowBilim(false); setScr("profil"); setPTab("garden"); }} />
          </div>
        </div>
      )}

      {/* Global: Vazifa modal */}
      {showAddVazifa && (
        <AddVazifaModal
          th={th}
          lg={lg}
          dark={dark}
          azolar={azolar}
          isKid={isKid}
          user={user}
          vAssignee={vAssignee}
          setVAssignee={setVAssignee}
          vEmoji={vEmoji}
          setVEmoji={setVEmoji}
          vTitle={vTitle}
          setVTitle={setVTitle}
          vReward={vReward}
          setVReward={setVReward}
          vDeadline={vDeadline}
          setVDeadline={setVDeadline}
          vTargetParentId={vTargetParentId}
          setVTargetParentId={setVTargetParentId}
          addVazifa={addVazifa}
          onClose={() => setShowAddVazifa(false)}
        />
      )}

      {showGift && isKid && (
        <AddGiftModal
          th={th}
          lg={lg}
          STY={STY}
          giftSum={giftSum}
          setGiftSum={setGiftSum}
          giftFrom={giftFrom}
          setGiftFrom={setGiftFrom}
          addGiftMoney={addGiftMoney}
          onClose={() => setShowGift(false)}
          f={f}
        />
      )}
      {debts.partialQarz && <PartialQarzModal q={debts.partialQarz} partialSum={debts.partialSum} setPartialSum={debts.setPartialSum} th={th} STY={STY} lg={lg} f={f} t={t} onConfirm={debts.applyPartial} onClose={() => { debts.setPartialQarz(null); debts.setPartialSum(""); }} />}
      {debts.tilxatView && (
        <TilxatViewModal
          tilxatView={debts.tilxatView}
          th={th}
          lg={lg}
          ok$={ok$}
          downloadFile={downloadFile}
          onClose={() => debts.setTilxatView(null)}
        />
      )}
      {debts.inviteQarz && <InviteQarzModal inviteQarz={debts.inviteQarz} th={th} lg={lg} user={user} qarzTur={debts.qarzTur} qarzKim={debts.qarzKim} qarzSum={debts.qarzSum} qarzlar={qarzlar} setQarzlar={setQarzlar} ok$={ok$} t={t} f={f} onClose={() => debts.setInviteQarz(null)} />}
      {maqsadConfirmNotif && <MaqsadConfirmModal info={maqsadConfirmNotif} th={th} lg={lg} f={f} STY={STY} onBought={confirmMaqBought} onCancel={cancelMaqReturn} maq={maq} setScr={setScr} />}

      {/* Header */}
      <div style={{ background: th.sur, padding: "14px 18px 10px", borderBottom: "1px solid " + th.bor, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ ...STY.row, marginBottom: scr === "bosh" && !showS ? 10 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { setScr("profil"); setPTab("main"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, position: "relative" }}>
              <Av src={user?.photo} name={user?.ism} size={36} ac={th.ac} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: th.gr, border: "2px solid " + th.sur }} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{fullName(user) || t.app}</span>
                {isPremium && <span style={{ fontSize: 8, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", color: "#fff", borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>PRO</span>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: -0.2 }}>
                {(lg === "uz" || lg === "qr") ? <><span style={{ color: th.ac }}>Oila</span><span style={{ color: th.gr }}>Hisobchi</span></> : (lg === "ru" || lg === "kk" || lg === "ky" || lg === "tg") ? <><span style={{ color: th.ac }}>Семейный</span><span style={{ color: th.gr }}>Бюджет</span></> : <><span style={{ color: th.ac }}>Family</span><span style={{ color: th.gr }}>Budget</span></>}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => { setShowS(v => !v); setSrch(""); }} style={{ background: showS ? th.ac + "18" : "transparent", border: "1px solid " + (showS ? th.ac : th.bor), borderRadius: 10, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {Ico.search(showS ? th.ac : th.t2)}
            </button>
            <button id="tour-notifs" onClick={() => setShowNotifs(true)} style={{ background: "transparent", border: "1px solid " + th.bor, borderRadius: 10, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a4.5 4.5 0 00-4.5 4.5v2.7L3 12h12l-1.5-2.8V6.5A4.5 4.5 0 009 2z" fill={th.t2} opacity=".15" stroke={th.t2} strokeWidth="1.3" strokeLinejoin="round" /><path d="M7.5 14.5a1.5 1.5 0 003 0" stroke={th.t2} strokeWidth="1.3" strokeLinecap="round" /></svg>
              {unreadCount > 0 && <div style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: th.rd, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 99 ? "99+" : unreadCount}</div>}
            </button>
            <button id="tour-help" onClick={() => setShowHelp(true)} style={{ background: showHelp ? th.ac + "18" : "transparent", border: "1px solid " + (showHelp ? th.ac : th.bor), borderRadius: 10, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }} aria-label="Help">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showHelp ? th.ac : th.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
        </div>
        {showS && (
          <div style={{ position: "relative", marginTop: 8 }}>
            <input autoFocus style={{ ...STY.ip, marginBottom: 0, paddingRight: 40 }} value={srch} onChange={e => setSrch(e.target.value)} placeholder={t.sch} />
            <button onClick={() => { setShowS(false); setSrch(""); }} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 26, height: 26, borderRadius: "50%", background: th.surH, border: "1px solid " + th.bor, color: th.t2, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>{"\u2715"}</button>
          </div>
        )}
      </div>

      {/* Pages */}
      <div style={{ padding: "14px 16px 100px" }}>
        {scr === "bosh"    && <DashboardPage  {...pageProps} showS={showS} srch={srch} srchR={srchR} hisFil={hisFil} setHisFil={setHisFil} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} fetchRates={fetchRates} rateL={rateL} setShowGift={setShowGift} setShowBilim={setShowBilim} setShowAddVazifa={setShowAddVazifa} setPTab={setPTab} />}
        {scr === "grafik"  && <ChartsPage     {...pageProps} ctab={ctab} setCtab={setCtab} />}
        {scr === "activity" && <ActivityCenter {...pageProps} />}
        {scr === "maqsad"  && <GoalsPage      {...pageProps} tupId={tupId} setTupId={setTupId} tupS={tupS} setTupS={setTupS} editMq={editMq} setEditMq={setEditMq} editMqN={editMqN} setEditMqN={setEditMqN} editMqS={editMqS} setEditMqS={setEditMqS} maqsadConfirmNotif={maqsadConfirmNotif} setMaqsadConfirmNotif={setMaqsadConfirmNotif} addMq={addMq} tupMq={tupMq} delMq={delMq} saveEditMq={saveEditMq} confirmMaqBought={confirmMaqBought} cancelMaqReturn={cancelMaqReturn} parentBoughtMaqsad={parentBoughtMaqsad} parentLaterMaqsad={parentLaterMaqsad} kidAcceptMaqsad={kidAcceptMaqsad} kidRejectMaqsad={kidRejectMaqsad} />}
        {scr === "vazifa"  && <TasksPage      {...pageProps} showAddVazifa={showAddVazifa} setShowAddVazifa={setShowAddVazifa} showGift={showGift} setShowGift={setShowGift} giftSum={giftSum} setGiftSum={setGiftSum} giftFrom={giftFrom} setGiftFrom={setGiftFrom} vTitle={vTitle} setVTitle={setVTitle} vReward={vReward} setVReward={setVReward} vAssignee={vAssignee} setVAssignee={setVAssignee} vEmoji={vEmoji} setVEmoji={setVEmoji} vDeadline={vDeadline} setVDeadline={setVDeadline} addVazifa={addVazifa} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} vazifaAcceptProposed={vazifaAcceptProposed} delVazifa={delVazifa} addGiftMoney={addGiftMoney} cleanupKidDuplicates={cleanupKidDuplicates} isBosh={isBosh} />}
        {scr === "bilim"   && <BilimHub user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} initialView={bilimInitialView} onBack={() => setScr("bosh")} gardenData={gardenData} onGarden={() => { setScr("profil"); setPTab("garden"); }} />}
        {scr === "qarz"    && <DebtsPage      {...pageProps} {...debts} generateTilxat={generateTilxat} verifyTilxat={verifyTilxat} setVerifyTilxat={setVerifyTilxat} />}
        {(scr === "hisobot" || scr === "maslahat") && <ReportsPage    {...pageProps} hisFil={hisFil} setHisFil={setHisFil} exportLoading={exportLoading} exportExcel={exportExcel} exportPDF={exportPDF} adv={aiAdvice.adv} setAdv={aiAdvice.setAdv} advL={aiAdvice.advL} advErr={aiAdvice.advErr} aiAdv={aiAdv} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} />}
        {scr === "profil"  && <ProfilePage    {...pageProps} pTab={pTab} setPTab={setPTab} waterGarden={waterGarden} activatePremium={activatePremium} setShowPremModal={setShowPremModal} notifEnabled={notifEnabled} toggleNotif={toggleNotif} notifTime={notifTime} saveNotifTime={saveNotifTime} APP_VER={APP_VER} showBilim={showBilim} setShowBilim={setShowBilim} setBilimInitialView={setBilimInitialView} />}
      </div>

      {/* ── Ovoz bilan kiritish oynasi ── */}
      {showVoice && (
        <VoiceInputModal
          th={th}
          lg={lg}
          f={f}
          voiceOn={voiceOn}
          voiceText={voiceText}
          setVoiceText={setVoiceText}
          voiceParsed={voiceParsed}
          setVoiceParsed={setVoiceParsed}
          startVoice={startVoice}
          stopVoice={stopVoice}
          applyVoice={applyVoice}
          onClose={() => { stopVoice(); setShowVoice(false); }}
        />
      )}

      {/* ── Chek QR skaneri oynasi ── */}
      {showScanner && (
        <ReceiptScannerModal
          th={th}
          lg={lg}
          scanVideoRef={scanVideoRef}
          scanMsg={scanMsg}
          stopScanner={stopScanner}
        />
      )}

      {/* AddTransactionModal */}
      {showAddModal && <AddTransactionModal th={th} STY={STY} lg={lg} t={t} f={f} ok$={ok$} buzz={buzz} user={user} oila={oila} azolar={azolar} xar={xar} dar={dar} addX={addX} addD={addD} addModalTab={addModalTab} setAddModalTab={setAddModalTab} addStep={addStep} setAddStep={setAddStep} addKat={addKat} setAddKat={setAddKat} isPremium={isPremium} setShowPremModal={setShowPremModal} prefill={scanPrefill} onVoice={startVoice} onScan={startScanner} onClose={() => { setShowAddModal(false); setScanPrefill(null); }} />}

      {/* Baraka Bog'i Floating Leaf Logo */}
      <BarakaLeafFloating pTab={pTab} setPTab={setPTab} />

      {/* Bottom Nav */}
      <BottomNav navItems={navItems} scr={scr} setScr={setScr} th={th} isKid={isKid} buzz={buzz} setShowAddModal={setShowAddModal} setAddModalTab={setAddModalTab} setAddStep={setAddStep} setAddKat={setAddKat} vazPendingCount={vazifalar.filter(v => v.status === "done").length} setBilimInitialView={setBilimInitialView} />
    </div>
  );
}
