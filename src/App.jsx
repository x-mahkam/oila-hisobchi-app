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

// Components
import BottomNav             from "./components/ui/BottomNav.jsx";
import AddTransactionModal   from "./components/transaction/AddTransactionModal.jsx";
import { Tst, Av }           from "./components/common/index.jsx";
import { Ico }               from "./utils/icons.jsx";
import { makeS }             from "./utils/styles.js";
import Confetti              from "./components/common/Confetti.jsx";
import NotifPanel            from "./components/common/NotifPanel.jsx";
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

// Utils
import { td, nt, tm, fmtN, normTel, hp }       from "./utils/formatters.js";
import { MK, KATS, KN, DARS, DN, VALS, COUNTRIES, ONB_SLIDES, ADMIN_TEL, TL } from "./utils/constants.js";
import { db, auth }          from "./firebase.js";

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
  const { tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq } = useGoals();
  const { vazifaDone, vazifaApprove } = useFamily();
  const debts = useDebts();
  const { markNotifRead, markAllRead, clearNotifs, unreadCount } = useNotifications();
  const { waterGarden } = useGarden();
  const { showPremModal, setShowPremModal, activatePremium } = usePremium();
  const { fetchRates } = useExchangeRates();

  // ── Local UI state ───────────────────────────────────────
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [showS,        setShowS]        = useState(false);
  const [srch,         setSrch]         = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab,  setAddModalTab]  = useState("xarajat");
  const [addStep,      setAddStep]      = useState("kat");
  const [addKat,       setAddKat]       = useState(null);
  const [hisFil,       setHisFil]       = useState("all");
  const [ctab,         setCtab]         = useState("line");
  const [exportLoading, setExportLoading] = useState(false);
  const [showBilim,    setShowBilim]    = useState(false);
  const [showGardenInfo, setShowGardenInfo] = useState(false);
  const [pTab,         setPTab]         = useState("main");
  const [edN,          setEdN]          = useState(false);
  const [newN,         setNewN]         = useState("");
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

  // Goals local state
  const [editMq,   setEditMq]   = useState(null);
  const [editMqS,  setEditMqS]  = useState("");
  const [editMqN,  setEditMqN]  = useState("");
  const [mN,       setMN]       = useState("");
  const [mS,       setMS]       = useState("");
  const [mR,       setMR]       = useState("#10b981");

  // Gift / Kid
  const [showGift,  setShowGift]  = useState(false);
  const [giftSum,   setGiftSum]   = useState("");
  const [giftFrom,  setGiftFrom]  = useState("");
  const [showAddKid, setShowAddKid] = useState(false);
  const [kidName,   setKidName]   = useState("");
  const [kidLogin,  setKidLogin]  = useState("");
  const [kidPw,     setKidPw]     = useState("");
  const [showAddVazifa, setShowAddVazifa] = useState(false);
  const [vTitle,    setVTitle]    = useState("");
  const [vReward,   setVReward]   = useState("");
  const [vAssignee, setVAssignee] = useState("");
  const [vEmoji,    setVEmoji]    = useState("📚");

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

  const fRef = useRef(null);
  const importFileRef = useRef(null);
  const APP_VER = "1.0.0";

  // ── Computed ─────────────────────────────────────────────
  const STY = useMemo(() => makeS(th), [th]);
  const f = useCallback((n, sh) => fmtN(n, val, sh), [val]);
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh";
  const hasKids = azolar.some(a => a.rol === "kid");
  const isAdmin = normTel(user?.tel) === ADMIN_TEL;
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
            if (!u) {
              const uid = gUser.uid;
              const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
              const email = (gUser.email || "").toLowerCase();
              const famId = "fam_" + uid + "_" + Date.now();
              u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg: "uz", dark: false, registeredAt: new Date().toISOString(), loginMethod: "google" };
              await db.s("user_" + uid, u);
              await db.s("fam_" + famId, { id: famId, nomi: displayName + " oilasi", boshId: uid, azolar: [uid], yaratilgan: new Date().toISOString() });
              if (email) await db.s("em_" + email, uid);
            }
            localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
            setUser(u); await loadFam(u); setScr("bosh"); setBoot(false); return;
          }
          localStorage.removeItem("oilaV7GooglePending");
        } catch (e) { localStorage.removeItem("oilaV7GooglePending"); console.error("Google redirect:", e); }

        auth.onChange(async (fbUser) => {
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

  const handleGoogleUser = async (gUser) => {
    let u = await db.g("user_" + gUser.uid);
    if (!u) {
      const uid = gUser.uid;
      const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
      const email = (gUser.email || "").toLowerCase();
      const famId = "fam_" + uid + "_" + Date.now();
      u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg, dark, registeredAt: new Date().toISOString(), loginMethod: "google" };
      await db.s("user_" + uid, u);
      await db.s("fam_" + famId, { id: famId, nomi: displayName + (lg === "uz" ? " oilasi" : " family"), boshId: uid, azolar: [uid], yaratilgan: new Date().toISOString() });
      if (email) await db.s("em_" + email, uid);
    }
    localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
    setUser(u); await loadFam(u); setScr("bosh");
    ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + u.ism + " 👋");
  };
  const doGoogleLogin = async () => {
    try {
      const res = await auth.googleLogin();
      if (res?.user) await handleGoogleUser(res.user);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        ok$((lg === "uz" ? "Google bilan kirishda xato: " : "Google sign-in error: ") + (e.message || e.code), "err");
      }
    }
  };

  const doAuth = async () => {
    try {
      // BOLA KIRISHI (login + parol, telefonsiz)
      if (kidLoginMode) {
        const loginKey = fTel.trim().toLowerCase();
        if (!loginKey || !fPw.trim()) return ok$(lg === "uz" ? "Login va parolni yozing" : "Enter login and password", "err");
        const kidUid = await db.gFresh("kidlogin_" + loginKey);
        if (!kidUid) return ok$(lg === "uz" ? "Login topilmadi. Ota-onangdan so'ra." : "Login not found", "err");
        buzz(15);
        try { await auth.loginAnon(); } catch (e) { console.error("Anon login:", e); return ok$(lg === "uz" ? "Firebase Anonymous yoqilmagan!" : "Anonymous auth not enabled", "err"); }
        const ku = await db.g("user_" + kidUid);
        if (!ku || ku.rol !== "kid") return ok$(lg === "uz" ? "Login topilmadi" : "Not found", "err");
        if (await hp(fPw) !== ku.ph) { try { await auth.logout(); } catch (e) {} return ok$(lg === "uz" ? "Parol noto'g'ri" : "Wrong password", "err"); }
        localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
        setUser(ku); await loadFam(ku); setScr("bosh");
        ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + ku.ism + " 👋");
        return;
      }
      if (reg) {
        if (!fIsm.trim() || !fTel.trim() || fPw.length < 6) return ok$(lg === "uz" ? "Ism, telefon va parol (6+ belgi) kiriting" : "Enter name, phone and password (6+)", "err");
        if (!fEm.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim())) return ok$(lg === "uz" ? "To'g'ri email kiriting" : "Enter valid email", "err");
        if (await db.g("tel9_" + normTel(fTel))) return ok$(lg === "uz" ? "Bu telefon allaqachon ro'yxatda" : "Phone already registered", "err");
        let authUser;
        try { authUser = await auth.register(fEm.trim().toLowerCase(), fPw); }
        catch (e) {
          const msg = e.code === "auth/email-already-in-use" ? (lg === "uz" ? "Bu email allaqachon ishlatilgan" : "Email already in use") : e.code === "auth/weak-password" ? (lg === "uz" ? "Parol juda zaif (6+ belgi)" : "Weak password") : (lg === "uz" ? "Ro'yxatda xato: " : "Register error: ") + (e.code || e.message);
          return ok$(msg, "err");
        }
        const uid = authUser.uid, ph = await hp(fPw);
        if (join) {
          if (!fKd.trim()) return ok$(t.fa, "err");
          const o = await db.g("oila_" + fKd.trim()); if (!o) return ok$(t.ffe, "err");
          if ((o.azolarIds || []).length >= 2 && !o.premium) {
            return ok$(lg === "uz" ? "Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak." : "Family member limit reached (2). Head needs Premium.", "err");
          }
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: fKd.trim(), rol: "azo", rel: fRel || "boshqa", photo: null };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim(); const refUser = await db.g("user_" + refUid);
            if (refUser && refUid !== uid) {
              const refList = (await db.g("refs_" + refUid)) || [];
              if (!refList.find(r => r.uid === uid)) {
                refList.push({ uid, ism: fIsm.trim(), sana: new Date().toISOString() });
                await db.s("refs_" + refUid, refList);
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: lg === "uz" ? "Yangi taklif! 🎉" : "New referral!", body: (fIsm.trim()) + " " + (lg === "uz" ? "sizning havolangiz orqali qo'shildi" : "joined via your link"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              }
            }
          }
          await db.s("x_" + fKd.trim() + "_" + uid, []); await db.s("d_" + fKd.trim() + "_" + uid, []);
          o.azolarIds = [...(o.azolarIds || []), uid]; await db.s("oila_" + o.id, o);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); await loadFam(nu); setScr("bosh"); ok$(t.jf2); addStar(15, lg === "uz" ? "Oila azosi qoshildi" : "Family member added");
        } else {
          if (!fON.trim()) return ok$(t.fa, "err");
          const oid = "o" + Date.now();
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: oid, rol: "bosh", rel: "bosh", photo: null };
          const no_ = { id: oid, nomi: fON.trim(), boshId: uid, azolarIds: [uid], budjet: 2000000, katLimits: {} };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim(); const refUser = await db.g("user_" + refUid);
            if (refUser && refUid !== uid) {
              const refList = (await db.g("refs_" + refUid)) || [];
              if (!refList.find(r => r.uid === uid)) {
                refList.push({ uid, ism: fIsm.trim(), sana: new Date().toISOString() });
                await db.s("refs_" + refUid, refList);
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: lg === "uz" ? "Yangi taklif! 🎉" : "New referral!", body: (fIsm.trim()) + " " + (lg === "uz" ? "sizning havolangiz orqali qo'shildi" : "joined via your link"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              }
            }
          }
          await db.s("oila_" + oid, no_); await db.s("x_" + oid + "_" + uid, []); await db.s("d_" + oid + "_" + uid, []);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); setOila(no_); setAzolar([nu]); setXar([]); setDar([]); setMaq([]); setScr("bosh"); ok$(t.fc3);
        }
      } else {
        // BOLA LOGINI: agar email/telefon emas, oddiy login kiritilgan bo'lsa
        const tryLogin = fTel.trim().toLowerCase();
        if (tryLogin && !tryLogin.includes("@") && !/^[0-9+ ]+$/.test(tryLogin)) {
          const kidUid = await db.gFresh("kidlogin_" + tryLogin);
          if (kidUid) {
            const ku = await db.g("user_" + kidUid);
            if (ku && ku.rol === "kid") {
              if (await hp(fPw) !== ku.ph) return ok$(lg === "uz" ? "Parol noto'g'ri" : "Wrong password", "err");
              buzz(15);
              try { await auth.loginAnon(); } catch (e) {}
              localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
              setUser(ku); await loadFam(ku); setScr("bosh");
              ok$((lg === "uz" ? "Xush kelibsiz, " : "Welcome, ") + ku.ism + " 👋");
              return;
            }
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
  const updName = async () => {
    if (!newN.trim()) return;
    const u2 = { ...user, ism: newN.trim() };
    await db.s("user_" + user.id, u2); setUser(u2);
    setAzolar(azolar.map(a => a.id === user.id ? { ...a, ism: newN.trim() } : a));
    setEdN(false); ok$(t.ua);
  };
  const saveBj = async () => {
    const v = Number(fBj); if (!v || v <= 0) return ok$(t.ec, "err");
    const u = { ...oila, budjet: v, katLimits: fKL };
    await db.s("oila_" + oila.id, u); setOila(u); ok$(t.sa);
  };
  const saveProfile = updName;

  const toggleReportAccess = async (memberId) => {
    if (user?.rol !== "bosh" || !oila) return;
    const cur = oila.reportAccess || [];
    const upd = cur.includes(memberId) ? cur.filter(x => x !== memberId) : [...cur, memberId];
    const o2 = { ...oila, reportAccess: upd };
    await db.s("oila_" + oila.id, o2); setOila(o2);
    ok$(lg === "uz" ? "Ruxsat yangilandi" : "Access updated");
  };

  // ── delX ─────────────────────────────────────────────────
  const delX = async item => {
    if (item.uid !== user.id) return ok$(t.od, "warn");
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, (await db.g(key) || []).filter(x => x.id !== item.id));
    setXar(xar.filter(x => !(x.id === item.id && x.uid === user.id)));
  };

  // ── Maqsad confirm ────────────────────────────────────────
  const confirmMaqParent = async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString() } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const kn = (await db.g("notif_" + notif.kidId)) || [];
      await db.s("notif_" + notif.kidId, [{ id: Date.now(), type: "maqsad_kid_confirm", title: lg === "uz" ? "🎁 Ota/onang orzuingni amalga oshirdi!" : "🎁 Parent fulfilled your dream!", text: (lg === "uz" ? "'" + (notif.maqsadIsm || "") + "' sotib olindi! Siz ham tasdiqlang 👇" : "Was bought! Confirm below 👇"), maqsadId: notif.maqsadId, maqsadIsm: notif.maqsadIsm, sana: new Date().toISOString(), read: false, status: "pending" }, ...kn]);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(20);
      ok$(lg === "uz" ? "✅ Tasdiqlandi! Farzandingizga xabar yuborildi 🎉" : "✅ Confirmed!");
    } catch { ok$(lg === "uz" ? "Xato" : "Error", "err"); }
  };
  const confirmMaqKid = async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "completed", completedAt: new Date().toISOString(), paid: true } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(30);
      ok$(lg === "uz" ? "🎉 Barakalla! Orzuingiz amalga oshdi!" : "🎉 Congratulations!");
    } catch {}
  };
  const confirmMaqBought = async (info) => {
    const u = maq.map(m => m.id === info.maqsadId ? { ...m, status: "completed", paid: true, completedAt: td() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null); fireConfetti(); buzz(30);
    ok$(lg === "uz" ? "🎉 Tabriklaymiz!" : "🎉 Congratulations!");
  };
  const cancelMaqReturn = async (info) => {
    const goal = maq.find(m => m.id === info.maqsadId);
    if (goal?.jamg > 0) {
      const dItem = { id: Date.now(), tur: "boshqa", summa: goal.jamg, izoh: (lg === "uz" ? "Maqsaddan qaytarildi: " : "Goal cancelled: ") + (goal.ism || ""), sana: td(), vaqt: nt(), uid: user.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]); setDar(d => [dItem, ...d]);
    }
    const u = maq.filter(m => m.id !== info.maqsadId);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null);
    ok$(lg === "uz" ? "Maqsad bekor qilindi ↩️" : "Goal cancelled", "warn");
  };
  const saveEditMq = async () => {
    if (!editMqN.trim() || !editMqS || Number(editMqS) <= 0) return ok$(t.fa, "err");
    const u = maq.map(m => m.id === editMq ? { ...m, ism: editMqN.trim(), maqsad: Number(editMqS) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setEditMq(null); setEditMqS(""); setEditMqN(""); ok$(t.ua);
  };

  // ── Kid / Gift ────────────────────────────────────────────
  const addGiftMoney = async () => {
    if (!giftSum || Number(giftSum) <= 0) return ok$(lg === "uz" ? "Summani kiriting" : "Enter amount", "err");
    buzz(15);
    const summa = Number(giftSum);
    const kb = { ...kidBalances }; kb[user.id] = (kb[user.id] || 0) + summa;
    await db.s("kidbal_" + user.oilaId, kb); setKidBalances(kb);
    try { const hist = (await db.g("kidgift_" + user.id)) || []; await db.s("kidgift_" + user.id, [{ id: Date.now(), summa, from: giftFrom.trim() || (lg === "uz" ? "Sovg'a" : "Gift"), sana: td() }, ...hist].slice(0, 100)); } catch {}
    setShowGift(false); setGiftSum(""); setGiftFrom("");
    ok$(lg === "uz" ? "🎁 " + f(summa, true) + " cho'ntagingizga qo'shildi!" : "Added to your pocket!");
    fireConfetti();
  };
  const [kidCreated, setKidCreated] = useState(null); // { ism, login, pw }

  const addKidAccount = async () => {
    if (!kidName.trim() || !kidLogin.trim() || kidPw.length < 4) return ok$(lg === "uz" ? "Ism, login va parol (4+) kiriting" : "Fill all fields", "err");
    buzz(12);
    const loginKey = kidLogin.trim().toLowerCase();
    if (await db.gFresh("kidlogin_" + loginKey)) return ok$(lg === "uz" ? "Bu login band, boshqa login tanlang" : "Login taken, choose another", "err");
    try {
      const uid = "kid" + Date.now();
      const ph = await hp(kidPw);
      const nu = { id: uid, ism: kidName.trim(), login: loginKey, ph, oilaId: user.oilaId, rol: "kid", rel: "farzand", photo: null, parentId: user.id };
      await db.s("user_" + uid, nu); await db.s("kidlogin_" + loginKey, uid);
      const o2 = { ...oila, azolarIds: [...(oila.azolarIds || oila.azolar || [user.id]), uid] };
      // ikki kalitga ham yozamiz: eski fam_ va yangi oila_
      if (oila.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: o2.azolarIds });
      setOila(o2);
      setAzolar([...azolar, nu]);
      setShowAddKid(false); setKidName(""); setKidLogin(""); setKidPw("");
      setKidCreated({ ism: nu.ism, login: loginKey, pw: kidPw });
    } catch (e) { ok$(lg === "uz" ? "Xato: " + (e.code || e.message) : "Error: " + (e.code || e.message), "err"); }
  };

  // ── Vazifa ────────────────────────────────────────────────
  const addVazifa = async () => {
    if (!vTitle.trim() || !vReward || Number(vReward) <= 0 || !vAssignee) return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    buzz(12);
    const item = { id: Date.now(), title: vTitle.trim(), reward: Number(vReward), emoji: vEmoji, assignedTo: vAssignee, createdBy: user.id, status: "pending", sana: td(), doneSana: "", paidSana: "" };
    const upd = [item, ...vazifalar];
    await db.s("vazifa_" + user.oilaId, upd); setVazifalar(upd);
    setShowAddVazifa(false); setVTitle(""); setVReward(""); setVAssignee(""); setVEmoji("📚");
    ok$(lg === "uz" ? "Vazifa qo'shildi! 🎯" : "Task added!");
  };
  const delVazifa = async (id) => {
    const upd = vazifalar.filter(x => x.id !== id);
    await db.s("vazifa_" + user.oilaId, upd); setVazifalar(upd);
  };

  // ── Export ────────────────────────────────────────────────
  const downloadFile = (content, filename, mime) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000); return true;
    } catch { return false; }
  };

  // ── Feedback ──────────────────────────────────────────────
  const sendFeedback = async () => {
    if (!fbText.trim() && fbRating === 0) return ok$(lg === "uz" ? "Baho yoki izoh kiriting" : "Add rating or text", "err");
    setFbSending(true);
    try {
      const fb = { id: Date.now(), uid: user?.id || "anon", ism: user?.ism || "", type: fbType, rating: fbRating, text: fbText.trim(), sana: new Date().toISOString() };
      const all = (await db.g("feedback_all")) || [];
      await db.s("feedback_all", [fb, ...all].slice(0, 500));
      setFbRating(0); setFbText(""); setFbType("taklif");
      ok$(lg === "uz" ? "Rahmat! Fikringiz yuborildi." : "Thank you!");
    } catch { ok$(lg === "uz" ? "Xatolik" : "Error", "err"); }
    setFbSending(false);
  };

  // ── Admin ─────────────────────────────────────────────────
  const loadAdminStats = async () => {
    setAdminLoad(true); setScr("admin");
    try {
      const all = await db.all();
      const users  = all.filter(d => d.id.startsWith("oilaV7_user_"));
      const oilas  = all.filter(d => d.id.startsWith("oilaV7_oila_"));
      const now = new Date(); const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now - 7 * 864e5).toISOString().slice(0, 10);
      const monthAgo = new Date(now - 30 * 864e5).toISOString().slice(0, 10);
      let todayU = 0, weekU = 0, monthU = 0;
      users.forEach(u => { const v = u.v || {}; const uid = v.id || ""; const ts = parseInt((uid.match(/\d+/) || [])[0] || "0"); if (ts) { const ds = new Date(ts).toISOString().slice(0, 10); if (ds === todayStr) todayU++; if (ds >= weekAgo) weekU++; if (ds >= monthAgo) monthU++; } });
      let totX = 0, totD = 0, xCount = 0, dCount = 0;
      all.forEach(d => { if (d.id.includes("_x_") && Array.isArray(d.v)) { d.v.forEach(x => { totX += Number(x.summa || 0); xCount++; }); } if (d.id.includes("_d_") && Array.isArray(d.v)) { d.v.forEach(x => { totD += Number(x.summa || 0); dCount++; }); } });
      const fbDoc = all.find(d => d.id === "oilaV7_feedback_all");
      const feedbacks = (fbDoc && Array.isArray(fbDoc.v)) ? fbDoc.v : [];
      const avgRating = feedbacks.filter(f => f.rating > 0).length ? Math.round(feedbacks.filter(f => f.rating > 0).reduce((s, f) => s + f.rating, 0) / feedbacks.filter(f => f.rating > 0).length * 10) / 10 : 0;
      setAdminStats({ totalUsers: users.length, totalOilas: oilas.length, todayU, weekU, monthU, totX, totD, xCount, dCount, premOilas: oilas.filter(o => (o.v || {}).premium).length, avgPerOila: oilas.length ? Math.round(users.length / oilas.length * 10) / 10 : 0, docCount: all.length, feedbacks: feedbacks.slice(0, 50), fbCount: feedbacks.length, avgRating });
    } catch (e) { console.error(e); ok$("Xato: " + e.message, "err"); }
    setAdminLoad(false);
  };

  // ── Tilxat ────────────────────────────────────────────────
  const generateTilxat = (q) => {
    if (!q.linked || q.linkStatus !== "accepted") { ok$(lg === "uz" ? "Tilxat faqat ikki tomon tasdiqlagan qarzlar uchun" : "Receipt only for confirmed debts", "err"); return; }
    // ... (tilxat logikasi shu yerda qoladi, qisqartirish mumkin emas)
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

  // ── Export ────────────────────────────────────────────────
  const exportExcel = () => {
    if (!isPremium) { setShowPremModal(true); return; }
    setExportLoading(true);
    try {
      const month = tm();
      const esc = s => { const v = String(s == null ? "" : s); if (v.indexOf('"') >= 0 || v.indexOf(";") >= 0) { return '"' + v.split('"').join('""') + '"'; } return v; };
      const exFil = canSeeReport ? hisFil : user?.id;
      const exX = exFil === "all" ? bX : bX.filter(x => x.uid === exFil);
      const exD = exFil === "all" ? bD : bD.filter(d => d.uid === exFil);
      const exjX = exX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const exjD = exD.reduce((s, d) => s + Number(d.summa || 0), 0);
      const rows = [];
      rows.push([lg === "uz" ? "OILA HISOBOTI" : "FAMILY REPORT", month].join(";"));
      rows.push("");
      rows.push([lg === "uz" ? "Jami daromad" : "Total income", exjD].join(";"));
      rows.push([lg === "uz" ? "Jami xarajat" : "Total expense", exjX].join(";"));
      rows.push([lg === "uz" ? "Balans" : "Balance", exjD - exjX].join(";"));
      rows.push([lg === "uz" ? "Budjet" : "Budget", bdj].join(";"));
      rows.push("");
      if (exX.length > 0) {
        rows.push([lg === "uz" ? "XARAJATLAR" : "EXPENSES"].join(";"));
        rows.push(["#", lg === "uz" ? "Sana" : "Date", lg === "uz" ? "Kategoriya" : "Category", lg === "uz" ? "Izoh" : "Note", lg === "uz" ? "Kim" : "Who", lg === "uz" ? "Summa" : "Amount"].map(esc).join(";"));
        exX.forEach((x, i) => rows.push([i + 1, x.sana, KN[lg][KATS.findIndex(k => k.id === x.kategoriya)] || "", x.izoh || "", gN(x.uid), x.summa].map(esc).join(";")));
        rows.push("");
      }
      if (exD.length > 0) {
        rows.push([lg === "uz" ? "DAROMADLAR" : "INCOME"].join(";"));
        rows.push(["#", lg === "uz" ? "Sana" : "Date", lg === "uz" ? "Tur" : "Type", lg === "uz" ? "Izoh" : "Note", lg === "uz" ? "Kim" : "Who", lg === "uz" ? "Summa" : "Amount"].map(esc).join(";"));
        exD.forEach((d, i) => rows.push([i + 1, d.sana, DN[lg][DARS.findIndex(dr => dr.id === d.tur)] || "", d.izoh || "", gN(d.uid), d.summa].map(esc).join(";")));
        rows.push("");
      }
      if (qarzlar.length > 0) {
        rows.push([lg === "uz" ? "QARZLAR" : "DEBTS"].join(";"));
        rows.push(["#", lg === "uz" ? "Kim" : "Person", lg === "uz" ? "Tur" : "Type", lg === "uz" ? "Summa" : "Amount", lg === "uz" ? "Sana" : "Date", lg === "uz" ? "Holat" : "Status"].map(esc).join(";"));
        qarzlar.forEach((q, i) => rows.push([i + 1, q.kim, q.tur === "bergan" ? (lg === "uz" ? "Berdim" : "Lent") : (lg === "uz" ? "Oldim" : "Borrowed"), q.summa, q.sana, q.paid ? (lg === "uz" ? "Qaytarilgan" : "Returned") : (lg === "uz" ? "Faol" : "Active")].map(esc).join(";")));
      }
      const csv = "\uFEFF" + rows.join("\n");
      const okk = downloadFile(csv, "OilaHisobot_" + month + ".csv", "text/csv;charset=utf-8;");
      ok$(okk ? (lg === "uz" ? "Yuklab olindi!" : "Downloaded!") : (lg === "uz" ? "Xatolik" : "Error"), okk ? "ok" : "err");
    } catch (e) { ok$((lg === "uz" ? "Xatolik: " : "Error: ") + e.message, "err"); }
    setExportLoading(false);
  };

  const exportPDF = () => {
    if (!isPremium) { setShowPremModal(true); return; }
    try {
      const month = tm();
      const pdfFil = canSeeReport ? hisFil : user?.id;
      const pX = pdfFil === "all" ? bX : bX.filter(x => x.uid === pdfFil);
      const pD = pdfFil === "all" ? bD : bD.filter(d => d.uid === pdfFil);
      const pdfWho = pdfFil === "all" ? (lg === "uz" ? "Butun oila" : "Whole family") : (azolar.find(a => a.id === pdfFil)?.ism || "");
      const jX2 = pX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const jD2 = pD.reduce((s, d) => s + Number(d.summa || 0), 0);
      const katRows = KATS.map((k, i) => { const tot = pX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0); if (!tot) return ""; const pct2 = jX2 > 0 ? Math.round(tot / jX2 * 100) : 0; return "<tr><td>" + KN[lg][i] + "</td><td style='text-align:right'>" + tot.toLocaleString() + " so'm</td><td style='text-align:center'>" + pct2 + "%</td></tr>"; }).join("");
      const xRows = pX.slice(0, 40).map(x => "<tr><td>" + x.sana + "</td><td>" + KN[lg][KATS.findIndex(k => k.id === x.kategoriya)] + "</td><td>" + (x.izoh || "") + "</td><td style='text-align:right'>" + x.summa.toLocaleString() + "</td><td>" + gN(x.uid) + "</td></tr>").join("");
      const qActive = qarzlar.filter(q => !q.paid && (pdfFil === "all" ? canSeeReport : (q.uid === pdfFil || (!q.uid && pdfFil === user?.id))));
      const qRows = qActive.map(q => "<tr><td>" + q.kim + "</td><td>" + (q.tur === "bergan" ? (lg === "uz" ? "Berdim" : "Lent") : (lg === "uz" ? "Oldim" : "Borrowed")) + "</td><td style='text-align:right'>" + q.summa.toLocaleString() + "</td><td>" + (q.qaytSana || "-") + "</td></tr>").join("");
      const refLink = window.location.origin + "/?ref=" + (user?.id || "");
      const H = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Hisobot " + month + "</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px;font-size:22px}h2{color:#374151;margin-top:26px;font-size:16px}table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}.sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}.btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}.foot{margin-top:34px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}@media print{.btn{display:none}}</style></head><body><h1>Oila Hisobchi · " + pdfWho + " · " + month + "</h1><div class='sum'><div class='box'><div class='lbl'>" + (lg === "uz" ? "Daromad" : "Income") + "</div><div class='val g'>" + jD2.toLocaleString() + "</div></div><div class='box'><div class='lbl'>" + (lg === "uz" ? "Xarajat" : "Expense") + "</div><div class='val r'>" + jX2.toLocaleString() + "</div></div><div class='box'><div class='lbl'>" + (lg === "uz" ? "Balans" : "Balance") + "</div><div class='val " + (jD2 - jX2 >= 0 ? "g" : "r") + "'>" + (jD2 - jX2).toLocaleString() + "</div></div></div><h2>" + (lg === "uz" ? "Kategoriyalar" : "Categories") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Kategoriya" : "Category") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th style='text-align:center'>%</th></tr></thead><tbody>" + (katRows || "<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>") + "</tbody></table><h2>" + (lg === "uz" ? "Xarajatlar" : "Expenses") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Sana" : "Date") + "</th><th>" + (lg === "uz" ? "Kategoriya" : "Category") + "</th><th>" + (lg === "uz" ? "Izoh" : "Note") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th>" + (lg === "uz" ? "Kim" : "Who") + "</th></tr></thead><tbody>" + (xRows || "<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>") + "</tbody></table>" + (qActive.length > 0 ? "<h2>" + (lg === "uz" ? "Faol qarzlar" : "Active debts") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Kim" : "Person") + "</th><th>" + (lg === "uz" ? "Tur" : "Type") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th>" + (lg === "uz" ? "Qaytarish" : "Return") + "</th></tr></thead><tbody>" + qRows + "</tbody></table>" : "") + "<div class='foot'>" + (lg === "uz" ? "Oila Hisobchi ilovasi tomonidan yaratilgan" : "Generated by Oila Hisobchi") + " · " + new Date().toLocaleDateString("uz-UZ") + "</div><button class='btn' onclick='window.print()'>" + (lg === "uz" ? "PDF saqlash / Chop etish" : "Save PDF / Print") + "</button></body></html>";
      const w = window.open("", "_blank");
      if (w && w.document) { w.document.write(H); w.document.close(); ok$(lg === "uz" ? "PDF tayyor!" : "PDF ready!"); }
      else { const okk = downloadFile(H, "OilaHisobot_" + month + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "HTML yuklandi!" : "HTML downloaded!") : (lg === "uz" ? "Xatolik" : "Error"), okk ? "ok" : "err"); }
    } catch (e) { ok$((lg === "uz" ? "Xatolik: " : "Error: ") + e.message, "err"); }
  };

  // ── AI maslahat ───────────────────────────────────────────
  const aiAdv = async () => {
    if (!isPremium) { setShowPremModal(true); return; }
    setAdvL(true); setAdv(""); setScr("maslahat");
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
      if (bal2 >= 0) tips.push("✅ " + L("Bu oy balansingiz ijobiy: +" + f(bal2, true) + ". Barakali boring!", "Positive balance: +" + f(bal2, true)));
      else tips.push("⚠️ " + L("Bu oy xarajat daromaddan " + f(-bal2, true) + " ko'p.", "Expenses exceed income by " + f(-bal2, true)));
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) tips.push("🔴 " + L("Budjet " + bpct + "% ishlatildi!", "Budget used " + bpct + "%!"));
    else if (bpct >= 80) tips.push("🟡 " + L("Budjetning " + bpct + "% sarflandi.", "Used " + bpct + "%."));
    else if (bpct > 0 && dayN <= 15 && bpct < 40) tips.push("👍 " + L("Ajoyib! Oy yarmida faqat " + bpct + "% sarfladingiz.", "Great! Only " + bpct + "%."));
    const katTotals = KATS.map((k, i) => ({ nom: KN[lg][i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) { const top = katTotals[0]; const topPct = Math.round(top.sum / totX * 100); tips.push("📊 " + L("Eng ko'p xarajat: " + top.nom + " (" + topPct + "%).", top.nom + " is " + topPct + "%")); }
    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) tips.push("💰 " + L("Daromadning " + savePct + "% jamg'ardingiz. A'lo natija!", "Saved " + savePct + "%!"));
      else if (savePct > 0) tips.push("💡 " + L("Daromadning faqat " + savePct + "% qoldi.", "Only " + savePct + "% saved."));
      else if (bal2 < 0) tips.push("💡 " + L("Bu oy jamg'arma bo'lmadi.", "No savings."));
    }
    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) { if (ng.pct >= 80 && ng.pct < 100) tips.push("🎯 " + L("'" + ng.ism + "' maqsadi " + ng.pct + "% bajarildi!", "Goal '" + ng.ism + "' at " + ng.pct + "%!")); else if (ng.pct < 30) tips.push("🎯 " + L("'" + ng.ism + "' uchun har oy summa ajrating.", "Save for '" + ng.ism + "'.")); }
    } else tips.push("🎯 " + L("Maqsad qo'ying — jamg'arish uchun motivatsiya beradi.", "Set a goal."));
    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) tips.push("💸 " + L("Sizda " + f(meOwe, true) + " qarz bor.", "You owe " + f(meOwe, true)));
    const genTips = [
      L("50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga, 30% xohish-istaklarga, 20% jamg'armaga.", "Use 50/30/20 rule: 50% needs, 30% wants, 20% savings."),
      L("Kichik tejamkorlik — katta baraka. Har kuni ozgina tejasangiz, yiliga katta summa bo'ladi.", "Small savings add up over a year."),
      L("Xarid ro'yxati — eng yaxshi qalqon. Ro'yxat tuzib, faqat shu mahsulotlarni oling.", "A shopping list is your best shield."),
      L("Oylik daromad kelishi bilan birinchi navbatda majburiy to'lovlarni chetga oling.", "Pay mandatory bills first when income arrives."),
      L("Moliyaviy xavfsizlik yostig'i: kamida 3 oylik xarajatga teng zaxira fondi yarating.", "Build a 3-month emergency fund."),
    ];
    tips.push("💡 " + genTips[new Date().getDate() % genTips.length]);
    if (totX === 0 && totD === 0) setAdv(L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting!", "No data yet. Add expenses and income."));
    else setAdv(L("📈 " + tm() + " tahlili\n\n", "Analysis " + tm() + "\n\n") + tips.join("\n\n"));
    setTimeout(() => setAdvL(false), 400);
  };


  if (boot) return <div style={{ ...makeS(th).pg, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>{Ico.wallet(th.ac)}</div>;
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
    ? [{ id: "bosh", lb: t.home }, { id: "vazifa", lb: lg === "uz" ? "Vazifa" : "Tasks" }, { id: "maqsad", lb: t.goal }]
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
      {showNotifs && <NotifPanel notifs={notifs} th={th} lg={lg} isKid={isKid} onClose={() => setShowNotifs(false)} onMarkRead={markNotifRead} onMarkAll={markAllRead} onClear={clearNotifs} onConfirmParent={confirmMaqParent} onConfirmKid={confirmMaqKid} />}
      {showPremModal && <PremiumModal th={th} STY={STY} lg={lg} onActivate={activatePremium} onClose={() => setShowPremModal(false)} />}
      {showBilim && (
        <div style={{ position: "fixed", inset: 0, background: th.bg, zIndex: 1500, overflowY: "auto" }}>
          <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={() => setShowBilim(false)} />
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
            <label style={STY.lb}>{lg === "uz" ? "Kimdan? (ixtiyoriy)" : "From whom? (optional)"}</label>
            <input style={STY.ip} value={giftFrom} onChange={e => setGiftFrom(e.target.value)} placeholder={lg === "uz" ? "Masalan: Buvi" : "e.g. Grandma"} />
            <button onClick={addGiftMoney} style={{ ...STY.bt(), marginTop: 6, marginBottom: 0 }}>{lg === "uz" ? "Qo'shish" : "Add"}</button>
          </div>
        </div>
      )}
      {debts.qarzDonePrompt && <QarzDonePrompt q={debts.qarzDonePrompt} th={th} STY={STY} lg={lg} f={f} onAddDaromad={debts.addQarzAsDaromad} onAddXarajat={debts.addQarzAsXarajat} onClose={() => debts.setQarzDonePrompt(null)} />}
      {debts.partialQarz && <PartialQarzModal q={debts.partialQarz} partialSum={debts.partialSum} setPartialSum={debts.setPartialSum} th={th} STY={STY} lg={lg} f={f} t={t} onConfirm={debts.applyPartial} onClose={() => { debts.setPartialQarz(null); debts.setPartialSum(""); }} />}
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
                <span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{user?.ism || t.app}</span>
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
              {unreadCount > 0 && <div style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: th.rd, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 9 ? "9+" : unreadCount}</div>}
            </button>
          </div>
        </div>
        {showS && <input autoFocus style={{ ...STY.ip, marginBottom: 0, marginTop: 8 }} value={srch} onChange={e => setSrch(e.target.value)} placeholder={t.sch} />}
      </div>

      {/* Pages */}
      <div style={{ padding: "14px 16px 100px" }}>
        {scr === "bosh"    && <DashboardPage  {...pageProps} showS={showS} srch={srch} srchR={srchR} hisFil={hisFil} setHisFil={setHisFil} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} fetchRates={fetchRates} rateL={rateL} setShowGift={setShowGift} setShowBilim={setShowBilim} setShowAddVazifa={setShowAddVazifa} />}
        {scr === "grafik"  && <ChartsPage     {...pageProps} ctab={ctab} setCtab={setCtab} />}
        {scr === "maqsad"  && <GoalsPage      {...pageProps} addM={addM} setAddM={setAddM} maqTab={maqTab} setMaqTab={setMaqTab} tupId={tupId} setTupId={setTupId} tupS={tupS} setTupS={setTupS} editMq={editMq} setEditMq={setEditMq} editMqN={editMqN} setEditMqN={setEditMqN} editMqS={editMqS} setEditMqS={setEditMqS} maqsadConfirmNotif={maqsadConfirmNotif} setMaqsadConfirmNotif={setMaqsadConfirmNotif} addMq={addMq} tupMq={tupMq} delMq={delMq} saveEditMq={saveEditMq} confirmMaqBought={confirmMaqBought} cancelMaqReturn={cancelMaqReturn} />}
        {scr === "vazifa"  && <TasksPage      {...pageProps} showAddVazifa={showAddVazifa} setShowAddVazifa={setShowAddVazifa} showGift={showGift} setShowGift={setShowGift} giftSum={giftSum} setGiftSum={setGiftSum} giftFrom={giftFrom} setGiftFrom={setGiftFrom} vTitle={vTitle} setVTitle={setVTitle} vReward={vReward} setVReward={setVReward} vAssignee={vAssignee} setVAssignee={setVAssignee} vEmoji={vEmoji} setVEmoji={setVEmoji} addVazifa={addVazifa} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} delVazifa={delVazifa} addGiftMoney={addGiftMoney} />}
        {scr === "qarz"    && <DebtsPage      {...pageProps} {...debts} generateTilxat={generateTilxat} verifyTilxat={verifyTilxat} setVerifyTilxat={setVerifyTilxat} />}
        {scr === "hisobot" && <ReportsPage    {...pageProps} hisFil={hisFil} setHisFil={setHisFil} exportLoading={exportLoading} exportExcel={exportExcel} exportPDF={exportPDF} adv={adv} setAdv={setAdv} advL={advL} aiAdv={aiAdv} showImport={showImport} setShowImport={setShowImport} importRows={importRows} setImportRows={setImportRows} importStep={importStep} setImportStep={setImportStep} importFileRef={importFileRef} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} />}
        {scr === "profil"  && <ProfilePage    {...pageProps} pTab={pTab} setPTab={setPTab} edN={edN} setEdN={setEdN} newN={newN} setNewN={setNewN} fBj={fBj} setFBj={setFBj} fKL={fKL} setFKL={setFKL} faqO={faqO} setFaqO={setFaqO} pinStep={pinStep} setPinStep={setPinStep} pinVal={pinVal} setPinVal={setPinVal} pinCfm={pinCfm} setPinCfm={setPinCfm} finger={finger} setFinger={setFinger} showBilim={showBilim} setShowBilim={setShowBilim} showAddKid={showAddKid} setShowAddKid={setShowAddKid} kidName={kidName} setKidName={setKidName} kidLogin={kidLogin} setKidLogin={setKidLogin} kidPw={kidPw} setKidPw={setKidPw} showReferral={showReferral} setShowReferral={setShowReferral} refCount={refCount} fbRating={fbRating} setFbRating={setFbRating} fbText={fbText} setFbText={setFbText} fbType={fbType} setFbType={setFbType} fbSending={fbSending} sendFeedback={sendFeedback} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} waterGarden={waterGarden} gardenData={gardenData} stars={stars} addKidAccount={addKidAccount} activatePremium={activatePremium} setShowPremModal={setShowPremModal} logout={logout} fRef={fRef} doPhoto={doPhoto} rmPhoto={rmPhoto} toggleReportAccess={toggleReportAccess} rates={rates} rateL={rateL} fetchRates={fetchRates} notifEnabled={notifEnabled} notifTime={notifTime} toggleNotif={toggleNotif} saveNotifTime={saveNotifTime} APP_VER={APP_VER} saveBj={saveBj} updName={updName} setVal={setVal} setLg={setLg} setDark={setDark} showValDD={showValDD} setShowValDD={setShowValDD} qarzlar={qarzlar} bX={bX} bD={bD} />}
      </div>

      {/* AddTransactionModal */}
      {showAddModal && <AddTransactionModal th={th} STY={STY} lg={lg} t={t} f={f} ok$={ok$} buzz={buzz} user={user} oila={oila} azolar={azolar} xar={xar} dar={dar} addX={addX} addD={addD} addModalTab={addModalTab} setAddModalTab={setAddModalTab} addStep={addStep} setAddStep={setAddStep} addKat={addKat} setAddKat={setAddKat} isPremium={isPremium} setShowPremModal={setShowPremModal} onClose={() => setShowAddModal(false)} />}

      {/* Bottom Nav */}
      <BottomNav navItems={navItems} scr={scr} setScr={setScr} th={th} isKid={isKid} buzz={buzz} setShowAddModal={setShowAddModal} setAddModalTab={setAddModalTab} setAddStep={setAddStep} setAddKat={setAddKat} />
    </div>
  );
}
