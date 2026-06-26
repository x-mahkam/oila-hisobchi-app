// ═══════════════════════════════════════════════════════════
//  components/common/index.jsx — Umumiy komponentlar
// ═══════════════════════════════════════════════════════════

export function KatIco({ id, c, s = 20 }) {
  if (id === "oziq")     return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2C7 2 4 5 4 8c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7 0-3-3-6-6-6z" fill={c} opacity=".2"/><path d="M7 9c0 2.5 1.3 4.5 3 5.5C12.7 13.5 14 11.5 14 9H7z" fill={c}/><line x1="10" y1="2" x2="10" y2="5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (id === "transport") return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="9" rx="2.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><rect x="4" y="8" width="5" height="3" rx="1" fill={c} opacity=".6"/><rect x="11" y="8" width="5" height="3" rx="1" fill={c} opacity=".6"/><path d="M5 15v2m10-2v2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (id === "kiyim")    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M7 2L4 5l2 1.5V16h8V6.5L16 5l-3-3c0 0-1 2-3 2S7 2 7 2z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  if (id === "sog")      return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="8.5" y="3" width="3" height="14" rx="1.5" fill={c}/><rect x="3" y="8.5" width="14" height="3" rx="1.5" fill={c}/></svg>;
  if (id === "kommunal") return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2L7 8h2.5l-2 9 7-9H12L14 2H10z" fill={c} opacity=".25" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  if (id === "konil")    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="11" r="2" fill={c}/><path d="M13 9l1.5 2L13 13" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (id === "talim")    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="9" height="12" rx="1.5" fill={c} opacity=".2" stroke={c} strokeWidth="1.3"/><path d="M7 17h9V8" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (id === "hadya")    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="8" width="16" height="2.5" rx="1.25" fill={c} opacity=".5"/><rect x="3" y="10.5" width="14" height="7" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M10 8.5v9" stroke={c} strokeWidth="1.3"/><path d="M10 8C10 8 7 7 7 5s2-2 3 0c1-2 3-2 3 0s-3 3-3 3z" fill={c} opacity=".7"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".5"/><rect x="11" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="3" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".5"/></svg>;
}

export function DarIco({ id, c, s = 20 }) {
  if (id === "oylik")     return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><line x1="3" y1="8" x2="17" y2="8" stroke={c} strokeWidth="1.3"/><circle cx="7" cy="12" r="1.5" fill={c}/><path d="M10 11h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if (id === "qoshimcha") return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><path d="M10 6v8M6 10h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (id === "biznes")    return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 9h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M1 9h18M7 9V7a3 3 0 016 0v2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if (id === "sovga")     return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="8" width="16" height="2.5" rx="1.25" fill={c} opacity=".5"/><rect x="3" y="10.5" width="14" height="7" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M10 8.5v9" stroke={c} strokeWidth="1.3"/><path d="M10 8C10 8 7 7 7 5s2-2 3 0c1-2 3-2 3 0s-3 3-3 3z" fill={c} opacity=".7"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2" fill={c}/><circle cx="3.5" cy="10" r="2" fill={c} opacity=".5"/><circle cx="16.5" cy="10" r="2" fill={c} opacity=".5"/></svg>;
}

export function MoneyInput({ value, onChange, style, placeholder, autoFocus, th }) {
  const fmt = (s) => {
    const digits = String(s).replace(/[^0-9]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  return (
    <input
      type="text" inputMode="numeric"
      style={style} placeholder={placeholder} autoFocus={autoFocus}
      value={value ? fmt(value) : ""}
      onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ""); onChange(raw); }}
    />
  );
}

export function Av({ src, name, size = 44, ac }) {
  const ini = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"2px solid "+ac+"44", flexShrink:0 }}/>;
  return <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,"+ac+","+ac+"88)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.36, fontWeight:800, color:"#fff", flexShrink:0 }}>{ini}</div>;
}

export function Spark({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 72, H = 26;
  const pts = data.map((v, i) => ((i / (data.length - 1)) * W) + "," + (H - (v / max) * H)).join(" ");
  return <svg width={W} height={H} style={{ display:"block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function Heat({ xar, ac }) {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const tot = xar.filter(x => x.sana === k).reduce((s, x) => s + Number(x.summa || 0), 0);
    days.push({ k, tot });
  }
  const max = Math.max(...days.map(d => d.tot), 1);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:4 }}>
      {days.map(d => {
        const a = d.tot > 0 ? Math.round((d.tot / max) * 200 + 30) : 0;
        const bg = d.tot > 0 ? ac + a.toString(16).padStart(2, "0") : "#1e293b22";
        return (
          <div key={d.k} title={d.k + ": " + d.tot.toLocaleString()}
            style={{ aspectRatio:"1", borderRadius:4, background:bg, cursor:"default", transition:"transform .15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        );
      })}
    </div>
  );
}

export function Tst({ msg, type, th }) {
  if (!msg) return null;
  const bg = type === "err" ? th.rd : type === "warn" ? th.am : th.gr;
  return (
    <div style={{ position:"fixed", top:18, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:bg, color:"#fff", borderRadius:14, padding:"11px 22px", fontSize:14, fontWeight:700, maxWidth:340, textAlign:"center", boxShadow:"0 8px 28px rgba(0,0,0,.3)", pointerEvents:"none" }}>
      {msg}
    </div>
  );
}

export function BH({ label, th, onBack }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
      <button onClick={onBack} style={{ background:th.sur, border:"1px solid "+th.bor, borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke={th.t1} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div style={{ fontSize:17, fontWeight:700, color:th.t1 }}>{label}</div>
    </div>
  );
}
