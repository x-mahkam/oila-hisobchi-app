import { useState, useRef, useCallback, useMemo } from "react";
import { KatIco, DarIco, MoneyInput, Av, Spark, Heat, BH } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, VALS, COUNTRIES, GOAL_PRESETS, KID_GOAL_PRESETS, VAZIFA_PRESETS, QUICK_ADD } from "../utils/constants.js";
import { f, td, nt, tm } from "../utils/formatters.js";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProfilePage({
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
        {pTab==="main"&&<div>
          <div style={{...S.row,marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{t.prf}</div>
            <button onClick={logout} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:th.rd,fontWeight:700,fontSize:14}}>{Ico.door(th.rd)}{t.lo}</button>
          </div>
          {isAdmin&&<button onClick={loadAdminStats} style={{width:"100%",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #f43f5e44",borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <span style={{fontSize:24}}>🛠️</span>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{lg==="uz"?"Admin Panel":"Admin Panel"}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{lg==="uz"?"Ilova statistikasi (faqat siz)":"App statistics (you only)"}</div>
            </div>
            <span style={{fontSize:18,color:"#64748b"}}>›</span>
          </button>}
          <div style={{background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",borderRadius:20,padding:"20px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <Av src={user?.photo} name={user?.ism} size={64} ac="#fff"/>
              <button onClick={()=>fRef.current?.click()} style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>{Ico.camera(th.ac)}</button>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.ism}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:3}}>{user?.email}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"3px 10px",marginTop:7,fontSize:11,color:"#fff",fontWeight:600}}>
                {user?.rol==="bosh"?Ico.crown("#fff"):Ico.user("#fff")}
                {user?.rol==="bosh"?(lg==="uz"?"Oila boshlig'i":lg==="ru"?"\u0413\u043b\u0430\u0432\u0430 \u0441\u0435\u043c\u044c\u0438":"Family head"):(lg==="uz"?"A'zo":lg==="ru"?"\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a":"Member")}
              </div>
            </div>
          </div>
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10,paddingLeft:4}}>{t.qoshimcha}</div>
          {[
            {id:"garden",label:lg==="uz"?"🌱 Oila bog'i":lg==="ru"?"🌱 Семейный сад":"🌱 Family Garden",ico:<span style={{fontSize:20}}>🌱</span>},
            {id:"bilim",label:lg==="uz"?"📚 Bilim Bozori":lg==="ru"?"📚 Рынок знаний":"📚 Knowledge Market",ico:<span style={{fontSize:20}}>📚</span>},
            {id:"shaxsiy",label:t.shaxsiy,ico:Ico.user(th.ac)},
            ...(user?.rol==="bosh"?[{id:"budjet",label:lg==="uz"?"Budjet va limitlar":lg==="ru"?"Бюджет и лимиты":"Budget & limits",ico:Ico.wallet(th.ac)}]:[]),
            {id:"ilovaS", label:t.ilovaS, ico:Ico.settings(th.ac)},
            {id:"xav",    label:t.xav,    ico:Ico.shield(th.ac)},
            {id:"qol",    label:t.qol,    ico:Ico.help(th.ac)},
            ...(!isKid?[{id:"__addkid__",label:lg==="uz"?"Bola akkaunti qo'shish":lg==="ru"?"Добавить ребёнка":"Add kid account",ico:<span style={{fontSize:20}}>👶</span>}]:[]),
          ].map(item=>(
            <button key={item.id} onClick={()=>{if(item.id==="__addkid__"){buzz(10);setShowAddKid(true);}else if(item.id==="bilim"){buzz(10);setShowBilim(true);}else{setPTab(item.id);}}} style={{width:"100%",background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:10,textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.ico}</div>
              <span style={{flex:1,fontSize:15,fontWeight:600,color:th.t1}}>{item.label}</span>
              {Ico.right(th.t2)}
            </button>
          ))}
          {!isKid&&<button onClick={()=>setShowReferral(true)} style={{width:"100%",background:"linear-gradient(135deg,#10b98115,#05966908)",border:"1.5px solid #10b98144",borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:10,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"#10b98122",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>🎁</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:th.gr}}>{lg==="uz"?"Do'stlarni taklif qiling":lg==="ru"?"Пригласить друзей":"Invite friends"}</div><div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"3 ta do'st = 1 oy Premium bepul!":"3 friends = 1 month Premium free!"}</div></div>
            {Ico.right(th.gr)}
          </button>}
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.version(th.ac)}</div>
            <span style={{flex:1,fontSize:15,fontWeight:600,color:th.t1}}>{t.ver}</span>
            <span style={{fontSize:13,color:th.t2,fontWeight:600}}>v{APP_VER}</span>
          </div>
        </div>}
        {pTab==="shaxsiy"&&<div>
          <BH label={t.shaxsiy} th={th} onBack={()=>setPTab("main")}/>
          <div style={{...S.cd,textAlign:"center",padding:"22px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <div style={{position:"relative",padding:4,borderRadius:"50%",background:isPremium?"linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)":"linear-gradient(135deg,"+th.ac+","+th.ac2+")"}}>
                <div style={{padding:3,borderRadius:"50%",background:th.sur}}>
                  <Av src={user?.photo} name={user?.ism} size={78} ac={th.ac}/>
                </div>
                <button onClick={()=>fRef.current?.click()} style={{position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:th.ac,border:"2px solid "+th.sur,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ico.camera("#fff")}</button>
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={()=>fRef.current?.click()} style={{background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:10,padding:"7px 14px",color:th.ac,cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{Ico.camera(th.ac)}{t.up}</button>
              {user?.photo&&<button onClick={rmPhoto} style={{background:th.rd+"18",border:"1px solid "+th.rd+"44",borderRadius:10,padding:"7px 14px",color:th.rd,cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{Ico.trash(th.rd)}{t.rp}</button>}
            </div>
          </div>
          <div style={S.cd}>
            <div style={{...S.row,marginBottom:edN?12:0}}>
              <div><div style={{fontSize:10,color:th.t2,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Ism":"Name"}</div><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{user?.ism}</div></div>
              <button onClick={()=>{setEdN(v=>!v);setNewN(user?.ism||"");}} style={{background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:9,padding:"6px 12px",color:th.ac,cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>{Ico.edit(th.ac)}{edN?t.cn:t.ep}</button>
            </div>
            {edN&&<div><div style={{height:10}}/><input style={S.ip} value={newN} onChange={e=>setNewN(e.target.value)} placeholder="Ism" autoFocus/><button onClick={updName} style={S.bt()}>{t.un}</button></div>}
          </div>
          <div style={S.cd}><div style={{fontSize:10,color:th.t2,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>Email</div><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{user?.email}</div></div>
          <div style={S.cd}><div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:10}}>{lg==="uz"?"Bu oy statistikasi":"Stats"}</div>{[{l:lg==="uz"?"Xarajat":"Expense",v:f(bX.filter(x=>x.uid===user.id).reduce((s,x)=>s+Number(x.summa||0),0),true),c:th.rd},{l:lg==="uz"?"Daromad":"Income",v:f(bD.filter(d=>d.uid===user.id).reduce((s,d)=>s+Number(d.summa||0),0),true),c:th.gr},{l:lg==="uz"?"Jami yozuvlar":"Total records",v:xar.filter(x=>x.uid===user.id).length+" ta",c:th.ac}].map(item=><div key={item.l} style={{...S.row,padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{item.l}</span><span style={{fontSize:13,fontWeight:700,color:item.c}}>{item.v}</span></div>)}</div>
          {user?.rol==="bosh"&&<div style={{...S.cd,background:th.ac+"0d",border:"1px solid "+th.ac+"33"}}><div style={{fontSize:11,color:th.t2,marginBottom:5,fontWeight:600}}>{Ico.key(th.ac)}{t.fc2}</div><div style={{fontFamily:"monospace",fontSize:12,color:th.ac,wordBreak:"break-all",fontWeight:700}}>{oila?.id}</div><div style={{fontSize:10,color:th.t2,marginTop:5}}>{t.fcd}</div></div>}
          {!isKid&&<button onClick={()=>{buzz(10);setShowAddKid(true);}} style={{...S.cd,width:"100%",background:"linear-gradient(135deg,#f59e0b0d,#ec48990d)",border:"1px solid #f59e0b33",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
            <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>👶</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:th.t1}}>{lg==="uz"?"Bola akkaunti qo'shish":lg==="ru"?"Добавить ребёнка":"Add kid account"}</div>
              <div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"Farzandingizga login yarating":"Create a login for your child"}</div>
            </div>
            <span style={{fontSize:18,color:th.t2}}>›</span>
          </button>}
          {user?.rol==="bosh"&&azolar.length>1&&<div style={{...S.cd}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zolari va ruxsatlar":lg==="ru"?"Участники и доступы":"Members & access"}</div>
            <div style={{fontSize:10,color:th.t2,marginBottom:12}}>{lg==="uz"?"Kimga umumiy hisobotni ko'rishga ruxsat berasiz?":"Who can view the full family report?"}</div>
            {azolar.map(a=>{const isBosh=a.rol==="bosh";const hasAccess=isBosh||(oila?.reportAccess||[]).includes(a.id);const rel=RELATIONS.find(r=>r.id===a.rel);return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+th.bor}}>
                <Av src={a.photo} name={a.ism} size={34} ac={th.ac}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:th.t1}}>{a.ism}{a.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</div>
                  <div style={{fontSize:10,color:th.t2}}>{rel?(rel.emoji+" "+(rel[lg]||rel.uz)):(isBosh?t.hd:t.mb2)}</div>
                </div>
                {isBosh?<span style={{fontSize:10,color:th.ac,fontWeight:700,background:th.ac+"15",borderRadius:8,padding:"4px 10px"}}>{lg==="uz"?"Oila boshi":"Head"}</span>:
                  <button onClick={()=>toggleReportAccess(a.id)} style={{width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",background:hasAccess?th.gr:th.bor,position:"relative",transition:"background .2s"}}>
                    <span style={{position:"absolute",top:3,left:hasAccess?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                  </button>}
              </div>
            );})}
            <div style={{fontSize:10,color:th.t2,marginTop:10,fontStyle:"italic"}}>{lg==="uz"?"💡 Yashil = umumiy hisobotni ko'ra oladi":"💡 Green = can see full report"}</div>
          </div>}
          {azolar.length>0&&<div style={S.cd}><div style={{fontWeight:700,marginBottom:12,color:th.t1}}>{t.fam}: {oila?.nomi}</div>{azolar.map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+th.bor}}><Av src={a.photo} name={a.ism} size={34} ac={th.ac}/><div style={{flex:1}}><div style={{fontSize:13,color:th.t1,fontWeight:600}}>{a.ism}{a.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</div><div style={{fontSize:10,color:th.t2}}>{a.email}</div></div><span style={{fontSize:10,color:a.rol==="bosh"?th.am:th.t2,background:a.rol==="bosh"?th.am+"18":th.bg,padding:"3px 9px",borderRadius:20,fontWeight:600}}>{a.rol==="bosh"?t.hd:t.mb2}</span></div>)}</div>}

        </div>}
        {pTab==="budjet"&&<div>
          <BH label={lg==="uz"?"Budjet va limitlar":lg==="ru"?"Бюджет и лимиты":"Budget & limits"} th={th} onBack={()=>setPTab("main")}/>
          <div style={{...S.cd,background:"linear-gradient(135deg,"+th.ac+"15,"+th.ac2+"08)",border:"1.5px solid "+th.ac+"33"}}>
            <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>{Ico.wallet(th.ac)}{lg==="uz"?"Oylik budjet":"Monthly budget"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{lg==="uz"?"Bu oy uchun umumiy xarajat chegarasi":"Total spending limit this month"}</div>
            <label style={S.lb}>{t.mb}</label>
            <MoneyInput style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center",marginBottom:4}} value={fBj} onChange={setFBj} placeholder="2 000 000"/>
            <div style={{fontSize:11,color:th.t2,textAlign:"center"}}>{f(Number(fBj)||0,false)}</div>
          </div>
          {(()=>{
            const bjNum=Number(fBj)||0;
            const avgInc=jD>0?jD:0;
            if(bjNum>0&&avgInc>0&&bjNum>avgInc){
              return <div style={{background:th.rd+"11",border:"1.5px solid "+th.rd+"44",borderRadius:14,padding:"13px 15px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                <div><div style={{fontSize:13,fontWeight:700,color:th.rd,marginBottom:3}}>{lg==="uz"?"Budjet daromaddan yuqori!":lg==="ru"?"Бюджет выше дохода!":"Budget exceeds income!"}</div><div style={{fontSize:11,color:th.t2,lineHeight:1.5}}>{lg==="uz"?"Bu oy daromadingiz "+f(avgInc,true)+", lekin budjet "+f(bjNum,true)+". Daromaddan ko'p sarflash qarzga olib keladi.":lg==="ru"?"Доход "+f(avgInc,true)+", бюджет "+f(bjNum,true):"Income "+f(avgInc,true)+", budget "+f(bjNum,true)}</div></div>
              </div>;
            }
            return null;
          })()}
          {jD>0&&<div style={{background:th.gr+"0d",border:"1px solid "+th.gr+"33",borderRadius:14,padding:"14px 15px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.gr,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>💡 {lg==="uz"?"50/30/20 qoidasi bo'yicha taklif":lg==="ru"?"Правило 50/30/20":"50/30/20 rule"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:12,lineHeight:1.5}}>{lg==="uz"?"Daromadingiz ("+f(jD,true)+") asosida tavsiya:":lg==="ru"?"На основе дохода ("+f(jD,true)+"):":"Based on income ("+f(jD,true)+"):"}</div>
            {[{p:50,c:"#10b981",uz:"Ehtiyojlar (oziq, uy, transport)",ru:"Нужды",en:"Needs"},{p:30,c:"#f59e0b",uz:"Xohishlar (ko'ngilochar, kiyim)",ru:"Желания",en:"Wants"},{p:20,c:"#6366f1",uz:"Jamg'arma va maqsadlar",ru:"Сбережения",en:"Savings"}].map(r=>(
              <div key={r.p} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:38,height:24,borderRadius:6,background:r.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:r.c,flexShrink:0}}>{r.p}%</div>
                <span style={{flex:1,fontSize:11,color:th.t1}}>{lg==="uz"?r.uz:lg==="ru"?r.ru:r.en}</span>
                <span style={{fontSize:12,fontWeight:700,color:r.c}}>{f(Math.round(jD*r.p/100),true)}</span>
              </div>
            ))}
            <button onClick={()=>setFBj(String(Math.round(jD*0.8)))} style={{width:"100%",marginTop:8,background:th.gr+"15",border:"1px solid "+th.gr+"44",borderRadius:10,padding:"9px",color:th.gr,cursor:"pointer",fontWeight:700,fontSize:12}}>{lg==="uz"?"Budjetni 80% ("+f(Math.round(jD*0.8),true)+") qilib o'rnatish":lg==="ru"?"Установить 80%":"Set budget to 80%"}</button>
          </div>}
          <div style={S.cd}>
            <div style={{fontWeight:700,marginBottom:6,color:th.t1}}>{lg==="uz"?"Kategoriya limitlari":"Category limits"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{lg==="uz"?"Har bir kategoriya uchun alohida chegara (ixtiyoriy)":"Separate limit per category (optional)"}</div>
            {KATS.map((k,i)=>(
              <div key={k.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:k.c+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><KatIco id={k.id} c={k.c} s={18}/></div>
                <span style={{fontSize:13,color:th.t1,flex:1,fontWeight:500}}>{KN[lg][i]}</span>
                <input type="number" style={{width:120,background:th.bg,border:"1.5px solid "+th.bor,borderRadius:10,padding:"8px 12px",color:th.t1,fontSize:13,outline:"none",textAlign:"right"}} value={fKL[k.id]||""} onChange={e=>setFKL(p=>({...p,[k.id]:Number(e.target.value)||0}))} placeholder="—"/>
              </div>
            ))}
          </div>
          {(()=>{
            const limTotal=KATS.reduce((s,k)=>s+(Number(fKL[k.id])||0),0);
            const bjNum=Number(fBj)||0;
            if(limTotal>0&&bjNum>0&&limTotal>bjNum){
              return <div style={{background:th.am+"11",border:"1.5px solid "+th.am+"44",borderRadius:14,padding:"13px 15px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                <div><div style={{fontSize:13,fontWeight:700,color:th.am,marginBottom:3}}>{lg==="uz"?"Limitlar budjetdan oshdi":lg==="ru"?"Лимиты превышают бюджет":"Limits exceed budget"}</div><div style={{fontSize:11,color:th.t2,lineHeight:1.5}}>{lg==="uz"?"Kategoriya limitlari jami "+f(limTotal,true)+", umumiy budjet esa "+f(bjNum,true)+". Limitlarni kamaytiring yoki budjetni oshiring.":lg==="ru"?"Сумма лимитов "+f(limTotal,true)+" > бюджет "+f(bjNum,true):"Limits total "+f(limTotal,true)+" > budget "+f(bjNum,true)}</div></div>
              </div>;
            }
            if(limTotal>0&&bjNum>0){
              return <div style={{background:th.gr+"0d",borderRadius:12,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Limitlar jami":lg==="ru"?"Сумма лимитов":"Limits total"}</span><span style={{fontSize:13,fontWeight:700,color:th.gr}}>{f(limTotal,true)} / {f(bjNum,true)}</span></div>;
            }
            return null;
          })()}
          <button onClick={saveBj} style={{...S.bt(),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.check("#fff")}{t.sv}</button>
        </div>}
        {pTab==="ilovaS"&&<div>
          <BH label={t.ilovaS} th={th} onBack={()=>setPTab("main")}/>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+th.bor}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.globe(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.til}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"O'zbek":lg==="ru"?"\u0420\u0443\u0441\u0441\u043a\u0438\u0439":"English"}</div></div>
            </div>
            <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{id:"uz",l:"\ud83c\uddfa\ud83c\uddff O'zbek"},{id:"ru",l:"\ud83c\uddf7\ud83c\uddfa \u0420\u0443\u0441\u0441\u043a\u0438\u0439"},{id:"kk",l:"\ud83c\uddf0\ud83c\uddff Qaraqalpaq"},{id:"en",l:"\ud83c\uddec\ud83c\udde7 English"}].map(l=>(
                <button key={l.id} onClick={()=>{const nl=l.id==="kk"?"uz":l.id;setLg(nl);localStorage.setItem("oilaV7L",nl);}} style={{background:lg===l.id?th.ac+"18":th.bg,border:"2px solid "+(lg===l.id?th.ac:th.bor),borderRadius:11,padding:"10px 8px",color:lg===l.id?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:12}}>{l.l}</button>
              ))}
            </div>
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+th.bor}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{dark?Ico.moon(th.ac):Ico.sun(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.mavzu}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{dark?t.tungi:t.kunduzi}</div></div>
            </div>
            <div style={{padding:"12px 16px",display:"flex",gap:8}}>
              {[{v:false,l:"\u2600\ufe0f "+t.kunduzi},{v:true,l:"\ud83c\udf19 "+t.tungi}].map(m=>(
                <button key={String(m.v)} onClick={()=>{setDark(m.v);localStorage.setItem("oilaV7D",String(m.v));}} style={{flex:1,background:dark===m.v?th.ac+"18":th.bg,border:"2px solid "+(dark===m.v?th.ac:th.bor),borderRadius:11,padding:"11px 8px",color:dark===m.v?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:13}}>{m.l}</button>
              ))}
            </div>
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <button onClick={()=>setShowValDD(v=>!v)} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer"}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.money(th.ac)}</div>
              <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{lg==="uz"?"Valyuta":"\u0412\u0430\u043b\u044e\u0442\u0430"}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{val.b} {val.id.toUpperCase()}</div></div>
              <div style={{transform:showValDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</div>
            </button>
            {showValDD&&<div style={{borderTop:"1px solid "+th.bor,maxHeight:280,overflowY:"auto"}}>
              {VALS.map(v=><button key={v.id} onClick={()=>{setVal(v);localStorage.setItem("oilaV7V",v.id);setShowValDD(false);}} style={{width:"100%",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,background:val.id===v.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,cursor:"pointer"}}>
                <div style={{width:34,height:34,borderRadius:9,background:(val.id===v.id?th.ac:th.t2)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:val.id===v.id?th.ac:th.t2,flexShrink:0}}>{v.b}</div>
                <span style={{flex:1,textAlign:"left",fontSize:14,fontWeight:600,color:val.id===v.id?th.ac:th.t1}}>{v.id.toUpperCase()}</span>
                {val.id===v.id&&<span style={{color:th.ac}}>{Ico.check(th.ac)}</span>}
              </button>)}
            </div>}
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:notifEnabled?"1px solid "+th.bor:"none"}}>
              <div style={{width:38,height:38,borderRadius:11,background:(notifEnabled?th.gr:th.t2)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" fill={notifEnabled?th.gr:th.t2} opacity=".2" stroke={notifEnabled?th.gr:th.t2} strokeWidth="1.3"/><path d="M8.5 16.5a1.5 1.5 0 003 0" stroke={notifEnabled?th.gr:th.t2} strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{lg==="uz"?"Bildirishnomalar":"Notifications"}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{notifEnabled?(lg==="uz"?"Yoqilgan — har kuni "+notifTime:"On — daily at "+notifTime):(lg==="uz"?"O'chirilgan":"Off")}</div></div>
              <div onClick={toggleNotif} style={{width:50,height:28,borderRadius:14,background:notifEnabled?th.gr:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
                <div style={{position:"absolute",top:4,left:notifEnabled?24:4,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
              </div>
            </div>
            {notifEnabled&&<div style={{padding:"12px 16px"}}>
              <div style={{fontSize:11,color:th.t2,marginBottom:8,fontWeight:600}}>{lg==="uz"?"Eslatma vaqti":"Reminder time"}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["08:00","12:00","18:00","20:00","21:00","22:00"].map(time=>(<button key={time} onClick={()=>saveNotifTime(time)} style={{background:notifTime===time?th.ac+"18":th.bg,border:"1.5px solid "+(notifTime===time?th.ac:th.bor),borderRadius:10,padding:"7px 14px",color:notifTime===time?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:13}}>{time}</button>))}
              </div>
            </div>}
          </div>
          <div style={{background:"linear-gradient(135deg,"+th.ac+"11,"+th.ac2+"08)",border:"1.5px solid "+th.ac+"33",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setShowPremModal(true)}>
            <div style={{fontSize:28}}>💎</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:th.ac}}>{isPremium?(lg==="uz"?"Premium faol":"Premium active"):(lg==="uz"?"Premium ga o'ting":"Upgrade to Premium")}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{isPremium?(lg==="uz"?"Barcha funksiyalar ochiq":"All unlocked"):(lg==="uz"?"Cheksiz maqsad, PDF, Excel...":"Unlimited goals, PDF...")}</div></div>
            {!isPremium?<div style={{background:th.ac,borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{lg==="uz"?"Ochish":"Unlock"}</div>:<div style={{fontSize:20}}>✓</div>}
          </div>
        </div>}
        {pTab==="xav"&&<div>
          <BH label={t.xav} th={th} onBack={()=>setPTab("main")}/>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.lock(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.pin}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"4 raqamli maxfiy kod":"4-digit code"}</div></div>
              <button onClick={()=>setPinStep(pinStep==="idle"?"enter":"idle")} style={{background:th.ac,border:"none",borderRadius:9,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12}}>{pinStep==="idle"?(lg==="uz"?"O'zgartirish":"Change"):(lg==="uz"?"Bekor":"Cancel")}</button>
            </div>
            {pinStep!=="idle"&&<div style={{padding:"16px",borderTop:"1px solid "+th.bor}}>
              <div style={{fontSize:13,color:th.t2,marginBottom:12,textAlign:"center",fontWeight:600}}>{pinStep==="enter"?(lg==="uz"?"Yangi PIN kiriting":"Enter new PIN"):(lg==="uz"?"PIN ni tasdiqlang":"Confirm PIN")}</div>
              <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16}}>
                {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:(pinStep==="enter"?pinVal:pinCfm).length>i?th.ac:th.bor,transition:"background .2s"}}/>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[1,2,3,4,5,6,7,8,9,"",0,"\u232b"].map((num,ni)=>(
                  <button key={ni} onClick={()=>{
                    if(num==="")return;
                    const cur=pinStep==="enter"?pinVal:pinCfm;
                    const setter=pinStep==="enter"?setPinVal:setPinCfm;
                    if(num==="\u232b"){setter(cur.slice(0,-1));return;}
                    const next=cur+String(num);setter(next);
                    if(next.length===4){
                      if(pinStep==="enter"){setTimeout(()=>setPinStep("confirm"),300);}
                      else{if(next===pinVal){setPinStep("idle");setPinVal("");setPinCfm("");ok$(lg==="uz"?"PIN saqlandi":"PIN saved");}else{setPinCfm("");ok$(lg==="uz"?"PIN mos kelmadi":"PIN mismatch","err");}}
                    }
                  }} style={{background:typeof num==="number"?th.sur:"transparent",border:typeof num==="number"?"1px solid "+th.bor:"none",borderRadius:12,padding:"14px",fontSize:18,fontWeight:700,color:num==="\u232b"?th.rd:th.t1,cursor:num===""?"default":"pointer"}}>{num}</button>
                ))}
              </div>
            </div>}
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:th.gr+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.finger(th.gr)}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.barmoq}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"Tez va xavfsiz":"Fast & secure"}</div></div>
            <div onClick={()=>setFinger(v=>!v)} style={{width:50,height:28,borderRadius:14,background:finger?th.gr:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
              <div style={{position:"absolute",top:4,left:finger?24:4,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s",boxShadow:"0 2px 4px rgba(0,0,0,.2)"}}/>
            </div>
          </div>
        </div>}
        {pTab==="qol"&&<div>
          <BH label={t.qol} th={th} onBack={()=>setPTab("main")}/>
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <div style={{background:"linear-gradient(135deg,#2196F3,#0d47a1)",borderRadius:18,padding:"18px",marginBottom:14,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
              <div style={{width:46,height:46,borderRadius:13,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.tg()}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{t.tgBot}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:3}}>@oila_hisobchi_bot</div></div>
              {Ico.right("rgba(255,255,255,0.7)")}
            </div>
          </a>
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>{t.faq}</div>
          {FAQS[lg].map((item,i)=>(
            <div key={i} style={{marginBottom:8,borderRadius:14,overflow:"hidden",border:"1px solid "+th.bor}}>
              <button onClick={()=>setFaqO(faqO===i?null:i)} style={{width:"100%",background:faqO===i?th.ac+"18":th.sur,border:"none",padding:"14px 16px",cursor:"pointer",textAlign:"left",color:th.t1,fontSize:14,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{flex:1,paddingRight:8}}>{item.q}</span>
                {Ico.chevron(th.ac,faqO===i)}
              </button>
              {faqO===i&&<div style={{background:th.surH,padding:"12px 16px",fontSize:13,color:th.t2,lineHeight:1.75,borderTop:"1px solid "+th.bor}}>{item.a}</div>}
            </div>
          ))}
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10,marginTop:20}}>{lg==="uz"?"Taklif va kamchiliklar":lg==="ru"?"Отзывы":"Feedback"}</div>
          <div style={S.cd}>
            <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:4}}>{lg==="uz"?"Ilovani baholang":"Rate the app"}</div>
            <div style={{fontSize:12,color:th.t2,marginBottom:12}}>{lg==="uz"?"Fikringiz biz uchun muhim!":"Your opinion matters!"}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
              {[1,2,3,4,5].map(star=>(<button key={star} onClick={()=>setFbRating(star)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="34" height="34" viewBox="0 0 24 24" fill={star<=fbRating?"#f59e0b":"none"} stroke={star<=fbRating?"#f59e0b":th.t2} strokeWidth="1.5"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.6 5.7 20.7 7 13.8 2 9.1l6.8-.8L12 2z" strokeLinejoin="round"/></svg></button>))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[{id:"taklif",l:lg==="uz"?"Taklif":"Suggestion"},{id:"xato",l:lg==="uz"?"Kamchilik":"Bug"},{id:"boshqa",l:lg==="uz"?"Boshqa":"Other"}].map(ty=>(<button key={ty.id} onClick={()=>setFbType(ty.id)} style={{flex:1,background:fbType===ty.id?th.ac+"18":th.bg,border:"1.5px solid "+(fbType===ty.id?th.ac:th.bor),borderRadius:10,padding:"8px 4px",color:fbType===ty.id?th.ac:th.t2,cursor:"pointer",fontWeight:600,fontSize:12}}>{ty.l}</button>))}
            </div>
            <textarea value={fbText} onChange={e=>setFbText(e.target.value)} placeholder={lg==="uz"?"Fikr, taklif yoki kamchilikni yozing...":"Write your feedback..."} style={{width:"100%",minHeight:90,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:13,padding:"12px 14px",color:th.t1,fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
            <button onClick={sendFeedback} disabled={fbSending} style={{...S.bt(),marginBottom:0,opacity:fbSending?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 2L8 10M16 2l-5 14-3-6-6-3 14-5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {fbSending?(lg==="uz"?"Yuborilmoqda...":"Sending..."):(lg==="uz"?"Yuborish":"Send")}
            </button>
          </div>
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:38,height:38,borderRadius:11,background:"#2196F318",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#2196F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:th.t1}}>{lg==="uz"?"Telegram orqali yozish":"Message on Telegram"}</div><div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"To'g'ridan-to'g'ri bog'laning":"Contact us directly"}</div></div>
              {Ico.right(th.t2)}
            </div>
          </a>
        </div>}
        {pTab==="garden"&&<Garden user={user} lg={lg} dark={dark} onBack={()=>setPTab("main")}/>
        }
      </div>}
    </div>
    {maqsadConfirmNotif&&!isKid&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:th.sur,borderRadius:28,padding:"28px 24px",width:"100%",maxWidth:380,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>🎯</div>
          <div style={{fontSize:20,fontWeight:900,color:th.t1,marginBottom:8}}>
            {lg==="uz"?"Maqsadga yetdingiz!":"Goal reached!"}
          </div>
          <div style={{fontSize:15,color:th.t2,marginBottom:6,fontWeight:600}}>
            {maqsadConfirmNotif.maqsadIsm}
          </div>
          <div style={{fontSize:14,color:th.t2,marginBottom:20,lineHeight:1.6}}>
            {lg==="uz"
              ?"Haqiqatan ham "+f(maqsadConfirmNotif.summa,true)+" ga shu narsani xarid qildingizmi?"
              :"Did you actually purchase this for "+f(maqsadConfirmNotif.summa,true)+"?"}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>confirmMaqBought(maqsadConfirmNotif)}
              style={{width:"100%",padding:"15px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>
              🛍️ {lg==="uz"?"Ha, xarid qildim!":"Yes, I bought it!"}
            </button>
            <button onClick={()=>cancelMaqReturn(maqsadConfirmNotif)}
              style={{width:"100%",padding:"15px",borderRadius:16,border:"none",background:th.bg,color:th.t2,fontWeight:700,fontSize:14,cursor:"pointer",border:"1.5px solid "+th.bor}}>
              ↩️ {lg==="uz"?"Yo'q, voz kechdim — pulni qaytaring":"No, cancel — return funds"}
            </button>
            <button onClick={()=>setMaqsadConfirmNotif(null)}
              style={{width:"100%",padding:"10px",borderRadius:12,border:"none",background:"none",color:th.t2,fontWeight:600,fontSize:13,cursor:"pointer"}}>
              {lg==="uz"?"Keyinroq":"Later"}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* ═══════ YANGI QO'SHISH MODAL (pastdan to'liq ekran) ═══════ */}
    <AddTransactionModal
      show={showAddModal} onClose={()=>setShowAddModal(false)}
      tab={addModalTab} setTab={setAddModalTab}
      step={addStep} setStep={setAddStep}
      kat={addKat} setKat={setAddKat}
      fS={fS} setFS={setFS} fIz={fIz} setFIz={setFIz}
      fSn={fSn} setFSn={setFSn} fRp={fRp} setFRp={setFRp}
      fK={fK} setFK={setFK}
      xForMember={xForMember} setXForMember={setXForMember}
      xMode={xMode} setXMode={setXMode}
      fDS={fDS} setFDS={setFDS} fDT={fDT} setFDT={setFDT}
      fDI={fDI} setFDI={setFDI}
      addX={addX} addD={addD}
      user={user} azolar={azolar} isKid={isKid}
      th={th} lg={lg} isPremium={isPremium}
      startScanner={startScanner} startVoice={startVoice}
      S={S} Ico={Ico} f={f} td={td}
    />
        {showBilim&&<div style={{position:"fixed",inset:0,zIndex:200,background:dark?"#0f172a":"#f0f9ff"}}>
      <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={()=>setShowBilim(false)}/>
    </div>}
    {quickItem&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setQuickItem(null)}>
      <div style={{background:th.sur,borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:340}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>{quickItem.emoji}</div>
          <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{quickItem[lg]||quickItem.uz}</div>
          <div style={{fontSize:13,color:th.t2,marginTop:2}}>{KN[lg][KATS.findIndex(k=>k.id===quickItem.kat)]}</div>
        </div>
        <MoneyInput autoFocus value={quickSum} onChange={setQuickSum} placeholder="0" style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:14,padding:"16px",color:th.t1,fontSize:30,fontWeight:800,textAlign:"center",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:16}}>{quickSum?f(Number(quickSum)||0,false):(lg==="uz"?"Summani kiriting":"Enter amount")}</div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {[10000,20000,50000,100000].map(amt=>(<button key={amt} onClick={()=>setQuickSum(String(amt))} style={{flex:"1 1 calc(50% - 4px)",background:th.bg,border:"1px solid "+th.bor,borderRadius:10,padding:"8px 0",color:th.t1,cursor:"pointer",fontSize:12,fontWeight:600}}>{(amt/1000)+"K"}</button>))}
        </div>
        <button onClick={quickAdd} style={{...S.bt(),marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.check("#fff")}{lg==="uz"?"Qo'shish":lg==="ru"?"Добавить":"Add"}</button>
        <button onClick={()=>setQuickItem(null)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Bekor":lg==="ru"?"Отмена":"Cancel"}</button>
      </div>
    </div>}
    {showReferral&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowReferral(false)}>
      <div style={{background:th.sur,borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>🎁</div>
          <div style={{fontSize:22,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Do'stlarni taklif qiling":lg==="ru"?"Пригласить друзей":"Invite friends"}</div>
          <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Har bir do'st uchun imtiyozlar oling!":lg==="ru"?"Получайте бонусы за каждого друга!":"Get rewards for each friend!"}</div>
        </div>
        <div style={{background:"linear-gradient(135deg,"+th.gr+"15,"+th.ac+"08)",border:"1.5px solid "+th.gr+"33",borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1}}>{lg==="uz"?"Sizning natijangiz":lg==="ru"?"Ваш прогресс":"Your progress"}</div>
            <div style={{fontSize:13,fontWeight:800,color:th.gr}}>{refCount}/3</div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[0,1,2].map(i=>(<div key={i} style={{flex:1,height:8,borderRadius:4,background:i<refCount?th.gr:th.bor}}/>))}
          </div>
          <div style={{fontSize:12,color:th.t2}}>{refCount>=3?(lg==="uz"?"🎉 Tabriklaymiz! Premium ochildi!":"🎉 Premium unlocked!"):(lg==="uz"?"Yana "+(3-refCount)+" ta do'st = 1 oy Premium bepul":(3-refCount)+" more friends = 1 month free Premium")}</div>
        </div>
        <div style={{fontSize:11,color:th.t2,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Sizning taklif havolangiz":lg==="ru"?"Ваша ссылка":"Your invite link"}</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <div style={{flex:1,background:th.bg,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",fontSize:12,color:th.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>{(window.location.origin+"/?ref=")+(user?.id||"")}</div>
          <button onClick={()=>{const link=(window.location.origin+"/?ref=")+(user?.id||"");try{navigator.clipboard.writeText(link);ok$(lg==="uz"?"Havola nusxalandi!":"Link copied!");}catch(e){ok$(lg==="uz"?"Nusxalab bo'lmadi":"Copy failed","err");}}} style={{background:th.ac,border:"none",borderRadius:12,padding:"0 16px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,flexShrink:0}}>{lg==="uz"?"Nusxa":lg==="ru"?"Копир":"Copy"}</button>
        </div>
        <div style={{background:th.ac+"0a",border:"1px solid "+th.ac+"22",borderRadius:14,padding:"13px 14px",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👥 {lg==="uz"?"Do'stni taklif qilish":lg==="ru"?"Пригласить друга":"Invite a friend"}</div>
          <div style={{fontSize:10,color:th.t2,marginBottom:10}}>{lg==="uz"?"Faqat ilovaga taklif (alohida oila ochadi)":"App invite only (they create own family)"}</div>
          <button onClick={()=>{const link=(window.location.origin+"/?ref=")+(user?.id||"");const txt=(lg==="uz"?"Oila Hisobchi - oilaviy byudjet ilovasi! Men bilan qo'shiling: ":"Join me on Family Budget app: ")+link;const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(txt);window.open(url,"_blank");}} style={{width:"100%",background:"#2196F3",border:"none",borderRadius:11,padding:"11px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{lg==="uz"?"Telegram orqali yuborish":"Send via Telegram"}
          </button>
        </div>
        {user?.rol==="bosh"&&<div style={{background:th.gr+"0a",border:"1px solid "+th.gr+"22",borderRadius:14,padding:"13px 14px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zosini taklif qilish":lg==="ru"?"Пригласить в семью":"Invite to family"}</div>
          <div style={{fontSize:10,color:th.t2,marginBottom:10}}>{lg==="uz"?"Oila kodi bilan — sizning oilangizga qo'shiladi":"With family code — joins your family"}</div>
          <div style={{background:th.bg,borderRadius:9,padding:"8px 12px",marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:th.t2}}>{lg==="uz"?"Oila kodi":"Family code"}</span>
            <span style={{fontSize:13,fontWeight:800,color:th.gr,fontFamily:"monospace",letterSpacing:1}}>{user?.oilaId}</span>
          </div>
          <button onClick={()=>{const code=user?.oilaId||"";const link=(window.location.origin+"/?ref=")+(user?.id||"")+"&fam="+code;const txt=(lg==="uz"?"Bizning oilamizga Oila Hisobchi ilovasida qo'shiling! Oila kodi: "+code+"\n":"Join our family on Oila Hisobchi! Family code: "+code+"\n")+link;const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(txt);window.open(url,"_blank");}} style={{width:"100%",background:th.gr,border:"none",borderRadius:11,padding:"11px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{lg==="uz"?"Oila kodi bilan yuborish":"Send with family code"}
          </button>
        </div>}
        <div style={{background:th.bg,borderRadius:14,padding:"14px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:10}}>{lg==="uz"?"Imtiyozlar":lg==="ru"?"Награды":"Rewards"}</div>
          {[{n:1,t:lg==="uz"?"1 do'st — 100 ball":"1 friend — 100 points"},{n:3,t:lg==="uz"?"3 do'st — 1 oy Premium":"3 friends — 1 month Premium"},{n:10,t:lg==="uz"?"10 do'st — 1 yil Premium":"10 friends — 1 year Premium"}].map(r=>(
            <div key={r.n} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:26,height:26,borderRadius:8,background:refCount>=r.n?th.gr+"22":th.bor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:refCount>=r.n?th.gr:th.t2,flexShrink:0}}>{refCount>=r.n?"✓":r.n}</div>
              <span style={{fontSize:12,color:refCount>=r.n?th.t1:th.t2,fontWeight:refCount>=r.n?600:400}}>{r.t}</span>
            </div>
          ))}
        </div>
        {refCount>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:th.t2,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Taklif qilinganlar":lg==="ru"?"Приглашённые":"Invited"} ({refCount})</div>
          <div style={{fontSize:12,color:th.t2}}>{lg==="uz"?refCount+" ta do'st qo'shildi. Rahmat!":refCount+" friends joined. Thanks!"}</div>
        </div>}
        <button onClick={()=>setShowReferral(false)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Yopish":lg==="ru"?"Закрыть":"Close"}</button>
      </div>
  );
}
