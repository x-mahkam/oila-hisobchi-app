// ═══════════════════════════════════════════════════════════
//  LIST ITEMS / ROWS
//  Qayerda: sozlamalar, tranzaksiya tarixi, oila a'zolari, qarzlar.
//  Qachon: bir turdagi elementlar ro'yxati. Guruh konteyner:
//          AppCard pad=0 + qatorlar (divider avtomatik).
//  Qachon EMAS: yakka mustaqil karta uchun (AppCard), grid uchun.
//  Tokenlar: SPACE, RADIUS.s, TYPE, ALPHA, COMP.touchMin.
//  Dark mode: th orqali.
//  A11y: onClick bo'lsa <button> (44px min), bo'lmasa <div>;
//        summa +/- prefiks bilan (rang yagona signal emas).
//  Animation: bosiladigan qator .ui-press.
//  Performance: hammasi memo — uzun ro'yxatlarda faqat o'zgargan
//        qator qayta render bo'ladi (props referensial barqaror bo'lsa).
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { SPACE, RADIUS, TYPE, ALPHA, COMP } from "../../utils/tokens.js";
import { UIAvatar } from "./Avatar.jsx";
import { injectUiCss } from "./motion.js";

const chevron = c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

/** Bazaviy qator: ikonka-konteyner + matn + o'ng slot. */
export const ListItem = memo(function ListItem({ th, icon, iconTone, title, sub, right, onClick, divider = true, danger, style }) {
  injectUiCss();
  const c = iconTone || (danger ? th.rd : th.ac);
  const inner = (
    <>
      {icon && <div style={{ width: COMP.touchMin - SPACE.s2, height: COMP.touchMin - SPACE.s2, borderRadius: RADIUS.s, background: c + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: danger ? th.rd : th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {sub && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      {right !== undefined ? right : (onClick && chevron(th.t2))}
    </>
  );
  const s = { width: "100%", display: "flex", alignItems: "center", gap: SPACE.s3, padding: SPACE.s3 + "px " + SPACE.s4 + "px", borderBottom: divider ? "1px solid " + th.bor : "none", boxSizing: "border-box", minHeight: COMP.touchMin };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...s, background: "transparent", border: "none", borderBottom: s.borderBottom, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{inner}</button>;
  return <div style={s}>{inner}</div>;
});

/** Sozlamalar qatori — ListItem sinonimi (semantik nom). */
export const SettingRow = ListItem;

/** Tranzaksiya qatori. sign: +1 daromad / -1 xarajat. amount — formatlangan matn. */
export const TransactionRow = memo(function TransactionRow({ th, icon, iconTone, title, sub, amount, sign = -1, onClick, divider = true, style }) {
  const c = sign > 0 ? th.gr : th.rd;
  return (
    <ListItem th={th} icon={icon} iconTone={iconTone} title={title} sub={sub} onClick={onClick} divider={divider} style={style}
      right={<span style={{ ...TYPE.subtitle, fontWeight: 800, color: c, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{sign > 0 ? "+" : "−"}{amount}</span>} />
  );
});

/** Oila a'zosi qatori: avatar + ism + rol badge sloti. variant: "premium"|"kid". */
export const MemberRow = memo(function MemberRow({ th, photo, name, sub, badge, variant, onClick, divider = true }) {
  injectUiCss();
  const inner = (
    <>
      <UIAvatar th={th} src={photo} name={name} size={SPACE.s8 + 2} variant={variant} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 2, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {sub && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      {badge}
    </>
  );
  const s = { width: "100%", display: "flex", alignItems: "center", gap: SPACE.s3, padding: (SPACE.s2 + 1) + "px " + SPACE.s4 + "px", borderBottom: divider ? "1px solid " + th.bor : "none", minHeight: COMP.touchMin, boxSizing: "border-box" };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...s, background: "transparent", border: "none", borderBottom: s.borderBottom, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{inner}</button>;
  return <div style={s}>{inner}</div>;
});

/** Qarz qatori: kimga/kimdan + muddat + summa (sign: -1 berilgan, +1 olingan). */
export const DebtRow = memo(function DebtRow({ th, icon, title, due, amount, sign = -1, done, onClick, divider = true }) {
  return (
    <ListItem th={th} icon={icon} iconTone={done ? th.t3 : (sign > 0 ? th.gr : th.am)} title={title} sub={due} onClick={onClick} divider={divider}
      right={
        <span style={{ ...TYPE.subtitle, fontWeight: 800, color: done ? th.t3 : (sign > 0 ? th.gr : th.am), fontVariantNumeric: "tabular-nums", textDecoration: done ? "line-through" : "none", flexShrink: 0 }}>{amount}</span>
      } />
  );
});
