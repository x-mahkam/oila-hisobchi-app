// ═══════════════════════════════════════════════════════════
//  Ilova umumiy stil ob'ekti — Design System v1.0
//  Barcha qiymatlar tokens.js dan. Raqamli literal — TAQIQ.
// ═══════════════════════════════════════════════════════════
import { SPACE, RADIUS, SHADOW, TYPE, FONT, MOTION, Z, ALPHA, OPACITY, COMP } from "./tokens.js";

export function makeS(th) {
  return {
    // ── Mavjud kalitlar (barcha sahifalar ishlatadi) ──────
    pg:  { minHeight: "100vh", background: th.bg, fontFamily: FONT, color: th.t1, maxWidth: COMP.pageMax, margin: "0 auto" },
    cd:  { background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s4, border: "1px solid " + th.bor, marginBottom: SPACE.s3 },
    ip:  { width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: COMP.inputPad, color: th.t1, fontSize: TYPE.subtitle.fontSize, outline: "none", boxSizing: "border-box", marginBottom: SPACE.s3 },
    lb:  { ...TYPE.tiny, color: th.t2, display: "block", marginBottom: SPACE.s1 },
    bt:  (a, b) => ({ width: "100%", background: "linear-gradient(135deg," + (a || th.ac) + "," + (b || th.ac2) + ")", border: "none", borderRadius: RADIUS.m, padding: COMP.btnPadY + "px", color: "#fff", fontSize: TYPE.subtitle.fontSize, fontWeight: 700, cursor: "pointer", marginBottom: SPACE.s2, boxShadow: SHADOW.e1(a || th.ac) }),
    tb:  on => ({ flex: 1, background: on ? th.ac + ALPHA.tint : "transparent", border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: COMP.tabPadY + "px 0", color: on ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize + 1 }),
    ch:  (on, c) => ({ whiteSpace: "nowrap", background: on ? (c || th.ac) + ALPHA.tint : "transparent", border: "1px solid " + (on ? (c || th.ac) : th.bor), borderRadius: RADIUS.pill, padding: COMP.chipPad, color: on ? (c || th.ac) : th.t2, cursor: "pointer", fontSize: TYPE.caption.fontSize, fontWeight: 600 }),
    row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    sec: { ...TYPE.tiny, fontWeight: 700, letterSpacing: 1.5, color: th.t2, marginBottom: SPACE.s2 },

    // ── YANGI: markazlashgan tizim helperlari ─────────────
    // Typography: style={{...STY.ty.title, color: th.t1}}
    ty: TYPE,
    // Elevation: boxShadow: STY.el.e2 / STY.el.e1(th.ac)
    el: SHADOW,
    // Motion: transition: STY.tr("transform") / STY.trFast()
    tr: MOTION.tr, trFast: MOTION.trFast, trSlow: MOTION.trSlow,
    motion: MOTION,
    // Z-index: zIndex: STY.z.sheet
    z: Z,
    // Spacing/radius (sahifa migratsiyasida ishlatiladi)
    sp: SPACE, rad: RADIUS, alpha: ALPHA, op: OPACITY, comp: COMP,
  };
}
