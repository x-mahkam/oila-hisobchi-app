import{useState,useEffect,useRef,useCallback,useMemo}from"react";
import{db}from"../firebase.js";
import{LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid}from"recharts";

export default function GoalsPage(p){
  const {user,oila,azolar,xar,dar,maq,qarzlar,vazifalar,kidBalances,notifs,qarzReqs,xReqs,rates,stars,gardenData,setXar,setDar,setMaq,setQarzlar,setVazifalar,setKidBalances,setNotifs,setStars,dark,lg,val,setScr,scr,isPremium,isKid,isBosh,hasKids,isAdmin,th,S,Ico,t,f,ok$,buzz,td,nt,addStar,addNotif,fireConfetti,showS,setSrch,srch,showPremModal,setShowPremModal,activatePremium,addM,setAddM,maqTab,setMaqTab,tupId,setTupId,tupS,setTupS,addMq,tupMq,delMq,editMq,setEditMq,editMqN,setEditMqN,editMqS,setEditMqS,saveEditMq,maqsadConfirmNotif,setMaqsadConfirmNotif,confirmMaqBought,cancelMaqReturn,showAddVazifa,setShowAddVazifa,showGift,setShowGift,giftSum,setGiftSum,giftFrom,setGiftFrom,vTitle,setVTitle,vReward,setVReward,vAssignee,setVAssignee,vEmoji,setVEmoji,addVazifa,vazifaDone,vazifaApprove,vazifaReject,delVazifa,showAddQarz,setShowAddQarz,qarzTur,setQarzTur,qarzKim,setQarzKim,qarzSum,setQarzSum,qarzIzoh,setQarzIzoh,qarzSana,setQarzSana,qarzQaytSana,setQarzQaytSana,qarzTel,setQarzTel,qarzLinked,setQarzLinked,addQarz,payQarz,delQarz,partialQarz,setPartialQarz,partialSum,setPartialSum,applyPartial,qarzDonePrompt,setQarzDonePrompt,addQarzAsDaromad,addQarzAsXarajat,inviteQarz,setInviteQarz,acceptQarzReq,rejectQarzReq,verifyTilxat,setVerifyTilxat,generateTilxat,xForMember,setXForMember,xMode,setXMode,xReqAccept,xReqReject,quickItem,setQuickItem,quickSum,setQuickSum,hisFil,setHisFil,ctab,setCtab,adv,setAdv,advL,setAdvL,exportLoading,exportPDF,exportExcel,getAIAdvice,showImport,setShowImport,importRows,setImportRows,importStep,setImportStep,importFileRef,handleImport,confirmImport,pTab,setPTab,edN,setEdN,newN,setNewN,fBj,setFBj,fKL,setFKL,faqO,setFaqO,pinStep,setPinStep,pinVal,setPinVal,pinCfm,setPinCfm,finger,setFinger,showBilim,setShowBilim,showAddKid,setShowAddKid,kidName,setKidName,kidLogin,setKidLogin,kidPw,setKidPw,addKidAccount,showReferral,setShowReferral,refCount,fbRating,setFbRating,fbText,setFbText,fbType,setFbType,fbSending,sendFeedback,adminStats,adminLoad,loadAdminStats,waterGarden,gardenData:_gd,gardenData2,addStar:_as,activatePremium:_ap,logout,saveProfile,fRef,doPhoto,rates:_r,rateL,fetchRates,notifEnabled,setNotifEnabled,notifTime,setNotifTime,APP_VER,showGardenInfo,setShowGardenInfo,setGardenData,VAZIFA_PRESETS,GOAL_PRESETS,KID_GOAL_PRESETS,KATS,KN,DARS,DN,VALS,COUNTRIES,RELATIONS,TL,Av,MoneyInput,KatIco,DarIco,Spark,Heat,BH,SL,TxRow,Tst,fmtN,normTel,sonSoz,spc,QUICK_ADD,ADMIN_TEL,fS,setFS,fK,setFK,fIz,setFIz,fSn,setFSn,fRp,setFRp,fDS,setFDS,fDT,setFDT,fDI,setFDI,addX,addD,mN,setMN,mS,setMS,mR,setMR,voiceOn,voiceText,voiceParsed,showVoice,setShowVoice,startVoice,stopVoice,applyVoice,showScanner,setShowScanner,scanMsg,startScanner,stopScanner,showQrPick,setShowQrPick,qrRawText,setQrRawText,showResetScreen,setShowResetScreen,resetInput,setResetInput,resetSent,setResetSent,sendResetEmail,resetEmail,setResetEmail,showResetConfirm,setShowResetConfirm}=p;

  return(
    <>
      {scr==="maqsad"&&<div>
        <div style={{...S.row,marginBottom:12}}>
          <div style={{fontSize:16,fontWeight:700,color:th.t1}}>{isKid?(lg==="uz"?"🌟 Orzularim":lg==="ru"?"🌟 Мои мечты":"🌟 My dreams"):t.goal}</div>
          {maqTab==="mine"&&<button onClick={()=>setAddM(v=>!v)} style={{background:th.ac,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:5,boxShadow:"0 4px 12px "+th.ac+"44"}}>{Ico.add("#fff")}</button>}
        </div>
        {!isKid&&<div style={{display:"flex",background:th.bg,borderRadius:14,padding:3,marginBottom:14,gap:3}}>
          <button onClick={()=>setMaqTab("mine")} style={{flex:1,padding:"10px",borderRadius:11,border:"none",background:maqTab==="mine"?th.sur:"transparent",color:maqTab==="mine"?th.t1:th.t2,fontWeight:maqTab==="mine"?800:500,fontSize:13,cursor:"pointer",boxShadow:maqTab==="mine"?"0 2px 8px rgba(0,0,0,0.1)":"none",transition:"all .2s"}}>
            🎯 {lg==="uz"?"O'zimning":lg==="ru"?"Мои цели":"My goals"}
          </button>
          <button onClick={()=>setMaqTab("oila")} style={{flex:1,padding:"10px",borderRadius:11,border:"none",background:maqTab==="oila"?th.sur:"transparent",color:maqTab==="oila"?th.t1:th.t2,fontWeight:maqTab==="oila"?800:500,fontSize:13,cursor:"pointer",boxShadow:maqTab==="oila"?"0 2px 8px rgba(0,0,0,0.1)":"none",transition:"all .2s"}}>
            👨‍👩‍👧 {lg==="uz"?"Oilamning":lg==="ru"?"Семейные":"Family goals"}
          </button>
        </div>}
        {addM&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:13}}>{lg==="uz"?"Yangi maqsad":"New goal"}</div>
          <label style={S.lb}>{lg==="uz"?"Tayyor maqsadlar":lg==="ru"?"Готовые цели":"Quick presets"}</label>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
            {(isKid?KID_GOAL_PRESETS:GOAL_PRESETS).map((p,i)=>(
              <button key={i} onClick={()=>{setMN(p[lg]||p.uz);setMR(p.rang);}} style={{flexShrink:0,background:mN===(p[lg]||p.uz)?p.rang+"18":th.bg,border:"1.5px solid "+(mN===(p[lg]||p.uz)?p.rang:th.bor),borderRadius:12,padding:"10px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:78}}>
                <span style={{fontSize:24}}>{p.emoji}</span>
                <span style={{fontSize:10,color:mN===(p[lg]||p.uz)?p.rang:th.t2,fontWeight:600,textAlign:"center",lineHeight:1.2}}>{p[lg]||p.uz}</span>
              </button>
            ))}
          </div>
          <label style={S.lb}>{lg==="uz"?"Maqsad nomi":"Goal name"}</label><input style={S.ip} value={mN} onChange={e=>setMN(e.target.value)} placeholder={lg==="uz"?"Yoki o'zingiz yozing...":"Or write your own..."}/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label><MoneyInput style={S.ip} value={mS} onChange={setMS} placeholder="5 000 000"/>
          {mS&&Number(mS)>0&&<div style={{background:"linear-gradient(135deg,"+th.ac+"11,"+th.ac2+"08)",border:"1px solid "+th.ac+"33",borderRadius:13,padding:"13px 15px",marginBottom:13}}>
            <div style={{fontSize:11,color:th.ac,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>💡 {lg==="uz"?"Avtomatik hisob":lg==="ru"?"Авторасчёт":"Auto calculation"}</div>
            {[{m:6,l:lg==="uz"?"6 oyda":"6 months"},{m:12,l:lg==="uz"?"12 oyda":"12 months"},{m:24,l:lg==="uz"?"24 oyda":"24 months"}].map(opt=>{
              const perMonth=Math.ceil(Number(mS)/opt.m);
              return <div key={opt.m} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{color:th.t2}}>{opt.l}:</span>
                <span style={{color:th.t1,fontWeight:700}}>{f(perMonth,true)}/{lg==="uz"?"oy":lg==="ru"?"мес":"mo"}</span>
              </div>;
            })}
            <div style={{fontSize:11,color:th.t2,marginTop:8,paddingTop:8,borderTop:"1px solid "+th.bor}}>{lg==="uz"?"Har oy ajratsangiz, shu muddatda yig'asiz":lg==="ru"?"Откладывая ежемесячно, накопите за этот срок":"Save monthly to reach your goal"}</div>
          </div>}
          <label style={S.lb}>{lg==="uz"?"Rang":"Color"}</label>
          <div style={{display:"flex",gap:8,marginBottom:13}}>{[th.gr,th.ac,"#f59e0b","#8b5cf6",th.rd,"#06b6d4"].map(r=><button key={r} onClick={()=>setMR(r)} style={{width:32,height:32,borderRadius:"50%",background:r,border:mR===r?"3px solid "+th.t1:"3px solid transparent",cursor:"pointer",flexShrink:0}}/>)}</div>
          <button onClick={addMq} style={S.bt()}>{t.sv}</button>
        </div>}
        {tupId&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:th.t1}}>{t.tp}</div>
          <MoneyInput autoFocus style={S.ip} value={tupS} onChange={setTupS} placeholder="..."/>
          <div style={{display:"flex",gap:8}}><button onClick={tupMq} style={{...S.bt(),marginBottom:0,flex:1}}>{t.am}</button><button onClick={()=>setTupId(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:14,color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button></div>
        </div>}
        {editMq&&<div style={{...S.cd,border:"1.5px solid "+th.am+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:th.am}}>{lg==="uz"?"Maqsadni tahrirlash":lg==="ru"?"Редактировать цель":"Edit goal"}</div>
          <label style={S.lb}>{lg==="uz"?"Maqsad nomi":"Goal name"}</label>
          <input style={S.ip} value={editMqN} onChange={e=>setEditMqN(e.target.value)} placeholder="..."/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
          <MoneyInput style={S.ip} value={editMqS} onChange={setEditMqS} placeholder="..."/>
          <div style={{display:"flex",gap:8}}><button onClick={saveEditMq} style={{...S.bt(),marginBottom:0,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{Ico.check("#fff")}{t.sv}</button><button onClick={()=>setEditMq(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:14,color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button></div>
        </div>}
        {(()=>{
          const filteredMaq = isKid ? maq :
            maqTab==="mine" ? maq.filter(m=>m.uid===user.id||!m.uid) :
            maq.filter(m=>m.uid&&m.uid!==user.id);
          if(filteredMaq.length===0&&!addM)return <div style={{textAlign:"center",padding:"44px 0",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <div style={{fontSize:48}}>🎯</div>
            <span>{maqTab==="oila"?(lg==="uz"?"Oila a'zolari hali maqsad qo'shmagan":"No family goals yet"):(lg==="uz"?"Maqsad qo'shing":"Add a goal")}</span>
          </div>;
          return filteredMaq.map(m=>{
          const p=Math.round(m.jamg/m.maqsad*100);
          return <div key={m.id} style={{...S.cd,marginBottom:10}}>
            <div style={{...S.row,alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontWeight:700,fontSize:15,color:th.t1}}>{m.ism}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{f(m.jamg,true)} / {f(m.maqsad,true)}</div></div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:18,fontWeight:800,color:m.rang}}>{p}%</span><button onClick={()=>{setEditMq(m.id);setEditMqN(m.ism);setEditMqS(String(m.maqsad));}} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>{Ico.edit(th.t2)}</button><button onClick={()=>delMq(m.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>{Ico.trash(th.t2)}</button></div>
            </div>
            <div style={{background:th.bg,borderRadius:10,height:14,overflow:"hidden",marginBottom:10}}><div style={{width:p+"%",height:"100%",background:"linear-gradient(90deg,"+m.rang+"88,"+m.rang+")",borderRadius:10,transition:"width .7s"}}/></div>
            {m.createdAt&&<div style={{fontSize:11,color:th.t2,marginBottom:4}}>📅 {lg==="uz"?"Boshlangan":"Started"}: {m.createdAt}</div>}
            {p<100&&(()=>{const remain=m.maqsad-m.jamg;const perMonth=Math.ceil(m.maqsad/12);const monthsLeft=Math.ceil(remain/perMonth);return <div style={{background:m.rang+"0d",borderRadius:9,padding:"8px 11px",marginBottom:10,fontSize:11,color:th.t2,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>💡</span><span>{lg==="uz"?"Har oy "+f(perMonth,true)+" ajratsangiz, ~"+monthsLeft+" oyda yig'asiz":lg==="ru"?"Откладывая "+f(perMonth,true)+"/мес, накопите за ~"+monthsLeft+" мес":"Save "+f(perMonth,true)+"/mo to reach in ~"+monthsLeft+" months"}</span></div>;})()}
            {p>=100?<div style={{textAlign:"center"}}>
                      <div style={{color:m.rang,fontWeight:700,fontSize:13,marginBottom:8}}>{t.ach} 🎉</div>
                      {(m.createdAt||m.completedAt)&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
                        {m.createdAt&&<span style={{fontSize:11,color:th.t2,background:th.bg,borderRadius:8,padding:"3px 8px"}}>📅 {lg==="uz"?"Boshlangan":"Started"}: {m.createdAt}</span>}
                        {m.createdAt&&m.completedAt&&<span style={{fontSize:11,color:th.t2}}>—</span>}
                        {m.completedAt&&<span style={{fontSize:11,color:m.rang,fontWeight:700,background:m.rang+"15",borderRadius:8,padding:"3px 8px"}}>🏆 {lg==="uz"?"Erishilgan":"Achieved"}: {m.completedAt?.slice(0,10)}</span>}
                      </div>}
                      {m.status==="waiting_parent"&&<div style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginTop:4}}>⏳ {lg==="uz"?"Ota-ona tasdiqlashi kutilmoqda":"Waiting for parent"}</div>}
                      {m.status==="parent_confirmed"&&<div style={{fontSize:12,color:"#22c55e",fontWeight:600,marginTop:4}}>✅ {lg==="uz"?"Ota-ona tasdiqladi! Siz ham tasdiqlang":"Parent confirmed! Confirm yours too"}</div>}
                    </div>:<div style={{...S.row}}><span style={{fontSize:11,color:th.t2}}>{t.rem}: {f(m.maqsad-m.jamg,true)}</span><button onClick={()=>{setTupId(m.id);setTupS("");}} style={{background:m.rang+"18",border:"1px solid "+m.rang+"44",borderRadius:9,padding:"5px 12px",color:m.rang,cursor:"pointer",fontWeight:700,fontSize:12}}>{t.am}</button></div>}
          </div>;
        })})()}
      </div>}
      </div>
    </>
  );
}
