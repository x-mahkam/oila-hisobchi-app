import { useState, useEffect, useRef, useMemo } from "react";
import { KATS, KN, DARS, DN } from "../utils/constants.js";

// ── Konstantalar ───────────────────────────────────────────────
const KAT_EMOJI = { oziq:"🛒", transport:"🚗", kiyim:"👕", sog:"💊",
  kommunal:"🏠", konil:"🎬", talim:"📚", hadya:"🎁", qarz:"💸", boshqa:"💳" };
const DAR_EMOJI = { oylik:"💼", qoshimcha:"⚡", biznes:"🏢", sovga:"🎁", boshqa:"💰" };
const M_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const M_SH  = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
const DAYS  = ["Du","Se","Ch","Pa","Ju","Sh","Ya"]; // Dushanba=0 ... Yakshanba=6
const COLORS = ["#7C6FF7","#F5B731","#22C55E","#EF4444","#06B6D4","#F97316","#EC4899"];
const SLIDE_H = 250; // barcha slide'lar bir xil balandlik

// ── Yordamchi funksiyalar ──────────────────────────────────────
function getWeekNum(d) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

// ISO hafta: Dushanbadan boshlanadi
function getMondayOfISOWeek(year, week) {
  // Jan 4 is always in week 1 of ISO year
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7; // 1=Mon...7=Sun
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7);
  return monday;
}

function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const jan1 = new Date(date.getFullYear(), 0, 1);
  return Math.round(((date - jan1) / 86400000 - 3 + (jan1.getDay() + 6) % 7) / 7) + 1;
}

// Mahalliy sana (toISOString UTC ga o'girib yuboradi — Toshkentda xato)
function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtBig(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1)+" mlrd";
  if (n >= 1e6) return (n/1e6).toFixed(1)+" mln";
  if (n >= 1e3) return Math.round(n/1e3)+"K";
  return n > 0 ? n.toLocaleString() : "—";
}

