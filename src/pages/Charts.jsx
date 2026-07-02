import { useState, useEffect, useRef, useMemo } from "react";
import { KATS, KN, DARS, DN } from "../utils/constants.js";

const KAT_EMOJI = {
  oziq:"🛒", transport:"🚗", kiyim:"👕", sog:"💊",
  kommunal:"🏠", konil:"🎬", talim:"📚", hadya:"🎁", qarz:"💸", boshqa:"💳"
};
const DAR_EMOJI = {
  oylik:"💼", qoshimcha:"⚡", biznes:"🏢", sovga:"🎁", boshqa:"💰"
};
const M_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun",
               "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const M_SH = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
// Dushanba=0
const DAYS_UZ = ["Du","Se","Ch","Pa","Sh","Ya","Ya"];
const MEM_COLORS = ["#7C6FF7","#F5B731","#22C55E","#EF4444","#06B6D4","#F97316","#EC4899"];
const SLIDE_H = 240; // fixed height for ALL slides

function getWeekNum(d) {
  const s = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7);
}
// Dushanbadan boshlanuvchi hafta
function getMondayOfWeek(year, week) {
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay(); // 0=Sun
  const daysToFirstMon = jan1Day === 0 ? 1 : (8 - jan1Day);
  const firstMon = new Date(jan1);
  firstMon.setDate(jan1.getDate() + daysToFirstMon - 7);
  const mon = new Date(firstMon);
  mon.setDate(firstMon.getDate() + (week - 1) * 7);
  return mon;
}
function fmtBig(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1)+" mlrd";
  if (n >= 1e6) return (n/1e6).toFixed(1)+" mln";
  if (n >= 1e3) return Math.round(n/1e3)+"K";
  return n > 0 ? String(n) : "—";
}

// ── Donut ──────────────────────────────────────────────────────
function Donut({ data, total, size=160, hov, setHov, th }) {
  const cx=size/2, cy=size/2, R=size*.37, ri=size*.25, gap=.025;
  if (!data.length||!total) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={.4}/>
      <circle cx={cx} cy={cy} r={ri-3} fill={th.sur}/>
      <text x={cx} y={cy+5} textAnchor="middle" fill={th.t1} fontSize={14} fontWeight={700}>—</text>
    </svg>
  );
  let cur = -Math.PI/2;
  const segs = data.slice(0,7).map((cat,i) => {
    const ang = Math.max((cat.sum/total)*2*Math.PI - gap, .01);
    const sa=cur+gap/2, ea=cur+gap/2+ang;
    cur += ang+gap;
    const lg2 = ang>Math.PI?1:0;
    return {
      ...cat, i,
      midA: sa+ang/2,
      d: [`M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
          `A ${R} ${R} 0 ${lg2} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
          `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
          `A ${ri} ${ri} 0 ${lg2} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
          "Z"].join(" ")
    };
  });
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={.25}/>
      {segs.map((s,i) => (
        <path key={s.id||i} d={s.d} fill={s.color}
          opacity={hov==null?0.92:hov===i?1:0.18}
          style={{
            transform:hov===i?`translate(${Math.cos(s.midA)*7}px,${Math.sin(s.midA)*7}px)`:"none",
            transition:"all .2s", filter:hov===i?`drop-shadow(0 0 10px ${s.color}bb)`:"none",
            cursor:"pointer"
          }}
          onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
          onTouchStart={e=>{e.preventDefault();setHov(i);}} onTouchEnd={()=>setHov(null)}
        />
      ))}
      <circle cx={cx} cy={cy} r={ri-3} fill={th.sur}/>
    </svg>
  );
}

