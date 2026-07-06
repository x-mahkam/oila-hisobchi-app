// ═══════════════════════════════════════════════════════════
//  SMART GOALS — Form maydonlari (muddat + rasm)
//  Ilova stil helperi (STY) va tokenlardan foydalanadi.
//  Native <input type="date"> — WebView'da barqaror, mobil-do'st.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { SPACE, RADIUS, TYPE, ALPHA } from "../utils/tokens.js";
import { T } from "./i18n.js";

const todayStr = () => new Date().toISOString().slice(0, 10);
const addMonthsStr = (m) => {
  const d = new Date(); d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
};

/** Tez muddat tanlash: 3/6/12/24 oy. */
const QUICK = [3, 6, 12, 24];

export const DeadlineField = memo(function DeadlineField({ th, STY, lg, value, onChange, error }) {
  return (
    <div>
      <label style={STY.lb}>{T("deadline", lg)} *</label>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2 }}>
        {QUICK.map(m => {
          const target = addMonthsStr(m);
          const active = value === target;
          return (
            <button key={m} type="button" className="ui-press" onClick={() => onChange(target)}
              style={{ flex: 1, background: active ? th.ac + ALPHA.tint : th.bg, border: "1.5px solid " + (active ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px 0", color: active ? th.ac : th.t2, fontWeight: 700, fontSize: TYPE.caption.fontSize, cursor: "pointer", fontFamily: "inherit" }}>
              {m} {T("month", lg)}
            </button>
          );
        })}
      </div>
      <input type="date" min={todayStr()} value={value || ""} onChange={e => onChange(e.target.value)}
        style={{ ...STY.ip, marginBottom: error ? SPACE.s1 : SPACE.s3, borderColor: error ? th.rd : th.bor, colorScheme: th.dark ? "dark" : "light" }} />
      {error
        ? <div style={{ ...TYPE.caption, color: th.rd, marginBottom: SPACE.s3 }}>{T("deadlineReq", lg)}</div>
        : <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: -SPACE.s2, marginBottom: SPACE.s3 }}>{T("deadlineHint", lg)}</div>}
    </div>
  );
});

const EMOJI_PICKS = ["🏠", "🚗", "✈️", "💍", "📱", "🎓", "💼", "🎉"];

export const ImageField = memo(function ImageField({ th, STY, lg, value, onChange }) {
  const isUrl = typeof value === "string" && /^https?:\/\//.test(value);
  return (
    <div style={{ marginBottom: SPACE.s3 }}>
      <label style={STY.lb}>{T("goalImage", lg)}</label>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2, flexWrap: "wrap" }}>
        {EMOJI_PICKS.map(em => {
          const active = value === em;
          return (
            <button key={em} type="button" className="ui-press" onClick={() => onChange(active ? "" : em)}
              style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.s, background: active ? th.ac + ALPHA.tint : th.bg, border: "1.5px solid " + (active ? th.ac : th.bor), cursor: "pointer", fontSize: 20, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {em}
            </button>
          );
        })}
      </div>
      <input value={isUrl ? value : ""} onChange={e => onChange(e.target.value)} placeholder={T("imageUrl", lg)}
        style={{ ...STY.ip, marginBottom: SPACE.s1 }} />
      <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{T("imageHint", lg)}</div>
    </div>
  );
});

/** Maqsad avatarini render qilish: URL rasm / emoji / fallback ikonка. */
export function GoalMedia({ img, rang, size = SPACE.s8 + SPACE.s2, fallback }) {
  const isUrl = typeof img === "string" && /^https?:\/\//.test(img);
  const box = { width: size, height: size, borderRadius: RADIUS.s + 2, background: rang + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" };
  if (isUrl) return <div style={box}><img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} /></div>;
  if (img) return <div style={box}><span style={{ fontSize: Math.round(size * 0.5), lineHeight: 1 }}>{img}</span></div>;
  return <div style={box}>{fallback}</div>;
}
