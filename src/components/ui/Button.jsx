// ═══════════════════════════════════════════════════════════
//  BUTTONS
//  Qayerda: barcha sahifalar, sheet/dialog footerlari.
//  Qachon: har qanday harakat. Ekranda faqat 1 ta PrimaryButton.
//  Qachon EMAS: navigatsiya qatori uchun (SettingRow ishlating),
//              matn ichidagi havola uchun.
//  Tokenlar: RADIUS.m/s, SHADOW.e1, TYPE.subtitle, COMP.btnPadY,
//            ALPHA, OPACITY.disabled, PREMIUM.grad, SPACE.
//  Dark mode: th orqali avtomatik.
//  A11y: balandlik ≥44px (COMP.touchMin), disabled holatda cursor
//        default, aria-label IconButton/FAB uchun majburiy prop.
//  Animation: .ui-press (120ms scale), FAB .ui-press-fab (spring his).
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SHADOW, TYPE, ALPHA, OPACITY, COMP, SPACE, PREMIUM } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

const base = {
  width: "100%", border: "none", borderRadius: RADIUS.m, cursor: "pointer",
  fontSize: TYPE.subtitle.fontSize, fontWeight: 700, fontFamily: "inherit",
  display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2,
  boxSizing: "border-box",
};
const dis = disabled => disabled ? { opacity: OPACITY.disabled, cursor: "default", pointerEvents: "none" } : null;

/** Ekrandagi ASOSIY harakat — sahifada faqat bittasi. */
export const PrimaryButton = memo(function PrimaryButton({ th, children, onClick, disabled, style }) {
  injectUiCss();
  return (
    <button className="ui-press" onClick={onClick} disabled={disabled}
      style={{ ...base, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", color: "#fff", padding: COMP.btnPadY + "px", boxShadow: SHADOW.e1(th.ac), ...dis(disabled), ...style }}>
      {children}
    </button>
  );
});

/** Ikkilamchi harakat: Tahrirlash, Qo'shish, Bekor qilish. */
export const SecondaryButton = memo(function SecondaryButton({ th, children, onClick, disabled, style }) {
  injectUiCss();
  return (
    <button className="ui-press" onClick={onClick} disabled={disabled}
      style={{ ...base, background: th.ac + ALPHA.soft, color: th.ac, border: "1px solid " + th.ac + ALPHA.strong, padding: SPACE.s3 + "px", ...dis(disabled), ...style }}>
      {children}
    </button>
  );
});

/** Uchinchi darajali: Yopish, Keyinroq. Vizual bosim minimal. */
export const GhostButton = memo(function GhostButton({ th, children, onClick, disabled, style }) {
  injectUiCss();
  return (
    <button className="ui-press" onClick={onClick} disabled={disabled}
      style={{ ...base, background: "transparent", color: th.t2, border: "1px solid " + th.bor, fontWeight: 600, padding: SPACE.s3 + "px", ...dis(disabled), ...style }}>
      {children}
    </button>
  );
});

/** O'chirish, chiqish. solid=true faqat tasdiqlash dialogida. */
export const DangerButton = memo(function DangerButton({ th, children, onClick, disabled, solid, style }) {
  injectUiCss();
  return (
    <button className="ui-press" onClick={onClick} disabled={disabled}
      style={{ ...base, background: solid ? th.rd : th.rd + ALPHA.faint, color: solid ? "#fff" : th.rd, border: solid ? "none" : "1px solid " + th.rd + ALPHA.strong, padding: SPACE.s3 + "px", ...(solid ? { boxShadow: SHADOW.e1(th.rd) } : null), ...dis(disabled), ...style }}>
      {children}
    </button>
  );
});

/** Faqat Premium sotib olish/faollashtirish CTA. Boshqa joyda oltin tugma TAQIQ. */
export const PremiumButton = memo(function PremiumButton({ th, children, onClick, disabled, style }) {
  injectUiCss();
  return (
    <button className="ui-press" onClick={onClick} disabled={disabled}
      style={{ ...base, background: PREMIUM.grad, color: "#fff", padding: COMP.btnPadY + "px", boxShadow: SHADOW.e1(PREMIUM.gold), ...dis(disabled), ...style }}>
      {children}
    </button>
  );
});

/** Toolbar/karta ichidagi ikonka harakati. label (aria) MAJBURIY. */
export const IconButton = memo(function IconButton({ th, icon, onClick, label, size = COMP.touchMin - SPACE.s1, tone, disabled, style }) {
  injectUiCss();
  const c = tone === "danger" ? th.rd : th.ac;
  return (
    <button className="ui-press" onClick={onClick} aria-label={label} title={label} disabled={disabled}
      style={{ width: size, height: size, flexShrink: 0, border: "none", borderRadius: RADIUS.s, background: c + ALPHA.soft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...dis(disabled), ...style }}>
      {icon}
    </button>
  );
});

/** Suzuvchi harakat tugmasi — FAQAT "yangi yozuv qo'shish" uchun. */
export const FAB = memo(function FAB({ th, icon, onClick, label, style }) {
  injectUiCss();
  const S = COMP.touchMin + SPACE.s3; // 56px
  return (
    <button className="ui-press ui-press-fab" onClick={onClick} aria-label={label} title={label}
      style={{ width: S, height: S, border: "none", borderRadius: RADIUS.full, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e1(th.ac), ...style }}>
      {icon}
    </button>
  );
});

/** PrimaryButton + loading holati. loading=true da bosib bo'lmaydi. */
export const LoadingButton = memo(function LoadingButton({ th, children, loadingText, loading, onClick, disabled, style }) {
  injectUiCss();
  return (
    <PrimaryButton th={th} onClick={loading ? undefined : onClick} disabled={disabled || loading} style={style}>
      {loading && <span className="ui-spin" style={{ width: SPACE.s4, height: SPACE.s4, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: RADIUS.full, display: "inline-block" }} />}
      {loading ? (loadingText || children) : children}
    </PrimaryButton>
  );
});