// ── Line chart — segmented, axis labels always visible ─────────
function LineSVG({ pts, lineMax, th, f }) {
  const W=340, H=180, pL=58, pR=8, pT=16, pB=36;
  const iW=W-pL-pR, iH=H-pT-pB;
  // axis label color: always bright regardless of theme
  const AXIS_CLR = th.dark ? "#e2e8f0" : "#334155";
  const GRID_CLR = th.dark ? "#1e293b" : "#e2e8f0";
  const ZERO_CLR = th.dark ? "#475569" : "#94a3b8";

  if (!pts.length||lineMax===0) return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <text x={W/2} y={H/2} textAnchor="middle" fill={AXIS_CLR} fontSize={13}>—</text>
    </svg>
  );

  const mp = pts.map((d,i) => ({
    ...d,
    x: pL + (i/Math.max(pts.length-1,1))*iW,
    y: pT + iH - (d.sum/lineMax)*iH,
  }));

  // Y ticks — 4 levels
  const yTicks = [0, .33, .67, 1].filter(p => lineMax*p > 0);

  // X labels — max 5 evenly
  const step = Math.max(1, Math.floor(pts.length/5));
  const xSet = new Set([0, pts.length-1]);
  for (let i=step; i<pts.length-1; i+=step) xSet.add(i);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {/* Y grid + labels */}
      {yTicks.map((p,gi) => {
        const gy = pT + iH*(1-p);
        return (
          <g key={gi}>
            <line x1={pL} y1={gy} x2={W-pR} y2={gy}
              stroke={p===0 ? ZERO_CLR : GRID_CLR}
              strokeWidth={p===0 ? 1 : 0.7}
              strokeDasharray={p>0 ? "3,6" : ""}/>
            {p > 0 && (
              <text x={pL-6} y={gy+4} fontSize={10} fill={AXIS_CLR}
                textAnchor="end" fontWeight={600} fontFamily="system-ui">
                {f(Math.round(lineMax*p), true)}
              </text>
            )}
          </g>
        );
      })}
      {/* Segments */}
      {mp.map((pt,i) => {
        if (i===0) return null;
        const prev=mp[i-1];
        return <line key={i} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y}
          stroke={pt.sum>0?pt.color:prev.color} strokeWidth={2.5} strokeLinecap="round"/>;
      })}
      {/* Dots */}
      {mp.map((pt,i) => (
        <circle key={i} cx={pt.x} cy={pt.y}
          r={pt.sum>0?4.5:2.5}
          fill={pt.sum>0?pt.color:GRID_CLR}
          stroke={th.sur} strokeWidth={1.5}/>
      ))}
      {/* X labels */}
      {mp.map((pt,i) => xSet.has(i) && (
        <text key={i} x={pt.x} y={H-2} fontSize={10} fill={AXIS_CLR}
          textAnchor="middle" fontWeight={600} fontFamily="system-ui">
          {pt.label}
        </text>
      ))}
    </svg>
  );
}

