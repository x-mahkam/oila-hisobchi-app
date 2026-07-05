import { memo } from "react";
import { ONB_SLIDES } from "../utils/constants.js";
import { PrimaryButton, PremiumButton, GhostButton, Badge, injectUiCss } from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, MOTION, GARDEN, PREMIUM, OPACITY, COMP } from "../utils/tokens.js";

// ═══ Slayd illyustratsiyalari — outline SVG (emoji YO'Q, DS 6-qoida) ═══
// Garden slaydidan tashqari hammasi fintech outline uslubida.
const ILLOS = {
  // 1. Intro: uy + oila + tanga — brend metaforasi
  intro: c => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <path d="M20 58L60 26l40 32" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 54v38h60V54" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill={c} opacity=".06"/>
      <circle cx="60" cy="66" r="11" stroke={c} strokeWidth="2.5" fill={c} opacity=".12"/>
      <circle cx="60" cy="66" r="11" stroke={c} strokeWidth="2.5" fill="none"/>
      <path d="M60 60v12M56.5 63c0-1.4 1.5-2.2 3.5-2.2s3.5.8 3.5 2c0 3.2-7 2.6-7 5.8 0 1.3 1.5 2.1 3.5 2.1s3.5-.8 3.5-2.2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="44" cy="86" r="4.5" stroke={c} strokeWidth="2.5"/>
      <circle cx="76" cy="86" r="4.5" stroke={c} strokeWidth="2.5"/>
      <circle cx="60" cy="88" r="3.5" stroke={c} strokeWidth="2.5"/>
    </svg>
  ),
  // 2. Byudjet: hamyon + kirim/chiqim o'qlari + qarz qo'li
  budget: c => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="24" y="42" width="72" height="50" rx="10" stroke={c} strokeWidth="3" fill={c} opacity=".06"/>
      <rect x="24" y="42" width="72" height="50" rx="10" stroke={c} strokeWidth="3" fill="none"/>
      <path d="M24 56h72" stroke={c} strokeWidth="2.5"/>
      <circle cx="82" cy="74" r="5" fill={c} opacity=".8"/>
      <path d="M40 30l-7 8m7-8l7 8m-7-8v18" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".85"/>
      <path d="M80 38l-7-8m7 8l7-8m-7 8V20" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".45"/>
      <path d="M38 74h20M50 68l8 6-8 6" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
    </svg>
  ),
  // 3. Baraka Bog'i — YAGONA yumshoq illyustrativ slayd (GARDEN tokenlari)
  garden: () => (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
      <circle cx="100" cy="26" r="12" fill={GARDEN.sun} opacity=".9"/>
      <circle cx="100" cy="26" r="17" stroke={GARDEN.sun} strokeWidth="2" opacity=".4"/>
      <ellipse cx="30" cy="30" rx="14" ry="7" fill="#fff" opacity=".85"/>
      <ellipse cx="42" cy="34" rx="10" ry="5.5" fill="#fff" opacity=".7"/>
      <path d="M14 104c14-8 88-8 102 0v14H14v-14z" fill={GARDEN.soil}/>
      <path d="M14 104c14-8 88-8 102 0" stroke={GARDEN.leafDeep} strokeWidth="4" strokeLinecap="round"/>
      <path d="M65 102V64" stroke={GARDEN.trunk} strokeWidth="7" strokeLinecap="round"/>
      <path d="M65 84c-7-3-12-9-13-16M65 76c6-2 10-7 11-13" stroke={GARDEN.trunk} strokeWidth="4" strokeLinecap="round"/>
      <circle cx="65" cy="48" r="22" fill={GARDEN.grass}/>
      <circle cx="47" cy="58" r="13" fill={GARDEN.grass}/>
      <circle cx="83" cy="58" r="13" fill={GARDEN.grass}/>
      <circle cx="65" cy="40" r="13" fill={GARDEN.leafDeep} opacity=".55"/>
      <circle cx="55" cy="50" r="3.5" fill={GARDEN.bloom}/>
      <circle cx="76" cy="46" r="3.5" fill={GARDEN.bloom}/>
      <circle cx="66" cy="58" r="3.5" fill={GARDEN.sun}/>
      <path d="M30 96c2-4 6-4 8 0M92 98c2-4 6-4 8 0" stroke={GARDEN.leafDeep} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  // 4. Hisobotlar: barlar + trend + AI uchquni
  reports: c => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="26" y="66" width="14" height="28" rx="4" fill={c} opacity=".3"/>
      <rect x="48" y="52" width="14" height="42" rx="4" fill={c} opacity=".55"/>
      <rect x="70" y="36" width="14" height="58" rx="4" fill={c} opacity=".85"/>
      <path d="M26 58L52 42l20-6 22-12" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="94" cy="24" r="3.5" fill={c}/>
      <path d="M100 52l2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4 2.4-6.6z" fill={c} opacity=".8"/>
      <path d="M22 100h76" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity=".3"/>
    </svg>
  ),
  // 5. Premium: olmos + nurlar
  premium: c => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <path d="M40 34h40L98 56 60 100 22 56 40 34z" fill={c} opacity=".15" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M22 56h76M48 56L60 100 72 56M40 34l8 22 12-22 12 22 8-22" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M60 12v9M28 22l6 7M92 22l-6 7" stroke={c} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
};

