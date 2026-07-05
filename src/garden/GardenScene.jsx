// ═══════════════════════════════════════════════════════════
//  GARDEN SCENE — sahifaning yuragi: tirik, interaktiv bog'
//  Osmon (kun/kech/tun) · bulut drifti · qushlar · 5 uchastka ·
//  pishuvchi quyoshlar · sug'orish/hosil/ekish boshqaruvi.
//  Faqat SVG + CSS (transform/opacity) — 60fps WebView.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SPACE, TYPE, SHADOW } from "../utils/tokens.js";
import { ART, SKY_GRAD } from "./gardenTokens.js";
import { SUN_POS, PLOT_POS, PLOT_SCALE, PLOTS, SPEEDUP_COST } from "./constants.js";
import {
  SunSprite, MoonSprite, Cloud, Bird, Fence, Bush, ForegroundLeaves,
  CoinSVG, CanSVG, GiftSVG, SeedSVG, ShovelSVG, DropSVG, RocketSVG,
  PlantSVG, PlotOval, BoltSVG,
} from "./sprites.jsx";

// ── Tungi yulduzlar (dekorativ, arzon) ──────────────────────
const NightStars = memo(function NightStars() {
  const pts = [[12, 14], [30, 8], [52, 18], [70, 10], [86, 20], [22, 30], [62, 32], [90, 38]];
  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "55%", pointerEvents: "none" }}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 0.5 : 0.8} fill={ART.sunHi}
          style={{ animation: "gdTwinkle " + (2.4 + i * 0.4) + "s ease-in-out infinite" }} />
      ))}
    </svg>
  );
});

// ── Uchuvchi mukofot (+N tanga/energiya/quyosh) ─────────────
const FLY_ICONS = { coin: s => <CoinSVG size={s} />, bolt: s => <BoltSVG size={s} />, sun: s => <SunSprite size={s} /> };
const FlyReward = memo(function FlyReward({ item }) {
  const Ico = FLY_ICONS[item.icon] || FLY_ICONS.coin;
  return (
    <div style={{ position: "absolute", left: item.x + "%", top: item.y + "%", zIndex: 89, animation: "gdCoinFly 1.4s ease forwards", pointerEvents: "none", display: "flex", alignItems: "center", gap: SPACE.s1 }}>
      <span style={{ ...TYPE.subtitle, fontWeight: 800, color: ART.sunRay, textShadow: "0 2px 8px " + ART.trunkLo }}>{item.amount > 0 ? "+" + item.amount : item.amount}</span>
      {Ico(16)}
    </div>
  );
});

// ── Sug'orish animatsiyasi: tomchilar + halqa to'lqin ───────
const WaterFX = memo(function WaterFX() {
  return (
    <div style={{ position: "absolute", left: "50%", top: "-36%", transform: "translateX(-50%)", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ position: "absolute", left: (i - 1.5) * 14, animation: "gdDrop .6s ease-in " + i * 0.12 + "s both" }}>
          <DropSVG size={12} />
        </div>
      ))}
      <div style={{ position: "absolute", left: -22, top: 52, width: 44, height: 16, border: "2px solid " + ART.waterHi, borderRadius: RADIUS.full, opacity: 0, animation: "gdRipple .5s ease-out .55s both" }} />
    </div>
  );
});

