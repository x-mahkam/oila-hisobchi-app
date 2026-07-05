// ═══════════════════════════════════════════════════════════
//  BADGE — yagona badge tizimi
//  Qayerda: funksiya nomi yonida (PRO), status ko'rsatkichlari,
//           rol belgilari (Oila boshlig'i / A'zo), ro'yxat qatorlari.
//  Qachon: qisqa (≤2 so'z) holat belgisi kerak bo'lganda.
//  Qachon EMAS: bosiladigan element sifatida (tugma emas!),
//              uzun matn uchun, hisoblagich uchun (CounterBadge bor).
//  Tokenlar: RADIUS.pill, TYPE.caption/tiny, ALPHA.soft, PREMIUM.grad, SPACE.
//  Dark mode: soft fon th orqali; oltin gradient ikkala rejimda bir xil.
//  A11y: rang yagona signal emas — doim matn/ikonka bilan birga.
//  Animation: yo'q (badge statik — e'tibor tortmasligi kerak).
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, TYPE, ALPHA, PREMIUM, SPACE } from "../../utils/tokens.js";

const starIco = <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.9 4.1 4.5.5-3.3 3.1.9 4.4L8 11.4l-4 2.2.9-4.4L1.6 6.1l4.5-.5L8 1.5z" fill="#fff" opacity=".9"/></svg>;

/**
 * type: "pro" | "premium" | "success" | "warning" | "danger" | "info" | "role" | "status"
 * role/status uchun rang th dan: role→ac, status→berilgan tone yoki gr.
 */
export const Badge = memo(function Badge({ th, type = "status", children, icon, tone, style }) {
  // Oltin (gradient) badge'lar
  if (type === "pro" || type === "premium") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 - 1, background: PREMIUM.grad, borderRadius: type === "pro" ? RADIUS.s - SPACE.s1 : RADIUS.pill, padding: type === "pro" ? "2px 6px" : "3px 10px", fontSize: type === "pro" ? TYPE.tiny.fontSize - 1 : TYPE.tiny.fontSize + 1, fontWeight: 800, color: "#fff", letterSpacing: .5, flexShrink: 0, ...style }}>
        {icon !== null && starIco}{type === "pro" ? "PRO" : (children || "Premium")}
      </span>
    );
  }
  // Soft rangli badge'lar
  const c = type === "success" ? th.gr
    : type === "warning" ? th.am
    : type === "danger" ? th.rd
    : type === "info" ? th.ac
    : type === "role" ? th.ac
    : (tone || th.gr); // status
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: c + ALPHA.soft, borderRadius: RADIUS.pill, padding: "3px 10px", ...TYPE.caption, fontWeight: 700, color: c, flexShrink: 0, whiteSpace: "nowrap", ...style }}>
      {icon}{children}
    </span>
  );
});

/** Bildirishnoma soni — nav ikonka burchagida. */
export const CounterBadge = memo(function CounterBadge({ th, count, style }) {
  if (!count) return null;
  const S = SPACE.s4; // 16px
  return (
    <span style={{ position: "absolute", top: -SPACE.s1, right: -SPACE.s1, minWidth: S, height: S, borderRadius: RADIUS.pill, background: th.rd, color: "#fff", fontSize: TYPE.tiny.fontSize, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 " + (SPACE.s1 + 1) + "px", boxSizing: "border-box", ...style }}>
      {count > 99 ? "99+" : count}
    </span>
  );
});
