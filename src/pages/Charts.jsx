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

function getWeekNum(d) {
  const s = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7);
}
function fmtM(n) {
  if (n >= 1000000) return "+" + (n/1000000).toFixed(1) + " mln";
  if (n >= 1000)    return "+" + Math.round(n/1000) + "K";
  return n > 0 ? "+" + n : "—";
}

// ── Donut ──────────────────────────────────────────────────────
function Donut({ data, total, size=160, hov, setHov, th, center }) {
  const cx=size/2, cy=size/2, R=size*0.37, ri=size*0.25, gap=0.022;
  const ring = <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.25}/>;
  const hole = <circle cx={cx} cy={cy} r={ri-3} fill={th.sur}/>;
  if (!data.length||total===0) return (
    <svg width={size} height={size}>{ring}{hole}
      <text x={cx} y={cy+5} textAnchor="middle" fill={th.t3} fontSize={12} fontWeight={700}>—</text>
    </svg>
  );
  let cursor=-Math.PI/2;
  const segs = data.slice(0,6).map((cat,i) => {
    const angle = Math.max((cat.sum/total)*2*Math.PI - gap, 0.01);
    const sa=cursor+gap/2, ea=cursor+gap/2+angle;
    cursor += angle+gap;
    const large = angle>Math.PI?1:0;
    const d = [
      `M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
      `A ${R} ${R} 0 ${large} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
      `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
      `A ${ri} ${ri} 0 ${large} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
      "Z"
    ].join(" ");
    return { ...cat, d, midA:sa+angle/2, i };
  });
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      {ring}
      {segs.map((seg,i) => (
        <path key={seg.id||i} d={seg.d} fill={seg.color}
          opacity={hov===null||hov===undefined ? 0.92 : hov===i ? 1 : 0.2}
          style={{
            transform: hov===i ? `translate(${Math.cos(seg.midA)*7}px,${Math.sin(seg.midA)*7}px)` : "none",
            transition:"all .2s ease",
            filter: hov===i ? `drop-shadow(0 0 10px ${seg.color}cc)` : "none",
            cursor:"pointer",
          }}
          onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
          onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}
        />
      ))}
      {hole}
    </svg>
  );
}

