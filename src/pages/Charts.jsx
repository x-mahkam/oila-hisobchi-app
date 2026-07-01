import { useState, useEffect, useRef, useMemo } from "react";
import { KATS, KN, DARS, DN } from "../utils/constants.js";

const KAT_EMOJI = {
  oziq:"🛒", transport:"🚗", kiyim:"👕", sog:"💊",
  kommunal:"🏠", konil:"🎬", talim:"📚", hadya:"🎁", qarz:"💸", boshqa:"💳"
};
const DAR_EMOJI = {
  oylik:"💼", qoshimcha:"⚡", biznes:"🏢", sovga:"🎁", boshqa:"💰"
};
const months_uz = ["Yanvar","Fevral","Mart","Aprel","May","Iyun",
                   "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const months_sh = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
// Dushanba=0 tartibida hafta kunlari
const DAYS_UZ = ["Du","Se","Ch","Pa","Sh","Ya","Ya"];
const MEM_COLORS = ["#7C6FF7","#F5B731","#22C55E","#EF4444","#06B6D4","#F97316","#EC4899"];

function getWeekNum(d) {
  const s = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7);
}
// Dushanbadan boshlangan hafta kunlari (0=Du...6=Ya)
function getMondayStart(year, week) {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay(); // 0=Sun
  // Find first Monday
  const firstMonday = new Date(jan1);
  const diff = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  firstMonday.setDate(jan1.getDate() + diff - 7);
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);
  return monday;
}

function fmtM(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + " mln";
  if (n >= 1000)    return Math.round(n / 1000) + "K";
  return n > 0 ? String(n) : "—";
}

// ── Donut SVG ──────────────────────────────────────────────────
function Donut({ data, total, size=160, hov, setHov, th }) {
  const cx=size/2, cy=size/2, R=size*0.37, ri=size*0.25, gap=0.025;
  const dim = th.t2; // always visible
  if (!data.length || total===0) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.4}/>
      <circle cx={cx} cy={cy} r={ri-3} fill={th.sur}/>
      <text x={cx} y={cy+5} textAnchor="middle" fill={dim} fontSize={12} fontWeight={700}>—</text>
    </svg>
  );
  let cursor = -Math.PI/2;
  const segs = data.slice(0,7).map((cat, i) => {
    const angle = Math.max((cat.sum/total)*2*Math.PI - gap, 0.01);
    const sa = cursor+gap/2, ea = cursor+gap/2+angle;
    cursor += angle+gap;
    const large = angle>Math.PI ? 1 : 0;
    const d = [
      `M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
      `A ${R} ${R} 0 ${large} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
      `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
      `A ${ri} ${ri} 0 ${large} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
      "Z"
    ].join(" ");
    return { ...cat, d, midA: sa+angle/2, i };
  });
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.3}/>
      {segs.map((seg,i) => (
        <path key={seg.id||i} d={seg.d} fill={seg.color}
          opacity={hov===null||hov===undefined ? 0.92 : hov===i ? 1 : 0.18}
          style={{
            transform: hov===i
              ? `translate(${Math.cos(seg.midA)*7}px,${Math.sin(seg.midA)*7}px)` : "none",
            transition:"all .2s ease",
            filter: hov===i ? `drop-shadow(0 0 10px ${seg.color}cc)` : "none",
            cursor:"pointer",
          }}
          onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
          onTouchStart={(e)=>{e.preventDefault();setHov(i);}}
          onTouchEnd={()=>setHov(null)}
        />
      ))}
      <circle cx={cx} cy={cy} r={ri-3} fill={th.sur}/>
    </svg>
  );
}

