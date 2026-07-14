// ═══════════════════════════════════════════════════════════
//  components/common/index.jsx — Umumiy komponentlar
// ═══════════════════════════════════════════════════════════

export function KatIco({ id, c, s = 20 }) {
  if (id === "ovqat") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M3 9c0-3 2.5-5 7-5s7 2 7 5H3z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M2 10.5h16" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M3 12c0 2 2.5 3.5 7 3.5s7-1.5 7-3.5H3z" fill={c} opacity=".1" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
        <circle cx="7" cy="6.5" r="0.5" fill={c}/>
        <circle cx="10" cy="5.5" r="0.5" fill={c}/>
        <circle cx="13" cy="6.5" r="0.5" fill={c}/>
      </svg>
    );
  }
  if (id === "kofe") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M3 6h11a1 1 0 0 1 1 1v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M15 8h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" stroke={c} strokeWidth="1.3"/>
        <path d="M5 2.5c.1-.3.4-.3.6 0s.1.5 0 .8L5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M8.5 2.5c.1-.3.4-.3.6 0s.1.5 0 .8L8.5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M12 2.5c.1-.3.4-.3.6 0s.1.5 0 .8L12 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "bozor") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M2 2h2l1.8 7.5h9.5l1.7-5H5.5" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill={c} opacity=".12"/>
        <circle cx="7.5" cy="15.5" r="1.5" stroke={c} strokeWidth="1.3" fill={c}/>
        <circle cx="13.5" cy="15.5" r="1.5" stroke={c} strokeWidth="1.3" fill={c}/>
      </svg>
    );
  }
  if (id === "benzin") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="4" y="3" width="8" height="13" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/>
        <path d="M12 6h2v5.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="6" y="5.5" width="4" height="2.5" rx="0.5" stroke={c} strokeWidth="1.1"/>
        <circle cx="8" cy="12" r="1" fill={c}/>
      </svg>
    );
  }
  if (id === "dorixona") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="6" width="14" height="8" rx="4" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/>
        <line x1="10" y1="6" x2="10" y2="14" stroke={c} strokeWidth="1.3" strokeDasharray="2 2"/>
        <path d="M7 10h2M11 10h2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "taxi") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="8" y="2" width="4" height="1.5" rx="0.5" fill={c} stroke={c} strokeWidth="1"/>
        <path d="M3 10V7.5A1.5 1.5 0 0 1 4.5 6h11A1.5 1.5 0 0 1 17 7.5V10" stroke={c} strokeWidth="1.3"/>
        <rect x="2" y="10" width="16" height="5" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/>
        <circle cx="6" cy="15" r="1.5" fill={c}/>
        <circle cx="14" cy="15" r="1.5" fill={c}/>
      </svg>
    );
  }
  if (id === "oziq") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="11.5" r="5" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <path d="M10 6.5C10 5 11 4 12.5 4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M9.5 6.5l-1.5-2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "transport") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="9" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <circle cx="6.5" cy="14" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="13.5" cy="14" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <path d="M3 10h14" stroke={c} strokeWidth="1.2"/>
        <path d="M7 5v5M13 5v5" stroke={c} strokeWidth="1"/>
      </svg>
    );
  }
  if (id === "kiyim") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M10 2a2 2 0 0 1 2 2c0 .6-.2 1-.5 1.5L17 8.5v3.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5l5.5-3C8.2 5 8 4.6 8 4a2 2 0 0 1 2-2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M3 9.5h14M10 5.5v7.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "sog") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <path d="M6 10h2.5l1.5-3.5 1.5 6.5L13 10h2" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (id === "kommunal") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3.5l7 6M5 8.5V16.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 8l-1.5 2.5H11l-1.5 3" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (id === "konil") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="6" width="14" height="9" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <circle cx="7" cy="10.5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="13" cy="10.5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <path d="M10 2.5v1.5M4 6c0-1.5 2.5-2 6-2s6 .5 6 2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (id === "talim") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <path d="M10 3L2.5 6.5 10 10l7.5-3.5L10 3z" fill={c} opacity=".2" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5 8.5V13c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5V8.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 7v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "hadya") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3.5" y="7.5" width="13" height="9" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <rect x="2.5" y="5.5" width="15" height="2" rx="0.5" fill={c} opacity=".3" stroke={c} strokeWidth="1.3"/>
        <path d="M10 5.5v11M3.5 11.5h13" stroke={c} strokeWidth="1.4"/>
        <path d="M10 5.5c-1-1.5-3-1.5-3 0s2 2 3 0c1 2 3 2 3 0s-2-1.5-3 0z" fill={c} opacity=".3"/>
      </svg>
    );
  }
  if (id === "boshqa") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <circle cx="5" cy="5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="15" cy="5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="5" cy="15" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="15" cy="15" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="10" cy="10" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
      </svg>
    );
  }
  return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".5"/><rect x="11" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="3" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".5"/></svg>;
}

