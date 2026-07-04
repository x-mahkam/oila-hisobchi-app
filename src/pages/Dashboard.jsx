import { memo, useMemo, useState, useEffect, useRef } from "react";
import { KatIco, DarIco, MoneyInput, Av, Spark, Heat, SL, TxRow } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, QUICK_ADD } from "../utils/constants.js";
import { tm } from "../utils/formatters.js";
import { db } from "../firebase.js";
import KidsGames from "../components/KidsGames.jsx";


// ═══════════════════════════════════════════════════════════
//  DIZAYN TOKENLARI — 8pt grid va tipografiya shkalasi
//  (magic number'lar o'rniga yagona haqiqat manbai)
// ═══════════════════════════════════════════════════════════
const SP = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };
const TY = {
  greet: { fontSize: 13, fontWeight: 500 },
  name:  { fontSize: 21, fontWeight: 800, letterSpacing: "-0.3px" },
  stat:  { fontSize: 34, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1 },
  h2:    { fontSize: 14, fontWeight: 700 },
  body:  { fontSize: 13, fontWeight: 500 },
  cap:   { fontSize: 11, fontWeight: 600 },
  micro: { fontSize: 10, fontWeight: 600 },
};
const CARD_GAP = SP.m;     // kartalar orasidagi masofa
const SECTION_GAP = SP.xl; // bo'limlar orasidagi masofa
const ICON_BOX = 44;       // mini-karta ikonka kvadrati
const RADIUS = 18;         // standart karta radiusi
const STAGGER = 40;        // kartalar ketma-ket paydo bo'lish qadami (ms)

// ── Balans count-up animatsiyasi (reduced-motion hurmat qilinadi) ──
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

// ── Skeleton yuklanish holati (spinner o'rniga) ──
const DashSkeleton = memo(function DashSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height: 200, borderRadius: 24, marginBottom: CARD_GAP }} />
      <div style={{ display: "flex", gap: SP.s, marginBottom: CARD_GAP }}>
        {[0, 1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, flex: 1, borderRadius: 14 }} />)}
      </div>
      {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 76, borderRadius: RADIUS, marginBottom: CARD_GAP }} />)}
    </div>
  );
});

// ── Bo'lim sarlavhasi ──
const SecLabel = memo(function SecLabel({ th, children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: SECTION_GAP - SP.s + "px 2px " + SP.s + "px" }}>
      <span style={{ ...TY.micro, color: th.t2, textTransform: "uppercase", letterSpacing: 1.5 }}>{children}</span>
      {right}
    </div>
  );
});

