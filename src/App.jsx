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

// Hooks
import { useAuth }           from "./hooks/useAuth.js";
import { useTransactions }   from "./hooks/useTransactions.js";
import { useGoals }          from "./hooks/useGoals.js";
import { useFamily }         from "./hooks/useFamily.js";
import { useDebts }          from "./hooks/useDebts.js";
import { useNotifications }  from "./hooks/useNotifications.js";
import { useGarden }         from "./hooks/useGarden.js";
import { usePremium }        from "./hooks/usePremium.js";
import { useExchangeRates }  from "./hooks/useExchangeRates.js";
import { useVoiceInput }     from "./hooks/useVoiceInput.js";
import { useQRScanner }      from "./hooks/useQRScanner.js";
import { useExport }         from "./hooks/useExport.js";

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
    rates, setRates, stars, setStars, gardenData, setGardenData,
    dark, setDark, lg, setLg, val, setVal,
    scr, setScr, tst, boot, setBoot, onbStep, setOnbStep,
    th, t, confetti, fireConfetti,
    maqsadConfirmNotif, setMaqsadConfirmNotif,
    ok$, buzz, addStar, addNotif, logout,
  } = useApp();

  // ── Hooks ────────────────────────────────────────────────
  const { loadFam } = useAuth();
  const { addX, addD } = useTransactions();
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
    addVazifa, delVazifa,
    purgeData
  } = useFamily();
  const debts = useDebts();

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
  const [edN,          setEdN]          = useState(false);
  const [newN,         setNewN]         = useState("");
  const [newF,         setNewF]         = useState("");   // familya tahriri
  const [edT,          setEdT]          = useState(false);
  const [newT,         setNewT]         = useState("");
  const [askTel,       setAskTel]       = useState(false);
  const [fBj,          setFBj]          = useState("2000000");
  const [fKL,          setFKL]          = useState({});
  const [fbRating,     setFbRating]     = useState(0);
  const [fbText,       setFbText]       = useState("");
  const [fbType,       setFbType]       = useState("taklif");
  const [fbSending,    setFbSending]    = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [refCount,     setRefCount]     = useState(0);
  const [adminStats,   setAdminStats]   = useState(null);
  const [adminLoad,    setAdminLoad]    = useState(false);
  const [maqTab,       setMaqTab]       = useState("mine");
  const [addM,         setAddM]         = useState(false);
  const [rateL,        setRateL]        = useState(false);
  const [pinStep,      setPinStep]      = useState("idle");
  const [pinVal,       setPinVal]       = useState("");
  const [pinCfm,       setPinCfm]       = useState("");
  const [finger,       setFinger]       = useState(false);
  const [showImport,   setShowImport]   = useState(false);
  const [importRows,   setImportRows]   = useState([]);
  const [importStep,   setImportStep]   = useState("upload");
  const [faqO,         setFaqO]         = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(() => { try { return localStorage.getItem("oilaV7Notif") === "1"; } catch { return false; } });
  const [notifTime,    setNotifTime]    = useState(() => { try { return localStorage.getItem("oilaV7NotifT") || "20:00"; } catch { return "20:00"; } });
  const [verifyTilxat, setVerifyTilxat] = useState(null);
  const [tilxatView, setTilxatView] = useState(null); // APK/WebView uchun ichki tilxat oynasi

  // Goals local state
  const [mN,       setMN]       = useState("");
  const [mS,       setMS]       = useState("");
  const [mR,       setMR]       = useState("#10b981");

  // Auth form states
  const [reg,          setReg]          = useState(false);
  const [kidLoginMode, setKidLoginMode] = useState(false);
  const [join,         setJoin]         = useState(false);
  const [fIsm,  setFIsm]  = useState("");
  const [fEm,   setFEm]   = useState("");
  const [fPw,   setFPw]   = useState("");
  const [fON,   setFON]   = useState("");
  const [fKd,   setFKd]   = useState("");
  const [fTel,  setFTel]  = useState("");
  const [fDial, setFDial] = useState("+998");
  const [fCountry, setFCountry] = useState("uz");
  const [showValDD,    setShowValDD]    = useState(false);
  const [fRel,         setFRel]         = useState("");
  const [showCountryDD, setShowCountryDD] = useState(false);
  const [showRelDD,    setShowRelDD]    = useState(false);
  const [fRefCode,     setFRefCode]     = useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetEmail,   setResetEmail]   = useState("");
  const [resetInput,   setResetInput]   = useState("");
  const [resetSent,    setResetSent]    = useState(false);

  // AI maslahat
  const [adv,  setAdv]  = useState("");
  const [advL, setAdvL] = useState(false);
  const [advErr, setAdvErr] = useState("");

  const fRef = useRef(null);
  const importFileRef = useRef(null);
  const APP_VER = "1.0.0";

  // ── Computed ─────────────────────────────────────────────
  const STY = useMemo(() => makeS(th), [th]);
  const f = useCallback((n, sh) => fmtN(n, val, sh), [val]);
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh";
  const hasKids = azolar.some(a => a.rol === "kid");
  // Admin ilova ichida YO'Q — statistika alohida admin-sayt orqali ko'riladi.
  const isAdmin = false;
  const canSeeReport = isBosh || (oila?.reportAccess || []).includes(user?.id);

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
    name: KN[lg][i], value: bX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0), color: k.c,
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
              if (!u) { setBoot(false); return; }
              localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
              setUser(u); await loadFam(u); setScr("bosh"); if (!u.tel) setAskTel(true); setBoot(false); return;
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
            setUser(u); await loadFam(u); setScr("bosh"); if (!u.tel) setAskTel(true); setBoot(false); return;
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
            if (u) { localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id })); setUser(u); setScr("bosh"); loadFam(u); }
          }
        });

        const dl = localStorage.getItem("oilaV7L"); if (dl && TL[dl]) setLg(dl);
        const dd = localStorage.getItem("oilaV7D"); if (dd != null) setDark(dd !== "false");
        const dv = localStorage.getItem("oilaV7V"); if (dv) { const v = VALS.find(x => x.id === dv); if (v) setVal(v); }

        try {
          const params = new URLSearchParams(window.location.search);
          const rc = params.get("ref"); if (rc) { setFRefCode(rc); setReg(true); }
          const fam = params.get("fam"); if (fam) { setFKd(fam); setJoin(true); setReg(true); }
          const tx = params.get("tilxat"); if (tx) { try { setVerifyTilxat(JSON.parse(tx)); } catch {} }
        } catch {}
      } catch {}
      setBoot(false);
    })();
  }, []);

  useEffect(() => { if (scr === "bosh") fetchRates(); }, [scr]);

  // ── Auth handlers ─────────────────────────────────────────
  const switchAuthMode = (toReg, kidMode = false) => {
    setReg(toReg); setKidLoginMode(kidMode);
    setFIsm(""); setFEm(""); setFPw(""); setFTel(""); setFKd(""); setFRel(""); setFON("");
    setShowPw(false); setJoin(false);
  };
  const genPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let p = ""; for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setFPw(p); setShowPw(true); ok$(lg === "uz" ? "Parol yaratildi!" : "Password generated!");
  };
  const handleResetPw = () => { setResetInput(fEm.trim() || ""); setResetSent(false); setShowResetScreen(true); };

  const sendResetEmail = async () => {
    const email = resetInput.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ok$(lg === "uz" ? "To'g'ri email kiriting" : "Enter valid email", "err");
    let exists = false;
    try { const uid = await db.gFresh("em_" + email); if (uid) exists = true; } catch (e) { exists = false; }
    if (!exists) {
      ok$(lg === "uz" ? "Bu email ro'yxatdan o'tmagan. Ro'yxatdan o'ting." : "Email not registered. Please sign up.", "err");
      setTimeout(() => { setShowResetScreen(false); setReg(true); setFEm(email); }, 1600);
      return;
    }
    try { await auth.resetPassword(email); setResetSent(true); }
    catch (e) { ok$(lg === "uz" ? "Xato: " + (e.code || e.message) : "Error", "err"); }
  };

  // Google orqali oilaga qo'shilish (yangi foydalanuvchi + oila kodi).
  // Muvaffaqiyatda user obyektini, xatoda null qaytaradi (xabar ko'rsatib bo'lingan).
  const googleJoinFamily = async (gUser, code) => {
    const uid = gUser.uid;
    const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
    const email = (gUser.email || "").toLowerCase();
    setOwnerCtx(uid, code);
    let o = await db.g("oila_" + code);
    if (!o) o = await db.g("fam_" + code);
    if (!o) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(lg === "uz" ? "Oila kodi topilmadi: " + code : "Family code not found: " + code, "err");
      return null;
    }
    if ((o.azolarIds || o.azolar || []).length >= 2 && !o.premium) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(lg === "uz" ? "Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak." : "Family member limit reached (2). Head needs Premium.", "err");
      return null;
    }
    const nu = { id: uid, ism: displayName, email, tel: "", ph: null, photo: gUser.photoURL || null, oilaId: code, rol: "azo", rel: "boshqa", registeredAt: new Date().toISOString(), loginMethod: "google" };
    await db.s("user_" + uid, nu); if (email) await db.s("em_" + email, uid);
    await db.s("x_" + code + "_" + uid, []); await db.s("d_" + code + "_" + uid, []);
    const mIds = [...new Set([...(o.azolarIds || o.azolar || []), uid])];
    o.azolarIds = mIds; o.azolar = mIds; if (!o.id) o.id = code;
    await db.s("oila_" + code, o); await db.s("fam_" + code, o);
    return nu;
  };

  const handleGoogleUser = async (gUser) => {
    let u = await db.g("user_" + gUser.uid);
    const pendingJoin = (localStorage.getItem("oilaV7GoogleJoin") || "").trim();
    localStorage.removeItem("oilaV7GoogleJoin");
    if (!u && pendingJoin) {
      // Join rejimi: yangi oila ochmaymiz — kodi bo'yicha mavjud oilaga qo'shamiz.
      u = await googleJoinFamily(gUser, pendingJoin);
      if (!u) return;
      localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
      setUser(u); await loadFam(u); setScr("bosh"); setAskTel(true);
      ok$(t.jf2);
      return;
    }
    if (!u) {
      const uid = gUser.uid;
      const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
      const email = (gUser.email || "").toLowerCase();
      const famId = "fam_" + uid + "_" + Date.now();
      setOwnerCtx(uid, famId);
      u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg, dark, registeredAt: new Date().toISOString(), loginMethod: "google" };
      await db.s("user_" + uid, u);
      const gFam = { id: famId, nomi: displayName + (lg === "uz" ? " oilasi" : " family"), boshId: uid, azolar: [uid], azolarIds: [uid], budjet: 2000000, katLimits: {}, yaratilgan: new Date().toISOString() };
      await db.s("fam_" + famId, gFam); await db.s("oila_" + famId, gFam);
      if (email) await db.s("em_" + email, uid);
    }
    localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
    setUser(u); await loadFam(u); setScr("bosh"); if (!u.tel) setAskTel(true);
    ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + u.ism + " 👋");
  };
  const doGoogleLogin = async () => {
    try {
      // Join rejimi + kod bor: redirect bo'lsa ham yo'qolmasligi uchun saqlaymiz
      if (join && fKd.trim()) localStorage.setItem("oilaV7GoogleJoin", fKd.trim());
      else localStorage.removeItem("oilaV7GoogleJoin");
      const res = await auth.googleLogin();
      if (res?.user) await handleGoogleUser(res.user);
    } catch (e) {
      localStorage.removeItem("oilaV7GoogleJoin");
      if (e.code !== "auth/popup-closed-by-user") {
        ok$((lg === "uz" ? "Google bilan kirishda xato: " : "Google sign-in error: ") + (e.message || e.code), "err");
      }
    }
  };

  const doAuth = async () => {
    authBusyRef.current = true;  // onChange'ni to'xtatib turamiz (jarayon tugagach o'chiramiz)
    try {
      // BOLA KIRISHI (login + parol, telefonsiz)
      if (kidLoginMode) {
        const loginKey = fTel.trim().toLowerCase();
        if (!loginKey || !fPw.trim()) return ok$(lg === "uz" ? "Login va parolni yozing" : "Enter login and password", "err");
        // Lookup endi obyekt: { uid, oila } (eski yozuvlar oddiy string — uid)
        const look = await db.gFresh("kidlogin_" + loginKey);
        if (!look) return ok$(lg === "uz" ? "Login topilmadi. Ota-onangdan so'ra." : "Login not found", "err");
        const kidUid  = (typeof look === "object" && look) ? look.uid : look;
        const kidOila = (typeof look === "object" && look) ? (look.oila || null) : null;
        if (!kidUid) return ok$(lg === "uz" ? "Login topilmadi. Ota-onangdan so'ra." : "Login not found", "err");
        buzz(15);
        // ANON HISOB YIG'ILISHINING OLDINI OLISH: agar allaqachon anonim
        // sessiya bo'lsa — QAYTA ISHLATAMIZ, yangi anonim hisob YARATMAYMIZ.
        try {
          if (!fbAuth.currentUser || !fbAuth.currentUser.isAnonymous) await auth.loginAnon();
        } catch (e) { console.error("Anon login:", e); return ok$(lg === "uz" ? "Firebase Anonymous yoqilmagan!" : "Anonymous auth not enabled", "err"); }
        const freshAnon = !!(fbAuth.currentUser && fbAuth.currentUser.isAnonymous);
        // MUHIM TARTIB: ksess AVVAL yoziladi — Firestore Rules bola (user_<kidUid>)
        // hujjatini o'qishga ruxsatni ksess_<anon>.v.oila / v.kid orqali beradi.
        const anonUid = auth.current()?.uid;
        const phv = await hp(fPw);
        setOwnerCtx(kidUid, kidOila);  // xavfsizlik: bola konteksti (yozuvlardan oldin)
        try {
          if (anonUid) await db.s("ksess_" + anonUid, { kid: kidUid, oila: kidOila, ph: phv });
        } catch (e) {
          try { await auth.logout(); } catch (e2) {}
          return ok$(lg === "uz" ? "Kirishda xato, qayta urinib ko'ring" : "Sign-in error, try again", "err");
        }
        const ku = await db.g("user_" + kidUid);
        if (!ku || ku.rol !== "kid") {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(kidOila
            ? (lg === "uz" ? "Login topilmadi" : "Not found")
            : (lg === "uz" ? "Akkaunt yangilanishi kerak: ota-onangiz ilovani bir marta ochib qo'ysin, keyin qayta urinib ko'r." : "Account needs an update: ask a parent to open the app once, then retry."), "err");
        }
        if (phv !== ku.ph) {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(lg === "uz" ? "Parol noto'g'ri" : "Wrong password", "err");
        }
        // ksess'dagi oila'ni haqiqiy qiymat bilan moslash (legacy lookup holati)
        try { if (anonUid && (ku.oilaId || null) !== kidOila) await db.s("ksess_" + anonUid, { kid: kidUid, oila: ku.oilaId || null, ph: phv }); } catch (e) {}
        setOwnerCtx(kidUid, ku.oilaId || kidOila);
        // O'z-o'zini davolash: bola oilaId'si ota-onaning JORIY oilasi bilan moslanadi
        // (eski migratsiyadan keyin farq qilib qolgan bo'lsa, vazifa/balans boshqa kalitga tushardi)
        try {
          if (ku.parentId) {
            const pu = await db.g("user_" + ku.parentId);
            if (pu?.oilaId && pu.oilaId !== ku.oilaId) { ku.oilaId = pu.oilaId; await db.s("user_" + ku.id, ku); }
          }
        } catch (e2) {}
        localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
        setUser(ku); await loadFam(ku); setScr("bosh");
        ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + ku.ism + " 👋");
        return;
      }
      if (reg) {
        if (!fIsm.trim() || !fTel.trim() || fPw.length < 6) return ok$(lg === "uz" ? "Ism, telefon va parol (6+ belgi) kiriting" : "Enter name, phone and password (6+)", "err");
        if (!fEm.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim())) return ok$(lg === "uz" ? "To'g'ri email kiriting" : "Enter valid email", "err");
        if (await db.g("tel9_" + normTel(fTel))) return ok$(lg === "uz" ? "Bu telefon allaqachon ro'yxatda" : "Phone already registered", "err");

        // ── DASTLABKI (kirishsiz) tekshiruvlar ──
        if (join) {
          if (!fKd.trim()) return ok$(t.fa, "err");
        } else {
          if (!fON.trim()) return ok$(t.fa, "err");
        }

        let authUser;
        try { authUser = await auth.register(fEm.trim().toLowerCase(), fPw); }
        catch (e) {
          const msg = e.code === "auth/email-already-in-use" ? (lg === "uz" ? "Bu email allaqachon ishlatilgan" : "Email already in use") : e.code === "auth/weak-password" ? (lg === "uz" ? "Parol juda zaif (6+ belgi)" : "Weak password") : (lg === "uz" ? "Ro'yxatda xato: " : "Register error: ") + (e.code || e.message);
          return ok$(msg, "err");
        }
        const uid = authUser.uid, ph = await hp(fPw);
        if (join) {
          // Endi kirilgan — oila konteksti bilan oila_ hujjatini o'qiy olamiz.
          setOwnerCtx(uid, fKd.trim());  // qo'shilayotgan oila konteksti
          const fid = fKd.trim();
          // Oila hujjati ikki xil kalitda bo'lishi mumkin:
          //   oila_<id> (email orqali ochilgan) yoki fam_<id> (Google orqali ochilgan).
          let o = await db.g("oila_" + fid);
          if (!o) o = await db.g("fam_" + fid);
          // Oila topilmasa yoki to'lgan bo'lsa — chala akkauntni o'chirib, to'xtaymiz.
          if (!o) { await auth.deleteCurrentUser(); setOwnerCtx(null, null); return ok$(t.ffe, "err"); }
          if ((o.azolarIds || o.azolar || []).length >= 2 && !o.premium) {
            await auth.deleteCurrentUser(); setOwnerCtx(null, null);
            return ok$(lg === "uz" ? "Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak." : "Family member limit reached (2). Head needs Premium.", "err");
          }
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: fKd.trim(), rol: "azo", rel: fRel || "boshqa", photo: null };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim();
            if (refUid && refUid !== uid) {
              // XAVFSIZLIK: begona profil o'qilmaydi — referal alohida hujjat,
              // mavjud bo'lmagan kod bo'lsa Rules yozuvni o'zi rad etadi.
              try {
                await db.s("refi_" + refUid + "_" + uid, { uid, ism: fIsm.trim(), sana: new Date().toISOString() }, { c: "ref_" + refUid });
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: lg === "uz" ? "Yangi taklif! 🎉" : "New referral!", body: (fIsm.trim()) + " " + (lg === "uz" ? "sizning havolangiz orqali qo'shildi" : "joined via your link"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              } catch (eRef) {}
            }
          }
          await db.s("x_" + fKd.trim() + "_" + uid, []); await db.s("d_" + fKd.trim() + "_" + uid, []);
          const mIds = [...new Set([...(o.azolarIds || o.azolar || []), uid])];
          o.azolarIds = mIds; o.azolar = mIds; if (!o.id) o.id = fid;
          // Ikkala kalitga ham yozamiz — bundan keyin doim sinxron bo'ladi
          await db.s("oila_" + fid, o); await db.s("fam_" + fid, o);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); await loadFam(nu); setScr("bosh"); ok$(t.jf2); addStar(15, lg === "uz" ? "Oila azosi qoshildi" : "Family member added");
        } else {
          const oid = "o" + Date.now();
          setOwnerCtx(uid, oid);
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: oid, rol: "bosh", rel: "bosh", photo: null };
          const no_ = { id: oid, nomi: fON.trim(), boshId: uid, azolarIds: [uid], budjet: 2000000, katLimits: {} };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim();
            if (refUid && refUid !== uid) {
              // XAVFSIZLIK: begona profil o'qilmaydi — referal alohida hujjat,
              // mavjud bo'lmagan kod bo'lsa Rules yozuvni o'zi rad etadi.
              try {
                await db.s("refi_" + refUid + "_" + uid, { uid, ism: fIsm.trim(), sana: new Date().toISOString() }, { c: "ref_" + refUid });
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: lg === "uz" ? "Yangi taklif! 🎉" : "New referral!", body: (fIsm.trim()) + " " + (lg === "uz" ? "sizning havolangiz orqali qo'shildi" : "joined via your link"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              } catch (eRef) {}
            }
          }
          await db.s("oila_" + oid, no_); await db.s("fam_" + oid, { ...no_, azolar: no_.azolarIds }); await db.s("x_" + oid + "_" + uid, []); await db.s("d_" + oid + "_" + uid, []);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); setOila(no_); setAzolar([nu]); setXar([]); setDar([]); setMaq([]); setScr("bosh"); ok$(t.fc3);
        }
      } else {
        // BOLA LOGINI: agar email/telefon emas, oddiy login kiritilgan bo'lsa
        const tryLogin = fTel.trim().toLowerCase();
        if (tryLogin && !tryLogin.includes("@") && !/^[0-9+ ]+$/.test(tryLogin)) {
          const look2 = await db.gFresh("kidlogin_" + tryLogin);
          const kidUid  = (typeof look2 === "object" && look2) ? look2.uid : look2;
          const kidOila2 = (typeof look2 === "object" && look2) ? (look2.oila || null) : null;
          if (kidUid) {
            buzz(15);
            try {
              if (!fbAuth.currentUser || !fbAuth.currentUser.isAnonymous) await auth.loginAnon();
            } catch (e) {}
            const anonUid2 = auth.current()?.uid;
            const phv2 = await hp(fPw);
            setOwnerCtx(kidUid, kidOila2);  // xavfsizlik: bola konteksti
            // ksess AVVAL — Rules user_<kidUid> o'qishini shu orqali ochadi
            try { if (anonUid2) await db.s("ksess_" + anonUid2, { kid: kidUid, oila: kidOila2, ph: phv2 }); } catch (e) {}
            const ku = await db.g("user_" + kidUid);
            if (ku && ku.rol === "kid") {
              if (phv2 !== ku.ph) {
                try { if (anonUid2) await db.del("ksess_" + anonUid2); } catch (e) {}
                try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
                return ok$(lg === "uz" ? "Parol noto'g'ri" : "Wrong password", "err");
              }
              try { if (anonUid2 && (ku.oilaId || null) !== kidOila2) await db.s("ksess_" + anonUid2, { kid: kidUid, oila: ku.oilaId || null, ph: phv2 }); } catch (e) {}
              setOwnerCtx(kidUid, ku.oilaId || kidOila2);
              try {
                if (ku.parentId) {
                  const pu = await db.g("user_" + ku.parentId);
                  if (pu?.oilaId && pu.oilaId !== ku.oilaId) { ku.oilaId = pu.oilaId; await db.s("user_" + ku.id, ku); }
                }
              } catch (e2) {}
              localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
              setUser(ku); await loadFam(ku); setScr("bosh");
              ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + ku.ism + " 👋");
              return;
            }
            // Hujjat o'qilmadi (eski format lookup) — sessiyani tozalaymiz
            try { if (anonUid2) await db.del("ksess_" + anonUid2); } catch (e) {}
            try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
            return ok$(kidOila2
              ? (lg === "uz" ? "Login topilmadi" : "Not found")
              : (lg === "uz" ? "Akkaunt yangilanishi kerak: ota-onangiz ilovani bir marta ochib qo'ysin." : "Ask a parent to open the app once, then retry."), "err");
          }
          return ok$(lg === "uz" ? "Login yoki parol noto'g'ri" : "Wrong login or password", "err");
        }
        let email = fEm.trim().toLowerCase();
        if (!email && fTel.trim()) {
          const n9 = normTel(fTel);
          const foundEmail = await db.g("tphone_" + n9);
          if (foundEmail) email = foundEmail;
          else return ok$(lg === "uz" ? "Bu telefon topilmadi. Email bilan kiring yoki ro'yxatdan o'ting." : "Phone not found", "err");
        }
        if (!email || !fPw.trim()) return ok$(lg === "uz" ? "Telefon/email va parol kiriting" : "Enter phone/email and password", "err");
        let authUser;
        try { authUser = await auth.login(email, fPw); }
        catch (e) {
          const msg = (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") ? (lg === "uz" ? "Email yoki parol noto'g'ri" : "Wrong email or password") : e.code === "auth/user-not-found" ? (lg === "uz" ? "Foydalanuvchi topilmadi" : "User not found") : e.code === "auth/too-many-requests" ? (lg === "uz" ? "Ko'p urinish. Biroz kuting." : "Too many attempts") : (lg === "uz" ? "Kirishda xato: " : "Login error: ") + (e.code || e.message);
          return ok$(msg, "err");
        }
        let u = await db.g("user_" + authUser.uid);
        if (!u) { const oldUid = await db.g("em_" + email); if (oldUid) u = await db.g("user_" + oldUid); }
        if (!u) return ok$(lg === "uz" ? "Profil topilmadi" : "Profile not found", "err");
        localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id })); setUser(u); await loadFam(u); setScr("bosh"); ok$(t.wc + ", " + u.ism + " 👋");
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      ok$((lg === "uz" ? "Xatolik: " : "Error: ") + (err.code || err.message || "Firebase ulanmadi."), "err");
    } finally {
      authBusyRef.current = false;  // jarayon tugadi — onChange yana ishlaydi
    }
  };

  // handleAuth — login/register
  const handleAuth = useCallback(async () => {
    // Auth logikasi useAuth hookga o'tkazish mumkin, hozircha shu yerda qoladi
    // (Login.jsx sahifasida chaqiriladi va App.jsx dan props sifatida uzatiladi)
  }, []);

  // ── Profile handlers ──────────────────────────────────────
  const doPhoto = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = async ev => {
      const p = ev.target.result;
      const u2 = { ...user, photo: p };
      await db.s("user_" + user.id, u2); setUser(u2);
      setAzolar(azolar.map(a => a.id === user.id ? { ...a, photo: p } : a));
      ok$(t.ua);
    };
    r.readAsDataURL(file);
  };
  const rmPhoto = async () => {
    const u2 = { ...user, photo: null };
    await db.s("user_" + user.id, u2); setUser(u2);
    setAzolar(azolar.map(a => a.id === user.id ? { ...a, photo: null } : a));
    ok$(t.ua);
  };
  // Telefon qo'shish/o'zgartirish: user.tel + qidiruv hujjatlari (tel9_/tel_/tphone_)
  const saveTel = async (rawTel) => {
    const raw = (rawTel || "").trim();
    if (!raw) return ok$(lg === "uz" ? "Telefon raqamni kiriting" : "Enter phone number", "err");
    const tel = raw.replace(/[^0-9+]/g, "");
    const n9 = normTel(raw);
    if (!n9 || n9.length < 7) return ok$(lg === "uz" ? "Telefon raqam noto'g'ri" : "Invalid phone number", "err");
    try {
      const owner = await db.gFresh("tel9_" + n9);
      if (owner && owner !== user.id) return ok$(lg === "uz" ? "Bu raqam boshqa akkauntga bog'langan" : "Number linked to another account", "err");
    } catch (e) {}
    const u2 = { ...user, tel };
    await db.s("user_" + user.id, u2);
    await db.s("tel9_" + n9, user.id); await db.s("tel_" + tel, user.id);
    if (user.email) await db.s("tphone_" + n9, user.email);
    setUser(u2); setAzolar(azolar.map(a => a.id === user.id ? { ...a, tel } : a));
    setAskTel(false); setEdT(false); setNewT("");
    ok$(lg === "uz" ? "Telefon raqam saqlandi ✓" : "Phone saved ✓");
  };

  const updName = async () => {
    if (!newN.trim()) return;
    const fam = (newF || "").trim();
    const u2 = { ...user, ism: newN.trim(), familya: fam };
    await db.s("user_" + user.id, u2); setUser(u2);
    setAzolar(azolar.map(a => a.id === user.id ? { ...a, ism: newN.trim(), familya: fam } : a));
    setEdN(false); ok$(t.ua);
  };
  const saveBj = async () => {
    const v = Number(fBj); if (!v || v <= 0) return ok$(t.ec, "err");
    const u = { ...oila, budjet: v, katLimits: fKL };
    await db.s("oila_" + oila.id, u); await db.s("fam_" + oila.id, u); setOila(u); ok$(t.sa);
  };
  const saveProfile = updName;

  const toggleReportAccess = async (memberId) => {
    if (user?.rol !== "bosh" || !oila) return;
    const cur = oila.reportAccess || [];
    const upd = cur.includes(memberId) ? cur.filter(x => x !== memberId) : [...cur, memberId];
    const o2 = { ...oila, reportAccess: upd };
    await db.s("oila_" + oila.id, o2); await db.s("fam_" + oila.id, o2); setOila(o2);
    ok$(lg === "uz" ? "Ruxsat yangilandi" : "Access updated");
  };

  // ── delX ─────────────────────────────────────────────────
  const delX = async item => {
    if (item.uid !== user.id) return ok$(t.od, "warn");
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, (await db.g(key) || []).filter(x => x.id !== item.id));
    setXar(xar.filter(x => !(x.id === item.id && x.uid === user.id)));
  };



  // ── Feedback ──────────────────────────────────────────────
  const sendFeedback = async () => {
    if (!fbText.trim() && fbRating === 0) return ok$(lg === "uz" ? "Baho yoki izoh kiriting" : "Add rating or text", "err");
    setFbSending(true);
    try {
      const fb = { id: Date.now(), uid: user?.id || "anon", ism: user?.ism || "", type: fbType, rating: fbRating, text: fbText.trim(), sana: new Date().toISOString() };
      // XAVFSIZLIK: umumiy blobga emas — alohida, faqat-yaratiladigan hujjatga
      await db.s("fb_" + fb.id + "_" + (user?.id || "anon"), fb, { c: "fb" });
      setFbRating(0); setFbText(""); setFbType("taklif");
      ok$(lg === "uz" ? "Rahmat! Fikringiz yuborildi." : "Thank you!");
    } catch { ok$(lg === "uz" ? "Xatolik" : "Error", "err"); }
    setFbSending(false);
  };

  // ── Admin ─────────────────────────────────────────────────
  // Admin statistikasi endi ilovada YO'Q — alohida admin-sayt orqali.
  const loadAdminStats = async () => {};

  // ── TILXAT (RASPISKA) PDF — faqat ikki tomon tasdiqlagan qarzlar uchun ──
  const generateTilxat = (q) => {
    if (!q.linked || q.linkStatus !== "accepted") {
      ok$(lg === "uz" ? "Tilxat faqat ikki tomon tasdiqlagan qarzlar uchun" : "Receipt only for mutually confirmed debts", "err");
      return;
    }
    try {
      // Tomonlar: tur="olgan" — men qarzdor, kim=kreditor; tur="bergan" — men kreditor, kim=qarzdor
      const menQarzdor = q.tur === "olgan";
      const qarzdor = menQarzdor ? (user.ism || "") : q.kim;
      const kreditor = menQarzdor ? q.kim : (user.ism || "");
      const qarzdorTel = menQarzdor ? (user.tel || "") : q.linkedTel;
      const kreditorTel = menQarzdor ? q.linkedTel : (user.tel || "");
      const summaSom = Number(q.asl || (Number(q.summa) + Number(q.paidPart || 0)));
      const sanaStr = q.sana || td();
      const qaytStr = q.qaytSana || (lg === "uz" ? "kelishuv bo'yicha" : "as agreed");

      const summaRaqam = fmtN(summaSom, val, false);
      const summaSoz = lg === "uz" ? sonSoz(summaSom) : "";
      const summaText = summaRaqam + (summaSoz ? " (" + summaSoz + " so'm)" : "");
      const hujjatRaqami = "OH-" + String(q.id).slice(-8);
      // QR → ilovaning tekshiruv havolasi (skanerlaganda tasdiq sahifasi ochiladi)
      const tilxatJson = JSON.stringify({ id: q.id, q: qarzdor, k: kreditor, s: summaSom, d: sanaStr, r: qaytStr, n: hujjatRaqami });
      const verifyUrl = window.location.origin + "/?tilxat=" + encodeURIComponent(tilxatJson);
      const verifyQR = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=L&data=" + encodeURIComponent(verifyUrl);

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tilxat ${hujjatRaqami}</title><style>
        @page{size:A4;margin:2cm}
        body{font-family:'Times New Roman',serif;color:#1a1a1a;line-height:1.8;font-size:14px}
        .head{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:16px}
        .title{font-size:22px;font-weight:bold;letter-spacing:1px;margin-bottom:6px}
        .sub{font-size:12px;color:#666}
        .body{text-align:justify;margin:24px 0}
        .body p{margin:14px 0}
        .field{font-weight:bold;text-decoration:underline}
        .sum{font-size:16px;font-weight:bold;color:#000;background:#f5f5f5;padding:2px 8px}
        .sign{margin-top:48px;display:flex;justify-content:space-between}
        .sign-box{width:45%;text-align:center}
        .sign-line{border-top:1px solid #333;margin-top:40px;padding-top:6px;font-size:12px}
        .foot{margin-top:40px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:12px}
        .doc-num{text-align:right;font-size:11px;color:#666;margin-bottom:8px}
        .clause{margin:12px 0;text-align:justify}
        .num{display:inline-block;width:22px;font-weight:bold}
        .verify-box{margin-top:24px;display:flex;align-items:center;gap:16px;padding:14px 16px;border:2px solid #4f46e5;border-radius:10px;background:#4f46e506}
        .verify-box img{width:90px;height:90px}
        .legal{margin-top:18px;font-size:11px;color:#444;line-height:1.6;background:#fafafa;border-left:3px solid #4f46e5;padding:10px 14px}
        .btn{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#4f46e5;color:#fff;border:none;padding:13px 32px;border-radius:28px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(79,70,229,.4)}
        @media print{.btn{display:none}}
      </style></head><body>
        <div class="doc-num">${lg === "uz" ? "Hujjat \u2116" : lg === "ru" ? "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u2116" : "Document \u2116"} ${hujjatRaqami}</div>
        <div class="head">
          <div class="title">${lg === "uz" ? "TILXAT" : lg === "ru" ? "\u0420\u0410\u0421\u041f\u0418\u0421\u041a\u0410" : "RECEIPT"}</div>
          <div class="sub">${lg === "uz" ? "pul qarzi olinganligi to'g'risida" : lg === "ru" ? "\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0438 \u0434\u0435\u043d\u0435\u0436\u043d\u043e\u0433\u043e \u0437\u0430\u0439\u043c\u0430" : "of a monetary loan"}</div>
        </div>
        <div class="body">
          <p>${sanaStr}</p>
          <div class="clause"><span class="num">1.</span>${lg === "uz" ? "Men" : lg === "ru" ? "\u042f" : "I"}, <span class="field">${qarzdor}</span>${qarzdorTel ? ", tel: " + qarzdorTel : ""} (${lg === "uz" ? "bundan keyin \u2014 Qarzdor" : lg === "ru" ? "\u0434\u0430\u043b\u0435\u0435 \u2014 \u0414\u043e\u043b\u0436\u043d\u0438\u043a" : "hereinafter \u2014 Debtor"}), ${lg === "uz" ? "o'z ixtiyorim bilan, quyidagi shaxsdan" : lg === "ru" ? "\u0434\u043e\u0431\u0440\u043e\u0432\u043e\u043b\u044c\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0438\u043b(\u0430) \u043e\u0442" : "voluntarily received from"} <span class="field">${kreditor}</span>${kreditorTel ? ", tel: " + kreditorTel : ""} (${lg === "uz" ? "bundan keyin \u2014 Kreditor" : lg === "ru" ? "\u0434\u0430\u043b\u0435\u0435 \u2014 \u041a\u0440\u0435\u0434\u0438\u0442\u043e\u0440" : "hereinafter \u2014 Creditor"}) ${lg === "uz" ? "naqd pul mablag'ini qarz sifatida oldim" : lg === "ru" ? "\u0434\u0435\u043d\u0435\u0436\u043d\u044b\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432 \u0434\u043e\u043b\u0433" : "a monetary loan"}:</div>
          <p style="text-align:center"><span class="sum">${summaText}</span></p>
          <div class="clause"><span class="num">2.</span>${lg === "uz" ? "Yuqoridagi summani" : lg === "ru" ? "\u0423\u043a\u0430\u0437\u0430\u043d\u043d\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u043e\u0431\u044f\u0437\u0443\u044e\u0441\u044c \u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0434\u043e" : "I undertake to repay the above amount by"} <span class="field">${qaytStr}</span> ${lg === "uz" ? "sanasigacha to'liq qaytarishni zimmamga olaman." : ""}</div>
          <div class="clause"><span class="num">3.</span>${lg === "uz" ? "Mazkur tilxat ikki tomonning erkin xohish-irodasi asosida tuzildi. Tomonlar hujjat mazmuni va oqibatlarini to'liq anglaydilar." : lg === "ru" ? "\u0420\u0430\u0441\u043f\u0438\u0441\u043a\u0430 \u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0430 \u043f\u043e \u0434\u043e\u0431\u0440\u043e\u0439 \u0432\u043e\u043b\u0435 \u043e\u0431\u0435\u0438\u0445 \u0441\u0442\u043e\u0440\u043e\u043d." : "Made by free will of both parties."}</div>
          <div class="clause"><span class="num">4.</span>${lg === "uz" ? "Nizo kelib chiqqan taqdirda, tomonlar uni muzokara yo'li bilan, kelisha olmagan holda esa O'zbekiston Respublikasi qonunchiligiga muvofiq sud tartibida hal etadilar." : lg === "ru" ? "\u0421\u043f\u043e\u0440\u044b \u0440\u0435\u0448\u0430\u044e\u0442\u0441\u044f \u043f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u0430\u043c\u0438 \u0438\u043b\u0438 \u0432 \u0441\u0443\u0434\u0435." : "Disputes resolved by negotiation or court."}</div>
          ${q.paidPart > 0 ? '<div class="clause"><span class="num">5.</span>' + (lg === "uz" ? "Qisman qaytarilgan: <b>" + Number(q.paidPart).toLocaleString("uz-UZ") + " so'm</b>. Qoldiq: <b>" + Number(q.summa).toLocaleString("uz-UZ") + " so'm</b>." : "Partially repaid: " + Number(q.paidPart).toLocaleString() + ". Remaining: " + Number(q.summa).toLocaleString() + ".") + "</div>" : ""}
        </div>
        <div class="sign">
          <div class="sign-box"><div class="sign-line">${lg === "uz" ? "Qarzdor" : lg === "ru" ? "\u0414\u043e\u043b\u0436\u043d\u0438\u043a" : "Debtor"}<br>${qarzdor}<br>${lg === "uz" ? "(imzo)" : lg === "ru" ? "(\u043f\u043e\u0434\u043f\u0438\u0441\u044c)" : "(signature)"}</div></div>
          <div class="sign-box"><div class="sign-line">${lg === "uz" ? "Kreditor" : lg === "ru" ? "\u041a\u0440\u0435\u0434\u0438\u0442\u043e\u0440" : "Creditor"}<br>${kreditor}<br>${lg === "uz" ? "(imzo)" : lg === "ru" ? "(\u043f\u043e\u0434\u043f\u0438\u0441\u044c)" : "(signature)"}</div></div>
        </div>
        <div class="verify-box">
          <img src="${verifyQR}" alt="QR"/>
          <div>
            <div style="font-size:13px;font-weight:bold;color:#4f46e5">\ud83d\udd12 ${lg === "uz" ? "Elektron tasdiq" : lg === "ru" ? "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435" : "Electronic confirmation"}</div>
            <div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">${lg === "uz" ? "Ushbu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. QR kod hujjat haqiqiyligini bildiradi." : lg === "ru" ? "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u043e\u0431\u0435\u0438\u043c\u0438 \u0441\u0442\u043e\u0440\u043e\u043d\u0430\u043c\u0438. QR \u0443\u0434\u043e\u0441\u0442\u043e\u0432\u0435\u0440\u044f\u0435\u0442 \u043f\u043e\u0434\u043b\u0438\u043d\u043d\u043e\u0441\u0442\u044c." : "Confirmed by both parties. QR verifies authenticity."}</div>
            <div style="font-size:10px;color:#888;margin-top:4px">${lg === "uz" ? "Hujjat raqami" : "Doc"}: ${hujjatRaqami} \u00b7 ID: ${q.id}</div>
          </div>
        </div>
        <div class="legal">
          <b>${lg === "uz" ? "Huquqiy eslatma:" : lg === "ru" ? "\u041f\u0440\u0430\u0432\u043e\u0432\u0430\u044f \u0441\u043f\u0440\u0430\u0432\u043a\u0430:" : "Legal note:"}</b> ${lg === "uz" ? "Mazkur tilxat O'zbekiston Respublikasi Fuqarolik kodeksining qarz shartnomasiga oid normalariga muvofiq tuzilgan va tomonlar o'rtasidagi kelishuvni qayd etuvchi yozma dalil hisoblanadi. To'liq yuridik kuchga ega bo'lishi uchun notarial tasdiqlash yoki E-IMZO tavsiya etiladi. Aniq holatlar bo'yicha malakali yuristga murojaat qiling." : lg === "ru" ? "\u0420\u0430\u0441\u043f\u0438\u0441\u043a\u0430 \u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043d\u043e \u043d\u043e\u0440\u043c\u0430\u043c \u0413\u041a \u043e \u0437\u0430\u0439\u043c\u0435. \u0414\u043b\u044f \u043f\u043e\u043b\u043d\u043e\u0439 \u0441\u0438\u043b\u044b \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u043d\u043e\u0442\u0430\u0440\u0438\u0443\u0441 \u0438\u043b\u0438 \u042d\u0426\u041f." : "Drawn up per civil-law loan provisions. For full force, notarization or e-signature is recommended."}
        </div>
        <div class="foot">
          ${lg === "uz" ? "Oila Hisobchi ilovasi tomonidan yaratilgan" : lg === "ru" ? "\u0421\u043e\u0437\u0434\u0430\u043d\u043e \u0432 Oila Hisobchi" : "Generated by Oila Hisobchi"} \u00b7 ${new Date().toLocaleDateString("uz-UZ")}
        </div>
        <button class="btn" onclick="window.print()">${lg === "uz" ? "PDF saqlash / Chop etish" : "Save PDF / Print"}</button>
      </body></html>`;

      let opened = false;
      try {
        const w = window.open("", "_blank");
        if (w && w.document) { w.document.write(html); w.document.close(); opened = true; ok$(lg === "uz" ? "Tilxat tayyor!" : "Receipt ready!"); }
      } catch (e2) {}
      if (!opened) {
        // WebView/APK: yangi oyna ochilmaydi — ilova ichida ko'rsatamiz
        setTilxatView({ html, num: hujjatRaqami });
      }
    } catch (e) { console.error("tilxat:", e); ok$(lg === "uz" ? "Tilxat yaratishda xato" : "Error", "err"); }
  };

  // ── Notification handlers ────────────────────────────────
  const toggleNotif = async () => {
    if (!notifEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") { setNotifEnabled(true); localStorage.setItem("oilaV7Notif", "1"); ok$(lg === "uz" ? "Bildirishnomalar yoqildi!" : "Notifications enabled!"); }
        else ok$(lg === "uz" ? "Ruxsat berilmadi." : "Permission denied.", "err");
      }
    } else { setNotifEnabled(false); localStorage.setItem("oilaV7Notif", "0"); ok$(lg === "uz" ? "O'chirildi." : "Disabled."); }
  };
  const saveNotifTime = (time) => { setNotifTime(time); localStorage.setItem("oilaV7NotifT", time); ok$(lg === "uz" ? "Vaqt saqlandi: " + time : "Time saved: " + time); };

  // ── Accept/Reject xReqs ───────────────────────────────────
  const acceptXReq = async (req) => {
    // Xarajat so'rovi: qabul qilishdan OLDIN balans tekshiruvi (minusga tushmaslik)
    if (req.kind !== "income") {
      const chkD = dar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
      const chkX = xar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
      if (chkD - chkX < Number(req.summa)) {
        ok$(lg === "uz" ? "❌ Balans yetarli emas! Balans: " + f(Math.max(0, chkD - chkX), true) : "❌ Insufficient balance!", "err");
        return;
      }
    }
    const newReqs = xReqs.filter(r => r.id !== req.id);
    setXReqs(newReqs); await db.s("xreq_" + user.id, newReqs);
    if (req.kind === "income") {
      const item = { id: req.id, tur: req.tur || "sovga", summa: req.summa, izoh: req.izoh, sana: req.sana, vaqt: nt() };
      const key = "d_" + user.oilaId + "_" + user.id;
      await db.s(key, [item, ...((await db.g(key)) || [])]); setDar(d => [{ ...item, uid: user.id }, ...d]);
      ok$(lg === "uz" ? "Daromadga qo'shildi!" : "Added to income!"); return;
    }
    const item = { id: req.id, kategoriya: req.kategoriya, summa: req.summa, izoh: req.izoh + " (so'rov: " + req.fromIsm + ")", sana: req.sana, vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]); setXar(x => [{ ...item, uid: user.id }, ...x]);
    ok$(lg === "uz" ? "Xarajat qo'shildi!" : "Expense added!");
  };
  const rejectXReq = async (req) => {
    const newReqs = xReqs.filter(r => r.id !== req.id);
    setXReqs(newReqs); await db.s("xreq_" + user.id, newReqs);
    ok$(lg === "uz" ? "Rad etildi" : "Rejected", "warn");
  };

  // ── AI maslahat ───────────────────────────────────────────
  // Lokal tahlil dvigateli — internetga bog'liq emas, HAR DOIM tahlil natijasini taqdim etadi.
  const buildLocalAdvice = () => {
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const budget = oila && oila.budjet ? oila.budjet : 2000000;
    const bal2 = totD - totX;
    const dayN = new Date().getDate();
    const tips = [];
    const L = (uz, en) => lg === "uz" ? uz : en;
    if (totD > 0 || totX > 0) {
      if (bal2 >= 0) tips.push(L("◆ Ijobiy balans: ", "◆ Positive balance: ") + L("Bu oy balansingiz ijobiy: +" + f(bal2, true) + ". Barakali boring!", "Positive balance: +" + f(bal2, true)));
      else tips.push(L("◆ Diqqat: ", "◆ Attention: ") + L("Bu oy xarajat daromaddan " + f(-bal2, true) + " ko'p.", "Expenses exceed income by " + f(-bal2, true)));
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) tips.push(L("◆ Budjet ogohlantirishi: ", "◆ Budget warning: ") + L("Budjet " + bpct + "% ishlatildi!", "Budget used " + bpct + "%!"));
    else if (bpct >= 80) tips.push(L("◆ Budjet nazorati: ", "◆ Budget check: ") + L("Budjetning " + bpct + "% sarflandi.", "Used " + bpct + "%."));
    else if (bpct > 0 && dayN <= 15 && bpct < 40) tips.push(L("◆ Zo'r natija: ", "◆ Great progress: ") + L("Ajoyib! Oy yarmida faqat " + bpct + "% sarfladingiz.", "Great! Only " + bpct + "%."));
    const katTotals = KATS.map((k, i) => ({ nom: KN[lg][i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) { const top = katTotals[0]; const topPct = Math.round(top.sum / totX * 100); tips.push(L("◆ Eng yuqori xarajat: ", "◆ Top spending: ") + L("Eng ko'p xarajat: " + top.nom + " (" + topPct + "%).", top.nom + " is " + topPct + "%")); }
    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) tips.push(L("◆ Jamg'arma muvaffaqiyati: ", "◆ Savings success: ") + L("Daromadning " + savePct + "% jamg'ardingiz. A'lo natija!", "Saved " + savePct + "%!"));
      else if (savePct > 0) tips.push(L("◆ Jamg'arma tahlili: ", "◆ Savings analysis: ") + L("Daromadning faqat " + savePct + "% qoldi.", "Only " + savePct + "% saved."));
      else if (bal2 < 0) tips.push(L("◆ Jamg'arma tahlili: ", "◆ Savings analysis: ") + L("Bu oy jamg'arma bo'lmadi.", "No savings."));
    }
    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) { if (ng.pct >= 80 && ng.pct < 100) tips.push(L("◆ Maqsad progressi: ", "◆ Goal progress: ") + L("'" + ng.ism + "' maqsadi " + ng.pct + "% bajarildi!", "Goal '" + ng.ism + "' at " + ng.pct + "%!")); else if (ng.pct < 30) tips.push(L("◆ Maqsad maslahati: ", "◆ Goal tip: ") + L("'" + ng.ism + "' uchun har oy summa ajrating.", "Save for '" + ng.ism + "'.")); }
    } else tips.push(L("◆ Maqsad qo'ying: ", "◆ Set a goal: ") + L("Maqsad qo'ying — jamg'arish uchun motivatsiya beradi.", "Set a goal."));
    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) tips.push(L("◆ Majburiyatlar: ", "◆ Liabilities: ") + L("Sizda " + f(meOwe, true) + " qarz bor.", "You owe " + f(meOwe, true)));
    const genTips = [
      L("50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga, 30% xohish-istaklarga, 20% jamg'armaga.", "Use 50/30/20 rule: 50% needs, 30% wants, 20% savings."),
      L("Kichik tejamkorlik — katta baraka. Har kuni ozgina tejasangiz, yiliga katta summa bo'ladi.", "Small savings add up over a year."),
      L("Xarid ro'yxati — eng yaxshi qalqon. Ro'yxat tuzib, faqat shu mahsulotlarni oling.", "A shopping list is your best shield."),
      L("Oylik daromad kelishi bilan birinchi navbatda majburiy to'lovlarni chetga oling.", "Pay mandatory bills first when income arrives."),
      L("Moliyaviy xavfsizlik yostig'i: kamida 3 oylik xarajatga teng zaxira fondi yarating.", "Build a 3-month emergency fund."),
    ];
    tips.push(L("◆ Maslahat: ", "◆ Practical tip: ") + genTips[new Date().getDate() % genTips.length]);
    // Motivatsion iqtibos — har kuni yangi
    const MOTIV = [
      L("Boylik bir kunda yig'ilmaydi — lekin har kungi to'g'ri qaror sizni unga yaqinlashtiradi. Siz to'g'ri yo'ldasiz!", "Wealth is built one good decision at a time."),
      L("Pulni boshqarayotgan odam — kelajagini boshqarayotgan odam. Davom eting!", "Manage your money, manage your future."),
      L("Bugungi kichik tejamkorlik — ertangi katta imkoniyat. Har bir so'm ishlasin!", "Small savings today, big opportunities tomorrow."),
      L("Eng yaxshi sarmoya — o'z moliyaviy intizomingizga qilingan sarmoya. Barakalla!", "Discipline is the best investment."),
      L("Maqsadi bor odam yo'ldan adashmaydi. Maqsadlaringizga sodiq qoling!", "A person with a goal never gets lost."),
      L("Daromad qancha bo'lishidan qat'i nazar, uni hisoblab yurgan oila hech qachon kam bo'lmaydi.", "A family that counts never lacks."),
      L("Sabr va izchillik — moliyaviy erkinlikning ikki qanoti. Siz uchyapsiz!", "Patience and consistency are the wings of financial freedom."),
      L("Har hisobot — bir qadam oldinga. O'zingizni tahlil qilayotganingiz allaqachon g'alaba!", "Every report is a step forward."),
    ];
    tips.push(L("◆ Motivatsiya: ", "◆ Motivation: ") + MOTIV[new Date().getDate() % MOTIV.length]);
    // Shaxsiy motivatsion salomlashuv
    const salom = totX === 0 && totD === 0 ? ""
      : bal2 >= 0
        ? L("◆ Barakalla, " + (user?.ism || "do'stim") + "! Siz moliyangizni nazoratda tutyapsiz — bu ko'pchilikning qo'lidan kelmaydi. Keling, tahlilni ko'ramiz:", "◆ Great job, " + (user?.ism || "") + "!")
        : L("◆ Diqqatli bo'ling, " + (user?.ism || "Do'stim") + ", tashvishlanmang — har bir katta yutuq kichik qadamdan boshlanadi. Bu oy tahlili sizga yo'l ko'rsatadi:", "◆ Don't worry, every big win starts small.");
    if (totX === 0 && totD === 0) return L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting!", "No data yet. Add expenses and income.");
    return salom + "\n\n" + L("◆ " + tm() + " tahlili\n\n", "Analysis " + tm() + "\n\n") + tips.join("\n\n");
  };

  // Masofaviy AI API (ixtiyoriy): VITE_AI_API_URL sozlansa shu endpointga so'rov yuboriladi.
  // Sozlanmagan yoki ishlamasa — lokal dvigatel zaxira sifatida ishlaydi (AI hech qachon "o'lmaydi").
  const fetchRemoteAdvice = async () => {
    const AI_URL = import.meta.env.VITE_AI_API_URL;
    if (!AI_URL) return null;                                  // API sozlanmagan
    if (typeof navigator !== "undefined" && navigator.onLine === false) throw new Error("offline");
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const kats = KATS.map((k, i) => ({ nom: KN[lg][i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0);
    const prompt = (lg === "uz"
      ? "Siz oilaviy moliya bo'yicha maslahatchisiz. Quyidagi oy ma'lumotlari asosida qisqa, amaliy moliyaviy maslahat bering (o'zbek tilida): "
      : "You are a family finance advisor. Give short practical advice based on this month: ")
      + JSON.stringify({ oy: tm(), daromad: totD, xarajat: totX, budjet: oila?.budjet || 0, kategoriyalar: kats });
    const resp = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, lang: lg }),
      signal: AbortSignal.timeout(12000),
    });
    if (!resp.ok) throw new Error("API " + resp.status);
    const data = await resp.json();
    const text = data.advice || data.text || data.result || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
    if (!text || typeof text !== "string") throw new Error("empty response");
    return text;
  };

  const aiAdv = async () => {
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
      setAdvErr(lg === "uz"
        ? "Maslahat tayyorlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring."
        : "Failed to generate advice. Check your connection and retry.");
    } finally {
      setTimeout(() => setAdvL(false), 400);
    }
  };


  if (boot) return <div style={{ ...makeS(th).pg, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>{Ico.wallet(th.ac)}</div>;

  // ── TILXAT TEKSHIRUV SAHIFASI (QR skanerlaganda) ──────────
  if (verifyTilxat) {
    const v = verifyTilxat;
    return (
      <div style={{ ...STY.pg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div style={{ background: th.sur, borderRadius: 24, padding: "30px 24px", maxWidth: 420, width: "100%", border: "1px solid " + th.bor, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, margin: "0 auto 14px", boxShadow: "0 12px 36px #10b98155", color: "#fff" }}>{"\u2713"}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: th.t1 }}>{lg === "uz" ? "Hujjat tasdiqlandi" : lg === "ru" ? "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d" : "Document verified"}</div>
            <div style={{ fontSize: 12, color: th.gr, fontWeight: 600, marginTop: 4 }}>{"\ud83d\udd12"} {lg === "uz" ? "Oila Hisobchi rasmiy tilxati" : "Official Oila Hisobchi receipt"}</div>
          </div>
          <div style={{ background: th.bg, borderRadius: 16, padding: "18px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Hujjat raqami" : "Document \u2116"}</span><span style={{ fontSize: 12, fontWeight: 700, color: th.ac, fontFamily: "monospace" }}>{v.n}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qarzdor" : "Debtor"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.q}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Kreditor" : "Creditor"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.k}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Summa" : "Amount"}</span><span style={{ fontSize: 15, fontWeight: 800, color: th.gr }}>{f(Number(v.s), true)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Berilgan sana" : "Date"}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.d}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qaytarish" : "Return by"}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.r}</span></div>
          </div>
          <div style={{ fontSize: 11, color: th.t2, textAlign: "center", lineHeight: 1.6, marginBottom: 18, background: th.ac + "0d", borderRadius: 10, padding: "10px 12px" }}>{lg === "uz" ? "Bu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. Ma'lumotlar QR kod orqali tekshirildi." : "Confirmed by both parties in the app. Verified via QR."}</div>
          <button onClick={() => { setVerifyTilxat(null); try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {} }} style={{ ...STY.bt(), marginBottom: 0 }}>{lg === "uz" ? "Ilovaga o'tish" : lg === "ru" ? "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435" : "Open app"}</button>
        </div>
      </div>
    );
  }
  if (onbStep >= 0 && onbStep < ONB_SLIDES.length) return <OnboardingPage th={th} lg={lg} setLg={setLg} dark={dark} onbStep={onbStep} setOnbStep={setOnbStep} />;
  if (scr === "login") return (
    <LoginPage th={th} STY={STY} lg={lg} setLg={setLg} dark={dark} setDark={setDark}
      reg={reg} setReg={setReg} kidLoginMode={kidLoginMode} setKidLoginMode={setKidLoginMode}
      join={join} setJoin={setJoin} fIsm={fIsm} setFIsm={setFIsm} fEm={fEm} setFEm={setFEm}
      fPw={fPw} setFPw={setFPw} fON={fON} setFON={setFON} fKd={fKd} setFKd={setFKd}
      fTel={fTel} setFTel={setFTel} fDial={fDial} setFDial={setFDial}
      fCountry={fCountry} setFCountry={setFCountry} showValDD={showValDD} setShowValDD={setShowValDD}
      fRel={fRel} setFRel={setFRel} showCountryDD={showCountryDD} setShowCountryDD={setShowCountryDD}
      showRelDD={showRelDD} setShowRelDD={setShowRelDD} showPw={showPw} setShowPw={setShowPw}
      showResetScreen={showResetScreen} setShowResetScreen={setShowResetScreen}
      showResetConfirm={showResetConfirm} setShowResetConfirm={setShowResetConfirm}
      resetEmail={resetEmail} setResetEmail={setResetEmail}
      resetInput={resetInput} setResetInput={setResetInput}
      resetSent={resetSent} setResetSent={setResetSent}
      fRefCode={fRefCode} setFRefCode={setFRefCode} val={val} setVal={setVal}
      tst={tst} ok$={ok$} t={t} isPremium={isPremium}
      doAuth={doAuth} sendResetEmail={sendResetEmail} doGoogleLogin={doGoogleLogin}
      setUser={setUser} setScr={setScr} setBoot={setBoot} loadFam={loadFam}
      switchAuthMode={switchAuthMode} genPassword={genPassword} handleResetPw={handleResetPw}
    />
  );

  // ── Nav items ─────────────────────────────────────────────
  const navItems = isKid
    ? [{ id: "bosh", lb: t.home }, { id: "vazifa", lb: lg === "uz" ? "Vazifa" : "Tasks" }, { id: "bilim", lb: lg === "uz" ? "Bilim" : "Learn" }, { id: "maqsad", lb: t.goal }]
    : [{ id: "bosh", lb: t.home }, { id: "qarz", lb: lg === "uz" ? "Qarz" : "Debt" }, { id: "qoshish", pr: true }, { id: "maqsad", lb: t.goal }, { id: "hisobot", lb: t.rep }];

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
    delX, acceptXReq, rejectXReq,
  };

  return (
    <div style={STY.pg}>
      <Tst msg={tst.msg} type={tst.type} th={th} />
      <input ref={fRef} type="file" accept="image/*" style={{ display: "none" }} onChange={doPhoto} />

      {/* Global Modals */}
      {confetti && <Confetti th={th} />}
      {showNotifs && <NotifCenter notifs={notifs} th={th} lg={lg} isKid={isKid} onClose={() => setShowNotifs(false)} onMarkRead={markNotifRead} onMarkAll={markAllRead} onClear={clearNotifs} onConfirmParent={confirmMaqParent} onConfirmKid={confirmMaqKid} setScr={setScr} />}
      {showPremModal && <PremiumModal th={th} STY={STY} lg={lg} onActivate={activatePremium} onClose={() => setShowPremModal(false)} />}
      {askTel && user && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(0,0,0,0.62)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: th.sur, borderRadius: 22, padding: "26px 22px", maxWidth: 380, width: "100%", border: "1px solid " + th.bor, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>📱</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 8 }}>{lg === "uz" ? "Telefon raqamingizni kiriting" : "Enter your phone number"}</div>
            <div style={{ fontSize: 12.5, color: th.t2, textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>{lg === "uz" ? "Qarz taklifi olish va oiladoshlar sizni raqam orqali topishi uchun kerak. Keyinroq Profil bo'limida ham qo'shishingiz mumkin." : "Needed for debt requests and so family can find you by number. You can also add it later in Profile."}</div>
            <input style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: 13, padding: "12px 14px", color: th.t1, fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12 }} value={newT} onChange={e => setNewT(e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" autoFocus />
            <button onClick={() => saveTel(newT)} style={{ width: "100%", background: th.ac, border: "none", borderRadius: 13, padding: "13px 0", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>{lg === "uz" ? "Saqlash" : "Save"}</button>
            <button onClick={() => { setAskTel(false); setNewT(""); }} style={{ width: "100%", background: "transparent", border: "none", padding: "8px 0", color: th.t2, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{lg === "uz" ? "Keyinroq" : "Later"}</button>
          </div>
        </div>
      )}
      {showBilim && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: th.bg, zIndex: 1500, overflowY: "auto", padding: "16px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 430, margin: "0 auto" }}>
            <BilimHub user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={() => setShowBilim(false)} gardenData={gardenData} onGarden={() => { setShowBilim(false); setScr("profil"); setPTab("garden"); }} />
          </div>
        </div>
      )}

      {/* Global: Vazifa modal */}
      {showAddVazifa && !isKid && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => setShowAddVazifa(false)}>
          <div style={{ background:th.bg, borderRadius:"24px 24px 0 0", maxWidth:480, width:"100%", padding:"24px 20px 36px", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:th.bor, margin:"0 auto 20px" }}/>
            <div style={{ fontSize:18, fontWeight:800, color:th.t1, marginBottom:20, textAlign:"center" }}>{"📋 "}{lg==="uz"?"Yangi vazifa berish":"Add new task"}</div>
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Kim uchun?":"For whom?"}</label>
            {azolar.filter(a=>a.rol==="kid").length === 0
              ? <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:12, color:th.am }}>{"⚠️ "}{lg==="uz"?"Avval bola akkaunti yarating (Profil)":"Create a kid account first (Profile)"}</div>
              : <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
                  {azolar.filter(a=>a.rol==="kid").map(k => (
                    <button key={k.id} onClick={() => setVAssignee(k.id)} style={{ flexShrink:0, background:vAssignee===k.id?th.ac+"18":th.surH, border:"2px solid "+(vAssignee===k.id?th.ac:th.bor), borderRadius:14, padding:"10px 16px", cursor:"pointer", color:vAssignee===k.id?th.ac:th.t2, fontWeight:700, fontSize:13 }}>{"👶 "}{k.ism}</button>
                  ))}
                </div>
            }
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa turi":"Task type"}</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:20 }}>
              {[
                {e:"📚",uz:"Kitob o'qish",en:"Reading", id:"kitob"},
                {e:"🧹",uz:"Xona yig'ish",en:"Clean room", id:"xona"},
                {e:"🍽️",uz:"Idish yuvish",en:"Wash dishes", id:"idish"},
                {e:"🛒",uz:"Do'kon xarid",en:"Grocery run", id:"dokon"},
                {e:"🌱",uz:"Gul sug'orish",en:"Water plants", id:"gul"},
                {e:"🚮",uz:"Axlat to'kish",en:"Take out trash", id:"axlat"},
                {e:"🛏️",uz:"O'rin yig'ish",en:"Make the bed", id:"orin"},
                {e:"📝",uz:"Dars qilish",en:"Homework", id:"darslik"},
                {e:"🧺",uz:"Kir yig'ish",en:"Laundry help", id:"kir"},
                {e:"🍳",uz:"Ovqat tayyorlash",en:"Help cooking", id:"ovqat"},
                {e:"🚴",uz:"Sport qilish",en:"Exercise", id:"sport"},
                {e:"🎹",uz:"Musiqa mashqi",en:"Music practice", id:"musiqa"},
                {e:"🧸",uz:"O'yinchoq yig'ish",en:"Tidy toys", id:"oyinchoq"},
                {e:"🐕",uz:"Hayvon boqish",en:"Pet care", id:"hayvon"},
                {e:"🪟",uz:"Deraza artish",en:"Clean windows", id:"deraza"},
                {e:"🧠",uz:"So'z yodlash",en:"Learn words", id:"soz"},
                {e:"🤲",uz:"Kattalarga ko'mak",en:"Help elders", id:"buvi"},
                {e:"🎨",uz:"Rasm chizish",en:"Drawing", id:"rasm"},
                {e:"🏃",uz:"Hovli sayri",en:"Outdoor walk", id:"sayr"},
                {e:"✨",uz:"Boshqa",en:"Other", id:"boshqa"},
              ].map(p => {
                const active = vEmoji === p.e;
                const activeColor = active ? th.ac : th.t2;
                const lIco = {
                  kitob:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 4.5C8.5 3.2 6.3 2.8 3 3v12c3.3-.2 5.5.2 7 1.5 1.5-1.3 3.7-1.7 7-1.5V3c-3.3-.2-5.5.2-7 1.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 4.5v12" stroke={c} strokeWidth="1.3"/></svg>,
                  xona:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M12.5 2l-3 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9.8 9.5c-2.6-.4-4.6 1-5.3 4l-1 3.5c3.5.6 8.5 1 9.8-3l.8-2.7-4.3-1.8z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 13.5l-.8 3.3M9.5 14l-.6 3.2" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
                  idish:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="11" cy="10" r="6.5" stroke={c} strokeWidth="1.4"/><circle cx="11" cy="10" r="3" stroke={c} strokeWidth="1.2" opacity=".6"/><path d="M2.5 3v5M2.5 8v9M1 3v3c0 1 .7 2 1.5 2S4 7 4 6V3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
                  dokon:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 3h2.2l1.9 9.5h9.4l1.7-7H5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.3" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/><circle cx="14.2" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/></svg>,
                  gul:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 17v-6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11C10 7 7.5 5 3.5 5c0 4 2.5 6 6.5 6zM10 9c0-3 2-4.7 5.5-4.7 0 3.5-2 4.7-5.5 4.7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 17h10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
                  axlat:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 5.5h12M8 5.5V3.5h4v2M5.3 5.5l.9 11h7.6l.9-11" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.3 8.5v5M11.7 8.5v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
                  orin:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 15.5V9c0-1.1.9-2 2-2h9.5c2.5 0 4.5 1.8 4.5 4.5v4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M2 13h16M2 16.5V13M18 16.5V13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><circle cx="6" cy="10" r="1.6" fill={c} opacity=".35"/></svg>,
                  darslik:  c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="2.5" width="11" height="15" rx="1.8" stroke={c} strokeWidth="1.4"/><path d="M6.5 6.5h5M6.5 9.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M11 15.5l5.5-5.5c.6-.6 1.5.3.9.9L12 16.4l-1.8.4.8-1.3z" fill={c} opacity=".2" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
                  kir:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3.5 8h13l-1.2 8.5h-10.6L3.5 8z" fill={c} opacity=".1" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8c0-2.3 1.8-4 4-4s4 1.7 4 4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 11.5c1 .8 2.3 1.2 3.5 1.2s2.5-.4 3.5-1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
                  ovqat:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="11.5" r="5.5" stroke={c} strokeWidth="1.4"/><path d="M13.8 8.2L18 4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="11.5" r="2.2" stroke={c} strokeWidth="1.1" opacity=".55"/></svg>,
                  sport:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="4.6" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><circle cx="15.4" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><path d="M4.6 13.5L8 7h5.5M10 13.5L8 7M12.5 4.5h2.5l.7 2" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  musiqa:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M7.5 15.5V4.5L16 3v10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.3" cy="15.5" r="2.2" stroke={c} strokeWidth="1.3"/><circle cx="13.8" cy="13.5" r="2.2" stroke={c} strokeWidth="1.3"/></svg>,
                  oyinchoq: c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11.5" r="5" fill={c} opacity=".1" stroke={c} strokeWidth="1.4"/><circle cx="5" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="15" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="8.2" cy="11" r=".9" fill={c}/><circle cx="11.8" cy="11" r=".9" fill={c}/><path d="M8.7 13.7c.8.6 1.8.6 2.6 0" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
                  hayvon:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 10.5c-2.6 0-4.5 1.9-4.5 4 0 1.4 1 2.3 2.3 2.3 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.3 0 2.3-.9 2.3-2.3 0-2.1-1.9-4-4.5-4z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><ellipse cx="5" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="15" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="8" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="12" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/></svg>,
                  deraza:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="3" width="13" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M10 3v14M3.5 10h13" stroke={c} strokeWidth="1.2"/><path d="M5.5 6.5l2-2" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/></svg>,
                  soz:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5a5.5 5.5 0 00-3 10.1c.7.5 1.2 1.2 1.2 2.1h3.6c0-.9.5-1.6 1.2-2.1a5.5 5.5 0 00-3-10.1z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4"/><path d="M8 16.8h4M8.6 18.5h2.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M8.3 7.5L10 5.8l1.7 1.7" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>,
                  buvi:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 16.5s-5.5-3.3-5.5-7A3 3 0 0110 7.4a3 3 0 015.5 2.1c0 3.7-5.5 7-5.5 7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 12.5c1.5 2.5 4 4.5 8 6 4-1.5 6.5-3.5 8-6" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".5"/></svg>,
                  rasm:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5c-4.4 0-8 3.2-8 7.3 0 4 3.6 7.2 8 7.2 1 0 1.7-.7 1.7-1.6 0-.5-.2-.8-.4-1.1-.3-.4-.4-.7-.4-1.1 0-.9.7-1.6 1.7-1.6h1.9c2 0 3.5-1.5 3.5-3.4 0-3.2-3.6-5.7-8-5.7z" stroke={c} strokeWidth="1.4"/><circle cx="6" cy="8" r="1" fill={c}/><circle cx="10" cy="6" r="1" fill={c}/><circle cx="14" cy="8" r="1" fill={c}/></svg>,
                  sayr:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="11" cy="3.8" r="1.7" stroke={c} strokeWidth="1.3"/><path d="M8 18l2-4.5-2-2 1.2-4 3 1.5 2.8 1.2M9.2 7.5L6 9v3M10 13.5l3 1 1 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  boshqa:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5l1.7 4.6 4.8.4-3.7 3.1 1.2 4.7L10 12.7l-4 2.6 1.2-4.7-3.7-3.1 4.8-.4L10 2.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
                  task:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="15" rx="2" stroke={c} strokeWidth="1.4"/><path d="M7.5 3.5V2h5v1.5" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 8.5l1.5 1.5L12 6.8M7 13.5h6" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                };
                const renderIco = lIco[p.id] || lIco.task;
                return (
                  <button key={p.e} className="ui-press" onClick={() => { setVEmoji(p.e); setVTitle(lg==="uz"?p.uz:p.en); }}
                    style={{
                      background: active ? th.ac + "18" : th.surH,
                      border: "2px solid " + (active ? th.ac : th.bor),
                      borderRadius: 14,
                      padding: "10px 4px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontFamily: "inherit",
                      minHeight: 74,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, color: activeColor }}>
                      {renderIco(activeColor)}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>
                      {lg === "uz" ? p.uz : p.en}
                    </span>
                  </button>
                );
              })}
            </div>
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa nomi":"Task title"}</label>
            <input style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} value={vTitle} onChange={e => setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Xonani yig'ishtirish":"e.g. Clean the room"} />
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Mukofot (so'm)":"Reward (UZS)"}</label>
            <input type="number" style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:18, fontWeight:800, textAlign:"center", outline:"none", boxSizing:"border-box", marginBottom:20 }} value={vReward} onChange={e => setVReward(e.target.value)} placeholder="0" />
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Muddat (ixtiyoriy)":"Deadline (optional)"}</label>
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              {[{n:0,uz:"Bugun",en:"Today"},{n:1,uz:"Ertaga",en:"Tomorrow"},{n:3,uz:"3 kun",en:"3 days"},{n:7,uz:"1 hafta",en:"1 week"}].map(o => {
                const d = new Date(); d.setDate(d.getDate()+o.n);
                const ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
                const on = vDeadline===ds;
                return <button key={o.n} onClick={() => setVDeadline(on?"":ds)} style={{ flex:"1 0 auto", background:on?th.ac+"18":th.surH, border:"1.5px solid "+(on?th.ac:th.bor), borderRadius:10, padding:"9px 12px", cursor:"pointer", color:on?th.ac:th.t2, fontWeight:700, fontSize:12 }}>{lg==="uz"?o.uz:o.en}</button>;
              })}
              <button onClick={() => setVDeadline("")} style={{ flex:"1 0 auto", background:!vDeadline?th.ac+"18":th.surH, border:"1.5px solid "+(!vDeadline?th.ac:th.bor), borderRadius:10, padding:"9px 12px", cursor:"pointer", color:!vDeadline?th.ac:th.t2, fontWeight:700, fontSize:12 }}>{lg==="uz"?"Muddatsiz":"None"}</button>
            </div>
            <input type="date" value={vDeadline||""} onChange={e => setVDeadline(e.target.value)} style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:vDeadline?6:20, colorScheme:dark?"dark":"light" }} />
            {vDeadline && <div style={{ fontSize:12, color:th.t2, marginBottom:20 }}>{lg==="uz"?"Muddatida bajarilmasa, mukofot berilmaydi.":"No reward if the deadline is missed."}</div>}
            <button onClick={addVazifa} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"15px", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer" }}>{lg==="uz"?"Vazifa berish":"Assign task"}</button>
          </div>
        </div>
      )}

      {kidCreated && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:1002, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background: th.sur, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>👶✅</div>
            <div style={{ fontSize:20, fontWeight:800, color:th.t1, marginBottom:8 }}>
              {lg==="uz" ? "Akkaunt yaratildi!" : "Account created!"}
            </div>
            <div style={{ fontSize:13, color:th.t2, marginBottom:20, lineHeight:1.6 }}>
              {lg==="uz" ? "Farzandingiz quyidagi ma'lumotlar bilan kirishi mumkin:" : "Your child can log in with:"}
            </div>
            <div style={{ background:th.bg, borderRadius:16, padding:"16px 20px", marginBottom:20, textAlign:"left" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Ism":"Name"}</span>
                <span style={{ fontSize:14, fontWeight:700, color:th.t1 }}>{kidCreated.ism}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:12, color:th.t2 }}>Login</span>
                <span style={{ fontSize:14, fontWeight:800, color:th.ac, fontFamily:"monospace" }}>{kidCreated.login}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Parol":"Password"}</span>
                <span style={{ fontSize:14, fontWeight:800, color:th.gr, fontFamily:"monospace" }}>{kidCreated.pw}</span>
              </div>
            </div>
            <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:12, color:th.am, lineHeight:1.5 }}>
              ⚠️ {lg==="uz" ? "Bu parolni yozib oling! Keyinchalik ko'rsatilmaydi." : "Save this password! It won't be shown again."}
            </div>
            <button onClick={() => { setKidCreated(null); buzz(10); }} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"14px", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              {lg==="uz" ? "Tushunarli, yopish" : "Got it, close"}
            </button>
          </div>
        </div>
      )}
      {showGift && isKid && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowGift(false)}>
          <div style={{ background: th.bg, borderRadius: "24px 24px 0 0", maxWidth: 480, width: "100%", padding: "24px 20px 32px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: th.bor, margin: "0 auto 18px" }} />
            <div style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>🎁</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 6, textAlign: "center" }}>{lg === "uz" ? "Sovg'a puli kiritish" : "Add gift money"}</div>
            <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>{lg === "uz" ? "Buvi, bobo yoki qarindosh bergan pulni qo'shing" : "Add money from relatives"}</div>
            <label style={STY.lb}>{lg === "uz" ? "Summa" : "Amount"}</label>
            <input style={{ ...STY.ip, fontSize: 22, fontWeight: 800, textAlign: "center" }} type="number" value={giftSum} onChange={e => setGiftSum(e.target.value)} placeholder="0" />
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              {[5000, 10000, 20000, 50000].map(sm => (
                <button key={sm} onClick={() => setGiftSum(String(sm))} style={{ flex: 1, background: String(giftSum) === String(sm) ? th.ac + "22" : th.surH, border: "1.5px solid " + (String(giftSum) === String(sm) ? th.ac : th.bor), borderRadius: 10, padding: "8px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: String(giftSum) === String(sm) ? th.ac : th.t2 }}>{f(sm, true)}</button>
              ))}
            </div>
            <label style={STY.lb}>{lg === "uz" ? "Kimdan?" : "From whom?"}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
              {[
                ["\ud83d\udc74", lg === "uz" ? "Bobo" : "Grandpa"],
                ["\ud83d\udc75", lg === "uz" ? "Buvi" : "Grandma"],
                ["\ud83d\udc68", lg === "uz" ? "Ota" : "Dad"],
                ["\ud83d\udc69", lg === "uz" ? "Ona" : "Mom"],
                ["\ud83e\uddd4", lg === "uz" ? "Tog'a" : "Uncle (m)"],
                ["\ud83d\udc68\u200d\ud83e\uddb1", lg === "uz" ? "Amaki" : "Uncle (p)"],
                ["\ud83d\udc69\u200d\ud83e\uddb0", lg === "uz" ? "Amma" : "Aunt (p)"],
                ["\ud83d\udc71\u200d\u2640\ufe0f", lg === "uz" ? "Xola" : "Aunt (m)"],
                ["\ud83d\udc66", lg === "uz" ? "Aka" : "Brother"],
                ["\ud83d\udc67", lg === "uz" ? "Opa" : "Sister"],
                ["\ud83e\udd1d", lg === "uz" ? "Mehmon" : "Guest"],
                ["\ud83c\udf81", lg === "uz" ? "Boshqa" : "Other"],
              ].map(([em, nm]) => {
                const active = giftFrom === nm;
                return (
                  <button key={nm} onClick={() => setGiftFrom(nm)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: active ? th.ac + "1c" : th.surH, border: "2px solid " + (active ? th.ac : th.bor), borderRadius: 12, padding: "9px 2px 7px", cursor: "pointer", minHeight: 62 }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{em}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center" }}>{nm}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={addGiftMoney} style={{ ...STY.bt(), marginTop: 6, marginBottom: 0 }}>{lg === "uz" ? "Qo'shish" : "Add"}</button>
          </div>
        </div>
      )}
      {debts.partialQarz && <PartialQarzModal q={debts.partialQarz} partialSum={debts.partialSum} setPartialSum={debts.setPartialSum} th={th} STY={STY} lg={lg} f={f} t={t} onConfirm={debts.applyPartial} onClose={() => { debts.setPartialQarz(null); debts.setPartialSum(""); }} />}
      {tilxatView && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.75)", zIndex: 1200, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: th.sur, borderBottom: "1px solid " + th.bor, flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: th.t1 }}>{"\ud83d\udcc4"} Tilxat {tilxatView.num}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { try { const fr = document.getElementById("tilxatFrame"); fr && fr.contentWindow && fr.contentWindow.print(); } catch (e) { const okk = downloadFile(tilxatView.html, "Tilxat_" + tilxatView.num + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "Yuklab olindi!" : "Downloaded!") : "Xato", okk ? "ok" : "err"); } }} style={{ background: th.ac, border: "none", borderRadius: 9, padding: "8px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{lg === "uz" ? "PDF / Chop etish" : "PDF / Print"}</button>
              <button onClick={() => { const okk = downloadFile(tilxatView.html, "Tilxat_" + tilxatView.num + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "Yuklab olindi!" : "Downloaded!") : "Xato", okk ? "ok" : "err"); }} style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: 9, padding: "8px 12px", color: th.t1, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{lg === "uz" ? "Yuklab olish" : "Download"}</button>
              <button onClick={() => setTilxatView(null)} style={{ background: th.rd + "22", border: "1px solid " + th.rd + "55", borderRadius: 9, padding: "8px 12px", color: th.rd, cursor: "pointer", fontWeight: 800, fontSize: 12 }}>{"\u2715"}</button>
            </div>
          </div>
          <iframe id="tilxatFrame" title="Tilxat" srcDoc={tilxatView.html} style={{ flex: 1, width: "100%", border: "none", background: "#fff" }} />
        </div>
      )}
      {debts.inviteQarz && <InviteQarzModal inviteQarz={debts.inviteQarz} th={th} lg={lg} user={user} qarzTur={debts.qarzTur} qarzKim={debts.qarzKim} qarzSum={debts.qarzSum} qarzlar={qarzlar} setQarzlar={setQarzlar} ok$={ok$} t={t} f={f} onClose={() => debts.setInviteQarz(null)} />}
      {maqsadConfirmNotif && <MaqsadConfirmModal info={maqsadConfirmNotif} th={th} lg={lg} f={f} STY={STY} onBought={confirmMaqBought} onCancel={cancelMaqReturn} />}

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
                {lg === "uz" ? <><span style={{ color: th.ac }}>Oila</span><span style={{ color: th.gr }}>Hisobchi</span></> : <><span style={{ color: th.ac }}>Family</span><span style={{ color: th.gr }}>Budget</span></>}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => { setShowS(v => !v); setSrch(""); }} style={{ background: showS ? th.ac + "18" : "transparent", border: "1px solid " + (showS ? th.ac : th.bor), borderRadius: 10, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {Ico.search(showS ? th.ac : th.t2)}
            </button>
            <button onClick={() => setShowNotifs(true)} style={{ background: "transparent", border: "1px solid " + th.bor, borderRadius: 10, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a4.5 4.5 0 00-4.5 4.5v2.7L3 12h12l-1.5-2.8V6.5A4.5 4.5 0 009 2z" fill={th.t2} opacity=".15" stroke={th.t2} strokeWidth="1.3" strokeLinejoin="round" /><path d="M7.5 14.5a1.5 1.5 0 003 0" stroke={th.t2} strokeWidth="1.3" strokeLinecap="round" /></svg>
              {unreadCount > 0 && <div style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: th.rd, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 99 ? "99+" : unreadCount}</div>}
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
        {scr === "maqsad"  && <GoalsPage      {...pageProps} addM={addM} setAddM={setAddM} maqTab={maqTab} setMaqTab={setMaqTab} tupId={tupId} setTupId={setTupId} tupS={tupS} setTupS={setTupS} editMq={editMq} setEditMq={setEditMq} editMqN={editMqN} setEditMqN={setEditMqN} editMqS={editMqS} setEditMqS={setEditMqS} maqsadConfirmNotif={maqsadConfirmNotif} setMaqsadConfirmNotif={setMaqsadConfirmNotif} addMq={addMq} tupMq={tupMq} delMq={delMq} saveEditMq={saveEditMq} confirmMaqBought={confirmMaqBought} cancelMaqReturn={cancelMaqReturn} parentBoughtMaqsad={parentBoughtMaqsad} parentLaterMaqsad={parentLaterMaqsad} kidAcceptMaqsad={kidAcceptMaqsad} kidRejectMaqsad={kidRejectMaqsad} />}
        {scr === "vazifa"  && <TasksPage      {...pageProps} showAddVazifa={showAddVazifa} setShowAddVazifa={setShowAddVazifa} showGift={showGift} setShowGift={setShowGift} giftSum={giftSum} setGiftSum={setGiftSum} giftFrom={giftFrom} setGiftFrom={setGiftFrom} vTitle={vTitle} setVTitle={setVTitle} vReward={vReward} setVReward={setVReward} vAssignee={vAssignee} setVAssignee={setVAssignee} vEmoji={vEmoji} setVEmoji={setVEmoji} vDeadline={vDeadline} setVDeadline={setVDeadline} addVazifa={addVazifa} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} delVazifa={delVazifa} addGiftMoney={addGiftMoney} cleanupKidDuplicates={cleanupKidDuplicates} isBosh={isBosh} />}
        {scr === "bilim"   && <BilimHub user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={() => setScr("bosh")} gardenData={gardenData} onGarden={() => { setScr("profil"); setPTab("garden"); }} />}
        {scr === "qarz"    && <DebtsPage      {...pageProps} {...debts} generateTilxat={generateTilxat} verifyTilxat={verifyTilxat} setVerifyTilxat={setVerifyTilxat} />}
        {(scr === "hisobot" || scr === "maslahat") && <ReportsPage    {...pageProps} hisFil={hisFil} setHisFil={setHisFil} exportLoading={exportLoading} exportExcel={exportExcel} exportPDF={exportPDF} adv={adv} setAdv={setAdv} advL={advL} advErr={advErr} aiAdv={aiAdv} showImport={showImport} setShowImport={setShowImport} importRows={importRows} setImportRows={setImportRows} importStep={importStep} setImportStep={setImportStep} importFileRef={importFileRef} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} />}
        {scr === "profil"  && <ProfilePage    {...pageProps} pTab={pTab} setPTab={setPTab} edN={edN} setEdN={setEdN} newN={newN} setNewN={setNewN} newF={newF} setNewF={setNewF} edT={edT} setEdT={setEdT} newT={newT} setNewT={setNewT} saveTel={saveTel} fBj={fBj} setFBj={setFBj} fKL={fKL} setFKL={setFKL} faqO={faqO} setFaqO={setFaqO} pinStep={pinStep} setPinStep={setPinStep} pinVal={pinVal} setPinVal={setPinVal} pinCfm={pinCfm} setPinCfm={setPinCfm} finger={finger} setFinger={setFinger} showBilim={showBilim} setShowBilim={setShowBilim} showAddKid={showAddKid} setShowAddKid={setShowAddKid} kidName={kidName} setKidName={setKidName} kidSurname={kidSurname} setKidSurname={setKidSurname} kidBirthYear={kidBirthYear} setKidBirthYear={setKidBirthYear} kidGender={kidGender} setKidGender={setKidGender} kidGrade={kidGrade} setKidGrade={setKidGrade} kidLogin={kidLogin} setKidLogin={setKidLogin} kidPw={kidPw} setKidPw={setKidPw} showReferral={showReferral} setShowReferral={setShowReferral} refCount={refCount} fbRating={fbRating} setFbRating={setFbRating} fbText={fbText} setFbText={setFbText} fbType={fbType} setFbType={setFbType} fbSending={fbSending} sendFeedback={sendFeedback} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} waterGarden={waterGarden} gardenData={gardenData} stars={stars} addKidAccount={addKidAccount} delKidAccount={delKidAccount} purgeData={purgeData} activatePremium={activatePremium} setShowPremModal={setShowPremModal} logout={logout} fRef={fRef} doPhoto={doPhoto} rmPhoto={rmPhoto} toggleReportAccess={toggleReportAccess} rates={rates} rateL={rateL} fetchRates={fetchRates} notifEnabled={notifEnabled} notifTime={notifTime} toggleNotif={toggleNotif} saveNotifTime={saveNotifTime} APP_VER={APP_VER} saveBj={saveBj} updName={updName} setVal={setVal} setLg={setLg} setDark={setDark} showValDD={showValDD} setShowValDD={setShowValDD} qarzlar={qarzlar} bX={bX} bD={bD} />}
      </div>

      {/* ── Ovoz bilan kiritish oynasi ── */}
      {showVoice && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <button onClick={() => { stopVoice(); setShowVoice(false); }} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 22, cursor: "pointer" }}>{"\u00d7"}</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{lg === "uz" ? "Ovoz bilan kiritish" : "Voice input"}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 36, textAlign: "center", maxWidth: 300 }}>{lg === "uz" ? "Masalan: \"Transportga 20 ming ishlatdim\"" : "E.g. \"Spent 20000 on transport\""}</div>
        <button onClick={voiceOn ? stopVoice : startVoice} style={{ width: 110, height: 110, borderRadius: "50%", background: voiceOn ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 30, boxShadow: voiceOn ? "0 0 0 12px rgba(239,68,68,.2),0 0 0 24px rgba(239,68,68,.1)" : "0 8px 30px rgba(139,92,246,.5)", transition: "all .3s" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div style={{ fontSize: 14, color: voiceOn ? "#ef4444" : "rgba(255,255,255,.7)", fontWeight: 600, marginBottom: 24 }}>{voiceOn ? (lg === "uz" ? "Tinglayapman..." : "Listening...") : (lg === "uz" ? "Bosing va gapiring" : "Tap and speak")}</div>
        {voiceText && <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 16, padding: "16px 20px", marginBottom: 20, maxWidth: 340, width: "100%" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{lg === "uz" ? "Eshitildi" : "Heard"}</div>
          <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.5 }}>{voiceText}</div>
        </div>}
        {voiceParsed && <div style={{ background: "linear-gradient(135deg,#10b98122,#05966911)", border: "1.5px solid #10b98155", borderRadius: 16, padding: "16px 20px", marginBottom: 24, maxWidth: 340, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{lg === "uz" ? "Summa" : "Amount"}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{f(voiceParsed.summa, true)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{lg === "uz" ? "Kategoriya" : "Category"}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{KN[lg][KATS.findIndex(k => k.id === voiceParsed.kat)]}</span>
          </div>
        </div>}
        {(voiceText && !voiceOn) && <div style={{ display: "flex", gap: 10, maxWidth: 340, width: "100%" }}>
          <button onClick={() => { setVoiceText(""); setVoiceParsed(null); startVoice(); }} style={{ flex: 1, background: "rgba(255,255,255,.15)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{lg === "uz" ? "Qayta" : "Retry"}</button>
          <button onClick={applyVoice} disabled={!voiceParsed} style={{ flex: 2, background: voiceParsed ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,.1)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: voiceParsed ? "pointer" : "not-allowed", opacity: voiceParsed ? 1 : .5 }}>{lg === "uz" ? "Qo'shish" : "Add"}</button>
        </div>}
      </div>}

      {/* ── Chek QR skaneri oynasi ── */}
      {showScanner && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000", zIndex: 1000, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,.6)", position: "relative", zIndex: 2 }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{lg === "uz" ? "Chek skaneri" : "Receipt scanner"}</div>
          <button onClick={stopScanner} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer" }}>{"\u00d7"}</button>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={scanVideoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}/>
          <div style={{ position: "relative", zIndex: 2, width: 240, height: 240, border: "3px solid " + th.ac, borderRadius: 24, boxShadow: "0 0 0 9999px rgba(0,0,0,.5)" }}>
            <div style={{ position: "absolute", top: -3, left: -3, width: 40, height: 40, borderTop: "5px solid #fff", borderLeft: "5px solid #fff", borderRadius: "24px 0 0 0" }}/>
            <div style={{ position: "absolute", top: -3, right: -3, width: 40, height: 40, borderTop: "5px solid #fff", borderRight: "5px solid #fff", borderRadius: "0 24px 0 0" }}/>
            <div style={{ position: "absolute", bottom: -3, left: -3, width: 40, height: 40, borderBottom: "5px solid #fff", borderLeft: "5px solid #fff", borderRadius: "0 0 0 24px" }}/>
            <div style={{ position: "absolute", bottom: -3, right: -3, width: 40, height: 40, borderBottom: "5px solid #fff", borderRight: "5px solid #fff", borderRadius: "0 0 24px 0" }}/>
          </div>
        </div>
        <div style={{ padding: "20px 24px 40px", background: "rgba(0,0,0,.6)", textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 14, marginBottom: 6 }}>{scanMsg}</div>
          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12, marginBottom: 16 }}>{lg === "uz" ? "Chekdagi QR kodni ramka ichiga joylang" : "Point the receipt QR into the frame"}</div>
          <button onClick={stopScanner} style={{ background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{lg === "uz" ? "Qo'lda kiritish" : "Enter manually"}</button>
        </div>
      </div>}

      {/* AddTransactionModal */}
      {showAddModal && <AddTransactionModal th={th} STY={STY} lg={lg} t={t} f={f} ok$={ok$} buzz={buzz} user={user} oila={oila} azolar={azolar} xar={xar} dar={dar} addX={addX} addD={addD} addModalTab={addModalTab} setAddModalTab={setAddModalTab} addStep={addStep} setAddStep={setAddStep} addKat={addKat} setAddKat={setAddKat} isPremium={isPremium} setShowPremModal={setShowPremModal} prefill={scanPrefill} onVoice={startVoice} onScan={startScanner} onClose={() => { setShowAddModal(false); setScanPrefill(null); }} />}

      {/* Bottom Nav */}
      <BottomNav navItems={navItems} scr={scr} setScr={setScr} th={th} isKid={isKid} buzz={buzz} setShowAddModal={setShowAddModal} setAddModalTab={setAddModalTab} setAddStep={setAddStep} setAddKat={setAddKat} vazPendingCount={vazifalar.filter(v => v.status === "done").length} />
    </div>
  );
}