// ── Line chart — segmented colors like reference ───────────────
function LineSVG({ pts, lineMax, th, f }) {
  const W=340, H=220, pL=56, pR=10, pT=20, pB=40;
  const iW=W-pL-pR, iH=H-pT-pB;
  if (!pts.length||lineMax===0) return null;
  const mp = pts.map((d,i) => ({
    x: pL + (i/Math.max(pts.length-1,1))*iW,
    y: pT + iH - (d.sum/lineMax)*iH,
    ...d,
  }));
  // Y axis ticks
  const ySteps = [0, 0.25, 0.5, 0.75, 1];
  // X label: show ~5
  const xStep = Math.max(1, Math.floor(pts.length/5));
  const xLabels = new Set([0]);
  for (let i=xStep; i<pts.length-1; i+=xStep) xLabels.add(i);
  xLabels.add(pts.length-1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {/* Y axis ticks + labels */}
      {ySteps.map((pct,gi) => {
        const gy = pT + iH*(1-pct);
        const val = Math.round(lineMax*pct);
        return (
          <g key={gi}>
            <line x1={pL-4} y1={gy} x2={W-pR} y2={gy}
              stroke={pct===0 ? th.t2+"88" : th.bor}
              strokeWidth={pct===0 ? 1 : 0.6}
              strokeDasharray={pct>0 ? "3,6" : ""}/>
            {pct > 0 && (
              <text x={pL-6} y={gy+4} fontSize={10} fill={th.t2}
                textAnchor="end" fontWeight={500}>
                {f(val,true)}
              </text>
            )}
          </g>
        );
      })}
      {/* Segments */}
      {mp.map((pt,i) => {
        if (i===0) return null;
        const prev = mp[i-1];
        const col = pt.sum>0 ? pt.color : prev.color;
        return (
          <line key={i} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y}
            stroke={col} strokeWidth={2.5} strokeLinecap="round" opacity={0.9}/>
        );
      })}
      {/* Dots */}
      {mp.map((pt,i) => (
        <circle key={i} cx={pt.x} cy={pt.y}
          r={pt.sum>0 ? 4.5 : 2.5}
          fill={pt.sum>0 ? pt.color : th.bor}
          stroke={th.sur} strokeWidth={1.5}
        />
      ))}
      {/* X labels */}
      {mp.map((pt,i) => xLabels.has(i) && (
        <text key={i} x={pt.x} y={H-4} fontSize={10} fill={th.t2}
          textAnchor="middle" fontWeight={500}>{pt.label}</text>
      ))}
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function ChartsPage({
  xar, dar, bX, bD, th, lg, f, azolar, user, canSeeReport
}) {
  const now=new Date(), thisY=now.getFullYear(), thisM=now.getMonth(), thisW=getWeekNum(now);
  // use t2 as the "dim" color since t3 doesn't exist in theme
  const dim = th.t2;
  const dimBg = th.sur;

  const [scope,  setScope]  = useState("mine");
  const [type,   setType]   = useState("xarajat");
  const [period, setPeriod] = useState("oy");
  const [selIdx, setSelIdx] = useState(0);
  const [slide,  setSlide]  = useState(0);
  const [hov,    setHov]    = useState(null);
  const scrollRef = useRef(null);
  const touchX    = useRef(null);

  // ── Period options ─────────────────────────────────────────
  const opts = useMemo(() => {
    if (period==="hafta") {
      const count = Math.min(thisW, 10);
      return Array.from({length:count}, (_,i) => {
        const w = thisW-(count-1-i);
        // Dushanbadan boshlanuvchi hafta
        const monday = getMondayStart(thisY, w);
        const sunday = new Date(monday.getTime()+6*86400000);
        const label  = w===thisW
          ? (lg==="uz"?"Bu hafta":"This week")
          : w===thisW-1
            ? (lg==="uz"?"O'tgan hafta":"Last week")
            : `${w}-hafta`;
        const sub = `${monday.getDate()} ${months_sh[monday.getMonth()]} - ${sunday.getDate()} ${months_sh[sunday.getMonth()]}`;
        return { key:`${thisY}-W${w}`, label, sub, monday };
      });
    }
    if (period==="oy") {
      return Array.from({length:thisM+1}, (_,i) => ({
        key: `${thisY}-${String(i+1).padStart(2,"0")}`,
        label: months_uz[i],
        sub: String(thisY),
      }));
    }
    const arr = [];
    for (let y=thisY-3; y<thisY-1; y++) arr.push({key:String(y), label:String(y), sub:""});
    arr.push({key:`${thisY-1}-last`, label:lg==="uz"?"O'tgan yil":"Last year", sub:String(thisY-1)});
    arr.push({key:`${thisY}-this`,   label:lg==="uz"?"Bu yil":"This year",     sub:String(thisY)});
    return arr;
  }, [period, lg, thisW, thisM, thisY]);

  useEffect(() => {
    setSelIdx(opts.length-1); setSlide(0); setHov(null);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }, 60);
  }, [period, opts.length]);

  const selOpt = opts[Math.min(selIdx, opts.length-1)] || opts[opts.length-1];

  // ── Source: #5 fix — faqat o'z ma'lumotlari, ruxsat bo'lmasdan ─
  const allX = bX||xar||[];
  const allD = bD||dar||[];

  // "mine" yoki ruxsatsiz a'zo uchun faqat o'z ma'lumoti
  const srcX = useMemo(() => {
    if (scope==="mine" || !canSeeReport) return allX.filter(x => x.uid===user?.id || !x.uid);
    return allX;
  }, [allX, scope, canSeeReport, user]);

  const srcD = useMemo(() => {
    if (scope==="mine" || !canSeeReport) return allD.filter(d => d.uid===user?.id || !d.uid);
    return allD;
  }, [allD, scope, canSeeReport, user]);

  // ── Filter by selected period ──────────────────────────────
  function filterByPeriod(arr) {
    const key = selOpt?.key || "";
    return arr.filter(item => {
      if (!item.sana) return false;
      if (period==="oy")    return item.sana.startsWith(key);
      if (period==="hafta") {
        const d = new Date(item.sana);
        return `${d.getFullYear()}-W${getWeekNum(d)}` === key;
      }
      const y = key.replace(/-this|-last/,"");
      return item.sana.startsWith(y);
    });
  }

  const filtX = useMemo(() => filterByPeriod(srcX), [srcX, selOpt, period]);
  const filtD = useMemo(() => filterByPeriod(srcD), [srcD, selOpt, period]);

  const currSrc = type==="xarajat" ? filtX : filtD;
  const totalAmt = currSrc.reduce((s,i) => s+Number(i.summa||0), 0);

  // ── Categories ─────────────────────────────────────────────
  const catData = useMemo(() => {
    if (type==="xarajat") {
      return KATS.map((k,i) => ({
        id:k.id, name:KN[lg]?.[i]||k.id, color:k.c, icon:KAT_EMOJI[k.id]||"💳",
        sum: filtX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)
      })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
    }
    return DARS.map((d,i) => ({
      id:d.id, name:DN[lg]?.[i]||d.id, color:d.c, icon:DAR_EMOJI[d.id]||"💰",
      sum: filtD.filter(x=>x.tur===d.id).reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
  }, [filtX, filtD, type, lg]);

  // ── Member data (slide 3 — oilamning) ─────────────────────
  const memberData = useMemo(() => {
    if (scope!=="family" || !canSeeReport || !azolar?.length) return [];
    return azolar.map((a,i) => {
      const sum = type==="xarajat"
        ? filterByPeriod(allX.filter(x=>x.uid===a.id)).reduce((s,x)=>s+Number(x.summa||0),0)
        : filterByPeriod(allD.filter(d=>d.uid===a.id)).reduce((s,d)=>s+Number(d.summa||0),0);
      return { ...a, sum, color:MEM_COLORS[i%MEM_COLORS.length] };
    }).filter(m=>m.sum>0).sort((a,b)=>b.sum-a.sum);
  }, [allX, allD, azolar, selOpt, period, type, scope, canSeeReport]);

  const memTotal = memberData.reduce((s,m)=>s+m.sum, 0);

  // ── Date data for slide 0 ──────────────────────────────────
  const dateData = useMemo(() => {
    const map = {};
    currSrc.forEach(x => { if (x.sana) map[x.sana] = (map[x.sana]||0)+Number(x.summa||0); });
    return Object.entries(map)
      .sort((a,b) => b[0].localeCompare(a[0]))
      .slice(0, 5)
      .map(([sana,sum]) => {
        const d = new Date(sana);
        const label = period==="yil"
          ? `${months_sh[d.getMonth()]} ${d.getFullYear()}`
          : `${months_sh[d.getMonth()]} ${d.getDate()}${period==="hafta"?", "+d.getFullYear():""}`;
        const topKat = catData.reduce((mx,c) => c.sum>mx.sum ? c : mx, {sum:0,color:th.ac});
        return { sana, sum, label, color: topKat.color };
      });
  }, [currSrc, catData, period, th]);

  // ── Line chart data ────────────────────────────────────────
  const lineData = useMemo(() => {
    const key = selOpt?.key || "";
    const getColor = (sana) => {
      const items = currSrc.filter(x=>x.sana===sana);
      if (!items.length) return th.bor;
      const top = items.reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx, items[0]);
      if (type==="xarajat") return KATS.find(k=>k.id===top.kategoriya)?.c || th.ac;
      return DARS.find(d=>d.id===top.tur)?.c || th.gr;
    };

    if (period==="oy") {
      const [y,m] = key.split("-").map(Number);
      const days = new Date(y,m,0).getDate();
      return Array.from({length:days}, (_,i) => {
        const sana = `${y}-${String(m).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
        const sum = currSrc.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0);
        return { label: String(i+1), sum, color: getColor(sana) };
      });
    }

    if (period==="hafta") {
      // Dushanbadan boshlanuvchi 7 kun
      const [y, wStr] = key.split("-W");
      const monday = getMondayStart(parseInt(y), parseInt(wStr));
      return Array.from({length:7}, (_,i) => {
        const d = new Date(monday.getTime()+i*86400000);
        const sana = d.toISOString().slice(0,10);
        const sum = currSrc.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0);
        // Label: "Du 23 Iyn" kabi
        const label = `${DAYS_UZ[i]} ${d.getDate()} ${months_sh[d.getMonth()]}`;
        return { label, sum, color: getColor(sana) };
      });
    }

    // yil
    const y = parseInt(key.replace(/-this|-last/,""));
    return months_sh.map((mn,i) => {
      const prefix = `${y}-${String(i+1).padStart(2,"0")}`;
      const sum = currSrc.filter(x=>x.sana?.startsWith(prefix)).reduce((s,x)=>s+Number(x.summa||0),0);
      const topItem = currSrc.filter(x=>x.sana?.startsWith(prefix))
        .reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx, {summa:0});
      const col = sum>0
        ? (type==="xarajat"
            ? KATS.find(k=>k.id===topItem.kategoriya)?.c || th.ac
            : DARS.find(d=>d.id===topItem.tur)?.c || th.gr)
        : th.bor;
      return { label:`${mn} ${y}`, sum, color:col };
    });
  }, [currSrc, selOpt, period, type, th]);

  const lineMax = Math.max(...lineData.map(d=>d.sum), 1);
  const activePts = lineData.filter(d=>d.sum>0);
  const lineAvg = activePts.length ? Math.round(activePts.reduce((s,d)=>s+d.sum,0)/activePts.length) : 0;

  // ── Swipe ──────────────────────────────────────────────────
  const maxSlide = (scope==="family" && canSeeReport && memberData.length>0) ? 3 : 2;
  const onTS = e => { touchX.current = e.touches[0].clientX; };
  const onTE = e => {
    if (touchX.current===null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) setSlide(s=>Math.min(s+1, maxSlide));
    if (dx >  40) setSlide(s=>Math.max(s-1, 0));
    touchX.current = null;
  };

  // ── Styles (inline, using th) ──────────────────────────────
  const cardStyle = {
    background: th.sur, borderRadius:20,
    border:"1.5px solid "+th.bor,
    overflow:"hidden", marginBottom:14
  };

  return (
    <div>
      {/* O'zimning / Oilamning */}
      <div style={{display:"flex",background:th.sur,borderRadius:14,padding:4,marginBottom:12,gap:3,
        border:"1.5px solid "+th.bor}}>
        {[["mine",lg==="uz"?"O'zimning":"Mine"],["family",lg==="uz"?"Oilamning":"Family"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setScope(k);setSlide(0);setHov(null);}} style={{
            flex:1, padding:"11px 0", border:"none", borderRadius:10, cursor:"pointer",
            fontWeight:800, fontSize:14, transition:"all .22s",
            background: scope===k
              ? "linear-gradient(135deg,"+th.ac+","+th.ac2+")"
              : "transparent",
            color: scope===k ? "#fff" : th.t2,
            boxShadow: scope===k ? "0 3px 16px "+th.ac+"55" : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* Xarajat / Daromad */}
      <div style={{display:"flex",background:th.sur,borderRadius:12,padding:3,marginBottom:12,gap:3,
        border:"1.5px solid "+th.bor}}>
        {[["xarajat","💸 "+(lg==="uz"?"Xarajat":"Expenses")],
          ["daromad","💰 "+(lg==="uz"?"Daromad":"Income")]].map(([k,l])=>(
          <button key={k} onClick={()=>{setType(k);setSlide(0);setHov(null);}} style={{
            flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer",
            fontWeight:700, fontSize:13, transition:"all .22s",
            background: type===k
              ? (k==="xarajat"
                  ? "linear-gradient(135deg,"+th.rd+","+th.rd+"aa)"
                  : "linear-gradient(135deg,"+th.gr+","+th.gr+"aa)")
              : "transparent",
            color: type===k ? "#fff" : th.t2,
            boxShadow: type===k ? "0 2px 10px "+(k==="xarajat"?th.rd:th.gr)+"44" : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* Hafta / Oy / Yil */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:th.sur,
        borderRadius:12,padding:3,marginBottom:0,border:"1.5px solid "+th.bor}}>
        {[["hafta",lg==="uz"?"Hafta":"Week"],
          ["oy",   lg==="uz"?"Oy":"Month"],
          ["yil",  lg==="uz"?"Yil":"Year"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} style={{
            padding:"10px 0", borderRadius:9, border:"none", cursor:"pointer",
            fontWeight:800, fontSize:14, transition:"all .22s",
            background: period===k ? th.bg : "transparent",
            color: period===k ? th.t1 : th.t2,
            boxShadow: period===k ? "0 1px 8px rgba(0,0,0,.35)" : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* Davr scroll */}
      <div ref={scrollRef} style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",
        borderBottom:"1.5px solid "+th.bor, marginBottom:12}}>
        {opts.map((opt,i) => (
          <button key={opt.key} onClick={()=>setSelIdx(i)} style={{
            flexShrink:0, padding:"8px 16px 10px", border:"none", background:"transparent",
            cursor:"pointer", textAlign:"center", transition:"all .2s",
            color: selIdx===i ? th.t1 : th.t2,
            fontWeight: selIdx===i ? 800 : 400,
            fontSize: 14,
            borderBottom: selIdx===i ? "2.5px solid "+th.ac : "2.5px solid transparent",
          }}>
            {opt.label}
            {opt.sub && (
              <div style={{fontSize:10, color:selIdx===i?th.ac:th.t2, fontWeight:400, marginTop:1}}>
                {opt.sub}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Swipeable chart area ── */}
      <div onTouchStart={onTS} onTouchEnd={onTE} style={cardStyle}>

        {/* SLIDE 0: Donut + sanalar */}
        {slide===0 && (
          <div style={{padding:"22px 16px", display:"flex", gap:16, alignItems:"center", minHeight:210}}>
            <div style={{flexShrink:0, position:"relative", width:160, height:160}}>
              <Donut data={catData} total={totalAmt} size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null && catData[hov] ? (
                  <>
                    <div style={{fontSize:22}}>{catData[hov].icon}</div>
                    <div style={{fontSize:11,fontWeight:900,color:catData[hov].color}}>
                      {totalAmt>0?(catData[hov].sum/totalAmt*100).toFixed(1):0}%
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:13,fontWeight:900,color:th.t1,textAlign:"center",lineHeight:1.3}}>
                    {totalAmt>0 ? fmtM(totalAmt) : "—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
              {dateData.length===0
                ? <div style={{fontSize:13,color:th.t2,lineHeight:1.6}}>
                    {lg==="uz"?"Bu davrda\nma'lumot yo'q":"No data for\nthis period"}
                  </div>
                : dateData.map((d,i) => {
                    const col = catData[i%Math.max(catData.length,1)]?.color || th.ac;
                    return (
                      <div key={d.sana} style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:18,height:18,borderRadius:"50%",
                          border:"2px solid "+col, background:col+"22", flexShrink:0}}/>
                        <div style={{flex:1,fontSize:12,color:th.t2,fontWeight:500}}>{d.label}</div>
                        <div style={{fontSize:13,fontWeight:800,color:th.t1}}>
                          {d.sum.toLocaleString("uz-UZ")}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* SLIDE 1: Donut + kategoriya % */}
        {slide===1 && (
          <div style={{padding:"22px 16px",display:"flex",gap:16,alignItems:"center",minHeight:210}}>
            <div style={{flexShrink:0,position:"relative",width:160,height:160}}>
              <Donut data={catData} total={totalAmt} size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null && catData[hov] ? (
                  <>
                    <div style={{fontSize:22}}>{catData[hov].icon}</div>
                    <div style={{fontSize:11,fontWeight:900,color:catData[hov].color}}>
                      {totalAmt>0?(catData[hov].sum/totalAmt*100).toFixed(2):0}%
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:13,fontWeight:900,color:th.t1,textAlign:"center"}}>
                    {totalAmt>0 ? fmtM(totalAmt) : "—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:9}}>
              {catData.length===0
                ? <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                : <>
                    {catData.slice(0,5).map((cat,i) => (
                      <div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                        onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                        onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                        <div style={{width:16,height:16,borderRadius:"50%",
                          border:"2px solid "+cat.color, background:cat.color+"22", flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat.name}</span>
                        <span style={{fontSize:12,fontWeight:800,color:cat.color,flexShrink:0}}>
                          {totalAmt>0?(cat.sum/totalAmt*100).toFixed(2):0}%
                        </span>
                      </div>
                    ))}
                    {catData.length>5 && (
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:16,height:16,borderRadius:"50%",
                          border:"2px solid "+th.t2, background:th.t2+"22", flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600}}>
                          {lg==="uz"?"Boshqa":"Other"}
                        </span>
                        <span style={{fontSize:12,fontWeight:800,color:th.t2,flexShrink:0}}>
                          {totalAmt>0?(catData.slice(5).reduce((s,c)=>s+c.sum,0)/totalAmt*100).toFixed(2):0}%
                        </span>
                      </div>
                    )}
                  </>
              }
            </div>
          </div>
        )}

        {/* SLIDE 2: Line chart */}
        {slide===2 && (
          <div style={{padding:"16px 10px 8px"}}>
            <div style={{display:"flex",gap:20,marginBottom:8,paddingLeft:4}}>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"Jami:":"Total:"}{" "}
                <b style={{color:th.t1,fontSize:13}}>{totalAmt.toLocaleString("uz-UZ")}</b>
              </div>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"O'rtacha:":"Avg:"}{" "}
                <b style={{color:th.t1,fontSize:13}}>{lineAvg.toLocaleString("uz-UZ")}</b>
              </div>
            </div>
            <LineSVG pts={lineData} lineMax={lineMax} th={th} f={f}/>
          </div>
        )}

        {/* SLIDE 3: Oila a'zolari ulushi */}
        {slide===3 && scope==="family" && canSeeReport && (
          <div style={{padding:"22px 16px",display:"flex",gap:16,alignItems:"center",minHeight:210}}>
            <div style={{flexShrink:0,position:"relative",width:160,height:160}}>
              <Donut data={memberData} total={memTotal} size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null && memberData[hov] ? (
                  <>
                    <div style={{fontSize:11,fontWeight:800,color:memberData[hov].color,
                      textAlign:"center",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap"}}>
                      {memberData[hov].ism?.split(" ")[0]}
                    </div>
                    <div style={{fontSize:12,fontWeight:900,color:memberData[hov].color}}>
                      {memTotal>0?(memberData[hov].sum/memTotal*100).toFixed(1):0}%
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:11,fontWeight:800,color:th.t1,textAlign:"center",lineHeight:1.4}}>
                    {lg==="uz"?"Oila\nulushi":"Family\nshare"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
              {memberData.length===0
                ? <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                : memberData.map((m,i) => (
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                      onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                      onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                      <div style={{width:18,height:18,borderRadius:"50%",
                        border:"2px solid "+m.color, background:m.color+"22", flexShrink:0}}/>
                      <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {m.ism}
                      </span>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:12,fontWeight:800,color:m.color}}>
                          {memTotal>0?(m.sum/memTotal*100).toFixed(1):0}%
                        </div>
                        <div style={{fontSize:10,color:th.t2}}>
                          {m.sum.toLocaleString("uz-UZ")}
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Slide dots */}
        <div style={{display:"flex",justifyContent:"center",gap:10,padding:"10px 0 16px"}}>
          {Array.from({length:maxSlide+1},(_,i) => (
            <div key={i} onClick={()=>setSlide(i)} style={{
              width: slide===i ? 22 : 8, height:8, borderRadius:4,
              background: slide===i ? th.ac : th.t2+"44",
              transition:"all .3s", cursor:"pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Kategoriya ro'yxati ── */}
      {catData.length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {catData.map((cat,i) => {
            const pct = totalAmt>0 ? cat.sum/totalAmt*100 : 0;
            return (
              <div key={cat.id}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:7}}>
                  <div style={{width:44,height:44,borderRadius:13,background:cat.color+"22",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                    flexShrink:0,border:"1.5px solid "+cat.color+"55"}}>
                    {cat.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:th.t1}}>{cat.name}</span>
                      <span style={{fontSize:12,color:th.t2}}>{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                  <span style={{fontSize:15,fontWeight:800,color:th.t1,flexShrink:0}}>
                    {cat.sum.toLocaleString("uz-UZ")}
                  </span>
                </div>
                <div style={{height:5,background:th.bor,borderRadius:3,overflow:"hidden",marginLeft:56}}>
                  <div style={{
                    height:"100%", width:pct+"%",
                    background:"linear-gradient(90deg,"+cat.color+"66,"+cat.color+"ee)",
                    borderRadius:3,
                    transition:"width "+(0.5+i*0.07)+"s cubic-bezier(0.34,1.56,0.64,1)",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {catData.length===0 && totalAmt===0 && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:44,marginBottom:12}}>{type==="xarajat"?"📊":"💹"}</div>
          <div style={{fontSize:15,fontWeight:700,color:th.t1,marginBottom:6}}>
            {lg==="uz"?"Ma'lumot yo'q":"No data"}
          </div>
          <div style={{fontSize:13,color:th.t2}}>
            {lg==="uz"
              ? `Bu davr uchun ${type==="xarajat"?"xarajat":"daromad"} kiritilmagan`
              : `No ${type==="xarajat"?"expenses":"income"} for this period`}
          </div>
        </div>
      )}
    </div>
  );
}