export function DarIco({ id, c, s = 20 }) {
  if (id === "oylik") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <circle cx="10" cy="10" r="2" stroke={c} strokeWidth="1.3"/>
        <path d="M6 10h1M13 10h1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "qoshimcha") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.4"/>
        <path d="M10 6.5v7M6.5 10h7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "biznes") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3" y="6" width="14" height="10" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <path d="M7 6V4.5a1.5 1.5 0 0 1 3 0V6M6 10.5h8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === "sovga" || id === "hadya") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <rect x="3.5" y="7.5" width="13" height="9" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/>
        <rect x="2.5" y="5.5" width="15" height="2" rx="0.5" fill={c} opacity=".3" stroke={c} strokeWidth="1.3"/>
        <path d="M10 5.5v11M3.5 11.5h13" stroke={c} strokeWidth="1.4"/>
        <path d="M10 5.5c-1-1.5-3-1.5-3 0s2 2 3 0c1 2 3 2 3 0s-2-1.5-3 0z" fill={c} opacity=".3"/>
      </svg>
    );
  }
  if (id === "boshqa") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
        <circle cx="5" cy="5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="15" cy="5" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="5" cy="15" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="15" cy="15" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
        <circle cx="10" cy="10" r="1.5" fill={c} stroke={c} strokeWidth="1"/>
      </svg>
    );
  }
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

export function SL({ ch, th }) {
  return <div style={{ fontSize:10, color:th.t2, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>{ch}</div>;
}

export function SC({ label, value, color, th }) {
  return (
    <div style={{ background:th.sur, borderRadius:18, border:"1px solid "+th.bor, textAlign:"center", padding:"12px 8px", margin:0 }}>
      <div style={{ fontSize:9, color:th.t2, marginBottom:3, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:16, fontWeight:800, color }}>{value}</div>
    </div>
  );
}

// Bitta xarajat/daromad qatori (tarix ro'yxatida ishlatiladi)
export function TxRow({ item, th, STY, KATS, KN, DARS, DN, lg, gN, gP, f, user, onDelete, Ico }) {
  const isX = !!item.kategoriya;
  const ki = isX ? KATS.findIndex(k => k.id === item.kategoriya) : -1;
  const di = !isX ? DARS.findIndex(d => d.id === item.tur) : -1;
  const cl = isX ? (KATS[ki]?.c || "#64748b") : (DARS[di]?.c || "#64748b");

  let iconId = item.kategoriya;
  if (isX) {
    const iz = String(item.izoh || "").toLowerCase();
    if (iz.includes("kofe") || iz.includes("coffee")) iconId = "kofe";
    else if (iz.includes("bozor") || iz.includes("grocer") || iz.includes("продукты") || iz.includes("market")) iconId = "bozor";
    else if (iz.includes("ovqat") || iz.includes("food") || iz.includes("еда")) iconId = "ovqat";
    else if (iz.includes("taxi") || iz.includes("taksi") || iz.includes("transport")) iconId = "taxi";
    else if (iz.includes("benzin") || iz.includes("fuel") || iz.includes("газ")) iconId = "benzin";
    else if (iz.includes("dorixona") || iz.includes("pharmacy") || iz.includes("аптека") || iz.includes("dori")) iconId = "dorixona";
  }

  return (
    <div style={{ ...STY.cd, padding:"10px 13px", display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
      <div style={{ width:38, height:38, borderRadius:11, background:cl+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {isX ? <KatIco id={iconId} c={cl} s={20}/> : <DarIco id={item.tur} c={cl} s={20}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:th.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.izoh}{item.repeat && Ico && <span style={{ marginLeft:5 }}>{Ico.repeat(th.ac)}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
          <Av src={gP(item.uid)} name={gN(item.uid)} size={14} ac={th.ac}/>
          <span style={{ fontSize:10, color:th.t2 }}>{gN(item.uid)} · {item.sana}</span>
        </div>
      </div>
      <span style={{ fontWeight:700, color:isX?th.rd:th.gr, fontSize:13, whiteSpace:"nowrap" }}>{isX?"-":"+"}{f(item.summa,true)}</span>
      {isX && item.uid===user?.id && onDelete && (
        <button onClick={() => onDelete(item)} style={{ background:"none", border:"none", cursor:"pointer", flexShrink:0, display:"flex", padding:"2px" }}>
          {Ico ? Ico.trash(th.t2) : "✕"}
        </button>
      )}
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