// ── HERO: salomlashish + oila balansi + oy daromad/xarajat + o'zgarish ──
const Hero = memo(function Hero({ th, lg, t, f, ism, bal, jD, jX, myBal, delta, bugunX }) {
  const shown = useCountUp(bal);
  const neg = bal < 0;
  const h = new Date().getHours();
  const greet = h < 6 ? (lg === "uz" ? "Xayrli tun" : "Good night") : h < 12 ? (lg === "uz" ? "Xayrli tong" : "Good morning") : h < 18 ? (lg === "uz" ? "Xayrli kun" : "Good afternoon") : (lg === "uz" ? "Xayrli kech" : "Good evening");
  const dUp = delta > 0, dZero = delta === 0;
  return (
    <div className="anim-fadeUp" style={{ background: neg ? "linear-gradient(135deg,#dc2626 0%,#b91c1c 60%,#7f1d1d 100%)" : "linear-gradient(135deg," + th.ac + " 0%," + th.ac2 + " 60%,#a78bfa 100%)", borderRadius: 24, padding: SP.l + 4, marginBottom: CARD_GAP, position: "relative", overflow: "hidden", boxShadow: "0 12px 40px " + (neg ? "#dc262640" : th.ac + "40") }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        {/* 1. Salomlashish */}
        <div style={{ ...TY.greet, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{greet}</div>
        <div style={{ ...TY.name, color: "#fff", marginBottom: SP.l }}>{ism || ""} {"\ud83d\udc4b"}</div>
        {/* 2. Umumiy (oila) balansi */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SP.xs }}>
          <div style={{ ...TY.cap, color: "rgba(255,255,255,0.72)" }}>{lg === "uz" ? "Oila balansi (bu oy)" : "Family balance (this month)"}</div>
          {bugunX > 0 && <div style={{ ...TY.micro, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.18)", borderRadius: 9, padding: "3px 9px" }}>{lg === "uz" ? "Bugun" : "Today"}: -{f(bugunX, true)}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: SP.s, flexWrap: "wrap", marginBottom: neg ? SP.s : SP.l }}>
          <div style={{ ...TY.stat, color: "#fff" }}>{shown < 0 ? "-" : ""}{f(Math.abs(shown), true)}</div>
          {/* 5. Balans o'zgarishi (o'tgan oyga nisbatan) */}
          {!dZero && (
            <div style={{ ...TY.micro, fontWeight: 800, color: "#fff", background: dUp ? "rgba(34,197,94,0.35)" : "rgba(0,0,0,0.22)", borderRadius: 9, padding: "3px 9px", display: "flex", alignItems: "center", gap: 3 }}>
              {dUp ? "\u2191" : "\u2193"} {f(Math.abs(delta), true)} <span style={{ fontWeight: 500, opacity: 0.85 }}>{lg === "uz" ? "o'tgan oyga nisb." : "vs last month"}</span>
            </div>
          )}
        </div>
        {neg && (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: SP.s + "px " + SP.m + "px", marginBottom: SP.m, ...TY.cap, fontWeight: 600, color: "#fff" }}>
            {"\u26A0\uFE0F"} {lg === "uz" ? "Balans manfiy! Avval daromad kiriting." : "Negative balance! Add income first."}
          </div>
        )}
        {/* 3-4. Shu oy daromad / xarajat */}
        <div style={{ display: "flex", gap: SP.s + 2 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.13)", borderRadius: 13, padding: SP.s + 2 + "px " + SP.m + "px" }}>
            <div style={{ ...TY.micro, color: "rgba(255,255,255,0.75)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#86efac" }} />{t.inc}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>+{f(jD, true)}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.13)", borderRadius: 13, padding: SP.s + 2 + "px " + SP.m + "px" }}>
            <div style={{ ...TY.micro, color: "rgba(255,255,255,0.75)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#fca5a5" }} />{t.exp}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>-{f(jX, true)}</div>
          </div>
        </div>
        <div style={{ ...TY.micro, color: "rgba(255,255,255,0.62)", marginTop: SP.s }}>{lg === "uz" ? "Mening balansim" : "My balance"}: {myBal < 0 ? "-" : ""}{f(Math.abs(myBal), true)}</div>
      </div>
    </div>
  );
});

// ── Qayta ishlatiladigan mini-karta (qarz / maqsad / vazifa / bo'sh holat) ──
const MiniCard = memo(function MiniCard({ th, icon, iconBg, badge, border, bg, dashed, title, titleColor, sub, onClick, delay }) {
  return (
    <button className="anim-fadeUp" onClick={onClick} style={{ animationDelay: (delay || 0) + "ms", width: "100%", marginBottom: CARD_GAP, cursor: "pointer", textAlign: "left", background: bg || th.sur, border: (dashed ? "1px dashed " : "1px solid ") + (border || th.bor), borderRadius: RADIUS, padding: SP.l, display: "flex", alignItems: "center", gap: SP.m, minHeight: 48 }}>
      <div style={{ width: ICON_BOX, height: ICON_BOX, borderRadius: 13, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, position: "relative" }}>
        {icon}
        {badge > 0 && <span style={{ position: "absolute", top: -5, right: -5, background: "#f59e0b", color: "#fff", borderRadius: 20, ...TY.micro, fontWeight: 800, padding: "1px 6px" }}>{badge}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TY.h2, color: titleColor || th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {sub}
      </div>
      <span style={{ fontSize: 18, color: th.ac, flexShrink: 0 }}>{"\u203A"}</span>
    </button>
  );
});

// ── Faollik grafigi — endi o'qlar bilan o'qiladigan ──
const ActivityGraph = memo(function ActivityGraph({ th, lg, days30, streak, mx30, f, delay }) {
  return (
    <div className="anim-fadeUp" style={{ animationDelay: (delay || 0) + "ms", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS, padding: SP.l, marginBottom: CARD_GAP }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: SP.s }}>
        <span style={{ ...TY.h2, fontSize: 13, color: th.t1, flex: 1 }}>{lg === "uz" ? "Xarajat faolligi" : "Spending activity"}</span>
        {streak > 1 && <span style={{ ...TY.micro, fontWeight: 800, color: "#f59e0b", background: "#f59e0b18", borderRadius: 8, padding: "2px 8px" }}>{"\ud83d\udd25"} {streak} {lg === "uz" ? "kun" : "days"}</span>}
      </div>
      {/* Y o'qi: maksimal qiymat ko'rsatkichi */}
      <div style={{ ...TY.micro, color: th.t2, marginBottom: 3, textAlign: "right" }}>{lg === "uz" ? "maks" : "max"}: {f(mx30, true)}</div>
      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 28, borderBottom: "1px solid " + th.bor, paddingBottom: 2 }}>
        {days30.map((v, i) => {
          const lvl = v === 0 ? 0 : v < mx30 * 0.34 ? 1 : v < mx30 * 0.67 ? 2 : 3;
          const hgt = [4, 10, 18, 26][lvl];
          const col = lvl === 0 ? th.bor : lvl === 1 ? th.ac + "55" : lvl === 2 ? th.ac + "99" : th.ac;
          return <div key={i} style={{ flex: 1, height: hgt, borderRadius: 2, background: col, outline: i === 29 ? "1.5px solid " + th.ac2 : "none" }} />;
        })}
      </div>
      {/* X o'qi: sana yorliqlari */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: SP.xs }}>
        <span style={{ ...TY.micro, color: th.t2 }}>{lg === "uz" ? "30 kun oldin" : "30 days ago"}</span>
        <span style={{ ...TY.micro, color: th.ac2, fontWeight: 700 }}>{lg === "uz" ? "Bugun" : "Today"}</span>
      </div>
    </div>
  );
});

