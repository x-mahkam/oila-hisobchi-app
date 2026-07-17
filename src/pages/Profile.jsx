// ═══════════════════════════════════════════════════════════
//  PROFILE — Flagship redesign (Design System v1.0)
//  Struktura: Hero → Quick Stats → Achievements → Premium →
//             Family → Referral → Settings → Danger Zone.
//  Qoidalar: faqat Component Kit + tokenlar; hardcoded hex/radius/
//  shadow YO'Q (istisno — kit precedenti: oq matn gradient ustida);
//  emoji YO'Q; gradient faqat Hero'da; Firebase/hooks/props/state
//  nomlari 100% o'zgarishsiz.
// ═══════════════════════════════════════════════════════════
import { useMemo, useState, useEffect, useRef, useCallback, memo } from "react";
import { KatIco } from "../components/common/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useFamily } from "../hooks/useFamily.js";
import { useDailyReminder } from "../hooks/useDailyReminder.js";
import { db, fbAuth } from "../firebase.js";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { normTel, td, hp } from "../utils/formatters.js";
import { fetchLanguageList } from "../i18n/translationService.js";
import { NativeBiometric } from "capacitor-native-biometric";
import KidCreatedModal from "../components/modals/KidCreatedModal.jsx";
import {
  PageHeader, SectionHeader, SubHeader,
  AppCard, StatCard, WarningCard, PremiumCard,
  ListItem, SettingRow, MemberRow,
  Badge, UIAvatar,
  PrimaryButton, SecondaryButton, GhostButton, DangerButton, LoadingButton,
  TextInput, AmountInput, TextArea, Switch,
  BottomSheet, ConfirmDialog, IconButton, LinearProgress,
} from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, MOTION, OPACITY, COMP, PREMIUM } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, VALS, RELATIONS, FAQS } from "../utils/constants.js";
import Garden from "../Garden.jsx";

// ═══ Profile-lokal outline SVG ikonkalar (emoji o'rniga, DS 6) ═══
const PIco = {
  leaf: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M15 3C8 3 3.5 6.5 3.5 12c0 1 .2 2 .5 3 5.5 0 11-3 11-12z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M4 15C6.5 11 9.5 8.5 13 6.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  book: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M9 4.5C7.5 3 5.5 2.5 2.5 2.5v11c3 0 5 .5 6.5 2 1.5-1.5 3.5-2 6.5-2v-11c-3 0-5 .5-6.5 2z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 4.5v11" stroke={c} strokeWidth="1.2"/></svg>,
  baby: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.3" fill={c} opacity=".08"/><circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.3" fill="none"/><circle cx="6.8" cy="8" r=".9" fill={c}/><circle cx="11.2" cy="8" r=".9" fill={c}/><path d="M6.5 11.2c.7.8 1.5 1.2 2.5 1.2s1.8-.4 2.5-1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M9 2.5c.8-.8 2-.8 2 .3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  gift: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><rect x="2.5" y="7" width="13" height="8.5" rx="1.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><path d="M2 5h14v2.5H2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 5v10.5M9 5C9 3 7.5 2 6.5 2.5 5.5 3 6 5 9 5zm0 0c0-2 1.5-3 2.5-2.5 1 .5.5 2.5-2.5 2.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  star: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.9 4.1 4.5.5-3.3 3.1.9 4.4L8 11.4l-4 2.2.9-4.4L1.6 6.1l4.5-.5L8 1.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  starFill: (c, s = 34, on) => <svg width={s} height={s} viewBox="0 0 24 24" fill={on ? c : "none"} stroke={c} strokeWidth="1.5"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.6 5.7 20.7 7 13.8 2 9.1l6.8-.8L12 2z" strokeLinejoin="round"/></svg>,
  gem: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7M5 2.5L6.5 7 9 2.5l2.5 4.5 1.5-4.5" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  cal: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  list: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2" width="11" height="12" rx="2" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  target: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  trophy: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 2h6v4a3 3 0 01-6 0V2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 3H2.5c0 2 1 3.5 2.5 3.5M11 3h2.5c0 2-1 3.5-2.5 3.5M8 9v2.5M5.5 13.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  lock: (c, s = 12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7.5" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  bell: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3"/><path d="M8.5 16.5a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  copy: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="2" stroke={c} strokeWidth="1.3" fill={c} opacity=".12"/><rect x="5" y="5" width="9" height="9" rx="2" stroke={c} strokeWidth="1.3" fill="none"/><path d="M11 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h1" stroke={c} strokeWidth="1.3"/></svg>,
  share: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="12" cy="3.5" r="2" stroke={c} strokeWidth="1.3"/><circle cx="4" cy="8" r="2" stroke={c} strokeWidth="1.3"/><circle cx="12" cy="12.5" r="2" stroke={c} strokeWidth="1.3"/><path d="M5.8 7L10.2 4.5M5.8 9l4.4 2.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  send: (c, s = 17) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bulb: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5a4.5 4.5 0 00-2.5 8.2c.6.5 1 1 1 1.8h3c0-.8.4-1.3 1-1.8A4.5 4.5 0 008 1.5z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M6.5 13.5h3M7 15h2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  warn: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2L14.5 13.5h-13L8 2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 6.5v3.2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.7" r=".8" fill={c}/></svg>,
  family: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  coin: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M8 4.5v7M9.5 6H7a1.5 1.5 0 000 3h2a1.5 1.5 0 010 3H5.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  checkCircle: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M5.5 8l1.7 1.7 3.3-3.4" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ═══ Count-up animatsiya (Dashboard bilan bir xil naqsh; reduced-motion hurmati) ═══
function useCountUp(value, dur = 450) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const t0 = performance.now();
    let raf;
    const step = now => {
      const pgs = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - pgs, 3);
      setV(Math.round(from + (to - from) * e));
      if (pgs < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);
  return v;
}

// ═══ Yutuq kartasi — collectible (Garden AchievementCard uslubida) ═══
const AchCard = memo(function AchCard({ th, icon, title, desc, cur, goal, unlocked, doneLabel, onClick }) {
  const pct = Math.min(100, Math.round(cur / goal * 100));
  const body = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: COMP.touchMin - SPACE.s1, height: COMP.touchMin - SPACE.s1, borderRadius: RADIUS.full, background: unlocked ? PREMIUM.grad : th.surH, display: "flex", alignItems: "center", justifyContent: "center", filter: unlocked ? "none" : "grayscale(1)", opacity: unlocked ? 1 : OPACITY.hint, boxShadow: unlocked ? SHADOW.e1(PREMIUM.deep) : SHADOW.e0, flexShrink: 0 }}>
          {icon}
        </div>
        {unlocked
          ? <Badge th={th} type="premium" icon={null}>{doneLabel}</Badge>
          : <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{PIco.lock(th.t3)}</span>}
      </div>
      <div style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: unlocked ? th.t1 : th.t2, marginTop: SPACE.s2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s2 }}>
        <LinearProgress th={th} value={pct} tone={unlocked ? PREMIUM.gold : th.ac} style={{ flex: 1 }} />
        <span style={{ ...TYPE.tiny, letterSpacing: 0, color: unlocked ? PREMIUM.gold : th.t2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{Math.min(cur, goal)}/{goal}</span>
      </div>
    </>
  );
  const s = { width: COMP.pageMax * 0.4, flexShrink: 0, background: unlocked ? PREMIUM.gold + ALPHA.faint : th.sur, border: unlocked ? "1.5px solid " + PREMIUM.gold + ALPHA.strong : "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, boxSizing: "border-box", scrollSnapAlign: "start" };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...s, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{body}</button>;
  return <div style={s}>{body}</div>;
});

// ═══ Quick Stat — StatCard + count-up ═══
const AnimatedStat = memo(function AnimatedStat({ th, icon, value, label, tone, onClick }) {
  const shown = useCountUp(Number(value) || 0);
  return <StatCard th={th} icon={icon} value={shown} label={label} tone={tone} onClick={onClick} />;
});

// ═══ Tanlov chip (til/mavzu/vaqt) — token-driven segment ═══
const ChoiceChip = memo(function ChoiceChip({ th, on, onClick, children, style }) {
  return (
    <button className="ui-press" onClick={onClick}
      style={{ background: on ? th.ac + ALPHA.tint : th.bg, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: (SPACE.s2 + 2) + "px " + SPACE.s2 + "px", color: on ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize + 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, minHeight: COMP.touchMin - SPACE.s1, boxSizing: "border-box", ...style }}>
      {children}
    </button>
  );
});

