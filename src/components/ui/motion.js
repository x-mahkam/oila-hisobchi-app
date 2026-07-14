// ═══════════════════════════════════════════════════════════
//  UI MOTION — bir martalik global CSS inject
//  Qayerda: barcha ui/ komponentlar chaqiradi (idempotent).
//  Tokenlar: MOTION (duration/curve), OPACITY.pressed.
//  Accessibility: prefers-reduced-motion — dekorativ animatsiya o'chadi.
// ═══════════════════════════════════════════════════════════
import { MOTION, OPACITY } from "../../utils/tokens.js";

let injected = false;
export function injectUiCss() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const s = document.createElement("style");
  s.id = "oila-ui-css";
  s.textContent = `
.ui-press{transition:transform ${MOTION.fast} ${MOTION.easeOut},opacity ${MOTION.fast} ${MOTION.easeOut}}
.ui-press:active{transform:scale(.98);opacity:${OPACITY.pressed}}
.ui-press-fab:active{transform:scale(.92)}
@keyframes ui-fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ui-fadeUp{animation:ui-fadeUp ${MOTION.base} ${MOTION.easeOut} both}
@keyframes ui-sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.ui-sheetUp{animation:ui-sheetUp ${MOTION.base} ${MOTION.easeOut} both}
@keyframes ui-dialogIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.ui-dialogIn{animation:ui-dialogIn ${MOTION.base} ${MOTION.easeOut} both}
@keyframes ui-shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
.ui-shimmer{background-size:200% 100%;animation:ui-shimmer 1.2s linear infinite}
@keyframes ui-toastIn{from{opacity:0;transform:translate(-50%,-16px)}to{opacity:1;transform:translate(-50%,0)}}
.ui-toastIn{animation:ui-toastIn ${MOTION.base} ${MOTION.easeOut} both}
@keyframes ui-spin{to{transform:rotate(360deg)}}
.ui-spin{animation:ui-spin .7s linear infinite}
@media (prefers-reduced-motion:reduce){
  .ui-fadeUp,.ui-sheetUp,.ui-dialogIn,.ui-toastIn{animation-duration:1ms}
  .ui-shimmer,.ui-spin{animation:none}
  .ui-press:active{transform:none}
}`;
  document.head.appendChild(s);
}
