// ═══════════════════════════════════════════════════════════
//  KID HOME 2.0 (Sprint 4A) — bolalar uchun gamification tajribasi.
//  Faqat Kid Experience. Parent moduli, Firebase, handlers,
//  permissionlar, tokenlar O'ZGARMAYDI. Barcha ko'rsatkichlar
//  MAVJUD ma'lumotdan hosila (vazifalar, stars, kidBalances,
//  kidGifts, kidLedger, gardenData). Emoji yo'q — outline SVG.
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useCallback } from "react";
import { AppCard, StatCard, SectionHeader, PrimaryButton, Badge, UIAvatar, LinearProgress, CircularProgress } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";

// ── Kichik outline SVG'lar (emoji o'rniga) ──
const KI = {
  coin: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".15"/><circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.2"/><path d="M10 7.5v5M8 10h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  star: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2l2.3 4.9 5.2.7-3.8 3.7.9 5.3L10 14.8 5.4 16.6l.9-5.3L2.5 7.6l5.2-.7L10 2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  bolt: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  check: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".15"/><path d="M6.5 10l2.2 2.2L13.5 7.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  task: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".12"/><path d="M7 8l1.5 1.5L11.5 6.5M7 13h6" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  game: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2.5" y="6" width="15" height="9" rx="3.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/><path d="M6 9v3M4.5 10.5h3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="9.5" r="1" fill={c}/><circle cx="15" cy="11.5" r="1" fill={c}/></svg>,
  leaf: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M16 4C9 4 5.5 7 5.5 12c0 1 .2 2 .5 3 5.5 0 10-3 10-11z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".15"/><path d="M6 15C8.5 11 11.5 8.5 14.5 6.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  medal: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="12.5" r="5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".15"/><path d="M10 10.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L7 12.8l2-.3 1-2z" stroke={c} strokeWidth="1" strokeLinejoin="round"/><path d="M7 3l1.5 4M13 3l-1.5 4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  gift: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".12"/><path d="M2.5 6h15v2.5h-15zM10 6v11M10 6C10 4 8.5 3 7.5 3.5 6.5 4 7 6 10 6zm0 0c0-2 1.5-3 2.5-2.5 1 .5.5 2.5-2.5 2.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  lock: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6.5" rx="1.8" stroke={c} strokeWidth="1.3" fill={c} fillOpacity=".12"/><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chev: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fire: (c, s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5c1 2.5-1.5 3.5-1.5 6A2.5 2.5 0 008 12a3 3 0 003-3c0-1-.5-2-1-2.5.3 1-.5 1.5-1 1.5.5-2-1-4-1-6.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
};

const isMineTask = (v, user) =>
  v.assignedTo === user.id ||
  (v.assignedLogin && user.login && v.assignedLogin === user.login) ||
  (v.assignedName && user.ism && v.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase());

// XP -> level (100 XP / level, oshib boruvchi emas — sodda va tushunarli)
const XP_PER = 100;

// ── Kunlik maqsad qatori ──
const DailyGoal = memo(function DailyGoal({ th, icon, label, cur, goal, done, onClick }) {
  const pct = goal > 0 ? Math.min(100, Math.round(cur / goal * 100)) : (done ? 100 : 0);
  const ok = done || (goal > 0 && cur >= goal);
  return (
    <button className="ui-press" onClick={onClick} disabled={!onClick}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: onClick ? "pointer" : "default", background: "transparent", border: "none", padding: SPACE.s2 + "px 0", display: "flex", alignItems: "center", gap: SPACE.s3 }}>
      <span style={{ width: SPACE.s8 + 2, height: SPACE.s8 + 2, borderRadius: RADIUS.s + 2, background: (ok ? th.gr : th.ac) + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ok ? KI.check(th.gr, 18) : icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACE.s2 }}>
          <span style={{ ...TYPE.caption, fontWeight: 700, color: ok ? th.gr : th.t1 }}>{label}</span>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, color: th.t2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{goal > 0 ? Math.min(cur, goal) + "/" + goal : (ok ? "✓" : "")}</span>
        </span>
        <LinearProgress th={th} value={pct} tone={ok ? th.gr : th.ac} style={{ marginTop: SPACE.s1 }} />
      </span>
    </button>
  );
});