export default function ProfilePage({
  pTab, setPTab,
  waterGarden,
  activatePremium, setShowPremModal,
  notifEnabled, toggleNotif, notifTime, saveNotifTime,
  APP_VER,
  showBilim, setShowBilim,
  f,
  setBilimInitialView,
  vazifalar, kidBalances,
  setVazifalar, setKidBalances, setXar,
  vazifaApprove,
}) {
  const {
    user, setUser, oila, setOila, azolar, setAzolar,
    isPremium, xar, dar, maq, qarzlar, stars, gardenData,
    dark, setDark, lg, setLg, val, setVal,
    scr, setScr,
    th, t, ok$, buzz, addStar, logout,
  } = useApp();

  const dailyReminder = useDailyReminder();

  const [showValDD, setShowValDD] = useState(false);
  const [showLgDD, setShowLgDD] = useState(false);
  const STY = useMemo(() => makeS(th), [th]);

  // Til ro'yxati Firestore'dagi "languages" kolleksiyasidan (enabled: true).
  // Yangi til qo'shilganda bu ro'yxat kod o'zgarishisiz avtomatik yangilanadi.
  // Hali yuklanmagan/oflayn bo'lsa — build ichidagi zaxira (uz/en/ru) ko'rsatiladi.
  const FALLBACK_LANGS = useMemo(() => ([
    { code: "uz", nativeName: "O'zbek", flag: "🇺🇿" },
    { code: "en", nativeName: "English", flag: "🇬🇧" },
    { code: "ru", nativeName: "Русский", flag: "🇷🇺" },
  ]), []);
  const [langList, setLangList] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchLanguageList().then((list) => { if (alive && list.length) setLangList(list); });
    return () => { alive = false; };
  }, []);
  const langs = langList || FALLBACK_LANGS;
  const currentLangLabel = (langs.find((l) => l.code === lg) || {}).nativeName || lg.toUpperCase();

  // Local Settings/Profile State
  const [edN, setEdN] = useState(false);
  const [newN, setNewN] = useState("");
  const [newF, setNewF] = useState("");
  const [edT, setEdT] = useState(false);
  const [newT, setNewT] = useState("");
  const [fBj, setFBj] = useState("2000000");
  const [fKL, setFKL] = useState({});
  const [faqO, setFaqO] = useState(null);
  const [pinStep, setPinStep] = useState("idle");
  const [pinVal, setPinVal] = useState("");
  const [pinCfm, setPinCfm] = useState("");
  const [finger, setFinger] = useState(false);
  const [pinHash, setPinHash] = useState(null);
  const [showPwEdit, setShowPwEdit] = useState(false);
  const [pwCur, setPwCur] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwNewCfm, setPwNewCfm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      db.g("security_" + user.id).then(sec => {
        if (sec && typeof sec === "object") {
          setPinHash(sec.pinHash || null);
          setFinger(!!sec.biometricEnabled);
        } else {
          setPinHash(null);
          setFinger(false);
        }
      }).catch(e => console.error(e));
    }
  }, [user?.id, pTab]);
  const [showReferral, setShowReferral] = useState(false);
  const [fbRating, setFbRating] = useState(0);
  const [fbText, setFbText] = useState("");
  const [fbType, setFbType] = useState("taklif");
  const [fbSending, setFbSending] = useState(false);
  const [askTel, setAskTel] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [parentalConsentErr, setParentalConsentErr] = useState("");

  // Hisobni o'chirish oqimi uchun statelar
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState("info"); // "info" | "password" | "loading"
  const [deleteConfirmPw, setDeleteConfirmPw] = useState("");
  const [deletePwErr, setDeletePwErr] = useState("");

  // Farzand batafsil ko'rinishi va formalar uchun statelar
  const [selectedKid, setSelectedKid] = useState(null);
  const [kidTab, setKidTab] = useState("vazifalar"); // "vazifalar" | "bilim" | "vaqt"
  const [kidCoins, setKidCoins] = useState(0);
  const [kidStreak, setKidStreak] = useState(0);
  const [kidLearnStats, setKidLearnStats] = useState({ games: 0, xp: 0 });
  const [kidBilimOffers, setKidBilimOffers] = useState([]);
  const [kidVaqtStats, setKidVaqtStats] = useState({});
  const [kidLimit, setKidLimit] = useState(0);
  const [kidExtra, setKidExtra] = useState(0);
  const [inputLimit, setInputLimit] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  // Farzand tafsiloti o'zgarganda bilim va ekran vaqti ma'lumotlarini yuklash
  useEffect(() => {
    if (selectedKid) {
      db.g("bilim_coins_" + selectedKid.id).then(c => setKidCoins(Number(c) || 0)).catch(() => {});
      db.g("bilim_streak_" + selectedKid.id).then(s => setKidStreak(Number(s) || 0)).catch(() => {});
      db.g("bilim_stats_" + selectedKid.id).then(st => {
        if (st && typeof st === "object") {
          setKidLearnStats({ games: Number(st.games) || 0, xp: Number(st.xp) || 0 });
        }
      }).catch(() => {});
      db.g("bilim_offer_" + (user?.oilaId || oila?.id)).then(v => {
        if (Array.isArray(v)) {
          setKidBilimOffers(v.filter(x => x.kidId === selectedKid.id));
        }
      }).catch(() => {});

      // Screen time data loading
      db.g("screentime_" + (user?.oilaId || oila?.id)).then(st => {
        if (st && st[selectedKid.id]) {
          setKidVaqtStats(st[selectedKid.id]);
        } else {
          setKidVaqtStats({});
        }
      }).catch(() => {});
      db.g("screentime_limits_" + (user?.oilaId || oila?.id)).then(lim => {
        const currentLimit = lim && lim[selectedKid.id] ? Number(lim[selectedKid.id]) : 0;
        setKidLimit(currentLimit);
        setInputLimit(currentLimit > 0 ? String(currentLimit) : "");
      }).catch(() => {});
      db.g("screentime_extra_" + (user?.oilaId || oila?.id)).then(ext => {
        const todayStr = td();
        const currentExtra = ext && ext[selectedKid.id] && ext[selectedKid.id][todayStr] ? Number(ext[selectedKid.id][todayStr]) : 0;
        setKidExtra(currentExtra);
      }).catch(() => {});
    }
  }, [selectedKid, user?.oilaId, oila?.id]);

  const saveKidLimit = async () => {
    if (!selectedKid || !user?.oilaId) return;
    setSavingLimit(true);
    try {
      const valNum = Number(inputLimit) || 0;
      const limitsKey = "screentime_limits_" + user.oilaId;
      const limitsData = (await db.g(limitsKey)) || {};
      limitsData[selectedKid.id] = valNum;
      await db.s(limitsKey, limitsData);
      setKidLimit(valNum);
      ok$(t("p001"));
    } catch (e) {
      console.error(e);
      ok$(t("p002"), "err");
    } finally {
      setSavingLimit(false);
    }
  };

  // Vazifa qo'shish formasi uchun local statelar
  const [newVTitle, setNewVTitle] = useState("");
  const [newVReward, setNewVReward] = useState("");
  const [newVDeadline, setNewVDeadline] = useState("");

  // useFamily Hook instantiation for kid accounts
  const {
    showAddKid, setShowAddKid, kidName, setKidName, kidSurname, setKidSurname,
    kidBirthYear, setKidBirthYear, kidGender, setKidGender, kidGrade, setKidGrade,
    kidLogin, setKidLogin, kidPw, setKidPw, addKidAccount, delKidAccount,
    kidCreated, setKidCreated, purgeData
  } = useFamily();

  // local file ref for photo upload
  const fRef = useRef(null);

  // Profile update and photo handlers
  const doPhoto = useCallback((e) => {
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
  }, [user, setUser, azolar, setAzolar, ok$, t.ua]);

  const rmPhoto = useCallback(async () => {
    const u2 = { ...user, photo: null };
    await db.s("user_" + user.id, u2); setUser(u2);
    setAzolar(azolar.map(a => a.id === user.id ? { ...a, photo: null } : a));
    ok$(t.ua);
  }, [user, setUser, azolar, setAzolar, ok$, t.ua]);

  const saveTel = useCallback(async (rawTel) => {
    const raw = (rawTel || "").trim();
    if (!raw) return ok$(t("p245"), "err");
    const tel = raw.replace(/[^0-9+]/g, "");
    const n9 = normTel(raw);
    if (!n9 || n9.length < 7) return ok$(t("p246"), "err");
    try {
      const owner = await db.gFresh("tel9_" + n9);
      if (owner && owner !== user.id) return ok$(t("p247"), "err");
    } catch (e) {}
    const u2 = { ...user, tel };
    await db.s("user_" + user.id, u2);
    await db.s("tel9_" + n9, user.id); await db.s("tel_" + tel, user.id);
    if (user.email) await db.s("tphone_" + n9, user.email);
    setUser(u2); setAzolar(azolar.map(a => a.id === user.id ? { ...a, tel } : a));
    setAskTel(false); setEdT(false); setNewT("");
    ok$(t("p248"));
  }, [user, setUser, azolar, setAzolar, ok$, t]);

  const updName = useCallback(async () => {
    if (!newN.trim()) return;
    const fam = (newF || "").trim();
    const u2 = { ...user, ism: newN.trim(), familya: fam };
    await db.s("user_" + user.id, u2); setUser(u2);
    setAzolar(azolar.map(a => a.id === user.id ? { ...a, ism: newN.trim(), familya: fam } : a));
    setEdN(false); ok$(t.ua);
  }, [newN, newF, user, setUser, azolar, setAzolar, ok$, t.ua]);

  const saveBj = useCallback(async () => {
    const v = Number(fBj); if (!v || v <= 0) return ok$(t.ec, "err");
    const u = { ...oila, budjet: v, katLimits: fKL };
    await db.s("oila_" + oila.id, u); await db.s("fam_" + oila.id, u); setOila(u); ok$(t.sa);
  }, [fBj, fKL, oila, setOila, ok$, t.sa, t.ec]);

  const toggleReportAccess = useCallback(async (memberId) => {
    if (user?.rol !== "bosh" || !oila) return;
    const cur = oila.reportAccess || [];
    const upd = cur.includes(memberId) ? cur.filter(x => x !== memberId) : [...cur, memberId];
    const o2 = { ...oila, reportAccess: upd };
    await db.s("oila_" + oila.id, o2); await db.s("fam_" + oila.id, o2); setOila(o2);
    ok$(t("p249"));
  }, [user, oila, setOila, ok$, t]);

  const sendFeedback = useCallback(async () => {
    if (!fbText.trim() && fbRating === 0) return ok$(t("p250"), "err");
    setFbSending(true);
    try {
      const fb = { id: Date.now(), uid: user?.id || "anon", ism: user?.ism || "", type: fbType, rating: fbRating, text: fbText.trim(), sana: new Date().toISOString() };
      await db.s("fb_" + fb.id + "_" + (user?.id || "anon"), fb, { c: "fb" });
      setFbRating(0); setFbText(""); setFbType("taklif");
      ok$(t("p251"));
    } catch { ok$(t("p252"), "err"); }
    setFbSending(false);
  }, [fbText, fbRating, fbType, user, ok$, t]);

  const tm = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  };
  const bX = useMemo(() => (xar || []).filter(x => x.sana?.startsWith(tm())), [xar]);
  const bD = useMemo(() => (dar || []).filter(d => d.sana?.startsWith(tm())), [dar]);

  const isKid = user?.rol === "kid";
  const isAdmin = false;
  const refCount = 0;
  const adminStats = null;
  const adminLoad = false;
  const loadAdminStats = () => {};

  // To'liq ism: ism + familya (familya bo'lsa). Barcha ko'rsatishlar shu orqali.
  const fullName = (p) => p ? (p.familya ? (p.familya + " " + (p.ism || "")) : (p.ism || "")).trim() : "";

  const adults = useMemo(() => (azolar || []).filter(a => a.rol !== "kid"), [azolar]);
  const kids = useMemo(() => (azolar || []).filter(a => a.rol === "kid"), [azolar]);

  const kidsData = useMemo(() => {
    return kids.map(kid => {
      const kidTasks = (vazifalar || []).filter(v => 
        v.assignedTo === kid.id || 
        (v.assignedLogin && v.assignedLogin === kid.login) ||
        (v.assignedName && v.assignedName.toLowerCase() === kid.ism.toLowerCase())
      );
      const doneThisWeek = kidTasks.filter(v => v.status === "approved" || v.status === "done").length;
      const earnedAmount = kidBalances?.[kid.id] || 0;
      const kidGoals = (maq || []).filter(m => m.uid === kid.id && m.status !== "completed");
      const activeGoal = kidGoals[0];
      const goalPct = activeGoal ? Math.round((activeGoal.jamg / activeGoal.maqsad) * 100) : 0;
      return {
        ...kid,
        doneThisWeek,
        earnedAmount,
        activeGoal,
        goalPct,
        kidTasks
      };
    });
  }, [kids, vazifalar, kidBalances, maq]);

  // ═══ Statistika — faqat mavjud ma'lumotlardan, og'ir hisob memoizatsiya qilingan ═══
  const pStats = useMemo(() => {
    const myXar = (xar || []).filter(x => x.uid === user?.id);
    const myXarSum = myXar.reduce((s, x) => s + Number(x.summa || 0), 0);
    const myDarSum = (dar || []).filter(d => d.uid === user?.id).reduce((s, d) => s + Number(d.summa || 0), 0);
    const savingsRate = myDarSum > 0 ? Math.round(((myDarSum - myXarSum) / myDarSum) * 100) : 0;

    const childGoalsCompleted = (maq || []).filter(m => m.uid !== user?.id && m.status === "completed").length;

    // Foydalanish kunlari: registeredAt (Google) yoki eng birinchi o'z yozuvi sanasi
    let firstTs = user?.registeredAt ? Date.parse(user.registeredAt) : NaN;
    for (const x of myXar) {
      const ts = Date.parse(x.sana);
      if (!isNaN(ts) && (isNaN(firstTs) || ts < firstTs)) firstTs = ts;
    }
    const days = isNaN(firstTs) ? 1 : Math.max(1, Math.floor((Date.now() - firstTs) / 86400000) + 1);
    return {
      days,
      txCount: myXar.length,
      goalCount: (maq || []).filter(m => m.uid === user?.id || m.shared).length,
      debtCount: (qarzlar || []).filter(q => !q.done).length,
      gardenLevel: gardenData?.level || 0,
      savingsRate,
      childGoalsCompleted,
    };
  }, [xar, dar, maq, qarzlar, gardenData, user?.id, user?.registeredAt]);

  // ═══ Yutuqlar — mavjud real ko'rsatkichlardan hosilaviy (persist YO'Q) ═══
  const achievements = useMemo(() => {
    const list = [
      { id: "first",  icon: PIco.list,   title: t("p003"),       desc: t("p004"),       cur: pStats.txCount,     goal: 1,  onTap: null },
      { id: "loyal",  icon: PIco.cal,    title: t("p005"),  desc: t("p006"),     cur: pStats.days,        goal: 30, onTap: null },
      { id: "writer", icon: PIco.trophy, title: t("p007"),       desc: t("p008"),            cur: pStats.txCount,     goal: 50, onTap: null },
    ];

    if (!isKid) {
      // Ota-ona uchun maxsus yutuqlar
      list.push({
        id: "supportive",
        icon: PIco.baby,
        title: t("p009"),
        desc: t("p010"),
        cur: pStats.childGoalsCompleted,
        goal: 1,
        onTap: null
      });

      list.push({
        id: "saver",
        icon: PIco.gem,
        title: t("p011"),
        desc: t("p012"),
        cur: pStats.savingsRate,
        goal: 30,
        onTap: null
      });

      list.push({
        id: "planner",
        icon: PIco.target,
        title: t("p013"),
        desc: t("p014"),
        cur: pStats.goalCount,
        goal: 3,
        onTap: null
      });
    } else {
      // Yoshlar uchun
      list.push({ id: "stars",  icon: PIco.star,   title: t("p015"), desc: t("p016"),             cur: stars || 0,         goal: 25, onTap: null });
    }

    list.push(
      { id: "garden", icon: PIco.leaf,   title: t("p017"),           desc: t("p018"),      cur: pStats.gardenLevel, goal: 3,  onTap: "garden" },
      { id: "invite", icon: PIco.gift,   title: t("p019"),          desc: t("p020"),              cur: refCount || 0,      goal: 3,  onTap: isKid ? null : "referral" }
    );

    return list;
  }, [pStats, stars, refCount, isKid, t]);

  // ═══ Barqaror callbacklar (keraksiz render oldini olish) ═══
  const openEdit     = useCallback(() => setPTab("shaxsiy"), [setPTab]);
  const openPremium  = useCallback(() => { buzz(10); setShowPremModal(true); }, [buzz, setShowPremModal]);
  const openReferral = useCallback(() => setShowReferral(true), [setShowReferral]);
  const openAddKid   = useCallback(() => { buzz(10); setShowAddKid(true); }, [buzz, setShowAddKid]);

  // ── Bola akkaunti: maydon darajasidagi validatsiya (UI-lokal) ──
  const [kidErr, setKidErr] = useState({});
  // ── Bola akkauntini o'chirish tasdig'i ──
  const [kidDel, setKidDel] = useState(null); // o'chiriladigan a'zo obyekti
  // ── Ma'lumotlarni tozalash sheet holati ──
  const [showClean, setShowClean] = useState(false);
  const [clnFam,  setClnFam]  = useState(false);  // false = faqat men, true = butun oila
  const [clnAll,  setClnAll]  = useState(true);   // true = hammasi, false = sana oralig'i
  const [clnFrom, setClnFrom] = useState("");
  const [clnTo,   setClnTo]   = useState("");
  const [clnAsk,  setClnAsk]  = useState(false);  // yakuniy tasdiq dialogi
  const openClean  = useCallback(() => { buzz(10); setShowClean(true); }, [buzz]);
  const closeClean = useCallback(() => { setShowClean(false); setClnAsk(false); }, []);
  const doPurge = useCallback(async () => {
    setClnAsk(false);
    const okDone = await purgeData(clnAll ? "" : clnFrom, clnAll ? "" : clnTo, clnFam);
    if (okDone) { setShowClean(false); setClnFrom(""); setClnTo(""); setClnAll(true); setClnFam(false); }
  }, [purgeData, clnAll, clnFrom, clnTo, clnFam]);

  const openPwEdit = useCallback(() => {
    buzz(10);
    setPwCur(""); setPwNew(""); setPwNewCfm("");
    setShowPwEdit(true);
  }, [buzz]);

  const submitPwChange = useCallback(async () => {
    if (pwNew.length < 6) { ok$(t("prof_pwTooShort"), "err"); return; }
    if (pwNew !== pwNewCfm) { ok$(t("prof_pwMismatch"), "err"); return; }
    setPwLoading(true);
    try {
      const curU = fbAuth.currentUser;
      if (!curU || !curU.email) throw new Error(t("p021"));
      const credential = EmailAuthProvider.credential(curU.email, pwCur);
      await reauthenticateWithCredential(curU, credential);
      await updatePassword(curU, pwNew);
      setShowPwEdit(false);
      setPwCur(""); setPwNew(""); setPwNewCfm("");
      ok$(t("prof_pwChanged"));
    } catch (e) {
      const msg = e.code === "auth/wrong-password" || e.code === "auth/invalid-credential"
        ? t("prof_pwWrongCurrent")
        : e.code === "auth/weak-password" ? t("log015") : t("prof_pwChangeErr");
      ok$(msg, "err");
    } finally {
      setPwLoading(false);
    }
  }, [pwCur, pwNew, pwNewCfm, ok$, t]);

  const openDeleteAccount = useCallback(() => {
    buzz(10);
    setShowDeleteAccount(true);
    setDeleteAccountStep("info");
    setDeleteConfirmPw("");
    setDeletePwErr("");
  }, [buzz]);

  const doDeleteAccount = useCallback(async (pwVal = deleteConfirmPw) => {
    setDeletePwErr("");
    setDeleteAccountStep("loading");
    try {
      const curU = fbAuth.currentUser;
      if (!curU) {
        throw new Error(t("p021"));
      }

      // 1. Re-authenticate if user has a password provider
      const hasPassword = curU.providerData && curU.providerData.some(p => p.providerId === "password");
      if (hasPassword && curU.email) {
        const credential = EmailAuthProvider.credential(curU.email, pwVal);
        await reauthenticateWithCredential(curU, credential);
      }

      // Re-auth is successful! Proceed to delete all Firestore documents & auth user.
      const uid = user.id;
      const oilaId = user.oilaId;
      const isHead = user.rol === "bosh";

      // Prepare a list of doc deletes
      const deletes = [];

      if (isHead) {
        // 2. Fetch all kids or adult family members to delete their personal records
        const familyMembers = azolar || [];
        for (const member of familyMembers) {
          if (member.id !== uid) {
            // Delete other members' user/notif documents
            deletes.push(db.del("user_" + member.id));
            deletes.push(db.del("notif_" + member.id));
            deletes.push(db.del("x_" + oilaId + "_" + member.id));
            deletes.push(db.del("d_" + oilaId + "_" + member.id));
            deletes.push(db.del("kidgame_" + member.id));
            deletes.push(db.del("kb_" + member.id));
          }
        }

        // Delete family wide docs
        deletes.push(db.del("oila_" + oilaId));
        deletes.push(db.del("fam_" + oilaId));
        deletes.push(db.del("maq_" + oilaId));
        deletes.push(db.del("qarz_" + oilaId));
        deletes.push(db.del("vazifa_" + oilaId));
        deletes.push(db.del("kidbal_" + oilaId));
        deletes.push(db.del("stars_" + oilaId));
        deletes.push(db.del("starlog_" + oilaId));
        deletes.push(db.del("toy_" + oilaId));
        deletes.push(db.del("bilim_vazifa_" + oilaId));
        deletes.push(db.del("bilim_offer_" + oilaId));
        deletes.push(db.del("act_" + oilaId));
        
        // Garden docs
        deletes.push(db.del("baraka_garden_" + oilaId));
        deletes.push(db.del("baraka_coins_" + oilaId));
        deletes.push(db.del("baraka_energy_" + oilaId));
        deletes.push(db.del("baraka_crystals_" + oilaId));
        deletes.push(db.del("baraka_daily_" + oilaId));
      } else {
        // Not family head. Let's remove this user from the family list.
        const ms = await db.g("fam_" + oilaId) || await db.g("oila_" + oilaId);
        if (ms) {
          const memberIds = (ms.azolarIds || ms.azolar || []).filter(id => id !== uid);
          const o2 = { ...ms, azolarIds: memberIds, azolar: memberIds };
          await db.s("oila_" + oilaId, o2);
          await db.s("fam_" + oilaId, o2);
        }
      }

      // 3. Delete personal documents
      deletes.push(db.del("user_" + uid));
      deletes.push(db.del("notif_" + uid));
      deletes.push(db.del("x_" + oilaId + "_" + uid));
      deletes.push(db.del("d_" + oilaId + "_" + uid));

      if (user.email) {
        deletes.push(db.del("em_" + user.email.toLowerCase()));
      }
      if (user.tel) {
        const tel = user.tel.replace(/\D/g, "");
        const n9 = tel.slice(-9);
        deletes.push(db.del("tel_" + tel));
        deletes.push(db.del("tel9_" + n9));
        deletes.push(db.del("tphone_" + n9));
      }

      // Run all Firestore deletes
      await Promise.all(deletes);

      // 4. Delete user from Firebase Auth
      await curU.delete();

      // 5. Clean local cache
      localStorage.clear();

      // 6. Logout and return to boot/login
      ok$(t("p022"));
      logout();
    } catch (err) {
      console.error("Account deletion error:", err);
      setDeleteAccountStep("password");
      setDeletePwErr(
        err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? (t("p023"))
          : (t("p253")) + (err.message || err.code)
      );
    }
  }, [user, azolar, logout, ok$, deleteConfirmPw, t]);

  const handleDeleteAccountContinue = useCallback(() => {
    buzz(10);
    const curU = fbAuth.currentUser;
    const hasPassword = curU && curU.providerData && curU.providerData.some(p => p.providerId === "password");
    if (hasPassword) {
      setDeleteAccountStep("password");
    } else {
      doDeleteAccount("");
    }
  }, [buzz, doDeleteAccount]);

  const handleDeleteAccountFinal = useCallback(() => {
    buzz(10);
    if (!deleteConfirmPw.trim()) {
      setDeletePwErr(t("p024"));
      return;
    }
    doDeleteAccount(deleteConfirmPw);
  }, [buzz, deleteConfirmPw, doDeleteAccount, t]);
  const submitKid = useCallback(() => {
    const nowY = new Date().getFullYear();
    const by = Number(kidBirthYear);
    const e = {};
    if (kidName.trim().length < 2)    e.name    = t("p025");
    if (kidSurname.trim().length < 2) e.surname = t("p025");
    if (!/^\d{4}$/.test(String(kidBirthYear))) e.birth = t("p026");
    else if (by < nowY - 17 || by > nowY - 3)   e.birth = t("p027");
    if (kidGrade !== "" && (Number(kidGrade) < 1 || Number(kidGrade) > 11)) e.grade = t("p028");
    if (kidLogin.trim().length < 3)   e.login   = t("p029");
    if (kidPw.length < 4)             e.pw      = t("p030");
    setKidErr(e);
    if (!parentalConsent) {
      setParentalConsentErr(t("p031"));
      buzz(20);
      return;
    } else {
      setParentalConsentErr("");
    }
    if (Object.keys(e).length) { buzz(20); return; }
    addKidAccount();
  }, [kidName, kidSurname, kidBirthYear, kidGrade, kidLogin, kidPw, buzz, addKidAccount, parentalConsent, t]);
  const openBilim    = useCallback((view = "cats") => {
    buzz(10);
    if (setBilimInitialView) {
      setBilimInitialView(view);
    }
    setShowBilim(true);
  }, [buzz, setShowBilim, setBilimInitialView]);
  const openGarden   = useCallback(() => setPTab("garden"), [setPTab]);
  const closeAddKid  = useCallback(() => { setShowAddKid(false); setKidErr({}); setParentalConsent(false); setParentalConsentErr(""); }, [setShowAddKid]);
  const closeReferral= useCallback(() => setShowReferral(false), [setShowReferral]);
  const backToMain   = useCallback(() => { setPTab("main"); setSelectedKid(null); }, [setPTab]);
  const handleAddVazifaLocal = async (title, reward, deadline, kidId) => {
    buzz(12);
    const kidObj = azolar.find(a => a.id === kidId);
    const item = {
      id: Date.now(),
      title: title.trim(),
      reward: Number(reward),
      emoji: "📚",
      assignedTo: kidId,
      assignedName: kidObj?.ism || "",
      assignedLogin: kidObj?.login || "",
      createdBy: user.id,
      createdByName: user.ism || "",
      status: "pending",
      sana: new Date().toISOString().slice(0, 10),
      doneSana: "",
      paidSana: "",
      deadline: deadline || "",
    };

    const upd = [item, ...(vazifalar || [])];
    await db.s("vazifa_" + user.oilaId, upd);
    if (setVazifalar) {
      setVazifalar(upd);
    }
    setSelectedKid(prev => {
      if (prev && prev.id === kidId) {
        return {
          ...prev,
          kidTasks: upd.filter(x => x.assignedTo === kidId)
        };
      }
      return prev;
    });
    ok$(t("p032"));
  };

  const pickPhoto    = useCallback(() => fRef.current?.click(), [fRef]);

  const achTap = useCallback(tap => {
    if (tap === "garden") setPTab("garden");
    else if (tap === "referral") setShowReferral(true);
  }, [setPTab, setShowReferral]);

  // Oila kodini nusxalash — mavjud logika 1:1 saqlangan
  const copyFamCode = useCallback(async () => {
    const code = user?.oilaId || "";
    if (!code) { ok$(t("p033"), "err"); return; }
    buzz(10);
    let done = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(code); done = true; }
    } catch (e) { done = false; }
    if (!done) {
      // Zaxira usul: eski brauzerlar / HTTP muhit uchun
      try {
        const ta = document.createElement("textarea");
        ta.value = code; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        done = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { done = false; }
    }
    if (done) ok$(t("p034"));
    else ok$(t("p035"), "err");
  }, [user?.oilaId, ok$, buzz, t]);

  // Oila kodini ulashish — mavjud logika 1:1 saqlangan
  const shareFamCode = useCallback(async () => {
    const code = user?.oilaId || "";
    if (!code) { ok$(t("p033"), "err"); return; }
    buzz(10);
    const txt = t("p254", { code });
    if (navigator.share) {
      try { await navigator.share({ title: "Oila Hisobchi", text: txt }); } catch (e) { /* foydalanuvchi bekor qildi */ }
    } else {
      try { await navigator.clipboard.writeText(txt); ok$(t("p034")); }
      catch (e) { ok$(t("p036"), "err"); }
    }
  }, [user?.oilaId, ok$, buzz, t]);

  const copyRefLink = useCallback(() => {
    const link = (window.location.origin + "/?ref=") + (user?.id || "");
    try { navigator.clipboard.writeText(link); ok$(t("p037")); }
    catch (e) { ok$(t("p035"), "err"); }
  }, [user?.id, ok$, t]);

  const tgInviteFriend = useCallback(() => {
    const link = (window.location.origin + "/?ref=") + (user?.id || "");
    const txt = (t("p038")) + link;
    const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt);
    window.open(url, "_blank");
  }, [user?.id, t]);

  const tgInviteFamily = useCallback(() => {
    const code = user?.oilaId || "";
    const link = (window.location.origin + "/?ref=") + (user?.id || "") + "&fam=" + code;
    const txt = t("p255", { code }) + link;
    const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt);
    window.open(url, "_blank");
  }, [user?.id, user?.oilaId, t]);

  // Hero uchun oq-alpha (kit Dashboard Hero precedenti)
  const heroSoft = "rgba(255,255,255,0.16)";
  const heroText = "rgba(255,255,255,0.75)";

  return (
    <div>
      <input ref={fRef} type="file" accept="image/*" style={{ display: "none" }} onChange={doPhoto} />
      {kidCreated && (
        <KidCreatedModal
          th={th}
          lg={lg}
          kidCreated={kidCreated}
          buzz={buzz}
          onClose={() => setKidCreated(null)}
        />
      )}
      {pTab === "main" && (
        <div className="ui-fadeUp">
          <PageHeader th={th} title={t.prf} />

          {/* ═══ 1. HERO — Clicking this opens "Personal Info" (pTab === "shaxsiy") ═══ */}
          <div className="ui-press" 
            onClick={() => { buzz(10); setPTab("shaxsiy"); }}
            style={{ 
              background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", 
              borderRadius: RADIUS.l, 
              padding: SPACE.s5 + "px " + SPACE.s4 + "px", 
              marginBottom: SPACE.s3, 
              position: "relative", 
              overflow: "hidden", 
              boxShadow: SHADOW.e1(th.ac),
              cursor: "pointer"
            }}
          >
            <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s12, width: SPACE.s16 * 2 + SPACE.s6, height: SPACE.s16 * 2 + SPACE.s6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -SPACE.s12, left: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s4, position: "relative" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <UIAvatar th={th} src={user?.photo} name={user?.ism} size={SPACE.s16} variant={isPremium ? "premium" : undefined} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isPremium && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                    {Ico.crown("#fff")}
                    <span style={{ ...TYPE.tiny, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>Premium</span>
                  </div>
                )}
                <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(user)}</div>
                <div style={{ ...TYPE.caption, color: heroText, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
              </div>
              <div style={{ flexShrink: 0, color: "rgba(255, 255, 255, 0.7)" }}>
                {Ico.right("#fff")}
              </div>
            </div>
          </div>

          {/* ═══ 2. PREMIUM — Active / Inactive card ═══ */}
          <PremiumCard th={th} active={isPremium} onClick={openPremium}
            title={isPremium ? (t("p039")) : (t("p040"))}
            sub={isPremium ? (t("p041")) : (t("p042"))}
            features={isPremium ? [] : [
              t("p043"),
              t("p044"),
              t("p045"),
            ]}
            cta={isPremium
              ? <Badge th={th} type="premium" icon={null}>{t("p046")}</Badge>
              : <Badge th={th} type="info">{t("p047")}</Badge>} />

          {/* ═══ 3. OILA — Click opens Oila Details Page ═══ */}
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3, overflow: "hidden" }}>
            <ListItem th={th} divider={false} onClick={() => { buzz(10); setPTab("oila"); }}
              icon={PIco.family(th.ac)} iconTone={th.ac}
              title={t("fam")}
              sub={t("p048")}
              right={Ico.right(th.t2)} />
          </AppCard>

          {/* ═══ 4. BARAKA BOG'I — Garden button ═══ */}
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3, overflow: "hidden" }}>
            <ListItem th={th} divider={false} onClick={() => { buzz(10); openGarden(); }}
              icon={PIco.leaf(th.gr)} iconTone={th.gr}
              title={t("p049")}
              sub={t("p271", { level: pStats.gardenLevel })}
              right={Ico.right(th.t2)} />
          </AppCard>

          {/* ═══ 4b. BILIM BOZORI — Knowledge Market button ═══ */}
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3, overflow: "hidden" }}>
            <ListItem th={th} divider={false} onClick={() => { buzz(10); openBilim("market"); }}
              icon={PIco.book(th.ac)} iconTone={th.ac}
              title={t("p256")}
              sub={t("p257")}
              right={Ico.right(th.t2)} />
          </AppCard>

          {/* ═══ 5. SOZLAMALAR — Settings list entry ═══ */}
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s4, overflow: "hidden" }}>
            <ListItem th={th} divider={false} onClick={() => { buzz(10); setPTab("sozlamalar"); }}
              icon={Ico.settings(th.ac)} iconTone={th.ac}
              title={t("p050")}
              sub={t("p051")}
              right={Ico.right(th.t2)} />
          </AppCard>
        </div>
      )}

      {/* ═══════════════ DETAILED OILA PAGE ═══════════════ */}
      {pTab === "oila" && (
        <div className="ui-fadeUp">
          <PageHeader th={th} title={t("fam")} onBack={backToMain} />

          {/* Katta a'zolar (Adults) */}
          {adults.length > 0 && (
            <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3 }}>
              <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px " + SPACE.s1 + "px" }}>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t2 }}>{t("p052")}</span>
              </div>
              {adults.map((a, i) => {
                const rel = RELATIONS.find(r => r.id === a.rel);
                const isHead = a.rol === "bosh";
                const me = a.id === user?.id;
                const isKidMember = a.rol === "kid";
                const relLabel = isKidMember
                  ? (t("p060"))
                  : (rel ? (rel[lg] || rel.uz) : (isHead ? t.hd : t.mb2));
                return (
                  <MemberRow key={a.id} th={th} photo={a.photo} name={fullName(a) + (me ? " (" + t.me + ")" : "")}
                    sub={relLabel}
                    divider={i < adults.length - 1}
                    badge={
                      <span style={{ display: "inline-flex", gap: SPACE.s1, flexShrink: 0 }}>
                        {me && <Badge th={th} type="success">{t("p053")}</Badge>}
                        {isHead
                          ? <Badge th={th} type="role" icon={Ico.crown(th.ac)}>{t("p054")}</Badge>
                          : <Badge th={th} tone={th.t2}>{t.mb2}</Badge>}
                      </span>
                    } />
                );
              })}
            </AppCard>
          )}

          {/* Report access toggles for adults */}
          {user?.rol === "bosh" && azolar.length > 1 && (
            <AppCard th={th} style={{ marginBottom: SPACE.s3 }}>
              <SubHeader th={th}>{t("p055")}</SubHeader>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{t("p056")}</div>
              {azolar.map((a, i) => {
                const isAHead = a.rol === "bosh";
                const hasAccess = isAHead || (oila?.reportAccess || []).includes(a.id);
                const rel = RELATIONS.find(r => r.id === a.rel);
                const isKidMember = a.rol === "kid";
                const relLabel = isKidMember
                  ? (t("p060"))
                  : (rel ? (rel[lg] || rel.uz) : (isAHead ? t.hd : t.mb2));
                return (
                  <MemberRow key={a.id} th={th} photo={a.photo} name={fullName(a) + (a.id === user.id ? " (" + t.me + ")" : "")}
                    sub={relLabel}
                    divider={i < azolar.length - 1}
                    badge={isAHead
                      ? <Badge th={th} type="role">{t("p057")}</Badge>
                      : <Switch th={th} checked={hasAccess} onChange={() => toggleReportAccess(a.id)} label={t("p058")} />} />
                );
              })}
            </AppCard>
          )}

          {/* FARZANDLAR section */}
          {kidsData.length > 0 && (
            isKid ? (
              <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3 }}>
                <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px " + SPACE.s1 + "px" }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t2 }}>{t("p059")}</span>
                </div>
                {kidsData.map((kid, i) => (
                  <MemberRow 
                    key={kid.id} 
                    th={th} 
                    photo={kid.photo} 
                    name={fullName(kid) + (kid.id === user?.id ? " (" + t.me + ")" : "")}
                    sub={t("p060")}
                    divider={i < kidsData.length - 1}
                    badge={<Badge th={th} tone={th.t2}>{t("p060")}</Badge>} 
                  />
                ))}
              </AppCard>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginBottom: SPACE.s3 }}>
                <div style={{ paddingLeft: SPACE.s1 }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t2 }}>{t("p059")}</span>
                </div>
                {kidsData.map(kid => {
                  const canDelKid = kid.rol === "kid" && (user?.rol === "bosh" || kid.parentId === user?.id);
                  return (
                    <button 
                      key={kid.id} 
                      className="ui-press"
                      onClick={() => {
                        buzz(10);
                        setSelectedKid(kid);
                        setPTab("kid_detail");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: th.sur,
                        border: "1px solid " + th.bor,
                        borderRadius: RADIUS.m,
                        padding: SPACE.s4,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        gap: SPACE.s2,
                        boxSizing: "border-box"
                      }}
                    >
                      {/* Bola Avatari + Ismi */}
                      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, width: "100%" }}>
                        <UIAvatar th={th} src={kid.photo} name={kid.ism} size={SPACE.s10} />
                        <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, fontWeight: 700 }}>{fullName(kid)}</span>
                        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: SPACE.s2 }}>
                          {canDelKid && (
                            <span onClick={(e) => { e.stopPropagation(); buzz(20); setKidDel(kid); }} style={{ display: "flex", padding: 6, color: th.rd }}>
                              {Ico.trash(th.rd)}
                            </span>
                          )}
                          {Ico.right(th.t3)}
                        </span>
                      </div>

                      {/* Statistika satrlari */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, ...TYPE.caption, color: th.t2 }}>
                          {PIco.checkCircle(th.gr)}
                          <span>{t("p272", { count: kid.doneThisWeek })}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, ...TYPE.caption, color: th.t2 }}>
                          {PIco.coin(th.am)}
                          <span>{t("p273", { amount: f(kid.earnedAmount, true) })}</span>
                        </div>
                        {kid.activeGoal && (
                          <div style={{ marginTop: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...TYPE.tiny, color: th.t3, marginBottom: 3, width: "100%" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <span style={{ display: "inline-flex", alignItems: "center" }}>{PIco.target(th.ac, 14)}</span>
                                {kid.activeGoal.ism}
                              </span>
                              <span style={{ marginLeft: "auto", fontWeight: 700, color: th.ac }}>{kid.goalPct}%</span>
                            </div>
                            <LinearProgress th={th} value={kid.goalPct} tone={th.ac} height={6} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* Bola qo'shish CTA */}
          {!isKid && (
            <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s3 }}>
              <ListItem th={th} divider={false} onClick={openAddKid}
                icon={PIco.baby(th.am)} iconTone={th.am}
                title={t("p061")}
                sub={t("p062")} />
            </AppCard>
          )}

          {/* Do'stlarni taklif qilish va Oila kodi */}
          <SectionHeader th={th}>{t("p063")}</SectionHeader>
          {user?.rol === "bosh" && (
            <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 }}>{Ico.key(th.ac)}{t("p064")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s2 + "px 0", flexWrap: "wrap" }}>
                <div style={{ fontFamily: "monospace", ...TYPE.subtitle, fontWeight: 800, color: th.ac, wordBreak: "break-all", letterSpacing: 1, flex: 1, minWidth: SPACE.s16 * 2 }}>{user?.oilaId || "—"}</div>
                <SecondaryButton th={th} onClick={copyFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }} aria-label={t("p065")}>
                  {PIco.copy(th.ac)}{t("p066")}
                </SecondaryButton>
                <SecondaryButton th={th} onClick={shareFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0, background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong }} aria-label={t("p067")}>
                  {PIco.share(th.gr)}{t("p068")}
                </SecondaryButton>
              </div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s1 }}>{t("p069")}</div>
            </AppCard>
          )}

          {/* Referral Card */}
          <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1.5px solid " + th.gr + ALPHA.med, marginBottom: SPACE.s3 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3 }}>
              <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("p070")}</span>
            </div>
            <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{t("p071")}</div>
            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              <div style={{ flex: 1, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: RADIUS.s + 2, padding: SPACE.s3 + "px", ...TYPE.caption, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", minWidth: 0 }}>{(window.location.origin + "/?ref=") + (user?.id || "")}</div>
              <SecondaryButton th={th} onClick={copyRefLink} style={{ width: "auto", padding: "0 " + SPACE.s4 + "px", flexShrink: 0, fontSize: TYPE.caption.fontSize }}>{t("p066")}</SecondaryButton>
            </div>
            <PrimaryButton th={th} onClick={tgInviteFriend} style={{ padding: (SPACE.s2 + 3) + "px", fontSize: TYPE.caption.fontSize + 1 }}>{PIco.send("#fff")}{t("p072")}</PrimaryButton>
          </AppCard>
        </div>
      )}

      {/* ═══════════════ DETAILED SETTINGS PAGE ═══════════════ */}
      {pTab === "sozlamalar" && (
        <div className="ui-fadeUp">
          <PageHeader th={th} title={t("p050")} onBack={backToMain} />

          {/* App Logo & Info Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 10px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: "0 8px 24px " + th.ac + "22" }}>
              <span style={{ transform: "scale(1.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ico.wallet("#fff")}</span>
            </div>
            <div style={{ ...TYPE.heading, fontSize: 18, fontWeight: 800, color: th.t1 }}>Oila Hisobchi</div>
            <div style={{ ...TYPE.caption, color: th.t2, marginTop: 4, maxWidth: 280, fontSize: 13 }}>{t("p073")}</div>
          </div>

          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s4 }}>
            {/* Budjet va limitlar */}
            {user?.rol === "bosh" && (
              <SettingRow th={th} icon={Ico.wallet(th.ac)} title={t("p074")} sub={t("p075")} onClick={() => setPTab("budjet")} divider />
            )}

            {/* Xavfsizlik */}
            <SettingRow th={th} icon={Ico.shield(th.ac)} title={t.xav} sub={t("p076")} onClick={() => setPTab("xav")} divider />

            {/* Ilova sozlamalari */}
            <SettingRow th={th} icon={Ico.settings(th.ac)} title={t.ilovaS} sub={t("p077")} onClick={() => setPTab("ilovaS")} divider />

            {/* Yordam va FAQ */}
            <SettingRow th={th} icon={Ico.help(th.ac)} title={t.qol} sub={t("p078")} onClick={() => setPTab("qol")} divider />

            {/* Versiya */}
            <SettingRow th={th} icon={Ico.version(th.ac)} title={t.ver} divider={user?.rol !== "kid"} right={<span style={{ ...TYPE.caption, fontWeight: 600, color: th.t2 }}>v{APP_VER}</span>} />

            {/* Xavfli hudud */}
            {user?.rol !== "kid" && (
              <SettingRow th={th} danger icon={Ico.trash(th.rd)} title={t("p079")} sub={t("p080")} onClick={openClean} divider />
            )}

            {/* Hisobni o'chirish */}
            {user?.rol !== "kid" && (
              <SettingRow th={th} danger icon={Ico.trash(th.rd)} title={t("p081")} sub={t("p082")} onClick={openDeleteAccount} divider={false} />
            )}
          </AppCard>

          {/* ─────────── Huquqiy hujjatlar (Legal) ─────────── */}
          <SubHeader th={th}>{t("p083")}</SubHeader>
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s4 }}>
            <SettingRow
              th={th}
              icon={PIco.book(th.ac, 18)}
              title={t("p258")}
              sub={t("p259")}
              onClick={() => window.open("/about.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider
            />
            <SettingRow
              th={th}
              icon={PIco.lock(th.ac, 18)}
              title={t("p084")}
              sub={t("p085")}
              onClick={() => window.open("/privacy.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider
            />
            <SettingRow
              th={th}
              icon={PIco.list(th.ac, 18)}
              title={t("p086")}
              sub={t("p087")}
              onClick={() => window.open("/terms.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider
            />
            <SettingRow
              th={th}
              icon={PIco.baby(th.ac, 18)}
              title={t("p088")}
              sub={t("p089")}
              onClick={() => window.open("/child-safety.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider
            />
            <SettingRow
              th={th}
              icon={Ico.trash ? Ico.trash(th.ac, 18) : PIco.list(th.ac, 18)}
              title={t("p260")}
              sub={t("p261")}
              onClick={() => window.open("/account-deletion.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider
            />
            <SettingRow
              th={th}
              icon={PIco.warn(th.ac, 18)}
              title={t("p262")}
              sub={t("p263")}
              onClick={() => window.open("/disclaimer.html?lang=" + lg, "_blank", "noopener,noreferrer")}
              divider={false}
            />
          </AppCard>

          {/* Chiqish (Logout) */}
          <DangerButton th={th} onClick={logout} style={{ marginBottom: SPACE.s4 }}>{Ico.door(th.rd)}{t.lo}</DangerButton>
          <div style={{ textAlign: "center", ...TYPE.tiny, letterSpacing: 0.4, textTransform: "none", color: th.t3, marginTop: SPACE.s3, marginBottom: SPACE.s2 }}>Oila Hisobchi · v{APP_VER}</div>
        </div>
      )}

      {/* ═══════════════ FARZANDIM: BATAFSIL SAHIFASI ═══════════════ */}
      {pTab === "kid_detail" && selectedKid && (
        <div className="ui-fadeUp">
          <PageHeader th={th} title={t("p264", { name: selectedKid.ism })} onBack={backToMain} />
          
          {/* Bola haqida qisqacha ma'lumot card */}
          <AppCard th={th} style={{ marginBottom: SPACE.s3, display: "flex", alignItems: "center", gap: SPACE.s4 }}>
            <UIAvatar th={th} src={selectedKid.photo} name={selectedKid.ism} size={SPACE.s14} />
            <div>
              <div style={{ ...TYPE.heading, fontWeight: 800, color: th.t1 }}>{fullName(selectedKid)}</div>
              <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2 }}>{t("p090")}</div>
            </div>
          </AppCard>

          {/* TABLAR: Vazifalar va Bilim bozori */}
          <div style={{ display: "flex", background: th.bor, borderRadius: RADIUS.m, padding: 3, marginBottom: SPACE.s3 }}>
            <button 
              className="ui-press"
              onClick={() => { buzz(10); setKidTab("vazifalar"); }}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: RADIUS.s + 2,
                fontFamily: "inherit",
                fontSize: TYPE.caption.fontSize,
                fontWeight: 700,
                cursor: "pointer",
                background: kidTab === "vazifalar" ? th.sur : "transparent",
                color: kidTab === "vazifalar" ? th.ac : th.t2,
                transition: "all 0.2s ease"
              }}
            >
              {t("p091")}
            </button>
            <button 
              className="ui-press"
              onClick={() => { buzz(10); setKidTab("bilim"); }}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: RADIUS.s + 2,
                fontFamily: "inherit",
                fontSize: TYPE.caption.fontSize,
                fontWeight: 700,
                cursor: "pointer",
                background: kidTab === "bilim" ? th.sur : "transparent",
                color: kidTab === "bilim" ? th.ac : th.t2,
                transition: "all 0.2s ease"
              }}
            >
              {t("p092")}
            </button>
            <button 
              className="ui-press"
              onClick={() => { buzz(10); setKidTab("vaqt"); }}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: RADIUS.s + 2,
                fontFamily: "inherit",
                fontSize: TYPE.caption.fontSize,
                fontWeight: 700,
                cursor: "pointer",
                background: kidTab === "vaqt" ? th.sur : "transparent",
                color: kidTab === "vaqt" ? th.ac : th.t2,
                transition: "all 0.2s ease"
              }}
            >
              {t("p093")}
            </button>
          </div>

          {/* TAB 1: VAZIFALAR */}
          {kidTab === "vazifalar" && (
            <div className="ui-fadeUp">
              {/* Yangi vazifa biriktirish formasi */}
              <AppCard th={th} style={{ marginBottom: SPACE.s3 }}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s1 }}>
                  <span>➕</span> {t("p094")}
                </div>
                <TextInput th={th} label={t("p095")} value={newVTitle} onChange={setNewVTitle} placeholder={t("p096")} />
                <div style={{ display: "flex", gap: SPACE.s2, marginTop: 2 }}>
                  <div style={{ flex: 1 }}>
                    <TextInput th={th} label={t("p097")} type="number" value={newVReward} onChange={setNewVReward} placeholder="10000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextInput th={th} label={t("p098")} type="date" value={newVDeadline} onChange={setNewVDeadline} />
                  </div>
                </div>
                <PrimaryButton th={th} onClick={async () => {
                  if (!newVTitle.trim() || !newVReward || Number(newVReward) <= 0) {
                    return ok$(t("fill_all_fields"), "err");
                  }
                  await handleAddVazifaLocal(newVTitle, newVReward, newVDeadline, selectedKid.id);
                  setNewVTitle("");
                  setNewVReward("");
                  setNewVDeadline("");
                }} style={{ marginTop: SPACE.s2 }}>
                  {t("p099")}
                </PrimaryButton>
              </AppCard>

              {/* Vazifalar ro'yxati */}
              <SectionHeader th={th}>{t("p100")}</SectionHeader>
              {selectedKid.kidTasks?.length === 0 ? (
                <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6, color: th.t3 }}>
                  {t("p101")}
                </AppCard>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
                  {selectedKid.kidTasks.map(v => (
                    <AppCard key={v.id} th={th} style={{ borderLeft: "4px solid " + (v.status === "approved" ? th.gr : (v.status === "done" ? th.ye : th.ac)) }}>
                      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", width: "100%" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ ...TYPE.title, color: th.t1, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
                          <div style={{ display: "flex", gap: SPACE.s3, alignItems: "center", marginTop: 4 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...TYPE.caption, fontWeight: 700, color: th.gr }}>
                              {PIco.coin(th.gr, 15)}
                              {f(v.reward, true)}
                            </span>
                            {v.deadline && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...TYPE.tiny, color: th.t3 }}>
                                {PIco.cal(th.t3, 13)}
                                {v.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ marginLeft: SPACE.s2, flexShrink: 0 }}>
                          {v.status === "approved" && <Badge th={th} type="success">{t("confirmed")}</Badge>}
                          {v.status === "pending" && <Badge th={th} type="info">{t("pending_label")}</Badge>}
                          {v.status === "done" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <Badge th={th} type="warning">{t("p102")}</Badge>
                              <SecondaryButton th={th} onClick={async () => {
                                buzz(20);
                                if (vazifaApprove) {
                                  await vazifaApprove(v.id);
                                  const upd = (await db.g("vazifa_" + user.oilaId)) || [];
                                  const filtered = upd.filter(x => x.assignedTo === selectedKid.id);
                                  setSelectedKid(prev => ({ ...prev, kidTasks: filtered }));
                                }
                              }} style={{ padding: "4px 8px", fontSize: TYPE.tiny.fontSize }}>
                                {t("accept")}
                              </SecondaryButton>
                            </div>
                          )}
                        </div>
                      </div>
                    </AppCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BILIM BOZORI */}
          {kidTab === "bilim" && (
            <div className="ui-fadeUp">
              {/* Bola Bilim Statistikasi */}
              <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
                <AnimatedStat th={th} icon="🪙" value={kidCoins} label={t("p103")} tone={PREMIUM.gold} />
                <AnimatedStat th={th} icon="🔥" value={kidStreak} label={t("p104")} tone={th.ac} />
                <AnimatedStat th={th} icon="🎮" value={kidLearnStats.games} label={t("p105")} tone={th.gr} />
              </div>

              {/* Bilim Bozoriga to'g'ridan-to'g'ri kirish tugmasi */}
              <AppCard th={th} style={{ background: "linear-gradient(135deg, " + th.ac + ALPHA.tint + ", " + th.sur + ")", border: "1.5px solid " + th.ac + ALPHA.med, marginBottom: SPACE.s3 }}>
                <div style={{ ...TYPE.title, fontWeight: 800, color: th.t1 }}>🧠 {t("p106")}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 4 }}>
                  {t("p107")}
                </div>
                <SecondaryButton th={th} onClick={() => openBilim("market")} style={{ marginTop: SPACE.s3, width: "100%", color: th.ac, background: th.ac + ALPHA.soft, border: "1px solid " + th.ac + ALPHA.strong }}>
                  {t("p108")}
                </SecondaryButton>
              </AppCard>

              {/* Qo'yilgan takliflar ro'yxati */}
              <SectionHeader th={th}>{t("p109")}</SectionHeader>
              {kidBilimOffers.length === 0 ? (
                <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6, color: th.t3 }}>
                  {t("p110")}
                </AppCard>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
                  {kidBilimOffers.map(o => {
                    let statusLabel = o.status;
                    let badgeType = "info";
                    if (o.status === "pending") {
                      statusLabel = t("pending_label");
                      badgeType = "warning";
                    } else if (o.status === "accepted") {
                      statusLabel = t("p111");
                      badgeType = "success";
                    } else if (o.status === "rejected") {
                      statusLabel = t("rejected_alert");
                      badgeType = "danger";
                    } else if (o.status === "countered") {
                      statusLabel = t("p112");
                      badgeType = "info";
                    }

                    return (
                      <AppCard key={o.id} th={th} style={{ borderLeft: "4px solid " + (o.status === "accepted" ? th.gr : (o.status === "pending" || o.status === "countered" ? th.ye : th.rd)) }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ ...TYPE.tiny, color: th.t2, fontWeight: 700 }}>
                              {o.fromRole === "kid" ? (t("p113")) : (t("p114"))}
                            </span>
                            <Badge th={th} type={badgeType}>{statusLabel}</Badge>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: 12, background: th.bg, padding: "8px 12px", borderRadius: 8 }}>
                            <div>
                              <div style={{ ...TYPE.tiny, color: th.t3 }}>{t("p115")}</div>
                              <div style={{ ...TYPE.title, fontWeight: 800, color: PREMIUM.gold, display: "flex", alignItems: "center", gap: 4 }}>
                                🪙 {o.coins}
                              </div>
                            </div>
                            <span style={{ color: th.t3 }}>➔</span>
                            <div>
                              <div style={{ ...TYPE.tiny, color: th.t3 }}>{t("amount")}</div>
                              <div style={{ ...TYPE.title, fontWeight: 800, color: th.gr }}>
                                {f(o.amount, true)}
                              </div>
                            </div>
                          </div>

                          {o.note && (
                            <div style={{ ...TYPE.caption, color: th.t2, fontStyle: "italic", background: th.bg, padding: "6px 10px", borderRadius: 6 }}>
                              {o.note}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...TYPE.tiny, color: th.t3 }}>
                            <span>ID: {o.id}</span>
                            <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                      </AppCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EKRAN VAQTI */}
          {kidTab === "vaqt" && (
            <div className="ui-fadeUp" style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
              {/* Bugungi ko'rsatkichlar */}
              <div style={{ display: "flex", gap: SPACE.s2 }}>
                <AnimatedStat th={th} icon="⏱" value={kidVaqtStats[td()] || 0} label={t("p116")} tone={th.ac} />
                <AnimatedStat th={th} icon="➕" value={kidExtra} label={t("p117")} tone={th.gr} />
                <AnimatedStat th={th} icon="🔒" value={kidLimit} label={t("p118")} tone={kidLimit > 0 ? th.rd : th.t3} />
              </div>

              {/* So'nggi 7 kunlik statistika */}
              <AppCard th={th}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, marginBottom: SPACE.s3 }}>
                  {t("p119")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
                  {(() => {
                    const daysList = [];
                    const dayNames = t("p270", { returnObjects: true });

                    const today = new Date();
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date();
                      d.setDate(today.getDate() - i);
                      const dStr = d.toISOString().slice(0, 10);
                      const dOfWeek = d.getDay();
                      const mins = kidVaqtStats[dStr] ? Number(kidVaqtStats[dStr]) : 0;
                      daysList.push({
                        dateStr: dStr,
                        dayName: dayNames[dOfWeek],
                        minutes: mins,
                        isToday: dStr === td()
                      });
                    }

                    const maxMins = Math.max(...daysList.map(d => d.minutes), 60);

                    return daysList.map((d, idx) => {
                      const pct = Math.min(100, Math.round((d.minutes / maxMins) * 100));
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                          <span style={{ ...TYPE.caption, width: "40px", color: d.isToday ? th.ac : th.t2, fontWeight: d.isToday ? 800 : 500 }}>
                            {d.dayName}
                          </span>
                          <div style={{ flex: 1, height: "10px", background: th.bg, borderRadius: RADIUS.pill, overflow: "hidden", position: "relative" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: d.isToday ? `linear-gradient(90deg, ${th.ac}, ${th.ac2 || th.ac})` : th.bor,
                                borderRadius: RADIUS.pill,
                                transition: "width 0.5s ease"
                              }}
                            />
                          </div>
                          <span style={{ ...TYPE.caption, width: "60px", textAlign: "right", color: d.minutes > 0 ? th.t1 : th.t3, fontWeight: d.minutes > 0 ? 700 : 400 }}>
                            {d.minutes} {t("p120")}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </AppCard>

              {/* Limit tahrirlash formasi */}
              <AppCard th={th}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, marginBottom: SPACE.s2 }}>
                  {t("p121")}
                </div>
                <div style={{ ...TYPE.caption, color: th.t2, marginBottom: SPACE.s3, textTransform: "none", letterSpacing: 0 }}>
                  {t("p122")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
                  <TextInput
                    th={th}
                    label={t("p123")}
                    type="number"
                    value={inputLimit}
                    onChange={setInputLimit}
                    placeholder={t("p124")}
                  />
                  <PrimaryButton th={th} onClick={saveKidLimit} disabled={savingLimit} style={{ width: "100%", marginTop: SPACE.s2 }}>
                    {savingLimit ? (t("p125")) : (t("p126"))}
                  </PrimaryButton>
                </div>
              </AppCard>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ SHAXSIY MA'LUMOTLAR ═══════════════ */}
      {pTab === "shaxsiy" && (
        <div>
          <PageHeader th={th} title={t.shaxsiy} onBack={backToMain} />
          <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 + "px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s3 }}>
              <div style={{ position: "relative" }}>
                <UIAvatar th={th} src={user?.photo} name={user?.ism} size={SPACE.s16 + SPACE.s3 + 2} variant={isPremium ? "premium" : undefined} />
                <button className="ui-press" onClick={pickPhoto} aria-label={t.up}
                  style={{ position: "absolute", bottom: 2, right: 2, width: SPACE.s6 + 2, height: SPACE.s6 + 2, borderRadius: RADIUS.full, background: th.ac, border: "2px solid " + th.sur, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Ico.camera("#fff")}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: SPACE.s2, justifyContent: "center" }}>
              <SecondaryButton th={th} onClick={pickPhoto} style={{ width: "auto", padding: (SPACE.s2 - 1) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize }}>{Ico.camera(th.ac)}{t.up}</SecondaryButton>
              {user?.photo && <DangerButton th={th} onClick={rmPhoto} style={{ width: "auto", padding: (SPACE.s2 - 1) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize }}>{Ico.trash(th.rd)}{t.rp}</DangerButton>}
            </div>
          </AppCard>

          {/* Ism */}
          <AppCard th={th}>
            <div style={{ ...STY.row, marginBottom: edN ? SPACE.s3 : 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: 2 }}>{t("p127")}</div>
                <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(user) || (t("p128"))}</div>
              </div>
              <SecondaryButton th={th} onClick={() => { setEdN(v => !v); setNewN(user?.ism || ""); setNewF(user?.familya || ""); }} style={{ width: "auto", padding: (SPACE.s1 + 2) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }}>{Ico.edit(th.ac)}{edN ? t.cn : t.ep}</SecondaryButton>
            </div>
            {edN && (
              <div>
                <TextInput th={th} label={t("p129")} value={newN} onChange={setNewN} placeholder={t("p129")} autoFocus />
                <TextInput th={th} label={t("p130")} value={newF} onChange={setNewF} placeholder={t("p130")} />
                <PrimaryButton th={th} onClick={updName}>{t.un}</PrimaryButton>
              </div>
            )}
          </AppCard>

          {/* Email */}
          <AppCard th={th}>
            <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: 2 }}>Email</div>
            <div style={{ ...TYPE.subtitle, color: th.t1 }}>{user?.email}</div>
          </AppCard>

          {/* Telefon */}
          <AppCard th={th}>
            <div style={{ ...STY.row, marginBottom: edT ? SPACE.s3 : 0 }}>
              <div>
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: 2 }}>{t("p131")}</div>
                <div style={{ ...TYPE.subtitle, color: user?.tel ? th.t1 : th.t2 }}>{user?.tel || (t("p128"))}</div>
              </div>
              <SecondaryButton th={th} onClick={() => { setEdT(v => !v); setNewT(user?.tel || ""); }} style={{ width: "auto", padding: (SPACE.s1 + 2) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize }}>{Ico.edit(th.ac)}{edT ? t.cn : (user?.tel ? t.ep : (t("add")))}</SecondaryButton>
            </div>
            {edT && (
              <div>
                <TextInput th={th} value={newT} onChange={setNewT} placeholder="+998 90 123 45 67" inputMode="tel" autoFocus />
                <PrimaryButton th={th} onClick={() => saveTel(newT)}>{t("save")}</PrimaryButton>
              </div>
            )}
          </AppCard>

          {/* Bu oy statistikasi */}
          <AppCard th={th}>
            <SubHeader th={th}>{t("p132")}</SubHeader>
            {[
              { l: t("exp"), v: f(bX.filter(x => x.uid === user.id).reduce((s, x) => s + Number(x.summa || 0), 0), true), c: th.rd },
              { l: t("inc"), v: f(bD.filter(d => d.uid === user.id).reduce((s, d) => s + Number(d.summa || 0), 0), true), c: th.gr },
              { l: t("p133"), v: xar.filter(x => x.uid === user.id).length + " ta", c: th.ac },
            ].map((item, i, arr) => (
              <div key={item.l} style={{ ...STY.row, padding: SPACE.s2 + "px 0", borderBottom: i < arr.length - 1 ? "1px solid " + th.bor : "none" }}>
                <span style={{ ...TYPE.caption, color: th.t2 }}>{item.l}</span>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: item.c, fontVariantNumeric: "tabular-nums" }}>{item.v}</span>
              </div>
            ))}
          </AppCard>

          {/* Oila kodi — faqat oila boshlig'i */}
          {user?.rol === "bosh" && (
            <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 }}>{Ico.key(th.ac)}{t.fc2}</div>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s2 + "px 0", flexWrap: "wrap" }}>
                <div style={{ fontFamily: "monospace", ...TYPE.subtitle, fontWeight: 800, color: th.ac, wordBreak: "break-all", letterSpacing: 1, flex: 1, minWidth: SPACE.s16 * 2 }}>{user?.oilaId || "—"}</div>
                <SecondaryButton th={th} onClick={copyFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }} aria-label={t("p065")}>
                  {PIco.copy(th.ac)}{t("p066")}
                </SecondaryButton>
                <SecondaryButton th={th} onClick={shareFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0, background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong }} aria-label={t("p067")}>
                  {PIco.share(th.gr)}{t("p068")}
                </SecondaryButton>
              </div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s1 }}>{t.fcd}</div>
            </AppCard>
          )}
        </div>
      )}

      {/* ═══════════════ BUDJET VA LIMITLAR ═══════════════ */}
      {pTab === "budjet" && (
        <div>
          <PageHeader th={th} title={t("p074")} onBack={backToMain} />
          <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1.5px solid " + th.ac + ALPHA.med }}>
            <div style={{ ...TYPE.caption, fontWeight: 700, color: th.ac, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{Ico.wallet(th.ac)}{t("p134")}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s3 }}>{t("p135")}</div>
            <AmountInput th={th} label={t.mb} value={fBj} onChange={setFBj} placeholder="2 000 000" style={{ marginBottom: SPACE.s1 }} />
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, textAlign: "center" }}>{f(Number(fBj) || 0, false)}</div>
          </AppCard>

          {(() => {
            const bjNum = Number(fBj) || 0;
            const avgInc = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            if (bjNum > 0 && avgInc > 0 && bjNum > avgInc) {
              return (
                <WarningCard th={th} tone="danger" icon={PIco.warn(th.rd, 18)} title={t("p136")}>
                  {t("p265", { income: f(avgInc, true), budget: f(bjNum, true) })}
                </WarningCard>
              );
            }
            return null;
          })()}

          {bD.reduce((s, d) => s + Number(d.summa || 0), 0) > 0 && (() => {
            const jD2 = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            return (
              <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
                <div style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, marginBottom: SPACE.s2 + 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.bulb(th.gr)}{t("p137")}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s3, lineHeight: 1.5 }}>{t("p266", { income: f(jD2, true) })}</div>
                {[{ p: 50, c: th.gr, key: "p274a" }, { p: 30, c: th.am, key: "p274b" }, { p: 20, c: th.ac, key: "p274c" }].map(r => (
                  <div key={r.p} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 }}>
                    <div style={{ width: SPACE.s8 + SPACE.s1 + 2, height: SPACE.s6, borderRadius: RADIUS.s - 4, background: r.c + ALPHA.med, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: r.c, flexShrink: 0 }}>{r.p}%</div>
                    <span style={{ flex: 1, ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t1 }}>{t(r.key)}</span>
                    <span style={{ ...TYPE.caption, fontWeight: 700, color: r.c, fontVariantNumeric: "tabular-nums" }}>{f(Math.round(jD2 * r.p / 100), true)}</span>
                  </div>
                ))}
                <SecondaryButton th={th} onClick={() => setFBj(String(Math.round(jD2 * 0.8)))} style={{ marginTop: SPACE.s2, background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong, fontSize: TYPE.caption.fontSize }}>{t("p138")}</SecondaryButton>
              </AppCard>
            );
          })()}

          <AppCard th={th}>
            <SubHeader th={th}>{t("p139")}</SubHeader>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{t("p140")}</div>
            {KATS.map((k, i) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 + 2 }}>
                <div style={{ width: SPACE.s8 + 2, height: SPACE.s8 + 2, borderRadius: RADIUS.s, background: k.c + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><KatIco id={k.id} c={k.c} s={18} /></div>
                <span style={{ ...TYPE.caption, fontWeight: 500, color: th.t1, flex: 1 }}>{KN[lg][i]}</span>
                <input type="number" value={fKL[k.id] || ""} onChange={e => setFKL(p => ({ ...p, [k.id]: Number(e.target.value) || 0 }))} placeholder="—"
                  style={{ width: SPACE.s16 * 2 - SPACE.s2, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", color: th.t1, fontSize: TYPE.caption.fontSize + 1, outline: "none", textAlign: "right", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}
          </AppCard>

          {(() => {
            const limTotal = KATS.reduce((s, k) => s + (Number(fKL[k.id]) || 0), 0);
            const bjNum = Number(fBj) || 0;
            if (limTotal > 0 && bjNum > 0 && limTotal > bjNum) {
              return (
                <WarningCard th={th} icon={PIco.warn(th.am, 18)} title={t("p141")}>
                  {t("p267", { limits: f(limTotal, true), budget: f(bjNum, true) })}
                </WarningCard>
              );
            }
            if (limTotal > 0 && bjNum > 0) {
              return (
                <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
                  <span style={{ ...TYPE.caption, color: th.t2 }}>{t("p142")}</span>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, fontVariantNumeric: "tabular-nums" }}>{f(limTotal, true)} / {f(bjNum, true)}</span>
                </AppCard>
              );
            }
            return null;
          })()}

          <PrimaryButton th={th} onClick={saveBj}>{Ico.check("#fff")}{t.sv}</PrimaryButton>
        </div>
      )}

      {/* ═══════════════ ILOVA SOZLAMALARI ═══════════════ */}
      {pTab === "ilovaS" && (
        <div>
          <PageHeader th={th} title={t.ilovaS} onBack={backToMain} />

          {/* Til */}
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={Ico.globe(th.ac)} title={t.til} sub={currentLangLabel} onClick={() => setShowLgDD(v => !v)}
              right={<span style={{ transform: showLgDD ? "rotate(90deg)" : "none", transition: MOTION.trFast("transform"), display: "flex" }}>{Ico.right(th.t2)}</span>}
              divider={showLgDD} />
            {showLgDD && (
              <div style={{ maxHeight: SPACE.s16 * 4 + SPACE.s4, overflowY: "auto" }}>
                {langs.map((l, i, arr) => (
                  <ListItem key={l.code} th={th} divider={i < arr.length - 1}
                    icon={<span style={{ fontSize: 20 }}>{l.flag}</span>}
                    title={l.nativeName}
                    onClick={() => { setLg(l.code); setShowLgDD(false); }}
                    right={lg === l.code ? Ico.check(th.ac) : <span />} />
                ))}
              </div>
            )}
          </AppCard>

          {/* Mavzu */}
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={dark ? Ico.moon(th.ac) : Ico.sun(th.ac)} title={t.mavzu} sub={dark ? t.tungi : t.kunduzi} right={null} />
            <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px", display: "flex", gap: SPACE.s2 }}>
              {[{ v: false, l: t.kunduzi, i: Ico.sun }, { v: true, l: t.tungi, i: Ico.moon }].map(m => (
                <ChoiceChip key={String(m.v)} th={th} on={dark === m.v} onClick={() => { setDark(m.v); localStorage.setItem("oilaV7D", String(m.v)); }} style={{ flex: 1 }}>{m.i(dark === m.v ? th.ac : th.t2)}{m.l}</ChoiceChip>
              ))}
            </div>
          </AppCard>

          {/* Valyuta — showValDD holati saqlangan */}
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={Ico.money(th.ac)} title={t("p143")} sub={val.b + " " + val.id.toUpperCase()} onClick={() => setShowValDD(v => !v)}
              right={<span style={{ transform: showValDD ? "rotate(90deg)" : "none", transition: MOTION.trFast("transform"), display: "flex" }}>{Ico.right(th.t2)}</span>}
              divider={showValDD} />
            {showValDD && (
              <div style={{ maxHeight: SPACE.s16 * 4 + SPACE.s4, overflowY: "auto" }}>
                {VALS.map((v, i) => (
                  <ListItem key={v.id} th={th} divider={i < VALS.length - 1}
                    icon={<span style={{ ...TYPE.subtitle, fontWeight: 700, color: val.id === v.id ? th.ac : th.t2 }}>{v.b}</span>}
                    iconTone={val.id === v.id ? th.ac : th.t2}
                    title={v.id.toUpperCase()}
                    onClick={() => { setVal(v); localStorage.setItem("oilaV7V", v.id); setShowValDD(false); }}
                    right={val.id === v.id ? Ico.check(th.ac) : <span />} />
                ))}
              </div>
            )}
          </AppCard>

          {/* Bildirishnomalar */}
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={PIco.bell(notifEnabled ? th.gr : th.t2)} iconTone={notifEnabled ? th.gr : th.t2}
              title={t("p144")}
              sub={notifEnabled ? t("p268", { time: notifTime }) : (t("p145"))}
              right={<Switch th={th} checked={!!notifEnabled} onChange={toggleNotif} label={t("p144")} />}
              divider={!!notifEnabled} />
            {notifEnabled && (
              <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{t("p146")}</div>
                <div style={{ display: "flex", gap: SPACE.s2, flexWrap: "wrap" }}>
                  {["08:00", "12:00", "18:00", "20:00", "21:00", "22:00"].map(time => (
                    <ChoiceChip key={time} th={th} on={notifTime === time} onClick={() => saveNotifTime(time)} style={{ padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", minHeight: 0 }}>{time}</ChoiceChip>
                  ))}
                </div>
              </div>
            )}
          </AppCard>

          {/* Kunlik mahalliy eslatma (faqat ota-ona) */}
          {!isKid && (
            <AppCard th={th} pad={0}>
              <ListItem th={th} icon={PIco.bell(dailyReminder.settings.enabled ? th.gr : th.t2)} iconTone={dailyReminder.settings.enabled ? th.gr : th.t2}
                title={t("p147")}
                sub={dailyReminder.settings.enabled ? t("p268", { time: String(dailyReminder.settings.hour || 20).padStart(2, "0") + ":" + String(dailyReminder.settings.minute || 0).padStart(2, "0") }) : (t("p145"))}
                right={<Switch th={th} checked={!!dailyReminder.settings.enabled} onChange={() => dailyReminder.updateReminderSettings({ ...dailyReminder.settings, enabled: !dailyReminder.settings.enabled })} label={t("p148")} />}
                divider={!!dailyReminder.settings.enabled} />
              {dailyReminder.settings.enabled && (
                <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
                  <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{t("p146")}</div>
                  <div style={{ display: "flex", gap: SPACE.s2, alignItems: "center", flexWrap: "wrap" }}>
                    {["08:00", "12:00", "18:00", "20:00", "21:00", "22:00"].map(time => {
                      const curTimeStr = String(dailyReminder.settings.hour || 20).padStart(2, "0") + ":" + String(dailyReminder.settings.minute || 0).padStart(2, "0");
                      const isSelected = curTimeStr === time;
                      return (
                        <ChoiceChip
                          key={time}
                          th={th}
                          on={isSelected}
                          onClick={() => {
                            const [h, m] = time.split(":").map(Number);
                            dailyReminder.updateReminderSettings({ ...dailyReminder.settings, hour: h, minute: m });
                          }}
                          style={{ padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", minHeight: 0 }}
                        >
                          {time}
                        </ChoiceChip>
                      );
                    })}
                    
                    {/* Custom time input */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                      <span style={{ ...TYPE.tiny, color: th.t2 }}>{t("p149")}</span>
                      <input
                        type="time"
                        value={String(dailyReminder.settings.hour || 20).padStart(2, "0") + ":" + String(dailyReminder.settings.minute || 0).padStart(2, "0")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [h, m] = val.split(":").map(Number);
                            dailyReminder.updateReminderSettings({ ...dailyReminder.settings, hour: h, minute: m });
                          }
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid " + th.bor,
                          borderRadius: RADIUS.s + "px",
                          color: th.t1,
                          padding: "4px 8px",
                          fontSize: 13,
                          fontFamily: "inherit",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </AppCard>
          )}

          {/* Premium banner */}
          <PremiumCard th={th} active={isPremium} onClick={openPremium}
            title={isPremium ? (t("p039")) : (t("p150"))}
            sub={isPremium ? (t("p151")) : (t("p152"))}
            cta={isPremium ? Ico.check(PREMIUM.gold) : <Badge th={th} type="info">{t("p047")}</Badge>} />
        </div>
      )}

      {/* ═══════════════ XAVFSIZLIK ═══════════════ */}
      {pTab === "xav" && (
        <div>
          <PageHeader th={th} title={t.xav} onBack={backToMain} />
          {fbAuth.currentUser?.providerData?.some(p => p.providerId === "password") && (
            <AppCard th={th} pad={0}>
              <ListItem th={th} icon={PIco.lock(th.ac, 18)} title={t("prof_editPassword")} sub={t("prof_editPasswordSub")}
                divider={false}
                right={
                  <SecondaryButton th={th} onClick={openPwEdit} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }}>
                    {t("p157")}
                  </SecondaryButton>
                } />
            </AppCard>
          )}
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={PIco.lock(th.ac, 18)} title={t.pin} sub={pinHash ? (t("p153")) : (t("p154"))}
              right={
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  {pinHash && pinStep === "idle" && (
                    <SecondaryButton th={th} onClick={async () => {
                      try {
                        const cur = (await db.g("security_" + user.id)) || {};
                        await db.s("security_" + user.id, { ...cur, pinHash: null, biometricEnabled: false });
                        setPinHash(null);
                        setFinger(false);
                        ok$(t("p155"));
                      } catch (e) {
                        console.error(e);
                        ok$(t("p156"), "err");
                      }
                    }} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0, borderColor: th.rd, color: th.rd }}>
                      {t("delete")}
                    </SecondaryButton>
                  )}
                  <SecondaryButton th={th} onClick={() => setPinStep(pinStep === "idle" ? "enter" : "idle")} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }}>
                    {pinStep === "idle" ? (t("p157")) : (t("cancel"))}
                  </SecondaryButton>
                </div>
              }
              divider={pinStep !== "idle"} />
            {pinStep !== "idle" && (
              <div style={{ padding: SPACE.s4 }}>
                <div style={{ ...TYPE.caption, fontWeight: 600, color: th.t2, marginBottom: SPACE.s3, textAlign: "center" }}>{pinStep === "enter" ? (t("p158")) : (t("p159"))}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s3 + 2, marginBottom: SPACE.s4 }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ width: SPACE.s3 + 2, height: SPACE.s3 + 2, borderRadius: RADIUS.full, background: (pinStep === "enter" ? pinVal : pinCfm).length > i ? th.ac : th.bor, transition: MOTION.trFast("background") }} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACE.s2 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((num, ni) => (
                    <button key={ni} className={num === "" ? undefined : "ui-press"} onClick={() => {
                      if (num === "") return;
                      const cur = pinStep === "enter" ? pinVal : pinCfm;
                      const setter = pinStep === "enter" ? setPinVal : setPinCfm;
                      if (num === "del") { setter(cur.slice(0, -1)); return; }
                      const next = cur + String(num);
                      setter(next);
                      if (next.length === 4) {
                        if (pinStep === "enter") { setTimeout(() => setPinStep("confirm"), 300); }
                        else {
                          if (next === pinVal) {
                            (async () => {
                              try {
                                const hashed = await hp(next);
                                const curData = (await db.g("security_" + user.id)) || {};
                                await db.s("security_" + user.id, { ...curData, pinHash: hashed });
                                setPinHash(hashed);
                                setPinStep("idle");
                                setPinVal("");
                                setPinCfm("");
                                ok$(t("p160"));
                              } catch (e) {
                                console.error(e);
                                ok$(t("p161"), "err");
                              }
                            })();
                          } else {
                            setPinCfm("");
                            ok$(t("p162"), "err");
                          }
                        }
                      }
                    }} aria-label={num === "del" ? (t("delete")) : String(num)}
                      style={{ background: typeof num === "number" ? th.surH : "transparent", border: typeof num === "number" ? "1px solid " + th.bor : "none", borderRadius: RADIUS.s + 2, padding: SPACE.s3 + 2 + "px", fontSize: TYPE.heading.fontSize + 1, fontWeight: 700, color: th.t1, cursor: num === "" ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", minHeight: COMP.touchMin }}>
                      {num === "del"
                        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4h9a2 2 0 012 2v8a2 2 0 01-2 2H7l-5-6 5-6z" stroke={th.rd} strokeWidth="1.4" strokeLinejoin="round"/><path d="M10.5 8l4 4M14.5 8l-4 4" stroke={th.rd} strokeWidth="1.4" strokeLinecap="round"/></svg>
                        : num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </AppCard>
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={Ico.finger(th.gr)} iconTone={th.gr} title={t.barmoq} sub={t("p163")} divider={false}
              right={<Switch th={th} checked={!!finger} onChange={async () => {
                if (!finger) {
                  // Turning ON
                  if (!pinHash) {
                    ok$(t("p164"), "err");
                    return;
                  }
                  try {
                    const result = await NativeBiometric.isAvailable();
                    if (!result.isAvailable) {
                      ok$(t("p165"), "err");
                      return;
                    }
                    await NativeBiometric.verifyIdentity({
                      reason: t("p166"),
                      title: t("p167"),
                      subtitle: t("p168"),
                      description: t("p169")
                    });
                    const curData = (await db.g("security_" + user.id)) || {};
                    await db.s("security_" + user.id, { ...curData, biometricEnabled: true });
                    setFinger(true);
                    ok$(t("p170"));
                  } catch (e) {
                    console.error("Biometrics activation failed", e);
                    ok$(t("p171"), "err");
                  }
                } else {
                  // Turning OFF
                  try {
                    const curData = (await db.g("security_" + user.id)) || {};
                    await db.s("security_" + user.id, { ...curData, biometricEnabled: false });
                    setFinger(false);
                    ok$(t("p172"));
                  } catch (e) {
                    console.error("Biometrics deactivation failed", e);
                    ok$(t("p173"), "err");
                  }
                }
              }} label={t.barmoq} />} />
          </AppCard>
        </div>
      )}

      {/* ═══════════════ YORDAM / FAQ / FIKR ═══════════════ */}
      {pTab === "qol" && (
        <div>
          <PageHeader th={th} title={t.qol} onBack={backToMain} />
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <AppCard th={th} pad={0}>
              <ListItem th={th} icon={PIco.send(th.ac, 20)} title={t.tgBot} sub="@oila_hisobchi_bot" right={Ico.right(th.t2)} divider={false} />
            </AppCard>
          </a>

          <SectionHeader th={th}>{t.faq}</SectionHeader>
          {FAQS[lg].map((item, i) => (
            <AppCard key={i} th={th} pad={0} style={{ marginBottom: SPACE.s2, overflow: "hidden" }}>
              <ListItem th={th} title={item.q} onClick={() => setFaqO(faqO === i ? null : i)}
                right={Ico.chevron(th.ac, faqO === i)} divider={faqO === i}
                style={{ background: faqO === i ? th.ac + ALPHA.soft : "transparent" }} />
              {faqO === i && <div style={{ background: th.surH, padding: SPACE.s3 + "px " + SPACE.s4 + "px", ...TYPE.caption, color: th.t2, lineHeight: 1.75 }}>{item.a}</div>}
            </AppCard>
          ))}

          <SectionHeader th={th}>{t("p174")}</SectionHeader>
          <AppCard th={th}>
            <SubHeader th={th}>{t("p175")}</SubHeader>
            <div style={{ ...TYPE.caption, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{t("p176")}</div>
            <div style={{ display: "flex", gap: SPACE.s2, justifyContent: "center", marginBottom: SPACE.s4 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="ui-press" onClick={() => setFbRating(star)} aria-label={(t("p177")) + star}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  {PIco.starFill(star <= fbRating ? PREMIUM.gold : th.t2, 34, star <= fbRating)}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              {[{ id: "taklif", l: t("p178") }, { id: "xato", l: t("p179") }, { id: "boshqa", l: t("p180") }].map(ty => (
                <ChoiceChip key={ty.id} th={th} on={fbType === ty.id} onClick={() => setFbType(ty.id)} style={{ flex: 1 }}>{ty.l}</ChoiceChip>
              ))}
            </div>
            <TextArea th={th} value={fbText} onChange={setFbText} placeholder={t("p181")} />
            <LoadingButton th={th} loading={fbSending} loadingText={t("p182")} onClick={sendFeedback}>
              {PIco.send("#fff", 18)}{t("p183")}
            </LoadingButton>
          </AppCard>
        </div>
      )}

      {pTab === "garden" && <Garden user={user} lg={lg} dark={dark} onBack={backToMain} addCoin={addStar} stars={stars} />}

      {/* ═══════════════ BOLA AKKAUNTI — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showAddKid} onClose={closeAddKid} title={t("p184")}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
          <div style={{ width: SPACE.s16, height: SPACE.s16, borderRadius: RADIUS.full, background: th.am + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIco.baby(th.am, 32)}</div>
        </div>
        <div style={{ ...TYPE.caption, color: th.t2, textAlign: "center", marginBottom: SPACE.s4, lineHeight: 1.5 }}>{t("p185")}</div>
        <TextInput th={th} label={(t("p186")) + " *"} value={kidName} onChange={v => { setKidName(v); setKidErr(e => ({ ...e, name: "" })); }} placeholder={t("p187")} error={kidErr.name} />
        <TextInput th={th} label={(t("p130")) + " *"} value={kidSurname} onChange={v => { setKidSurname(v); setKidErr(e => ({ ...e, surname: "" })); }} placeholder={t("p188")} error={kidErr.surname} />
        <TextInput th={th} label={(t("p189")) + " *"} value={kidBirthYear} onChange={v => { setKidBirthYear(v.replace(/\D/g, "").slice(0, 4)); setKidErr(e => ({ ...e, birth: "" })); }} placeholder={String(new Date().getFullYear() - 10)} inputMode="numeric" error={kidErr.birth} />
        {/* Jinsi — ixtiyoriy (qayta bosilsa bekor bo'ladi) */}
        <div style={{ marginBottom: SPACE.s3 }}>
          <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{t("p190")}</div>
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            {[{ id: "ogil", l: t("p191") }, { id: "qiz", l: t("p192") }].map(g => (
              <ChoiceChip key={g.id} th={th} on={kidGender === g.id} onClick={() => setKidGender(kidGender === g.id ? "" : g.id)} style={{ flex: 1 }}>{g.l}</ChoiceChip>
            ))}
          </div>
        </div>
        <TextInput th={th} label={t("p193")} value={kidGrade} onChange={v => { setKidGrade(v.replace(/\D/g, "").slice(0, 2)); setKidErr(e => ({ ...e, grade: "" })); }} placeholder={t("p194")} inputMode="numeric" error={kidErr.grade} />
        <TextInput th={th} label="Login *" value={kidLogin} onChange={v => { setKidLogin(v.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()); setKidErr(e => ({ ...e, login: "" })); }} placeholder="jahongir2015" error={kidErr.login} />
        <TextInput th={th} label={(t("p195")) + " *"} value={kidPw} onChange={v => { setKidPw(v); setKidErr(e => ({ ...e, pw: "" })); }} placeholder={t("p030")} error={kidErr.pw} />
        
        {/* Ota-ona roziligi oqimi (Parental Consent Flow) */}
        <div style={{ margin: `${SPACE.s3}px 0`, padding: SPACE.s3, background: th.bg + ALPHA.soft, borderRadius: RADIUS.s, border: "1.5px solid " + (parentalConsentErr ? th.er : th.bor), transition: "all 0.2s" }}>
          <label style={{ display: "flex", gap: SPACE.s2, cursor: "pointer", alignItems: "flex-start", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={parentalConsent}
              onChange={e => { setParentalConsent(e.target.checked); if (e.target.checked) setParentalConsentErr(""); }}
              style={{ marginTop: 3, width: 18, height: 18, accentColor: th.ac, cursor: "pointer" }}
            />
            <span style={{ ...TYPE.tiny, color: th.t1, textTransform: "none", letterSpacing: 0, lineHeight: 1.4 }}>
              {t("p275")}
              <a href={"/privacy.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.ac, fontWeight: 700, textDecoration: "underline" }}>{t("p084")}</a>,{" "}
              <a href={"/terms.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.ac, fontWeight: 700, textDecoration: "underline" }}>{t("p086")}</a>
              {t("p277")}
              <a href={"/child-safety.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.ac, fontWeight: 700, textDecoration: "underline" }}>{t("p088")}</a>.
            </span>
          </label>
          {parentalConsentErr && (
            <div style={{ color: th.er, ...TYPE.tiny, fontWeight: 600, marginTop: SPACE.s2 }}>
              {parentalConsentErr}
            </div>
          )}
        </div>

        <PrimaryButton th={th} onClick={submitKid} style={{ marginTop: SPACE.s1 }}>{t("p196")}</PrimaryButton>
      </BottomSheet>

      {/* ═══════════════ REFERRAL — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showReferral} onClose={closeReferral} title={t("p197")}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
          <div style={{ width: SPACE.s16, height: SPACE.s16, borderRadius: RADIUS.full, background: PREMIUM.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e1(PREMIUM.deep) }}>{PIco.gift("#fff", 30)}</div>
        </div>
        <div style={{ ...TYPE.caption, color: th.t2, textAlign: "center", marginBottom: SPACE.s4 }}>{t("p198")}</div>

        {/* Natija */}
        <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1.5px solid " + th.gr + ALPHA.med }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3 }}>
            <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("p199")}</span>
            <span style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontVariantNumeric: "tabular-nums" }}>{refCount}/3</span>
          </div>
          <LinearProgress th={th} value={Math.min(100, (refCount / 3) * 100)} tone={th.gr} height={SPACE.s2} style={{ marginBottom: SPACE.s2 + 2 }} />
          <div style={{ ...TYPE.caption, color: th.t2 }}>{refCount >= 3 ? (t("p200")) : t("p269", { count: 3 - refCount })}</div>
        </AppCard>

        {/* Havola */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{t("p071")}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
          <div style={{ flex: 1, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: RADIUS.s + 2, padding: SPACE.s3 + "px " + SPACE.s3 + "px", ...TYPE.caption, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", minWidth: 0 }}>{(window.location.origin + "/?ref=") + (user?.id || "")}</div>
          <SecondaryButton th={th} onClick={copyRefLink} style={{ width: "auto", padding: "0 " + SPACE.s4 + "px", flexShrink: 0, fontSize: TYPE.caption.fontSize + 1 }}>{t("p066")}</SecondaryButton>
        </div>

        {/* Do'stni taklif qilish */}
        <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.family(th.ac)}{t("p201")}</div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s2 + 2 }}>{t("p202")}</div>
          <PrimaryButton th={th} onClick={tgInviteFriend} style={{ padding: (SPACE.s2 + 3) + "px", fontSize: TYPE.caption.fontSize + 1 }}>{PIco.send("#fff")}{t("p072")}</PrimaryButton>
        </AppCard>

        {/* Oila a'zosini taklif qilish */}
        {user?.rol === "bosh" && (
          <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
            <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.family(th.gr)}{t("p203")}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s2 + 2 }}>{t("p204")}</div>
            <div style={{ background: th.bg, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s2 + 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{t("fc2")}</span>
              <span style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontFamily: "monospace", letterSpacing: 1 }}>{user?.oilaId}</span>
            </div>
            <SecondaryButton th={th} onClick={tgInviteFamily} style={{ background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong, fontSize: TYPE.caption.fontSize + 1 }}>{PIco.send(th.gr)}{t("p205")}</SecondaryButton>
          </AppCard>
        )}

        {/* Imtiyozlar */}
        <AppCard th={th} style={{ background: th.surH, border: "none" }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: SPACE.s2 + 2 }}>{t("p206")}</div>
          {[{ n: 1, t: t("p207") }, { n: 3, t: t("p208") }, { n: 10, t: t("p209") }].map(r => (
            <div key={r.n} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 }}>
              <div style={{ width: SPACE.s6 + 2, height: SPACE.s6 + 2, borderRadius: RADIUS.s - 2, background: refCount >= r.n ? th.gr + ALPHA.med : th.bor, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.caption, fontWeight: 800, color: refCount >= r.n ? th.gr : th.t2, flexShrink: 0 }}>{refCount >= r.n ? Ico.check(th.gr) : r.n}</div>
              <span style={{ ...TYPE.caption, color: refCount >= r.n ? th.t1 : th.t2, fontWeight: refCount >= r.n ? 600 : 400 }}>{r.t}</span>
            </div>
          ))}
        </AppCard>

        <GhostButton th={th} onClick={closeReferral}>{t("p210")}</GhostButton>
      </BottomSheet>

      {/* ═══════════════ MA'LUMOTLARNI TOZALASH — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showClean} onClose={closeClean} title={t("p079")}>
        <WarningCard th={th} tone="danger" icon={PIco.warn(th.rd, 18)} title={t("p211")}>
          {t("p212")}
        </WarningCard>

        {/* Qamrov: faqat men / butun oila (oila boshi) */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{t("p213")}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <ChoiceChip th={th} on={!clnFam} onClick={() => setClnFam(false)} style={{ flex: 1 }}>{t("p214")}</ChoiceChip>
          {user?.rol === "bosh" && <ChoiceChip th={th} on={clnFam} onClick={() => setClnFam(true)} style={{ flex: 1 }}>{t("p215")}</ChoiceChip>}
        </div>

        {/* Davr: hammasi / sana oralig'i */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{t("p216")}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <ChoiceChip th={th} on={clnAll} onClick={() => setClnAll(true)} style={{ flex: 1 }}>{t("all_label")}</ChoiceChip>
          <ChoiceChip th={th} on={!clnAll} onClick={() => setClnAll(false)} style={{ flex: 1 }}>{t("p217")}</ChoiceChip>
        </div>
        {!clnAll && (
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{t("p218")}</div>
              <input type="date" value={clnFrom} onChange={e => setClnFrom(e.target.value)}
                style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: COMP.inputPad, color: th.t1, fontSize: TYPE.caption.fontSize + 1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{t("p219")}</div>
              <input type="date" value={clnTo} onChange={e => setClnTo(e.target.value)}
                style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: COMP.inputPad, color: th.t1, fontSize: TYPE.caption.fontSize + 1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
        )}
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginBottom: SPACE.s3, lineHeight: 1.5 }}>
          {t("p220")}
        </div>
        <DangerButton th={th} solid onClick={() => {
          if (!clnAll && !clnFrom && !clnTo) { setClnAll(true); }
          setClnAsk(true);
        }} style={{ marginBottom: SPACE.s2 }}>{Ico.trash("#fff")}{t("delete")}</DangerButton>
        <GhostButton th={th} onClick={closeClean}>{t("p221")}</GhostButton>
      </BottomSheet>

      {/* Tozalash — yakuniy tasdiq */}
      <ConfirmDialog th={th} open={!!clnAsk} onClose={() => setClnAsk(false)} onConfirm={doPurge}
        title={t("p222")}
        message={(clnFam ? (t("p223")) : (t("p224")))
          + (clnAll ? (t("p225")) : t("p279", { from: clnFrom || "…", to: clnTo || "…" }))
          + (t("p226"))}
        confirmText={t("p227")} cancelText={t("p221")} />

      {/* Bola akkauntini o'chirish — tasdiq */}
      <ConfirmDialog th={th} open={!!kidDel} onClose={() => setKidDel(null)}
        onConfirm={() => { const k = kidDel; setKidDel(null); delKidAccount(k); }}
        title={t("p228")}
        message={kidDel ? t("p280", { name: kidDel.ism, login: kidDel.login || "—" }) : ""}
        confirmText={t("p227")} cancelText={t("p221")} />

      {/* Hisobni o'chirish oqimi */}
      <BottomSheet th={th} open={showDeleteAccount} onClose={() => deleteAccountStep !== "loading" && setShowDeleteAccount(false)} title={t("p229")}>
        <div style={{ padding: SPACE.s2 }}>
          {deleteAccountStep === "info" && (
            <>
              <div style={{ ...TYPE.subtitle, color: th.rd, fontWeight: 700, marginBottom: SPACE.s3 }}>
                {t("p230")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
                {[
                  t("p231"),
                  t("p232"),
                  t("p233"),
                  t("p234"),
                  t("p235"),
                  t("p236"),
                  t("p237"),
                  t("p238")
                ].map((item, index) => (
                  <div key={index} style={{ ...TYPE.caption, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1, fontWeight: 600 }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ ...TYPE.caption, color: th.t2, marginBottom: SPACE.s4, lineHeight: 1.5 }}>
                {t("p239")}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
                <DangerButton th={th} solid onClick={handleDeleteAccountContinue}>
                  {t("p240")}
                </DangerButton>
                <GhostButton th={th} onClick={() => setShowDeleteAccount(false)}>
                  {t("p221")}
                </GhostButton>
              </div>
            </>
          )}

          {deleteAccountStep === "password" && (
            <>
              <div style={{ ...TYPE.caption, color: th.t2, marginBottom: SPACE.s3, lineHeight: 1.5 }}>
                {t("p241")}
              </div>
              <TextInput
                th={th}
                type="password"
                label={t("p195")}
                value={deleteConfirmPw}
                onChange={setDeleteConfirmPw}
                placeholder={t("p242")}
                error={deletePwErr}
              />
              
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginTop: SPACE.s4 }}>
                <DangerButton th={th} solid onClick={handleDeleteAccountFinal}>
                  {t("delete")}
                </DangerButton>
                <GhostButton th={th} onClick={() => setDeleteAccountStep("info")}>
                  {t("p243")}
                </GhostButton>
              </div>
            </>
          )}

          {deleteAccountStep === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, padding: SPACE.s4 + "px 0", alignItems: "center", justifyContent: "center" }}>
              <LinearProgress th={th} />
              <div style={{ ...TYPE.caption, color: th.t2, fontWeight: 600, textAlign: "center" }}>
                {t("p244")}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      <BottomSheet th={th} open={showPwEdit} onClose={() => !pwLoading && setShowPwEdit(false)} title={t("prof_editPassword")}>
        <div style={{ padding: SPACE.s2 }}>
          {pwLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, padding: SPACE.s4 + "px 0", alignItems: "center", justifyContent: "center" }}>
              <LinearProgress th={th} />
            </div>
          ) : (
            <>
              <TextInput th={th} type="password" label={t("prof_pwCurrent")} value={pwCur} onChange={setPwCur} />
              <TextInput th={th} type="password" label={t("prof_pwNew")} value={pwNew} onChange={setPwNew} />
              <TextInput th={th} type="password" label={t("prof_pwNewConfirm")} value={pwNewCfm} onChange={setPwNewCfm} />
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginTop: SPACE.s4 }}>
                <PrimaryButton th={th} onClick={submitPwChange}>{t("save")}</PrimaryButton>
                <GhostButton th={th} onClick={() => setShowPwEdit(false)}>{t("p221")}</GhostButton>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
