import { useState, useRef, useCallback, useMemo } from "react";
import { KatIco, DarIco, MoneyInput, Av, Spark, Heat, BH } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, VALS, COUNTRIES, GOAL_PRESETS, KID_GOAL_PRESETS, VAZIFA_PRESETS, QUICK_ADD } from "../utils/constants.js";
import { f, td, nt, tm } from "../utils/formatters.js";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DebtsPage({
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
        <div style={{...S.row,marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:th.t1}}>{lg==="uz"?"Qarzlar":lg==="ru"?"Долги":"Debts"}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={refreshQarzReqs} style={{background:th.surH,border:"1px solid "+th.bor,borderRadius:10,padding:"7px 11px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.repeat(th.t2)}</button>
            <button onClick={()=>setShowAddQarz(v=>!v)} style={{background:th.ac,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,boxShadow:"0 4px 12px "+th.ac+"44"}}>{showAddQarz?"x":(lg==="uz"?"+ Qo'shish":"+ Add")}</button>
          </div>
        </div>
        {showAddQarz&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:13}}>{lg==="uz"?"Yangi qarz":"New debt"}</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>setQarzTur("olgan")} style={{...S.tb(qarzTur==="olgan"),flex:1}}>{lg==="uz"?"Oldim":"I borrowed"}</button>
            <button onClick={()=>setQarzTur("bergan")} style={{...S.tb(qarzTur==="bergan"),flex:1}}>{lg==="uz"?"Berdim":"I lent"}</button>
          </div>
          <div style={{background:qarzTur==="olgan"?th.rd+"11":th.gr+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:12,color:qarzTur==="olgan"?th.rd:th.gr,fontWeight:600}}>{qarzTur==="olgan"?(lg==="uz"?"Kimdir menga pul berdi — men qarzdorman":lg==="ru"?"Мне дали в долг — я должен":"Someone lent me money — I owe"):(lg==="uz"?"Men birovga pul berdim — ular qarzdor":lg==="ru"?"Я дал в долг — мне должны":"I lent money — they owe me")}</div>
          <label style={S.lb}>{lg==="uz"?"Ism (kim?)":"Person name"}</label>
          <input style={S.ip} value={qarzKim} onChange={e=>setQarzKim(e.target.value)} placeholder={lg==="uz"?"Masalan: Akbar aka":"e.g. John"}/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
          <MoneyInput style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center"}} value={qarzSum} onChange={setQarzSum} placeholder="0"/>
          <label style={S.lb}>{lg==="uz"?"Sana":"Date"}</label>
          <input type="date" style={S.ip} value={qarzSana} onChange={e=>setQarzSana(e.target.value)}/>
          <label style={S.lb}>{lg==="uz"?"Qaytarish sanasi":"Return date"}</label>
          <input type="date" style={S.ip} value={qarzQaytSana} onChange={e=>setQarzQaytSana(e.target.value)}/>
          <label style={S.lb}>{lg==="uz"?"Izoh (ixtiyoriy)":"Note (optional)"}</label>
          <input style={S.ip} value={qarzIzoh} onChange={e=>setQarzIzoh(e.target.value)} placeholder="..."/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:qarzLinked?12:14,background:th.surH,border:"1px solid "+th.bor,borderRadius:13,padding:"12px 14px"}}>
            <div onClick={()=>setQarzLinked(v=>!v)} style={{width:46,height:26,borderRadius:13,background:qarzLinked?th.ac:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:qarzLinked?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:th.t1,fontWeight:600}}>{lg==="uz"?"Telefon orqali bog'lash":"Link by phone"}</div>
              <div style={{fontSize:10,color:th.t2,marginTop:1}}>{lg==="uz"?"Tasdiqlash so'rovi yuboriladi":"Sends confirmation"}</div>
            </div>
          </div>
          {qarzLinked&&<><label style={S.lb}>{lg==="uz"?"Qarzdor telefon raqami":"Person's phone"}</label>
          <input style={S.ip} type="tel" value={qarzTel} onChange={e=>setQarzTel(e.target.value)} placeholder="+998 90 123 45 67"/>
          <div style={{background:th.ac+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:11,color:th.t2}}>{lg==="uz"?"Bu raqam bilan ro'yxatdan o'tgan foydalanuvchiga so'rov boradi.":"A request is sent to the registered user."}</div></>}
          <button onClick={qarzLinked?sendQarzRequest:addQarz} style={S.bt()}>{qarzLinked?(lg==="uz"?"So'rov yuborish":"Send request"):(lg==="uz"?"Saqlash":"Save")}</button>
        </div>}
        {qarzReqs.length>0&&<div style={{...S.cd,border:"1.5px solid "+th.am+"55",marginBottom:14,background:th.am+"0a"}}>
          <div style={{fontSize:13,fontWeight:700,color:th.am,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" fill={th.am} opacity=".2" stroke={th.am} strokeWidth="1.3"/></svg>
            {lg==="uz"?"Yangi qarz so'rovlari":"New requests"} ({qarzReqs.length})
          </div>
          {qarzReqs.map(req=>{
            const isPay=req.type==="payment";
            const theyLent=req.tur==="bergan";
            return <div key={req.id} style={{background:th.sur,borderRadius:13,padding:"13px 15px",marginBottom:10,border:"1px solid "+(isPay?th.gr+"44":th.bor)}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:12,background:(isPay?th.gr:th.ac)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{isPay?"✅":"👤"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:th.t1}}>{req.fromIsm}</div><div style={{fontSize:11,color:th.t2}}>{req.fromTel}</div></div>
                <div style={{fontSize:16,fontWeight:800,color:isPay?th.gr:(theyLent?th.rd:th.gr)}}>{f(req.summa,true)}</div>
              </div>
              <div style={{background:th.bg,borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:th.t1}}>
                {isPay?<span style={{fontWeight:600,color:th.gr}}>{lg==="uz"?req.fromIsm+" qarzni qaytardim deyapti. Tasdiqlaysizmi?":req.fromIsm+" says the debt is returned. Confirm?"}</span>:(theyLent?(lg==="uz"?req.fromIsm+" sizga "+f(req.summa,true)+" qarz berdi":"They lent you money"):(lg==="uz"?"Siz "+req.fromIsm+" dan "+f(req.summa,true)+" oldingiz":"You borrowed"))}
                {!isPay&&req.qaytSana&&<div style={{fontSize:11,color:th.t2,marginTop:3}}>{lg==="uz"?"Qaytarish":"Return"}: {req.qaytSana}</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>isPay?acceptPayReq(req):acceptQarzReq(req)} style={{flex:1,background:th.gr,border:"none",borderRadius:10,padding:"10px 0",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>{lg==="uz"?(isPay?"Qaytarildi, tasdiqlash":"Tasdiqlash"):(isPay?"Confirm return":"Accept")}</button>
                <button onClick={()=>isPay?rejectPayReq(req):rejectQarzReq(req)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.rd+"55",borderRadius:10,padding:"10px 0",color:th.rd,cursor:"pointer",fontWeight:700,fontSize:13}}>{lg==="uz"?"Rad etish":"Reject"}</button>
              </div>
            </div>;
          })}
        </div>}
        {(()=>{
          // Har a'zo faqat O'Z qarzini ko'radi. Oila boshi a'zolarnikini ham (alohida).
          const isBosh=user?.rol==="bosh";
          const myQ=qarzlar.filter(q=>!q.uid||q.uid===user.id);
          // Oila a'zolari qarzlari (faqat oila boshi ko'radi)
          const memberQ=isBosh?qarzlar.filter(q=>q.uid&&q.uid!==user.id):[];
          const active=myQ.filter(q=>!q.paid);
          const done=myQ.filter(q=>q.paid);
          const memberActive=memberQ.filter(q=>!q.paid);
          const olganSum=active.filter(q=>q.tur==="bergan").reduce((s,q)=>s+Number(q.summa||0),0);
          const berganSum=active.filter(q=>q.tur==="olgan").reduce((s,q)=>s+Number(q.summa||0),0);
          const gN2=uid=>azolar.find(a=>a.id===uid)?.ism||"?";
          return <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{...S.cd,textAlign:"center",margin:0,border:"1px solid "+th.gr+"44"}}><div style={{fontSize:10,color:th.gr,fontWeight:700,marginBottom:4}}>{lg==="uz"?"Menga qaytariladi":"They owe me"}</div><div style={{fontSize:18,fontWeight:800,color:th.gr}}>{f(olganSum,true)}</div></div>
              <div style={{...S.cd,textAlign:"center",margin:0,border:"1px solid "+th.rd+"44"}}><div style={{fontSize:10,color:th.rd,fontWeight:700,marginBottom:4}}>{lg==="uz"?"Men qaytaraman":"I owe"}</div><div style={{fontSize:18,fontWeight:800,color:th.rd}}>{f(berganSum,true)}</div></div>
            </div>
            {active.length>0&&<div>
              <div style={S.sec}>{isBosh&&memberActive.length>0?(lg==="uz"?"Mening qarzlarim":lg==="ru"?"Мои долги":"My debts"):(lg==="uz"?"Faol qarzlar":"Active debts")} ({active.length})</div>
              {active.map(q=>{
                const isLent=q.tur==="bergan";const color=isLent?th.gr:th.rd;
                const today=new Date().toISOString().slice(0,10);const overdue=q.qaytSana&&q.qaytSana<today;
                return <div key={q.id} style={{...S.cd,padding:"13px 15px",marginBottom:10,border:"1px solid "+(overdue?th.rd+"55":th.bor)}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{isLent?"💰":"💸"}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:th.t1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>{q.kim}
                          {q.payStatus==="pending"&&<span style={{fontSize:9,background:th.am+"22",color:th.am,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"QAYTARISH KUTILMOQDA":"RETURN PENDING"}</span>}
                          {q.linked&&q.linkStatus==="pending"&&!q.payStatus&&<span style={{fontSize:9,background:th.am+"22",color:th.am,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"KUTILMOQDA":"PENDING"}</span>}
                          {q.linked&&q.linkStatus==="accepted"&&!q.payStatus&&<span style={{fontSize:9,background:th.gr+"22",color:th.gr,borderRadius:6,padding:"2px 7px",fontWeight:700}}>✓ {lg==="uz"?"TASDIQLANGAN":"CONFIRMED"}</span>}
                          {q.linked&&q.linkStatus==="rejected"&&<span style={{fontSize:9,background:th.rd+"22",color:th.rd,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"RAD ETILGAN":"REJECTED"}</span>}
                        </div>
                        <div style={{fontSize:11,color:th.t2,marginTop:2}}>{q.sana}{q.qaytSana?" → "+q.qaytSana:""}</div>
                        {q.izoh&&<div style={{fontSize:11,color:th.t2,marginTop:1,fontStyle:"italic"}}>{q.izoh}</div>}
                        {overdue&&<div style={{fontSize:10,color:th.rd,fontWeight:700,marginTop:3}}>{"⚠️ "+(lg==="uz"?"Muddati o'tgan!":"Overdue!")}</div>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color}}>{f(q.summa,true)}</div>{q.paidPart>0?<div style={{fontSize:9,color:th.gr,marginTop:2,fontWeight:600}}>{lg==="uz"?"To'langan: ":"Paid: "}{f(q.paidPart,true)}</div>:<div style={{fontSize:10,color:th.t2,marginTop:2}}>{isLent?(lg==="uz"?"ular qarzli":"they owe"):(lg==="uz"?"men qarzman":"I owe")}</div>}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {q.payStatus==="pending"?
                      <div style={{flex:1,background:th.am+"11",border:"1px solid "+th.am+"33",borderRadius:10,padding:"8px 0",color:th.am,fontWeight:700,fontSize:12,textAlign:"center"}}>{q.payBy===user.id?(lg==="uz"?"Tasdiq kutilmoqda...":"Awaiting confirmation..."):(lg==="uz"?"Qaytarish so'rovi keldi":"Return requested")}</div>
                      :<button onClick={()=>markQarzPaid(q.id)} style={{flex:1,background:color+"18",border:"1px solid "+color+"44",borderRadius:10,padding:"8px 0",color,cursor:"pointer",fontWeight:700,fontSize:12}}>{isLent?(lg==="uz"?"Qaytarib oldim":lg==="ru"?"Получил обратно":"Got it back"):(lg==="uz"?"Qaytardim":lg==="ru"?"Вернул":"Paid back")}</button>
                    }
                    {q.payStatus!=="pending"&&isLent&&<button onClick={()=>sendQarzReminder(q)} style={{background:(overdue?th.rd:th.am)+"15",border:"1px solid "+(overdue?th.rd:th.am)+"44",borderRadius:10,padding:"8px 11px",color:overdue?th.rd:th.am,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,display:"flex",alignItems:"center",gap:4}}><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke={overdue?th.rd:th.am} strokeWidth="1.4" strokeLinejoin="round"/></svg>{lg==="uz"?"Eslatish":lg==="ru"?"Напомнить":"Remind"}</button>}
                    {q.payStatus!=="pending"&&<button onClick={()=>{setPartialQarz(q);setPartialSum("");}} style={{background:th.ac+"11",border:"1px solid "+th.ac+"33",borderRadius:10,padding:"8px 12px",color:th.ac,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0}}>{lg==="uz"?"Qisman":lg==="ru"?"Частично":"Partial"}</button>}
                    {q.linked&&q.linkStatus==="accepted"&&q.payStatus!=="pending"&&<button onClick={()=>generateTilxat(q)} style={{background:"#4f46e515",border:"1px solid #4f46e544",borderRadius:10,padding:"8px 11px",color:"#4f46e5",cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,display:"flex",alignItems:"center",gap:4}} title={lg==="uz"?"Tilxat (PDF)":"Receipt (PDF)"}><span style={{fontSize:13}}>📄</span>{lg==="uz"?"Tilxat":lg==="ru"?"Расписка":"Receipt"}</button>}
                    <button onClick={()=>delQarz(q.id)} style={{width:38,background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.trash(th.rd)}</button>
                  </div>
                </div>;
              })}
            </div>}
            {isBosh&&memberActive.length>0&&<div style={{marginTop:active.length>0?18:0}}>
              <div style={{...S.sec,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zolari qarzlari":lg==="ru"?"Долги участников":"Members' debts"} ({memberActive.length})</div>
              {memberActive.map(q=>{
                const isLent=q.tur==="bergan";const color=isLent?th.gr:th.rd;
                const today=new Date().toISOString().slice(0,10);const overdue=q.qaytSana&&q.qaytSana<today;
                const owner=azolar.find(a=>a.id===q.uid);
                return <div key={q.id} style={{...S.cd,padding:"12px 14px",marginBottom:9,border:"1px solid "+th.bor,borderLeft:"3px solid "+th.ac}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+th.bor}}>
                    <Av src={owner?.photo} name={owner?.ism||q.kim} size={26} ac={th.ac}/>
                    <span style={{fontSize:12,fontWeight:700,color:th.ac}}>{gN2(q.uid)}</span>
                    <span style={{fontSize:10,color:th.t2}}>{lg==="uz"?"ning qarzi":"'s debt"}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:11,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{isLent?"💰":"💸"}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:th.t1}}>{q.kim}</div>
                        <div style={{fontSize:11,color:th.t2,marginTop:2}}>{q.sana}{q.qaytSana?" → "+q.qaytSana:""}</div>
                        {q.izoh&&<div style={{fontSize:11,color:th.t2,fontStyle:"italic"}}>{q.izoh}</div>}
                        {overdue&&<div style={{fontSize:10,color:th.rd,fontWeight:700,marginTop:3}}>⚠️ {lg==="uz"?"Muddati o'tgan":"Overdue"}</div>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color}}>{f(q.summa,true)}</div><div style={{fontSize:10,color:th.t2,marginTop:2}}>{isLent?(lg==="uz"?"ular qarzli":"they owe"):(lg==="uz"?"qarzdor":"owes")}</div></div>
                  </div>
                </div>;
              })}
            </div>}
            {done.length>0&&<div>
              <div style={S.sec}>{lg==="uz"?"Qaytarilganlar":"Returned"} ({done.length})</div>
              {done.slice(0,8).map(q=>{const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;return <div key={q.id} style={{...S.cd,padding:"11px 14px",marginBottom:8,borderLeft:"3px solid "+dc+"66"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:9,background:dc+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isLent?"💰":"💸"}</div><div><div style={{fontWeight:600,fontSize:13,color:th.t1}}>{q.kim}</div><div style={{fontSize:10,color:dc,fontWeight:600}}>{isLent?(lg==="uz"?"Qaytarib oldim":lg==="ru"?"Получено":"Got back"):(lg==="uz"?"Qaytardim":lg==="ru"?"Возвращено":"Paid back")} · {q.paidSana}</div></div></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:800,color:dc}}>{isLent?"+":"−"}{f(q.summa,true)}</span><button onClick={()=>delQarz(q.id)} style={{background:"none",border:"none",cursor:"pointer"}}>{Ico.trash(th.t2)}</button></div></div></div>;})}
            </div>}
            {qarzlar.length===0&&!showAddQarz&&qarzReqs.length===0&&<div style={{textAlign:"center",padding:"44px 0",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><div style={{fontSize:48}}>💸</div><div style={{fontSize:15}}>{lg==="uz"?"Hali qarz yo'q":"No debts yet"}</div></div>}
          </div>;
        })()
  );
}