// ── Yutuq kartasi (collectible) ──
const MedalCard = memo(function MedalCard({ th, unlocked, title, sub, cur, goal, isNew }) {
  const pct = goal > 0 ? Math.min(100, Math.round(cur / goal * 100)) : 0;
  return (
    <div style={{ width: COMP.pageMax * 0.42, flexShrink: 0, background: unlocked ? PREMIUM.gold + ALPHA.faint : th.sur, border: unlocked ? "1.5px solid " + PREMIUM.gold + ALPHA.strong : "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, boxSizing: "border-box", scrollSnapAlign: "start", position: "relative" }}>
      {isNew && unlocked && <span style={{ position: "absolute", top: SPACE.s2, right: SPACE.s2 }}><Badge th={th} type="premium" icon={null}>NEW</Badge></span>}
      <div style={{ width: SPACE.s12, height: SPACE.s12, borderRadius: RADIUS.full, background: unlocked ? PREMIUM.grad : th.surH, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: unlocked ? SHADOW.e1(PREMIUM.deep) : SHADOW.e0, filter: unlocked ? "none" : "grayscale(1)", opacity: unlocked ? 1 : 0.5, marginBottom: SPACE.s2 }}>
        {unlocked ? KI.medal("#fff", 22) : KI.lock(th.t3, 18)}
      </div>
      <div style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: unlocked ? th.t1 : th.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
      {!unlocked && goal > 0 && <LinearProgress th={th} value={pct} tone={th.ac} style={{ marginTop: SPACE.s2 }} />}
    </div>
  );
});

export default function KidHome({
  user, lg, th, f, buzz, addStar,
  vazifalar = [], kidBalances = {}, stars = 0, gardenData = {},
  kidGifts = [], kidLedger = [], bugun,
  vazifaDone, setShowGames, setShowGift, setShowBilim, setScr, setPTab,
}) {
  const uz = lg === "uz";
  const coin = stars || 0;
  const money = kidBalances[user.id] || 0;

  // ── Gamification hisobi (mavjud ma'lumotdan) ──
  const g = useMemo(() => {
    const myV = (vazifalar || []).filter(v => isMineTask(v, user));
    const doneAll = myV.filter(v => v.status === "approved");
    const active = myV.filter(v => v.status === "pending" || v.status === "done");
    const doneToday = doneAll.filter(v => v.paidSana === bugun).length;

    // XP = bajarilgan vazifa*20 + coin(stars)*2 + bog' darajasi*30
    const xp = doneAll.length * 20 + coin * 2 + (gardenData.level || 0) * 30;
    const level = Math.floor(xp / XP_PER) + 1;
    const xpInLvl = xp % XP_PER;
    const xpPct = Math.round(xpInLvl / XP_PER * 100);

    // Streak: ketma-ket kunlar (bajarilgan vazifa paidSana bo'yicha)
    const days = new Set(doneAll.map(v => v.paidSana).filter(Boolean));
    let streak = 0; const d = new Date(bugun + "T00:00:00");
    for (let i = 0; i < 60; i++) {
      const key = new Date(d.getTime() - i * 86400000).toISOString().slice(0, 10);
      if (days.has(key)) streak++;
      else if (i === 0) continue;   // bugun hali bajarmagan bo'lsa ham streak uzilmasin
      else break;
    }
    return { active, doneAll, doneToday, xp, level, xpInLvl, xpPct, streak };
  }, [vazifalar, user, coin, gardenData.level, bugun]);

  const wateredToday = gardenData && gardenData.watered === bugun;

  // ── Yutuqlar (hosila) ──
  const medals = useMemo(() => {
    const list = [
      { id: "first",  title: uz ? "Ilk vazifa" : "First task",   sub: uz ? "1 vazifa" : "1 task",    cur: g.doneAll.length, goal: 1 },
      { id: "five",   title: uz ? "Mehnatkash" : "Worker",       sub: uz ? "5 vazifa" : "5 tasks",   cur: g.doneAll.length, goal: 5 },
      { id: "ten",    title: uz ? "Zo'r bola" : "Superstar",      sub: uz ? "10 vazifa" : "10 tasks", cur: g.doneAll.length, goal: 10 },
      { id: "star",   title: uz ? "Yulduzchi" : "Stargazer",     sub: uz ? "20 yulduz" : "20 stars", cur: coin, goal: 20 },
      { id: "garden", title: uz ? "Bog'bon" : "Gardener",        sub: uz ? "Bog' 3-daraja" : "Lvl 3",cur: gardenData.level || 0, goal: 3 },
      { id: "streak", title: uz ? "Doimiy" : "Consistent",       sub: uz ? "3 kun ketma-ket" : "3d streak", cur: g.streak, goal: 3 },
    ].map(m => ({ ...m, unlocked: m.cur >= m.goal }));
    // "Yangi ochilgan": aynan bo'sag'ada turgan (cur === goal) birinchisi
    const newIdx = list.findIndex(m => m.unlocked && m.cur === m.goal);
    return list.map((m, i) => ({ ...m, isNew: i === newIdx }));
  }, [g.doneAll.length, g.streak, coin, gardenData.level, uz]);

  const unlockedCount = medals.filter(m => m.unlocked).length;

  // ── Mukofot (parent bergan vazifa mukofotlari) progressi ──
  const nextReward = useMemo(() => {
    const active = g.active.filter(v => Number(v.reward) > 0).sort((a, b) => Number(b.reward) - Number(a.reward))[0];
    return active ? { title: active.title, reward: Number(active.reward) } : null;
  }, [g.active]);

  const openGarden = useCallback(() => { buzz(10); if (setPTab) { setPTab("garden"); } setScr("profil"); }, [buzz, setPTab, setScr]);
  const openGames  = useCallback(() => { buzz(10); setShowGames(true); }, [buzz, setShowGames]);
  const openTasks  = useCallback(() => { buzz(10); setScr("vazifa"); }, [buzz, setScr]);

  const greet = (() => { const h = new Date().getHours(); return h < 12 ? (uz ? "Xayrli tong" : "Good morning") : h < 18 ? (uz ? "Xayrli kun" : "Good afternoon") : (uz ? "Xayrli kech" : "Good evening"); })();
  const ring = COMP.touchMin + SPACE.s16;  // avatar halqa o'lchami

  return (
    <div>
      {/* ═══ HERO — avatar + level halqa + XP + coin + streak ═══ */}
      <div className="ui-fadeUp" style={{ background: "linear-gradient(135deg," + th.ac + " 0%," + th.ac2 + " 60%," + PREMIUM.gold + " 130%)", borderRadius: RADIUS.l, padding: SPACE.s4 + SPACE.s1 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(th.ac) }}>
        <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s4, position: "relative" }}>
          {/* Avatar + level halqa */}
          <div style={{ position: "relative", width: ring, height: ring, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={ring} height={ring} viewBox={"0 0 " + ring + " " + ring} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
              <circle cx={ring / 2} cy={ring / 2} r={(ring - 6) / 2} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
              <circle cx={ring / 2} cy={ring / 2} r={(ring - 6) / 2} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * ((ring - 6) / 2)}
                strokeDashoffset={2 * Math.PI * ((ring - 6) / 2) * (1 - g.xpPct / 100)}
                style={{ transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <UIAvatar th={th} src={user.photo} name={fullName(user)} size={COMP.touchMin + SPACE.s6} />
            <span style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: "#fff", color: th.ac, ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "2px 9px", boxShadow: SHADOW.e1(th.ac) }}>
              LVL {g.level}
            </span>
          </div>
          {/* Ism + XP + coin + streak */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)" }}>{greet}</div>
            <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(user)}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>{uz ? "Daraja" : "Level"} {g.level} · {g.xpInLvl}/{XP_PER} XP</div>
            <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s2, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill, padding: "3px 9px" }}>{KI.coin("#fff", 15)}<span style={{ ...TYPE.caption, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{coin}</span></span>
              {g.streak > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill, padding: "3px 9px" }}>{KI.fire("#fff", 14)}<span style={{ ...TYPE.caption, fontWeight: 800, color: "#fff" }}>{g.streak} {uz ? "kun" : "d"}</span></span>}
            </div>
          </div>
        </div>
        {/* Cho'ntak puli */}
        <div style={{ marginTop: SPACE.s3, background: "rgba(255,255,255,0.14)", borderRadius: RADIUS.m, padding: SPACE.s3 }}>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>{uz ? "Mening cho'ntak pulim" : "My pocket money"}</div>
          <div style={{ ...TYPE.title, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{f(money, true)}</div>
        </div>
      </div>

      {/* ═══ KUNLIK PROGRESS ═══ */}
      <SectionHeader th={th}>{uz ? "Bugungi maqsad" : "Today's goals"}</SectionHeader>
      <AppCard th={th}>
        <DailyGoal th={th} icon={KI.task(th.ac)} label={uz ? "Vazifa bajarish" : "Complete tasks"} cur={g.doneToday} goal={2} onClick={openTasks} />
        <DailyGoal th={th} icon={KI.game(th.ac)} label={uz ? "O'yin o'ynash" : "Play a game"} cur={0} goal={0} done={false} onClick={openGames} />
        <DailyGoal th={th} icon={KI.leaf(th.gr)} label={uz ? "Bog' sug'orish" : "Water the garden"} cur={0} goal={0} done={wateredToday} onClick={openGarden} />
      </AppCard>

      {/* ═══ BUGUNGI VAZIFALAR ═══ */}
      <SectionHeader th={th} right={g.active.length > 0 ? <Badge th={th} type="warning">{g.active.length}</Badge> : null}>{uz ? "Bugungi vazifalar" : "Today's tasks"}</SectionHeader>
      {g.active.length === 0 ? (
        <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>{KI.check(th.gr, 40)}</div>
          <div style={{ ...TYPE.subtitle, color: th.t1 }}>{uz ? "Barakalla! Hammasi bajarilgan" : "All done!"}</div>
        </AppCard>
      ) : (
        g.active.slice(0, 4).map(v => (
          <AppCard key={v.id} th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 2, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.task(th.ac, 22)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.body, fontWeight: 700, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
              <div style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontVariantNumeric: "tabular-nums" }}>+{f(v.reward, true)}</div>
            </div>
            {v.status === "pending"
              ? <PrimaryButton th={th} onClick={() => vazifaDone(v.id)} style={{ width: "auto", padding: (SPACE.s2 + 1) + "px " + SPACE.s4 + "px", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0, flexShrink: 0 }}>{KI.check("#fff", 16)}{uz ? "Bajardim" : "Done"}</PrimaryButton>
              : <Badge th={th} type="warning">{uz ? "Kutilmoqda" : "Pending"}</Badge>}
          </AppCard>
        ))
      )}

      {/* ═══ BUGUNGI O'YINLAR ═══ */}
      <SectionHeader th={th}>{uz ? "Bugungi o'yinlar" : "Today's games"}</SectionHeader>
      <button className="ui-press" onClick={openGames} style={{ width: "100%", background: "linear-gradient(135deg," + th.ac2 + "," + th.ac + ")", border: "none", borderRadius: RADIUS.m, padding: SPACE.s4, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3, boxShadow: SHADOW.e1(th.ac2), fontFamily: "inherit", position: "relative", overflow: "hidden" }}>
        <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 2, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.game("#fff", 26)}</span>
        <span style={{ flex: 1, textAlign: "left" }}>
          <span style={{ display: "block", ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{uz ? "O'yinlar markazi" : "Games center"}</span>
          <span style={{ display: "block", ...TYPE.caption, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{uz ? "O'ynab bilim ol, ball to'pla!" : "Play, learn, earn points!"}</span>
        </span>
        {KI.chev("#fff", 18)}
      </button>
      <button className="ui-press" onClick={() => { buzz(10); setShowBilim(true); }} style={{ width: "100%", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3, fontFamily: "inherit" }}>
        <span style={{ width: SPACE.s10 || SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.s + 2, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.bolt(th.ac, 20)}</span>
        <span style={{ flex: 1, textAlign: "left" }}>
          <span style={{ display: "block", ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{uz ? "Bilim Bozori" : "Knowledge Market"}</span>
          <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{uz ? "Ingliz so'z o'rgan, coin yig'" : "Learn words, earn coins"}</span>
        </span>
        {KI.chev(th.t3, 16)}
      </button>

      {/* ═══ BARAKA BOG'I — preview ═══ */}
      <SectionHeader th={th}>{uz ? "Baraka Bog'i" : "Baraka Garden"}</SectionHeader>
      <button className="ui-press" onClick={openGarden} style={{ width: "100%", background: "linear-gradient(135deg," + th.gr + ALPHA.tint + "," + th.sur + ")", border: "1px solid " + th.gr + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s4, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3, fontFamily: "inherit" }}>
        <div style={{ width: COMP.touchMin + SPACE.s2, height: COMP.touchMin + SPACE.s2, borderRadius: RADIUS.m, background: th.gr + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.leaf(th.gr, 28)}</div>
        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <div style={{ ...TYPE.subtitle, color: th.t1 }}>{uz ? "Bog' darajasi" : "Garden level"} {gardenData.level || 0}</div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: wateredToday ? th.gr : th.am, marginTop: 2, fontWeight: 700 }}>
            {wateredToday ? (uz ? "Bugun sug'orilgan ✓" : "Watered today ✓") : (uz ? "Bugun sug'orish kerak" : "Needs watering today")}
          </div>
        </div>
        {KI.chev(th.gr, 18)}
      </button>

      {/* ═══ YUTUQLAR ═══ */}
      <SectionHeader th={th} right={<Badge th={th} type="premium" icon={null}>{unlockedCount}/{medals.length}</Badge>}>{uz ? "Yutuqlar" : "Achievements"}</SectionHeader>
      <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, marginBottom: SPACE.s3, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {medals.map(m => <MedalCard key={m.id} th={th} unlocked={m.unlocked} title={m.title} sub={m.sub} cur={m.cur} goal={m.goal} isNew={m.isNew} />)}
      </div>

      {/* ═══ MUKOFOTLAR ═══ */}
      <SectionHeader th={th}>{uz ? "Mukofotlar" : "Rewards"}</SectionHeader>
      <button className="ui-press" onClick={openTasks} style={{ width: "100%", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4, cursor: "pointer", fontFamily: "inherit", marginBottom: SPACE.s3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
          <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 2, background: PREMIUM.gold + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.gift(PREMIUM.gold, 24)}</div>
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            {nextReward ? (
              <>
                <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextReward.title}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{uz ? "Bajarsang" : "Complete to earn"}: <b style={{ color: th.gr }}>+{f(nextReward.reward, true)}</b></div>
              </>
            ) : (
              <>
                <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{uz ? "Yangi mukofotlar" : "New rewards"}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{uz ? "Ota-onang vazifa bersa shu yerda ko'rinadi" : "Parent-created rewards appear here"}</div>
              </>
            )}
          </div>
          {KI.chev(th.t3, 16)}
        </div>
      </button>
    </div>
  );
}