// ── Line chart SVG — rasmdagidek segmented ─────────────────────
function LineSVG({ pts, lineMax, th, f }) {
  const W=340, H=210, pL=10, pR=10, pT=22, pB=38;
  const iW=W-pL-pR, iH=H-pT-pB;
  if (!pts.length) return null;

  const mapped = pts.map((d,i) => ({
    x: pL + (i / Math.max(pts.length-1,1)) * iW,
    y: pT + iH - (d.sum / Math.max(lineMax,1)) * iH,
    ...d,
  }));

  // Segment-by-segment lines (each segment gets the color of its START point)
  const segments = [];
  for (let i=0; i<mapped.length-1; i++) {
    const p1=mapped[i], p2=mapped[i+1];
    const col = p1.sum>0 ? p1.color : p2.color;
    segments.push({ x1:p1.x,y1:p1.y, x2:p2.x,y2:p2.y, color:col });
  }

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].filter(pct => lineMax*pct > 0);

  // X label: show ~5 evenly spaced
  const step = Math.max(1, Math.floor(pts.length/5));
  const xLabelIdxs = new Set([0]);
  for (let i=step; i<pts.length-1; i+=step) xLabelIdxs.add(i);
  xLabelIdxs.add(pts.length-1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {/* Grid lines */}
      {yTicks.map((pct,gi) => {
        const gy = pT + iH*(1-pct);
        return (
          <g key={gi}>
            <line x1={pL} y1={gy} x2={W-pR} y2={gy} stroke={th.bor} strokeWidth={0.7}
              strokeDasharray={pct>0?"4,5":""}/>
            <text x={pL+2} y={gy-4} fontSize={9} fill={th.t2}>
              {f(Math.round(lineMax*pct),true)}
            </text>
          </g>
        );
      })}
      {/* Zero line */}
      <line x1={pL} y1={pT+iH} x2={W-pR} y2={pT+iH} stroke={th.t3} strokeWidth={0.5}/>
      {/* Segments */}
      {segments.map((seg,i) => (
        <line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
          stroke={seg.color} strokeWidth={2.5} strokeLinecap="round"/>
      ))}
      {/* Dots */}
      {mapped.map((pt,i) => (
        <circle key={i} cx={pt.x} cy={pt.y}
          r={pt.sum>0 ? 4.5 : 2.5}
          fill={pt.color}
          stroke={th.sur} strokeWidth={1.5}
          opacity={0.9}
        />
      ))}
      {/* X labels */}
      {mapped.map((pt,i) => xLabelIdxs.has(i) && (
        <text key={i} x={pt.x} y={H-4} fontSize={9} fill={th.t2} textAnchor="middle">{pt.label}</text>
      ))}
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function ChartsPage({ xar, dar, bX, bD, th, lg, f, azolar, user, canSeeReport }) {
  const now=new Date(), thisY=now.getFullYear(), thisM=now.getMonth(), thisW=getWeekNum(now);

  const [scope,  setScope]  = useState("mine");
  const [type,   setType]   = useState("xarajat"); // xarajat | daromad
  const [period, setPeriod] = useState("oy");
  const [selIdx, setSelIdx] = useState(0);
  const [slide,  setSlide]  = useState(0);
  const [hov,    setHov]    = useState(null);
  const scrollRef = useRef(null);
  const touchX    = useRef(null);

  // ── Period options ─────────────────────────────────────────
  const opts = useMemo(() => {
    if (period==="hafta") {
      return Array.from({length:Math.min(thisW,10)},(_,i) => {
        const w = thisW-(Math.min(thisW,10)-1-i);
        const jan1 = new Date(thisY,0,1);
        const ws = new Date(jan1.getTime()+(w-1)*7*86400000);
        const we = new Date(ws.getTime()+6*86400000);
        const label = w===thisW?(lg==="uz"?"Bu hafta":"This week"):
                      w===thisW-1?(lg==="uz"?"O'tgan hafta":"Last week"):`${w}-hafta`;
        const sub = `${ws.getDate()} ${months_sh[ws.getMonth()]} - ${we.getDate()} ${months_sh[we.getMonth()]}`;
        return { key:`${thisY}-W${w}`, label, sub };
      });
    }
    if (period==="oy") {
      return Array.from({length:thisM+1},(_,i) => ({
        key:`${thisY}-${String(i+1).padStart(2,"0")}`,
        label: months_uz[i],
        sub: String(thisY),
      }));
    }
    const arr=[];
    for (let y=thisY-3;y<thisY-1;y++) arr.push({key:String(y),label:String(y),sub:""});
    arr.push({key:`${thisY-1}-last`,label:lg==="uz"?"O'tgan yil":"Last year",sub:String(thisY-1)});
    arr.push({key:`${thisY}-this`, label:lg==="uz"?"Bu yil":"This year",  sub:String(thisY)});
    return arr;
  },[period,lg,thisW,thisM,thisY]);

  useEffect(()=>{
    setSelIdx(opts.length-1); setSlide(0); setHov(null);
    setTimeout(()=>{ if(scrollRef.current) scrollRef.current.scrollLeft=scrollRef.current.scrollWidth; },60);
  },[period,opts.length]);

  const selectedOpt = opts[Math.min(selIdx,opts.length-1)]||opts[opts.length-1];

  // ── Source data ────────────────────────────────────────────
  const allX = bX||xar||[], allD = bD||dar||[];

  const srcX = useMemo(()=>{
    let b = allX;
    if (scope==="mine") b = b.filter(x=>x.uid===user?.id||!x.uid);
    return b;
  },[allX,scope,user]);

  const srcD = useMemo(()=>{
    let b = allD;
    if (scope==="mine") b = b.filter(d=>d.uid===user?.id||!d.uid);
    return b;
  },[allD,scope,user]);

  // ── Filter by period ───────────────────────────────────────
  function filterByPeriod(arr) {
    const key=selectedOpt?.key||"";
    return arr.filter(item=>{
      if(!item.sana) return false;
      if (period==="oy")    return item.sana.startsWith(key);
      if (period==="hafta") {
        const d=new Date(item.sana);
        return `${d.getFullYear()}-W${getWeekNum(d)}`===key;
      }
      const y=key.replace(/-this|-last/,"");
      return item.sana.startsWith(y);
    });
  }

  const filtX = useMemo(()=>filterByPeriod(srcX),[srcX,selectedOpt,period]);
  const filtD = useMemo(()=>filterByPeriod(srcD),[srcD,selectedOpt,period]);

  const src     = type==="xarajat" ? filtX : filtD;
  const totalAmt= src.reduce((s,i)=>s+Number(i.summa||0),0);

  // ── Category data ──────────────────────────────────────────
  const catData = useMemo(()=>{
    if (type==="xarajat") {
      return KATS.map((k,i)=>{
        const sum=filtX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0);
        return {id:k.id,name:KN[lg]?.[i]||k.id,color:k.c,icon:KAT_EMOJI[k.id]||"💳",sum};
      }).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
    } else {
      return DARS.map((d,i)=>{
        const sum=filtD.filter(x=>x.tur===d.id).reduce((s,x)=>s+Number(x.summa||0),0);
        return {id:d.id,name:DN[lg]?.[i]||d.id,color:d.c,icon:DAR_EMOJI[d.id]||"💰",sum};
      }).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
    }
  },[filtX,filtD,type,lg]);

  // ── Member data (slide 3 for family scope) ─────────────────
  const memberData = useMemo(()=>{
    if (scope!=="family"||!azolar?.length) return [];
    return azolar.map(a=>{
      const xSum = filterByPeriod(allX.filter(x=>x.uid===a.id)).reduce((s,x)=>s+Number(x.summa||0),0);
      const dSum = filterByPeriod(allD.filter(d=>d.uid===a.id)).reduce((s,d)=>s+Number(d.summa||0),0);
      const sum  = type==="xarajat" ? xSum : dSum;
      return {...a, sum, color:"#"+Math.abs(a.id?.charCodeAt(0)*997+a.id?.charCodeAt(1)*31).toString(16).slice(0,6).padStart(6,"a")};
    }).filter(m=>m.sum>0).sort((a,b)=>b.sum-a.sum);
  },[allX,allD,azolar,selectedOpt,period,type,scope]);

  // Assign stable colors to members
  const MEM_COLORS=["#7C6FF7","#F5B731","#22C55E","#EF4444","#06B6D4","#F97316","#EC4899"];
  const memberDataColored = memberData.map((m,i)=>({...m,color:MEM_COLORS[i%MEM_COLORS.length]}));

  // ── Date breakdown for slide 0 ─────────────────────────────
  const dateData = useMemo(()=>{
    const map={};
    src.forEach(x=>{ if(x.sana) map[x.sana]=(map[x.sana]||0)+Number(x.summa||0); });
    return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5)
      .map(([sana,sum])=>{
        const d=new Date(sana);
        const label=period==="yil"?months_sh[d.getMonth()]
          :`${months_sh[d.getMonth()]} ${d.getDate()}${period==="hafta"?", "+d.getFullYear():""}`;
        const topKat = catData[0];
        return {sana,sum,label,color:topKat?.color||"#F5B731"};
      });
  },[src,catData,period]);

  // ── Line chart data for slide 2 ────────────────────────────
  const lineData = useMemo(()=>{
    const key=selectedOpt?.key||"";
    const getColor=(sana)=>{
      const dayItems = src.filter(x=>x.sana===sana);
      if (!dayItems.length) return "#4B5563";
      const maxItem = dayItems.reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx,dayItems[0]);
      if (type==="xarajat") return KATS.find(k=>k.id===maxItem.kategoriya)?.c||"#F5B731";
      return DARS.find(d=>d.id===maxItem.tur)?.c||"#22C55E";
    };
    if (period==="oy") {
      const [y,m]=key.split("-").map(Number);
      const days=new Date(y,m,0).getDate();
      return Array.from({length:days},(_,i)=>{
        const sana=`${y}-${String(m).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
        const sum=src.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0);
        return {label:String(i+1),sum,color:getColor(sana),sana};
      });
    }
    if (period==="hafta") {
      const [y,wStr]=key.split("-W");
      const jan1=new Date(parseInt(y),0,1);
      const wStart=new Date(jan1.getTime()+(parseInt(wStr)-1)*7*86400000);
      return Array.from({length:7},(_,i)=>{
        const d=new Date(wStart.getTime()+i*86400000);
        const sana=d.toISOString().slice(0,10);
        const sum=src.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0);
        return {label:`${months_sh[d.getMonth()]} ${d.getDate()}`,sum,color:getColor(sana),sana};
      });
    }
    const y=parseInt(key.replace(/-this|-last/,""));
    return months_sh.map((mn,i)=>{
      const prefix=`${y}-${String(i+1).padStart(2,"0")}`;
      const sana=prefix+"-01";
      const sum=src.filter(x=>x.sana?.startsWith(prefix)).reduce((s,x)=>s+Number(x.summa||0),0);
      const col=sum>0?getColor(src.filter(x=>x.sana?.startsWith(prefix)).reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx,src.filter(x=>x.sana?.startsWith(prefix))[0]||{})?.sana||""):"#4B5563";
      return {label:`${mn} ${y}`,sum,color:sum>0?(KATS.find(k=>k.id===src.filter(x=>x.sana?.startsWith(prefix)).reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx,src.filter(x=>x.sana?.startsWith(prefix))[0]||{}).kategoriya)?.c||"#F5B731"):"#4B5563",sana};
    });
  },[src,selectedOpt,period,type]);

  const lineMax=Math.max(...lineData.map(d=>d.sum),1);
  const lineTotal=lineData.reduce((s,d)=>s+d.sum,0);
  const activePts=lineData.filter(d=>d.sum>0);
  const lineAvg=activePts.length?Math.round(lineTotal/activePts.length):0;

  // ── Swipe ──────────────────────────────────────────────────
  const maxSlide = scope==="family" ? 3 : 2;
  const onTS=e=>{touchX.current=e.touches[0].clientX;};
  const onTE=e=>{
    if(touchX.current===null)return;
    const dx=e.changedTouches[0].clientX-touchX.current;
    if(dx<-40)setSlide(s=>Math.min(s+1,maxSlide));
    if(dx>40) setSlide(s=>Math.max(s-1,0));
    touchX.current=null;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* O'zimning / Oilamning */}
      <div style={{display:"flex",background:th.sur,borderRadius:14,padding:3,marginBottom:14,gap:3}}>
        {[["mine",lg==="uz"?"O'zimning":"Mine"],["family",lg==="uz"?"Oilamning":"Family"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setScope(k);setSlide(0);}} style={{
            flex:1,padding:"11px 0",border:"none",borderRadius:11,cursor:"pointer",
            fontWeight:800,fontSize:14,transition:"all .2s",
            background:scope===k?"linear-gradient(135deg,"+th.ac+","+th.ac2+")":"transparent",
            color:scope===k?"#fff":th.t2,
            boxShadow:scope===k?"0 3px 14px "+th.ac+"55":"none",
          }}>{l}</button>
        ))}
      </div>

      {/* Xarajat / Daromad */}
      <div style={{display:"flex",background:th.sur,borderRadius:12,padding:3,marginBottom:14,gap:3}}>
        {[["xarajat",lg==="uz"?"💸 Xarajat":"💸 Expenses"],["daromad",lg==="uz"?"💰 Daromad":"💰 Income"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setType(k);setSlide(0);setHov(null);}} style={{
            flex:1,padding:"9px 0",border:"none",borderRadius:9,cursor:"pointer",
            fontWeight:700,fontSize:13,transition:"all .2s",
            background:type===k
              ?(k==="xarajat"
                ?"linear-gradient(135deg,"+th.rd+"cc,"+th.rd+"88)"
                :"linear-gradient(135deg,"+th.gr+"cc,"+th.gr+"88)")
              :"transparent",
            color:type===k?"#fff":th.t2,
            boxShadow:type===k?"0 2px 10px "+(k==="xarajat"?th.rd:th.gr)+"44":"none",
          }}>{l}</button>
        ))}
      </div>

      {/* Hafta / Oy / Yil */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginBottom:2,
        background:th.sur,borderRadius:12,padding:3}}>
        {[["hafta",lg==="uz"?"Hafta":"Week"],["oy",lg==="uz"?"Oy":"Month"],["yil",lg==="uz"?"Yil":"Year"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} style={{
            padding:"10px 0",borderRadius:9,border:"none",cursor:"pointer",
            fontWeight:800,fontSize:14,transition:"all .2s",
            background:period===k?th.elev:"transparent",
            color:period===k?th.t1:th.t3,
            boxShadow:period===k?"0 1px 6px rgba(0,0,0,.3)":"none",
          }}>{l}</button>
        ))}
      </div>

      {/* Davr scroll */}
      <div ref={scrollRef} style={{display:"flex",overflowX:"auto",paddingBottom:2,
        marginBottom:12,gap:0,scrollbarWidth:"none",borderBottom:"1px solid "+th.bor}}>
        {opts.map((opt,i)=>(
          <button key={opt.key} onClick={()=>setSelIdx(i)} style={{
            flexShrink:0,padding:"8px 16px 10px",border:"none",background:"transparent",
            cursor:"pointer",textAlign:"center",transition:"all .2s",
            color:selIdx===i?th.t1:th.t3,
            fontWeight:selIdx===i?800:400,fontSize:14,
            borderBottom:selIdx===i?"2.5px solid "+th.ac:"2.5px solid transparent",
          }}>
            {opt.label}
            {opt.sub&&<div style={{fontSize:10,color:selIdx===i?th.ac:th.t3,fontWeight:400,marginTop:1}}>{opt.sub}</div>}
          </button>
        ))}
      </div>

      {/* ── Swipeable slides ── */}
      <div onTouchStart={onTS} onTouchEnd={onTE}
        style={{background:th.sur,borderRadius:20,border:"1px solid "+th.bor,overflow:"hidden",marginBottom:14}}>

        {/* SLIDE 0: Donut + sanalar */}
        {slide===0&&(
          <div style={{padding:"22px 16px",display:"flex",gap:16,alignItems:"center",minHeight:220}}>
            <div style={{flexShrink:0,position:"relative",width:160,height:160}}>
              <Donut data={catData} total={totalAmt} size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null&&catData[hov] ? (
                  <><div style={{fontSize:22}}>{catData[hov].icon}</div>
                    <div style={{fontSize:12,fontWeight:900,color:catData[hov].color}}>
                      {totalAmt>0?(catData[hov].sum/totalAmt*100).toFixed(1):0}%
                    </div></>
                ) : (
                  <div style={{fontSize:14,fontWeight:900,color:th.t1,textAlign:"center",lineHeight:1.3}}>
                    {totalAmt>0?fmtM(totalAmt):"—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
              {dateData.length===0
                ? <div style={{fontSize:12,color:th.t3,lineHeight:1.6}}>
                    {lg==="uz"?"Bu davrda\nma'lumot yo'q":"No data\nfor this period"}
                  </div>
                : dateData.map((d,i)=>{
                    const col=catData[i%Math.max(catData.length,1)]?.color||th.ac;
                    return (
                      <div key={d.sana} style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+col,
                          background:col+"22",flexShrink:0}}/>
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
        {slide===1&&(
          <div style={{padding:"22px 16px",display:"flex",gap:16,alignItems:"center",minHeight:220}}>
            <div style={{flexShrink:0,position:"relative",width:160,height:160}}>
              <Donut data={catData} total={totalAmt} size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null&&catData[hov] ? (
                  <><div style={{fontSize:22}}>{catData[hov].icon}</div>
                    <div style={{fontSize:12,fontWeight:900,color:catData[hov].color}}>
                      {totalAmt>0?(catData[hov].sum/totalAmt*100).toFixed(2):0}%
                    </div></>
                ) : (
                  <div style={{fontSize:14,fontWeight:900,color:th.t1,textAlign:"center"}}>
                    {totalAmt>0?fmtM(totalAmt):"—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:9}}>
              {catData.length===0
                ? <div style={{fontSize:12,color:th.t3}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                : <>
                    {catData.slice(0,5).map((cat,i)=>(
                      <div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                        onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                        onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                        <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+cat.color,
                          background:cat.color+"25",flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {cat.name}
                        </span>
                        <span style={{fontSize:12,fontWeight:800,color:cat.color,flexShrink:0}}>
                          {totalAmt>0?(cat.sum/totalAmt*100).toFixed(2):0}%
                        </span>
                      </div>
                    ))}
                    {catData.length>5&&(
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+th.t3,
                          background:th.t3+"25",flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:th.t2,fontWeight:600}}>
                          {lg==="uz"?"Boshqa":"Other"}
                        </span>
                        <span style={{fontSize:12,fontWeight:800,color:th.t3,flexShrink:0}}>
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
        {slide===2&&(
          <div style={{padding:"16px 12px 8px"}}>
            <div style={{display:"flex",gap:20,marginBottom:10}}>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"Jami:":"Total:"} <b style={{color:th.t1}}>{totalAmt.toLocaleString("uz-UZ")}</b>
              </div>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"O'rtacha:":"Avg:"} <b style={{color:th.t1}}>{lineAvg.toLocaleString("uz-UZ")}</b>
              </div>
            </div>
            <LineSVG pts={lineData} lineMax={lineMax} th={th} f={f}/>
          </div>
        )}

        {/* SLIDE 3 (family only): A'zolar ulushi */}
        {slide===3&&scope==="family"&&(
          <div style={{padding:"22px 16px",display:"flex",gap:16,alignItems:"center",minHeight:220}}>
            <div style={{flexShrink:0,position:"relative",width:160,height:160}}>
              <Donut data={memberDataColored} total={memberDataColored.reduce((s,m)=>s+m.sum,0)}
                size={160} hov={hov} setHov={setHov} th={th}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!==null&&memberDataColored[hov] ? (
                  <><div style={{fontSize:11,fontWeight:900,color:memberDataColored[hov].color,textAlign:"center"}}>
                      {memberDataColored[hov].ism?.split(" ")[0]}
                    </div>
                    <div style={{fontSize:12,fontWeight:800,color:memberDataColored[hov].color}}>
                      {memberDataColored.reduce((s,m)=>s+m.sum,0)>0
                        ?(memberDataColored[hov].sum/memberDataColored.reduce((s,m)=>s+m.sum,0)*100).toFixed(1):0}%
                    </div></>
                ) : (
                  <div style={{fontSize:13,fontWeight:900,color:th.t1,textAlign:"center"}}>
                    {lg==="uz"?"Oila\nulushi":"Family\nshare"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:9}}>
              {memberDataColored.length===0
                ? <div style={{fontSize:12,color:th.t3}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                : memberDataColored.map((m,i)=>{
                    const mTotal=memberDataColored.reduce((s,x)=>s+x.sum,0);
                    return (
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                        onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                        onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                        <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+m.color,
                          background:m.color+"25",flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:th.t1,fontWeight:600,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {m.ism}
                        </span>
                        <span style={{fontSize:12,fontWeight:800,color:m.color,flexShrink:0}}>
                          {mTotal>0?(m.sum/mTotal*100).toFixed(1):0}%
                        </span>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* Slide dots */}
        <div style={{display:"flex",justifyContent:"center",gap:10,padding:"12px 0 16px"}}>
          {Array.from({length:maxSlide+1},(_,i)=>(
            <div key={i} onClick={()=>setSlide(i)} style={{
              width:slide===i?22:8,height:8,borderRadius:4,
              background:slide===i?th.ac:th.t3+"44",
              transition:"all .3s",cursor:"pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Kategoriya ro'yxati ── */}
      {catData.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {catData.map((cat,i)=>{
            const pct=totalAmt>0?cat.sum/totalAmt*100:0;
            return (
              <div key={cat.id}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:7}}>
                  <div style={{width:44,height:44,borderRadius:14,background:cat.color+"22",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,
                    border:"1px solid "+cat.color+"44"}}>
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
                    height:"100%",width:pct+"%",
                    background:"linear-gradient(90deg,"+cat.color+"55,"+cat.color+"ee)",
                    borderRadius:3,
                    transition:"width "+(0.5+i*0.07)+"s cubic-bezier(0.34,1.56,0.64,1)",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {catData.length===0&&totalAmt===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",color:th.t2}}>
          <div style={{fontSize:44,marginBottom:12}}>{type==="xarajat"?"📊":"💹"}</div>
          <div style={{fontSize:15,fontWeight:700,color:th.t1,marginBottom:6}}>
            {lg==="uz"?"Ma'lumot yo'q":"No data"}
          </div>
          <div style={{fontSize:13,color:th.t3}}>
            {lg==="uz"
              ?`Bu davr uchun ${type==="xarajat"?"xarajat":"daromad"} kiritilmagan`
              :`No ${type==="xarajat"?"expenses":"income"} for this period`}
          </div>
        </div>
      )}
    </div>
  );
}
