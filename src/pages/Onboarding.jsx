import { ONB_SLIDES } from "../utils/constants.js";

export default function OnboardingPage({ th, lg, setLg, dark, onbStep, setOnbStep }) {
  const s = ONB_SLIDES[onbStep];
  if (!s) return null;
  const finish = () => { try { localStorage.setItem("oilaV7Onb","1"); } catch {} setOnbStep(-1); };
  



    return (
    <div style={{...STY.pg,minHeight:"100vh",display:"flex",flexDirection:"column",background:dark?"#0f172a":"#f8fafc"}}>
      <div style={{position:"fixed",top:-100,left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,"+s.color+"22,transparent 70%)",pointerEvents:"none",transition:"background .5s"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",gap:6}}>
          {["uz","ru","en"].map(l=><button key={l} onClick={()=>{setLg(l);localStorage.setItem("oilaV7L",l);}} style={{background:lg===l?th.ac+"18":"transparent",border:"1px solid "+(lg===l?th.ac:th.bor),borderRadius:8,padding:"4px 10px",color:lg===l?th.ac:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{l.toUpperCase()}</button>)}
        </div>
        <button onClick={finish} style={{background:"none",border:"none",color:th.t2,cursor:"pointer",fontSize:14,fontWeight:600}}>{lg==="uz"?"O'tkazib yuborish":lg==="ru"?"\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c":"Skip"}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 32px",position:"relative",zIndex:2,textAlign:"center"}}>
        <div className="anim-float" style={{width:160,height:160,borderRadius:"50%",background:"linear-gradient(135deg,"+s.color+"33,"+s.color+"0d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:84,marginBottom:40,boxShadow:"0 24px 70px "+s.color+"44",transition:"all .4s",border:"1px solid "+s.color+"22"}} key={"emoji"+onbStep}>{s.emoji}</div>
        <div className="anim-fadeUp" key={"t"+onbStep} style={{fontSize:29,fontWeight:800,color:th.t1,marginBottom:14,letterSpacing:"-0.5px"}}>{lg==="uz"?s.titleUz:lg==="ru"?s.titleRu:s.titleEn}</div>
        <div className="anim-fadeUp" key={"d"+onbStep} style={{fontSize:15,color:th.t2,lineHeight:1.65,maxWidth:320,animationDelay:".1s"}}>{lg==="uz"?s.descUz:lg==="ru"?s.descRu:s.descEn}</div>
      </div>
      <div style={{padding:"24px 32px 44px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
          {ONB_SLIDES.map((_,i)=>(<div key={i} style={{width:i===onbStep?28:8,height:8,borderRadius:4,background:i===onbStep?s.color:th.bor,transition:"all .3s"}}/>))}
        </div>
        <button onClick={()=>{if(onbStep<ONB_SLIDES.length-1)setOnbStep(onbStep+1);else finish();}} style={{width:"100%",background:"linear-gradient(135deg,"+s.color+","+s.color+"dd)",border:"none",borderRadius:16,padding:"16px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 24px "+s.color+"44",transition:"all .3s"}}>{onbStep<ONB_SLIDES.length-1?(lg==="uz"?"Keyingi":lg==="ru"?"\u0414\u0430\u043b\u0435\u0435":"Next"):(lg==="uz"?"Boshlash":lg==="ru"?"\u041d\u0430\u0447\u0430\u0442\u044c":"Get started")}</button>
        {onbStep>0&&<button onClick={()=>setOnbStep(onbStep-1)} style={{width:"100%",background:"none",border:"none",color:th.t2,cursor:"pointer",fontSize:14,fontWeight:600,marginTop:12}}>{lg==="uz"?"Orqaga":lg==="ru"?"\u041d\u0430\u0437\u0430\u0434":"Back"}</button>}
      </div>
    </div>
  );
}