// ── Donut SVG ──────────────────────────────────────────────────
function Donut({ data, total, size=150, hov, setHov, bgColor }) {
  const cx=size/2, cy=size/2, R=size*.37, ri=size*.25, gap=.025;
  if (!data.length || !total) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke="#1e293b" strokeWidth={R-ri} opacity={.4}/>
      <circle cx={cx} cy={cy} r={ri-3} fill={bgColor||"#111827"}/>
      <text x={cx} y={cy+5} textAnchor="middle" fill="#f1f5f9" fontSize={13} fontWeight={700}>—</text>
    </svg>
  );
  let cur = -Math.PI/2;
  const segs = data.slice(0,7).map((cat,i) => {
    const ang = Math.max((cat.sum/total)*2*Math.PI - gap, .01);
    const sa=cur+gap/2, ea=cur+gap/2+ang; cur += ang+gap;
    const lg2=ang>Math.PI?1:0;
    return { ...cat, i, midA:sa+ang/2,
      d:[`M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
         `A ${R} ${R} 0 ${lg2} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
         `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
         `A ${ri} ${ri} 0 ${lg2} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
         "Z"].join(" ") };
  });
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke="#1e293b" strokeWidth={R-ri} opacity={.3}/>
      {segs.map((s,i)=>(
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
      <circle cx={cx} cy={cy} r={ri-3} fill={bgColor||"#111827"}/>
    </svg>
  );
}

// ── Line chart ─────────────────────────────────────────────────
function LineSVG({ pts, lineMax, f }) {
  const W=340, H=185, pL=68, pR=8, pT=18, pB=38;
  const iW=W-pL-pR, iH=H-pT-pB;
  // AXIS rang: DOIMO oq, tema rangi EMAS
  const AXIS = "#e2e8f0";
  const GRID  = "#334155";
  const ZERO  = "#475569";

  if (!pts.length || lineMax===0) return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <text x={W/2} y={H/2} textAnchor="middle" fill={AXIS} fontSize={13}>—</text>
    </svg>
  );
  const mp = pts.map((d,i)=>({
    x: pL+(i/Math.max(pts.length-1,1))*iW,
    y: pT+iH-(d.sum/lineMax)*iH, ...d
  }));
  const yTicks=[0,.25,.5,.75,1];
  const xStep=Math.max(1,Math.floor(pts.length/5));
  const xLbls=new Set([0]);
  for(let i=xStep;i<pts.length-1;i+=xStep) xLbls.add(i);
  xLbls.add(pts.length-1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {/* Y ticks */}
      {yTicks.map((pct,gi)=>{
        const gy=pT+iH*(1-pct);
        return (
          <g key={gi}>
            <line x1={pL-4} y1={gy} x2={W-pR} y2={gy}
              stroke={pct===0?ZERO:GRID} strokeWidth={pct===0?1:.6}
              strokeDasharray={pct>0?"3,6":""}/>
            {pct>0&&<text x={pL-8} y={gy+4} fontSize={10} fill={AXIS}
              textAnchor="end" fontWeight={600}>{f(Math.round(lineMax*pct),true)}</text>}
          </g>
        );
      })}
      {/* Segments */}
      {mp.map((pt,i)=>{
        if(i===0) return null;
        const prev=mp[i-1];
        const col=pt.sum>0?pt.color:(prev.sum>0?prev.color:GRID);
        return <line key={i} x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y}
          stroke={col} strokeWidth={2.5} strokeLinecap="round" opacity={.9}/>;
      })}
      {/* Dots */}
      {mp.map((pt,i)=>(
        <circle key={i} cx={pt.x} cy={pt.y} r={pt.sum>0?4.5:2.5}
          fill={pt.sum>0?pt.color:GRID} stroke="#111827" strokeWidth={1.5}/>
      ))}
      {/* X labels — DOIMO oq */}
      {mp.map((pt,i)=>xLbls.has(i)&&(
        <text key={i} x={pt.x} y={H-4} fontSize={10} fill={AXIS}
          textAnchor="middle" fontWeight={600}>{pt.label}</text>
      ))}
    </svg>
  );
}

