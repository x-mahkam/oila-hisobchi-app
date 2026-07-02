import { useMemo, useState, useEffect } from "react";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { f } from "../utils/formatters.js";

// Tayyor vazifalar to'plami — 4 ustunli grid uchun
const VAZIFA_PRESETS = [
  { id: "kitob",    e: "📚", uz: "Kitob o'qish",           en: "Reading" },
  { id: "xona",     e: "🧹", uz: "Xonani yig'ishtirish",   en: "Clean room" },
  { id: "idish",    e: "🍽️", uz: "Idish yuvish",     en: "Wash dishes" },
  { id: "dokon",    e: "🛒", uz: "Do'kondan xarid",        en: "Grocery run" },
  { id: "gul",      e: "🌱", uz: "Gullarni sug'orish",     en: "Water plants" },
  { id: "axlat",    e: "🚮", uz: "Axlatni chiqarish",      en: "Take out trash" },
  { id: "orin",     e: "🛏️", uz: "O'rinni yig'ish",  en: "Make the bed" },
  { id: "darslik",  e: "📝", uz: "Uy vazifasini bajarish", en: "Do homework" },
  { id: "kir",      e: "🧺", uz: "Kir yuvishga yordam",    en: "Laundry help" },
  { id: "ovqat",    e: "🍳", uz: "Ovqatga yordam",         en: "Help cooking" },
  { id: "sport",    e: "🚴", uz: "Sport qilish",           en: "Exercise" },
  { id: "musiqa",   e: "🎹", uz: "Musiqa mashqi",          en: "Music practice" },
  { id: "oyinchoq", e: "🧸", uz: "O'yinchoqlarni yig'ish", en: "Tidy toys" },
  { id: "hayvon",   e: "🐕", uz: "Hayvonga qarash",        en: "Pet care" },
  { id: "deraza",   e: "🪟", uz: "Deraza artish",          en: "Clean windows" },
  { id: "soz",      e: "🧠", uz: "Yangi so'z yodlash",     en: "Learn new words" },
  { id: "buvi",     e: "🤲", uz: "Kattalarga yordam",      en: "Help elders" },
  { id: "rasm",     e: "🎨", uz: "Rasm chizish",           en: "Drawing" },
  { id: "sayr",     e: "🏃", uz: "Toza havoda sayr",       en: "Outdoor walk" },
  { id: "boshqa",   e: "✨",     uz: "Boshqa",                 en: "Other" },
];

import { db } from "../firebase.js";