// Til tugmalari — statik ro'yxat (komponent tashqarisida)
const LANGS = ["uz", "ru", "en"];
const TXT = {
  skip: { uz: "O'tkazib yuborish", ru: "Пропустить", en: "Skip" },
  next: { uz: "Keyingi", ru: "Далее", en: "Next" },
  start: { uz: "Boshlash", ru: "Начать", en: "Get started" },
  later: { uz: "Keyinroq", ru: "Позже", en: "Later" },
  back: { uz: "Orqaga", ru: "Назад", en: "Back" },
};

// Slayd rang kaliti → real token qiymati
const slideColor = (key, th) =>
  key === "gold" ? PREMIUM.gold
  : key === "garden" ? GARDEN.grass
  : key === "gr" ? th.gr
  : th.ac;

// ═══ Illyustratsiya halosi — memo, faqat slayd o'zgarsa qayta chiziladi ═══
const Illo = memo(function Illo({ id, color }) {
  const draw = ILLOS[id] || ILLOS.intro;
  return (
    <div className="ui-fadeUp" key={id}
      style={{ width: SPACE.s16 * 3, height: SPACE.s16 * 3, borderRadius: RADIUS.full, background: "linear-gradient(135deg," + color + ALPHA.med + "," + color + ALPHA.faint + ")", border: "1px solid " + color + ALPHA.med, boxShadow: SHADOW.e1(color), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s8 + SPACE.s2 }}>
      {draw(color)}
    </div>
  );
});

