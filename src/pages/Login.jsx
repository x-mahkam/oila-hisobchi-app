import { useState } from "react";
import { KatIco, DarIco, MoneyInput, Tst } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { COUNTRIES, VALS, RELATIONS } from "../utils/constants.js";
import { td } from "../utils/formatters.js";

export default function LoginPage({
  th, STY, lg, setLg, dark, setDark,
  reg, setReg, kidLoginMode, setKidLoginMode, join, setJoin,
  fIsm, setFIsm, fEm, setFEm, fPw, setFPw,
  fON, setFON, fKd, setFKd, fTel, setFTel,
  fDial, setFDial, fCountry, setFCountry,
  showValDD, setShowValDD, fRel, setFRel,
  showCountryDD, setShowCountryDD, showRelDD, setShowRelDD,
  showPw, setShowPw, showResetScreen, setShowResetScreen,
  showResetConfirm, setShowResetConfirm, resetEmail, setResetEmail,
  resetInput, setResetInput, resetSent, setResetSent,
  fRefCode, setFRefCode, val, setVal,
  tst, ok$, doGoogleLogin, doAuth, sendResetEmail, handleResetPw,
  t, isPremium,
  setUser, setScr, setBoot, loadFam,
  switchAuthMode, genPassword,
}) {
  return (
    <div style={STY.pg}>
    <Tst msg={tst.msg} type={tst.type} th={th}/>
    <div style={{position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,"+th.ac+"1a,transparent 70%)",pointerEvents:"none"}}/>
    <div style={{padding:"50px 24px 40px",position:"relative"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:82,height:82,borderRadius:24,background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 14px 36px "+th.ac+"44"}}>{Ico.wallet("#fff")}</div>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.5}}>{lg==="uz"?<><span style={{color:th.ac}}>Oila</span><span style={{color:th.gr}}>Hisobchi</span></>:lg==="ru"?<><span style={{color:th.ac}}>Семейный</span><span style={{color:th.gr}}>Бюджет</span></>:<><span style={{color:th.ac}}>Family</span><span style={{color:th.gr}}>Budget</span></>}</div>
        <div style={{color:th.t2,fontSize:13,marginTop:5}}>{lg==="uz"?"Daromad \u00b7 Xarajat \u00b7 Maqsad \u00b7 Oila":lg==="ru"?"\u0414\u043e\u0445\u043e\u0434 \u00b7 \u0420\u0430\u0441\u0445\u043e\u0434 \u00b7 \u0426\u0435\u043b\u0438 \u00b7 \u0421\u0435\u043c\u044c\u044f":"Income \u00b7 Expense \u00b7 Goals \u00b7 Family"}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
        {["uz","ru","en"].map(l=><button key={l} onClick={()=>{setLg(l);localStorage.setItem("oilaV7L",l);}} style={{...STY.ch(lg===l),padding:"5px 12px"}}>{l.toUpperCase()}</button>)}
        <button onClick={()=>{setDark(v=>!v);localStorage.setItem("oilaV7D",String(!dark));}} style={{...STY.ch(true,th.t2),padding:"5px 12px",display:"flex",alignItems:"center",gap:4}}>{dark?Ico.sun(th.t2):Ico.moon(th.t2)}{dark?(lg==="uz"?"Kunduz":"Light"):(lg==="uz"?"Tungi":"Dark")}</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        <button onClick={()=>switchAuthMode(false,false)} style={{...STY.tb(!reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{lg==="uz"?"Kirish":lg==="ru"?"\u0412\u043e\u0439\u0442\u0438":"Login"}</button>
        <button onClick={()=>switchAuthMode(true,false)} style={{...STY.tb(reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{lg==="uz"?"Ro'yxat":lg==="ru"?"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f":"Register"}</button>
        <button onClick={()=>switchAuthMode(false,true)} style={{...STY.tb(kidLoginMode),fontSize:13,padding:"11px 6px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {lg==="uz"?"Bola":lg==="ru"?"\u0420\u0435\u0431\u0451\u043d\u043e\u043a":"Kid"}
        </button>
      </div>
      <div style={STY.cd}>
        {reg&&<><label style={STY.lb}>{lg==="uz"?"Ism familiya":lg==="ru"?"Имя и фамилия":"Full name"}</label><input style={STY.ip} value={fIsm} onChange={e=>setFIsm(e.target.value)} placeholder={lg==="uz"?"Ism familiyangiz":lg==="ru"?"Имя Фамилия":"First and last name"}/>
        <label style={STY.lb}>{lg==="uz"?"Davlat":lg==="ru"?"Страна":"Country"}</label>
        <div style={{position:"relative",marginBottom:12}}>
          <button onClick={()=>setShowCountryDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
            {(()=>{const sc=COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0];return <><span style={{fontSize:20}}>{sc.flag}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sc[lg]||sc.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===sc.val)||{}).b}</span><span style={{transform:showCountryDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span></>;})()}
          </button>
          {showCountryDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            {COUNTRIES.map(c=>(<button key={c.code} onClick={()=>{setFCountry(c.code);setShowCountryDD(false);}} style={{width:"100%",background:fCountry===c.code?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
              <span style={{fontSize:18}}>{c.flag}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fCountry===c.code?700:500,color:fCountry===c.code?th.ac:th.t1}}>{c[lg]||c.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===c.val)||{}).b}</span>{fCountry===c.code&&Ico.check(th.ac)}
            </button>))}
          </div>}
        </div>
        <label style={STY.lb}>{lg==="uz"?"Telefon raqami":lg==="ru"?"Номер телефона":"Phone number"}</label>
        <div style={{display:"flex",gap:8,marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 12px",flexShrink:0}}>
            <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).flag}</span>
            <span style={{fontSize:14,fontWeight:700,color:th.t1}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).dial}</span>
          </div>
          <input style={{...STY.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
        </div>
        {fRefCode&&<div style={{background:th.gr+"11",border:"1px solid "+th.gr+"33",borderRadius:11,padding:"10px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",color:th.gr}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 8c0-3.5-3.5-3.5-3.5-1.5s3.5 1.5 3.5 1.5 3.5.5 3.5-1.5S12 4.5 12 8z"/></svg>
          </span>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:th.gr}}>{lg==="uz"?"Taklif havolasi orqali":lg==="ru"?"По реферальной ссылке":"Via referral link"}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"Do'stingiz sizni taklif qildi":"Your friend invited you"}</div></div>
        </div>}</>}
        {/* BOLA KIRISHI: faqat login + parol */}
        {kidLoginMode&&<><div style={{textAlign:"center",marginBottom:14,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:54,height:54,borderRadius:16,background:th.ac+"14",color:th.ac,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Ota-onang bergan login va parolni yoz":lg==="ru"?"Введи логин от родителей":"Enter the login your parent gave you"}</div>
        </div>
        <label style={STY.lb}>{lg==="uz"?"Logining":"Your login"}</label>
        <input style={STY.ip} type="text" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())} placeholder="mohichehra25" autoFocus/></>}
        {/* ODDIY KIRISH: telefon */}
        {!reg&&!kidLoginMode&&<><label style={STY.lb}>{lg==="uz"?"Telefon raqami":lg==="ru"?"Номер телефона":"Phone number"}</label>
        <div style={{display:"flex",gap:8,marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:4,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 10px",flexShrink:0,width:96}}>
            <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.dial===fDial)||{flag:"🌐"}).flag}</span>
            <input style={{background:"none",border:"none",outline:"none",color:th.t1,fontSize:14,fontWeight:700,width:52}} type="tel" value={fDial} onChange={e=>{let v=e.target.value.replace(/[^0-9+]/g,"");if(!v.startsWith("+"))v="+"+v;setFDial(v);const c=COUNTRIES.find(x=>x.dial===v);if(c)setFCountry(c.code);}} placeholder="+998"/>
          </div>
          <input style={{...STY.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
        </div></>}
        {reg&&<><label style={STY.lb}>{lg==="uz"?"Email (parolni tiklash uchun)":lg==="ru"?"Email (для сброса пароля)":"Email (for password reset)"}</label>
        <input style={STY.ip} type="email" value={fEm} onChange={e=>setFEm(e.target.value)} placeholder="email@example.com"/></>}
        <label style={STY.lb}>{lg==="uz"?"Parol":"Password"}</label>
        <div style={{position:"relative",marginBottom:reg?14:4}}>
          <input style={{...STY.ip,marginBottom:0,paddingRight:reg?108:44}} type={showPw?"text":"password"} value={fPw} onChange={e=>setFPw(e.target.value)} placeholder={reg?(lg==="uz"?"Kamida 6 belgi":"Min 6 chars"):(lg==="uz"?"Parolingiz":"Password")}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:reg?64:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}} title={showPw?"Yashirish":"Ko'rsatish"}>{showPw?"🙈":"👁"}</button>
          {reg&&<button onClick={genPassword} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:8,cursor:"pointer",fontSize:11,padding:"5px 9px",color:th.ac,fontWeight:700}} title={lg==="uz"?"Parol yaratish":"Generate"}>🎲</button>}
        </div>
        {reg&&<>
          <div style={{display:"flex",gap:8,marginBottom:13}}>
            <button onClick={()=>setJoin(false)} style={STY.tb(!join)}>{lg==="uz"?"Yangi oila":"New family"}</button>
            <button onClick={()=>setJoin(true)} style={STY.tb(join)}>{lg==="uz"?"Qo'shilish":"Join"}</button>
          </div>
          {!join?<><label style={STY.lb}>{lg==="uz"?"Oila nomi":"Family name"}</label><input style={STY.ip} value={fON} onChange={e=>setFON(e.target.value)} placeholder={lg==="uz"?"Karimov oilasi":"Family name"}/></>
          :<><label style={STY.lb}>{lg==="uz"?"Oila kodi":"Family code"}</label><input style={STY.ip} value={fKd} onChange={e=>setFKd(e.target.value)} placeholder={lg==="uz"?"Bosh a'zodan oling":"Get from head member"}/><div style={{background:th.ac+"11",borderRadius:11,padding:11,marginBottom:11,fontSize:12,color:th.t2}}>{lg==="uz"?"Kodni Profil > Shaxsiy ma'lumotlar bo'limida toping":"Find code in Profile > Personal info"}</div>
          <label style={STY.lb}>{lg==="uz"?"Oila boshiga kim bo'lasiz?":lg==="ru"?"Кем вы приходитесь главе?":"Your relation to head"}</label>
          <div style={{position:"relative",marginBottom:11}}>
            <button onClick={()=>setShowRelDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
              {(()=>{const sr=RELATIONS.find(r=>r.id===fRel);return sr?<><span style={{fontSize:20}}>{sr.emoji}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sr[lg]||sr.uz}</span></>:<span style={{flex:1,textAlign:"left",color:th.t2}}>{lg==="uz"?"Tanlang...":lg==="ru"?"Выберите...":"Select..."}</span>;})()}
              <span style={{transform:showRelDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span>
            </button>
            {showRelDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
              {RELATIONS.map(r=>(<button key={r.id} onClick={()=>{setFRel(r.id);setShowRelDD(false);}} style={{width:"100%",background:fRel===r.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
                <span style={{fontSize:18}}>{r.emoji}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fRel===r.id?700:500,color:fRel===r.id?th.ac:th.t1}}>{r[lg]||r.uz}</span>{fRel===r.id&&Ico.check(th.ac)}
              </button>))}
            </div>}
          </div></>}
        </>}
        <button onClick={doAuth} style={STY.bt()}>{kidLoginMode?(lg==="uz"?"👶 Kirish":"👶 Login"):reg?(lg==="uz"?"Ro'yxatdan o'tish":"Register"):(lg==="uz"?"Kirish":"Login")}</button>
        {!kidLoginMode&&<div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 4px"}}>
          <div style={{flex:1,height:1,background:th.bor}}/>
          <span style={{fontSize:12,color:th.t2,whiteSpace:"nowrap"}}>{lg==="uz"?"yoki":"или / or"}</span>
          <div style={{flex:1,height:1,background:th.bor}}/>
        </div>}
        {!kidLoginMode&&<button onClick={doGoogleLogin} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid "+th.bor,background:th.surH,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          <span style={{fontSize:15,fontWeight:600,color:th.t1}}>{lg==="uz"?"Google bilan kirish":lg==="ru"?"Войти через Google":"Continue with Google"}</span>
        </button>}
        {!reg&&!kidLoginMode&&<button onClick={handleResetPw} style={{background:"none",border:"none",color:th.ac,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:14,width:"100%",textAlign:"center",padding:"6px"}}>{lg==="uz"?"Parolni unutdingizmi?":lg==="ru"?"Забыли пароль?":"Forgot password?"}</button>}
      </div>
    </div>
    {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
      <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
        {!resetSent?<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
          <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Parolni tiklash":lg==="ru"?"Сброс пароля":"Reset password"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"Ro'yxatdan o'tgan emailingizni kiriting. Tiklash havolasini yuboramiz.":"Enter your registered email."}</div>
          <label style={STY.lb}>Email</label>
          <input style={STY.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
          <button onClick={sendResetEmail} style={{...STY.bt(),marginTop:6,marginBottom:10}}>{lg==="uz"?"Tiklash xatini yuborish":lg==="ru"?"Отправить":"Send reset link"}</button>
          <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{lg==="uz"?"Bekor qilish":"Cancel"}</button>
        </>:<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
          <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Xat yuborildi!":"Email sent!"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{lg==="uz"?"Parolni tiklash havolasi yuborildi:":"Reset link sent to:"}</div>
          <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
          <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"📌 Pochtangizni oching va havolani bosing. Ko'rinmasa, Spam papkasini tekshiring.":"Check inbox and Spam."}</div>
          <button onClick={()=>setShowResetScreen(false)} style={{...STY.bt(),marginBottom:0}}>{lg==="uz"?"Tushunarli":"Got it"}</button>
        </>}
      </div>
    </div>}
  </div>);
}