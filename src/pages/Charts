import {{ useState, useRef, useCallback, useMemo }} from "react";
import {{ KatIco, DarIco, MoneyInput, Av, Spark, Heat, BH }} from "../components/common/index.jsx";
import {{ Ico }} from "../utils/icons.jsx";
import {{ makeS }} from "../utils/styles.js";
import {{ KATS, KN, DARS, DN, VALS, COUNTRIES, GOAL_PRESETS, KID_GOAL_PRESETS, VAZIFA_PRESETS, QUICK_ADD }} from "../utils/constants.js";
import {{ f, td, nt, tm }} from "../utils/formatters.js";
import {{ LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid }} from "recharts";

export default function ChartsPage({
  // Data
  user, oila, azolar, xar, dar, maq, qarzlar, vazifalar,
  kidBalances, notifs, qarzReqs, xReqs, rates, stars,
  setXar, setDar, setMaq, setQarzlar, setVazifalar,
  setKidBalances, setNotifs,
  // State
  dark, lg, val, scr, setScr, isPremium, isKid, isBosh, hasKids, isAdmin,
  // Form states - barcha keraklilar
  ...props
}) {
  const th = useMemo(() => makeS.th || props.th, [dark]);
  const S = useMemo(() => makeS(th), [th]);
  const t = props.t;

  return (
    <div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:14,color:th.t1}}>{t.chart}</div>
        <div style={{display:"flex",gap:5,marginBottom:16,background:th.bg,borderRadius:13,padding:4}}>
          {[{id:"line",l:lg==="uz"?"Trend":"Trend"},{id:"bar",l:lg==="uz"?"Oylik":"Monthly"},{id:"pie",l:lg==="uz"?"Taqsimot":"Distribution"}].map(tb=>(
            <button key={tb.id} onClick={()=>setCtab(tb.id)} style={{flex:1,background:ctab===tb.id?th.sur:"transparent",border:ctab===tb.id?"1px solid "+th.bor:"1px solid transparent",borderRadius:10,padding:"8px 2px",color:ctab===tb.id?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:11}}>{tb.l}</button>
          ))}
        </div>
        {ctab==="line"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.l7}</div><ResponsiveContainer width="100%" height={200}><LineChart data={lineD} margin={{top:5,right:5,left:-25,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={th.bor}/><XAxis dataKey="k" tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[v+"K",""]}/><Line type="monotone" dataKey="x" stroke={th.rd} strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="d" stroke={th.gr} strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer><div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}><span style={{fontSize:11,color:th.rd,fontWeight:600}}>-- {t.exp}</span><span style={{fontSize:11,color:th.gr,fontWeight:600}}>-- {t.inc}</span></div></div>}
        {ctab==="bar"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.l6}</div><ResponsiveContainer width="100%" height={200}><BarChart data={barD} margin={{top:5,right:5,left:-25,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={th.bor}/><XAxis dataKey="o" tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[v+"K",""]}/><Bar dataKey="v" fill={th.ac} radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div>}
        {ctab==="pie"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.bc}</div>{pieD.length===0?<div style={{textAlign:"center",padding:30,color:th.t2}}>--</div>:<div><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieD} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>{pieD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[f(v),""]}/></PieChart></ResponsiveContainer><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{pieD.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,background:th.bg,borderRadius:10,padding:"7px 10px"}}><div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:th.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div><div style={{fontSize:10,color:th.t2}}>{jX>0?Math.round(d.value/jX*100):0}%</div></div></div>)}</div></div>}</div>}
        <div style={{...S.cd,marginTop:4}}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.hm}</div><Heat xar={xar} ac={th.ac}/></div>
        <div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:10}}>{t.st}</div>{[{l:t.ad,v:f(Math.round(jX/Math.max(1,new Date().getDate())),true)},{l:t.ir,v:jX>0?(jD/jX).toFixed(2)+"x":"--"},{l:t.bs,v:f(Math.max(0,bdj-jX),true)},{l:t.rc,v:(bX.length+bD.length)+" ta"}].map(item=><div key={item.l} style={{...S.row,padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{item.l}</span><span style={{fontSize:12,fontWeight:700,color:th.ac}}>{item.v}</span></div>)}</div>
      </div>}
      {scr==="qoshish"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button onClick={()=>setScr("qoshish")} style={S.tb(true)}>{t.exp}</button>
          <button onClick={()=>setScr("kirim")} style={S.tb(false)}>{t.inc}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <button onClick={startScanner} style={{position:"relative",background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px "+th.ac+"44"}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="12" y="2" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="2" y="12" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><path d="M12 12h2v2M16 12v6M12 16h2M18 16v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {lg==="uz"?"QR skaner":lg==="ru"?"QR скан":"QR scan"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
          </button>
          <button onClick={startVoice} style={{position:"relative",background:"linear-gradient(135deg,#8b5cf6,#6366f1)",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px #8b5cf644"}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="10" rx="3" stroke="#fff" strokeWidth="1.5"/><path d="M4 9a6 6 0 0012 0M10 15v3M7 18h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {lg==="uz"?"Ovoz bilan":lg==="ru"?"Голос":"Voice"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
          </button>
        </div>
        <button onClick={()=>{if(!isPremium){setShowPremModal(true);return;}setShowImport(true);setImportStep("upload");}} style={{position:"relative",width:"100%",background:"linear-gradient(135deg,#0ea5e9,#0284c7)",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16,boxShadow:"0 4px 14px #0ea5e944"}}>
          <span style={{fontSize:17}}>📄</span>{lg==="uz"?"Bank hisobotini import qilish (CSV)":lg==="ru"?"Импорт выписки (CSV)":"Import bank statement (CSV)"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
        </button>
        <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
        <MoneyInput style={{...S.ip,fontSize:28,fontWeight:800,textAlign:"center"}} value={fS} onChange={setFS} placeholder="0" autoFocus/>
        {!(xForMember&&xMode==="give")&&<><label style={S.lb}>{t.bud}</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
          {KATS.map((k,i)=>(
            <button key={k.id} onClick={()=>setFK(k.id)} style={{background:fK===k.id?k.c+"18":th.sur,border:"2px solid "+(fK===k.id?k.c:th.bor),borderRadius:12,padding:"9px 11px",color:fK===k.id?k.c:th.t2,cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:7}}>
              <KatIco id={k.id} c={fK===k.id?k.c:th.t2} s={18}/>{KN[lg][i]}
            </button>
          ))}
        </div></>}
        {xForMember&&xMode==="give"&&<div style={{background:"#f43f5e11",border:"1.5px solid #f43f5e44",borderRadius:12,padding:"11px 14px",marginBottom:13,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>🎁</span><div><div style={{fontSize:12,fontWeight:700,color:"#f43f5e"}}>{lg==="uz"?"Hadya":lg==="ru"?"Подарок":"Gift"}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"Bu xarajat 'Hadya' kategoriyasiga yoziladi":"Saved as 'Gift' category"}</div></div></div>}
        <label style={S.lb}>{lg==="uz"?"Izoh":"Note"}</label>
        <input style={S.ip} value={fIz} onChange={e=>setFIz(e.target.value)} placeholder={lg==="uz"?"Nima uchun?":"What for?"}/>
        <label style={S.lb}>{lg==="uz"?"Sana":"Date"}</label>
        <input type="date" style={S.ip} value={fSn} onChange={e=>setFSn(e.target.value)}/>
        {azolar.length>1&&<><label style={S.lb}>{lg==="uz"?"Kim uchun?":lg==="ru"?"Для кого?":"For whom?"}</label>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:12}}>
          <button onClick={()=>setXForMember("")} style={{flexShrink:0,background:!xForMember?th.ac+"18":th.surH,border:"1.5px solid "+(!xForMember?th.ac:th.bor),borderRadius:11,padding:"9px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:!xForMember?th.ac:th.t2,fontSize:12,fontWeight:600}}><Av src={user?.photo} name={user?.ism} size={22} ac={th.ac}/>{lg==="uz"?"O'zim":lg==="ru"?"Я":"Me"}</button>
          {azolar.filter(a=>a.id!==user.id).map(a=>(<button key={a.id} onClick={()=>setXForMember(a.id)} style={{flexShrink:0,background:xForMember===a.id?th.ac+"18":th.surH,border:"1.5px solid "+(xForMember===a.id?th.ac:th.bor),borderRadius:11,padding:"9px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:xForMember===a.id?th.ac:th.t2,fontSize:12,fontWeight:600}}><Av src={a.photo} name={a.ism} size={22} ac={th.ac}/>{a.ism.split(" ")[0]}</button>))}
        </div>
        {xForMember&&<>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button onClick={()=>setXMode("expense")} style={{flex:1,background:xMode==="expense"?th.ac+"18":th.surH,border:"1.5px solid "+(xMode==="expense"?th.ac:th.bor),borderRadius:11,padding:"10px",cursor:"pointer",color:xMode==="expense"?th.ac:th.t2,fontSize:12,fontWeight:700}}>{lg==="uz"?"Uning xarajati":lg==="ru"?"Его расход":"Their expense"}</button>
          <button onClick={()=>setXMode("give")} style={{flex:1,background:xMode==="give"?th.gr+"18":th.surH,border:"1.5px solid "+(xMode==="give"?th.gr:th.bor),borderRadius:11,padding:"10px",cursor:"pointer",color:xMode==="give"?th.gr:th.t2,fontSize:12,fontWeight:700}}>{lg==="uz"?"Pul berdim":lg==="ru"?"Дал деньги":"Gave money"}</button>
        </div>
        <div style={{background:(xMode==="give"?th.gr:th.am)+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:11,color:th.t2,display:"flex",alignItems:"center",gap:6}}><span>{xMode==="give"?"💰":"ℹ️"}</span>{xMode==="give"?(lg==="uz"?"Sizga xarajat, a'zoga daromad so'rovi yuboriladi. U tasdiqlasa daromadiga qo'shiladi.":"Your expense + their income request."):(lg==="uz"?"Bu xarajat tanlangan a'zoga so'rov sifatida yuboriladi.":"Sent as expense request to the member.")}</div></>}</>}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,background:th.sur,border:"1px solid "+th.bor,borderRadius:13,padding:"12px 14px"}}>
          <input type="checkbox" id="rep" checked={fRp} onChange={e=>setFRp(e.target.checked)} style={{width:18,height:18,cursor:"pointer",accentColor:th.ac}}/>
          <label htmlFor="rep" style={{fontSize:13,color:th.t1,cursor:"pointer"}}>{lg==="uz"?"Takroriy (oy sayin)":"Recurring (monthly)"}</label>
        </div>
        <button onClick={addX} style={S.bt(th.rd,"#dc2626")}>{Ico.check("#fff")}{xForMember?(lg==="uz"?" So'rov yuborish":" Send request"):(lg==="uz"?" Xarajatni saqlash":" Save expense")}</button>
      </div>}
      {scr==="kirim"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <button onClick={()=>setScr("qoshish")} style={S.tb(false)}>{t.exp}</button>
          <button onClick={()=>setScr("kirim")} style={S.tb(true)}>{t.inc}</button>
        </div>
        <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
        <MoneyInput style={{...S.ip,fontSize:28,fontWeight:800,textAlign:"center"}} value={fDS} onChange={setFDS} placeholder="0" autoFocus/>
        <label style={S.lb}>{lg==="uz"?"Daromad turi":"Income type"}</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
          {DARS.map((d,i)=>(
            <button key={d.id} onClick={()=>setFDT(d.id)} style={{background:fDT===d.id?d.c+"18":th.sur,border:"2px solid "+(fDT===d.id?d.c:th.bor),borderRadius:12,padding:"9px 11px",color:fDT===d.id?d.c:th.t2,cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:7}}>
              <DarIco id={d.id} c={fDT===d.id?d.c:th.t2} s={18}/>{DN[lg][i]}
            </button>
          ))}
        </div>
        <label style={S.lb}>{lg==="uz"?"Izoh":"Note"}</label>
        <input style={S.ip} value={fDI} onChange={e=>setFDI(e.target.value)} placeholder="..."/>
        <button onClick={addD} style={S.bt(th.gr,"#059669")}>{Ico.check("#fff")}{lg==="uz"?" Daromadni saqlash":" Save income"}</button>
  );
}
