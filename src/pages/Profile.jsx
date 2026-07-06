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
  user, oila, azolar, xar, qarzlar, maq,
  isPremium, isKid, isAdmin,
  th, t, f, lg, dark, val, setVal, setLg, setDark,
  bX, bD,
  ok$, buzz, addStar,
  pTab, setPTab,
  edN, setEdN, newN, setNewN, updName,
  edT, setEdT, newT, setNewT, saveTel,
  fBj, setFBj, fKL, setFKL, saveBj,
  faqO, setFaqO,
  pinStep, setPinStep, pinVal, setPinVal, pinCfm, setPinCfm,
  finger, setFinger,
  showAddKid, setShowAddKid, kidName, setKidName, kidSurname, setKidSurname, kidBirthYear, setKidBirthYear, kidGender, setKidGender, kidGrade, setKidGrade, kidLogin, setKidLogin, kidPw, setKidPw, addKidAccount, delKidAccount, purgeData,
  showReferral, setShowReferral, refCount,
  fbRating, setFbRating, fbText, setFbText, fbType, setFbType, fbSending, sendFeedback,
  adminStats, adminLoad, loadAdminStats,
  waterGarden, gardenData, stars,
  activatePremium, setShowPremModal,
  logout,
  fRef, doPhoto, rmPhoto,
  toggleReportAccess,
  notifEnabled, toggleNotif, notifTime, saveNotifTime,
  APP_VER,
  showValDD, setShowValDD,
  showBilim, setShowBilim,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const uz = lg === "uz";

  // ═══ Statistika — faqat mavjud ma'lumotlardan, og'ir hisob memoizatsiya qilingan ═══
  const pStats = useMemo(() => {
    const myXar = (xar || []).filter(x => x.uid === user?.id);
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
    };
  }, [xar, maq, qarzlar, gardenData, user?.id, user?.registeredAt]);

  // ═══ Yutuqlar — mavjud real ko'rsatkichlardan hosilaviy (persist YO'Q) ═══
  const achievements = useMemo(() => [
    { id: "first",  icon: PIco.list,   title: uz ? "Ilk qadam" : "First step",       desc: uz ? "Birinchi yozuv" : "First record",       cur: pStats.txCount,     goal: 1,  onTap: null },
    { id: "loyal",  icon: PIco.cal,    title: uz ? "Sodiq foydalanuvchi" : "Loyal",  desc: uz ? "30 kun ilovada" : "30 days in app",     cur: pStats.days,        goal: 30, onTap: null },
    { id: "writer", icon: PIco.trophy, title: uz ? "Faol hisobchi" : "Active",       desc: uz ? "50 ta yozuv" : "50 records",            cur: pStats.txCount,     goal: 50, onTap: null },
    { id: "stars",  icon: PIco.star,   title: uz ? "Yulduz yig'uvchi" : "Stargazer", desc: uz ? "25 yulduzcha" : "25 stars",             cur: stars || 0,         goal: 25, onTap: null },
    { id: "garden", icon: PIco.leaf,   title: uz ? "Bog'bon" : "Gardener",           desc: uz ? "Bog' 3-daraja" : "Garden level 3",      cur: pStats.gardenLevel, goal: 3,  onTap: "garden" },
    { id: "invite", icon: PIco.gift,   title: uz ? "Taklifchi" : "Inviter",          desc: uz ? "3 ta do'st" : "3 friends",              cur: refCount || 0,      goal: 3,  onTap: isKid ? null : "referral" },
  ], [uz, pStats, stars, refCount, isKid]);

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
  const submitKid = useCallback(() => {
    const nowY = new Date().getFullYear();
    const by = Number(kidBirthYear);
    const e = {};
    if (kidName.trim().length < 2)    e.name    = uz ? "Kamida 2 belgi" : "Min 2 chars";
    if (kidSurname.trim().length < 2) e.surname = uz ? "Kamida 2 belgi" : "Min 2 chars";
    if (!/^\d{4}$/.test(String(kidBirthYear))) e.birth = uz ? "4 raqamli yil kiriting" : "Enter a 4-digit year";
    else if (by < nowY - 17 || by > nowY - 3)   e.birth = uz ? "Bola 3–17 yoshda bo'lishi kerak" : "Age must be 3–17";
    if (kidGrade !== "" && (Number(kidGrade) < 1 || Number(kidGrade) > 11)) e.grade = uz ? "1 dan 11 gacha" : "1 to 11";
    if (kidLogin.trim().length < 3)   e.login   = uz ? "Kamida 3 belgi" : "Min 3 chars";
    if (kidPw.length < 4)             e.pw      = uz ? "Kamida 4 belgi" : "Min 4 chars";
    setKidErr(e);
    if (Object.keys(e).length) { buzz(20); return; }
    addKidAccount();
  }, [kidName, kidSurname, kidBirthYear, kidGrade, kidLogin, kidPw, uz, buzz, addKidAccount]);
  const openBilim    = useCallback(() => { buzz(10); setShowBilim(true); }, [buzz, setShowBilim]);
  const openGarden   = useCallback(() => setPTab("garden"), [setPTab]);
  const closeAddKid  = useCallback(() => { setShowAddKid(false); setKidErr({}); }, [setShowAddKid]);
  const closeReferral= useCallback(() => setShowReferral(false), [setShowReferral]);
  const backToMain   = useCallback(() => setPTab("main"), [setPTab]);
  const pickPhoto    = useCallback(() => fRef.current?.click(), [fRef]);

  const achTap = useCallback(tap => {
    if (tap === "garden") setPTab("garden");
    else if (tap === "referral") setShowReferral(true);
  }, [setPTab, setShowReferral]);

  // Oila kodini nusxalash — mavjud logika 1:1 saqlangan
  const copyFamCode = useCallback(async () => {
    const code = user?.oilaId || "";
    if (!code) { ok$(uz ? "Oila kodi topilmadi" : "No family code", "err"); return; }
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
    if (done) ok$(uz ? "Oila kodi nusxalandi" : "Family code copied");
    else ok$(uz ? "Nusxalab bo'lmadi" : "Copy failed", "err");
  }, [user?.oilaId, uz, ok$, buzz]);

  // Oila kodini ulashish — mavjud logika 1:1 saqlangan
  const shareFamCode = useCallback(async () => {
    const code = user?.oilaId || "";
    if (!code) { ok$(uz ? "Oila kodi topilmadi" : "No family code", "err"); return; }
    buzz(10);
    const txt = uz ? "Oila Hisobchi ilovasiga qo'shiling! Oila kodi: " + code : "Join Oila Hisobchi! Family code: " + code;
    if (navigator.share) {
      try { await navigator.share({ title: "Oila Hisobchi", text: txt }); } catch (e) { /* foydalanuvchi bekor qildi */ }
    } else {
      try { await navigator.clipboard.writeText(txt); ok$(uz ? "Oila kodi nusxalandi" : "Family code copied"); }
      catch (e) { ok$(uz ? "Ulashib bo'lmadi" : "Share failed", "err"); }
    }
  }, [user?.oilaId, uz, ok$, buzz]);

  const copyRefLink = useCallback(() => {
    const link = (window.location.origin + "/?ref=") + (user?.id || "");
    try { navigator.clipboard.writeText(link); ok$(uz ? "Havola nusxalandi!" : "Link copied!"); }
    catch (e) { ok$(uz ? "Nusxalab bo'lmadi" : "Copy failed", "err"); }
  }, [user?.id, uz, ok$]);

  const tgInviteFriend = useCallback(() => {
    const link = (window.location.origin + "/?ref=") + (user?.id || "");
    const txt = (uz ? "Oila Hisobchi - oilaviy byudjet ilovasi! Men bilan qo'shiling: " : "Join me on Family Budget app: ") + link;
    const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt);
    window.open(url, "_blank");
  }, [user?.id, uz]);

  const tgInviteFamily = useCallback(() => {
    const code = user?.oilaId || "";
    const link = (window.location.origin + "/?ref=") + (user?.id || "") + "&fam=" + code;
    const txt = (uz ? "Bizning oilamizga qo'shiling! Oila kodi: " + code + "\n" : "Join our family! Family code: " + code + "\n") + link;
    const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt);
    window.open(url, "_blank");
  }, [user?.id, user?.oilaId, uz]);

  // Hero uchun oq-alpha (kit Dashboard Hero precedenti)
  const heroSoft = "rgba(255,255,255,0.16)";
  const heroText = "rgba(255,255,255,0.75)";

  return (
    <div>
      {pTab === "main" && (
        <div>
          <PageHeader th={th} title={t.prf} />

          {/* ═══ 1. HERO — sahifadagi yagona gradient ═══ */}
          <div className="ui-fadeUp" style={{ background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", borderRadius: RADIUS.l, padding: SPACE.s4 + SPACE.s1 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(th.ac) }}>
            <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s12, width: SPACE.s16 * 2 + SPACE.s6, height: SPACE.s16 * 2 + SPACE.s6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -SPACE.s12, left: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 + 2, position: "relative" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {/* Premium halo — UIAvatar variant orqali */}
                <UIAvatar th={th} src={user?.photo} name={user?.ism} size={SPACE.s16} variant={isPremium ? "premium" : undefined} />
                <button className="ui-press" onClick={pickPhoto} aria-label={t.up}
                  style={{ position: "absolute", bottom: -2, right: -2, width: SPACE.s6, height: SPACE.s6, borderRadius: RADIUS.full, background: th.sur, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e2 }}>
                  {Ico.camera(th.ac)}
                </button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.ism}</div>
                <div style={{ ...TYPE.caption, color: heroText, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ display: "flex", gap: SPACE.s1 + 2, marginTop: SPACE.s2, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: heroSoft, borderRadius: RADIUS.pill, padding: "3px 10px", ...TYPE.caption, fontWeight: 600, color: "#fff" }}>
                    {user?.rol === "bosh" ? Ico.crown("#fff") : Ico.user("#fff")}
                    {user?.rol === "bosh" ? (uz ? "Oila boshlig'i" : "Family head") : (uz ? "A'zo" : "Member")}
                  </span>
                  {isPremium
                    ? <Badge th={th} type="premium">Premium</Badge>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: heroSoft, borderRadius: RADIUS.pill, padding: "3px 10px", ...TYPE.caption, fontWeight: 700, color: "#fff" }}>{PIco.gem("#fff", 12)}{uz ? "Bepul" : "Free"}</span>}
                </div>
              </div>
            </div>
            {/* Edit Profile */}
            <button className="ui-press" onClick={openEdit}
              style={{ width: "100%", marginTop: SPACE.s3 + 2, background: heroSoft, border: "1px solid rgba(255,255,255,0.25)", borderRadius: RADIUS.s + 2, padding: (SPACE.s2 + 2) + "px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize + 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2, position: "relative" }}>
              {Ico.edit("#fff")}{uz ? "Profilni tahrirlash" : "Edit profile"}
            </button>
          </div>

          {/* ═══ 2. QUICK STATS — animatsiyali counter ═══ */}
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2 }}>
            <AnimatedStat th={th} icon={PIco.cal(th.ac)} value={pStats.days} label={uz ? "Kun" : "Days"} />
            <AnimatedStat th={th} icon={PIco.star(PREMIUM.gold)} value={stars || 0} label={uz ? "Yulduz" : "Stars"} tone={PREMIUM.gold} />
            <AnimatedStat th={th} icon={PIco.leaf(th.gr)} value={pStats.gardenLevel} label={uz ? "Bog'" : "Garden"} tone={th.gr} onClick={openGarden} />
            <AnimatedStat th={th} icon={PIco.gift(th.ac)} value={refCount || 0} label={uz ? "Taklif" : "Invites"} onClick={!isKid ? openReferral : undefined} />
          </div>

          {/* ═══ 3. ACHIEVEMENTS — horizontal scroll, collectible ═══ */}
          <SectionHeader th={th}>{uz ? "Yutuqlar" : "Achievements"}</SectionHeader>
          <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, marginBottom: SPACE.s2, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {achievements.map(a => (
              <AchCard key={a.id} th={th}
                icon={a.icon(a.cur >= a.goal ? "#fff" : th.t3, 20)}
                title={a.title} desc={a.desc} cur={a.cur} goal={a.goal}
                unlocked={a.cur >= a.goal} doneLabel={uz ? "Olindi" : "Done"}
                onClick={a.onTap ? () => achTap(a.onTap) : undefined} />
            ))}
          </div>

          {/* ═══ 4. PREMIUM — kit PremiumCard ═══ */}
          <PremiumCard th={th} active={isPremium} onClick={openPremium}
            title={isPremium ? (uz ? "Premium faol" : "Premium active") : (uz ? "Premium'ga o'ting" : "Upgrade to Premium")}
            sub={isPremium ? (uz ? "Barcha funksiyalar ochiq" : "All features unlocked") : (uz ? "Barcha imkoniyatlarni oching" : "Unlock everything")}
            features={isPremium ? [] : [
              uz ? "Cheksiz maqsad" : "Unlimited goals",
              uz ? "PDF/Excel eksport" : "PDF/Excel export",
              uz ? "Cheksiz a'zo" : "Unlimited members",
              uz ? "Ovoz kiritish" : "Voice input",
            ]}
            cta={isPremium
              ? <Badge th={th} type="premium" icon={null}>{uz ? "Faol" : "Active"}</Badge>
              : <Badge th={th} type="info">{uz ? "Ochish" : "Unlock"}</Badge>} />

          {/* ═══ 5. FAMILY — a'zolar kartasi ═══ */}
          {azolar.length > 0 && (
            <>
              <SectionHeader th={th}>{uz ? "Oila" : "Family"}{oila?.nomi ? " · " + oila.nomi : ""}</SectionHeader>
              <AppCard th={th} pad={0}>
                {azolar.map((a, i) => {
                  const rel = RELATIONS.find(r => r.id === a.rel);
                  const isHead = a.rol === "bosh";
                  const isChild = a.rol === "kid";
                  const me = a.id === user?.id;
                  return (
                    <MemberRow key={a.id} th={th} photo={a.photo} name={a.ism + (me ? " (" + t.me + ")" : "")}
                      sub={rel ? (rel[lg] || rel.uz) : (isHead ? t.hd : t.mb2)}
                      variant={isChild ? "kid" : (isHead && isPremium ? "premium" : undefined)}
                      divider={i < azolar.length - 1}
                      badge={
                        <span style={{ display: "inline-flex", gap: SPACE.s1, flexShrink: 0 }}>
                          {me && <Badge th={th} type="success">{uz ? "Onlayn" : "Online"}</Badge>}
                          {isChild && <Badge th={th} type="warning">{uz ? "Bola" : "Kid"}</Badge>}
                          {isHead
                            ? <Badge th={th} type="role" icon={Ico.crown(th.ac)}>{uz ? "Oila boshi" : "Owner"}</Badge>
                            : !isChild && <Badge th={th} tone={th.t2}>{t.mb2}</Badge>}
                        </span>
                      } />
                  );
                })}
              </AppCard>
            </>
          )}

          {/* ═══ 6. REFERRAL — kompakt karta (gradientsiz) ═══ */}
          {!isKid && (
            <AppCard th={th} pad={0}>
              <ListItem th={th} divider={false} onClick={openReferral}
                icon={PIco.gift(th.gr)} iconTone={th.gr}
                title={uz ? "Do'stlarni taklif qiling" : "Invite friends"}
                sub={uz ? "3 ta do'st = 1 oy Premium bepul" : "3 friends = 1 month free Premium"}
                right={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s2 }}><Badge th={th} type="status" tone={th.gr}>{refCount || 0}/3</Badge></span>} />
            </AppCard>
          )}

          {/* ═══ 7. SETTINGS — 4 guruh, faqat kit SettingRow ═══ */}
          <SectionHeader th={th}>{uz ? "Hisob" : "Account"}</SectionHeader>
          <AppCard th={th} pad={0}>
            <SettingRow th={th} icon={Ico.user(th.ac)} title={t.shaxsiy} sub={uz ? "Ism, telefon, oila a'zolari" : "Name, phone, family"} onClick={openEdit} divider={user?.rol === "bosh" || !isKid} />
            {user?.rol === "bosh" && <SettingRow th={th} icon={Ico.wallet(th.ac)} title={uz ? "Budjet va limitlar" : "Budget & limits"} sub={uz ? "Oylik chegara, kategoriya limitlari" : "Monthly cap, category limits"} onClick={() => setPTab("budjet")} divider={!isKid} />}
            {!isKid && <SettingRow th={th} icon={PIco.baby(th.ac)} title={uz ? "Bola akkaunti qo'shish" : "Add kid account"} sub={uz ? "Farzandingizga login yarating" : "Create a login for your child"} onClick={openAddKid} divider={false} />}
          </AppCard>

          <SectionHeader th={th}>{uz ? "Xavfsizlik" : "Security"}</SectionHeader>
          <AppCard th={th} pad={0}>
            <SettingRow th={th} icon={Ico.shield(th.ac)} title={t.xav} sub={uz ? "PIN, biometrika" : "PIN, biometrics"} onClick={() => setPTab("xav")} divider={false} />
          </AppCard>

          <SectionHeader th={th}>{uz ? "Ilova" : "App"}</SectionHeader>
          <AppCard th={th} pad={0}>
            <SettingRow th={th} icon={Ico.settings(th.ac)} title={t.ilovaS} sub={uz ? "Til, valyuta, mavzu, bildirishnoma" : "Language, currency, theme"} onClick={() => setPTab("ilovaS")} />
            <SettingRow th={th} icon={PIco.leaf(th.gr)} iconTone={th.gr} title={uz ? "Baraka Bog'i" : "Baraka Garden"} sub={uz ? "Yulduzcha bilan bog'ni o'stiring" : "Grow your garden with stars"} onClick={openGarden} />
            <SettingRow th={th} icon={PIco.book(th.ac)} title={uz ? "Bilim Bozori" : "Knowledge Market"} sub={uz ? "Moliyaviy savodxonlik" : "Financial literacy"} onClick={openBilim} divider={false} />
          </AppCard>

          <SectionHeader th={th}>{uz ? "Ma'lumot" : "About"}</SectionHeader>
          <AppCard th={th} pad={0}>
            <SettingRow th={th} icon={Ico.help(th.ac)} title={t.qol} sub={uz ? "FAQ, Telegram bot, fikr bildirish" : "FAQ, Telegram, feedback"} onClick={() => setPTab("qol")} />
            <SettingRow th={th} icon={Ico.version(th.ac)} title={t.ver} divider={false} right={<span style={{ ...TYPE.caption, fontWeight: 600, color: th.t2 }}>v{APP_VER}</span>} />
          </AppCard>

          {/* ═══ 8. DANGER ZONE — eng pastda ═══ */}
          <SectionHeader th={th}>{uz ? "Xavfli hudud" : "Danger zone"}</SectionHeader>
          <AppCard th={th} pad={0} style={{ border: "1px solid " + th.rd + ALPHA.med }}>
            <SettingRow th={th} danger icon={Ico.trash(th.rd)} title={uz ? "Ma'lumotlarni tozalash" : "Clear data"} sub={uz ? "Yozuvlarni butunlay yoki sana bo'yicha o'chirish" : "Delete records entirely or by date range"} onClick={openClean} divider={false} />
          </AppCard>
          <DangerButton th={th} onClick={logout}>{Ico.door(th.rd)}{t.lo}</DangerButton>
          <div style={{ textAlign: "center", ...TYPE.tiny, letterSpacing: 0.4, textTransform: "none", color: th.t3, marginTop: SPACE.s3, marginBottom: SPACE.s1 }}>Oila Hisobchi · v{APP_VER}</div>
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
              <div>
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: 2 }}>{uz ? "Ism" : "Name"}</div>
                <div style={{ ...TYPE.subtitle, color: th.t1 }}>{user?.ism}</div>
              </div>
              <SecondaryButton th={th} onClick={() => { setEdN(v => !v); setNewN(user?.ism || ""); }} style={{ width: "auto", padding: (SPACE.s1 + 2) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize }}>{Ico.edit(th.ac)}{edN ? t.cn : t.ep}</SecondaryButton>
            </div>
            {edN && (
              <div>
                <TextInput th={th} value={newN} onChange={setNewN} placeholder={uz ? "Ism" : "Name"} autoFocus />
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
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: 2 }}>{uz ? "Telefon" : "Phone"}</div>
                <div style={{ ...TYPE.subtitle, color: user?.tel ? th.t1 : th.t2 }}>{user?.tel || (uz ? "Kiritilmagan" : "Not set")}</div>
              </div>
              <SecondaryButton th={th} onClick={() => { setEdT(v => !v); setNewT(user?.tel || ""); }} style={{ width: "auto", padding: (SPACE.s1 + 2) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize }}>{Ico.edit(th.ac)}{edT ? t.cn : (user?.tel ? t.ep : (uz ? "Qo'shish" : "Add"))}</SecondaryButton>
            </div>
            {edT && (
              <div>
                <TextInput th={th} value={newT} onChange={setNewT} placeholder="+998 90 123 45 67" inputMode="tel" autoFocus />
                <PrimaryButton th={th} onClick={() => saveTel(newT)}>{uz ? "Saqlash" : "Save"}</PrimaryButton>
              </div>
            )}
          </AppCard>

          {/* Bu oy statistikasi */}
          <AppCard th={th}>
            <SubHeader th={th}>{uz ? "Bu oy statistikasi" : "Stats"}</SubHeader>
            {[
              { l: uz ? "Xarajat" : "Expense", v: f(bX.filter(x => x.uid === user.id).reduce((s, x) => s + Number(x.summa || 0), 0), true), c: th.rd },
              { l: uz ? "Daromad" : "Income", v: f(bD.filter(d => d.uid === user.id).reduce((s, d) => s + Number(d.summa || 0), 0), true), c: th.gr },
              { l: uz ? "Jami yozuvlar" : "Total records", v: xar.filter(x => x.uid === user.id).length + " ta", c: th.ac },
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
                <SecondaryButton th={th} onClick={copyFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }} aria-label={uz ? "Oila kodini nusxalash" : "Copy family code"}>
                  {PIco.copy(th.ac)}{uz ? "Nusxa" : "Copy"}
                </SecondaryButton>
                <SecondaryButton th={th} onClick={shareFamCode} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0, background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong }} aria-label={uz ? "Oila kodini ulashish" : "Share family code"}>
                  {PIco.share(th.gr)}{uz ? "Ulashish" : "Share"}
                </SecondaryButton>
              </div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s1 }}>{t.fcd}</div>
            </AppCard>
          )}

          {/* Bola akkaunti CTA */}
          {!isKid && (
            <AppCard th={th} pad={0}>
              <ListItem th={th} divider={false} onClick={openAddKid}
                icon={PIco.baby(th.am)} iconTone={th.am}
                title={uz ? "Bola akkaunti qo'shish" : "Add kid account"}
                sub={uz ? "Farzandingizga login yarating" : "Create a login for your child"} />
            </AppCard>
          )}

          {/* Ruxsatlar — kim umumiy hisobotni ko'radi */}
          {user?.rol === "bosh" && azolar.length > 1 && (
            <AppCard th={th}>
              <SubHeader th={th}>{uz ? "Oila a'zolari va ruxsatlar" : "Members & access"}</SubHeader>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{uz ? "Kimga umumiy hisobotni ko'rishga ruxsat berasiz?" : "Who can view the full family report?"}</div>
              {azolar.map((a, i) => {
                const isAHead = a.rol === "bosh";
                const hasAccess = isAHead || (oila?.reportAccess || []).includes(a.id);
                const rel = RELATIONS.find(r => r.id === a.rel);
                return (
                  <MemberRow key={a.id} th={th} photo={a.photo} name={a.ism + (a.id === user.id ? " (" + t.me + ")" : "")}
                    sub={rel ? (rel[lg] || rel.uz) : (isAHead ? t.hd : t.mb2)}
                    divider={i < azolar.length - 1}
                    badge={isAHead
                      ? <Badge th={th} type="role">{uz ? "Oila boshi" : "Head"}</Badge>
                      : <Switch th={th} checked={hasAccess} onChange={() => toggleReportAccess(a.id)} label={uz ? "Hisobot ruxsati" : "Report access"} />} />
                );
              })}
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s1 }}>{PIco.bulb(th.am, 13)}{uz ? "Yashil = umumiy hisobotni ko'ra oladi" : "Green = can see full report"}</div>
            </AppCard>
          )}

          {/* A'zolar ro'yxati */}
          {azolar.length > 0 && (
            <AppCard th={th} pad={0}>
              <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px " + SPACE.s1 + "px" }}>
                <SubHeader th={th} style={{ marginBottom: 0 }}>{t.fam}: {oila?.nomi}</SubHeader>
              </div>
              {azolar.map((a, i) => {
                const canDelKid = a.rol === "kid" && (user?.rol === "bosh" || a.parentId === user?.id);
                return (
                  <MemberRow key={a.id} th={th} photo={a.photo} name={a.ism + (a.id === user.id ? " (" + t.me + ")" : "")}
                    sub={a.email || (a.rol === "kid" ? a.login : "")}
                    variant={a.rol === "kid" ? "kid" : undefined}
                    divider={i < azolar.length - 1}
                    badge={
                      <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s2, flexShrink: 0 }}>
                        {a.rol === "bosh"
                          ? <Badge th={th} type="warning" icon={Ico.crown(th.am)}>{t.hd}</Badge>
                          : <Badge th={th} tone={th.t2}>{a.rol === "kid" ? (uz ? "Bola" : "Kid") : t.mb2}</Badge>}
                        {canDelKid && <IconButton th={th} tone="danger" icon={Ico.trash(th.rd)} label={uz ? a.ism + " akkauntini o'chirish" : "Delete kid account"} onClick={() => setKidDel(a)} size={COMP.touchMin - SPACE.s3} />}
                      </span>
                    } />
                );
              })}
            </AppCard>
          )}
        </div>
      )}

      {/* ═══════════════ BUDJET VA LIMITLAR ═══════════════ */}
      {pTab === "budjet" && (
        <div>
          <PageHeader th={th} title={uz ? "Budjet va limitlar" : "Budget & limits"} onBack={backToMain} />
          <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1.5px solid " + th.ac + ALPHA.med }}>
            <div style={{ ...TYPE.caption, fontWeight: 700, color: th.ac, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{Ico.wallet(th.ac)}{uz ? "Oylik budjet" : "Monthly budget"}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s3 }}>{uz ? "Bu oy uchun umumiy xarajat chegarasi" : "Total spending limit this month"}</div>
            <AmountInput th={th} label={t.mb} value={fBj} onChange={setFBj} placeholder="2 000 000" style={{ marginBottom: SPACE.s1 }} />
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, textAlign: "center" }}>{f(Number(fBj) || 0, false)}</div>
          </AppCard>

          {(() => {
            const bjNum = Number(fBj) || 0;
            const avgInc = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            if (bjNum > 0 && avgInc > 0 && bjNum > avgInc) {
              return (
                <WarningCard th={th} tone="danger" icon={PIco.warn(th.rd, 18)} title={uz ? "Budjet daromaddan yuqori!" : "Budget exceeds income!"}>
                  {uz ? "Bu oy daromadingiz " + f(avgInc, true) + ", lekin budjet " + f(bjNum, true) + "." : "Income " + f(avgInc, true) + ", budget " + f(bjNum, true)}
                </WarningCard>
              );
            }
            return null;
          })()}

          {bD.reduce((s, d) => s + Number(d.summa || 0), 0) > 0 && (() => {
            const jD2 = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            return (
              <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
                <div style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, marginBottom: SPACE.s2 + 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.bulb(th.gr)}{uz ? "50/30/20 qoidasi bo'yicha taklif" : "50/30/20 rule"}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s3, lineHeight: 1.5 }}>{uz ? "Daromadingiz (" + f(jD2, true) + ") asosida tavsiya:" : "Based on income (" + f(jD2, true) + "):"}</div>
                {[{ p: 50, c: th.gr, uz: "Ehtiyojlar (oziq, uy, transport)", en: "Needs" }, { p: 30, c: th.am, uz: "Xohishlar (ko'ngilochar, kiyim)", en: "Wants" }, { p: 20, c: th.ac, uz: "Jamg'arma va maqsadlar", en: "Savings" }].map(r => (
                  <div key={r.p} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 }}>
                    <div style={{ width: SPACE.s8 + SPACE.s1 + 2, height: SPACE.s6, borderRadius: RADIUS.s - 4, background: r.c + ALPHA.med, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: r.c, flexShrink: 0 }}>{r.p}%</div>
                    <span style={{ flex: 1, ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t1 }}>{uz ? r.uz : r.en}</span>
                    <span style={{ ...TYPE.caption, fontWeight: 700, color: r.c, fontVariantNumeric: "tabular-nums" }}>{f(Math.round(jD2 * r.p / 100), true)}</span>
                  </div>
                ))}
                <SecondaryButton th={th} onClick={() => setFBj(String(Math.round(jD2 * 0.8)))} style={{ marginTop: SPACE.s2, background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong, fontSize: TYPE.caption.fontSize }}>{uz ? "Budjetni 80% qilib o'rnatish" : "Set budget to 80%"}</SecondaryButton>
              </AppCard>
            );
          })()}

          <AppCard th={th}>
            <SubHeader th={th}>{uz ? "Kategoriya limitlari" : "Category limits"}</SubHeader>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{uz ? "Har bir kategoriya uchun alohida chegara (ixtiyoriy)" : "Separate limit per category (optional)"}</div>
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
                <WarningCard th={th} icon={PIco.warn(th.am, 18)} title={uz ? "Limitlar budjetdan oshdi" : "Limits exceed budget"}>
                  {uz ? "Kategoriya limitlari jami " + f(limTotal, true) + ", budjet esa " + f(bjNum, true) + "." : "Limits total " + f(limTotal, true) + " > budget " + f(bjNum, true)}
                </WarningCard>
              );
            }
            if (limTotal > 0 && bjNum > 0) {
              return (
                <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
                  <span style={{ ...TYPE.caption, color: th.t2 }}>{uz ? "Limitlar jami" : "Limits total"}</span>
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
            <ListItem th={th} icon={Ico.globe(th.ac)} title={t.til} sub={uz ? "O'zbek" : lg === "ru" ? "Русский" : "English"} right={null} />
            <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
              {[{ id: "uz", l: "O'zbek" }, { id: "ru", l: "Русский" }, { id: "kk", l: "Qaraqalpaq" }, { id: "en", l: "English" }].map(l => (
                <ChoiceChip key={l.id} th={th} on={lg === l.id} onClick={() => { const nl = l.id === "kk" ? "uz" : l.id; setLg(nl); localStorage.setItem("oilaV7L", nl); }}>{l.l}</ChoiceChip>
              ))}
            </div>
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
            <ListItem th={th} icon={Ico.money(th.ac)} title={uz ? "Valyuta" : "Валюта"} sub={val.b + " " + val.id.toUpperCase()} onClick={() => setShowValDD(v => !v)}
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
              title={uz ? "Bildirishnomalar" : "Notifications"}
              sub={notifEnabled ? (uz ? "Yoqilgan — har kuni " + notifTime : "On — daily at " + notifTime) : (uz ? "O'chirilgan" : "Off")}
              right={<Switch th={th} checked={!!notifEnabled} onChange={toggleNotif} label={uz ? "Bildirishnomalar" : "Notifications"} />}
              divider={!!notifEnabled} />
            {notifEnabled && (
              <div style={{ padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
                <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{uz ? "Eslatma vaqti" : "Reminder time"}</div>
                <div style={{ display: "flex", gap: SPACE.s2, flexWrap: "wrap" }}>
                  {["08:00", "12:00", "18:00", "20:00", "21:00", "22:00"].map(time => (
                    <ChoiceChip key={time} th={th} on={notifTime === time} onClick={() => saveNotifTime(time)} style={{ padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", minHeight: 0 }}>{time}</ChoiceChip>
                  ))}
                </div>
              </div>
            )}
          </AppCard>

          {/* Premium banner */}
          <PremiumCard th={th} active={isPremium} onClick={openPremium}
            title={isPremium ? (uz ? "Premium faol" : "Premium active") : (uz ? "Premium ga o'ting" : "Upgrade to Premium")}
            sub={isPremium ? (uz ? "Barcha funksiyalar ochiq" : "All unlocked") : (uz ? "Cheksiz maqsad, PDF, Excel..." : "Unlimited goals, PDF...")}
            cta={isPremium ? Ico.check(PREMIUM.gold) : <Badge th={th} type="info">{uz ? "Ochish" : "Unlock"}</Badge>} />
        </div>
      )}

      {/* ═══════════════ XAVFSIZLIK ═══════════════ */}
      {pTab === "xav" && (
        <div>
          <PageHeader th={th} title={t.xav} onBack={backToMain} />
          <AppCard th={th} pad={0}>
            <ListItem th={th} icon={Ico.lock(th.ac)} title={t.pin} sub={uz ? "4 raqamli maxfiy kod" : "4-digit code"}
              right={<SecondaryButton th={th} onClick={() => setPinStep(pinStep === "idle" ? "enter" : "idle")} style={{ width: "auto", padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", fontSize: TYPE.caption.fontSize, flexShrink: 0 }}>{pinStep === "idle" ? (uz ? "O'zgartirish" : "Change") : (uz ? "Bekor" : "Cancel")}</SecondaryButton>}
              divider={pinStep !== "idle"} />
            {pinStep !== "idle" && (
              <div style={{ padding: SPACE.s4 }}>
                <div style={{ ...TYPE.caption, fontWeight: 600, color: th.t2, marginBottom: SPACE.s3, textAlign: "center" }}>{pinStep === "enter" ? (uz ? "Yangi PIN kiriting" : "Enter new PIN") : (uz ? "PIN ni tasdiqlang" : "Confirm PIN")}</div>
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
                        else { if (next === pinVal) { setPinStep("idle"); setPinVal(""); setPinCfm(""); ok$(uz ? "PIN saqlandi" : "PIN saved"); } else { setPinCfm(""); ok$(uz ? "PIN mos kelmadi" : "PIN mismatch", "err"); } }
                      }
                    }} aria-label={num === "del" ? (uz ? "O'chirish" : "Delete") : String(num)}
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
            <ListItem th={th} icon={Ico.finger(th.gr)} iconTone={th.gr} title={t.barmoq} sub={uz ? "Tez va xavfsiz" : "Fast & secure"} divider={false}
              right={<Switch th={th} checked={!!finger} onChange={() => setFinger(v => !v)} label={t.barmoq} />} />
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

          <SectionHeader th={th}>{uz ? "Taklif va kamchiliklar" : "Feedback"}</SectionHeader>
          <AppCard th={th}>
            <SubHeader th={th}>{uz ? "Ilovani baholang" : "Rate the app"}</SubHeader>
            <div style={{ ...TYPE.caption, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{uz ? "Fikringiz biz uchun muhim!" : "Your opinion matters!"}</div>
            <div style={{ display: "flex", gap: SPACE.s2, justifyContent: "center", marginBottom: SPACE.s4 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="ui-press" onClick={() => setFbRating(star)} aria-label={(uz ? "Baho: " : "Rating: ") + star}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  {PIco.starFill(star <= fbRating ? PREMIUM.gold : th.t2, 34, star <= fbRating)}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              {[{ id: "taklif", l: uz ? "Taklif" : "Suggestion" }, { id: "xato", l: uz ? "Kamchilik" : "Bug" }, { id: "boshqa", l: uz ? "Boshqa" : "Other" }].map(ty => (
                <ChoiceChip key={ty.id} th={th} on={fbType === ty.id} onClick={() => setFbType(ty.id)} style={{ flex: 1 }}>{ty.l}</ChoiceChip>
              ))}
            </div>
            <TextArea th={th} value={fbText} onChange={setFbText} placeholder={uz ? "Fikr, taklif yoki kamchilikni yozing..." : "Write your feedback..."} />
            <LoadingButton th={th} loading={fbSending} loadingText={uz ? "Yuborilmoqda..." : "Sending..."} onClick={sendFeedback}>
              {PIco.send("#fff", 18)}{uz ? "Yuborish" : "Send"}
            </LoadingButton>
          </AppCard>
        </div>
      )}

      {pTab === "garden" && <Garden user={user} lg={lg} dark={dark} onBack={backToMain} addCoin={addStar} />}

      {/* ═══════════════ BOLA AKKAUNTI — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showAddKid} onClose={closeAddKid} title={uz ? "Bola akkaunti yaratish" : "Create kid account"}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
          <div style={{ width: SPACE.s16, height: SPACE.s16, borderRadius: RADIUS.full, background: th.am + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>{PIco.baby(th.am, 32)}</div>
        </div>
        <div style={{ ...TYPE.caption, color: th.t2, textAlign: "center", marginBottom: SPACE.s4, lineHeight: 1.5 }}>{uz ? "Farzandingiz uchun login va parol yarating." : "Create a login for your child."}</div>
        <TextInput th={th} label={(uz ? "Bola ismi" : "First name") + " *"} value={kidName} onChange={v => { setKidName(v); setKidErr(e => ({ ...e, name: "" })); }} placeholder={uz ? "Jahongir" : "Name"} error={kidErr.name} />
        <TextInput th={th} label={(uz ? "Familya" : "Surname") + " *"} value={kidSurname} onChange={v => { setKidSurname(v); setKidErr(e => ({ ...e, surname: "" })); }} placeholder={uz ? "Aliyev" : "Surname"} error={kidErr.surname} />
        <TextInput th={th} label={(uz ? "Tug'ilgan yili" : "Birth year") + " *"} value={kidBirthYear} onChange={v => { setKidBirthYear(v.replace(/\D/g, "").slice(0, 4)); setKidErr(e => ({ ...e, birth: "" })); }} placeholder={String(new Date().getFullYear() - 10)} inputMode="numeric" error={kidErr.birth} />
        {/* Jinsi — ixtiyoriy (qayta bosilsa bekor bo'ladi) */}
        <div style={{ marginBottom: SPACE.s3 }}>
          <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Jinsi (ixtiyoriy)" : "Gender (optional)"}</div>
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            {[{ id: "ogil", l: uz ? "O'g'il bola" : "Boy" }, { id: "qiz", l: uz ? "Qiz bola" : "Girl" }].map(g => (
              <ChoiceChip key={g.id} th={th} on={kidGender === g.id} onClick={() => setKidGender(kidGender === g.id ? "" : g.id)} style={{ flex: 1 }}>{g.l}</ChoiceChip>
            ))}
          </div>
        </div>
        <TextInput th={th} label={uz ? "Sinfi (ixtiyoriy)" : "Grade (optional)"} value={kidGrade} onChange={v => { setKidGrade(v.replace(/\D/g, "").slice(0, 2)); setKidErr(e => ({ ...e, grade: "" })); }} placeholder={uz ? "1–11" : "1–11"} inputMode="numeric" error={kidErr.grade} />
        <TextInput th={th} label="Login *" value={kidLogin} onChange={v => { setKidLogin(v.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()); setKidErr(e => ({ ...e, login: "" })); }} placeholder="jahongir2015" error={kidErr.login} />
        <TextInput th={th} label={(uz ? "Parol" : "Password") + " *"} value={kidPw} onChange={v => { setKidPw(v); setKidErr(e => ({ ...e, pw: "" })); }} placeholder={uz ? "Kamida 4 belgi" : "Min 4 chars"} error={kidErr.pw} />
        <PrimaryButton th={th} onClick={submitKid} style={{ marginTop: SPACE.s1 }}>{uz ? "Akkaunt yaratish" : "Create account"}</PrimaryButton>
      </BottomSheet>

      {/* ═══════════════ REFERRAL — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showReferral} onClose={closeReferral} title={uz ? "Do'stlarni taklif qiling" : "Invite friends"}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
          <div style={{ width: SPACE.s16, height: SPACE.s16, borderRadius: RADIUS.full, background: PREMIUM.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e1(PREMIUM.deep) }}>{PIco.gift("#fff", 30)}</div>
        </div>
        <div style={{ ...TYPE.caption, color: th.t2, textAlign: "center", marginBottom: SPACE.s4 }}>{uz ? "Har bir do'st uchun imtiyozlar oling!" : "Get rewards for each friend!"}</div>

        {/* Natija */}
        <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1.5px solid " + th.gr + ALPHA.med }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3 }}>
            <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{uz ? "Sizning natijangiz" : "Your progress"}</span>
            <span style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontVariantNumeric: "tabular-nums" }}>{refCount}/3</span>
          </div>
          <LinearProgress th={th} value={Math.min(100, (refCount / 3) * 100)} tone={th.gr} height={SPACE.s2} style={{ marginBottom: SPACE.s2 + 2 }} />
          <div style={{ ...TYPE.caption, color: th.t2 }}>{refCount >= 3 ? (uz ? "Tabriklaymiz! Premium ochildi!" : "Premium unlocked!") : (uz ? "Yana " + (3 - refCount) + " ta do'st = 1 oy Premium bepul" : (3 - refCount) + " more friends = 1 month free Premium")}</div>
        </AppCard>

        {/* Havola */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{uz ? "Sizning taklif havolangiz" : "Your invite link"}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
          <div style={{ flex: 1, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: RADIUS.s + 2, padding: SPACE.s3 + "px " + SPACE.s3 + "px", ...TYPE.caption, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", minWidth: 0 }}>{(window.location.origin + "/?ref=") + (user?.id || "")}</div>
          <SecondaryButton th={th} onClick={copyRefLink} style={{ width: "auto", padding: "0 " + SPACE.s4 + "px", flexShrink: 0, fontSize: TYPE.caption.fontSize + 1 }}>{uz ? "Nusxa" : "Copy"}</SecondaryButton>
        </div>

        {/* Do'stni taklif qilish */}
        <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.family(th.ac)}{uz ? "Do'stni taklif qilish" : "Invite a friend"}</div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s2 + 2 }}>{uz ? "Faqat ilovaga taklif" : "App invite only"}</div>
          <PrimaryButton th={th} onClick={tgInviteFriend} style={{ padding: (SPACE.s2 + 3) + "px", fontSize: TYPE.caption.fontSize + 1 }}>{PIco.send("#fff")}{uz ? "Telegram orqali yuborish" : "Send via Telegram"}</PrimaryButton>
        </AppCard>

        {/* Oila a'zosini taklif qilish */}
        {user?.rol === "bosh" && (
          <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
            <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{PIco.family(th.gr)}{uz ? "Oila a'zosini taklif qilish" : "Invite to family"}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s2 + 2 }}>{uz ? "Oila kodi bilan" : "With family code"}</div>
            <div style={{ background: th.bg, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s2 + 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Oila kodi" : "Family code"}</span>
              <span style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontFamily: "monospace", letterSpacing: 1 }}>{user?.oilaId}</span>
            </div>
            <SecondaryButton th={th} onClick={tgInviteFamily} style={{ background: th.gr + ALPHA.soft, color: th.gr, border: "1px solid " + th.gr + ALPHA.strong, fontSize: TYPE.caption.fontSize + 1 }}>{PIco.send(th.gr)}{uz ? "Oila kodi bilan yuborish" : "Send with family code"}</SecondaryButton>
          </AppCard>
        )}

        {/* Imtiyozlar */}
        <AppCard th={th} style={{ background: th.surH, border: "none" }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, marginBottom: SPACE.s2 + 2 }}>{uz ? "Imtiyozlar" : "Rewards"}</div>
          {[{ n: 1, t: uz ? "1 do'st — 100 ball" : "1 friend — 100 points" }, { n: 3, t: uz ? "3 do'st — 1 oy Premium" : "3 friends — 1 month Premium" }, { n: 10, t: uz ? "10 do'st — 1 yil Premium" : "10 friends — 1 year Premium" }].map(r => (
            <div key={r.n} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 }}>
              <div style={{ width: SPACE.s6 + 2, height: SPACE.s6 + 2, borderRadius: RADIUS.s - 2, background: refCount >= r.n ? th.gr + ALPHA.med : th.bor, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.caption, fontWeight: 800, color: refCount >= r.n ? th.gr : th.t2, flexShrink: 0 }}>{refCount >= r.n ? Ico.check(th.gr) : r.n}</div>
              <span style={{ ...TYPE.caption, color: refCount >= r.n ? th.t1 : th.t2, fontWeight: refCount >= r.n ? 600 : 400 }}>{r.t}</span>
            </div>
          ))}
        </AppCard>

        <GhostButton th={th} onClick={closeReferral}>{uz ? "Yopish" : "Close"}</GhostButton>
      </BottomSheet>

      {/* ═══════════════ MA'LUMOTLARNI TOZALASH — BottomSheet ═══════════════ */}
      <BottomSheet th={th} open={!!showClean} onClose={closeClean} title={uz ? "Ma'lumotlarni tozalash" : "Clear data"}>
        <WarningCard th={th} tone="danger" icon={PIco.warn(th.rd, 18)} title={uz ? "Qaytarib bo'lmaydi" : "Irreversible"}>
          {uz ? "Tanlangan xarajat va daromad yozuvlari butunlay o'chiriladi." : "Selected expense and income records will be permanently deleted."}
        </WarningCard>

        {/* Qamrov: faqat men / butun oila (oila boshi) */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Kimning yozuvlari" : "Whose records"}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <ChoiceChip th={th} on={!clnFam} onClick={() => setClnFam(false)} style={{ flex: 1 }}>{uz ? "Faqat mening yozuvlarim" : "Only my records"}</ChoiceChip>
          {user?.rol === "bosh" && <ChoiceChip th={th} on={clnFam} onClick={() => setClnFam(true)} style={{ flex: 1 }}>{uz ? "Butun oila" : "Whole family"}</ChoiceChip>}
        </div>

        {/* Davr: hammasi / sana oralig'i */}
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Davr" : "Period"}</div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <ChoiceChip th={th} on={clnAll} onClick={() => setClnAll(true)} style={{ flex: 1 }}>{uz ? "Hammasi" : "Everything"}</ChoiceChip>
          <ChoiceChip th={th} on={!clnAll} onClick={() => setClnAll(false)} style={{ flex: 1 }}>{uz ? "Sana oralig'i" : "Date range"}</ChoiceChip>
        </div>
        {!clnAll && (
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Boshlanish" : "From"}</div>
              <input type="date" value={clnFrom} onChange={e => setClnFrom(e.target.value)}
                style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: COMP.inputPad, color: th.t1, fontSize: TYPE.caption.fontSize + 1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Tugash" : "To"}</div>
              <input type="date" value={clnTo} onChange={e => setClnTo(e.target.value)}
                style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: COMP.inputPad, color: th.t1, fontSize: TYPE.caption.fontSize + 1, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
        )}
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginBottom: SPACE.s3, lineHeight: 1.5 }}>
          {uz ? "Maqsad, qarz va bog' ma'lumotlariga tegilmaydi — faqat xarajat/daromad yozuvlari o'chadi." : "Goals, debts and garden are untouched — only expense/income records are deleted."}
        </div>
        <DangerButton th={th} solid onClick={() => {
          if (!clnAll && !clnFrom && !clnTo) { setClnAll(true); }
          setClnAsk(true);
        }} style={{ marginBottom: SPACE.s2 }}>{Ico.trash("#fff")}{uz ? "O'chirish" : "Delete"}</DangerButton>
        <GhostButton th={th} onClick={closeClean}>{uz ? "Bekor qilish" : "Cancel"}</GhostButton>
      </BottomSheet>

      {/* Tozalash — yakuniy tasdiq */}
      <ConfirmDialog th={th} open={!!clnAsk} onClose={() => setClnAsk(false)} onConfirm={doPurge}
        title={uz ? "Aniq o'chirilsinmi?" : "Delete for sure?"}
        message={(clnFam ? (uz ? "Butun oilaning " : "The whole family's ") : (uz ? "Sizning " : "Your "))
          + (clnAll ? (uz ? "BARCHA yozuvlari" : "ALL records") : (uz ? (clnFrom || "…") + " — " + (clnTo || "…") + " oralig'idagi yozuvlari" : "records in " + (clnFrom || "…") + " — " + (clnTo || "…")))
          + (uz ? " butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi." : " will be permanently deleted. This cannot be undone.")}
        confirmText={uz ? "Ha, o'chirilsin" : "Yes, delete"} cancelText={uz ? "Bekor qilish" : "Cancel"} />

      {/* Bola akkauntini o'chirish — tasdiq */}
      <ConfirmDialog th={th} open={!!kidDel} onClose={() => setKidDel(null)}
        onConfirm={() => { const k = kidDel; setKidDel(null); delKidAccount(k); }}
        title={uz ? "Bola akkaunti o'chirilsinmi?" : "Delete kid account?"}
        message={kidDel ? (uz
          ? kidDel.ism + " akkaunti va logini (" + (kidDel.login || "—") + ") butunlay o'chiriladi. Bola boshqa kira olmaydi. Yozuvlari tarixda saqlanib qoladi."
          : kidDel.ism + "'s account and login (" + (kidDel.login || "—") + ") will be deleted permanently. Their records remain in history.") : ""}
        confirmText={uz ? "Ha, o'chirilsin" : "Yes, delete"} cancelText={uz ? "Bekor qilish" : "Cancel"} />
    </div>
  );
}