export const GardenScene = memo(function GardenScene({
  gt, mode, L, plots, selected, coins, now, fTime,
  waterReady, waterTimer, digAnim, growAnim, waterAnim, sunNote,
  flyRewards, sunCycle,
  onPlotTap, onSunTap, onAction, onSpeedUp,
  full = false,
}) {
  const selPlot = plots.find(p => p.id === selected) || plots[0];
  const selStage = selPlot?.stage ?? -1;
  const showSpeedUp = !waterReady && selStage >= 0 && !selPlot?.harvestReady;
  const actionReady = waterReady || selStage < 0 || selPlot?.harvestReady;

  return (
    <div className={full ? "gd-scene-full" : undefined} style={full
      ? { background: SKY_GRAD[mode], userSelect: "none" }
      : { position: "relative", borderRadius: RADIUS.l, overflow: "hidden", background: SKY_GRAD[mode], boxShadow: SHADOW.e2, userSelect: "none", border: "1px solid " + gt.bor }}>
      {/* ── Yorug'lik nuri ── */}
      {mode === "day" && (
        <div style={{ position: "absolute", top: "-14%", left: "-24%", width: "70%", height: "90%", background: "linear-gradient(115deg," + gt.ray1 + "," + gt.ray0 + " 62%)", transform: "rotate(8deg)", pointerEvents: "none", animation: "gdRay 6s ease-in-out infinite" }} />
      )}
      {mode === "night" && <NightStars />}

      {/* ── Dekorativ quyosh/oy ── */}
      <div style={{ position: "absolute", left: "6%", top: full ? "calc(4% + env(safe-area-inset-top))" : "4%", pointerEvents: "none", animation: mode === "night" ? "none" : "gdSunGlow 4s ease-in-out infinite" }}>
        {mode === "night" ? <MoonSprite size={44} /> : <SunSprite size={50} />}
      </div>

      {/* ── Osmon: bulutlar, qushlar, pishuvchi quyoshlar ── */}
      <div className={full ? "gd-sky-full" : undefined} style={full
        ? undefined
        : { position: "relative", height: "clamp(150px, 32vw, 200px)", zIndex: 10 }}>
        <div style={{ position: "absolute", left: "16%", top: "30%", animation: "gdDrift 70s ease-in-out infinite" }}><Cloud w={70} o={0.9} /></div>
        <div style={{ position: "absolute", right: "8%", top: "8%", animation: "gdDrift 90s ease-in-out infinite reverse" }}><Cloud w={100} /></div>
        <div style={{ position: "absolute", right: "34%", top: "52%", animation: "gdDrift 60s ease-in-out infinite" }}><Cloud w={52} o={0.85} /></div>
        <div style={{ position: "absolute", top: "22%", left: 0, animation: "gdBird 34s linear infinite", opacity: 0 }}><Bird size={20} /></div>
        <div style={{ position: "absolute", top: "40%", left: 0, animation: "gdBird 46s linear 12s infinite", opacity: 0 }}><Bird size={14} /></div>

        {plots.filter(p => p.stage >= 0).map(p => {
          const pos = SUN_POS[p.id] || SUN_POS[0];
          const rem = Math.max(0, Math.ceil((sunCycle - (now - (p.lastSunAt || 0))) / 1000));
          const ready = rem <= 0;
          return (
            <div key={p.id} onClick={() => onSunTap(p.id, ready)}
              style={{ position: "absolute", left: pos.x + "%", top: pos.y + "%", transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, WebkitTapHighlightColor: "transparent" }}>
              {!ready && sunNote !== p.id && (
                <div style={{ background: gt.skyScrim, borderRadius: RADIUS.pill, padding: SPACE.s1 - 1 + "px " + (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 700, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{fTime(rem)}</div>
              )}
              {sunNote === p.id && (
                <div style={{ maxWidth: 150, textAlign: "center", ...TYPE.caption, fontWeight: 800, color: gt.onSky, lineHeight: 1.35, textShadow: "0 1px 3px " + ART.trunkLo, animation: "gdNote 3s ease forwards", pointerEvents: "none" }}>
                  {L("Vaqt hali tugamadi, iltimos sabr qiling", "Время ещё не вышло, подождите")}
                </div>
              )}
              <div style={{ animation: ready ? "gdSunPulse 2s ease-in-out infinite, gdSunGlow 2s ease-in-out infinite" : "none", opacity: ready ? 1 : 0.88, transform: ready ? "none" : "scale(.86)" }}>
                <SunSprite size={48} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Yaylov ── */}
      <div className={full ? "gd-meadow-full" : undefined} style={full
        ? undefined
        : { position: "relative", height: "clamp(300px, 68vw, 420px)", zIndex: 11 }}>
        <svg viewBox="0 0 480 80" preserveAspectRatio="none" style={{ position: "absolute", top: -46, left: 0, width: "100%", height: 60 }}>
          <path d="M0 80 Q 90 6 230 34 Q 260 40 300 28 Q 390 4 480 42 L480 80 Z" fill={ART.grassHi} />
          <ellipse cx="415" cy="34" rx="14" ry="9" fill={ART.leafLo} />
          <ellipse cx="368" cy="44" rx="9" ry="6" fill={ART.leafLo} />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg," + ART.grassHi + " 0%," + ART.grass + " 45%," + ART.grassLo + " 100%)" }} />

        <div style={{ position: "absolute", top: -8, left: "4%" }}><Fence w={150} /></div>
        <div style={{ position: "absolute", top: "24%", right: "-2%" }}><Fence w={120} flip /></div>
        <div style={{ position: "absolute", top: -20, left: -22 }}><Bush w={82} /></div>
        <div style={{ position: "absolute", top: "38%", left: -30 }}><Bush w={64} /></div>

        {plots.map(plot => {
          const pos = PLOT_POS[plot.id];
          const pl = PLOTS.find(p => p.id === plot.id);
          const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
          const isDigging = digAnim?.plotId === plot.id;
          return (
            <div key={plot.id} style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translateX(-50%)", width: pos.w, zIndex: pos.z }}>
              <PlotOval w="100%" locked={!isUnlocked} cost={pl?.unlockCost}
                selected={selected === plot.id && isUnlocked && plot.stage >= 0}
                onClick={() => onPlotTap(plot)}>
                {isUnlocked && plot.stage >= 0 && !isDigging && (
                  <div style={{ position: "absolute", left: "50%", bottom: "42%", transform: "translateX(-50%)", animation: growAnim === plot.id ? "gdGrowPop .8s ease" : "none", pointerEvents: "none" }}>
                    <PlantSVG stage={plot.stage} size={110 * PLOT_SCALE[plot.id]} animated={plot.stage >= 1} />
                  </div>
                )}
                {growAnim === plot.id && (
                  <div style={{ position: "absolute", left: "50%", bottom: "60%", pointerEvents: "none" }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ position: "absolute", left: (i - 2.5) * 13, animation: "gdLeafBurst .9s ease-out " + i * 0.06 + "s both" }}>
                        <svg width="12" height="12" viewBox="0 0 16 16"><path d="M2 14 Q 2 4 14 2 Q 13 13 5 13 Q 3.6 13 2 14 Z" fill={i % 2 ? ART.leafHi : ART.grass} /></svg>
                      </div>
                    ))}
                  </div>
                )}
                {isDigging && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", animation: "gdDig .38s ease infinite", pointerEvents: "none" }}>
                    <ShovelSVG size={30} />
                  </div>
                )}
                {waterAnim && selected === plot.id && <WaterFX />}
                {plot.harvestReady && (
                  <div style={{ position: "absolute", right: "6%", top: "-24%", animation: "gdShimmer 1.6s ease-in-out infinite, gdBounce 1.6s ease-in-out infinite", pointerEvents: "none" }}>
                    <GiftSVG size={30} />
                  </div>
                )}
              </PlotOval>
            </div>
          );
        })}

        {/* ── Tanga hisoblagichi (chap past) ── */}
        <div style={{ position: "absolute", left: SPACE.s4, bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1 }}>
          <CoinSVG size={54} />
          <div style={{ background: gt.sceneScrim, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 2) + "px " + SPACE.s4 + "px", ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{coins.toLocaleString()}</div>
        </div>

        {/* ── Tezlashtirish (markaz past) ── */}
        {showSpeedUp && (
          <button onClick={onSpeedUp} className="ui-press" style={{ position: "absolute", left: "50%", bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, transform: "translateX(-50%)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", WebkitTapHighlightColor: "transparent", padding: 0 }}>
            <div style={{ animation: "gdBounce 1.8s ease-in-out infinite" }}><RocketSVG size={34} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 }}>
              <CoinSVG size={16} />
              <span style={{ ...TYPE.body, fontWeight: 800, color: gt.onSky, textShadow: "0 1px 4px " + ART.trunkLo }}>−{SPEEDUP_COST}</span>
            </div>
            <div style={{ background: gt.goldGrad, borderRadius: RADIUS.pill, padding: (SPACE.s1 + 1) + "px " + SPACE.s4 + "px", ...TYPE.caption, fontWeight: 800, color: gt.onSky, boxShadow: SHADOW.e1(ART.sunLo) }}>
              {L("Tezlatish", "Ускорить")}
            </div>
          </button>
        )}

        {/* ── Asosiy harakat (o'ng past): ekish / sug'orish / hosil ── */}
        <div style={{ position: "absolute", right: SPACE.s4, bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1 }}>
          <button onClick={onAction} className="ui-press-fab ui-press" aria-label={L("Bog' harakati", "Действие")}
            style={{ width: 72, height: 72, borderRadius: RADIUS.full, border: "3px solid " + gt.glassBorder, cursor: "pointer", background: actionReady ? gt.accGrad : "linear-gradient(135deg," + gt.ink3 + "," + gt.ink2 + ")", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e1(actionReady ? ART.leafLo : gt.ink3), position: "relative", WebkitTapHighlightColor: "transparent" }}>
            {selStage < 0
              ? <SeedSVG size={40} />
              : selPlot?.harvestReady
                ? <GiftSVG size={36} />
                : <CanSVG size={48} />}
            {waterReady && selStage >= 0 && !selPlot?.harvestReady && (
              <div style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: RADIUS.full, background: ART.leafHi, border: "2.5px solid " + gt.sur }} />
            )}
          </button>
          <div style={{ background: gt.sceneScrim, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 2) + "px " + SPACE.s3 + "px", ...TYPE.caption, fontWeight: 800, color: actionReady ? ART.leafGlint : ART.coinHi, fontVariantNumeric: "tabular-nums" }}>
            {selStage < 0 ? L("Ekish", "Посеять")
              : selPlot?.harvestReady ? L("Hosil!", "Урожай!")
              : waterReady ? L("Sug'orish", "Полить")
              : fTime(waterTimer)}
          </div>
        </div>

        <ForegroundLeaves />
      </div>

      {/* ── Uchuvchi mukofotlar ── */}
      {flyRewards.map(c => <FlyReward key={c.id} item={c} />)}
    </div>
  );
});