// ── Pill toggle (like login screen) ───────────────────────────
function PillToggle({ options, value, onChange, th }) {
  return (
    <div style={{display:"flex", background:th.surH, borderRadius:14, padding:4, gap:4,
      border:"1.5px solid "+th.bor}}>
      {options.map(([k,l]) => (
        <button key={k} onClick={()=>onChange(k)} style={{
          flex:1, padding:"11px 0", borderRadius:10, cursor:"pointer",
          fontWeight:800, fontSize:14, transition:"all .22s",
          border: "1.5px solid "+(value===k ? th.ac : th.bor),
          background: value===k ? th.ac+"22" : "transparent",
          color: value===k ? th.ac : th.t2,
        }}>{l}</button>
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function ChartsPage({
  xar, dar, bX, bD, th, lg, f, azolar, user, canSeeReport
}) {
  const now=new Date(), Y=now.getFullYear(), MO=now.getMonth(), WN=getWeekNum(now);

  const [scope,  setScope]  = useState("mine");
  const [type,   setType]   = useState("xarajat");
  const [period, setPeriod] = useState("oy");
  const [selIdx, setSelIdx] = useState(0);
  const [slide,  setSlide]  = useState(0);
  const [hov,    setHov]    = useState(null);
  const scrollRef = useRef(null);
  const touchX    = useRef(null);

  // ── Options ────────────────────────────────────────────────
  const opts = useMemo(() => {
    if (period==="hafta") {
      const cnt = Math.min(WN, 12);
      return Array.from({length:cnt}, (_,i) => {
        const w = WN-(cnt-1-i);
        const mon = getMondayOfWeek(Y, w);
        const sun = new Date(mon.getTime()+6*86400000);
        const label = w===WN ? (lg==="uz"?"Bu hafta":"This week")
          : w===WN-1 ? (lg==="uz"?"O'tgan hafta":"Last week")
          : `${w}-hafta`;
        const sub = `${mon.getDate()} ${M_SH[mon.getMonth()]} – ${sun.getDate()} ${M_SH[sun.getMonth()]}`;
        return { key:`${Y}-W${w}`, label, sub };
      });
    }
    if (period==="oy") {
      return Array.from({length:MO+1}, (_,i) => ({
        key:`${Y}-${String(i+1).padStart(2,"0")}`,
        label: M_UZ[i], sub: String(Y)
      }));
    }
    const a = [];
    for (let y=Y-3; y<Y-1; y++) a.push({key:String(y),label:String(y),sub:""});
    a.push({key:`${Y-1}-last`, label:lg==="uz"?"O'tgan yil":"Last year", sub:String(Y-1)});
    a.push({key:`${Y}-this`,   label:lg==="uz"?"Bu yil":"This year",    sub:String(Y)});
    return a;
  }, [period, lg, WN, MO, Y]);

  useEffect(() => {
    setSelIdx(opts.length-1); setSlide(0); setHov(null);
    setTimeout(() => { if(scrollRef.current) scrollRef.current.scrollLeft=scrollRef.current.scrollWidth; }, 60);
  }, [period, opts.length]);

  const selOpt = opts[Math.min(selIdx, opts.length-1)] || opts[opts.length-1];

  // ── Data sources — privacy fix (#5) ───────────────────────
  const allX = bX||xar||[], allD = bD||dar||[];
  const srcX = useMemo(() => {
    if (scope==="mine"||!canSeeReport) return allX.filter(x=>x.uid===user?.id||!x.uid);
    return allX;
  }, [allX,scope,canSeeReport,user]);
  const srcD = useMemo(() => {
    if (scope==="mine"||!canSeeReport) return allD.filter(d=>d.uid===user?.id||!d.uid);
    return allD;
  }, [allD,scope,canSeeReport,user]);

  // ── Period filter ──────────────────────────────────────────
  function byPeriod(arr) {
    const k = selOpt?.key||"";
    return arr.filter(item => {
      if (!item.sana) return false;
      if (period==="oy")    return item.sana.startsWith(k);
      if (period==="hafta") {
        const d=new Date(item.sana);
        return `${d.getFullYear()}-W${getWeekNum(d)}`===k;
      }
      return item.sana.startsWith(k.replace(/-this|-last/,""));
    });
  }
  const filtX = useMemo(()=>byPeriod(srcX),[srcX,selOpt,period]);
  const filtD = useMemo(()=>byPeriod(srcD),[srcD,selOpt,period]);
  const curr  = type==="xarajat"?filtX:filtD;
  const total = curr.reduce((s,i)=>s+Number(i.summa||0),0);

  // ── Categories ─────────────────────────────────────────────
  const cats = useMemo(()=>{
    if (type==="xarajat") return KATS.map((k,i)=>({
      id:k.id, name:KN[lg]?.[i]||k.id, color:k.c, icon:KAT_EMOJI[k.id]||"💳",
      sum:filtX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
    return DARS.map((d,i)=>({
      id:d.id, name:DN[lg]?.[i]||d.id, color:d.c, icon:DAR_EMOJI[d.id]||"💰",
      sum:filtD.filter(x=>x.tur===d.id).reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
  },[filtX,filtD,type,lg]);

  // ── Member data ────────────────────────────────────────────
  const members = useMemo(()=>{
    if (scope!=="family"||!canSeeReport||!azolar?.length) return [];
    return azolar.map((a,i)=>({
      ...a, color:MEM_COLORS[i%MEM_COLORS.length],
      sum: type==="xarajat"
        ? byPeriod(allX.filter(x=>x.uid===a.id)).reduce((s,x)=>s+Number(x.summa||0),0)
        : byPeriod(allD.filter(d=>d.uid===a.id)).reduce((s,d)=>s+Number(d.summa||0),0)
    })).filter(m=>m.sum>0).sort((a,b)=>b.sum-a.sum);
  },[allX,allD,azolar,selOpt,period,type,scope,canSeeReport]);
  const memTotal = members.reduce((s,m)=>s+m.sum,0);

  // ── Slide 0: date list ─────────────────────────────────────
  const datePts = useMemo(()=>{
    const map={};
    curr.forEach(x=>{if(x.sana) map[x.sana]=(map[x.sana]||0)+Number(x.summa||0);});
    return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5)
      .map(([sana,sum])=>{
        const d=new Date(sana);
        const label = period==="yil"?`${M_SH[d.getMonth()]} ${d.getFullYear()}`
          : `${M_SH[d.getMonth()]} ${d.getDate()}`;
        return {sana,sum,label,color:cats[0]?.color||th.ac};
      });
  },[curr,cats,period,th]);

  // ── Slide 2: line data ─────────────────────────────────────
  const getColor = sana => {
    const items=curr.filter(x=>x.sana===sana);
    if (!items.length) return th.bor;
    const top=items.reduce((m,x)=>Number(x.summa||0)>Number(m.summa||0)?x:m,items[0]);
    return type==="xarajat"
      ? KATS.find(k=>k.id===top.kategoriya)?.c||th.ac
      : DARS.find(d=>d.id===top.tur)?.c||th.gr;
  };

  const linePts = useMemo(()=>{
    const k=selOpt?.key||"";
    if (period==="oy") {
      const [yr,mn]=k.split("-").map(Number);
      const days=new Date(yr,mn,0).getDate();
      return Array.from({length:days},(_,i)=>{
        const sana=`${yr}-${String(mn).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
        return {label:String(i+1),sum:curr.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0),color:getColor(sana)};
      });
    }
    if (period==="hafta") {
      const [yr,ws]=k.split("-W");
      const mon=getMondayOfWeek(parseInt(yr),parseInt(ws));
      return Array.from({length:7},(_,i)=>{
        const d=new Date(mon.getTime()+i*86400000);
        const sana=d.toISOString().slice(0,10);
        const sum=curr.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0);
        // Dushanba = "Du 23 Iyn"
        return {label:`${DAYS_UZ[i]} ${d.getDate()} ${M_SH[d.getMonth()]}`,sum,color:getColor(sana)};
      });
    }
    const yr=parseInt(k.replace(/-this|-last/,""));
    return M_SH.map((mn,i)=>{
      const pfx=`${yr}-${String(i+1).padStart(2,"0")}`;
      const sum=curr.filter(x=>x.sana?.startsWith(pfx)).reduce((s,x)=>s+Number(x.summa||0),0);
      const topItem=curr.filter(x=>x.sana?.startsWith(pfx)).reduce((m,x)=>Number(x.summa||0)>Number(m.summa||0)?x:m,{summa:0});
      return {label:`${mn} ${yr}`,sum,color:sum>0?(type==="xarajat"?KATS.find(k2=>k2.id===topItem.kategoriya)?.c||th.ac:DARS.find(d=>d.id===topItem.tur)?.c||th.gr):th.bor};
    });
  },[curr,selOpt,period,type,th]);

  const lineMax=Math.max(...linePts.map(d=>d.sum),1);
  const actPts=linePts.filter(d=>d.sum>0);
  const lineAvg=actPts.length?Math.round(actPts.reduce((s,d)=>s+d.sum,0)/actPts.length):0;

  // ── Swipe ──────────────────────────────────────────────────
  const maxSlide = (scope==="family"&&canSeeReport&&members.length>0)?3:2;
  const onTS=e=>{touchX.current=e.touches[0].clientX;};
  const onTE=e=>{
    if(touchX.current===null)return;
    const dx=e.changedTouches[0].clientX-touchX.current;
    if(dx<-40) setSlide(s=>Math.min(s+1,maxSlide));
    if(dx>40)  setSlide(s=>Math.max(s-1,0));
    touchX.current=null;
  };

  // ── Shared slide content box ───────────────────────────────
  const slideBox = { height:SLIDE_H, display:"flex", alignItems:"center" };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>

      {/* O'zimning / Oilamning — Login-style pill */}
      <PillToggle
        options={[["mine",lg==="uz"?"O'zimning":"Mine"],["family",lg==="uz"?"Oilamning":"Family"]]}
        value={scope}
        onChange={k=>{setScope(k);setSlide(0);setHov(null);}}
        th={th}
      />
      <div style={{height:10}}/>

      {/* Xarajat / Daromad */}
      <div style={{display:"flex",background:th.surH,borderRadius:12,padding:4,gap:4,
        marginBottom:10,border:"1.5px solid "+th.bor}}>
        {[["xarajat","💸 "+(lg==="uz"?"Xarajat":"Expenses")],
          ["daromad","💰 "+(lg==="uz"?"Daromad":"Income")]].map(([k,l])=>(
          <button key={k} onClick={()=>{setType(k);setSlide(0);setHov(null);}} style={{
            flex:1, padding:"9px 0", borderRadius:9, cursor:"pointer",
            fontWeight:700, fontSize:13, transition:"all .22s",
            border:"1.5px solid "+(type===k?(k==="xarajat"?th.rd:th.gr):th.bor),
            background: type===k?(k==="xarajat"?th.rd+"22":th.gr+"22"):"transparent",
            color: type===k?(k==="xarajat"?th.rd:th.gr):th.t2,
          }}>{l}</button>
        ))}
      </div>

      {/* Hafta / Oy / Yil */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
        background:th.surH, borderRadius:12, padding:4, marginBottom:0,
        gap:4, border:"1.5px solid "+th.bor}}>
        {[["hafta",lg==="uz"?"Hafta":"Week"],
          ["oy",   lg==="uz"?"Oy":"Month"],
          ["yil",  lg==="uz"?"Yil":"Year"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} style={{
            padding:"10px 0", borderRadius:9, cursor:"pointer",
            fontWeight:800, fontSize:14, transition:"all .22s",
            border:"1.5px solid "+(period===k?th.ac:th.bor),
            background: period===k ? th.ac+"22" : "transparent",
            color: period===k ? th.ac : th.t2,
          }}>{l}</button>
        ))}
      </div>

      {/* Scroll options */}
      <div ref={scrollRef} style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",
        borderBottom:"1.5px solid "+th.bor, marginBottom:12}}>
        {opts.map((opt,i)=>(
          <button key={opt.key} onClick={()=>setSelIdx(i)} style={{
            flexShrink:0, padding:"8px 16px 10px", border:"none", background:"transparent",
            cursor:"pointer", textAlign:"center", transition:"all .2s",
            color: selIdx===i ? th.t1 : th.t2,
            fontWeight: selIdx===i ? 800 : 400, fontSize:14,
            borderBottom: selIdx===i?"2.5px solid "+th.ac:"2.5px solid transparent",
          }}>
            {opt.label}
            {opt.sub && <div style={{fontSize:10,color:selIdx===i?th.ac:th.t1,
              opacity:selIdx===i?1:0.4,fontWeight:400,marginTop:1}}>{opt.sub}</div>}
          </button>
        ))}
      </div>

      {/* ── Swipeable slides — FIXED HEIGHT ── */}
      <div onTouchStart={onTS} onTouchEnd={onTE}
        style={{background:th.sur,borderRadius:20,border:"1.5px solid "+th.bor,
          overflow:"hidden",marginBottom:14}}>

        {/* SLIDE 0: Donut + sanalar */}
        {slide===0 && (
          <div style={{...slideBox, padding:"16px", gap:14}}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={cats} total={total} size={150} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&cats[hov]
                  ?<><div style={{fontSize:22}}>{cats[hov].icon}</div>
                     <div style={{fontSize:11,fontWeight:900,color:cats[hov].color}}>
                       {total>0?(cats[hov].sum/total*100).toFixed(1):0}%</div></>
                  :<div style={{fontSize:13,fontWeight:900,color:th.t1,textAlign:"center",lineHeight:1.3}}>
                     {total>0?fmtBig(total):"—"}</div>}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:9}}>
              {datePts.length===0
                ?<div style={{fontSize:13,color:th.t1,opacity:.5,lineHeight:1.6}}>
                   {lg==="uz"?"Bu davrda\nma'lumot yo'q":"No data\nthis period"}</div>
                :datePts.map((d,i)=>{
                  const col=cats[i%Math.max(cats.length,1)]?.color||th.ac;
                  return (
                    <div key={d.sana} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:16,height:16,borderRadius:"50%",
                        border:"2px solid "+col,background:col+"25",flexShrink:0}}/>
                      <div style={{flex:1,fontSize:12,color:th.t1,fontWeight:500,opacity:.8}}>{d.label}</div>
                      <div style={{fontSize:13,fontWeight:800,color:th.t1}}>
                        {d.sum.toLocaleString("uz-UZ")}</div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* SLIDE 1: Donut + kategoriya % */}
        {slide===1 && (
          <div style={{...slideBox, padding:"16px", gap:14}}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={cats} total={total} size={150} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&cats[hov]
                  ?<><div style={{fontSize:22}}>{cats[hov].icon}</div>
                     <div style={{fontSize:11,fontWeight:900,color:cats[hov].color}}>
                       {total>0?(cats[hov].sum/total*100).toFixed(2):0}%</div></>
                  :<div style={{fontSize:13,fontWeight:900,color:th.t1,textAlign:"center"}}>
                     {total>0?fmtBig(total):"—"}</div>}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:8}}>
              {cats.length===0
                ?<div style={{fontSize:13,color:th.t1,opacity:.5}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                :<>
                   {cats.slice(0,5).map((c,i)=>(
                     <div key={c.id} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}
                       onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                       onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                       <div style={{width:14,height:14,borderRadius:"50%",
                         border:"2px solid "+c.color,background:c.color+"25",flexShrink:0}}/>
                       <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                         overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                       <span style={{fontSize:12,fontWeight:800,color:c.color,flexShrink:0}}>
                         {total>0?(c.sum/total*100).toFixed(2):0}%</span>
                     </div>
                   ))}
                   {cats.length>5&&(
                     <div style={{display:"flex",alignItems:"center",gap:7}}>
                       <div style={{width:14,height:14,borderRadius:"50%",
                         border:"2px solid "+th.t2,background:th.t2+"25",flexShrink:0}}/>
                       <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600}}>
                         {lg==="uz"?"Boshqa":"Other"}</span>
                       <span style={{fontSize:12,fontWeight:800,color:th.t2,flexShrink:0}}>
                         {total>0?(cats.slice(5).reduce((s,c)=>s+c.sum,0)/total*100).toFixed(2):0}%</span>
                     </div>
                   )}
                 </>
              }
            </div>
          </div>
        )}

        {/* SLIDE 2: Line chart — SAME HEIGHT */}
        {slide===2 && (
          <div style={{height:SLIDE_H, padding:"12px 10px 8px", display:"flex",
            flexDirection:"column", justifyContent:"center"}}>
            <div style={{display:"flex",gap:20,marginBottom:6,paddingLeft:4}}>
              <span style={{fontSize:12,color:th.t1,opacity:.8}}>
                {lg==="uz"?"Jami:":"Total:"}{" "}
                <b style={{color:th.t1,fontSize:13}}>{total.toLocaleString("uz-UZ")}</b>
              </span>
              <span style={{fontSize:12,color:th.t1,opacity:.8}}>
                {lg==="uz"?"O'rtacha:":"Avg:"}{" "}
                <b style={{color:th.t1,fontSize:13}}>{lineAvg.toLocaleString("uz-UZ")}</b>
              </span>
            </div>
            <div style={{flex:1,minHeight:0}}>
              <LineSVG pts={linePts} lineMax={lineMax} th={th} f={f}/>
            </div>
          </div>
        )}

        {/* SLIDE 3: Oila a'zolari — SAME HEIGHT */}
        {slide===3 && scope==="family" && canSeeReport && (
          <div style={{...slideBox, padding:"16px", gap:14}}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={members} total={memTotal} size={150} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&members[hov]
                  ?<><div style={{fontSize:10,fontWeight:900,color:members[hov].color,
                       textAlign:"center",maxWidth:56,overflow:"hidden",
                       textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                       {members[hov].ism?.split(" ")[0]}</div>
                     <div style={{fontSize:12,fontWeight:900,color:members[hov].color}}>
                       {memTotal>0?(members[hov].sum/memTotal*100).toFixed(1):0}%</div></>
                  :<div style={{fontSize:11,fontWeight:800,color:th.t1,textAlign:"center",lineHeight:1.4}}>
                     {lg==="uz"?"Oila\nulushi":"Family\nshare"}</div>}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:9}}>
              {members.length===0
                ?<div style={{fontSize:13,color:th.t1,opacity:.5}}>
                   {lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                :members.map((m,i)=>(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                    onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                    onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                    <div style={{width:16,height:16,borderRadius:"50%",
                      border:"2px solid "+m.color,background:m.color+"25",flexShrink:0}}/>
                    <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.ism}</span>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:800,color:m.color}}>
                        {memTotal>0?(m.sum/memTotal*100).toFixed(1):0}%</div>
                      <div style={{fontSize:10,color:th.t1,opacity:.6}}>
                        {m.sum.toLocaleString("uz-UZ")}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Slide dots */}
        <div style={{display:"flex",justifyContent:"center",gap:10,padding:"8px 0 14px"}}>
          {Array.from({length:maxSlide+1},(_,i)=>(
            <div key={i} onClick={()=>setSlide(i)} style={{
              width:slide===i?22:8, height:8, borderRadius:4,
              background:slide===i?th.ac:th.t1+"33",
              transition:"all .3s", cursor:"pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Kategoriya ro'yxati ── */}
      {cats.length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {cats.map((cat,i)=>{
            const pct=total>0?cat.sum/total*100:0;
            return (
              <div key={cat.id}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                  <div style={{width:44,height:44,borderRadius:13,background:cat.color+"22",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                    flexShrink:0,border:"1.5px solid "+cat.color+"55"}}>{cat.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:th.t1}}>{cat.name}</span>
                      <span style={{fontSize:12,color:th.t2}}>{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                  <span style={{fontSize:15,fontWeight:800,color:th.t1,flexShrink:0}}>
                    {cat.sum.toLocaleString("uz-UZ")}</span>
                </div>
                <div style={{height:5,background:th.bor,borderRadius:3,overflow:"hidden",marginLeft:56}}>
                  <div style={{height:"100%",width:pct+"%",borderRadius:3,
                    background:`linear-gradient(90deg,${cat.color}66,${cat.color}ee)`,
                    transition:`width ${.5+i*.07}s cubic-bezier(.34,1.56,.64,1)`}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cats.length===0&&total===0&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:44,marginBottom:12}}>{type==="xarajat"?"📊":"💹"}</div>
          <div style={{fontSize:15,fontWeight:700,color:th.t1,marginBottom:6}}>
            {lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
          <div style={{fontSize:13,color:th.t2}}>
            {lg==="uz"?`Bu davr uchun ${type==="xarajat"?"xarajat":"daromad"} kiritilmagan`
              :`No ${type==="xarajat"?"expenses":"income"} for this period`}</div>
        </div>
      )}
    </div>
  );
}