export default function TasksPage({
  user, azolar, vazifalar, kidBalances,
  setVazifalar, setKidBalances,
  lg, isKid, th, t,
  buzz, setScr,
  showAddVazifa, setShowAddVazifa,
  vTitle, setVTitle, vReward, setVReward, vAssignee, setVAssignee, vEmoji, setVEmoji,
  addVazifa,
  vazifaDone, vazifaApprove, vazifaReject, delVazifa,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const kids = azolar.filter(a => a.rol === "kid");
  const [selPreset, setSelPreset] = useState(null);
  const [vSyncing, setVSyncing] = useState(false);
  // Sahifa ochilganda vazifalar va cho'ntak balanslari bazadan qayta yuklanadi
  const reloadVazifa = async () => {
    if (!user?.oilaId) return;
    setVSyncing(true);
    try {
      const v = await db.g("vazifa_" + user.oilaId);
      if (Array.isArray(v)) setVazifalar(v);
      const kb = await db.g("kidbal_" + user.oilaId);
      if (kb && typeof kb === "object") setKidBalances(kb);
    } catch (e) { console.error("vazifa sync:", e); }
    setVSyncing(false);
  };
  useEffect(() => { reloadVazifa(); }, [user?.oilaId]); // eslint-disable-line
  useEffect(() => { if (showAddVazifa) { setSelPreset(null); if (kids.length === 1) setVAssignee(kids[0].id); } }, [showAddVazifa]); // eslint-disable-line

  return (
    <div>
      {/* ── Sarlavha + orqaga ── */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <button onClick={() => { buzz(8); setScr("bosh"); }} style={{ width:38, height:38, borderRadius:11, background:th.surH, border:"1px solid "+th.bor, color:th.t1, cursor:"pointer", fontSize:16, fontWeight:800, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{"\u2190"}</button>
        <div style={{ flex:1, fontSize:16, fontWeight:800, color:th.t1 }}>{"\ud83d\udccb"} {lg==="uz"?"Farzand vazifalari":"Kids' tasks"}</div>
        <button onClick={() => { buzz(6); reloadVazifa(); }} style={{ width:38, height:38, borderRadius:11, background:th.surH, border:"1px solid "+th.bor, color:th.t1, cursor:"pointer", fontSize:15, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", opacity: vSyncing ? 0.5 : 1 }}>{"\ud83d\udd04"}</button>
      </div>

      {/* ── Vazifa qo'shish oynasi ── */}
      {showAddVazifa && !isKid && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:th.bg, zIndex:1000, display:"flex", justifyContent:"center", overflowY:"auto" }}>
          <div style={{ maxWidth:480, width:"100%", padding:"16px 18px calc(30px + env(safe-area-inset-bottom))" }}>
            {/* Sarlavha + yopish */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={() => { setShowAddVazifa(false); setSelPreset(null); }} style={{ width:38, height:38, borderRadius:11, background:th.surH, border:"1px solid "+th.bor, color:th.t1, cursor:"pointer", fontSize:16, fontWeight:800, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{"\u2190"}</button>
              <div style={{ flex:1, fontSize:17, fontWeight:800, color:th.t1 }}>{"\ud83d\udccb"} {lg==="uz"?"Yangi vazifa berish":"Add new task"}</div>
            </div>

            {/* Kim uchun */}
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Kim uchun?":"For whom?"}</label>
            {kids.length === 0
              ? <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:12, color:th.am }}>{"\u26A0\uFE0F"} {lg==="uz"?"Avval bola akkaunti yarating (Profil \u2192 Bola akkaunti qo'shish)":"Create a kid account first"}</div>
              : <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
                  {kids.map(k => (
                    <button key={k.id} onClick={() => setVAssignee(k.id)} style={{ flexShrink:0, background:vAssignee===k.id?th.ac+"18":th.surH, border:"2px solid "+(vAssignee===k.id?th.ac:th.bor), borderRadius:14, padding:"10px 16px", cursor:"pointer", color:vAssignee===k.id?th.ac:th.t2, fontWeight:700, fontSize:13 }}>{"\ud83d\udc76"} {k.ism}</button>
                  ))}
                </div>
            }

            {/* Vazifa tanlash — 4 ustunli grid */}
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifani tanlang":"Choose a task"}</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:14 }}>
              {VAZIFA_PRESETS.map(p => {
                const active = selPreset === p.id;
                return (
                  <button key={p.id} onClick={() => {
                    setSelPreset(p.id); setVEmoji(p.e);
                    if (p.id === "boshqa") setVTitle("");
                    else setVTitle(lg === "uz" ? p.uz : p.en);
                  }} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", gap:5,
                    background: active ? th.ac+"1c" : th.surH,
                    border:"2px solid "+(active ? th.ac : th.bor),
                    borderRadius:13, padding:"10px 4px 8px", cursor:"pointer", minHeight:74,
                  }}>
                    <span style={{ fontSize:24, lineHeight:1 }}>{p.e}</span>
                    <span style={{ fontSize:9.5, fontWeight:700, color: active ? th.ac : th.t2, textAlign:"center", lineHeight:1.25 }}>{lg==="uz"?p.uz:p.en}</span>
                  </button>
                );
              })}
            </div>

            {/* "Boshqa" tanlansa — nom yoziladi; aks holda nom avtomatik */}
            {selPreset === "boshqa" && (
              <>
                <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa nomi":"Task title"}</label>
                <input style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} value={vTitle} onChange={e => setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Velosipedni tozalash":"e.g. Clean the bike"} autoFocus />
              </>
            )}
            {selPreset && selPreset !== "boshqa" && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:th.ac+"0f", border:"1px solid "+th.ac+"33", borderRadius:12, padding:"10px 14px", marginBottom:14 }}>
                <span style={{ fontSize:18 }}>{vEmoji}</span>
                <span style={{ fontSize:13, fontWeight:700, color:th.t1, flex:1 }}>{vTitle}</span>
                <span style={{ fontSize:11, color:th.gr, fontWeight:700 }}>{"\u2713"}</span>
              </div>
            )}

            {/* Mukofot summasi */}
            {selPreset && (
              <>
                <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Mukofot (so'm)":"Reward (UZS)"}</label>
                <input type="number" inputMode="numeric" style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:20, fontWeight:800, textAlign:"center", outline:"none", boxSizing:"border-box", marginBottom:10 }} value={vReward} onChange={e => setVReward(e.target.value)} placeholder="0" />
                <div style={{ display:"flex", gap:7, marginBottom:18 }}>
                  {[5000, 10000, 20000, 50000].map(sm => (
                    <button key={sm} onClick={() => setVReward(String(sm))} style={{ flex:1, background: String(vReward)===String(sm) ? th.ac+"22" : th.surH, border:"1.5px solid "+(String(vReward)===String(sm) ? th.ac : th.bor), borderRadius:10, padding:"8px 0", cursor:"pointer", fontSize:11, fontWeight:700, color: String(vReward)===String(sm) ? th.ac : th.t2 }}>{f(sm, true)}</button>
                  ))}
                </div>
                <button onClick={addVazifa} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"15px", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer" }}>{lg==="uz"?"Vazifa berish \ud83c\udfaf":"Assign task \ud83c\udfaf"}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Bola balansi ── */}
      {isKid && (
        <div className="anim-fadeUp" style={{background:"linear-gradient(135deg,#f59e0b 0%,#ec4899 60%,#8b5cf6 100%)",borderRadius:24,padding:"22px 20px",marginBottom:18,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px #f59e0b40"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",marginBottom:4}}>{lg==="uz"?"Mening cho'ntak pulim":"My pocket money"}</div>
            <div style={{fontSize:32,fontWeight:800,color:"#fff",marginBottom:6}}>{f(kidBalances[user.id]||0,true)}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>🏆 {vazifalar.filter(v=>(v.assignedTo===user.id||(v.assignedLogin&&user.login&&v.assignedLogin===user.login))&&v.status==="approved").length} {lg==="uz"?"ta vazifa bajarildi":"tasks done"}</div>
          </div>
        </div>
      )}

      {/* ── Ota-ona: vazifa qo'shish tugmasi ── */}
      {!isKid && (
        <button onClick={() => { buzz(10); setShowAddVazifa(true); }} style={{...STY.bt(), marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          {Ico.add("#fff")}{lg==="uz"?"Yangi vazifa berish":"New task"}
        </button>
      )}

      {/* ── Bolalar reytingi ── */}
      {kids.length > 0 && (
        <div style={{...STY.cd, marginBottom:16, background:"linear-gradient(135deg,#8b5cf60a,"+th.sur+")", border:"1px solid #8b5cf622"}}>
          <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>🏆 {lg==="uz"?"Bolalar reytingi":"Kids leaderboard"}</div>
          {kids.map((k, i) => {
            const done = vazifalar.filter(v=>(v.assignedTo===k.id||(v.assignedLogin&&k.login&&v.assignedLogin===k.login))&&v.status==="approved").length;
            const bal = kidBalances[k.id]||0;
            const medals = ["🥇","🥈","🥉"];
            return (
              <div key={k.id} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:i<kids.length-1?"1px solid "+th.bor:"none"}}>
                <div style={{fontSize:20,width:28,textAlign:"center"}}>{medals[i]||(i+1)}</div>
                <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👶</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:th.t1}}>{k.ism}</div>
                  <div style={{fontSize:11,color:th.t2}}>🏆 {done} {lg==="uz"?"vazifa":"tasks"} · 💰 {f(bal,true)}</div>
                </div>
                <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:"#8b5cf6"}}>{done*10}</div><div style={{fontSize:9,color:th.t2}}>{lg==="uz"?"ball":"pts"}</div></div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Vazifalar ro'yxati ── */}
      {(() => {
        const myTasks = isKid ? vazifalar.filter(v=>v.assignedTo===user.id||(v.assignedLogin&&user.login&&v.assignedLogin===user.login)) : vazifalar;
        if (myTasks.length === 0) return (
          <div style={{textAlign:"center",padding:"40px 20px",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:th.ac+"11",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:14}}>🎯</div>
            <div style={{fontSize:16,fontWeight:700,color:th.t1,marginBottom:6}}>{isKid?(lg==="uz"?"Hali vazifa yo'q":"No tasks yet"):(lg==="uz"?"Hali vazifa bermadingiz":"No tasks created")}</div>
            <div style={{fontSize:13,color:th.t2,maxWidth:240}}>{isKid?(lg==="uz"?"Ota-onangiz tez orada vazifa beradi":"Your parent will add tasks soon"):(lg==="uz"?"Bolalaringizga vazifa berib, ularni rag'batlantiring":"Add tasks to motivate your kids")}</div>
          </div>
        );
        return myTasks.map(v => {
          const kid = azolar.find(a=>a.id===v.assignedTo);
          const st = v.status;
          const stColor = st==="approved"?th.gr:st==="done"?th.am:th.ac;
          const stText = st==="approved"?(lg==="uz"?"Tasdiqlandi":"Approved"):st==="done"?(lg==="uz"?"Tekshirilmoqda":"Pending review"):(lg==="uz"?"Bajarilmagan":"To do");
          return (
            <div key={v.id} className="anim-fadeUp" style={{background:th.sur,borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid "+th.bor,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:stColor}}/>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,borderRadius:13,background:stColor+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{v.emoji||"📋"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:2}}>{v.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:800,color:th.gr}}>+{f(v.reward,true)}</span>
                    {!isKid&&kid&&<span style={{fontSize:11,color:th.t2}}>👶 {kid.ism}</span>}
                    <span style={{fontSize:10,background:stColor+"18",color:stColor,borderRadius:6,padding:"2px 8px",fontWeight:700}}>{stText}</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                {isKid&&st==="pending"&&<button onClick={()=>vazifaDone(v.id)} style={{flex:1,background:th.ac,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Bajardim":"Done"}</button>}
                {isKid&&st==="done"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.am,fontWeight:600,padding:"10px"}}>⏳ {lg==="uz"?"Ota-ona tasdig'i kutilmoqda":"Awaiting approval"}</div>}
                {isKid&&st==="approved"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.gr,fontWeight:700,padding:"10px"}}>🎉 {lg==="uz"?"Mukofot olindi!":"Reward received!"}</div>}
                {!isKid&&st==="done"&&(
                  <>
                    <button onClick={()=>vazifaApprove(v.id)} style={{flex:2,background:th.gr,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Tasdiqlash":"Approve"}</button>
                    {vazifaReject&&<button onClick={()=>vazifaReject(v.id)} style={{flex:1,background:th.am+"18",border:"1px solid "+th.am+"44",borderRadius:10,padding:"10px",color:th.am,cursor:"pointer",fontWeight:700,fontSize:13}}>↩</button>}
                  </>
                )}
                {!isKid&&st!=="done"&&<button onClick={()=>delVazifa(v.id)} style={{width:"100%",background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,padding:"9px",color:th.rd,cursor:"pointer",fontWeight:600,fontSize:12}}>{lg==="uz"?"O'chirish":"Delete"}</button>}
              </div>
            </div>
          );
        });
      })()}
    </div>
  );
}
