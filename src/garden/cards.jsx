// ═══════════════════════════════════════════════════════════
//  GARDEN CARDS — bog' zonasining karta komponentlari
//  LevelGauge (yarim doira, glow) · StatPill · TodayRow ·
//  PlantCard (Garden Card, AppCard emas) · AchievementCard
//  (collectible) · RewardRow · TipCard · GardenEmpty.
//  Hammasi React.memo, ranglar faqat gardenTokens dan.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SPACE, TYPE, SHADOW, MOTION, OPACITY, ALPHA } from "../utils/tokens.js";
import { ART } from "./gardenTokens.js";
import { STAGES } from "./constants.js";
import { CoinSVG, GemSVG, BoltSVG, LockSVG, PlantSVG, SeedSVG, SunSprite, LeafSVG, GiftSVG } from "./sprites.jsx";

/** Seksiya labeli — bog' ohangida (uppercase tiny + barg). */
export const GSection = memo(function GSection({ gt, children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: SPACE.s6 + "px 0 " + SPACE.s2 + "px", paddingLeft: SPACE.s1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
        <LeafSVG size={12} />
        <span style={{ ...TYPE.tiny, fontWeight: 700, letterSpacing: 1.5, color: gt.ink2 }}>{children}</span>
      </div>
      {right}
    </div>
  );
});

/** Bog' kartasi bazasi (garden-surface). */
export const GCard = memo(function GCard({ gt, children, onClick, pad = SPACE.s4, style }) {
  const s = { background: gt.sur, border: "1px solid " + gt.bor, borderRadius: RADIUS.m, padding: pad, marginBottom: SPACE.s3, boxSizing: "border-box", ...style };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...s, width: "100%", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "block" }}>{children}</button>;
  return <div style={s}>{children}</div>;
});

/** Bog' progress chizig'i (leafDeep→grass, tuproq trek). */
export const GProgress = memo(function GProgress({ value = 0, height = SPACE.s2 + 2, gold, style }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}
      style={{ width: "100%", height, borderRadius: RADIUS.pill, background: ART.soil + ALPHA.med, overflow: "hidden", ...style }}>
      <div style={{ width: v + "%", height: "100%", borderRadius: RADIUS.pill, background: gold ? "linear-gradient(90deg," + ART.sun + "," + ART.sunLo + ")" : "linear-gradient(90deg," + ART.leaf + "," + ART.grass + ")", transition: MOTION.trSlow("width") }} />
    </div>
  );
});

