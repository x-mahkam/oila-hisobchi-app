import { useMemo } from "react";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { f } from "../utils/formatters.js";

export default function TasksPage({
  user, azolar, vazifalar, kidBalances,
  lg, isKid, th, t,
  buzz,
  setShowAddVazifa,
  vazifaDone, vazifaApprove, vazifaReject, delVazifa,
}) {
  const STY = useMemo(() => makeS(th), [th]);

  return (
    <div>
        {/* BOLA BALANSI (faqat bola yoki tanlangan) */}
        {isKid&&<div className="anim-fadeUp" style={{background:"linear-gradient(135deg,#f59e0b 0%,#ec4899 60%,#8b5cf6 100%)",borderRadius:24,padding:"22px 20px",marginBottom:18,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px #f59e0b40"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",marginBottom:4}}>{lg==="uz"?"Mening cho'ntak pulim":lg==="ru"?"Мои карманные":"My pocket money"}</div>
            <div style={{fontSize:32,fontWeight:800,color:"#fff",marginBottom:6}}>{f(kidBalances[user.id]||0,true)}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>🏆 {vazifalar.filter(v=>v.assignedTo===user.id&&v.status==="approved").length} {lg==="uz"?"ta vazifa bajarildi":"tasks done"}</div>
          </div>
        </div>}
        {/* OTA-ONA: vazifa qo'shish tugmasi */}
        {!isKid&&<button onClick={()=>{buzz(10);setShowAddVazifa(true);}} style={{...STY.bt(),marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.add("#fff")}{lg==="uz"?"Yangi vazifa berish":lg==="ru"?"Новое задание":"New task"}</button>}
        {/* REYTING (leaderboard) - bolalar bor bo'lsa */}
        {(()=>{
          const kids=azolar.filter(a=>a.rol==="kid");
          if(kids.length===0)return null;
          const ranked=kids.map(k=>{
            const done=vazifalar.filter(v=>v.assignedTo===k.id&&v.status==="approved").length;
            return {...k,done,ball:done*10,bal:kidBalances[k.id]||0};
          }).sort((a,b)=>b.ball-a.ball);
          const medals=["🥇","🥈","🥉"];
          return <div style={{...STY.cd,marginBottom:16,background:"linear-gradient(135deg,#8b5cf60a,"+th.sur+")",border:"1px solid #8b5cf622"}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>🏆 {lg==="uz"?"Bolalar reytingi":lg==="ru"?"Рейтинг детей":"Kids leaderboard"}</div>
            {ranked.map((k,i)=>(
              <div key={k.id} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:i<ranked.length-1?"1px solid "+th.bor:"none"}}>
                <div style={{fontSize:20,width:28,textAlign:"center"}}>{medals[i]||(i+1)}</div>
                <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👶</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:th.t1}}>{k.ism}</div>
                  <div style={{fontSize:11,color:th.t2}}>🏆 {k.done} {lg==="uz"?"vazifa":"tasks"} · 💰 {f(k.bal,true)}</div>
                </div>
                <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:"#8b5cf6"}}>{k.ball}</div><div style={{fontSize:9,color:th.t2}}>{lg==="uz"?"ball":"pts"}</div></div>
              </div>
            ))}
          </div>;
        })()}
        {/* VAZIFALAR RO'YXATI */}
        {(()=>{
          const myTasks=isKid?vazifalar.filter(v=>v.assignedTo===user.id):vazifalar;
          if(myTasks.length===0)return <div style={{textAlign:"center",padding:"40px 20px",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:80,height:80,borderRadius:"50%",background:th.ac+"11",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:14}}>🎯</div><div style={{fontSize:16,fontWeight:700,color:th.t1,marginBottom:6}}>{isKid?(lg==="uz"?"Hali vazifa yo'q":"No tasks yet"):(lg==="uz"?"Hali vazifa bermadingiz":"No tasks created")}</div><div style={{fontSize:13,color:th.t2,maxWidth:240}}>{isKid?(lg==="uz"?"Ota-onangiz tez orada vazifa beradi":"Your parent will add tasks soon"):(lg==="uz"?"Bolalaringizga vazifa berib, ularni rag'batlantiring":"Add tasks to motivate your kids")}</div></div>;
          return myTasks.map(v=>{
            const kid=azolar.find(a=>a.id===v.assignedTo);
            const st=v.status;
            const stColor=st==="approved"?th.gr:st==="done"?th.am:th.ac;
            const stText=st==="approved"?(lg==="uz"?"Tasdiqlandi":"Approved"):st==="done"?(lg==="uz"?"Tekshirilmoqda":"Pending review"):(lg==="uz"?"Bajarilmagan":"To do");
            return <div key={v.id} className="anim-fadeUp" style={{background:th.sur,borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid "+th.bor,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:stColor}}/>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,borderRadius:13,background:stColor+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{v.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:2}}>{v.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:800,color:th.gr}}>+{f(v.reward,true)}</span>
                    {!isKid&&kid&&<span style={{fontSize:11,color:th.t2}}>👶 {kid.ism}</span>}
                    <span style={{fontSize:10,background:stColor+"18",color:stColor,borderRadius:6,padding:"2px 8px",fontWeight:700}}>{stText}</span>
                  </div>
                </div>
              </div>
              {/* HARAKATLAR */}
              <div style={{display:"flex",gap:8,marginTop:12}}>
                {isKid&&st==="pending"&&<button onClick={()=>vazifaDone(v.id)} style={{flex:1,background:th.ac,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Bajardim":"Done"}</button>}
                {isKid&&st==="done"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.am,fontWeight:600,padding:"10px"}}>⏳ {lg==="uz"?"Ota-ona tasdig'i kutilmoqda":"Awaiting approval"}</div>}
                {isKid&&st==="approved"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.gr,fontWeight:700,padding:"10px"}}>🎉 {lg==="uz"?"Mukofot olindi!":"Reward received!"}</div>}
                {!isKid&&st==="done"&&<><button onClick={()=>vazifaApprove(v.id)} style={{flex:2,background:th.gr,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Tasdiqlash":"Approve"}</button>{vazifaReject&&<button onClick={()=>vazifaReject(v.id)} style={{flex:1,background:th.am+"18",border:"1px solid "+th.am+"44",borderRadius:10,padding:"10px",color:th.am,cursor:"pointer",fontWeight:700,fontSize:13}}>↩</button>}</>}
                {!isKid&&st!=="done"&&<button onClick={()=>delVazifa(v.id)} style={{width:"100%",background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,padding:"9px",color:th.rd,cursor:"pointer",fontWeight:600,fontSize:12}}>{lg==="uz"?"O'chirish":"Delete"}</button>}
              </div>
            </div>;
          });
        })()}
    </div>
  );
}
