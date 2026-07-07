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
  const { tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq } = useGoals();
  const { vazifaDone, vazifaApprove } = useFamily();
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

  // ── OVOZ BILAN KIRITISH (eski versiyadan tiklandi) ──
  const parseVoice = (text) => {
    if (!text) return null;
    const low = text.toLowerCase();
    let summa = 0;
    const mingMatch = low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(ming|tisyacha|\u0442\u044b\u0441\u044f\u0447|k)/);
    const milMatch = low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(million|mln|\u043c\u043b\u043d|millon)/);
    const plainMatch = low.match(/([0-9]{3,})/);
    if (milMatch) { summa = Math.round(parseFloat(milMatch[1].replace(",", ".")) * 1000000); }
    else if (mingMatch) { summa = Math.round(parseFloat(mingMatch[1].replace(",", ".")) * 1000); }
    else if (plainMatch) { summa = parseInt(plainMatch[1]); }
    const katKeys = {
      oziq: ["ovqat", "ovkat", "yeg", "tushlik", "nonushta", "kechki", "restoran", "kafe", "kofe", "choy", "non", "sut", "gosht", "go'sht", "meva", "sabzavot", "bozor", "produkt", "food", "oziq", "ovqatlanish"],
      transport: ["transport", "taksi", "taxi", "yo'l", "benzin", "yoqilg'i", "avtobus", "metro", "mashina", "fuel", "gas"],
      kommunal: ["kommunal", "svet", "gaz", "suv", "elektr", "internet", "telefon to'lov", "utility"],
      sog: ["dori", "dorixona", "shifokor", "kasalxona", "apteka", "sog'liq", "tibbiyot", "health", "medicine", "klinika"],
      kiyim: ["kiyim", "ko'ylak", "poyabzal", "kross", "clothes", "kiyinish"],
      konil: ["kino", "o'yin", "sayohat", "dam", "konsert", "entertainment", "kongilochar", "ko'ngil"],
      talim: ["kitob", "o'qish", "kurs", "ta'lim", "maktab", "universitet", "study", "education", "dars"],
      boshqa: ["boshqa", "other"],
    };
    let kat = "boshqa";
    for (const [k, words] of Object.entries(katKeys)) {
      if (words.some(w => low.includes(w))) { kat = k; break; }
    }
    if (summa <= 0) return null;
    return { summa, kat, text };
  };
  const startVoice = () => {
    if (!isPremium) { setShowPremModal(true); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setShowVoice(true); setVoiceText(""); setVoiceParsed(null); ok$(lg === "uz" ? "Brauzer ovozni qo'llamaydi. Qo'lda yozing." : "Voice not supported.", "warn"); return; }
    setShowVoice(true); setVoiceText(""); setVoiceParsed(null); setVoiceOn(true);
    try {
      const rec = new SR();
      rec.lang = lg === "uz" ? "uz-UZ" : "en-US";
      rec.interimResults = true; rec.continuous = false;
      rec.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) { txt += e.results[i][0].transcript; }
        setVoiceText(txt);
        const parsed = parseVoice(txt);
        if (parsed) setVoiceParsed(parsed);
      };
      rec.onerror = (e) => { setVoiceOn(false); if (e.error === "not-allowed" || e.error === "permission-denied") { ok$(lg === "uz" ? "Mikrofon ruxsati berilmadi." : "Mic denied.", "warn"); } };
      rec.onend = () => { setVoiceOn(false); };
      voiceRecRef.current = rec;
      rec.start();
    } catch (e) { setVoiceOn(false); ok$(lg === "uz" ? "Xatolik. Qo'lda yozing." : "Error.", "warn"); }
  };
  const stopVoice = () => {
    if (voiceRecRef.current) { try { voiceRecRef.current.stop(); } catch (e) {} }
    setVoiceOn(false);
  };
  const applyVoice = async () => {
    const parsed = voiceParsed || parseVoice(voiceText);
    if (!parsed) { return ok$(lg === "uz" ? "Summa topilmadi. Masalan: 'transportga 20 ming'" : "No amount found.", "err"); }
    const item = { id: Date.now(), kategoriya: parsed.kat, summa: parsed.summa, izoh: parsed.text.slice(0, 50), sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar([{ ...item, uid: user.id }, ...xar]);
    setShowVoice(false); setVoiceText(""); setVoiceParsed(null);
    ok$(lg === "uz" ? "Qo'shildi: " + f(parsed.summa, true) + " — " + KN[lg][KATS.findIndex(k => k.id === parsed.kat)] : "Added: " + f(parsed.summa, true));
  };

  // ── CHEK QR SKANERI (eski versiyadan tiklandi) ──
  const stopScanner = () => {
    if (scanRafRef.current) { cancelAnimationFrame(scanRafRef.current); scanRafRef.current = null; }
    if (scanStreamRef.current) { scanStreamRef.current.getTracks().forEach(tr => tr.stop()); scanStreamRef.current = null; }
    setShowScanner(false); setScanMsg("");
  };
  const openWithPrefill = (summa, sana, izoh) => {
    setScanPrefill({ summa, sana: sana || td(), izoh: izoh || "" });
    setAddModalTab("xarajat"); setAddStep("form"); setAddKat("boshqa");
    setShowAddModal(true);
  };
  const startScanner = async () => {
    if (!isPremium) { setShowPremModal(true); return; }
    setShowScanner(true); setScanMsg(lg === "uz" ? "Kamera ochilmoqda..." : "Opening camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      scanStreamRef.current = stream;
      if (scanVideoRef.current) { scanVideoRef.current.srcObject = stream; await scanVideoRef.current.play(); }
      setScanMsg(lg === "uz" ? "QR kodni ramkaga joylang" : "Point QR into frame");
      if ("BarcodeDetector" in window) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const scan = async () => {
          if (!scanVideoRef.current || !scanStreamRef.current) return;
          try {
            const codes = await detector.detect(scanVideoRef.current);
            if (codes && codes.length > 0) {
              const raw = codes[0].rawValue;
              stopScanner();
              const isUrl = /^https?:\/\//i.test(raw);
              let sana = "";
              const tmm = raw.match(/[?&]t=(\d{8})/i);
              if (tmm) { const d = tmm[1]; sana = d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8); }
              const rm = raw.match(/[?&]r=(\d+)/i);
              const izoh = rm ? (lg === "uz" ? "Chek #" : "Receipt #") + rm[1] : "";
              // 1) URL i= parametri (tiyinda)
              const im = raw.match(/[?&]i=([0-9]+)/i);
              if (im) {
                const v = Math.round(parseInt(im[1], 10) / 100);
                if (v > 0) { openWithPrefill(v, sana, izoh); ok$("\u2713 " + f(v, true) + (lg === "uz" ? " — tekshiring va saqlang" : " — verify & save")); return; }
              }
              if (isUrl) {
                ok$(lg === "uz" ? "Chek yuklanmoqda..." : "Loading receipt...");
                try {
                  const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(raw);
                  const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
                  const data = await resp.json();
                  const html = data.contents || "";
                  let summa = 0;
                  const jamiRgx = /[Jj]ami[^<]{0,60}?([\d][\d\s.,]*[\d])/;
                  const jm = html.replace(/<[^>]+>/g, " ").match(jamiRgx);
                  if (jm) {
                    const numStr = jm[1].replace(/\s/g, "").replace(/,(\d{2})$/, "").replace(/\.(\d{2})$/, "").replace(/[,.\s]/g, "");
                    const v = parseInt(numStr, 10);
                    if (v >= 100 && v <= 999999999) { summa = v; }
                  }
                  if (summa > 0) { openWithPrefill(summa, sana, izoh); ok$("\u2713 " + f(summa, true) + (lg === "uz" ? " — tekshiring va saqlang" : " — verify & save")); }
                  else { openWithPrefill("", sana, izoh); ok$(lg === "uz" ? "Summa topilmadi, qo'lda kiriting" : "Amount not found", "warn"); }
                } catch (err) { openWithPrefill("", sana, izoh); ok$(lg === "uz" ? "Chek yuklanmadi, qo'lda kiriting" : "Load failed", "warn"); }
              } else {
                const jm = raw.match(/[Jj]ami[^\n]{0,60}?([\d][\d\s.,]*[\d])/);
                if (jm) {
                  const numStr = jm[1].replace(/\s/g, "").replace(/,(\d{2})$/, "").replace(/\.(\d{2})$/, "").replace(/[,.\s]/g, "");
                  const v = parseInt(numStr, 10);
                  if (v >= 100 && v <= 999999999) { openWithPrefill(v, sana, izoh); ok$("\u2713 " + f(v, true)); return; }
                }
                openWithPrefill("", sana, izoh);
                ok$(lg === "uz" ? "Summa topilmadi, qo'lda kiriting" : "Amount not found", "warn");
              }
              return;
            }
          } catch (e) {}
          scanRafRef.current = requestAnimationFrame(scan);
        };
        scanRafRef.current = requestAnimationFrame(scan);
      } else { setScanMsg(lg === "uz" ? "Brauzer QR skanerini qo'llamaydi." : "QR scanner not supported."); }
    } catch (e) {
      const isDenied = (e.name === "NotAllowedError" || (e.message || "").indexOf("denied") >= 0 || (e.message || "").indexOf("Permission") >= 0);
      if (isDenied) { setScanMsg(lg === "uz" ? "Kamera ruxsati berilmadi. Sozlamalardan ruxsat bering." : "Camera denied."); }
      else { setScanMsg((lg === "uz" ? "Kamera ochilmadi. Qo'lda kiriting." : "Camera unavailable.") + " (" + (e.name || "") + ")"); }
    }
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
  const [showVoice, setShowVoice] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceParsed, setVoiceParsed] = useState(null);
  const voiceRecRef = useRef(null);
  const authBusyRef = useRef(false);  // ro'yxatdan o'tish/kirish davomida onChange'ni to'xtatadi
  // ── Chek QR skaneri ──
  const [showScanner, setShowScanner] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [scanPrefill, setScanPrefill] = useState(null);
  const scanVideoRef = useRef(null);
  const scanStreamRef = useRef(null);
  const scanRafRef = useRef(null);
  // Boshqa sahifaga o'tilganda qidiruv yopiladi
  useEffect(() => { setShowS(false); setSrch(""); /* eslint-disable-next-line */ }, [scr]);
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
  const [kidSurname,   setKidSurname]   = useState("");
  const [kidBirthYear, setKidBirthYear] = useState("");
  const [kidGender,    setKidGender]    = useState("");   // ixtiyoriy: "ogil" | "qiz"
  const [kidGrade,     setKidGrade]     = useState("");   // ixtiyoriy: 1–11
  const [showAddVazifa, setShowAddVazifa] = useState(false);
  const [vTitle,    setVTitle]    = useState("");
  const [vReward,   setVReward]   = useState("");
  const [vAssignee, setVAssignee] = useState("");
  const [vEmoji,    setVEmoji]    = useState("📚");
  const [vDeadline, setVDeadline] = useState(""); // vazifa muddati (ixtiyoriy; kechiksa mukofot yo'q)

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
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.message || ""), "err"); }
  };
  // ── Orzu oqimi: karta ichidagi tugmalar (bildirishnomaga bog'liq emas) ──
  const notifyTo = async (uid, type, title, text, extra = {}) => {
    try {
      const cur = (await db.g("notif_" + uid)) || [];
      await db.s("notif_" + uid, [{ id: Date.now() + Math.random(), type, title, text, sana: new Date().toISOString(), read: false, ...extra }, ...cur].slice(0, 100));
    } catch (e) {}
  };
  const boshIdOf = () => oila?.boshId || azolar.find(a => a.rol === "bosh")?.id;

  // Ota: "Olib berdim" — bola tasdig'iga o'tadi
  const parentBoughtMaqsad = async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString(), parentLater: false } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "maqsad_kid_confirm",
      lg === "uz" ? "🎁 Ota/onang orzuingni amalga oshirdi!" : "🎁 Parent fulfilled your dream!",
      "'" + (goal.ism || "") + "' " + (lg === "uz" ? "sotib olindi! Maqsad bo'limida tasdiqlang" : "was bought! Confirm in Goals"),
      { maqsadId: goal.id, maqsadIsm: goal.ism, status: "pending" });
    fireConfetti(); buzz(20);
    ok$(lg === "uz" ? "✅ Farzandingizga xabar yuborildi — u tasdiqlaydi" : "✅ Sent to child for confirmation");
  };

  // Ota: "Keyinroq olib beraman"
  const parentLaterMaqsad = async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, parentLater: true, parentLaterAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "yangilik",
      lg === "uz" ? "⏰ Orzuing esda!" : "⏰ Dream noted!",
      (lg === "uz" ? "Ota-onangiz '" : "Parent will buy '") + (goal.ism || "") + (lg === "uz" ? "'ni keyinroq olib berishini aytdi" : "' later"));
    ok$(lg === "uz" ? "Farzandingizga xabar berildi ⏰" : "Child notified ⏰");
  };

  // Bola: "Ha, oldim!" — orzu yopiladi
  const kidAcceptMaqsad = async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "completed", paid: true, completedAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "yangilik", lg === "uz" ? "🎉 Orzu amalga oshdi!" : "🎉 Dream fulfilled!",
      (user.ism || "") + " '" + (goal.ism || "") + "' " + (lg === "uz" ? "orzusini tasdiqladi. Rahmat!" : "confirmed."));
    fireConfetti(); buzz(30);
    ok$(lg === "uz" ? "🎉 Barakalla! Orzuingiz amalga oshdi!" : "🎉 Congratulations!");
  };

  // Bola: "Hali olganim yo'q" — holat otaga qaytadi
  const kidRejectMaqsad = async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "waiting_parent", parentConfirmedAt: null } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "maqsad_confirm", lg === "uz" ? "⚠️ Farzandingiz hali olmaganini aytdi" : "⚠️ Child says not received",
      (user.ism || "") + " '" + (goal.ism || "") + "' " + (lg === "uz" ? "hali qo'liga tegmaganini bildirdi. Iltimos, olib bering." : "not received yet."),
      { maqsadId: goal.id, kidId: user.id, kidIsm: user.ism, maqsadIsm: goal.ism, summa: goal.maqsad, status: "pending" });
    ok$(lg === "uz" ? "Ota-onangizga xabar yuborildi" : "Parent notified", "warn");
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
    // ── Validatsiya: majburiy — ism, familya, tug'ilgan yili; login/parol ──
    const nowY = new Date().getFullYear();
    const by = Number(kidBirthYear);
    if (kidName.trim().length < 2)    return ok$(lg === "uz" ? "Bola ismini kiriting (kamida 2 belgi)" : "Enter child's first name", "err");
    if (kidSurname.trim().length < 2) return ok$(lg === "uz" ? "Familyani kiriting (kamida 2 belgi)" : "Enter surname", "err");
    if (!/^\d{4}$/.test(String(kidBirthYear)) || by < nowY - 17 || by > nowY - 3)
      return ok$(lg === "uz" ? "Tug'ilgan yili noto'g'ri (bola 3–17 yoshda bo'lishi kerak)" : "Invalid birth year (age 3–17)", "err");
    if (kidGrade !== "" && (Number(kidGrade) < 1 || Number(kidGrade) > 11))
      return ok$(lg === "uz" ? "Sinf 1 dan 11 gacha bo'lishi kerak" : "Grade must be 1–11", "err");
    if (kidLogin.trim().length < 3)   return ok$(lg === "uz" ? "Login kamida 3 belgi bo'lsin" : "Login min 3 chars", "err");
    if (kidPw.length < 4)             return ok$(lg === "uz" ? "Parol kamida 4 belgi bo'lsin" : "Password min 4 chars", "err");
    buzz(12);
    const loginKey = kidLogin.trim().toLowerCase();
    if (await db.gFresh("kidlogin_" + loginKey)) return ok$(lg === "uz" ? "Bu login band, boshqa login tanlang" : "Login taken, choose another", "err");
    try {
      const uid = "kid" + Date.now();
      const ph = await hp(kidPw);
      const nu = { id: uid, ism: kidName.trim(), familya: kidSurname.trim(), birthYear: by, gender: kidGender || null, sinf: kidGrade !== "" ? Number(kidGrade) : null, login: loginKey, ph, oilaId: user.oilaId, rol: "kid", rel: "farzand", photo: null, parentId: user.id };
      await db.s("user_" + uid, nu); await db.s("kidlogin_" + loginKey, { uid, oila: user.oilaId });
      const o2 = { ...oila, azolarIds: [...(oila.azolarIds || oila.azolar || [user.id]), uid] };
      // ikki kalitga ham yozamiz: eski fam_ va yangi oila_
      if (oila.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: o2.azolarIds });
      setOila(o2);
      setAzolar([...azolar, nu]);
      setShowAddKid(false); setKidName(""); setKidSurname(""); setKidBirthYear(""); setKidGender(""); setKidGrade(""); setKidLogin(""); setKidPw("");
      setKidCreated({ ism: nu.ism, login: loginKey, pw: kidPw });
    } catch (e) { ok$(lg === "uz" ? "Xato: " + (e.code || e.message) : "Error: " + (e.code || e.message), "err"); }
  };

  // ── Eski bola login-lookup'larini davolash (bir sessiyada bir marta) ──
  // Eski format: kidlogin_<login> = "<uid>" (oila yo'q) — bola yangi qurilmadan
  // kira olmaydi (Rules). Ota-ona ilovani ochganda { uid, oila } ga yangilanadi.
  const kidLookupHealed = useRef(false);
  useEffect(() => {
    if (kidLookupHealed.current || !user || user.rol === "kid" || !user.oilaId || !azolar?.length) return;
    kidLookupHealed.current = true;
    (async () => {
      for (const a of azolar) {
        if (a.rol !== "kid" || !a.login) continue;
        try {
          const cur = await db.gFresh("kidlogin_" + a.login);
          if (cur && typeof cur !== "object") await db.s("kidlogin_" + a.login, { uid: a.id, oila: user.oilaId });
        } catch (e) {}
      }
    })();
  }, [user, azolar]);

  // ── Bola akkauntini o'chirish (faqat oila boshi yoki yaratgan ota-ona) ──
  const delKidAccount = async (kid) => {
    if (!kid || kid.rol !== "kid") return;
    if (user?.rol !== "bosh" && kid.parentId !== user?.id)
      return ok$(lg === "uz" ? "Faqat oila boshi yoki akkauntni yaratgan ota-ona o'chira oladi" : "Only the family head or the creating parent can delete", "err");
    buzz(15);
    try {
      if (kid.login) await db.del("kidlogin_" + kid.login);   // login bo'shatiladi (haqiqatan o'chadi)
      await db.del("user_" + kid.id);                          // profil butunlay o'chadi
      const ids = (oila?.azolarIds || oila?.azolar || []).filter(id => id !== kid.id);
      const o2 = { ...oila, azolarIds: ids };
      if (oila?.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: ids });
      setOila(o2); setAzolar(azolar.filter(a => a.id !== kid.id));
      ok$(lg === "uz" ? kid.ism + " akkaunti o'chirildi" : "Kid account deleted");
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.code || e.message), "err"); }
  };

  // ── MA'LUMOTLARNI TOZALASH: xarajat/daromad yozuvlari ──
  // fromS/toS: "YYYY-MM-DD" yoki "" (chegara yo'q). wholeFamily — faqat oila boshi.
  const purgeData = async (fromS, toS, wholeFamily) => {
    if (wholeFamily && user?.rol !== "bosh")
      return ok$(lg === "uz" ? "Butun oila ma'lumotini faqat oila boshi tozalay oladi" : "Only the family head can clear family data", "err");
    const inRange = sn => (!fromS || (sn || "") >= fromS) && (!toS || (sn || "") <= toS);
    const targets = wholeFamily ? azolar : azolar.filter(a => a.id === user.id);
    buzz(15);
    let removed = 0;
    try {
      for (const m of targets) {
        const kx = "x_" + user.oilaId + "_" + m.id, kd2 = "d_" + user.oilaId + "_" + m.id;
        const xa = (await db.g(kx)) || [], da = (await db.g(kd2)) || [];
        const xKeep = xa.filter(r => !inRange(r.sana)), dKeep = da.filter(r => !inRange(r.sana));
        removed += (xa.length - xKeep.length) + (da.length - dKeep.length);
        if (xKeep.length !== xa.length) await db.s(kx, xKeep);
        if (dKeep.length !== da.length) await db.s(kd2, dKeep);
      }
      const ids = new Set(targets.map(m => m.id));
      setXar(xar.filter(r => !(ids.has(r.uid) && inRange(r.sana))));
      setDar(dar.filter(r => !(ids.has(r.uid) && inRange(r.sana))));
      ok$(lg === "uz" ? removed + " ta yozuv o'chirildi" : removed + " records deleted");
      return true;
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.code || e.message), "err"); return false; }
  };

  // ── Vazifa ────────────────────────────────────────────────
  const addVazifa = async () => {
    // PERMISSION (Sprint 4): barcha KATTA a'zolar vazifa bera oladi, bola — yo'q.
    if (!canAssignTask(user)) return ok$(lg === "uz" ? "Vazifani faqat katta oila a'zolari bera oladi" : "Only adult family members can assign tasks", "err");
    if (!vTitle.trim() || !vReward || Number(vReward) <= 0 || !vAssignee) return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    buzz(12);
    const kd = azolar.find(a => a.id === vAssignee);
    const item = { id: Date.now(), title: vTitle.trim(), reward: Number(vReward), emoji: vEmoji, assignedTo: vAssignee, assignedName: kd?.ism || "", assignedLogin: kd?.login || "", createdBy: user.id, createdByName: user.ism || "", status: "pending", sana: td(), doneSana: "", paidSana: "", deadline: vDeadline || "" };
    const upd = [item, ...vazifalar];
    await db.s("vazifa_" + user.oilaId, upd); setVazifalar(upd);
    setShowAddVazifa(false); setVTitle(""); setVReward(""); setVAssignee(""); setVEmoji("📚"); setVDeadline("");
    ok$(lg === "uz" ? "Vazifa qo'shildi! 🎯" : "Task added!");
  };
  const delVazifa = async (id) => {
    // PERMISSION (Sprint 4): bosh — hammasini; katta a'zo — faqat o'zi berganini.
    const v = vazifalar.find(x => x.id === id);
    if (!canDeleteTask(user, v))
      return ok$(lg === "uz" ? "Faqat o'zingiz bergan vazifani o'chira olasiz" : "You can only delete tasks you created", "err");
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

  const exportPDF = (scopeArg) => {
    if (!isPremium) { setShowPremModal(true); return; }
    try {
      const month = tm();
      const sc = (scopeArg === "mine" || scopeArg === "family") ? scopeArg : (canSeeReport ? "family" : "mine");
      const pX = (sc === "family" && canSeeReport) ? bX : bX.filter(x => x.uid === user?.id || !x.uid);
      const pD = (sc === "family" && canSeeReport) ? bD : bD.filter(d => d.uid === user?.id || !d.uid);
      const pdfWho = sc === "family" ? (lg === "uz" ? "Oila hisoboti" : "Family report") : ((user?.ism || "") + (lg === "uz" ? " \u00b7 Shaxsiy hisobot" : " \u00b7 Personal report"));
      const jX2 = pX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const jD2 = pD.reduce((s, d) => s + Number(d.summa || 0), 0);

      // ── SVG donut yasovchi (chop etishda ham aniq ko'rinadi) ──
      const arcPath = (cx, cy, r, rIn, a0, a1) => {
        const lg2 = (a1 - a0) > Math.PI ? 1 : 0;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + rIn * Math.cos(a1), y2 = cy + rIn * Math.sin(a1);
        const x3 = cx + rIn * Math.cos(a0), y3 = cy + rIn * Math.sin(a0);
        return "M" + x0.toFixed(1) + " " + y0.toFixed(1) + " A" + r + " " + r + " 0 " + lg2 + " 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1) + " A" + rIn + " " + rIn + " 0 " + lg2 + " 0 " + x3.toFixed(1) + " " + y3.toFixed(1) + " Z";
      };
      const donutSVG = (data, centerLabel) => {
        const total = data.reduce((s, d) => s + d.sum, 0);
        if (total <= 0) return "<div style='height:130px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px'>Ma'lumot yo'q</div>";
        let a = -Math.PI / 2;
        const segs = data.slice(0, 6).map(d => {
          const ang = Math.min(d.sum / total * 2 * Math.PI, 2 * Math.PI - 0.002);
          const p = arcPath(65, 65, 58, 36, a + 0.015, a + ang - 0.015 > a + 0.015 ? a + ang - 0.015 : a + ang);
          a += ang;
          return "<path d='" + p + "' fill='" + d.color + "'/>";
        }).join("");
        const legend = data.slice(0, 6).map(d =>
          "<div style='display:flex;align-items:center;gap:5px;font-size:9px;color:#374151;margin-top:3px'><span style='width:8px;height:8px;border-radius:50%;background:" + d.color + ";display:inline-block;flex-shrink:0'></span><span style='flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>" + d.name + "</span><b>" + Math.round(d.sum / total * 100) + "%</b></div>").join("");
        return "<svg width='130' height='130' viewBox='0 0 130 130' style='display:block;margin:0 auto'>" + segs +
          "<text x='65' y='62' text-anchor='middle' font-size='9' fill='#6b7280'>" + centerLabel + "</text>" +
          "<text x='65' y='75' text-anchor='middle' font-size='10' font-weight='800' fill='#1f2937'>" + (total >= 1e6 ? (total / 1e6).toFixed(1) + " mln" : total.toLocaleString()) + "</text></svg>" +
          "<div style='margin-top:8px'>" + legend + "</div>";
      };
      // ── Kunlik ustunli grafik ──
      const barSVG = (() => {
        const [yy, mm] = month.split("-").map(Number);
        const dim = new Date(yy, mm, 0).getDate();
        const days = Array.from({ length: dim }, (_, i) => {
          const sana = month + "-" + String(i + 1).padStart(2, "0");
          return pX.filter(x => x.sana === sana).reduce((s, x) => s + Number(x.summa || 0), 0);
        });
        const mx = Math.max(...days, 1);
        const W = 190, H = 108, bw = W / dim;
        const bars = days.map((v, i) => {
          const h = Math.max(v > 0 ? 3 : 1, v / mx * (H - 24));
          return "<rect x='" + (i * bw + 0.5).toFixed(1) + "' y='" + (H - 14 - h).toFixed(1) + "' width='" + Math.max(bw - 1.2, 1.5).toFixed(1) + "' height='" + h.toFixed(1) + "' rx='1.2' fill='" + (v > 0 ? "#6366f1" : "#e5e7eb") + "'/>";
        }).join("");
        const labels = [1, Math.round(dim / 2), dim].map(d => "<text x='" + ((d - 0.5) * bw).toFixed(1) + "' y='" + (H - 3) + "' text-anchor='middle' font-size='8' fill='#9ca3af'>" + d + "</text>").join("");
        return "<svg width='100%' height='" + H + "' viewBox='0 0 " + W + " " + H + "' preserveAspectRatio='none' style='display:block'>" + bars + labels + "</svg>" +
          "<div style='font-size:9px;color:#6b7280;text-align:center;margin-top:4px'>" + (lg === "uz" ? "Kunlik xarajatlar \u00b7 maks: " : "Daily \u00b7 max: ") + mx.toLocaleString() + "</div>";
      })();

      // Diagramma ma'lumotlari
      const knownKat = new Set([...KATS.map(k => k.id), "qarz", "maqsad"]);
      const katData = KATS.map((k, i) => ({ name: KN[lg][i], color: k.c, sum: pX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) }))
        .concat([
          { name: lg === "uz" ? "Qarz berildi" : "Loan given", color: "#F97316", sum: pX.filter(x => x.kategoriya === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: lg === "uz" ? "Jamg'arma (maqsad)" : "Goal savings", color: "#EAB308", sum: pX.filter(x => x.kategoriya === "maqsad").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: lg === "uz" ? "Boshqa yozuvlar" : "Other records", color: "#94A3B8", sum: pX.filter(x => !knownKat.has(x.kategoriya)).reduce((s, x) => s + Number(x.summa || 0), 0) },
        ])
        .filter(d => d.sum > 0).sort((a, b) => b.sum - a.sum);
      const MEMC = ["#22C55E", "#3B82F6", "#A855F7", "#F97316", "#F5B731", "#EC4899", "#06B6D4"];
      const secondDonut = (sc === "family" && canSeeReport && azolar.length > 1)
        ? { title: lg === "uz" ? "Oila a'zolari ulushi" : "Members share", html: donutSVG(azolar.map((a, i) => ({ name: a.ism || "?", color: MEMC[i % MEMC.length], sum: pX.filter(x => x.uid === a.id || (!x.uid && a.id === user?.id)).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(d => d.sum > 0).sort((a, b) => b.sum - a.sum), lg === "uz" ? "Oila jami" : "Total") }
        : { title: lg === "uz" ? "Daromad turlari" : "Income types", html: donutSVG(DARS.map((d, i) => ({ name: DN[lg]?.[i] || d.id, color: d.c, sum: pD.filter(x => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).concat([{ name: lg === "uz" ? "Qarz olindi" : "Loan received", color: "#14B8A6", sum: pD.filter(x => x.tur === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) }, { name: lg === "uz" ? "Boshqa yozuvlar" : "Other records", color: "#94A3B8", sum: pD.filter(x => !["oylik","qoshimcha","biznes","sovga","boshqa","qarz"].includes(x.tur)).reduce((s, x) => s + Number(x.summa || 0), 0) }]).filter(d => d.sum > 0).sort((a, b) => b.sum - a.sum), lg === "uz" ? "Daromad" : "Income") };

      const katRows = KATS.map((k, i) => { const tot = pX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0); if (!tot) return ""; const pct2 = jX2 > 0 ? Math.round(tot / jX2 * 100) : 0; return "<tr><td>" + KN[lg][i] + "</td><td style='text-align:right'>" + tot.toLocaleString() + " so'm</td><td style='text-align:center'>" + pct2 + "%</td></tr>"; }).join("");
      const xRows = pX.slice(0, 40).map(x => "<tr><td>" + x.sana + "</td><td>" + KN[lg][KATS.findIndex(k => k.id === x.kategoriya)] + "</td><td>" + (x.izoh || "") + "</td><td style='text-align:right'>" + Number(x.summa).toLocaleString() + "</td><td>" + gN(x.uid) + "</td></tr>").join("");
      const qActive = qarzlar.filter(q => !q.paid && (sc === "family" && canSeeReport ? true : (q.uid === user?.id || !q.uid)));
      const qRows = qActive.slice(0, 15).map(q => "<tr><td>" + q.kim + "</td><td>" + (q.tur === "bergan" ? (lg === "uz" ? "Berilgan" : "Lent") : (lg === "uz" ? "Olingan" : "Borrowed")) + "</td><td style='text-align:right'>" + Number(q.summa).toLocaleString() + "</td><td>" + (q.qaytSana || "-") + "</td></tr>").join("");

      // QR — hisobotni yaratgan profil referali
      const refLink = window.location.origin + "/?ref=" + (user?.id || "");
      const refQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(refLink);

      const H = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Hisobot " + month + "</title><style>" +
        "*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}" +
        "h2{color:#374151;margin-top:26px;font-size:16px}" +
        "table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}" +
        ".sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}" +
        ".hdr{display:flex;align-items:center;gap:12px;margin-bottom:6px}.logo{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo span{color:#fff;font-size:24px}" +
        ".charts{display:flex;gap:10px;margin:18px 0}.chart{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 10px;min-width:0}.chart .ct{font-size:11px;font-weight:800;color:#6366f1;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px}" +
        ".qr{display:flex;align-items:center;gap:14px;justify-content:center;margin-top:22px;padding:14px;background:#f9fafb;border:1.5px solid #6366f133;border-radius:12px}.qr img{width:88px;height:88px;border-radius:8px}" +
        ".foot{margin-top:30px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}" +
        ".btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}" +
        "@media print{.btn{display:none}.charts{page-break-inside:avoid}}</style></head><body>" +
        "<div class='hdr'><div class='logo'><span>\ud83d\udcb0</span></div><div><div style='font-size:20px;font-weight:800;color:#6366f1'>Oila Hisobchi</div><div style='font-size:12px;color:#6b7280'>" + (oila && oila.nomi ? oila.nomi : "Oila") + " \u00b7 " + pdfWho + " \u00b7 " + month + "</div></div></div>" +
        "<div style='border-bottom:3px solid #6366f1;margin-bottom:14px'></div>" +
        "<p style='color:#6b7280;font-size:12px'>" + (lg === "uz" ? "Yaratildi" : "Generated") + ": " + new Date().toLocaleString("uz-UZ") + "</p>" +
        "<div class='sum'><div class='box'><div class='lbl'>" + (lg === "uz" ? "Daromad" : "Income") + "</div><div class='val g'>" + jD2.toLocaleString() + "</div></div><div class='box'><div class='lbl'>" + (lg === "uz" ? "Xarajat" : "Expense") + "</div><div class='val r'>" + jX2.toLocaleString() + "</div></div><div class='box'><div class='lbl'>" + (lg === "uz" ? "Balans" : "Balance") + "</div><div class='val " + (jD2 - jX2 >= 0 ? "g" : "r") + "'>" + (jD2 - jX2).toLocaleString() + "</div></div></div>" +
        "<div class='charts'>" +
        "<div class='chart'><div class='ct'>" + (lg === "uz" ? "Kategoriyalar" : "Categories") + "</div>" + donutSVG(katData, lg === "uz" ? "Xarajat" : "Expense") + "</div>" +
        "<div class='chart'><div class='ct'>" + secondDonut.title + "</div>" + secondDonut.html + "</div>" +
        "<div class='chart'><div class='ct'>" + (lg === "uz" ? "Oy dinamikasi" : "Monthly trend") + "</div>" + barSVG + "</div>" +
        "</div>" +
        "<h2>" + (lg === "uz" ? "Kategoriyalar" : "Categories") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Kategoriya" : "Category") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th style='text-align:center'>%</th></tr></thead><tbody>" + (katRows || "<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>") + "</tbody></table>" +
        "<h2>" + (lg === "uz" ? "Xarajatlar" : "Expenses") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Sana" : "Date") + "</th><th>" + (lg === "uz" ? "Kategoriya" : "Category") + "</th><th>" + (lg === "uz" ? "Izoh" : "Note") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th>" + (lg === "uz" ? "Kim" : "Who") + "</th></tr></thead><tbody>" + (xRows || "<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>") + "</tbody></table>" +
        (qRows ? "<h2>" + (lg === "uz" ? "Faol qarzlar" : "Active debts") + "</h2><table><thead><tr><th>" + (lg === "uz" ? "Kim" : "Person") + "</th><th>" + (lg === "uz" ? "Tur" : "Type") + "</th><th style='text-align:right'>" + (lg === "uz" ? "Summa" : "Amount") + "</th><th>" + (lg === "uz" ? "Qaytarish" : "Return") + "</th></tr></thead><tbody>" + qRows + "</tbody></table>" : "") +
        "<div class='qr'><img src='" + refQR + "' alt='QR'/><div style='text-align:left'><div style='font-size:13px;font-weight:700;color:#374151'>" + (lg === "uz" ? (user?.ism || "") + " sizni taklif qiladi" : (user?.ism || "") + " invites you") + "</div><div style='font-size:11px;color:#6b7280;margin-top:3px'>" + (lg === "uz" ? "QR kodni skanerlab Oila Hisobchi ilovasiga qo'shiling" : "Scan QR to join the app") + "</div><div style='font-size:9px;color:#9ca3af;margin-top:4px;word-break:break-all'>" + refLink + "</div></div></div>" +
        "<div class='foot'>" + (lg === "uz" ? "Bu hisobot Oila Hisobchi ilovasi tomonidan yaratilgan" : "Generated by Oila Hisobchi") + " \u00b7 " + month + "</div>" +
        "<button class='btn' onclick='window.print()'>" + (lg === "uz" ? "PDF saqlash / Chop etish" : "Save PDF / Print") + "</button></body></html>";

      const w = window.open("", "_blank");
      if (w && w.document) { w.document.write(H); w.document.close(); ok$(lg === "uz" ? "PDF tayyor!" : "PDF ready!"); }
      else { const okk = downloadFile(H, "OilaHisobot_" + month + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "HTML yuklandi!" : "HTML downloaded!") : (lg === "uz" ? "Xatolik" : "Error"), okk ? "ok" : "err"); }
    } catch (e) { ok$((lg === "uz" ? "Xatolik: " : "Error: ") + e.message, "err"); }
  };

  // ── AI maslahat ───────────────────────────────────────────
  // Lokal tahlil dvigateli — internetga bog'liq emas, HAR DOIM natija beradi.
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
    tips.push("🌟 " + MOTIV[new Date().getDate() % MOTIV.length]);
    // Shaxsiy motivatsion salomlashuv
    const salom = totX === 0 && totD === 0 ? ""
      : bal2 >= 0
        ? L("🏆 Barakalla, " + (user?.ism || "do'stim") + "! Siz moliyangizni nazoratda tutyapsiz — bu ko'pchilikning qo'lidan kelmaydi. Keling, tahlilni ko'ramiz:", "🏆 Great job, " + (user?.ism || "") + "!")
        : L("💪 " + (user?.ism || "Do'stim") + ", tashvishlanmang — har bir katta yutuq kichik qadamdan boshlanadi. Bu oy tahlili sizga yo'l ko'rsatadi:", "💪 Don't worry, every big win starts small.");
    if (totX === 0 && totD === 0) return L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting!", "No data yet. Add expenses and income.");
    return salom + "\n\n" + L("📈 " + tm() + " tahlili\n\n", "Analysis " + tm() + "\n\n") + tips.join("\n\n");
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
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Emoji":"Emoji"}</label>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              {["📚","🧹","🍽️","🛒","🌱","🐕","🚴","🎨","🏃","⚽","🎹","🧺"].map(e => (
                <button key={e} onClick={() => setVEmoji(e)} style={{ width:42, height:42, borderRadius:11, border:"2px solid "+(vEmoji===e?th.ac:th.bor), background:vEmoji===e?th.ac+"18":"transparent", fontSize:22, cursor:"pointer" }}>{e}</button>
              ))}
            </div>
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa nomi":"Task title"}</label>
            <input style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} value={vTitle} onChange={e => setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Xonani yig'ishtirish":"e.g. Clean the room"} />
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Mukofot (so'm)":"Reward (UZS)"}</label>
            <input type="number" style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:18, fontWeight:800, textAlign:"center", outline:"none", boxSizing:"border-box", marginBottom:20 }} value={vReward} onChange={e => setVReward(e.target.value)} placeholder="0" />
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
      <BottomNav navItems={navItems} scr={scr} setScr={setScr} th={th} isKid={isKid} buzz={buzz} setShowAddModal={setShowAddModal} setAddModalTab={setAddModalTab} setAddStep={setAddStep} setAddKat={setAddKat} />
    </div>
  );
}