/** Daraja — yarim doira gauge: gradient yoy + glow + markazda raqam. */
export const LevelGauge = memo(function LevelGauge({ gt, level, progress, stageName, t }) {
  const size = 210, stroke = 15;
  const r = (size - stroke) / 2;
  const half = Math.PI * r;
  const v = Math.max(0, Math.min(100, progress));
  return (
    <div style={{ position: "relative", width: size, height: size / 2 + stroke, margin: "0 auto" }}>
      <svg width={size} height={size / 2 + stroke} viewBox={"0 0 " + size + " " + (size / 2 + stroke)} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="gdLevelArc" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={ART.leaf} />
            <stop offset="55%" stopColor={ART.grass} />
            <stop offset="100%" stopColor={ART.sun} />
          </linearGradient>
        </defs>
        <path d={"M " + stroke / 2 + " " + (size / 2 + stroke / 2) + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + (size / 2 + stroke / 2)}
          fill="none" stroke={gt.surH} strokeWidth={stroke} strokeLinecap="round" />
        <path d={"M " + stroke / 2 + " " + (size / 2 + stroke / 2) + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + (size / 2 + stroke / 2)}
          fill="none" stroke="url(#gdLevelArc)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={half} strokeDashoffset={half * (1 - v / 100)}
          style={{ transition: MOTION.trSlow("stroke-dashoffset"), filter: "drop-shadow(0 0 8px " + gt.glow + ")" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 0 }}>
        <div style={{ ...TYPE.tiny, color: gt.ink3 }}>{t("g078")}</div>
        <div style={{ ...TYPE.display, color: gt.ink1, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{level}</div>
        <div style={{ ...TYPE.caption, fontWeight: 700, color: gt.acc, marginTop: SPACE.s1 - 2 }}>{stageName}</div>
      </div>
    </div>
  );
});

/** Mini statistika (tanga / energiya / kristall). */
export const StatPill = memo(function StatPill({ gt, kind, value, label }) {
  const ico = kind === "coin" ? <CoinSVG size={22} /> : kind === "gem" ? <GemSVG size={20} /> : <BoltSVG size={20} />;
  return (
    <div style={{ flex: 1, minWidth: 0, background: gt.sur, border: "1px solid " + gt.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s2 + "px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s1 }}>{ico}</div>
      <div style={{ ...TYPE.heading, color: gt.ink1, fontVariantNumeric: "tabular-nums" }}>{value.toLocaleString()}</div>
      <div style={{ ...TYPE.tiny, color: gt.ink2, marginTop: SPACE.s1 - 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
});

/** Bugungi jarayon qatori. */
export const TodayRow = memo(function TodayRow({ gt, icon, title, sub, done, right, onClick, last }) {
  const inner = (
    <>
      <div style={{ width: 38, height: 38, borderRadius: RADIUS.s, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.subtitle, color: gt.ink1 }}>{title}</div>
        {sub && <div style={{ ...TYPE.caption, color: done ? gt.acc : gt.ink2, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </>
  );
  const base = { display: "flex", alignItems: "center", gap: SPACE.s3, padding: SPACE.s3 + "px 0", borderBottom: last ? "none" : "1px solid " + gt.bor };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...base, width: "100%", background: "transparent", border: "none", borderBottom: base.borderBottom, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{inner}</button>;
  return <div style={base}>{inner}</div>;
});

/** Holat chipi. */
export const GChip = memo(function GChip({ gt, tone = "leaf", children }) {
  const map = {
    leaf: { bg: ART.leaf + ALPHA.med, c: gt.dark ? ART.leafHi : ART.leafLo },
    gold: { bg: ART.sun + ALPHA.med, c: gt.gold },
    soil: { bg: ART.soil + ALPHA.med, c: gt.ink2 },
    water: { bg: ART.water + ALPHA.med, c: gt.dark ? ART.waterHi : ART.waterLo },
  };
  const t = map[tone] || map.leaf;
  return <span style={{ ...TYPE.tiny, letterSpacing: 0.6, fontWeight: 700, color: t.c, background: t.bg, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px", whiteSpace: "nowrap" }}>{children}</span>;
});

const chev = c => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6 4l4 4-4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/**
 * PlantCard — har uchastkaning Garden Card ko'rinishi.
 * Holatlar: locked · empty (ekishga tayyor) · growing · ready.
 */
export const PlantCard = memo(function PlantCard({ gt, plot, cost, t, onClick, selected }) {
  const locked = !(plot.id === 0 || plot.unlocked || plot.stage >= 0);
  const st = plot.stage;
  const stInfo = st >= 0 ? STAGES[st] : null;
  const state = locked ? "locked" : st < 0 ? "empty" : plot.harvestReady ? "ready" : "growing";
  const need = stInfo?.waterNeeded || 1;
  const prog = state === "growing" ? Math.min(100, ((plot.waterCount || 0) / need) * 100) : state === "ready" ? 100 : 0;

  const visual = locked
    ? <div style={{ opacity: OPACITY.hint, filter: "grayscale(.6)" }}><SeedSVG size={34} /></div>
    : st < 0 ? <SeedSVG size={36} />
    : <PlantSVG stage={st} size={st >= 3 ? 42 : 52} animated={false} />;

  return (
    <button className="ui-press" onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: SPACE.s3, background: gt.sur, border: (selected ? "1.5px solid " + gt.acc : "1px solid " + gt.bor), borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s2 + 2, cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxSizing: "border-box" }}>
      <div style={{ width: 62, height: 62, borderRadius: RADIUS.s + 3, background: locked ? gt.surH : "linear-gradient(180deg," + ART.skyBottom + ALPHA.strong + "," + ART.grassHi + ALPHA.strong + ")", border: "1px solid " + gt.bor, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: SPACE.s1, flexShrink: 0, overflow: "hidden", position: "relative" }}>
        {visual}
        {locked && <div style={{ position: "absolute", top: 3, right: 3 }}><LockSVG size={13} tone={gt.ink3} /></div>}
        {state === "ready" && <div style={{ position: "absolute", top: 3, right: 3, animation: "gdBounce 1.6s ease-in-out infinite" }}><GiftSVG size={15} /></div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: 2 }}>
          <span style={{ ...TYPE.subtitle, color: gt.ink1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t("g187")} {plot.id + 1}
          </span>
          {state === "locked" && <GChip gt={gt} tone="soil">{t("g188")}</GChip>}
          {state === "empty" && <GChip gt={gt} tone="water">{t("g189")}</GChip>}
          {state === "growing" && <GChip gt={gt} tone="leaf">{t("g190")}</GChip>}
          {state === "ready" && <GChip gt={gt} tone="gold">{t("g191")}</GChip>}
        </div>
        {state === "locked" && (
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 }}>
            <CoinSVG size={14} />
            <span style={{ ...TYPE.caption, fontWeight: 700, color: gt.gold, fontVariantNumeric: "tabular-nums" }}>{cost?.toLocaleString()}</span>
            <span style={{ ...TYPE.caption, color: gt.ink3 }}>{t("g192")}</span>
          </div>
        )}
        {state === "empty" && <div style={{ ...TYPE.caption, color: gt.ink2 }}>{t("g193")}</div>}
        {(state === "growing" || state === "ready") && (
          <>
            <div style={{ ...TYPE.caption, color: gt.ink2, marginBottom: SPACE.s1 }}>
              {t("stage_" + stInfo.id)}
              {state === "growing" && <span style={{ color: gt.ink3 }}> · {plot.waterCount || 0}/{need} {t("g194")}</span>}
            </div>
            <GProgress value={prog} gold={state === "ready"} height={SPACE.s2 - 2} />
          </>
        )}
      </div>
      {chev(gt.ink3)}
    </button>
  );
});

/** AchievementCard — collectible karta (badge emas). */
export const AchievementCard = memo(function AchievementCard({ gt, icon, title, desc, reward, unlocked, t }) {
  return (
    <div style={{ background: unlocked ? ART.sun + ALPHA.faint : gt.sur, border: unlocked ? "1.5px solid " + ART.sun + ALPHA.strong : "1px dashed " + gt.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s3 + "px", display: "flex", flexDirection: "column", gap: SPACE.s2, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 42, height: 42, borderRadius: RADIUS.full, background: unlocked ? gt.goldGrad : gt.surH, display: "flex", alignItems: "center", justifyContent: "center", filter: unlocked ? "none" : "grayscale(1)", opacity: unlocked ? 1 : OPACITY.hint, boxShadow: unlocked ? SHADOW.e1(ART.sunLo) : "none" }}>
          {icon}
        </div>
        {unlocked
          ? <GChip gt={gt} tone="gold">{t("g195")}</GChip>
          : <LockSVG size={15} tone={gt.ink3} />}
      </div>
      <div>
        <div style={{ ...TYPE.subtitle, color: unlocked ? gt.ink1 : gt.ink2 }}>{title}</div>
        <div style={{ ...TYPE.caption, color: gt.ink3, marginTop: 1, lineHeight: 1.4 }}>{desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1, marginTop: "auto", paddingTop: SPACE.s1 }}>
        <CoinSVG size={13} />
        <span style={{ ...TYPE.tiny, letterSpacing: 0.4, color: unlocked ? gt.gold : gt.ink3 }}>{reward}</span>
      </div>
    </div>
  );
});

/** RewardRow — tanga topish yo'llari. */
export const RewardRow = memo(function RewardRow({ gt, icon, label, amount, kind = "coin", negative, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, padding: (SPACE.s2 + 1) + "px 0", borderBottom: last ? "none" : "1px solid " + gt.bor }}>
      <div style={{ width: 34, height: 34, borderRadius: RADIUS.s, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ flex: 1, ...TYPE.body, color: gt.ink1 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: SPACE.s1, background: negative ? ART.soil + ALPHA.med : ART.sun + ALPHA.med, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px" }}>
        <span style={{ ...TYPE.caption, fontWeight: 800, color: negative ? gt.ink2 : gt.gold, fontVariantNumeric: "tabular-nums" }}>{negative ? "−" : "+"}{amount}</span>
        {kind === "coin" ? <CoinSVG size={13} /> : <BoltSVG size={12} />}
      </span>
    </div>
  );
});

/** TipCard — maslahat. */
export const TipCard = memo(function TipCard({ gt, title, children }) {
  return (
    <div style={{ background: ART.leaf + ALPHA.soft, border: "1px solid " + ART.leaf + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s2 + 2, display: "flex", gap: SPACE.s3, alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, marginTop: 2 }}><LeafSVG size={16} /></span>
      <div style={{ minWidth: 0 }}>
        {title && <div style={{ ...TYPE.caption, fontWeight: 700, color: gt.dark ? ART.leafHi : ART.leafLo, marginBottom: SPACE.s1 - 2 }}>{title}</div>}
        <div style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
});

/** GardenEmpty — illyustrativ bo'sh holat (DS 5.13 istisnosi). */
export const GardenEmpty = memo(function GardenEmpty({ gt, t, onPlant }) {
  return (
    <div style={{ background: gt.sur, border: "1px dashed " + gt.bor, borderRadius: RADIUS.m, padding: SPACE.s8 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, textAlign: "center" }}>
      <div className="ui-fadeUp">
        <svg width="130" height="86" viewBox="0 0 130 86" style={{ display: "block", margin: "0 auto " + SPACE.s3 + "px" }}>
          <g style={{ animation: "gdSunGlow 4s ease-in-out infinite" }}>
            <circle cx="106" cy="20" r="11" fill="url(#gdSun)" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
              <rect key={a} x="104.6" y="2" width="2.8" height="7" rx="1.4" fill={ART.sunRay} transform={"rotate(" + a + " 106 20)"} />
            ))}
          </g>
          <ellipse cx="58" cy="70" rx="46" ry="13" fill="url(#gdDirt)" />
          <ellipse cx="58" cy="73" rx="38" ry="9" fill={ART.soilLo} />
          <g style={{ animation: "gdBounce 2.2s ease-in-out infinite" }}>
            <ellipse cx="58" cy="62" rx="12" ry="9.5" fill={ART.trunk} />
            <ellipse cx="54" cy="58" rx="3.6" ry="2.6" fill={ART.trunkHi} opacity="0.9" />
            <path d="M58 53 Q55 46 58 40 Q61 46 58 53Z" fill="url(#gdLeaf)" />
          </g>
          <path d="M16 66 q2 -7 5.6 -8 q-1 7 -5.6 8 Z" fill={ART.grassHi} />
          <path d="M102 70 q2 -7 5.6 -8 q-1 7 -5.6 8 Z" fill={ART.grassHi} />
        </svg>
        <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 + 2 }}>{t("g196")}</div>
        <div style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.5, maxWidth: 250, margin: "0 auto " + SPACE.s4 + "px" }}>
          {t("g197")}
        </div>
        <button className="ui-press" onClick={onPlant}
          style={{ background: gt.accGrad, border: "none", borderRadius: RADIUS.m, padding: (SPACE.s3 - 1) + "px " + SPACE.s6 + "px", color: gt.sur, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", boxShadow: SHADOW.e1(ART.leafLo), fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: SPACE.s2 }}>
          <SeedSVG size={22} />
          {t("g198")}
        </button>
      </div>
    </div>
  );
});