// ── Toggle komponenti — Login sahifasidagidek ──────────────────
function Toggle({ options, value, onChange, th, color }) {
  return (
    <div style={{display:"flex", background:th.surH, borderRadius:12, padding:3,
      gap:3, border:`1.5px solid ${th.bor}`}}>
      {options.map(([k,l])=>{
        const active = value===k;
        const ac = color || th.ac;
        return (
          <button key={k} onClick={()=>onChange(k)} style={{
            flex:1, padding:"10px 0", borderRadius:9, cursor:"pointer",
            fontWeight:800, fontSize:14, transition:"all .22s",
            border:`1.5px solid ${active ? ac : (th.dark?"#4B5563":th.bor)}`,
            background: active ? ac+"28" : (th.dark?"#374151":"transparent"),
            color: active ? ac : (th.dark?"#D1D5DB":th.t2),
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// ── Asosiy komponent ───────────────────────────────────────────
export default function ChartsPage({ bX, bD, xar, dar, th, lg, f, azolar, user, canSeeReport }) {
  const now=new Date(), Y=now.getFullYear(), M=now.getMonth(), W=getISOWeek(now);

  const [scope,  setScope]  = useState("mine");
  const [type,   setType]   = useState("xarajat");
  const [period, setPeriod] = useState("oy");
  const [selIdx, setSelIdx] = useState(0);
  const [slide,  setSlide]  = useState(0);
  const [hov,    setHov]    = useState(null);
  const scrollRef = useRef(null);
  const tx = useRef(null);

  // ── Davr variantlari ───────────────────────────────────────
  const opts = useMemo(()=>{
    if (period==="hafta") {
      const cnt=Math.min(W,10);
      return Array.from({length:cnt},(_,i)=>{
        const w=W-(cnt-1-i);
        const monday=getMondayOfISOWeek(Y,w);
        const sunday=new Date(monday.getTime()+6*86400000);
        const label=w===W?(lg==="uz"?"Bu hafta":"This week")
          :w===W-1?(lg==="uz"?"O\'tgan hafta":"Last week"):`${w}-hafta`;
        const sub=`${monday.getDate()} ${M_SH[monday.getMonth()]} - ${sunday.getDate()} ${M_SH[sunday.getMonth()]}`;
        return {key:`${Y}-W${w}`,label,sub,monday};
      });
    }
    if (period==="oy") {
      return Array.from({length:M+1},(_,i)=>({
        key:`${Y}-${String(i+1).padStart(2,"0")}`,
        label:M_UZ[i], sub:String(Y)
      }));
    }
    const arr=[];
    for(let y=Y-3;y<Y-1;y++) arr.push({key:String(y),label:String(y),sub:""});
    arr.push({key:`${Y-1}-last`,label:lg==="uz"?"O\'tgan yil":"Last year",sub:String(Y-1)});
    arr.push({key:`${Y}-this`, label:lg==="uz"?"Bu yil":"This year",  sub:String(Y)});
    return arr;
  },[period,lg,W,M,Y]);

  useEffect(()=>{
    setSelIdx(opts.length-1); setSlide(0); setHov(null);
    setTimeout(()=>{if(scrollRef.current) scrollRef.current.scrollLeft=9999;},60);
  },[period,opts.length]);

  const selOpt=opts[Math.min(selIdx,opts.length-1)]||opts[opts.length-1];

  // ── Ma'lumot manbalari ─────────────────────────────────────
  // To'liq tarix: xar/dar (bX/bD faqat joriy oy — yil va o'tgan haftalar uchun yetmaydi)
  const allX=(xar&&xar.length?xar:bX)||[];
  const allD=(dar&&dar.length?dar:bD)||[];

  // Scope filtri: #5 muammo — ruxsatsiz a'zolar faqat o'z ma'lumotini ko'radi
  const srcX=useMemo(()=>scope==="mine"||!canSeeReport
    ? allX.filter(x=>x.uid===user?.id||!x.uid)
    : allX
  ,[allX,scope,canSeeReport,user]);

  const srcD=useMemo(()=>scope==="mine"||!canSeeReport
    ? allD.filter(d=>d.uid===user?.id||!d.uid)
    : allD
  ,[allD,scope,canSeeReport,user]);

  // ── Davr bo'yicha filtrlash ────────────────────────────────
  const byPeriod=useMemo(()=>(arr)=>{
    const key=selOpt?.key||"";
    return arr.filter(item=>{
      if(!item.sana) return false;
      if(period==="oy")    return item.sana.startsWith(key);
      if(period==="hafta") {
        const d=new Date(item.sana);
        return `${d.getFullYear()}-W${getISOWeek(d)}`===key;
      }
      return item.sana.startsWith(key.replace(/-this|-last/,""));
    });
  },[selOpt,period]);

  const filtX=useMemo(()=>byPeriod(srcX),[byPeriod,srcX]);
  const filtD=useMemo(()=>byPeriod(srcD),[byPeriod,srcD]);
  const curr =type==="xarajat"?filtX:filtD;
  const total=curr.reduce((s,i)=>s+Number(i.summa||0),0);

  // ── Kategoriyalar ──────────────────────────────────────────
  const cats=useMemo(()=>{
    if(type==="xarajat") return KATS.map((k,i)=>({
      id:k.id,name:KN[lg]?.[i]||k.id,color:k.c,icon:KAT_EMOJI[k.id]||"💳",
      sum:filtX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
    return DARS.map((d,i)=>({
      id:d.id,name:DN[lg]?.[i]||d.id,color:d.c,icon:DAR_EMOJI[d.id]||"💰",
      sum:filtD.filter(x=>x.tur===d.id).reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum);
  },[filtX,filtD,type,lg]);

  // ── A'zolar ulushi (slide 3) ───────────────────────────────
  const members=useMemo(()=>{
    if(scope!=="family"||!canSeeReport||!azolar?.length) return [];
    return azolar.map((a,i)=>({
      ...a, color:COLORS[i%COLORS.length],
      sum:(type==="xarajat"
        ?byPeriod(allX.filter(x=>x.uid===a.id||(!x.uid&&a.id===user?.id)))
        :byPeriod(allD.filter(d=>d.uid===a.id||(!d.uid&&a.id===user?.id))))
        .reduce((s,x)=>s+Number(x.summa||0),0)
    })).filter(m=>m.sum>0).sort((a,b)=>b.sum-a.sum);
  },[allX,allD,azolar,byPeriod,type,scope,canSeeReport,user]);
  const memTotal=members.reduce((s,m)=>s+m.sum,0);

  // ── Slide 0: sanalar ──────────────────────────────────────
  const datePts=useMemo(()=>{
    const map={};
    curr.forEach(x=>{if(x.sana) map[x.sana]=(map[x.sana]||0)+Number(x.summa||0);});
    return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5)
      .map(([sana,sum])=>{
        const d=new Date(sana);
        const label=period==="yil"?`${M_SH[d.getMonth()]} ${d.getFullYear()}`
          :`${M_SH[d.getMonth()]} ${d.getDate()}`;
        return {sana,sum,label,color:cats[0]?.color||th.ac};
      });
  },[curr,cats,period,th]);

  // ── Slide 2: line chart ────────────────────────────────────
  const lineData=useMemo(()=>{
    const key=selOpt?.key||"";
    const getCol=(sana)=>{
      const items=curr.filter(x=>x.sana===sana);
      if(!items.length) return "#334155";
      const top=items.reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx,items[0]);
      return type==="xarajat"
        ? KATS.find(k=>k.id===top.kategoriya)?.c||th.ac
        : DARS.find(d=>d.id===top.tur)?.c||th.gr;
    };
    if(period==="oy"){
      const[y,m]=key.split("-").map(Number);
      const days=new Date(y,m,0).getDate();
      return Array.from({length:days},(_,i)=>{
        const sana=`${y}-${String(m).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`;
        return{label:String(i+1),sum:curr.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0),color:getCol(sana)};
      });
    }
    if(period==="hafta"){
      // ISO Dushanbadan boshlanuvchi 7 kun
      const[yS,wS]=key.split("-W");
      const monday=getMondayOfISOWeek(parseInt(yS),parseInt(wS));
      return Array.from({length:7},(_,i)=>{
        const d=new Date(monday.getTime()+i*86400000);
        const sana=fmtLocalDate(d);
        // label: "Du 23 Iyn"
        const label=`${DAYS[i]} ${d.getDate()} ${M_SH[d.getMonth()]}`;
        return{label,sum:curr.filter(x=>x.sana===sana).reduce((s,x)=>s+Number(x.summa||0),0),color:getCol(sana)};
      });
    }
    const y=parseInt(key.replace(/-this|-last/,""));
    return M_SH.map((mn,i)=>{
      const prefix=`${y}-${String(i+1).padStart(2,"0")}`;
      const items=curr.filter(x=>x.sana?.startsWith(prefix));
      const sum=items.reduce((s,x)=>s+Number(x.summa||0),0);
      const top=items.reduce((mx,x)=>Number(x.summa||0)>Number(mx.summa||0)?x:mx,{summa:0});
      const col=sum>0?(type==="xarajat"?KATS.find(k=>k.id===top.kategoriya)?.c||th.ac:DARS.find(d=>d.id===top.tur)?.c||th.gr):"#334155";
      return{label:`${mn} ${y}`,sum,color:col};
    });
  },[curr,selOpt,period,type,th]);

  const lineMax=Math.max(...lineData.map(d=>d.sum),1);
  const activePts=lineData.filter(d=>d.sum>0);
  const lineAvg=activePts.length?Math.round(activePts.reduce((s,d)=>s+d.sum,0)/activePts.length):0;

  // ── Swipe ──────────────────────────────────────────────────
  const maxSlide=(scope==="family"&&canSeeReport)?3:2;
  const onTS=e=>{tx.current=e.touches[0].clientX;};
  const onTE=e=>{
    if(tx.current==null)return;
    const dx=e.changedTouches[0].clientX-tx.current;
    if(dx<-40)setSlide(s=>Math.min(s+1,maxSlide));
    if(dx>40) setSlide(s=>Math.max(s-1,0));
    tx.current=null;
  };

  // Slide content wrapper — FIXED height, always same
  const slideWrap={height:SLIDE_H,display:"flex",alignItems:"center",padding:"0 16px",gap:14};

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* ── O'zimning / Oilamning ── */}
      <Toggle
        options={[["mine",lg==="uz"?"O'zimning":"Mine"],["family",lg==="uz"?"Oilamning":"Family"]]}
        value={scope} onChange={k=>{setScope(k);setSlide(0);setHov(null);}} th={th}
      />
      <div style={{height:10}}/>

      {/* ── Xarajat / Daromad ── */}
      <div style={{display:"flex",background:th.surH,borderRadius:12,padding:3,gap:3,
        marginBottom:10,border:`1.5px solid ${th.bor}`}}>
        {[["xarajat","💸 "+(lg==="uz"?"Xarajat":"Expenses")],
          ["daromad","💰 "+(lg==="uz"?"Daromad":"Income")]].map(([k,l])=>{
          const active=type===k;
          const ac=k==="xarajat"?th.rd:th.gr;
          return(
            <button key={k} onClick={()=>{setType(k);setSlide(0);setHov(null);}} style={{
              flex:1,padding:"9px 0",borderRadius:9,cursor:"pointer",
              fontWeight:700,fontSize:13,transition:"all .22s",
              border:`1.5px solid ${active?ac:(th.dark?"#4B5563":th.bor)}`,
              background:active?ac+"28":(th.dark?"#374151":"transparent"),
              color:active?ac:(th.dark?"#D1D5DB":th.t2),
            }}>{l}</button>
          );
        })}
      </div>

      {/* ── Hafta / Oy / Yil ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:th.surH,
        borderRadius:12,padding:3,gap:3,border:`1.5px solid ${th.bor}`,marginBottom:0}}>
        {[["hafta",lg==="uz"?"Hafta":"Week"],
          ["oy",   lg==="uz"?"Oy":"Month"],
          ["yil",  lg==="uz"?"Yil":"Year"]].map(([k,l])=>{
          const active=period===k;
          return(
            <button key={k} onClick={()=>setPeriod(k)} style={{
              padding:"10px 0",borderRadius:9,cursor:"pointer",
              fontWeight:800,fontSize:14,transition:"all .22s",
              border:`1.5px solid ${active?th.ac:(th.dark?"#4B5563":th.bor)}`,
              background:active?th.ac+"28":(th.dark?"#374151":"transparent"),
              color:active?th.ac:(th.dark?"#D1D5DB":th.t2),
            }}>{l}</button>
          );
        })}
      </div>

      {/* ── Davr scroll ── */}
      <div ref={scrollRef} style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",
        borderBottom:`1.5px solid ${th.bor}`,marginBottom:12}}>
        {opts.map((opt,i)=>(
          <button key={opt.key} onClick={()=>setSelIdx(i)} style={{
            flexShrink:0,padding:"8px 16px 10px",border:"none",background:"transparent",
            cursor:"pointer",textAlign:"center",transition:"all .2s",
            color:selIdx===i?th.t1:th.t2,
            fontWeight:selIdx===i?800:400,fontSize:14,
            borderBottom:selIdx===i?`2.5px solid ${th.ac}`:"2.5px solid transparent",
          }}>
            {opt.label}
            {opt.sub&&<div style={{fontSize:10,color:selIdx===i?th.ac:th.t2,marginTop:1}}>{opt.sub}</div>}
          </button>
        ))}
      </div>

      {/* ── Swipeable slides ── */}
      <div onTouchStart={onTS} onTouchEnd={onTE}
        style={{background:th.sur,borderRadius:20,border:`1.5px solid ${th.bor}`,
          overflow:"hidden",marginBottom:14}}>

        {/* SLIDE 0: Donut + sanalar */}
        {slide===0&&(
          <div style={slideWrap}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={cats} total={total} size={150} hov={hov} setHov={setHov} bgColor={th.sur}/>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&cats[hov]?(
                  <><div style={{fontSize:20}}>{cats[hov].icon}</div>
                    <div style={{fontSize:11,fontWeight:900,color:cats[hov].color}}>
                      {total>0?(cats[hov].sum/total*100).toFixed(1):0}%
                    </div></>
                ):(
                  <div style={{fontSize:14,fontWeight:900,color:"#f1f5f9",textAlign:"center"}}>
                    {total>0?fmtBig(total):"—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              {datePts.length===0
                ?<div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                :datePts.map((d,i)=>{
                  const col=cats[i%Math.max(cats.length,1)]?.color||th.ac;
                  return(
                    <div key={d.sana} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:18,height:18,borderRadius:"50%",
                        border:`2px solid ${col}`,background:col+"22",flexShrink:0}}/>
                      <div style={{flex:1,fontSize:12,color:th.t2}}>{d.label}</div>
                      <div style={{fontSize:12,fontWeight:800,color:"#f1f5f9"}}>
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
          <div style={slideWrap}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={cats} total={total} size={150} hov={hov} setHov={setHov} bgColor={th.sur}/>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&cats[hov]?(
                  <><div style={{fontSize:20}}>{cats[hov].icon}</div>
                    <div style={{fontSize:11,fontWeight:900,color:cats[hov].color}}>
                      {total>0?(cats[hov].sum/total*100).toFixed(2):0}%
                    </div></>
                ):(
                  <div style={{fontSize:14,fontWeight:900,color:"#f1f5f9",textAlign:"center"}}>
                    {total>0?fmtBig(total):"—"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
              {cats.length===0
                ?<div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                :<>
                  {cats.slice(0,5).map((cat,i)=>(
                    <div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                      onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                      onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                      <div style={{width:16,height:16,borderRadius:"50%",
                        border:`2px solid ${cat.color}`,background:cat.color+"22",flexShrink:0}}/>
                      <span style={{flex:1,fontSize:12,color:"#f1f5f9",fontWeight:600,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat.name}</span>
                      <span style={{fontSize:12,fontWeight:800,color:cat.color,flexShrink:0}}>
                        {total>0?(cat.sum/total*100).toFixed(2):0}%
                      </span>
                    </div>
                  ))}
                  {cats.length>5&&(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:16,height:16,borderRadius:"50%",
                        border:`2px solid ${th.t2}`,background:th.t2+"22",flexShrink:0}}/>
                      <span style={{flex:1,fontSize:12,color:"#f1f5f9",fontWeight:600}}>
                        {lg==="uz"?"Boshqa":"Other"}
                      </span>
                      <span style={{fontSize:12,fontWeight:800,color:th.t2,flexShrink:0}}>
                        {total>0?(cats.slice(5).reduce((s,c)=>s+c.sum,0)/total*100).toFixed(2):0}%
                      </span>
                    </div>
                  )}
                </>
              }
            </div>
          </div>
        )}

        {/* SLIDE 2: Line chart — SAME HEIGHT */}
        {slide===2&&(
          <div style={{height:SLIDE_H,padding:"14px 10px 6px",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",gap:20,marginBottom:8,paddingLeft:4}}>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"Jami:":"Total:"}{" "}
                <b style={{color:"#f1f5f9",fontSize:13}}>{total.toLocaleString("uz-UZ")}</b>
              </div>
              <div style={{fontSize:12,color:th.t2}}>
                {lg==="uz"?"O'rtacha:":"Avg:"}{" "}
                <b style={{color:"#f1f5f9",fontSize:13}}>{lineAvg.toLocaleString("uz-UZ")}</b>
              </div>
            </div>
            <div style={{flex:1,display:"flex",alignItems:"center"}}>
              <div style={{width:"100%"}}>
                <LineSVG pts={lineData} lineMax={lineMax} f={f}/>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Oila a'zolari ulushi — Oilamning tanlanganda */}
        {slide===3&&scope==="family"&&canSeeReport&&(
          <div style={slideWrap}>
            <div style={{flexShrink:0,position:"relative",width:150,height:150}}>
              <Donut data={members} total={memTotal} size={150} hov={hov} setHov={setHov} bgColor={th.sur}/>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                {hov!=null&&members[hov]?(
                  <><div style={{fontSize:10,fontWeight:800,color:members[hov].color,
                      textAlign:"center",maxWidth:55,overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap",lineHeight:1.3}}>
                      {members[hov].ism?.split(" ")[0]}
                    </div>
                    <div style={{fontSize:12,fontWeight:900,color:members[hov].color}}>
                      {memTotal>0?(members[hov].sum/memTotal*100).toFixed(1):0}%
                    </div></>
                ):(
                  <div style={{fontSize:11,fontWeight:800,color:"#f1f5f9",textAlign:"center",lineHeight:1.4}}>
                    {lg==="uz"?"Oila\nulushi":"Family\nshare"}
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              {members.length===0
                ?<div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ma'lumot yo'q":"No data"}</div>
                :members.map((m,i)=>(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
                    onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
                    onTouchStart={()=>setHov(i)} onTouchEnd={()=>setHov(null)}>
                    <div style={{width:18,height:18,borderRadius:"50%",
                      border:`2px solid ${m.color}`,background:m.color+"22",flexShrink:0}}/>
                    <span style={{flex:1,fontSize:12,color:"#f1f5f9",fontWeight:600,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.ism}</span>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:800,color:m.color}}>
                        {memTotal>0?(m.sum/memTotal*100).toFixed(1):0}%
                      </div>
                      <div style={{fontSize:10,color:th.t2}}>{m.sum.toLocaleString("uz-UZ")}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Slide dots */}
        <div style={{display:"flex",justifyContent:"center",gap:10,padding:"10px 0 16px"}}>
          {Array.from({length:maxSlide+1},(_,i)=>(
            <div key={i} onClick={()=>setSlide(i)} style={{
              width:slide===i?22:8, height:8, borderRadius:4,
              background:slide===i?th.ac:th.t2+"44",
              transition:"all .3s", cursor:"pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Kategoriya ro'yxati ── */}
      {cats.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {cats.map((cat,i)=>{
            const pct=total>0?cat.sum/total*100:0;
            return(
              <div key={cat.id}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:7}}>
                  <div style={{width:44,height:44,borderRadius:13,background:cat.color+"22",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                    flexShrink:0,border:`1.5px solid ${cat.color}55`}}>
                    {cat.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{cat.name}</span>
                      <span style={{fontSize:12,color:th.t2}}>{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                  <span style={{fontSize:15,fontWeight:800,color:"#f1f5f9",flexShrink:0}}>
                    {cat.sum.toLocaleString("uz-UZ")}
                  </span>
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
          <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>
            {lg==="uz"?"Ma'lumot yo'q":"No data"}
          </div>
          <div style={{fontSize:13,color:th.t2}}>
            {lg==="uz"
              ?`Bu davr uchun ${type==="xarajat"?"xarajat":"daromad"} kiritilmagan`
              :`No ${type==="xarajat"?"expenses":"income"} for this period`}
          </div>
        </div>
      )}
    </div>
  );
}
