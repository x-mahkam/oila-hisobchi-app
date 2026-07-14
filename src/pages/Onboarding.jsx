import { memo, useState } from "react";
import { ONB_SLIDES } from "../utils/constants.js";
import { PrimaryButton, PremiumButton, GhostButton, injectUiCss } from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, MOTION, GARDEN, PREMIUM, OPACITY, COMP } from "../utils/tokens.js";

// ═══ Slayd illyustratsiyalari — outline SVG (emoji YO'Q, DS 6-qoida) ═══
// Garden slaydidan tashqari hammasi fintech outline uslubida.
const ILLOS = {
  // 1. Intro: ilova logotipi
  intro: () => (
    <img src="/icon.svg" alt="Oila Hisobchi" width="120" height="120" style={{ display: "block", borderRadius: RADIUS.l }} />
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
  // 4. Farzandlar uchun Bilim Bozori: bola + yulduz + tanga
  farzand: c => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="48" cy="40" r="14" stroke={c} strokeWidth="3" fill={c} opacity=".12"/>
      <path d="M28 96c0-16 9-26 20-26s20 10 20 26" stroke={c} strokeWidth="3" strokeLinecap="round" fill={c} opacity=".06"/>
      <path d="M28 96c0-16 9-26 20-26s20 10 20 26" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M84 30l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L84 53.5l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5L84 30z" fill={c} opacity=".85"/>
      <circle cx="90" cy="86" r="12" stroke={c} strokeWidth="2.5" fill={c} opacity=".14"/>
      <path d="M90 81v10M86 84c0-1.4 1.6-2.2 4-2.2s4 .9 4 2.2c0 3.6-8 3-8 6.6 0 1.4 1.6 2.2 4 2.2s4-.8 4-2.2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
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
const LANGS = ["uz", "en", "ru", "kk", "ky", "tg", "qr"];
const LANGS_MAP = {
  uz: { label: "🇺🇿 O'zbekcha", name: "O'zbekcha" },
  ru: { label: "🇷🇺 Русский", name: "Русский" },
  kk: { label: "🇰🇿 Қазақша", name: "Қазақша" },
  ky: { label: "🇰🇬 Кыргызча", name: "Кыргызча" },
  tg: { label: "🇹🇯 Тоҷикӣ", name: "Тоҷикӣ" },
  qr: { label: "🇺🇿 Qaraqalpaqsha", name: "Qaraqalpaqsha" },
  en: { label: "🇬🇧 English", name: "English" }
};
const TXT = {
  skip: { uz: "O'tkazib yuborish", ru: "Пропустить", en: "Skip", kk: "Өткізіп жіберу", ky: "Өткөрүп жиберүү", tg: "Гузаштан", qr: "O'tkazib yuborish" },
  next: { uz: "Keyingi", ru: "Далее", en: "Next", kk: "Келесі", ky: "Кийинки", tg: "Кӯдаки", qr: "Keyingi" },
  start: { uz: "Boshlash", ru: "Начать", en: "Get started", kk: "Бастау", ky: "Баштоо", tg: "Оғоз", qr: "Boshlash" },
  later: { uz: "Keyinroq", ru: "Позже", en: "Later", kk: "Кейінірек", ky: "Кийинчерээк", tg: "Дертар", qr: "Keyinroq" },
  back: { uz: "Orqaga", ru: "Назад", en: "Back", kk: "Артқа", ky: "Артка", tg: "Қафо", qr: "Orqaga" },
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
  const [showLgDD, setShowLgDD] = useState(false);
  const s = ONB_SLIDES[onbStep];
  if (!s) return null;
  const finish = () => { try { localStorage.setItem("oilaV7Onb", "1"); } catch {} setOnbStep(-1); };
  const c = slideColor(s.color, th);
  const last = onbStep === ONB_SLIDES.length - 1;
  const title = (lg === "uz" || lg === "qr") ? s.titleUz : (lg === "ru" || lg === "kk" || lg === "ky" || lg === "tg") ? s.titleRu : s.titleEn;
  const desc = (lg === "uz" || lg === "qr") ? s.descUz : (lg === "ru" || lg === "kk" || lg === "ky" || lg === "tg") ? s.descRu : s.descEn;
  const isPremiumSlide = s.id === "premium";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: th.bg }}>
      {/* Yumshoq radial halo — sokin, slayd rangiga ergashadi */}
      <div style={{ position: "fixed", top: -SPACE.s16 * 1.5, left: "50%", transform: "translateX(-50%)", width: SPACE.s16 * 8, height: SPACE.s16 * 8, borderRadius: RADIUS.full, background: "radial-gradient(circle," + c + ALPHA.med + ",transparent 70%)", pointerEvents: "none", transition: MOTION.trSlow("background") }} />

      {/* Yuqori panel: til + Skip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: SPACE.s4 + SPACE.s1 + "px " + SPACE.s6 + "px", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 100 }}>
          <button onClick={() => setShowLgDD(v => !v)} className="ui-press"
            style={{ background: th.sur, border: "1px solid " + (showLgDD ? th.ac : th.bor), borderRadius: RADIUS.s - 2, padding: (SPACE.s1 + 2) + "px " + SPACE.s3 + "px", color: th.t1, cursor: "pointer", ...TYPE.caption, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{(LANGS_MAP[lg] || LANGS_MAP.uz).label}</span>
            <span style={{ transform: showLgDD ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-flex", fontSize: 10 }}>▼</span>
          </button>
          {showLgDD && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, minWidth: 165, maxHeight: 180, overflowY: "auto", zIndex: 200, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => { setLg(l); localStorage.setItem("oilaV7L", l); setShowLgDD(false); }}
                  style={{ width: "100%", background: lg === l ? th.ac + ALPHA.faint : "none", border: "none", borderBottom: "1px solid " + th.bor, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: lg === l ? th.ac : th.t1, ...TYPE.caption, fontWeight: lg === l ? 700 : 500, textAlign: "left" }}>
                  <span>{LANGS_MAP[l].label}</span>
                  {lg === l && <span style={{ color: th.ac, fontSize: 12 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <GhostButton th={th} onClick={finish} style={{ width: "auto", border: "none", padding: SPACE.s1 + "px " + SPACE.s2 + "px" }}>{TXT.skip[lg] || TXT.skip.uz}</GhostButton>
      </div>

      {/* ═══ Hero → illustration → title → subtitle ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: SPACE.s6 + "px " + SPACE.s8 + "px", position: "relative", textAlign: "center" }}>
        <Illo id={s.id} color={c} />
        <div className="ui-fadeUp" key={"t" + onbStep} style={{ ...TYPE.hero, color: th.t1, marginBottom: SPACE.s3, letterSpacing: "-0.5px" }}>{title}</div>
        <div className="ui-fadeUp" key={"d" + onbStep} style={{ ...TYPE.subtitle, fontWeight: 400, color: th.t2, lineHeight: 1.65, maxWidth: SPACE.s16 * 5 }}>{desc}</div>
        {/* 5-slayd: 3 asosiy foyda */}
        {isPremiumSlide && (
          <div className="ui-fadeUp" style={{ marginTop: SPACE.s4 + SPACE.s1, display: "flex", flexDirection: "column", gap: SPACE.s2, alignItems: "flex-start" }}>
            {(lg === "uz" ? ["Cheksiz maqsad va a'zolar", "PDF/Excel eksport", "Foydali tavsiyalar"]
              : lg === "ru" ? ["Безлимитные цели и участники", "Экспорт PDF/Excel", "AI-советы"]
              : ["Unlimited goals & members", "PDF/Excel export", "Useful insights"]).map(b => (
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
