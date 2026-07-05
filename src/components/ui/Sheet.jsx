// ═══════════════════════════════════════════════════════════
//  SHEET / MODAL / DIALOG
//  Qayerda: formalar (BottomSheet), qaytarilmas harakat tasdig'i
//           (ConfirmDialog), premium taklif (PremiumDialog).
//  Qachon: BottomSheet — mobil uchun ASOSIY modal naqsh;
//          Dialog — faqat qisqa tasdiq (≤2 tugma).
//  Qachon EMAS: sheet ustida sheet TAQIQ (DS 5.7); uzun kontent
//              uchun Dialog emas — Sheet (scroll bilan).
//  Tokenlar: Z.overlay/sheet/dialog, RADIUS.l/m, SPACE, SHADOW.e3, TYPE, OPACITY.
//  Dark mode: sheet foni th.sur (dark'da elevation = surH farqi).
//  A11y: overlay bosish = yopish; role="dialog" aria-modal;
//        sheet dastasi (drag handle) vizual signal.
//  Animation: .ui-sheetUp (240ms), .ui-dialogIn (scale+fade).
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { Z, RADIUS, SPACE, SHADOW, TYPE, COMP } from "../../utils/tokens.js";
import { PrimaryButton, GhostButton, DangerButton, PremiumButton } from "./Button.jsx";
import { injectUiCss } from "./motion.js";

const overlayS = { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: Z.overlay, display: "flex", justifyContent: "center" };

/** Pastdan chiqadigan sheet. title ixtiyoriy. Yopish: overlay yoki dastak. */
export const BottomSheet = memo(function BottomSheet({ th, open, onClose, title, children, maxH = "90vh" }) {
  injectUiCss();
  if (!open) return null;
  return (
    <div style={{ ...overlayS, alignItems: "flex-end" }} onClick={onClose}>
      <div className="ui-sheetUp" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}
        style={{ background: th.sur, borderRadius: RADIUS.l + "px " + RADIUS.l + "px 0 0", width: "100%", maxWidth: COMP.pageMax, maxHeight: maxH, overflowY: "auto", padding: SPACE.s6 + "px " + SPACE.s4 + "px " + SPACE.s8 + "px", boxSizing: "border-box", boxShadow: SHADOW.e3, zIndex: Z.sheet }}>
        <div style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s1, borderRadius: RADIUS.pill, background: th.bor, margin: "0 auto " + SPACE.s4 + "px" }} />
        {title && <div style={{ ...TYPE.heading, color: th.t1, textAlign: "center", marginBottom: SPACE.s4 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
});

/** Markaziy dialog — faqat qisqa kontent. */
export const Dialog = memo(function Dialog({ th, open, onClose, title, children }) {
  injectUiCss();
  if (!open) return null;
  return (
    <div style={{ ...overlayS, alignItems: "center", zIndex: Z.dialog, padding: SPACE.s6 }} onClick={onClose}>
      <div className="ui-dialogIn" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}
        style={{ background: th.sur, borderRadius: RADIUS.l, width: "100%", maxWidth: COMP.pageMax - SPACE.s16 - SPACE.s12, padding: SPACE.s6 + "px " + SPACE.s4 + "px", boxSizing: "border-box", boxShadow: SHADOW.e3 }}>
        {title && <div style={{ ...TYPE.heading, color: th.t1, textAlign: "center", marginBottom: SPACE.s3 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
});

/** Qaytarilmas harakat tasdig'i: Danger(solid) + Ghost. */
export const ConfirmDialog = memo(function ConfirmDialog({ th, open, onClose, onConfirm, title, message, confirmText, cancelText, danger = true }) {
  return (
    <Dialog th={th} open={open} onClose={onClose} title={title}>
      {message && <div style={{ ...TYPE.body, color: th.t2, textAlign: "center", marginBottom: SPACE.s4, lineHeight: 1.5 }}>{message}</div>}
      {danger
        ? <DangerButton th={th} solid onClick={onConfirm} style={{ marginBottom: SPACE.s2 }}>{confirmText}</DangerButton>
        : <PrimaryButton th={th} onClick={onConfirm} style={{ marginBottom: SPACE.s2 }}>{confirmText}</PrimaryButton>}
      <GhostButton th={th} onClick={onClose}>{cancelText}</GhostButton>
    </Dialog>
  );
});

/**
 * Premium taklif dialogi — presentational (biznes logika YO'Q).
 * feature: qaysi funksiya trigger bo'ldi; benefits: ro'yxat; price: matn.
 */
export const PremiumDialog = memo(function PremiumDialog({ th, open, onClose, onUpgrade, title, benefits = [], price, upgradeText, laterText }) {
  return (
    <Dialog th={th} open={open} onClose={onClose} title={title}>
      {benefits.length > 0 && (
        <div style={{ marginBottom: SPACE.s4 }}>
          {benefits.map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2, ...TYPE.caption, fontWeight: 600, color: th.t1 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M3 8l4 4 6-7" stroke={th.gr} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {b}
            </div>
          ))}
        </div>
      )}
      {price && <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: SPACE.s4 }}>{price}</div>}
      <PremiumButton th={th} onClick={onUpgrade} style={{ marginBottom: SPACE.s2 }}>{upgradeText}</PremiumButton>
      <GhostButton th={th} onClick={onClose}>{laterText}</GhostButton>
    </Dialog>
  );
});