export default function OnboardingPage({ th, lg, setLg, dark, onbStep, setOnbStep }) {
  injectUiCss();
  const s = ONB_SLIDES[onbStep];
  if (!s) return null;
  const finish = () => { try { localStorage.setItem("oilaV7Onb", "1"); } catch {} setOnbStep(-1); };
  const c = slideColor(s.color, th);
  const last = onbStep === ONB_SLIDES.length - 1;
  const title = lg === "uz" ? s.titleUz : lg === "ru" ? s.titleRu : s.titleEn;
  const desc = lg === "uz" ? s.descUz : lg === "ru" ? s.descRu : s.descEn;
  const isPremiumSlide = s.id === "premium";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: th.bg }}>
      {/* Yumshoq radial halo — sokin, slayd rangiga ergashadi */}
      <div style={{ position: "fixed", top: -SPACE.s16 * 1.5, left: "50%", transform: "translateX(-50%)", width: SPACE.s16 * 8, height: SPACE.s16 * 8, borderRadius: RADIUS.full, background: "radial-gradient(circle," + c + ALPHA.med + ",transparent 70%)", pointerEvents: "none", transition: MOTION.trSlow("background") }} />

      {/* Yuqori panel: til + Skip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: SPACE.s4 + SPACE.s1 + "px " + SPACE.s6 + "px", position: "relative" }}>
        <div style={{ display: "flex", gap: SPACE.s1 + 2 }}>
          {LANGS.map(l => (
            <button key={l} className="ui-press" onClick={() => { setLg(l); localStorage.setItem("oilaV7L", l); }}
              style={{ background: lg === l ? th.ac + ALPHA.tint : "transparent", border: "1px solid " + (lg === l ? th.ac : th.bor), borderRadius: RADIUS.s - 2, padding: SPACE.s1 + "px " + (SPACE.s2 + 2) + "px", color: lg === l ? th.ac : th.t2, cursor: "pointer", ...TYPE.caption, fontWeight: 600, fontFamily: "inherit" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <GhostButton th={th} onClick={finish} style={{ width: "auto", border: "none", padding: SPACE.s1 + "px " + SPACE.s2 + "px" }}>{TXT.skip[lg] || TXT.skip.uz}</GhostButton>
      </div>

      {/* ═══ Hero → illustration → title → subtitle ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: SPACE.s6 + "px " + SPACE.s8 + "px", position: "relative", textAlign: "center" }}>
        <Illo id={s.id} color={c} />
        {/* 4-slayd: AI/Premium imkoniyatlar — PRO badge */}
        {s.id === "reports" && (
          <div className="ui-fadeUp" style={{ marginBottom: SPACE.s3 }}>
            <Badge th={th} type="pro" />
          </div>
        )}
        <div className="ui-fadeUp" key={"t" + onbStep} style={{ ...TYPE.hero, color: th.t1, marginBottom: SPACE.s3, letterSpacing: "-0.5px" }}>{title}</div>
        <div className="ui-fadeUp" key={"d" + onbStep} style={{ ...TYPE.subtitle, fontWeight: 400, color: th.t2, lineHeight: 1.65, maxWidth: SPACE.s16 * 5 }}>{desc}</div>
        {/* 5-slayd: 3 asosiy foyda */}
        {isPremiumSlide && (
          <div className="ui-fadeUp" style={{ marginTop: SPACE.s4 + SPACE.s1, display: "flex", flexDirection: "column", gap: SPACE.s2, alignItems: "flex-start" }}>
            {(lg === "uz" ? ["Cheksiz maqsad va a'zolar", "PDF/Excel eksport", "AI tavsiyalar"]
              : lg === "ru" ? ["Безлимитные цели и участники", "Экспорт PDF/Excel", "AI-советы"]
              : ["Unlimited goals & members", "PDF/Excel export", "AI insights"]).map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 600, color: th.t1 }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M3 8l4 4 6-7" stroke={PREMIUM.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {b}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Progress indicator + tugmalar ═══ */}
      <div style={{ padding: SPACE.s6 + "px " + SPACE.s8 + "px " + (SPACE.s12 - SPACE.s1) + "px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s2, marginBottom: SPACE.s6 + SPACE.s1 }}>
          {ONB_SLIDES.map((_, i) => (
            <div key={i} style={{ width: i === onbStep ? SPACE.s6 + SPACE.s1 : SPACE.s2, height: SPACE.s2, borderRadius: RADIUS.pill, background: i === onbStep ? c : th.bor, transition: MOTION.tr("width") + "," + MOTION.tr("background") }} />
          ))}
        </div>
        {isPremiumSlide ? (
          <>
            <PremiumButton th={th} onClick={finish} style={{ marginBottom: SPACE.s2 }}>{TXT.start[lg] || TXT.start.uz}</PremiumButton>
            <GhostButton th={th} onClick={finish}>{TXT.later[lg] || TXT.later.uz}</GhostButton>
          </>
        ) : (
          <PrimaryButton th={th} onClick={() => setOnbStep(onbStep + 1)}>{TXT.next[lg] || TXT.next.uz}</PrimaryButton>
        )}
        {onbStep > 0 && (
          <GhostButton th={th} onClick={() => setOnbStep(onbStep - 1)} style={{ border: "none", marginTop: SPACE.s3, opacity: OPACITY.hint }}>{TXT.back[lg] || TXT.back.uz}</GhostButton>
        )}
      </div>
    </div>
  );
}