export default function DashboardPage({
  user, oila, azolar, xar, dar, maq, qarzlar, vazifalar,
  kidBalances, notifs, qarzReqs, xReqs, rates, stars,
  setXar, setDar, setMaq, setKidBalances,
  dark, lg, val, scr, setScr, isPremium, isKid, isBosh, hasKids, isAdmin,
  th, t, f, ok$, buzz, addStar, fireConfetti,
  gN, gP, bX, bD, jX, jD, myX, myD, myBal, bal, bdj, pct, bRng,
  srch, srchR, showS,
  delX, acceptXReq, rejectXReq,
  vazifaDone, vazifaApprove,
  fetchRates, rateL,
  setShowGift, setShowBilim, setShowAddVazifa,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const [quickItem, setQuickItem] = useState(null);
  const [showGames, setShowGames] = useState(false);
  // Bola: sovg'a tarixi va sarflar daftari (bo'lib ko'rsatish uchun)
  const [kidGifts, setKidGifts] = useState([]);
  const [kidLedger, setKidLedger] = useState([]);
  useEffect(() => {
    if (!isKid || !user?.id) return;
    db.g("kidgift_" + user.id).then(h => { if (Array.isArray(h)) setKidGifts(h); }).catch(() => {});
    db.g("kidledger_" + user.id).then(h => { if (Array.isArray(h)) setKidLedger(h); }).catch(() => {});
  }, [isKid, user?.id]);
  const [showRates, setShowRates] = useState(false);
  const bugun = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const [quickSum, setQuickSum] = useState("");

  // ═══ PERFORMANCE: og'ir hisoblar faqat ma'lumot o'zgarganda qayta hisoblanadi ═══
  const bugunX = useMemo(() => xar.filter(x => (x.uid === user?.id || !x.uid) && x.sana === bugun).reduce((sm, x) => sm + Number(x.summa || 0), 0), [xar, user?.id, bugun]);

  // 5. Balans o'zgarishi: o'tgan oy balansi bilan solishtirish (mavjud ma'lumotdan)
  const delta = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    const pm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const pD = dar.filter(x => x.sana?.startsWith(pm)).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    const pX = xar.filter(x => x.sana?.startsWith(pm)).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    return bal - (pD - pX);
  }, [xar, dar, bal]);

  // 7. Oxirgi tranzaksiyalar (o'zimniki)
  const recentTx = useMemo(() => [
    ...xar.filter(x => x.uid === user?.id).slice(0, 12).map(x => ({ ...x, tp: "x" })),
    ...dar.filter(d => d.uid === user?.id).slice(0, 8).map(d => ({ ...d, tp: "d" })),
  ].sort((a, b) => b.id - a.id).slice(0, 6), [xar, dar, user?.id]);

  // 11. Oiladagi oxirgi faoliyat (boshqa a'zolar) — mavjud ma'lumotdan
  const famTx = useMemo(() => [
    ...xar.filter(x => x.uid && x.uid !== user?.id).slice(0, 10).map(x => ({ ...x, tp: "x" })),
    ...dar.filter(d => d.uid && d.uid !== user?.id).slice(0, 10).map(d => ({ ...d, tp: "d" })),
  ].sort((a, b) => b.id - a.id).slice(0, 4), [xar, dar, user?.id]);

  // 8. Grafik ma'lumoti (30 kun) — ilgari HAR renderda O(30n) hisoblanardi
  const actv = useMemo(() => {
    const days30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 29 + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      return xar.filter(x => (x.uid === user?.id || !x.uid) && x.sana === key).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    });
    const mx30 = Math.max(...days30, 1);
    let streak = 0; for (let i = days30.length - 1; i >= 0 && days30[i] > 0; i--) streak++;
    return { days30, mx30, streak };
  }, [xar, user?.id]);

  // 9-10. Maqsad va qarz agregatlari
  const dbt = useMemo(() => {
    const myQ = qarzlar.filter(q => (!q.uid || q.uid === user?.id) && !q.paid);
    return {
      n: myQ.length,
      menga: myQ.filter(q => q.tur === "bergan").reduce((sm, q) => sm + Number(q.summa || 0), 0),
      mendan: myQ.filter(q => q.tur === "olgan").reduce((sm, q) => sm + Number(q.summa || 0), 0),
      overdue: myQ.some(q => q.qaytSana && q.qaytSana < bugun),
    };
  }, [qarzlar, user?.id, bugun]);

  const gls = useMemo(() => {
    const waitG = maq.filter(m => m.status === "waiting_parent" && m.uid && m.uid !== user?.id);
    const activeM = maq.filter(m => !m.paid && m.status !== "completed" && Number(m.maqsad) > 0);
    const top = activeM.length ? [...activeM].sort((p, q) => (Number(q.jamg || 0) / Number(q.maqsad)) - (Number(p.jamg || 0) / Number(p.maqsad)))[0] : null;
    return { waitG, activeM, top, mp: top ? Math.min(100, Math.round(Number(top.jamg || 0) / Number(top.maqsad) * 100)) : 0 };
  }, [maq, user?.id]);

  const vaz = useMemo(() => ({
    pending: vazifalar.filter(v => v.status === "done").length,
    active: vazifalar.filter(v => v.status === "pending").length,
  }), [vazifalar]);

  const quickAdd = async () => {
    if (!quickItem || !quickSum || Number(quickSum) <= 0) return ok$(t.ea, "err");
    const { td, nt } = await import("../utils/formatters.js");
    const item = { id: Date.now(), kategoriya: quickItem.kat, summa: Number(quickSum), izoh: quickItem[lg] || quickItem.uz, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    const na = [{ ...item, uid: user.id }, ...xar];
    setXar(na);
    const bt = na.filter(x => x.sana && x.sana.indexOf(tm()) === 0).reduce((s, x) => s + Number(x.summa || 0), 0);
    if (bt > bdj) { ok$(t.be, "err"); }
    else if (bt > bdj * .9) { ok$(t.bw, "warn"); }
    else { ok$(t.xa); addStar(1, lg === "uz" ? "Xarajat kiritildi" : "Expense added"); }
    setQuickItem(null); setQuickSum("");
  };

  // ── Qidiruv natijalari ──────────────────────────────────
  if (showS) {
    return (
      <div>
        <SL ch={t.res + " (" + srchR.length + ")"} th={th} />
        {srch?.trim() && srchR.length === 0 && (
          <div style={{ ...STY.cd, textAlign: "center", color: th.t2, padding: 28 }}>{t.nf2}</div>
        )}
        {srchR.map(item => (
          <TxRow key={(item.kategoriya ? "x" : "d") + item.id} item={item} th={th} STY={STY} KATS={KATS} KN={KN} DARS={DARS} DN={DN} lg={lg} gN={gN} gP={gP} f={f} user={user} onDelete={delX} Ico={Ico} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* So'rovlar */}
      {xReqs.length > 0 && (
        <div style={{ ...STY.cd, border: "1.5px solid " + th.am + "55", marginBottom: 14, background: th.am + "0a" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.am, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>📥</span>{lg === "uz" ? "So'rovlar" : "Requests"} ({xReqs.length})
          </div>
          {xReqs.map(req => {
            const isInc = req.kind === "income";
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: 13, padding: "12px 14px", marginBottom: 10, border: "1px solid " + (isInc ? th.gr + "44" : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{isInc ? "💰" : "📤"}</span><b>{req.fromIsm}</b> {isInc ? (lg === "uz" ? "sizga pul berdi" : "gave you money") : (lg === "uz" ? "sizning nomingizdan" : "for you")}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: isInc ? th.gr : th.rd }}>{isInc ? "+" : "-"}{f(req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: 9, padding: "7px 11px", marginBottom: 10, fontSize: 12, color: th.t2 }}>
                  {isInc ? (DN[lg][DARS.findIndex(d => d.id === (req.tur || "sovga"))] || req.izoh) : KN[lg][KATS.findIndex(k => k.id === req.kategoriya)]} · {req.izoh} · {req.sana}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => acceptXReq(req)} style={{ flex: 1, background: th.gr, border: "none", borderRadius: 10, padding: "9px 0", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{isInc ? (lg === "uz" ? "Daromadga qo'shish" : "Add to income") : (lg === "uz" ? "Tasdiqlash" : "Accept")}</button>
                  <button onClick={() => rejectXReq(req)} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.rd + "55", borderRadius: 10, padding: "9px 0", color: th.rd, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{lg === "uz" ? "Rad etish" : "Reject"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== BOLA BOSH SAHIFASI ===== */}
      {isKid && (
        <div>
          <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg,#f59e0b 0%,#ec4899 55%,#8b5cf6 100%)", borderRadius: 24, padding: "24px 22px", marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: "0 12px 40px #ec489940" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>
                {(() => { const h = new Date().getHours(); return h < 12 ? (lg === "uz" ? "Xayrli tong" : "Good morning") : h < 18 ? (lg === "uz" ? "Xayrli kun" : "Good afternoon") : (lg === "uz" ? "Xayrli kech" : "Good evening"); })()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{user?.ism} 👋</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{lg === "uz" ? "Mening cho'ntak pulim" : "My pocket money"}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#fff" }}>{f(kidBalances[user.id] || 0, true)}</div>
              {(() => {
                const isMine = v => v.assignedTo === user.id || (v.assignedLogin && user.login && v.assignedLogin === user.login) || (v.assignedName && user.ism && v.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase());
                const taskAll = (vazifalar || []).filter(v => isMine(v) && v.status === "approved").reduce((s, v) => s + Number(v.reward || 0), 0);
                const giftAll = kidGifts.reduce((s, g) => s + Number(g.summa || 0), 0);
                const taskToday = (vazifalar || []).filter(v => isMine(v) && v.status === "approved" && v.paidSana === bugun).reduce((s, v) => s + Number(v.reward || 0), 0);
                const giftToday = kidGifts.filter(g => g.sana === bugun).reduce((s, g) => s + Number(g.summa || 0), 0);
                const spentToday = kidLedger.filter(l => l.tur === "spend" && l.sana === bugun).reduce((s, l) => s + Number(l.summa || 0), 0);
                return (
                  <>
                    {/* Cho'ntak puli manbalari: sovg'a / vazifa (ma'lumot uchun) */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 12, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)" }}>🎁 {lg === "uz" ? "Sovg'adan topilgan" : "From gifts"}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>{f(giftAll, true)}</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 12, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)" }}>🎯 {lg === "uz" ? "Vazifadan topilgan" : "From tasks"}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>{f(taskAll, true)}</div>
                      </div>
                    </div>
                    {/* Bugungi harakat: topildi / sarflandi */}
                    <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11.5, color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>
                      <span>📈 {lg === "uz" ? "Bugun topildi:" : "Earned today:"} +{f(taskToday + giftToday, true)}</span>
                      <span>📉 {lg === "uz" ? "Bugun sarflandi:" : "Spent today:"} −{f(spentToday, true)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <button onClick={() => { buzz(10); setShowGift(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#10b98115,#05966908)", border: "1.5px solid #10b98144", borderRadius: 16, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎁</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Sovg'a puli kiritish" : "Add gift money"}</div>
              <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Buvi, bobo yoki qarindosh bergan pul" : "Money from relatives"}</div>
            </div>
            <span style={{ fontSize: 18, color: th.gr }}>+</span>
          </button>

          {/* ── O'yinlar markazi ── */}
          <button onClick={() => { buzz(10); setShowGames(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: 18, padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 18, position: "relative", overflow: "hidden", boxShadow: "0 6px 18px #8b5cf633" }}>
            <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%) rotate(-10deg)", fontSize: 46, opacity: 0.35 }}>🎮</div>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎮</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{lg === "uz" ? "O'yinlar" : "Games"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{lg === "uz" ? "O'ynab bilim ol va liderbordda ball to'pla!" : "Play, learn and earn points!"}</div>
            </div>
            <span style={{ fontSize: 18, color: "#fff" }}>▶</span>
          </button>
          {showGames && <KidsGames user={user} lg={lg} addStar={addStar} onClose={() => setShowGames(false)} />}

          <button onClick={() => { buzz(10); setShowBilim(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#1e40af15,#3b82f608)", border: "1.5px solid #3b82f644", borderRadius: 16, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#1e40af,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Bilim Bozori" : "Knowledge Market"}</div>
              <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Ingliz so'z o'rgan, Bilim Coin yig'" : "Learn words, earn coins"}</div>
            </div>
            <span style={{ fontSize: 18, color: "#3b82f6" }}>›</span>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
            {(() => {
              const myV = vazifalar.filter(v => v.assignedTo === user.id || (v.assignedLogin && user.login && v.assignedLogin === user.login) || (v.assignedName && user.ism && v.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase()));
              const done = myV.filter(v => v.status === "approved").length;
              const pend = myV.filter(v => v.status === "pending" || v.status === "done").length;
              const ball = done * 10;
              return [
                { ic: "🏆", l: lg === "uz" ? "Bajarildi" : "Done", v: done, c: "#10b981" },
                { ic: "⏳", l: lg === "uz" ? "Vazifa" : "To do", v: pend, c: "#f59e0b" },
                { ic: "⭐", l: lg === "uz" ? "Ball" : "Points", v: ball, c: "#8b5cf6" },
              ].map((s, i) => (
                <div key={i} className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + s.c + "0d," + th.sur + ")", borderRadius: 15, padding: "14px 8px", textAlign: "center", border: "1px solid " + s.c + "22", animationDelay: (i * 0.08) + "s" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.ic}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: th.t2, fontWeight: 600 }}>{s.l}</div>
                </div>
              ));
            })()}
          </div>

          <SL ch={lg === "uz" ? "Bajarish kerak" : "To do"} th={th} />
          {(() => {
            const active = vazifalar.filter(v => (v.assignedTo === user.id || (v.assignedLogin && user.login && v.assignedLogin === user.login) || (v.assignedName && user.ism && v.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase())) && (v.status === "pending" || v.status === "done"));
            if (active.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "30px 20px", color: th.t2 }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Barakalla! Hamma vazifa bajarilgan" : "All done!"}</div>
                </div>
              );
            }
            return active.slice(0, 4).map(v => (
              <div key={v.id} className="anim-fadeUp" style={{ background: th.sur, borderRadius: 16, padding: "14px", marginBottom: 10, border: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: th.ac + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{v.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{v.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>+{f(v.reward, true)}</div>
                </div>
                {v.status === "pending"
                  ? <button onClick={() => vazifaDone(v.id)} style={{ background: th.ac, border: "none", borderRadius: 11, padding: "10px 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✓ {lg === "uz" ? "Bajardim" : "Done"}</button>
                  : <span style={{ fontSize: 11, color: th.am, fontWeight: 600 }}>⏳</span>}
              </div>
            ));
          })()}
        </div>
      )}

      {/* ===== KATTALAR BOSH SAHIFASI (yangi oqim: 1-11) ===== */}
      {!isKid && !oila && <DashSkeleton />}
      {!isKid && oila && (
        <div>
          {/* 1-5. Hero: salomlashish, oila balansi, daromad, xarajat, o'zgarish */}
          <Hero th={th} lg={lg} t={t} f={f} ism={user?.ism} bal={bal} jD={jD} jX={jX} myBal={myBal} delta={delta} bugunX={bugunX} />

          {/* Byudjet — oy xarajati kontekstini davom ettiradi */}
          <div className="anim-fadeUp" style={{ animationDelay: STAGGER + "ms", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS, padding: SP.l, marginBottom: CARD_GAP }}>
            <div style={{ ...STY.row, marginBottom: SP.s }}><span style={{ ...TY.cap, color: th.t2 }}>{t.bud}</span><span style={{ ...TY.cap, fontWeight: 700, color: th.t1 }}>{f(bdj, true)}</span></div>
            <div style={{ background: th.bg, borderRadius: 10, height: 12, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg," + bRng + "88," + bRng + ")", borderRadius: 10, transition: "width .6s" }} /></div>
            <div style={{ ...STY.row, marginTop: SP.s - 1 }}><span style={{ ...TY.cap, color: bRng, fontWeight: 700 }}>{pct}% {t.sp}</span><span style={{ ...TY.cap, color: bdj - jX >= 0 ? th.gr : th.rd }}>{f(Math.abs(bdj - jX), true)} {bdj - jX >= 0 ? t.lf : t.ex}</span></div>
          </div>

          {/* 6. Tezkor amallar — bir qo'l uchun kattaroq target */}
          <SecLabel th={th}>{"\u26A1"} {lg === "uz" ? "Tez qo'shish" : "Quick add"}</SecLabel>
          <div style={{ display: "flex", gap: SP.s, overflowX: "auto", paddingBottom: SP.xs, marginBottom: quickItem ? SP.s : CARD_GAP }}>
            {QUICK_ADD.map((q, i) => (
              <button key={i} onClick={() => { buzz(10); setQuickItem(q); setQuickSum(""); }} style={{ flexShrink: 0, background: th.sur, border: "1px solid " + th.bor, borderRadius: 14, padding: SP.m + "px " + SP.l + "px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: SP.xs, minWidth: 76, minHeight: 48 }}>
                <span style={{ fontSize: 26 }}>{q.emoji}</span>
                <span style={{ ...TY.cap, color: th.t2 }}>{q[lg] || q.uz}</span>
              </button>
            ))}
          </div>

          {quickItem && (
            <div className="anim-scaleIn" style={{ background: th.sur, borderRadius: RADIUS, padding: SP.l, marginBottom: CARD_GAP, border: "1.5px solid " + th.ac + "55" }}>
              <div style={{ display: "flex", alignItems: "center", gap: SP.s, marginBottom: SP.s + 2 }}>
                <span style={{ fontSize: 22 }}>{quickItem.emoji}</span>
                <span style={{ ...TY.h2, color: th.t1 }}>{quickItem[lg] || quickItem.uz}</span>
              </div>
              <MoneyInput style={{ ...STY.ip, fontSize: 20, fontWeight: 800, textAlign: "center" }} value={quickSum} onChange={setQuickSum} placeholder="0" th={th} autoFocus />
              <div style={{ display: "flex", gap: SP.s }}>
                <button onClick={() => setQuickItem(null)} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 12, padding: "11px", color: th.t2, cursor: "pointer", fontWeight: 700 }}>{lg === "uz" ? "Bekor" : "Cancel"}</button>
                <button onClick={quickAdd} style={{ flex: 2, background: th.ac, border: "none", borderRadius: 12, padding: "11px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>{lg === "uz" ? "Saqlash" : "Save"}</button>
              </div>
            </div>
          )}

          {/* 7. Oxirgi tranzaksiyalar */}
          <SecLabel th={th} right={recentTx.length > 0 && <button onClick={() => setScr("hisobot")} style={{ background: "none", border: "none", ...TY.cap, color: th.ac, cursor: "pointer", padding: "4px 2px", fontWeight: 700 }}>{lg === "uz" ? "Hammasi" : "See all"} {"\u203A"}</button>}>{lg === "uz" ? "Oxirgi operatsiyalar" : "Recent transactions"}</SecLabel>
          {recentTx.length === 0 ? (
            <div className="anim-fadeUp" style={{ textAlign: "center", padding: SP.xl * 1.5 + "px " + SP.xl + "px", color: th.t2, display: "flex", flexDirection: "column", alignItems: "center", background: th.sur, border: "1px dashed " + th.bor, borderRadius: RADIUS, marginBottom: CARD_GAP }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: th.ac + "11", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: SP.m }}>{"\ud83d\udcb3"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: th.t1, marginBottom: SP.xs + 2 }}>{lg === "uz" ? "Hali xarajat kiritilmagan" : "No transactions yet"}</div>
              <div style={{ ...TY.body, fontWeight: 400, color: th.t2, marginBottom: SP.l, maxWidth: 240 }}>{lg === "uz" ? "Yuqoridagi tez qo'shish tugmalaridan foydalaning yoki pastdagi + tugmasini bosing" : "Use quick add buttons above or tap + below"}</div>
              <button onClick={() => setScr("qoshish")} style={{ ...STY.bt(), width: "auto", padding: "12px 28px", marginBottom: 0, display: "flex", alignItems: "center", gap: SP.s }}>{Ico.add("#fff")}{lg === "uz" ? "Xarajat qo'shish" : "Add expense"}</button>
            </div>
          ) : (
            recentTx.map(item => <TxRow key={item.tp + item.id} item={item} th={th} STY={STY} KATS={KATS} KN={KN} DARS={DARS} DN={DN} lg={lg} gN={gN} gP={gP} f={f} user={user} onDelete={delX} Ico={Ico} />)
          )}

          {/* 8. Grafik — o'qlari bilan */}
          <ActivityGraph th={th} lg={lg} days30={actv.days30} streak={actv.streak} mx30={actv.mx30} f={f} delay={STAGGER * 2} />

          {/* 9. Maqsad progresslari */}
          {(gls.waitG.length > 0 || gls.top || maq.length === 0 || dbt.n > 0 || hasKids) && (
            <SecLabel th={th}>{lg === "uz" ? "Maqsad va majburiyatlar" : "Goals & commitments"}</SecLabel>
          )}
          {gls.waitG.length > 0 && (
            <MiniCard th={th} delay={STAGGER * 3} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={"\ud83c\udfaf"} iconBg={"#f59e0b1c"} border={"#f59e0b66"} bg={"#f59e0b0d"}
              title={<span style={{ color: "#f59e0b" }}>{gN(gls.waitG[0].uid)} {lg === "uz" ? "orzusi uchun pul yig'ib bo'ldi!" : "saved up for a dream!"}{gls.waitG.length > 1 ? " (+" + (gls.waitG.length - 1) + ")" : ""}</span>}
              sub={<div style={{ ...TY.cap, fontWeight: 400, color: th.t2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"\u201C"}{gls.waitG[0].ism}{"\u201D"} {"\u2014"} {lg === "uz" ? "olib berish kutilmoqda" : "waiting to fulfill"}</div>} />
          )}
          {gls.top && (
            <MiniCard th={th} delay={STAGGER * 3} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={"\ud83c\udfaf"} iconBg={th.ac + "18"}
              title={<span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gls.top.ism}{gls.activeM.length > 1 ? " +" + (gls.activeM.length - 1) : ""}</span><span style={{ fontSize: 12, fontWeight: 800, color: th.ac, flexShrink: 0, marginLeft: SP.s }}>{gls.mp}%</span></span>}
              sub={<div><div style={{ height: 7, background: th.bg, borderRadius: 4, overflow: "hidden", marginTop: SP.xs + 1 }}><div style={{ height: "100%", width: gls.mp + "%", background: "linear-gradient(90deg," + th.ac + "," + th.ac2 + ")", borderRadius: 4, transition: "width .5s" }} /></div><div style={{ ...TY.micro, fontWeight: 400, color: th.t2, marginTop: SP.xs }}>{f(Number(gls.top.jamg || 0), true)} / {f(Number(gls.top.maqsad), true)}</div></div>} />
          )}
          {maq.length === 0 && (
            <MiniCard th={th} delay={STAGGER * 3} dashed border={th.ac + "55"} bg={th.ac + "08"} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={"\ud83c\udfaf"} iconBg={th.ac + "18"}
              title={lg === "uz" ? "Maqsad qo'ying" : "Set a goal"}
              sub={<div style={{ ...TY.cap, fontWeight: 400, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Uy, mashina, sayohat uchun jamg'aring" : "Save for your dreams"}</div>} />
          )}

          {/* 10. Qarz eslatmalari */}
          {dbt.n > 0 && (
            <MiniCard th={th} delay={STAGGER * 4} onClick={() => { buzz(8); setScr("qarz"); }}
              icon={"\ud83d\udcb8"} iconBg={(dbt.overdue ? th.rd : th.ac) + "18"} border={dbt.overdue ? th.rd + "66" : undefined} bg={dbt.overdue ? th.rd + "0d" : undefined}
              title={<span>{lg === "uz" ? "Qarzlar" : "Debts"} ({dbt.n}){dbt.overdue && <span style={{ marginLeft: 6, ...TY.micro, color: th.rd, fontWeight: 800 }}>{"\u26A0\uFE0F"} {lg === "uz" ? "Muddati o'tgan!" : "Overdue!"}</span>}</span>}
              sub={<div style={{ ...TY.cap, marginTop: 3, display: "flex", gap: SP.m, flexWrap: "wrap" }}>{dbt.menga > 0 && <span style={{ color: th.gr, fontWeight: 700 }}>{lg === "uz" ? "Menga qaytariladi" : "They owe"}: +{f(dbt.menga, true)}</span>}{dbt.mendan > 0 && <span style={{ color: th.rd, fontWeight: 700 }}>{lg === "uz" ? "Men qaytaraman" : "I owe"}: -{f(dbt.mendan, true)}</span>}</div>} />
          )}

          {/* Farzand vazifalari (oila klasteri) */}
          {hasKids && (
            <MiniCard th={th} delay={STAGGER * 5} onClick={() => { buzz(8); setScr("vazifa"); }}
              icon={"\ud83d\udccb"} iconBg={"#f59e0b18"} badge={vaz.pending} border={vaz.pending > 0 ? "#f59e0b66" : undefined} bg={vaz.pending > 0 ? "#f59e0b0d" : undefined}
              title={lg === "uz" ? "Farzandga vazifa" : "Kids' tasks"}
              sub={<div style={{ ...TY.cap, color: vaz.pending > 0 ? "#f59e0b" : th.t2, marginTop: 2, fontWeight: vaz.pending > 0 ? 700 : 400 }}>{vaz.pending > 0 ? "\u23F3 " + vaz.pending + (lg === "uz" ? " ta tasdiqlash kutilmoqda" : " awaiting approval") : vaz.active > 0 ? vaz.active + (lg === "uz" ? " ta faol vazifa" : " active tasks") : (lg === "uz" ? "Topshiriq bering, mukofot belgilang" : "Assign tasks with rewards")}</div>} />
          )}

          {/* 11. Oiladagi oxirgi faoliyat */}
          {famTx.length > 0 && (
            <div>
              <SecLabel th={th}>{lg === "uz" ? "Oiladagi oxirgi faoliyat" : "Family activity"}</SecLabel>
              {famTx.map(item => <TxRow key={"fam" + item.tp + item.id} item={item} th={th} STY={STY} KATS={KATS} KN={KN} DARS={DARS} DN={DN} lg={lg} gN={gN} gP={gP} f={f} user={user} onDelete={delX} Ico={Ico} />)}
            </div>
          )}

          {/* Valyuta kurslari — passiv ma'lumot, eng pastda */}
          <div style={{ height: SECTION_GAP - CARD_GAP }} />
          <div className="anim-fadeUp" style={{ animationDelay: STAGGER * 6 + "ms", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS, padding: SP.m + "px " + SP.l + "px", marginBottom: CARD_GAP }}>
            <div onClick={() => { setShowRates(v => !v); if (!showRates && rates.length === 0) fetchRates(); }} style={{ display: "flex", alignItems: "center", gap: SP.s, cursor: "pointer", minHeight: 32 }}>
              {Ico.bank(th.ac)}
              <span style={{ ...TY.h2, fontSize: 13, color: th.t1, flexShrink: 0 }}>{t.rates}</span>
              <span style={{ flex: 1, ...TY.cap, fontWeight: 400, color: th.t2, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(() => {
                  const usd = rates.find(r => r.code === "USD");
                  const rub = rates.find(r => r.code === "RUB");
                  if (!usd && !rub) return lg === "uz" ? "ko'rish" : "view";
                  return (usd ? "USD " + Number(usd.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 0 }) : "") + (usd && rub ? " \u00b7 " : "") + (rub ? "RUB " + Number(rub.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 2 }) : "");
                })()}
              </span>
              <span style={{ ...TY.micro, color: th.t2, transform: showRates ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>{"\u25BC"}</span>
            </div>
            {showRates && (
              <div style={{ marginTop: SP.m }}>
                {rateL && <div style={{ textAlign: "center", padding: SP.s + "px 0", color: th.t2, fontSize: 13 }}>{t.ldd}</div>}
                {!rateL && rates.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SP.s }}>
                    {rates.map(r => {
                      const flags = { USD: "\ud83c\uddfa\ud83c\uddf8", EUR: "\ud83c\uddea\ud83c\uddfa", RUB: "\ud83c\uddf7\ud83c\uddfa", GBP: "\ud83c\uddec\ud83c\udde7", CNY: "\ud83c\udde8\ud83c\uddf3", KZT: "\ud83c\uddf0\ud83c\uddff" };
                      return (
                        <div key={r.code} style={{ background: th.surH, borderRadius: 12, padding: SP.s + 1 + "px " + (SP.m - 1) + "px", border: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: SP.s }}>
                          <span style={{ fontSize: 17, flexShrink: 0 }}>{flags[r.code] || "\ud83d\udcb1"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ ...TY.cap, fontWeight: 700, color: th.t1 }}>{r.code}</div></div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: th.ac, flexShrink: 0 }}>{Number(r.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 0 })}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={fetchRates} style={{ marginTop: SP.s + 2, width: "100%", background: "none", border: "1px solid " + th.bor, borderRadius: 9, padding: "7px 0", cursor: "pointer", ...TY.cap, fontWeight: 400, color: th.t2, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>{Ico.repeat(th.t2)}{lg === "uz" ? "Yangilash" : "Refresh"}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
