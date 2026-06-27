// v39 — refactored: pages/, components/, utils/ extracted — refactor: constants.js, formatters.js, AppContext, hooks extracted
import{useState,useEffect,useCallback,useMemo,useRef}from"react";
import Garden from"./Garden.jsx";
import{MK,KATS,KN,DARS,DN,VALS,COUNTRIES,QUICK_ADD,VAZIFA_PRESETS,GOAL_PRESETS,KID_GOAL_PRESETS,ONB_SLIDES,RELATIONS,ADMIN_TEL,FAQS,TL}from"./utils/constants.js";
import{KatIco,DarIco,MoneyInput,Av,Spark,Heat,Tst,BH}from"./components/common/index.jsx";
import AddTransactionModal from"./components/transaction/AddTransactionModal.jsx";
import{Ico}from"./utils/icons.jsx";
import{makeS}from"./utils/styles.js";
import DashboardPage from"./pages/Dashboard.jsx";
import ReportsPage   from"./pages/Reports.jsx";
import GoalsPage     from"./pages/Goals.jsx";
import DebtsPage     from"./pages/Debts.jsx";
import ProfilePage   from"./pages/Profile.jsx";
import TasksPage     from"./pages/Tasks.jsx";
import ChartsPage    from"./pages/Charts.jsx";
import LoginPage     from"./pages/Login.jsx";
import OnboardingPage from"./pages/Onboarding.jsx";
import BottomNav from"./components/ui/BottomNav.jsx";
import{td,nt,tm,f,hp,normTel,sonSoz,fmtN}from"./utils/formatters.js";
import BilimBozor from"./BilimBozor.jsx";
import{LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid}from"recharts";
import{db,auth,fbAuth}from"./firebase.js";
// Context (keyingi bosqichda to'liq o'tkaziladi)
import{useApp}from"./context/AppContext.jsx";




"937414866";

export default function App(){
  const [boot,setBoot]=useState(true);
  const [onbStep,setOnbStep]=useState(()=>{try{return localStorage.getItem("oilaV7Onb")==="1"?-1:0;}catch{return 0;}});
  const [confetti,setConfetti]=useState(false);
  const [qarzDonePrompt,setQarzDonePrompt]=useState(null);
  const [partialQarz,setPartialQarz]=useState(null);
  const [partialSum,setPartialSum]=useState("");
  const [user,setUser]=useState(null);
  const [adminStats,setAdminStats]=useState(null);
  const [adminLoad,setAdminLoad]=useState(false);
  const [oila,setOila]=useState(null);
  const [azolar,setAzolar]=useState([]);
  const [xar,setXar]=useState([]);
  const [dar,setDar]=useState([]);
  const [maq,setMaq]=useState([]);
  const [vazifalar,setVazifalar]=useState([]);
  const [kidBalances,setKidBalances]=useState({});
  const [showAddVazifa,setShowAddVazifa]=useState(false);
  const [showGift,setShowGift]=useState(false);
  const [giftSum,setGiftSum]=useState("");
  const [giftFrom,setGiftFrom]=useState("");
  const [vTitle,setVTitle]=useState("");
  const [vReward,setVReward]=useState("");
  const [vAssignee,setVAssignee]=useState("");
  const [vEmoji,setVEmoji]=useState("📚");
  const [showAddKid,setShowAddKid]=useState(false);
  const [kidName,setKidName]=useState("");
  const [kidLogin,setKidLogin]=useState("");
  const [kidPw,setKidPw]=useState("");
  const [scr,setScr]=useState("login");
  const [tst,setTst]=useState({msg:"",type:"ok"});
  const [dark,setDark]=useState(true);
  const [lg,setLg]=useState("uz");
  const [val,setVal]=useState(VALS[0]);
  const [hisFil,setHisFil]=useState("all");
  const [ctab,setCtab]=useState("line");
  const [adv,setAdv]=useState("");
  const [advL,setAdvL]=useState(false);
  const [srch,setSrch]=useState("");
  const [showS,setShowS]=useState(false);
  const [addM,setAddM]=useState(false);
  const [tupId,setTupId]=useState(null);
  const [tupS,setTupS]=useState("");
  const [reg,setReg]=useState(false);
  const [kidLoginMode,setKidLoginMode]=useState(false);
  const [join,setJoin]=useState(false);
  const [faqO,setFaqO]=useState(null);
  const [edN,setEdN]=useState(false);
  const [newN,setNewN]=useState("");
  const [pTab,setPTab]=useState("main");
  const [stars,setStars]=useState(0);
  const [showGardenInfo,setShowGardenInfo]=useState(false);
  const [showBilim,setShowBilim]=useState(false);
  const [showAddModal,setShowAddModal]=useState(false);
  const [addModalTab,setAddModalTab]=useState("xarajat");
  const [addStep,setAddStep]=useState("kat");
  const [addKat,setAddKat]=useState(null);
  const [maqsadConfirmNotif,setMaqsadConfirmNotif]=useState(null);
  const [maqTab,setMaqTab]=useState("mine"); // "mine" | "oila" 
  const [gardenData,setGardenData]=useState({level:0,watered:null,totalStars:0});
  const [pinStep,setPinStep]=useState("idle");
  const [pinVal,setPinVal]=useState("");
  const [pinCfm,setPinCfm]=useState("");
  const [finger,setFinger]=useState(false);
  const [qarzlar,setQarzlar]=useState([]);
  const [showAddQarz,setShowAddQarz]=useState(false);
  const [qarzTur,setQarzTur]=useState("olgan");
  const [qarzKim,setQarzKim]=useState("");
  const [qarzSum,setQarzSum]=useState("");
  const [qarzIzoh,setQarzIzoh]=useState("");
  const [qarzSana,setQarzSana]=useState(td());
  const [qarzQaytSana,setQarzQaytSana]=useState("");
  const [exportLoading,setExportLoading]=useState(false);
  const [isPremium,setIsPremium]=useState(()=>{try{return localStorage.getItem("oilaV7Prem")==="1";}catch{return false;}});
  const [showPremModal,setShowPremModal]=useState(false);
  const [notifEnabled,setNotifEnabled]=useState(()=>{try{return localStorage.getItem("oilaV7Notif")==="1";}catch{return false;}});
  const [notifTime,setNotifTime]=useState(()=>{try{return localStorage.getItem("oilaV7NotifT")||"20:00";}catch{return "20:00";}});
  const [showScanner,setShowScanner]=useState(false);
  const [scanMsg,setScanMsg]=useState("");
  const [showQrPick,setShowQrPick]=useState(false);
  const [qrRawText,setQrRawText]=useState("");
  const [showImport,setShowImport]=useState(false);
  const [importRows,setImportRows]=useState([]);
  const [importStep,setImportStep]=useState("upload");
  const importFileRef=useRef(null);
  const videoRef=useRef(null);
  const scanStreamRef=useRef(null);
  const scanRafRef=useRef(null);
  const [fbRating,setFbRating]=useState(0);
  const [fbText,setFbText]=useState("");
  const [fbType,setFbType]=useState("taklif");
  const [fbSending,setFbSending]=useState(false);
  const [qarzReqs,setQarzReqs]=useState([]);
  const [qarzTel,setQarzTel]=useState("");
  const [qarzLinked,setQarzLinked]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false);
  const [showReferral,setShowReferral]=useState(false);
  const [refCount,setRefCount]=useState(0);
  const [fRefCode,setFRefCode]=useState("");
  const [rates,setRates]=useState([]);
  const [rateL,setRateL]=useState(false);
  const [fIsm,setFIsm]=useState("");const [fEm,setFEm]=useState("");const [fPw,setFPw]=useState("");
  const [fON,setFON]=useState("");const [fKd,setFKd]=useState("");const [fTel,setFTel]=useState("");const [fDial,setFDial]=useState("+998");const [fCountry,setFCountry]=useState("uz");const [showValDD,setShowValDD]=useState(false);const [fRel,setFRel]=useState("");const [showCountryDD,setShowCountryDD]=useState(false);const [showRelDD,setShowRelDD]=useState(false);const [inviteQarz,setInviteQarz]=useState(null);const [xForMember,setXForMember]=useState("");const [xMode,setXMode]=useState("expense");const [xReqs,setXReqs]=useState([]);const [quickItem,setQuickItem]=useState(null);const [quickSum,setQuickSum]=useState("");const [voiceOn,setVoiceOn]=useState(false);const [voiceText,setVoiceText]=useState("");const [showVoice,setShowVoice]=useState(false);const [voiceParsed,setVoiceParsed]=useState(null);const voiceRecRef=useRef(null);
  const [fS,setFS]=useState("");const [fK,setFK]=useState("oziq");const [fIz,setFIz]=useState("");const [fSn,setFSn]=useState(td());const [fRp,setFRp]=useState(false);
  const [fDS,setFDS]=useState("");const [fDT,setFDT]=useState("oylik");const [fDI,setFDI]=useState("");
  const [fBj,setFBj]=useState("2000000");const [fKL,setFKL]=useState({});
  const [mN,setMN]=useState("");const [mS,setMS]=useState("");const [mR,setMR]=useState("#10b981");
  const [editMq,setEditMq]=useState(null);const [editMqS,setEditMqS]=useState("");const [editMqN,setEditMqN]=useState("");
  const fRef=useRef(null);
  const APP_VER="1.0.0";
  const th=useMemo(()=>MK(dark),[dark]);
  const t=useMemo(()=>TL[lg]||TL.uz,[lg]);
  const f=useCallback((n,sh)=>fmtN(n,val,sh),[val]);
  const ok$=useCallback((msg,type="ok")=>{try{if(navigator.vibrate)navigator.vibrate(type==="err"?[8,40,8]:12);}catch(e){}setTst({msg,type});setTimeout(()=>setTst({msg:"",type:"ok"}),3000);},[]);
  const fireConfetti=useCallback(()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2500);},[]);
  const S=makeS(th);;
  const loadFam=useCallback(async u=>{
    if(!u?.oilaId)return;
    // TEZKOR: avval keshdan ko'rsatamiz (Firebase kutmasdan)
    try{
      const cO=db.gCache("oila_"+u.oilaId);
      if(cO){
        setOila(cO);setFBj(String(cO.budjet||2000000));setFKL(cO.katLimits||{});
        const cIds=cO.azolarIds||[];
        const cMs=cIds.map(a=>db.gCache("user_"+a)).filter(Boolean);if(cMs.length)setAzolar(cMs);
        const caX=[],caD=[];
        cIds.forEach(a=>{(db.gCache("x_"+u.oilaId+"_"+a)||[]).forEach(x=>caX.push({...x,uid:a}));(db.gCache("d_"+u.oilaId+"_"+a)||[]).forEach(d=>caD.push({...d,uid:a}));});
        if(caX.length)setXar(caX.sort((a,b)=>b.id-a.id));if(caD.length)setDar(caD.sort((a,b)=>b.id-a.id));
        const cMaq=db.gCache("maq_"+u.oilaId);if(cMaq)setMaq(cMaq);
        const cQ=db.gCache("qarz_"+u.oilaId);if(cQ)setQarzlar(cQ);
      }
    }catch(e){}
    // Keyin Firebase'dan yangilaymiz (eng so'nggi ma'lumot)
    const o=await db.g("oila_"+u.oilaId);if(!o)return;
    setOila(o);setFBj(String(o.budjet||2000000));setFKL(o.katLimits||{});
    const ids=o.azolarIds||[];
    // PARALLEL yuklash - hammasi bir vaqtda (tez!)
    const [ms,xArr,dArr,maqR,qarzR,qreqR,xreqR,notifR,refsR,vazR,kidbR]=await Promise.all([
      Promise.all(ids.map(a=>db.g("user_"+a))),
      Promise.all(ids.map(a=>db.g("x_"+u.oilaId+"_"+a))),
      Promise.all(ids.map(a=>db.g("d_"+u.oilaId+"_"+a))),
      db.g("maq_"+u.oilaId),
      db.g("qarz_"+u.oilaId),
      u.tel?db.g("qreq_"+u.tel):Promise.resolve(null),
      db.g("xreq_"+u.id),
      db.g("notif_"+u.id),
      db.g("refs_"+u.id),
      db.g("vazifa_"+u.oilaId),
      db.g("kidbal_"+u.oilaId)
    ]);
    setAzolar(ms.filter(Boolean));
    const aX=[],aD=[];
    ids.forEach((a,i)=>{
      (xArr[i]||[]).forEach(x=>aX.push({...x,uid:a}));
      (dArr[i]||[]).forEach(d=>aD.push({...d,uid:a}));
    });
    setXar(aX.sort((a,b)=>b.id-a.id));setDar(aD.sort((a,b)=>b.id-a.id));
    setMaq(maqR||[]);
    setQarzlar(qarzR||[]);
    setVazifalar(vazR||[]);
    setKidBalances(kidbR||{});
    if(u.tel)setQarzReqs(qreqR||[]);
    setXReqs(xreqR||[]);
    let uN=notifR||[];const nsK="news_v1_"+u.id;
    if(!(uN.find(n=>n.id==="news1"))){const nsSeen=await db.g(nsK);if(!nsSeen){const nw={id:"news1",type:"yangilik",title:"Yangi funksiyalar!",body:"Endi qarzlarni telefon orqali bog'lash, chek QR skaneri va PDF/Excel eksport mavjud!",sana:new Date().toISOString(),read:false};uN=[nw,...uN];db.s("notif_"+u.id,uN);db.s(nsK,true);}}
    setNotifs(uN);
    setRefCount((refsR||[]).length);
    // Qarz qaytarish tasdiqlangan bo'lsa - xarajat/daromad qo'shish so'rovini ko'rsataman
    const pd=await db.g("paydone_"+u.id);
    if(pd){setQarzDonePrompt({tur:pd.tur,summa:pd.summa,kim:pd.kim,id:pd.id,paid:true});await db.s("paydone_"+u.id,null);}
    if((refsR||[]).length>=3&&!localStorage.getItem("oilaV7Prem")){localStorage.setItem("oilaV7Prem","1");setIsPremium(true);}
    // Garden va yulduzchalar
    try{
      const g=await db.g("garden_"+u.oilaId);
      const s=await db.g("stars_"+u.oilaId);
      if(g)setGardenData(g);
      if(s!=null)setStars(s);
    }catch(e){}
  },[]);
  useEffect(()=>{(async()=>{
    try{
      // Firebase Auth holatini kuzatamiz - faqat kirgan bo'lsa ma'lumot o'qiymiz
      // Google redirect natijasini HAR DOIM tekshirish (pending key shart emas)
      try{
        const {getRedirectResult}=await import("firebase/auth");
        const {fbAuth:_fbAuth}=await import("./firebase.js");
        const result=await getRedirectResult(_fbAuth);
        if(result?.user){
          const gUser=result.user;
          localStorage.removeItem("oilaV7GooglePending");
          let u=await db.g("user_"+gUser.uid);
          if(!u){
            const uid=gUser.uid;
            const displayName=gUser.displayName||gUser.email?.split("@")[0]||"Foydalanuvchi";
            const email=(gUser.email||"").toLowerCase();
            const famId="fam_"+uid+"_"+Date.now();
            u={id:uid,oilaId:famId,ism:displayName,email,tel:"",photo:gUser.photoURL||null,rol:"bosh",val:"uzs",lg:"uz",dark:false,registeredAt:new Date().toISOString(),loginMethod:"google"};
            await db.s("user_"+uid,u);
            await db.s("fam_"+famId,{id:famId,nomi:displayName+" oilasi",boshId:uid,azolar:[uid],yaratilgan:new Date().toISOString()});
            if(email)await db.s("em_"+email,uid);
          }
          localStorage.setItem("oilaV7",JSON.stringify({uid:u.id}));
          setUser(u);await loadFam(u);setScr("bosh");
          setBoot(false);return;
        }
        localStorage.removeItem("oilaV7GooglePending");
      }catch(e){localStorage.removeItem("oilaV7GooglePending");console.error("Google redirect:",e);}
      auth.onChange(async(fbUser)=>{
        if(fbUser){
          // Kirgan: localStorage'dagi uid yoki Auth uid bilan user topamiz
          let uid=null;
          try{const s=localStorage.getItem("oilaV7");if(s)uid=JSON.parse(s).uid;}catch(e){}
          if(!uid)uid=fbUser.uid;
          let u=await db.g("user_"+uid);
          if(!u&&uid!==fbUser.uid)u=await db.g("user_"+fbUser.uid);
          if(u){
            localStorage.setItem("oilaV7",JSON.stringify({uid:u.id}));
            setUser(u);setScr("bosh");loadFam(u);
          }
        }
        // Kirmagan: login ekranida qoladi (ma'lumot o'qimaymiz)
      });
      const dl=localStorage.getItem("oilaV7L");if(dl&&TL[dl])setLg(dl);
      const dd=localStorage.getItem("oilaV7D");if(dd!=null)setDark(dd!=="false");
      const dv=localStorage.getItem("oilaV7V");if(dv){const v=VALS.find(x=>x.id===dv);if(v)setVal(v);}
      try{const params=new URLSearchParams(window.location.search);const rc=params.get("ref");if(rc){setFRefCode(rc);setReg(true);}const fam=params.get("fam");if(fam){setFKd(fam);setJoin(true);setReg(true);}const tx=params.get("tilxat");if(tx){try{setVerifyTilxat(JSON.parse(tx));}catch(e2){}}}catch(e){}
    }catch{}
    setBoot(false);
  })();},[]);
  useEffect(()=>{if(scr==="bosh"&&rates.length===0)fetchRates();},[scr]);
  const fetchRates=async()=>{
    setRateL(true);
    let ok2=false;
    // Bir nechta CORS proxy orqali urinish (artifact tashqi APIni bloklashi mumkin)
    // exchangerate-api.com - bepul, CORS yo'q, ishonchli
    const sources=[
      {url:"https://open.er-api.com/v6/latest/UZS",type:"er"},
      {url:"https://api.exchangerate-api.com/v4/latest/UZS",type:"er4"},
    ];
    for(const src of sources){
      try{
        const res=await fetch(src.url,{signal:AbortSignal.timeout(6000)});
        const raw=await res.json();
        // rates = {USD: 0.0000770, EUR: ...} (1 UZS = X valyuta)
        // bizga kerak: 1 valyuta = X UZS
        const ratesObj=raw.rates||{};
        const want=["USD","EUR","RUB","GBP","CNY","KZT"];
        const nameMap={USD:"AQSH dollari",EUR:"Yevropa evro",RUB:"Rossiya rubli",GBP:"Britaniya funti",CNY:"Xitoy yuani",KZT:"Qozog'iston tengesi"};
        const filt=want.filter(c=>ratesObj[c]).map(c=>({
          Ccy:c,
          Rate:ratesObj[c]>0?(1/ratesObj[c]).toFixed(2):"0",
          CcyNm_UZ:nameMap[c]||c,
          Diff:"0"
        }));
        if(filt.length>0){
          setRates(filt.map(r=>({code:r.Ccy,rate:r.Rate,name:r.CcyNm_UZ,diff:r.Diff})));
          ok2=true;
          try{localStorage.setItem("oilaV7Rates",JSON.stringify(filt.map(r=>({code:r.Ccy,rate:r.Rate,name:r.CcyNm_UZ}))));localStorage.setItem("oilaV7RatesT",new Date().toISOString());}catch(e){}
          ok$(lg==="uz"?"Kurslar yangilandi!":lg==="ru"?"Курсы обновлены!":"Rates updated!");
          break;
        }
      }catch(e){}
    }
    if(!ok2){
      // Saqlangan kurslar yoki zaxira
      let saved=null;
      try{saved=JSON.parse(localStorage.getItem("oilaV7Rates"));}catch(e){}
      if(saved&&saved.length>0){setRates(saved);ok$(lg==="uz"?"Saqlangan kurslar (internet yo'q)":"Saved rates (offline)","warn");}
      else{setRates([{code:"USD",rate:"12850",name:"AQSH dollari"},{code:"EUR",rate:"13920",name:"Evro"},{code:"RUB",rate:"143",name:"Rossiya rubli"},{code:"GBP",rate:"16200",name:"Britaniya funti"},{code:"CNY",rate:"1780",name:"Xitoy yuani"},{code:"KZT",rate:"26",name:"Qozog'. tengesi"}]);ok$(lg==="uz"?"Demo kurslar (API bloklangan)":"Demo rates (API blocked)","warn");}
    }
    setRateL(false);
  };
  const [showPw,setShowPw]=useState(false);
  const [showResetConfirm,setShowResetConfirm]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [verifyTilxat,setVerifyTilxat]=useState(null);
  const [showResetScreen,setShowResetScreen]=useState(false);
  const [resetInput,setResetInput]=useState("");
  const [resetSent,setResetSent]=useState(false);
  const switchAuthMode=(toReg,kidMode=false)=>{
    // Ro'yxat <-> Kirish <-> Bola almashganda maydonlarni tozalaymiz
    setReg(toReg);setKidLoginMode(kidMode);
    setFIsm("");setFEm("");setFPw("");setFTel("");setFKd("");setFRel("");setFON("");
    setShowPw(false);setJoin(false);
  };
  const genPassword=()=>{
    const chars="abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let p="";for(let i=0;i<10;i++)p+=chars[Math.floor(Math.random()*chars.length)];
    setFPw(p);setShowPw(true);
    ok$(lg==="uz"?"Parol yaratildi! Eslab qoling yoki saqlang.":"Password generated!");
  };
  const handleResetPw=()=>{
    // Alohida tiklash ekranini ochamiz
    setResetInput(fEm.trim()||"");setResetSent(false);setShowResetScreen(true);
  };
  const sendResetEmail=async()=>{
    const email=resetInput.trim().toLowerCase();
    if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return ok$(lg==="uz"?"To'g'ri email kiriting":"Enter valid email","err");
    // Avval email ro'yxatda bormi - o'zimiz tekshiramiz (Firebase buni aytmaydi)
    // Keshni chetlab, to'g'ridan-to'g'ri tekshiramiz
    let exists=false;
    try{
      const uid=await db.gFresh("em_"+email);
      if(uid)exists=true;
    }catch(e){exists=false;}
    if(!exists){
      // Ro'yxatdan o'tmagan - ro'yxatga yo'naltiramiz
      ok$(lg==="uz"?"Bu email ro'yxatdan o'tmagan. Ro'yxatdan o'ting.":"Email not registered. Please sign up.","err");
      setTimeout(()=>{setShowResetScreen(false);setReg(true);setFEm(email);},1600);
      return;
    }
    // Email ro'yxatda bor - tiklash xatini yuboramiz
    try{
      await auth.resetPassword(email);
      setResetSent(true);
    }catch(e){
      ok$(lg==="uz"?"Xato: "+(e.code||e.message):"Error","err");
    }
  };
  const doAuth=async()=>{
   try{
    // BOLA KIRISHI (login + parol, telefonsiz)
    if(kidLoginMode){
      const loginKey=fTel.trim().toLowerCase();
      if(!loginKey||!fPw.trim())return ok$(lg==="uz"?"Login va parolni yozing":"Enter login and password","err");
      const kidUid=await db.gFresh("kidlogin_"+loginKey);
      if(!kidUid)return ok$(lg==="uz"?"Login topilmadi. Ota-onangdan so'ra.":"Login not found","err");
      buzz(15);
      // AVVAL anonim auth (request.auth bo'lishi uchun), KEYIN ma'lumot o'qiymiz
      try{await auth.loginAnon();}catch(e){console.error("Anon login:",e);return ok$(lg==="uz"?"Firebase Anonymous yoqilmagan! Ota-onaga ayting.":"Anonymous auth not enabled","err");}
      const ku=await db.g("user_"+kidUid);
      if(!ku||ku.rol!=="kid")return ok$(lg==="uz"?"Login topilmadi":"Not found","err");
      if(await hp(fPw)!==ku.ph){try{await auth.logout();}catch(e){}return ok$(lg==="uz"?"Parol noto'g'ri":"Wrong password","err");}
      localStorage.setItem("oilaV7",JSON.stringify({uid:ku.id,kid:true}));
      setUser(ku);await loadFam(ku);setScr("bosh");
      ok$((lg==="uz"?"Xush kelibsiz, ":"Welcome, ")+ku.ism+" 👋");
      return;
    }
    const dialNow=reg?((COUNTRIES.find(c=>c.code===fCountry)||{}).dial||""):fDial;
    const telKey=(dialNow+fTel.trim()).replace(/[^0-9+]/g,"");
    if(reg){
      if(!fIsm.trim()||!fTel.trim()||fPw.length<6)return ok$(lg==="uz"?"Ism, telefon va parol (6+ belgi) kiriting":"Enter name, phone and password (6+)","err");
      if(!fEm.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim()))return ok$(lg==="uz"?"To'g'ri email kiriting (parolni tiklash uchun zarur)":"Enter valid email","err");
      if(await db.g("tel9_"+normTel(fTel)))return ok$(lg==="uz"?"Bu telefon allaqachon ro'yxatda":"Phone already registered","err");
      // Firebase Auth orqali akkaunt yaratish (parol Firebase'da xavfsiz saqlanadi)
      let authUser;
      try{
        authUser=await auth.register(fEm.trim().toLowerCase(),fPw);
      }catch(e){
        const msg=e.code==="auth/email-already-in-use"?(lg==="uz"?"Bu email allaqachon ishlatilgan":"Email already in use"):e.code==="auth/weak-password"?(lg==="uz"?"Parol juda zaif (6+ belgi)":"Weak password"):(lg==="uz"?"Ro'yxatda xato: ":"Register error: ")+(e.code||e.message);
        return ok$(msg,"err");
      }
      const uid=authUser.uid,ph=await hp(fPw);
      if(join){
        if(!fKd.trim())return ok$(t.fa,"err");
        const o=await db.g("oila_"+fKd.trim());if(!o)return ok$(t.ffe,"err");
        // Oila a'zolari limiti: bepulда 2 a'zo, Premium uchun cheksiz
        if((o.azolarIds||[]).length>=2&&!o.premium){
          return ok$(lg==="uz"?"Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak.":lg==="ru"?"Лимит участников исчерпан (2). Нужен Premium.":"Family member limit reached (2). Head needs Premium.","err");
        }
        const dialC=(COUNTRIES.find(c=>c.code===fCountry)||{}).dial||"";const tel=(dialC+fTel.trim()).replace(/[^0-9+]/g,"");const n9=normTel(fTel);
        const nu={id:uid,ism:fIsm.trim(),email:fEm.trim().toLowerCase(),tel,ph,oilaId:fKd.trim(),rol:"azo",rel:fRel||"boshqa",photo:null};
        await db.s("user_"+uid,nu);if(fEm.trim())await db.s("em_"+fEm.toLowerCase(),uid);
        if(n9){await db.s("tel9_"+n9,uid);await db.s("tel_"+tel,uid);await db.s("tphone_"+n9,fEm.trim().toLowerCase());}
        if(fRefCode.trim()){const refUid=fRefCode.trim();const refUser=await db.g("user_"+refUid);if(refUser&&refUid!==uid){const refList=(await db.g("refs_"+refUid))||[];if(!refList.find(r=>r.uid===uid)){refList.push({uid,ism:fIsm.trim(),sana:new Date().toISOString()});await db.s("refs_"+refUid,refList);const rn={id:Date.now()+Math.random(),type:"yangilik",title:lg==="uz"?"Yangi taklif! \ud83c\udf89":"New referral!",body:(fIsm.trim())+" "+(lg==="uz"?"sizning havolangiz orqali qo'shildi":"joined via your link"),sana:new Date().toISOString(),read:false};const rc=(await db.g("notif_"+refUid))||[];await db.s("notif_"+refUid,[rn,...rc].slice(0,100));if(refList.length>=3){const ru=await db.g("user_"+refUid);if(ru){/* premium granted on their next load */}}}}}
        await db.s("x_"+fKd.trim()+"_"+uid,[]);await db.s("d_"+fKd.trim()+"_"+uid,[]);
        o.azolarIds=[...(o.azolarIds||[]),uid];await db.s("oila_"+o.id,o);
        const cV=COUNTRIES.find(c=>c.code===fCountry);if(cV){const vv=VALS.find(x=>x.id===cV.val);if(vv){setVal(vv);localStorage.setItem("oilaV7V",vv.id);}}
        localStorage.setItem("oilaV7",JSON.stringify({uid}));setUser(nu);await loadFam(nu);setScr("bosh");ok$(t.jf2);addStar(15,lg==="uz"?"Oila azosi qoshildi":"Family member added");
      }else{
        if(!fON.trim())return ok$(t.fa,"err");
        const oid="o"+Date.now();
        const dialC=(COUNTRIES.find(c=>c.code===fCountry)||{}).dial||"";const tel=(dialC+fTel.trim()).replace(/[^0-9+]/g,"");const n9=normTel(fTel);
        const nu={id:uid,ism:fIsm.trim(),email:fEm.trim().toLowerCase(),tel,ph,oilaId:oid,rol:"bosh",rel:"bosh",photo:null};
        const no_={id:oid,nomi:fON.trim(),boshId:uid,azolarIds:[uid],budjet:2000000,katLimits:{}};
        await db.s("user_"+uid,nu);if(fEm.trim())await db.s("em_"+fEm.toLowerCase(),uid);
        if(n9){await db.s("tel9_"+n9,uid);await db.s("tel_"+tel,uid);await db.s("tphone_"+n9,fEm.trim().toLowerCase());}
        if(fRefCode.trim()){const refUid=fRefCode.trim();const refUser=await db.g("user_"+refUid);if(refUser&&refUid!==uid){const refList=(await db.g("refs_"+refUid))||[];if(!refList.find(r=>r.uid===uid)){refList.push({uid,ism:fIsm.trim(),sana:new Date().toISOString()});await db.s("refs_"+refUid,refList);const rn={id:Date.now()+Math.random(),type:"yangilik",title:lg==="uz"?"Yangi taklif! \ud83c\udf89":"New referral!",body:(fIsm.trim())+" "+(lg==="uz"?"sizning havolangiz orqali qo'shildi":"joined via your link"),sana:new Date().toISOString(),read:false};const rc=(await db.g("notif_"+refUid))||[];await db.s("notif_"+refUid,[rn,...rc].slice(0,100));}}}
        await db.s("oila_"+oid,no_);await db.s("x_"+oid+"_"+uid,[]);await db.s("d_"+oid+"_"+uid,[]);
        const cV=COUNTRIES.find(c=>c.code===fCountry);if(cV){const vv=VALS.find(x=>x.id===cV.val);if(vv){setVal(vv);localStorage.setItem("oilaV7V",vv.id);}}
        localStorage.setItem("oilaV7",JSON.stringify({uid}));setUser(nu);setOila(no_);setAzolar([nu]);setXar([]);setDar([]);setMaq([]);setScr("bosh");ok$(t.fc3);
      }
    }else{
      // BOLA LOGINI: agar email/telefon emas, oddiy login kiritilgan bo'lsa
      const tryLogin=fTel.trim().toLowerCase();
      if(tryLogin&&!tryLogin.includes("@")&&!/^[0-9+ ]+$/.test(tryLogin)){
        // Bu bola logini (raqam ham email ham emas)
        const kidUid=await db.gFresh("kidlogin_"+tryLogin);
        if(kidUid){
          const ku=await db.g("user_"+kidUid);
          if(ku&&ku.rol==="kid"){
            if(await hp(fPw)!==ku.ph)return ok$(lg==="uz"?"Parol noto'g'ri":"Wrong password","err");
            buzz(15);
            // Anonim Firebase Auth (Firestore o'qishi uchun request.auth kerak)
            try{await auth.loginAnon();}catch(e){}
            localStorage.setItem("oilaV7",JSON.stringify({uid:ku.id,kid:true}));
            setUser(ku);await loadFam(ku);setScr("bosh");
            ok$((lg==="uz"?"Xush kelibsiz, ":"Welcome, ")+ku.ism+" 👋");
            return;
          }
        }
        return ok$(lg==="uz"?"Login yoki parol noto'g'ri":"Wrong login or password","err");
      }
      // Telefon yoki email + parol bilan kirish (Firebase Auth)
      let email=fEm.trim().toLowerCase();
      // Telefon kiritilgan bo'lsa - tphone_ orqali emailni topamiz
      if(!email&&fTel.trim()){
        const n9=normTel(fTel);
        const foundEmail=await db.g("tphone_"+n9);
        if(foundEmail)email=foundEmail;
        else return ok$(lg==="uz"?"Bu telefon topilmadi. Email bilan kiring yoki ro'yxatdan o'ting.":"Phone not found","err");
      }
      if(!email||!fPw.trim())return ok$(lg==="uz"?"Telefon/email va parol kiriting":"Enter phone/email and password","err");
      let authUser;
      try{
        authUser=await auth.login(email,fPw);
      }catch(e){
        const msg=(e.code==="auth/wrong-password"||e.code==="auth/invalid-credential")?(lg==="uz"?"Email yoki parol noto'g'ri":"Wrong email or password"):e.code==="auth/user-not-found"?(lg==="uz"?"Foydalanuvchi topilmadi":"User not found"):e.code==="auth/too-many-requests"?(lg==="uz"?"Ko'p urinish. Biroz kuting.":"Too many attempts"):(lg==="uz"?"Kirishda xato: ":"Login error: ")+(e.code||e.message);
        return ok$(msg,"err");
      }
      // Kirgandan keyin user ma'lumotini olamiz (endi request.auth bor)
      let u=await db.g("user_"+authUser.uid);
      if(!u){const oldUid=await db.g("em_"+email);if(oldUid)u=await db.g("user_"+oldUid);}
      if(!u)return ok$(lg==="uz"?"Profil topilmadi":"Profile not found","err");
      localStorage.setItem("oilaV7",JSON.stringify({uid:u.id}));setUser(u);await loadFam(u);setScr("bosh");ok$(t.wc+", "+u.ism+" \ud83d\udc4b");
    }
   }catch(err){
     console.error("AUTH ERROR:",err);
     ok$((lg==="uz"?"Xatolik: ":"Error: ")+(err.code||err.message||"Firebase ulanmadi. Internetni tekshiring."),"err");
   }
  };
  // ===== GARDEN / YULDUZCHA TIZIMI =====
  const loadGarden=async(oilaId)=>{
    try{
      const g=await db.g("garden_"+oilaId);
      const s=await db.g("stars_"+oilaId);
      if(g)setGardenData(g);
      if(s!=null)setStars(s);
    }catch(e){}
  };
  const addStar=async(count=1,reason="")=>{
    if(!user?.oilaId)return;
    try{
      // Yulduzcha (eski tizim)
      const cur=(await db.g("stars_"+user.oilaId))||0;
      const next=cur+count;
      await db.s("stars_"+user.oilaId,next);
      setStars(next);
      // Baraka Coin (garden uchun) — harakat turiga qarab miqdor
      const coinMap={"Xarajat kiritildi":5,"Expense added":5,"Daromad kiritildi":10,"Income added":10,"QR kod skanerlandi":10,"QR scanned":10,"Vazifa bajarildi":15,"Task completed":15,"Maqsadga yetildi":50,"Goal reached":50};
      const coinAmt=coinMap[reason]||count;
      const curC=(await db.g("baraka_coins_"+user.oilaId))||0;
      await db.s("baraka_coins_"+user.oilaId,curC+coinAmt);
      // Log
      const log=(await db.g("starlog_"+user.oilaId))||[];
      log.unshift({uid:user.id,ism:user.ism,count,reason,sana:new Date().toISOString()});
      await db.s("starlog_"+user.oilaId,log.slice(0,50));
    }catch(e){}
  };
  const waterGarden=async()=>{
    if(!user?.oilaId)return;
    const cost=5;
    if(stars<cost){ok$(lg==="uz"?"Kamida 5⭐ kerak":"Need 5⭐ to water","warn");return;}
    try{
      const cur=(await db.g("stars_"+user.oilaId))||0;
      if(cur<cost){ok$(lg==="uz"?"Yetarli yulduzcha yo'q":"Not enough stars","warn");return;}
      const newStars=cur-cost;
      const today=new Date().toISOString().slice(0,10);
      const g=(await db.g("garden_"+user.oilaId))||{level:0,watered:null,totalStars:0,wateredBy:[]};
      // Bugun allaqachon sug'orilganmi?
      if(g.watered===today){ok$(lg==="uz"?"Bog' bugun allaqachon sug'orildi 🌿":"Garden already watered today 🌿","warn");return;}
      // Level oshirish: har 3 marta sug'OriShda 1 level
      const wCount=(g.wateredBy||[]).filter(w=>w.sana&&w.sana>=new Date(Date.now()-30*86400000).toISOString()).length+1;
      const newLevel=Math.min(Math.floor(wCount/3),6);
      const newG={...g,level:newLevel,watered:today,totalStars:(g.totalStars||0)+cost,wateredBy:[{uid:user.id,ism:user.ism,sana:new Date().toISOString()},...(g.wateredBy||[]).slice(0,29)]};
      await db.s("garden_"+user.oilaId,newG);
      await db.s("stars_"+user.oilaId,newStars);
      setStars(newStars);setGardenData(newG);
      buzz(20);
      ok$(lg==="uz"?"Bog' sug'orildi! 🌿 -5⭐":"Garden watered! 🌿 -5⭐");
    }catch(e){ok$(lg==="uz"?"Xato yuz berdi":"Error","err");}
  };
  // ===== END GARDEN =====
  // Google user ni Firestore ga saqlash va kirish
  const handleGoogleUser=async(gUser)=>{
    let u=await db.g("user_"+gUser.uid);
    if(!u){
      const uid=gUser.uid;
      const displayName=gUser.displayName||gUser.email?.split("@")[0]||"Foydalanuvchi";
      const email=(gUser.email||"").toLowerCase();
      const famId="fam_"+uid+"_"+Date.now();
      u={id:uid,oilaId:famId,ism:displayName,email,tel:"",photo:gUser.photoURL||null,rol:"bosh",val:"uzs",lg,dark,registeredAt:new Date().toISOString(),loginMethod:"google"};
      await db.s("user_"+uid,u);
      await db.s("fam_"+famId,{id:famId,nomi:displayName+(lg==="uz"?" oilasi":" family"),boshId:uid,azolar:[uid],yaratilgan:new Date().toISOString()});
      if(email)await db.s("em_"+email,uid);
    }
    localStorage.setItem("oilaV7",JSON.stringify({uid:u.id}));
    setUser(u);await loadFam(u);setScr("bosh");
    ok$((lg==="uz"?"Xush kelibsiz, ":"Welcome, ")+u.ism+" 👋");
  };
  // Google bilan kirish handler
  const doGoogleLogin=async()=>{
    try{
      const res=await auth.googleLogin();
      if(res?.user){
        await handleGoogleUser(res.user);
      }
      // redirect bo'lsa - sahifa qayta yuklanadi, onChange ushlab oladi
    }catch(e){
      if(e.code!=="auth/popup-closed-by-user"){
        ok$((lg==="uz"?"Google bilan kirishda xato: ":"Google sign-in error: ")+(e.message||e.code),"err");
      }
    }
  };
  const doPhoto=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=async ev=>{const p=ev.target.result;const u2={...user,photo:p};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,photo:p}:a));ok$(t.ua);};r.readAsDataURL(file);};
  const rmPhoto=async()=>{const u2={...user,photo:null};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,photo:null}:a));ok$(t.ua);};
  const updName=async()=>{if(!newN.trim())return;const u2={...user,ism:newN.trim()};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,ism:newN.trim()}:a));setEdN(false);ok$(t.ua);};
  const addX=async()=>{
    if(!fS||Number(fS)<=0)return ok$(t.ea,"err");
    // Agar boshqa a'zo uchun bo'lsa - so'rov yuboramiz
    if(xForMember&&xForMember!==user.id){
      if(xMode==="give"){
        // A'ZOGA PUL BERDIM: menga HADYA xarajati (darhol), a'zoga daromad so'rovi
        const item={id:Date.now(),kategoriya:"hadya",summa:Number(fS),izoh:(lg==="uz"?"Hadya: ":"Gift: ")+(azolar.find(a=>a.id===xForMember)?.ism||""),sana:fSn,vaqt:nt(),repeat:false};
        const mk="x_"+user.oilaId+"_"+user.id;
        await db.s(mk,[item,...((await db.g(mk))||[])]);
        setXar(x=>[{...item,uid:user.id},...x]);
        // A'zoga daromad so'rovi
        const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,toUid:xForMember,tur:"sovga",summa:Number(fS),izoh:(lg==="uz"?user.ism+" dan":"from "+user.ism),sana:fSn,kind:"income"};
        const tReqs=(await db.g("xreq_"+xForMember))||[];
        await db.s("xreq_"+xForMember,[req,...tReqs]);
        const rN={id:Date.now()+Math.random(),type:"daromad",title:lg==="uz"?"Pul oldingiz 💰":"You received money",body:(user.ism||"")+" "+(lg==="uz"?"sizga pul berdi":"gave you money")+": "+fmtN(Number(fS),val,true),sana:new Date().toISOString(),read:false};
        const rC=(await db.g("notif_"+xForMember))||[];
        await db.s("notif_"+xForMember,[rN,...rC].slice(0,100));
        setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setXMode("expense");setScr("bosh");
        ok$(lg==="uz"?"Pul berildi! A'zo tasdiqlasa daromadiga qo'shiladi.":"Money sent! Will be added to their income.");
        return;
      }
      const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,toUid:xForMember,kategoriya:fK,summa:Number(fS),izoh:fIz||KN[lg][KATS.findIndex(k=>k.id===fK)],sana:fSn,kind:"expense"};
      const tReqs=(await db.g("xreq_"+xForMember))||[];
      await db.s("xreq_"+xForMember,[req,...tReqs]);
      const rN={id:Date.now()+Math.random(),type:"xarajat",title:lg==="uz"?"Xarajat so'rovi":"Expense request",body:(user.ism||"")+" "+(lg==="uz"?"sizning nomingizdan xarajat kiritdi":"added an expense for you")+": "+fmtN(Number(fS),val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+xForMember))||[];
      await db.s("notif_"+xForMember,[rN,...rC].slice(0,100));
      setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setXMode("expense");setScr("bosh");
      ok$(lg==="uz"?"Xarajat so'rovi yuborildi! A'zo tasdiqlasa qo'shiladi.":"Expense request sent!");
      return;
    }
    const item={id:Date.now(),kategoriya:fK,summa:Number(fS),izoh:fIz||KN[lg][KATS.findIndex(k=>k.id===fK)],sana:fSn,vaqt:nt(),repeat:fRp};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    const bt=na.filter(x=>x.sana?.startsWith(tm())).reduce((s,x)=>s+Number(x.summa||0),0),bdj=oila?.budjet||2000000;
    if(bt>bdj){ok$(t.be,"err");addNotif("budjet",lg==="uz"?"Budjet oshib ketdi!":"Budget exceeded!",lg==="uz"?"Bu oy xarajatlar budjetdan oshdi":"Expenses exceeded budget");}else if(bt>bdj*.9){ok$(t.bw,"warn");addNotif("budjet",lg==="uz"?"Budjet 90% sarflandi":"90% used",lg==="uz"?"Budjet tugashga yaqin":"Budget almost reached");}
    else{const lim=oila?.katLimits?.[fK];const kt=na.filter(x=>x.sana?.startsWith(tm())&&x.kategoriya===fK).reduce((s,x)=>s+Number(x.summa||0),0);if(lim&&kt>lim)ok$(KN[lg][KATS.findIndex(k=>k.id===fK)]+" "+t.le,"warn");else{ok$(t.xa);addStar(1,lg==="uz"?"Xarajat kiritildi":"Expense added");}}
    setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setScr("bosh");
  };
  const parseVoice=(text)=>{
    if(!text)return null;
    const low=text.toLowerCase();
    // Summani ajratish: raqam + (ming/million) yoki yakka raqam
    let summa=0;
    // "20 ming", "20ming", "2 million", "500 so'm"
    const mingMatch=low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(ming|tisyacha|тысяч|k)/);
    const milMatch=low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(million|mln|млн|millon)/);
    const plainMatch=low.match(/([0-9]{3,})/);
    if(milMatch){summa=Math.round(parseFloat(milMatch[1].replace(",","."))*1000000);}
    else if(mingMatch){summa=Math.round(parseFloat(mingMatch[1].replace(",","."))*1000);}
    else if(plainMatch){summa=parseInt(plainMatch[1]);}
    // Kategoriyani ajratish - kalit so'zlar
    const katKeys={
      oziq:["ovqat","ovkat","yeg","tushlik","nonushta","kechki","restoran","kafe","kofe","choy","non","sut","gosht","go'sht","meva","sabzavot","bozor","produkt","еда","обед","ужин","кофе","food","oziq","ovqatlanish"],
      transport:["transport","taksi","taxi","yo'l","benzin","yoqilg'i","avtobus","metro","mashina","такси","бензин","транспорт","fuel","gas"],
      kommunal:["kommunal","svet","gaz","suv","elektr","internet","telefon to'lov","комунал","свет","газ","вода","utility"],
      sog:["dori","dorixona","shifokor","kasalxona","apteka","аптека","лекарство","sog'liq","tibbiyot","health","medicine","klinika"],
      kiyim:["kiyim","ko'ylak","poyabzal","kross","одежда","обувь","clothes","kiyinish"],
      kongil:["kino","o'yin","sayohat","dam","konsert","развлечение","entertainment","kongilochar","ko'ngil"],
      talim:["kitob","o'qish","kurs","ta'lim","maktab","universitet","образование","study","education","dars"],
      boshqa:["boshqa","other","другое"]
    };
    let kat="boshqa";
    for(const[k,words]of Object.entries(katKeys)){
      if(words.some(w=>low.includes(w))){kat=k;break;}
    }
    if(summa<=0)return null;
    return {summa,kat,text};
  };
  const startVoice=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setShowVoice(true);setVoiceText("");setVoiceParsed(null);ok$(lg==="uz"?"Brauzer ovozni qo'llamaydi. Qo'lda yozing.":"Voice not supported. Type manually.","warn");return;}
    setShowVoice(true);setVoiceText("");setVoiceParsed(null);setVoiceOn(true);
    try{
      const rec=new SR();
      rec.lang=lg==="uz"?"uz-UZ":lg==="ru"?"ru-RU":"en-US";
      rec.interimResults=true;rec.continuous=false;
      rec.onresult=(e)=>{
        let txt="";
        for(let i=0;i<e.results.length;i++){txt+=e.results[i][0].transcript;}
        setVoiceText(txt);
        const parsed=parseVoice(txt);
        if(parsed)setVoiceParsed(parsed);
      };
      rec.onerror=(e)=>{setVoiceOn(false);if(e.error==="not-allowed"||e.error==="permission-denied"){ok$(lg==="uz"?"Mikrofon ruxsati berilmadi. Qo'lda yozing.":"Mic denied. Type manually.","warn");}};
      rec.onend=()=>{setVoiceOn(false);};
      voiceRecRef.current=rec;
      rec.start();
    }catch(e){setVoiceOn(false);ok$(lg==="uz"?"Xatolik. Qo'lda yozing.":"Error. Type manually.","warn");}
  };
  const stopVoice=()=>{
    if(voiceRecRef.current){try{voiceRecRef.current.stop();}catch(e){}}
    setVoiceOn(false);
  };
  const applyVoice=async()=>{
    const parsed=voiceParsed||parseVoice(voiceText);
    if(!parsed){return ok$(lg==="uz"?"Summa topilmadi. Masalan: 'transportga 20 ming'":"No amount found. E.g. 'transport 20000'","err");}
    const item={id:Date.now(),kategoriya:parsed.kat,summa:parsed.summa,izoh:parsed.text.slice(0,50),sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    setShowVoice(false);setVoiceText("");setVoiceParsed(null);
    ok$(lg==="uz"?"Qo'shildi: "+f(parsed.summa,true)+" - "+KN[lg][KATS.findIndex(k=>k.id===parsed.kat)]:"Added: "+f(parsed.summa,true));
  };
  const quickAdd=async()=>{
    if(!quickItem||!quickSum||Number(quickSum)<=0)return ok$(t.ea,"err");
    const item={id:Date.now(),kategoriya:quickItem.kat,summa:Number(quickSum),izoh:quickItem[lg]||quickItem.uz,sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    const bt=na.filter(x=>x.sana&&x.sana.indexOf(tm())===0).reduce((s,x)=>s+Number(x.summa||0),0),bdj=oila?.budjet||2000000;
    if(bt>bdj){ok$(t.be,"err");addNotif("budjet",lg==="uz"?"Budjet oshib ketdi!":"Budget exceeded!",lg==="uz"?"Bu oy xarajatlar budjetdan oshdi":"Expenses exceeded");}else if(bt>bdj*.9){ok$(t.bw,"warn");}else ok$(t.xa);
    setQuickItem(null);setQuickSum("");
  };
  const addD=async()=>{
    if(!fDS||Number(fDS)<=0)return ok$(t.ea,"err");
    const item={id:Date.now(),tur:fDT,summa:Number(fDS),izoh:fDI||DN[lg][DARS.findIndex(d=>d.id===fDT)],sana:td(),vaqt:nt()};
    const key="d_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setDar([{...item,uid:user.id},...dar]);setFDS("");setFDI("");setFDT("oylik");setScr("bosh");ok$(t.da);addStar(1,lg==="uz"?"Daromad kiritildi":"Income added");
  };
  const addMq=async()=>{
    if(!mN.trim()||!mS||Number(mS)<=0)return ok$(t.fa,"err");
    if(!isPremium&&maq.length>=3){setShowPremModal(true);return;}
    const u=[...maq,{id:Date.now(),ism:mN.trim(),maqsad:Number(mS),jamg:0,rang:mR,createdAt:new Date().toISOString().slice(0,10),uid:user.id,status:"active"}];
    await db.s("maq_"+user.oilaId,u);setMaq(u);setMN("");setMS("");setAddM(false);ok$(t.ma);addStar(20,lg==="uz"?"Maqsad yaratildi":"Goal created");
  };
  const tupMq=async()=>{
    if(!tupS||Number(tupS)<=0)return;
    const summa=Number(tupS);
    if(isKid){
      const bal=kidBalances[user.id]||0;
      if(summa>bal)return ok$(lg==="uz"?"Cho'ntak pulingiz yetarli emas! Ko'proq vazifa bajaring 💪":"Not enough pocket money!","err");
      const kb={...kidBalances};kb[user.id]=bal-summa;
      await db.s("kidbal_"+user.oilaId,kb);setKidBalances(kb);
    } else {
      // Kattalar: asosiy balansdan ayirish (xarajat sifatida emas, maqsad to'plami sifatida)
      const myDar=dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
      const myXar=xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
      const myBal=myDar-myXar;
      if(myBal<summa)return ok$(lg==="uz"
        ?"❌ Balansda yetarli mablag' yo'q! Balans: "+f(Math.max(0,myBal),true)+", Kerak: "+f(summa,true)
        :"❌ Insufficient balance! Balance: "+f(Math.max(0,myBal),true)+", Need: "+f(summa,true)
      ,"err");
      // Xarajat sifatida yozib qo'yamiz (maqsad to'plami)
      const xItem={id:Date.now(),kategoriya:"maqsad",summa,izoh:(lg==="uz"?"Maqsad to'plami: ":"Goal savings: ")+(maq.find(m=>m.id===tupId)?.ism||""),sana:td(),vaqt:nt(),uid:user.id,repeat:false,forGoal:tupId};
      const xk="x_"+user.oilaId+"_"+user.id;
      await db.s(xk,[xItem,...((await db.g(xk))||[])]);
      setXar(x=>[xItem,...x]);
    }
    const tgtGoal=maq.find(m=>m.id===tupId);const wasComplete=tgtGoal&&(tgtGoal.jamg+summa)>=tgtGoal.maqsad&&tgtGoal.jamg<tgtGoal.maqsad;const completedNow=wasComplete?new Date().toISOString().slice(0,10):undefined;
    const u=maq.map(m=>m.id===tupId?{...m,jamg:Math.min(m.maqsad,m.jamg+summa),...(wasComplete?{completedAt:completedNow}:{})}:m);if(wasComplete){
  fireConfetti();buzz(20);
  addStar(10,lg==="uz"?"Maqsadga yetildi: "+(tgtGoal?.ism||""):"Goal reached: "+(tgtGoal?.ism||""));
  if(isKid){
    // Bola maqsadiga yetdi — ota/onaga tasdiqlash xabari yuborish
    try{
      // Oila boshlig'ini topish
      const boshId=oila?.boshId;
      if(boshId&&boshId!==user.id){
        const bn=(await db.g("notif_"+boshId))||[];
        await db.s("notif_"+boshId,[{
          id:Date.now(),
          type:"maqsad_confirm",
          title:lg==="uz"?"🎯 Farzandingiz orzusiga yetdi!":"🎯 Your child reached their goal!",
          text:(lg==="uz"?user.ism+" '"+(tgtGoal?.ism||"")+"' uchun pul yig'di! Sotib oldingizmi?":user.ism+" saved for '"+(tgtGoal?.ism||"")+"'! Did you buy it?"),
          maqsadId:tgtGoal?.id,
          kidId:user.id,
          kidIsm:user.ism,
          maqsadIsm:tgtGoal?.ism||"",
          summa:tgtGoal?.maqsad||0,
          sana:new Date().toISOString(),
          read:false,
          status:"pending"
        },...bn]);
        // Maqsadni "yetdi, kutmoqda" statusiga o'tkazish
        const maqUpd=(await db.g("maq_"+user.oilaId))||[];
        const finalMaq=maqUpd.map(m=>m.id===tgtGoal?.id?{...m,status:"waiting_parent"}:m);
        await db.s("maq_"+user.oilaId,finalMaq);
      }
    }catch(e){}
    addNotif("yangilik",lg==="uz"?"🎉 Orzungizga yetdingiz!":"🎉 Goal reached!",(tgtGoal?.ism||"")+" "+(lg==="uz"?"uchun pul to'plandi! Ota-onangiz tasdiqlashi kutilmoqda.":"funded! Waiting for parent confirmation."));
  } else {
    // Kattalar: "Xarid qildingizmi?" so'rash
    setMaqsadConfirmNotif({
      type:"self_confirm",
      maqsadId:tgtGoal?.id,
      maqsadIsm:tgtGoal?.ism||"",
      summa:tgtGoal?.maqsad||0,
    });
  }
}
    await db.s("maq_"+user.oilaId,u);setMaq(u);setTupId(null);setTupS("");
    ok$(isKid?(lg==="uz"?"Orzungizga "+f(summa,true)+" jamg'arildi! 🌟":"Saved!"):t.ua);
  };
  // OTA/ONA: "Sotib berdim" — maqsad tasdiqlash
  const confirmMaqParent=async(notif)=>{
    try{
      // Maqsadni "parent_confirmed" ga o'tkazish
      const maqUpd=(await db.g("maq_"+user.oilaId))||[];
      const finalMaq=maqUpd.map(m=>m.id===notif.maqsadId?{...m,status:"parent_confirmed",parentConfirmedAt:new Date().toISOString()}:m);
      await db.s("maq_"+user.oilaId,finalMaq);setMaq(finalMaq);
      // Bolaga xabar yuborish
      const kn=(await db.g("notif_"+notif.kidId))||[];
      await db.s("notif_"+notif.kidId,[{
        id:Date.now(),
        type:"maqsad_kid_confirm",
        title:lg==="uz"?"🎁 Ota/onang orzuingni amalga oshirdi!":"🎁 Your parent fulfilled your dream!",
        text:(lg==="uz"?"'"+(notif.maqsadIsm||"")+"' sotib olindi! Siz ham tasdiqlang 👇":"'"+( notif.maqsadIsm||"")+"' was bought! Confirm below 👇"),
        maqsadId:notif.maqsadId,
        maqsadIsm:notif.maqsadIsm,
        sana:new Date().toISOString(),
        read:false,
        status:"pending"
      },...kn]);
      // Notifni o'qilgan qilish
      const myN=notifs.map(n=>n.id===notif.id?{...n,read:true,status:"confirmed"}:n);
      setNotifs(myN);await db.s("notif_"+user.id,myN);
      fireConfetti();buzz(20);
      ok$(lg==="uz"?"✅ Tasdiqlandi! Farzandingizga xabar yuborildi 🎉":"✅ Confirmed! Your child was notified 🎉");
    }catch(e){ok$(lg==="uz"?"Xato yuz berdi":"Error","err");}
  };
  // BOLA: "Oldim!" — yakuniy tasdiqlash
  const confirmMaqKid=async(notif)=>{
    try{
      const maqUpd=(await db.g("maq_"+user.oilaId))||[];
      const finalMaq=maqUpd.map(m=>m.id===notif.maqsadId?{...m,status:"completed",completedAt:new Date().toISOString(),paid:true}:m);
      await db.s("maq_"+user.oilaId,finalMaq);setMaq(finalMaq);
      const myN=notifs.map(n=>n.id===notif.id?{...n,read:true,status:"confirmed"}:n);
      setNotifs(myN);await db.s("notif_"+user.id,myN);
      fireConfetti();buzz(30);
      ok$(lg==="uz"?"🎉 Barakalla! Orzuingiz amalga oshdi!":"🎉 Congratulations! Your dream came true!");
    }catch(e){}
  };
  // Katta: "Ha, xarid qildim" — maqsad yopiladi
  const confirmMaqBought=async(info)=>{
    const u=maq.map(m=>m.id===info.maqsadId?{...m,status:"completed",paid:true,completedAt:new Date().toISOString().slice(0,10)}:m);
    await db.s("maq_"+user.oilaId,u);setMaq(u);
    setMaqsadConfirmNotif(null);
    fireConfetti();buzz(30);
    ok$(lg==="uz"?"🎉 Tabriklaymiz! Maqsadingiz amalga oshdi!":"🎉 Congratulations! Goal achieved!");
  };
  // Katta: "Yo'q, voz kechdim" — pul qaytadi asosiy balansga
  const cancelMaqReturn=async(info)=>{
    // Maqsadga kiritilgan pullarni qaytarish (daromad sifatida)
    const goal=maq.find(m=>m.id===info.maqsadId);
    if(goal&&goal.jamg>0){
      const dItem={id:Date.now(),tur:"boshqa",summa:goal.jamg,izoh:(lg==="uz"?"Maqsaddan qaytarildi: ":"Goal cancelled: ")+(goal.ism||""),sana:td(),vaqt:nt(),uid:user.id};
      const dk="d_"+user.oilaId+"_"+user.id;
      await db.s(dk,[dItem,...((await db.g(dk))||[])]);
      setDar(d=>[dItem,...d]);
    }
    // Maqsadni o'chirish
    const u=maq.filter(m=>m.id!==info.maqsadId);
    await db.s("maq_"+user.oilaId,u);setMaq(u);
    setMaqsadConfirmNotif(null);
    ok$(lg==="uz"?"Maqsad bekor qilindi. Pul balansingizga qaytdi ↩️":"Goal cancelled. Funds returned to balance ↩️","warn");
  };
  const delMq=async id=>{
    // O'chirishdan oldin pul qaytarish
    const goal=maq.find(m=>m.id===id);
    if(goal&&goal.jamg>0&&!goal.paid&&!isKid){
      const dItem={id:Date.now(),tur:"boshqa",summa:goal.jamg,izoh:(lg==="uz"?"Maqsad o'chirildi, pul qaytarildi: ":"Goal deleted, funds returned: ")+(goal.ism||""),sana:td(),vaqt:nt(),uid:user.id};
      const dk="d_"+user.oilaId+"_"+user.id;
      await db.s(dk,[dItem,...((await db.g(dk))||[])]);
      setDar(d=>[dItem,...d]);
    }
    const u=maq.filter(m=>m.id!==id);
    await db.s("maq_"+user.oilaId,u);setMaq(u);
  };
  const saveEditMq=async()=>{
    if(!editMqN.trim()||!editMqS||Number(editMqS)<=0)return ok$(t.fa,"err");
    const u=maq.map(m=>m.id===editMq?{...m,ism:editMqN.trim(),maqsad:Number(editMqS)}:m);
    await db.s("maq_"+user.oilaId,u);setMaq(u);setEditMq(null);setEditMqS("");setEditMqN("");ok$(t.ua);
  };
  const delX=async item=>{
    if(item.uid!==user.id)return ok$(t.od,"warn");
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,(await db.g(key)||[]).filter(x=>x.id!==item.id));
    setXar(xar.filter(x=>!(x.id===item.id&&x.uid===user.id)));
  };
  const saveBj=async()=>{
    const v=Number(fBj);if(!v||v<=0)return ok$(t.ec,"err");
    const u={...oila,budjet:v,katLimits:fKL};await db.s("oila_"+oila.id,u);setOila(u);ok$(t.sa);
  };
  const logout=()=>{try{auth.logout();}catch(e){}localStorage.removeItem("oilaV7");setUser(null);setOila(null);setAzolar([]);setXar([]);setDar([]);setMaq([]);setScr("login");};
  // ===== BOLAGA SOVG'A/BERILGAN PUL =====
  const addGiftMoney=async()=>{
    if(!giftSum||Number(giftSum)<=0)return ok$(lg==="uz"?"Summani kiriting":"Enter amount","err");
    buzz(15);
    const summa=Number(giftSum);
    const kb={...kidBalances};kb[user.id]=(kb[user.id]||0)+summa;
    await db.s("kidbal_"+user.oilaId,kb);setKidBalances(kb);
    // Tarix uchun yozib qo'yamiz
    try{
      const hist=(await db.g("kidgift_"+user.id))||[];
      await db.s("kidgift_"+user.id,[{id:Date.now(),summa,from:giftFrom.trim()||(lg==="uz"?"Sovg'a":"Gift"),sana:td()},...hist].slice(0,100));
    }catch(e){}
    setShowGift(false);setGiftSum("");setGiftFrom("");
    ok$(lg==="uz"?"🎁 "+f(summa,true)+" cho'ntagingizga qo'shildi!":"Added to your pocket!");
    fireConfetti();
  };
  // ===== VAZIFALAR TIZIMI =====
  // Vazifa qo'shish (faqat ota-ona/oila boshi)
  const addVazifa=async()=>{
    if(!vTitle.trim()||!vReward||Number(vReward)<=0||!vAssignee)return ok$(lg==="uz"?"Vazifa nomi, mukofot va bolani tanlang":"Fill all fields","err");
    buzz(12);
    const item={id:Date.now(),title:vTitle.trim(),reward:Number(vReward),emoji:vEmoji,assignedTo:vAssignee,createdBy:user.id,status:"pending",sana:td(),doneSana:"",paidSana:""};
    const upd=[item,...vazifalar];
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    setShowAddVazifa(false);setVTitle("");setVReward("");setVAssignee("");setVEmoji("📚");
    ok$(lg==="uz"?"Vazifa qo'shildi! 🎯":"Task added!");
  };
  // Bola "bajardim" deydi
  const vazifaDone=async(id)=>{
    buzz(15);
    const upd=vazifalar.map(v=>v.id===id?{...v,status:"done",doneSana:td()}:v);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"Bajarildi deb belgilandi! Ota-ona tasdiqlaydi.":"Marked done!");
  };
  // Ota-ona tasdiqlaydi -> bolaga pul, ota/onadan kamayadi
  const vazifaApprove=async(id)=>{
    buzz(20);
    const v=vazifalar.find(x=>x.id===id);if(!v)return;
    // Ota/ona balansini tekshirish
    const myDar=dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
    const myXar=xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
    const myBal=myDar-myXar;
    if(myBal<v.reward){
      return ok$(lg==="uz"
        ?"❌ Balansingizda yetarli mablag' yo'q! Kerak: "+f(v.reward,true)+", Balans: "+f(Math.max(0,myBal),true)
        :"❌ Insufficient balance! Need: "+f(v.reward,true)+", Balance: "+f(Math.max(0,myBal),true)
      ,"err");
    }
    const upd=vazifalar.map(x=>x.id===id?{...x,status:"approved",paidSana:td()}:x);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    // Bola balansiga qo'shamiz
    const kb={...kidBalances};
    kb[v.assignedTo]=(kb[v.assignedTo]||0)+v.reward;
    await db.s("kidbal_"+user.oilaId,kb);setKidBalances(kb);
    // Ota/ona balansidan kamaytiramiz (xarajat sifatida)
    const xItem={id:Date.now(),kategoriya:"boshqa",summa:v.reward,izoh:(lg==="uz"?"Vazifa mukofoti: ":"Task reward: ")+(v.title||v.matn||""),sana:td(),vaqt:nt(),uid:user.id,repeat:false};
    const xk="x_"+user.oilaId+"_"+user.id;
    await db.s(xk,[xItem,...((await db.g(xk))||[])]);
    setXar(x=>[xItem,...x]);
    // Bolaga bildirishnoma
    try{const kn=(await db.g("notif_"+v.assignedTo))||[];await db.s("notif_"+v.assignedTo,[{id:Date.now(),type:"vazifa",text:(lg==="uz"?"🏆 Vazifa tasdiqlandi! +":"Task approved! +")+f(v.reward,true),sana:new Date().toISOString(),read:false},...kn]);}catch(e){}
    addStar(3,lg==="uz"?"Vazifa bajarildi: "+(v.title||v.matn||""):"Task completed: "+(v.title||v.matn||""));
    ok$(lg==="uz"?"Tasdiqlandi! Bola "+f(v.reward,true)+" oldi, balansingizdan ayirildi 🎉":"Approved! Kid received "+f(v.reward,true));
  };
  // Vazifani rad etish (qayta bajarsin)
  const vazifaReject=async(id)=>{
    buzz(10);
    const upd=vazifalar.map(x=>x.id===id?{...x,status:"pending",doneSana:""}:x);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"Qaytarildi. Bola qayta bajaradi.":"Sent back","warn");
  };
  const delVazifa=async(id)=>{
    buzz(10);
    const upd=vazifalar.filter(x=>x.id!==id);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"O'chirildi":"Deleted");
  };
  // Bola akkaunti yaratish (ota-ona profil orqali)
  // ===== SOVG'A/BERILGAN PUL kiritish (bola cho'ntagiga) =====
  const addGift=async()=>{
    const sum=Number(giftSum);
    if(!sum||sum<=0)return ok$(lg==="uz"?"Summani kiriting":"Enter amount","err");
    buzz(15);
    // Cho'ntak puliga qo'shamiz
    const kb={...kidBalances};
    kb[user.id]=(kb[user.id]||0)+sum;
    await db.s("kidbal_"+user.oilaId,kb);setKidBalances(kb);
    // Tarix uchun saqlaymiz (kim berdi)
    try{
      const gifts=(await db.g("gifts_"+user.id))||[];
      await db.s("gifts_"+user.id,[{id:Date.now(),sum,from:giftFrom.trim()||(lg==="uz"?"Sovg'a":"Gift"),sana:td()},...gifts].slice(0,100));
    }catch(e){}
    // Ota-onaga bildirishnoma (nazorat uchun)
    try{
      if(user.parentId){
        const pn=(await db.g("notif_"+user.parentId))||[];
        await db.s("notif_"+user.parentId,[{id:Date.now(),text:(lg==="uz"?"🎁 "+user.ism+" sovg'a puli kiritdi: +":"Gift added: +")+f(sum,true)+(giftFrom.trim()?" ("+giftFrom.trim()+")":""),sana:new Date().toISOString(),read:false},...pn]);
      }
    }catch(e){}
    setShowGift(false);setGiftSum("");setGiftFrom("");
    fireConfetti();
    ok$(lg==="uz"?"🎁 "+f(sum,true)+" cho'ntagingizga qo'shildi!":"Added to your pocket!");
  };
  const addKidAccount=async()=>{
    if(!kidName.trim()||!kidLogin.trim()||kidPw.length<4)return ok$(lg==="uz"?"Ism, login va parol (4+) kiriting":"Fill all fields","err");
    buzz(12);
    const loginKey=kidLogin.trim().toLowerCase();
    // Login band emasmi
    if(await db.gFresh("kidlogin_"+loginKey))return ok$(lg==="uz"?"Bu login band. Boshqasini tanlang.":"Login taken","err");
    try{
      const uid="kid"+Date.now();
      const ph=await hp(kidPw);
      const nu={id:uid,ism:kidName.trim(),login:loginKey,ph,oilaId:user.oilaId,rol:"kid",rel:"farzand",photo:null,parentId:user.id};
      await db.s("user_"+uid,nu);
      await db.s("kidlogin_"+loginKey,uid);
      // Oilaga qo'shamiz
      const o2={...oila,azolarIds:[...(oila.azolarIds||[]),uid]};
      await db.s("oila_"+oila.id,o2);setOila(o2);
      setAzolar([...azolar,nu]);
      setShowAddKid(false);setKidName("");setKidLogin("");setKidPw("");
      ok$(lg==="uz"?"Bola akkaunti yaratildi! 👶 Login: "+loginKey:"Kid account created!");
    }catch(e){ok$(lg==="uz"?"Xato: "+(e.code||e.message):"Error","err");}
  };
  const addQarz=async()=>{
    if(!qarzKim.trim()||!qarzSum||Number(qarzSum)<=0)return ok$(t.fa,"err");
    // Qarz BERISH holatida balans tekshiruvi
    if(qarzTur==="bergan"){
      const myDar=dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
      const myXar=xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
      const myBal=myDar-myXar;
      if(myBal<Number(qarzSum)){
        return ok$(lg==="uz"
          ?`❌ Balansda yetarli mablag' yo'q! Balans: ${f(Math.max(0,myBal),true)}, Kerak: ${f(Number(qarzSum),true)}`
          :lg==="ru"
          ?`❌ Недостаточно средств! Баланс: ${f(Math.max(0,myBal),true)}, Нужно: ${f(Number(qarzSum),true)}`
          :`❌ Insufficient balance! Balance: ${f(Math.max(0,myBal),true)}, Need: ${f(Number(qarzSum),true)}`
        ,"err");
      }
    }
    const item={id:Date.now(),uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:""};
    const upd=[item,...qarzlar];
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);

    // Telefon raqamsiz qarz — avtomatik balansga bog'lash
    const hasTel=qarzTel&&qarzTel.replace(/\D/g,"").length>=7;
    if(!hasTel){
      const sum=Number(qarzSum);
      const izohTxt=qarzTur==="olgan"
        ?(lg==="uz"?"Qarz olindi: ":lg==="ru"?"Получен долг: ":"Loan received: ")+qarzKim.trim()
        :(lg==="uz"?"Qarz berildi: ":lg==="ru"?"Выдан долг: ":"Loan given: ")+qarzKim.trim();
      if(qarzTur==="olgan"){
        // Daromad sifatida qo'shish
        const dItem={id:Date.now()+1,tur:"qarz",summa:sum,izoh:izohTxt,sana:qarzSana,vaqt:nt(),uid:user.id,fromQarz:item.id};
        const dk="d_"+user.oilaId+"_"+user.id;
        await db.s(dk,[dItem,...((await db.g(dk))||[])]);
        setDar(d=>[dItem,...d]);
        ok$(lg==="uz"?"Qarz olindi va balansga qo'shildi! +"+f(sum,true):lg==="ru"?"Долг получен и добавлен в баланс! +"+f(sum,true):"Loan added to balance! +"+f(sum,true));
      } else {
        // Xarajat sifatida qo'shish
        const xItem={id:Date.now()+1,kategoriya:"qarz",summa:sum,izoh:izohTxt,sana:qarzSana,vaqt:nt(),uid:user.id,repeat:false,fromQarz:item.id};
        const xk="x_"+user.oilaId+"_"+user.id;
        await db.s(xk,[xItem,...((await db.g(xk))||[])]);
        setXar(x=>[xItem,...x]);
        ok$(lg==="uz"?"Qarz berildi va balansdan ayirildi! -"+f(sum,true):lg==="ru"?"Долг выдан и снят с баланса! -"+f(sum,true):"Loan deducted from balance! -"+f(sum,true));
      }
    } else {
      ok$(t.xa);
    }

    setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");
  };
  const addQarzAsDaromad=async(q)=>{
    const item={id:Date.now(),tur:"boshqa",summa:q.summa,izoh:(lg==="uz"?"Qarz qaytishi: ":"Debt return: ")+q.kim,sana:td(),vaqt:nt()};
    const key="d_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setDar(d=>[{...item,uid:user.id},...d]);
    setQarzDonePrompt(null);
    ok$(lg==="uz"?"Daromadlarga qo'shildi! +"+f(q.summa,true):"Added to income!");
  };
  const addQarzAsXarajat=async(q)=>{
    const item={id:Date.now(),kategoriya:"boshqa",summa:q.summa,izoh:(lg==="uz"?"Qarz qaytarish: ":"Debt payment: ")+q.kim,sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setXar(x=>[{...item,uid:user.id},...x]);
    setQarzDonePrompt(null);
    ok$(lg==="uz"?"Xarajatlarga qo'shildi! -"+f(q.summa,true):"Added to expenses!");
  };
  // ===== TILXAT (RASPISKA) PDF - faqat ikki tomon tasdiqlagan qarzlar uchun =====
  const generateTilxat=(q)=>{
    // Faqat bog'langan va tasdiqlangan qarz
    if(!q.linked||q.linkStatus!=="accepted"){
      ok$(lg==="uz"?"Tilxat faqat ikki tomon tasdiqlagan qarzlar uchun":"Receipt only for mutually confirmed debts","err");
      return;
    }
    try{
      // Tomonlar: qarz beruvchi (kreditor) va oluvchi (qarzdor)
      // tur="olgan": men oldim (men qarzdor), kim=beruvchi
      // tur="bergan": men berdim (men kreditor), kim=oluvchi
      const menQarzdor=q.tur==="olgan";
      const qarzdor=menQarzdor?(user.ism||""):q.kim;
      const kreditor=menQarzdor?q.kim:(user.ism||"");
      const qarzdorTel=menQarzdor?(user.tel||""):q.linkedTel;
      const kreditorTel=menQarzdor?q.linkedTel:(user.tel||"");
      const summaSom=Number(q.summa||0);
      const sanaStr=q.sana||td();
      const qaytStr=q.qaytSana||(lg==="uz"?"kelishuv bo'yicha":"as agreed");

      // Summани so'z bilan (oddiy)
      const summaRaqam=fmtN(summaSom,val,false);
      // Summani so'z bilan (qavs ichida) - faqat o'zbekcha
      const summaSoz=lg==="uz"?sonSoz(summaSom):"";
      const summaText=summaRaqam+(summaSoz?" ("+summaSoz+" so'm)":"");
      const hujjatRaqami="OH-"+String(q.id).slice(-8);
      // QR -> ilovaning tekshiruv havolasi (skanerlaganda hujjat chiroyli ko'rinadi)
      // Ixcham format: uzun bo'lib QR sig'masligi uchun qisqa
      const tilxatJson=JSON.stringify({id:q.id,q:qarzdor,k:kreditor,s:summaSom,d:sanaStr,r:qaytStr,n:hujjatRaqami});
      const verifyUrl=window.location.origin+"/?tilxat="+encodeURIComponent(tilxatJson);
      // QR API uchun URL bir marta kodlanadi
      const verifyQR="https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=L&data="+encodeURIComponent(verifyUrl);

      const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        @page{size:A4;margin:2cm}
        body{font-family:'Times New Roman',serif;color:#1a1a1a;line-height:1.8;font-size:14px}
        .head{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:16px}
        .title{font-size:22px;font-weight:bold;letter-spacing:1px;margin-bottom:6px}
        .sub{font-size:12px;color:#666}
        .body{text-align:justify;margin:24px 0}
        .body p{margin:14px 0}
        .field{font-weight:bold;text-decoration:underline}
        .sum{font-size:16px;font-weight:bold;color:#000;background:#f5f5f5;padding:2px 8px}
        .sign{margin-top:48px;display:flex;justify-content:space-between}
        .sign-box{width:45%;text-align:center}
        .sign-line{border-top:1px solid #333;margin-top:40px;padding-top:6px;font-size:12px}
        .foot{margin-top:40px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:12px}
        .stamp{margin-top:20px;padding:12px;border:1.5px dashed #4f46e5;border-radius:8px;background:#4f46e508;font-size:11px;color:#4f46e5;text-align:center}
        .doc-num{text-align:right;font-size:11px;color:#666;margin-bottom:8px}
        .clause{margin:12px 0;text-align:justify}
        .num{display:inline-block;width:22px;font-weight:bold}
        .verify-box{margin-top:24px;display:flex;align-items:center;gap:16px;padding:14px 16px;border:2px solid #4f46e5;border-radius:10px;background:#4f46e506}
        .verify-box img{width:90px;height:90px}
        .legal{margin-top:18px;font-size:11px;color:#444;line-height:1.6;background:#fafafa;border-left:3px solid #4f46e5;padding:10px 14px}
      </style></head><body>
        <div class="doc-num">${lg==="uz"?"Hujjat №":lg==="ru"?"Документ №":"Document №"} ${hujjatRaqami}</div>
        <div class="head">
          <div class="title">${lg==="uz"?"TILXAT":lg==="ru"?"РАСПИСКА":"RECEIPT"}</div>
          <div class="sub">${lg==="uz"?"pul qarzi olinganligi to'g'risida":lg==="ru"?"о получении денежного займа":"of a monetary loan"}</div>
        </div>
        <div class="body">
          <p>${sanaStr}</p>
          <div class="clause"><span class="num">1.</span>${lg==="uz"?"Men":lg==="ru"?"Я":"I"}, <span class="field">${qarzdor}</span>${qarzdorTel?", tel: "+qarzdorTel:""} (${lg==="uz"?"bundan keyin — Qarzdor":lg==="ru"?"далее — Должник":"hereinafter — Debtor"}), ${lg==="uz"?"o'z ixtiyorim bilan, quyidagi shaxsdan":lg==="ru"?"добровольно получил(а) от":"voluntarily received from"} <span class="field">${kreditor}</span>${kreditorTel?", tel: "+kreditorTel:""} (${lg==="uz"?"bundan keyin — Kreditor":lg==="ru"?"далее — Кредитор":"hereinafter — Creditor"}) ${lg==="uz"?"naqd pul mablag'ini qarz sifatida oldim":lg==="ru"?"денежные средства в долг":"a monetary loan"}:</div>
          <p style="text-align:center"><span class="sum">${summaText}</span></p>
          <div class="clause"><span class="num">2.</span>${lg==="uz"?"Yuqoridagi summani":lg==="ru"?"Указанную сумму обязуюсь вернуть до":"I undertake to repay the above amount by"} <span class="field">${qaytStr}</span> ${lg==="uz"?"sanasigacha to'liq qaytarishni zimmamga olaman.":""}</div>
          <div class="clause"><span class="num">3.</span>${lg==="uz"?"Mazkur tilxat ikki tomonning erkin xohish-irodasi asosida tuzildi. Tomonlar hujjat mazmuni va oqibatlarini to'liq anglaydilar.":lg==="ru"?"Расписка составлена по доброй воле обеих сторон.":"Made by free will of both parties."}</div>
          <div class="clause"><span class="num">4.</span>${lg==="uz"?"Nizo kelib chiqqan taqdirda, tomonlar uni muzokara yo'li bilan, kelisha olmagan holda esa O'zbekiston Respublikasi qonunchiligiga muvofiq sud tartibida hal etadilar.":lg==="ru"?"Споры решаются переговорами или в суде.":"Disputes resolved by negotiation or court."}</div>
        </div>
        <div class="sign">
          <div class="sign-box"><div class="sign-line">${lg==="uz"?"Qarzdor":lg==="ru"?"Должник":"Debtor"}<br>${qarzdor}<br>${lg==="uz"?"(imzo)":lg==="ru"?"(подпись)":"(signature)"}</div></div>
          <div class="sign-box"><div class="sign-line">${lg==="uz"?"Kreditor":lg==="ru"?"Кредитор":"Creditor"}<br>${kreditor}<br>${lg==="uz"?"(imzo)":lg==="ru"?"(подпись)":"(signature)"}</div></div>
        </div>
        <div class="verify-box">
          <img src="${verifyQR}" alt="QR"/>
          <div>
            <div style="font-size:13px;font-weight:bold;color:#4f46e5">🔒 ${lg==="uz"?"Elektron tasdiq":lg==="ru"?"Электронное подтверждение":"Electronic confirmation"}</div>
            <div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">${lg==="uz"?"Ushbu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. QR kod hujjat haqiqiyligini bildiradi.":lg==="ru"?"Подтверждён обеими сторонами. QR удостоверяет подлинность.":"Confirmed by both parties. QR verifies authenticity."}</div>
            <div style="font-size:10px;color:#888;margin-top:4px">${lg==="uz"?"Hujjat raqami":"Doc"}: ${hujjatRaqami} · ID: ${q.id}</div>
          </div>
        </div>
        <div class="legal">
          <b>${lg==="uz"?"Huquqiy eslatma:":lg==="ru"?"Правовая справка:":"Legal note:"}</b> ${lg==="uz"?"Mazkur tilxat O'zbekiston Respublikasi Fuqarolik kodeksining qarz shartnomasiga oid normalariga muvofiq tuzilgan va tomonlar o'rtasidagi kelishuvni qayd etuvchi yozma dalil hisoblanadi. To'liq yuridik kuchga ega bo'lishi uchun notarial tasdiqlash yoki E-IMZO tavsiya etiladi. Aniq holatlar bo'yicha malakali yuristga murojaat qiling.":lg==="ru"?"Расписка составлена согласно нормам ГК о займе. Для полной силы рекомендуется нотариус или ЭЦП.":"Drawn up per civil-law loan provisions. For full force, notarization or e-signature is recommended."}
        </div>
        <div class="foot">
          ${lg==="uz"?"Oila Hisobchi ilovasi tomonidan yaratilgan":lg==="ru"?"Создано в Oila Hisobchi":"Generated by Oila Hisobchi"} · ${new Date().toLocaleDateString("uz-UZ")}
        </div>
      </body></html>`;

      const w=window.open("","_blank");
      if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);}
      else{ok$(lg==="uz"?"Pop-up bloklangan. Ruxsat bering.":"Pop-up blocked","err");}
    }catch(e){console.error(e);ok$(lg==="uz"?"Tilxat yaratishda xato":"Error","err");}
  };
  const markQarzPaid=async(id)=>{
    const q=qarzlar.find(x=>x.id===id);
    // Bog'langan + tasdiqlangan qarz: ikkinchi tomon tasdiqlashi kerak
    if(q&&q.linked&&q.linkStatus==="accepted"&&q.linkedTel){
      const targetUid=await db.g("tel_"+q.linkedTel);
      if(targetUid){
        // O'z qarzimni "qaytarish kutilmoqda" holatiga o'tkazaman
        const upd=qarzlar.map(x=>x.id===id?{...x,payStatus:"pending",payBy:user.id}:x);
        await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
        // Ikkinchi tomonga qaytarish so'rovi yuboraman
        const payReq={id:"pay_"+id,debtId:id,fromUid:user.id,fromIsm:user.ism,fromTel:user.tel||"",toTel:q.linkedTel,summa:q.summa,kim:q.kim,tur:q.tur,sana:td(),type:"payment"};
        const targetReqs=(await db.g("qreq_"+q.linkedTel))||[];
        await db.s("qreq_"+q.linkedTel,[payReq,...targetReqs]);
        // Bildirishnoma
        const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qarz qaytarish so'rovi":"Debt return request",body:(user.ism||"")+" "+(lg==="uz"?"qarzni qaytardim deyapti":"says debt is returned")+": "+fmtN(q.summa,val,true),sana:new Date().toISOString(),read:false};
        const rC=(await db.g("notif_"+targetUid))||[];
        await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
        ok$(lg==="uz"?"Qaytarish so'rovi yuborildi! Tasdiqlanishini kuting.":"Return request sent! Awaiting confirmation.");
        return;
      }
    }
    // Oddiy qarz: darhol qaytarilgan
    const upd=qarzlar.map(x=>x.id===id?{...x,paid:true,paidSana:td()}:x);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);ok$(t.ua);
    if(q)setQarzDonePrompt(q);
  };
  const acceptPayReq=async(req)=>{
    // Qaytarishni tasdiqlash: o'z qarzimni paid qilaman
    const upd=qarzlar.map(q=>q.id===req.debtId?{...q,paid:true,paidSana:td(),payStatus:"confirmed"}:q);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    const doneQ=qarzlar.find(q=>q.id===req.debtId);if(doneQ)setQarzDonePrompt({...doneQ,paid:true});
    // So'rovni o'chiraman
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    // Boshlovchining qarzini ham paid qilaman + unga "xarajat/daromad qo'shish" so'rovini saqlayman
    const fromUser=await db.g("user_"+req.fromUid);
    if(fromUser){
      const fq=(await db.g("qarz_"+fromUser.oilaId))||[];
      const fromDebt=fq.find(q=>q.id===req.debtId);
      await db.s("qarz_"+fromUser.oilaId,fq.map(q=>q.id===req.debtId?{...q,paid:true,paidSana:td(),payStatus:"confirmed"}:q));
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qaytarish tasdiqlandi":"Return confirmed",body:(user.ism||"")+" "+(lg==="uz"?"qarz qaytarilganini tasdiqladi":"confirmed the return"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
      // Boshlovchi uchun "qo'shish so'rovi" saqlayman (u ilovani ochganда chiqadi)
      if(fromDebt){await db.s("paydone_"+req.fromUid,{tur:fromDebt.tur,summa:fromDebt.summa,kim:fromDebt.kim,id:fromDebt.id});}
    }
    // Tasdiqlovchining o'ziga ham prompt (agar u ham qarz yozган bo'lsa)
    const myDebt=qarzlar.find(q=>q.id===req.debtId);
    if(myDebt)setQarzDonePrompt({...myDebt,paid:true});
    ok$(lg==="uz"?"Qaytarish tasdiqlandi!":"Return confirmed!");
  };
  const rejectPayReq=async(req)=>{
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    // Boshlovchining qarzini faol holatga qaytaraman
    const fromUser=await db.g("user_"+req.fromUid);
    if(fromUser){
      const fq=(await db.g("qarz_"+fromUser.oilaId))||[];
      await db.s("qarz_"+fromUser.oilaId,fq.map(q=>q.id===req.debtId?{...q,payStatus:null,payBy:null}:q));
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qaytarish rad etildi":"Return rejected",body:(user.ism||"")+" "+(lg==="uz"?"qaytarishni rad etdi":"rejected the return"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
    }
    ok$(lg==="uz"?"Qaytarish rad etildi":"Return rejected","warn");
  };
  const applyPartial=async()=>{
    if(!partialQarz||!partialSum||Number(partialSum)<=0)return ok$(t.ea,"err");
    const pay=Number(partialSum);
    const q=partialQarz;
    if(pay>=q.summa){
      // To'liq qaytarish - normal flow
      setPartialQarz(null);setPartialSum("");
      markQarzPaid(q.id);
      return;
    }
    // Qisman: summani kamaytiramiz, tarixga yozamiz
    const paidSoFar=(q.paidPart||0)+pay;
    const upd=qarzlar.map(x=>x.id===q.id?{...x,summa:x.summa-pay,paidPart:paidSoFar,asl:x.asl||q.summa+(q.paidPart||0)}:x);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    setPartialQarz(null);setPartialSum("");
    ok$(lg==="uz"?"Qisman qaytarildi: "+f(pay,true)+". Qoldi: "+f(q.summa-pay,true):"Partial: "+f(pay,true)+" paid");
    // Daromad/xarajatga qo'shish taklifi
    setQarzDonePrompt({...q,summa:pay,_partial:true});
  };
  const isAdmin=normTel(user?.tel)===ADMIN_TEL;
  const loadAdminStats=async()=>{
    setAdminLoad(true);setScr("admin");
    try{
      const all=await db.all();
      const users=all.filter(d=>d.id.startsWith("oilaV7_user_"));
      const oilas=all.filter(d=>d.id.startsWith("oilaV7_oila_"));
      const tels=all.filter(d=>d.id.startsWith("oilaV7_tel9_"));
      // Sanalar bo'yicha
      const now=new Date();const todayStr=now.toISOString().slice(0,10);
      const weekAgo=new Date(now-7*864e5).toISOString().slice(0,10);
      const monthAgo=new Date(now-30*864e5).toISOString().slice(0,10);
      let todayU=0,weekU=0,monthU=0;
      users.forEach(u=>{const v=u.v||{};const uid=v.id||"";const ts=parseInt((uid.match(/\d+/)||[])[0]||"0");if(ts){const ds=new Date(ts).toISOString().slice(0,10);if(ds===todayStr)todayU++;if(ds>=weekAgo)weekU++;if(ds>=monthAgo)monthU++;}});
      // Moliyaviy hajm
      let totX=0,totD=0,xCount=0,dCount=0;
      all.forEach(d=>{
        if(d.id.includes("_x_")&&Array.isArray(d.v)){d.v.forEach(x=>{totX+=Number(x.summa||0);xCount++;});}
        if(d.id.includes("_d_")&&Array.isArray(d.v)){d.v.forEach(x=>{totD+=Number(x.summa||0);dCount++;});}
      });
      // Premium oilalar
      const premOilas=oilas.filter(o=>(o.v||{}).premium).length;
      // Fikr-mulohazalar
      const fbDoc=all.find(d=>d.id==="oilaV7_feedback_all");
      const feedbacks=(fbDoc&&Array.isArray(fbDoc.v))?fbDoc.v:[];
      const avgRating=feedbacks.filter(f=>f.rating>0).length?Math.round(feedbacks.filter(f=>f.rating>0).reduce((s,f)=>s+f.rating,0)/feedbacks.filter(f=>f.rating>0).length*10)/10:0;
      setAdminStats({
        totalUsers:users.length,totalOilas:oilas.length,totalTels:tels.length,
        todayU,weekU,monthU,totX,totD,xCount,dCount,premOilas,
        avgPerOila:oilas.length?Math.round(users.length/oilas.length*10)/10:0,
        docCount:all.length,
        feedbacks:feedbacks.slice(0,50),fbCount:feedbacks.length,avgRating
      });
    }catch(e){console.error(e);ok$("Xato: "+e.message,"err");}
    setAdminLoad(false);
  };
  const toggleReportAccess=async(memberId)=>{
    if(user?.rol!=="bosh"||!oila)return;
    const cur=oila.reportAccess||[];
    const upd=cur.includes(memberId)?cur.filter(x=>x!==memberId):[...cur,memberId];
    const o2={...oila,reportAccess:upd};
    await db.s("oila_"+oila.id,o2);setOila(o2);
    ok$(lg==="uz"?"Ruxsat yangilandi":"Access updated");
  };
  const acceptXReq=async(req)=>{
    const newReqs=xReqs.filter(r=>r.id!==req.id);
    setXReqs(newReqs);await db.s("xreq_"+user.id,newReqs);
    if(req.kind==="income"){
      // PUL OLDIM: daromadga qo'shiladi
      const item={id:req.id,tur:req.tur||"sovga",summa:req.summa,izoh:req.izoh,sana:req.sana,vaqt:nt()};
      const key="d_"+user.oilaId+"_"+user.id;
      await db.s(key,[item,...((await db.g(key))||[])]);
      setDar(d=>[{...item,uid:user.id},...d]);
      const rN={id:Date.now()+Math.random(),type:"daromad",title:lg==="uz"?"Pul qabul qilindi":"Money accepted",body:(user.ism||"")+" "+(lg==="uz"?"pulni qabul qildi":"accepted the money"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
      ok$(lg==="uz"?"Daromadga qo'shildi!":"Added to income!");
      return;
    }
    // XARAJAT: xarajatga qo'shiladi
    const item={id:req.id,kategoriya:req.kategoriya,summa:req.summa,izoh:req.izoh+" ("+(lg==="uz"?"so'rov: ":"req: ")+req.fromIsm+")",sana:req.sana,vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setXar(x=>[{...item,uid:user.id},...x]);
    const rN={id:Date.now()+Math.random(),type:"xarajat",title:lg==="uz"?"Xarajat tasdiqlandi":"Expense confirmed",body:(user.ism||"")+" "+(lg==="uz"?"xarajatni tasdiqladi":"confirmed the expense"),sana:new Date().toISOString(),read:false};
    const rC=(await db.g("notif_"+req.fromUid))||[];
    await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
    ok$(lg==="uz"?"Xarajat qo'shildi!":"Expense added!");
  };
  const rejectXReq=async(req)=>{
    const newReqs=xReqs.filter(r=>r.id!==req.id);
    setXReqs(newReqs);await db.s("xreq_"+user.id,newReqs);
    ok$(lg==="uz"?"Rad etildi":"Rejected","warn");
  };
  const sendQarzReminder=async(q)=>{
    if(!q.linked||!q.linkedTel){
      // Oddiy qarz - Telegram orqali eslatma
      const today=new Date().toISOString().slice(0,10);
      const overdue=q.qaytSana&&q.qaytSana<today;
      const msg=overdue?(lg==="uz"?"Assalomu alaykum! "+f(q.summa,true)+" qarzni qaytarish muddati o'tdi. Iltimos, imkoniyat bo'lsa qaytaring.":"Reminder: "+f(q.summa,true)+" debt is overdue."):(lg==="uz"?"Assalomu alaykum! "+f(q.summa,true)+" qarz haqida eslatma. Qaytarish sanasi: "+(q.qaytSana||"-"):"Reminder about "+f(q.summa,true)+" debt.");
      try{navigator.clipboard.writeText(msg);ok$(lg==="uz"?"Eslatma matni nusxalandi!":"Reminder copied!");}catch(e){ok$(msg);}
      return;
    }
    // Bog'langan qarz - ilova ichida bildirishnoma
    const targetUid=await db.g("tel_"+q.linkedTel);
    if(targetUid){
      const today=new Date().toISOString().slice(0,10);
      const overdue=q.qaytSana&&q.qaytSana<today;
      const rN={id:Date.now()+Math.random(),type:"qarz",title:overdue?(lg==="uz"?"⏰ Qarz muddati o'tdi":"Debt overdue"):(lg==="uz"?"🔔 Qarz eslatmasi":"Debt reminder"),body:(user.ism||"")+" "+(overdue?(lg==="uz"?"qarzni qaytarishni so'ramoqda (muddati o'tgan)":"asks to return overdue debt"):(lg==="uz"?"qarz haqida eslatma yubordi":"sent a debt reminder"))+": "+fmtN(q.summa,val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+targetUid))||[];
      await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
      ok$(lg==="uz"?"Eslatma yuborildi!":"Reminder sent!");
    }else{
      ok$(lg==="uz"?"Foydalanuvchi topilmadi":"User not found","warn");
    }
  };
  const delQarz=async(id)=>{
    const upd=qarzlar.filter(q=>q.id!==id);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
  };
  const addNotif=async(type,title,body)=>{
    if(!user)return;
    const n={id:Date.now()+Math.random(),type,title,body,sana:new Date().toISOString(),read:false};
    const key="notif_"+user.id;
    const cur=(await db.g(key))||[];
    const upd=[n,...cur].slice(0,100);
    await db.s(key,upd);setNotifs(upd);
  };
  const markNotifRead=async(id)=>{
    const upd=notifs.map(n=>n.id===id?{...n,read:true}:n);
    setNotifs(upd);await db.s("notif_"+user.id,upd);
  };
  const markAllRead=async()=>{
    const upd=notifs.map(n=>({...n,read:true}));
    setNotifs(upd);await db.s("notif_"+user.id,upd);
  };
  const clearNotifs=async()=>{
    setNotifs([]);await db.s("notif_"+user.id,[]);ok$(lg==="uz"?"Tozalandi":"Cleared");
  };
  const sendQarzRequest=async()=>{
    if(!qarzKim.trim()||!qarzSum||Number(qarzSum)<=0)return ok$(t.fa,"err");
    if(qarzLinked){
      if(!qarzTel.trim())return ok$(lg==="uz"?"Telefon raqamini kiriting":"Enter phone number","err");
      const cleanTel=qarzTel.trim().replace(/[^0-9+]/g,"");
      const targetUid=await db.g("tel_"+cleanTel);
      if(!targetUid){setInviteQarz({tel:cleanTel,kim:qarzKim.trim(),summa:Number(qarzSum)});return;}
      if(targetUid===user.id){return ok$(lg==="uz"?"O'zingizga yubora olmaysiz":"Cannot send to yourself","err");}
      const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,fromTel:user.tel||"",toTel:cleanTel,tur:qarzTur,summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,status:"pending"};
      const targetReqs=(await db.g("qreq_"+cleanTel))||[];
      await db.s("qreq_"+cleanTel,[req,...targetReqs]);
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Yangi qarz so'rovi":"New debt request",body:(user.ism||"")+" - "+fmtN(Number(qarzSum),val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+targetUid))||[];
      await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
      const myItem={id:req.id,uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:"",linked:true,linkedTel:cleanTel,linkStatus:"pending"};
      const upd=[myItem,...qarzlar];
      await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
      setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");setQarzTel("");setQarzLinked(false);
      ok$(lg==="uz"?"Qarz so'rovi yuborildi!":"Debt request sent!");
    }else{await addQarz();}
  };
  const acceptQarzReq=async(req)=>{
    const myTur=req.tur==="bergan"?"olgan":"bergan";
    const item={id:req.id,tur:myTur,kim:req.fromIsm,summa:req.summa,izoh:req.izoh,sana:req.sana,qaytSana:req.qaytSana,paid:false,paidSana:"",linked:true,linkedTel:req.fromTel,linkStatus:"accepted"};
    const upd=[item,...qarzlar];
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    // Sender statusini yangilash
    const senderUser=await db.g("user_"+req.fromUid);
    if(senderUser){
      const sq=(await db.g("qarz_"+senderUser.oilaId))||[];
      await db.s("qarz_"+senderUser.oilaId,sq.map(q=>q.id===req.id?{...q,linkStatus:"accepted"}:q));
      // SENDER qarz BERDI → uning balansidan kamaysin (xarajat sifatida)
      if(req.tur==="bergan"){
        const xItem={id:Date.now()+2,kategoriya:"qarz",summa:req.summa,izoh:(lg==="uz"?"Qarz berildi (tasdiqlangan): ":"Loan given (confirmed): ")+user.ism,sana:req.sana,vaqt:nt(),uid:senderUser.id,repeat:false,fromQarz:req.id};
        const xk="x_"+senderUser.oilaId+"_"+senderUser.id;
        await db.s(xk,[xItem,...((await db.g(xk))||[])]);
      }
    }
    // MEN qarz OLDIM → balansimga qo'shilsin (daromad sifatida)
    if(myTur==="olgan"){
      const dItem={id:Date.now()+1,tur:"qarz",summa:req.summa,izoh:(lg==="uz"?"Qarz olindi (tasdiqlangan): ":"Loan received (confirmed): ")+req.fromIsm,sana:req.sana,vaqt:nt(),uid:user.id,fromQarz:req.id};
      const dk="d_"+user.oilaId+"_"+user.id;
      await db.s(dk,[dItem,...((await db.g(dk))||[])]);
      setDar(d=>[dItem,...d]);
    }
    // MEN qarz BERDIM → balansimdan kamaysin (xarajat sifatida)
    if(myTur==="bergan"){
      const xItem={id:Date.now()+1,kategoriya:"qarz",summa:req.summa,izoh:(lg==="uz"?"Qarz berildi (tasdiqlangan): ":"Loan given (confirmed): ")+req.fromIsm,sana:req.sana,vaqt:nt(),uid:user.id,repeat:false,fromQarz:req.id};
      const xk="x_"+user.oilaId+"_"+user.id;
      await db.s(xk,[xItem,...((await db.g(xk))||[])]);
      setXar(x=>[xItem,...x]);
    }
    ok$(lg==="uz"?"Qarz tasdiqlandi va balansga bog'landi! ✅":"Debt confirmed and linked to balance! ✅");
  };
  const rejectQarzReq=async(req)=>{
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    const senderUser=await db.g("user_"+req.fromUid);
    if(senderUser){const sq=(await db.g("qarz_"+senderUser.oilaId))||[];await db.s("qarz_"+senderUser.oilaId,sq.map(q=>q.id===req.id?{...q,linkStatus:"rejected"}:q));}
    ok$(lg==="uz"?"Rad etildi":"Rejected","warn");
  };
  const refreshQarzReqs=async()=>{
    if(user?.tel){setQarzReqs((await db.g("qreq_"+user.tel))||[]);setQarzlar((await db.g("qarz_"+user.oilaId))||[]);setNotifs((await db.g("notif_"+user.id))||[]);ok$(lg==="uz"?"Yangilandi":"Refreshed");}
  };
  const activatePremium=async()=>{
    localStorage.setItem("oilaV7Prem","1");setIsPremium(true);setShowPremModal(false);
    // Oila obyektiga ham premium belgisi (a'zolar limiti uchun)
    if(user?.oilaId&&user?.rol==="bosh"){try{const o=await db.g("oila_"+user.oilaId);if(o){o.premium=true;await db.s("oila_"+user.oilaId,o);setOila(o);}}catch(e){}}
    ok$(lg==="uz"?"Premium faollashtirildi!":"Premium activated!");
  };
  const toggleNotif=async()=>{
    if(!notifEnabled){
      if("Notification" in window){
        const perm=await Notification.requestPermission();
        if(perm==="granted"){setNotifEnabled(true);localStorage.setItem("oilaV7Notif","1");ok$(lg==="uz"?"Bildirishnomalar yoqildi!":"Notifications enabled!");}
        else{ok$(lg==="uz"?"Ruxsat berilmadi.":"Permission denied.","err");}
      }else{ok$(lg==="uz"?"Brauzer qo'llamaydi.":"Not supported.","warn");}
    }else{setNotifEnabled(false);localStorage.setItem("oilaV7Notif","0");ok$(lg==="uz"?"O'chirildi.":"Disabled.");}
  };
  const saveNotifTime=(time)=>{setNotifTime(time);localStorage.setItem("oilaV7NotifT",time);ok$(lg==="uz"?"Vaqt saqlandi: "+time:"Time saved: "+time);};
  const parseCheckQR=(text)=>{
    const res={summa:0,sana:"",raqam:"",raw:text};
    try{
      // O'zbekiston SOLIQ E-POS cheki QR format:
      // https://ofd.soliq.uz/check?t=YYYYMMDDHHMMSS&r=CHEKNOMER&s=INVOYSNOMER&i=SUMMA_TIYIN
      // i= jami summa (tiyinda, ya'ni so'm*100)
      // s= invoys/chek raqami (bu summa EMAS!)
      // t= vaqt (YYYYMMDDHHmmss)
      // r= kassa raqami
      let m;

      // 1) "Jami to'lov" yoki "Jami:" qatoridan summa — URL yoki matn ichida
      // Matn formati: "Jami to'lov:\n58 000,00" yoki "Jami: 58000.00"
      const jamiMatch=text.match(/[Jj]ami[\s\S]{0,30}?([0-9][0-9 .,]*[0-9])/);
      if(jamiMatch){
        const clean=jamiMatch[1].replace(/[ ]/g,"").replace(/,([0-9]{2})$/,"").replace(/\.([0-9]{2})$/,"").replace(/[,.']/g,"");
        const v=parseInt(clean,10);
        if(v>0&&v<=999999999){res.summa=v;}
      }

      // 2) URL parametrlaridan: i= (tiyinda so'm*100)
      if(!res.summa){
        m=text.match(/[?&]i=([0-9]+)/i);
        if(m){
          const v=parseInt(m[1],10);
          res.summa=Math.round(v/100);
        }
      }

      // 3) URL: s= (eski format, lekin invoys raqami emas)
      if(!res.summa){
        m=text.match(/[?&]s=([0-9]+(?:\.[0-9]+)?)/i);
        if(m){
          let v=parseFloat(m[1]);
          if(!m[1].includes(".")&&v>=10000){v=v/100;}
          if(v>0&&v<=99999999){res.summa=Math.round(v);}
        }
      }

      // 3) Sana: t=YYYYMMDDHHmmss (birinchi 8 raqam - sana)
      m=text.match(/[?&]t=([0-9]{8,14})/i);
      if(m){const d=m[1];res.sana=d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6,8);}
      else{
        // c=YYYYMMDD eski format
        m=text.match(/[?&]c=([0-9]{8})/i);
        if(m){const d=m[1];res.sana=d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6,8);}
      }

      // 4) Chek raqami: r= parametri
      m=text.match(/[?&]r=([0-9]+)/i);
      if(m)res.raqam=m[1];
    }catch(e){}
    return res;
  };
  const stopScanner=()=>{
    if(scanRafRef.current){cancelAnimationFrame(scanRafRef.current);scanRafRef.current=null;}
    if(scanStreamRef.current){scanStreamRef.current.getTracks().forEach(tr=>tr.stop());scanStreamRef.current=null;}
    setShowScanner(false);setScanMsg("");
  };
  // ===== AQLLI CSV/EXCEL IMPORT =====
  const parseCSVLine=(line)=>{
    const out=[];let cur="";let q=false;
    for(let i=0;i<line.length;i++){const c=line[i];
      if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}
      else if((c===","||c===";"||c==="\t")&&!q){out.push(cur);cur="";}
      else cur+=c;
    }
    out.push(cur);return out;
  };
  const smartParseNum=(s)=>{
    if(s==null)return NaN;
    let v=String(s).replace(/\s/g,"").replace(/[^0-9.,\-]/g,"");
    // 1.234,56 (yevropa) yoki 1,234.56 (amerika) - oxirgi ajratuvchini nuqta deb olamiz
    const lastComma=v.lastIndexOf(",");const lastDot=v.lastIndexOf(".");
    if(lastComma>lastDot){v=v.replace(/\./g,"").replace(",",".");}
    else{v=v.replace(/,/g,"");}
    return parseFloat(v);
  };
  const handleImportFile=async(file)=>{
    if(!file)return;
    try{
      let text="";
      const name=(file.name||"").toLowerCase();
      if(name.endsWith(".xlsx")||name.endsWith(".xls")){
        ok$(lg==="uz"?"Excel uchun avval CSV saqlang. CSV yuklang.":"Save as CSV first.","warn");return;
      }
      text=await file.text();
      const lines=text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length<2){ok$(lg==="uz"?"Fayl bo'sh yoki noto'g'ri":"Empty file","err");return;}
      // Sarlavha qatorini topish
      const header=parseCSVLine(lines[0]).map(h=>h.toLowerCase().trim());
      // Ustunlarni aqlli aniqlash
      const findCol=(keys)=>header.findIndex(h=>keys.some(k=>h.includes(k)));
      let dateCol=findCol(["sana","date","дата","tarix","time","vaqt"]);
      let amtCol=findCol(["summa","amount","сумма","miqdor","pul","sum"]);
      let descCol=findCol(["izoh","desc","описание","tavsif","comment","narration","maqsad","operatsiya","operation","payee","kim"]);
      // Agar topilmasa - ustunlarni qiymatdan aniqlash
      const sampleRows=lines.slice(1,Math.min(6,lines.length)).map(parseCSVLine);
      if(amtCol<0){
        for(let c=0;c<header.length;c++){if(sampleRows.every(r=>!isNaN(smartParseNum(r[c]))&&r[c]&&r[c].trim())){amtCol=c;break;}}
      }
      if(dateCol<0){
        for(let c=0;c<header.length;c++){if(sampleRows.some(r=>/\d{1,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,4}/.test(r[c]||""))){dateCol=c;break;}}
      }
      if(descCol<0){descCol=header.findIndex((h,i)=>i!==dateCol&&i!==amtCol);}
      if(amtCol<0){ok$(lg==="uz"?"Summa ustuni topilmadi":"Amount column not found","err");return;}
      // Qatorlarni o'qish
      const parsed=[];
      for(let i=1;i<lines.length;i++){
        const cells=parseCSVLine(lines[i]);
        const rawAmt=smartParseNum(cells[amtCol]);
        if(isNaN(rawAmt)||rawAmt===0)continue;
        // Sana normalizatsiya
        let sana=td();
        if(dateCol>=0&&cells[dateCol]){
          const m=cells[dateCol].match(/(\d{1,4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,4})/);
          if(m){let y,mo,d;if(m[1].length===4){y=m[1];mo=m[2];d=m[3];}else{d=m[1];mo=m[2];y=m[3];}if(y.length===2)y="20"+y;sana=y+"-"+String(mo).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
        }
        const isIncome=rawAmt>0;
        parsed.push({
          sel:true,
          kind:isIncome?"income":"expense",
          summa:Math.abs(rawAmt),
          sana,
          izoh:(descCol>=0?cells[descCol]:"")||"",
          kategoriya:"boshqa"
        });
      }
      if(parsed.length===0){ok$(lg==="uz"?"O'qiladigan yozuv topilmadi":"No records found","err");return;}
      // Avtomatik kategoriya (kalit so'zlar)
      parsed.forEach(p=>{
        const t2=(p.izoh||"").toLowerCase();
        if(/market|magazin|oziq|food|продукт|savdo/.test(t2))p.kategoriya="oziq";
        else if(/benzin|taxi|yo'l|transport|fuel|такси|metro/.test(t2))p.kategoriya="transport";
        else if(/dorixona|shifo|klinika|health|аптека|med/.test(t2))p.kategoriya="sog";
        else if(/svet|gaz|suv|komunal|utility|комм/.test(t2))p.kategoriya="kommunal";
        else if(/kiyim|cloth|одежда/.test(t2))p.kategoriya="kiyim";
      });
      setImportRows(parsed);setImportStep("review");
    }catch(e){console.error(e);ok$(lg==="uz"?"Fayl o'qishda xato":"File read error","err");}
  };
  const confirmImport=async()=>{
    const sel=importRows.filter(r=>r.sel);
    if(sel.length===0){ok$(lg==="uz"?"Hech narsa tanlanmadi":"Nothing selected","err");return;}
    const newX=[],newD=[];
    sel.forEach((r,i)=>{
      const item={id:Date.now()+i,summa:Number(r.summa),izoh:r.izoh.slice(0,60),sana:r.sana,vaqt:nt(),repeat:false};
      if(r.kind==="income"){newD.push({...item,tur:"boshqa"});}
      else{newX.push({...item,kategoriya:r.kategoriya});}
    });
    if(newX.length){const mk="x_"+user.oilaId+"_"+user.id;const cur=(await db.g(mk))||[];await db.s(mk,[...newX,...cur]);setXar(x=>[...newX.map(n=>({...n,uid:user.id})),...x]);}
    if(newD.length){const dk="d_"+user.oilaId+"_"+user.id;const cur=(await db.g(dk))||[];await db.s(dk,[...newD,...cur]);setDar(d=>[...newD.map(n=>({...n,uid:user.id})),...d]);}
    setShowImport(false);setImportRows([]);setImportStep("upload");
    ok$((lg==="uz"?"Import qilindi: ":"Imported: ")+sel.length+(lg==="uz"?" ta yozuv":" records"));
  };
  const startScanner=async()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setShowScanner(true);setScanMsg(lg==="uz"?"Kamera ochilmoqda...":"Opening camera...");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      scanStreamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      setScanMsg(lg==="uz"?"QR kodni ramkaga joylang":"Point QR into frame");
      if("BarcodeDetector" in window){
        const detector=new window.BarcodeDetector({formats:["qr_code"]});
        const scan=async()=>{
          if(!videoRef.current||!scanStreamRef.current)return;
          try{
            const codes=await detector.detect(videoRef.current);
            if(codes&&codes.length>0){
              const raw=codes[0].rawValue;
              stopScanner();
              setScanMsg(lg==="uz"?"Chek ma'lumotlari yuklanmoqda...":"Loading receipt...");
              // URL bo'lsa - sahifani fetch qilib, Jami summani olish
              const isUrl=/^https?:\/\//i.test(raw);
              if(isUrl){
                try{
                  // CORS muammosi bo'lgani uchun allorigins proxy orqali
                  const proxyUrl="https://api.allorigins.win/get?url="+encodeURIComponent(raw);
                  const resp=await fetch(proxyUrl,{signal:AbortSignal.timeout(8000)});
                  const data=await resp.json();
                  const html=data.contents||"";
                  // HTML ichidan "Jami to'lov" yoki "Jami" yonidagi summani qidirish
                  // Ko'p formatlar: "58 000,00" yoki "58000.00" yoki "58,000"
                  let summa=0;
                  // "Jami" so'zidan keyin kelgan birinchi pul summasi
                  const jamiRgx=/[Jj]ami[^<]{0,60}?([\d][\d\s.,]*[\d])/;
                  const jm=html.replace(/<[^>]+>/g," ").match(jamiRgx);
                  if(jm){
                    // Raqamni tozalash: bo'sh joy va ming ajratgichlarni olib tashlash
                    const numStr=jm[1].replace(/\s/g,"").replace(/,(\d{2})$/,"").replace(/\.(\d{2})$/,"").replace(/[,.\s]/g,"");
                    const v=parseInt(numStr,10);
                    if(v>=100&&v<=999999999){summa=v;}
                  }
                  if(summa>0){
                    setFS(String(summa));
                    // Sana: URL dan t= parametri
                    const tm=raw.match(/[?&]t=(\d{8})/i);
                    if(tm){const d=tm[1];setFSn(d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6,8));}
                    const rm=raw.match(/[?&]r=(\d+)/i);
                    if(rm)setFIz((lg==="uz"?"Chek #":"Receipt #")+rm[1]);
                    ok$(lg==="uz"?"✓ "+f(summa,true)+" — tekshiring va saqlang":"✓ "+f(summa,true)+" — verify & save");
                  } else {
                    ok$(lg==="uz"?"Summa topilmadi, qo'lda kiriting":"Amount not found, enter manually","warn");
                  }
                }catch(err){
                  ok$(lg==="uz"?"Chek yuklanmadi, qo'lda kiriting":"Receipt load failed, enter manually","warn");
                }
              } else {
                // URL emas - matn ichidan Jami summani qidirish
                const jm=raw.replace(/<[^>]+>/g," ").match(/[Jj]ami[^\n]{0,60}?([\d][\d\s.,]*[\d])/);
                if(jm){
                  const numStr=jm[1].replace(/\s/g,"").replace(/,(\d{2})$/,"").replace(/\.(\d{2})$/,"").replace(/[,.\s]/g,"");
                  const v=parseInt(numStr,10);
                  if(v>=100&&v<=999999999){
                    setFS(String(v));
                    ok$(lg==="uz"?"✓ "+f(v,true)+" — tekshiring va saqlang":"✓ "+f(v,true)+" — verify & save");
                    return;
                  }
                }
                ok$(lg==="uz"?"Summa topilmadi, qo'lda kiriting":"Amount not found, enter manually","warn");
              }
              return;
            }
          }catch(e){}
          scanRafRef.current=requestAnimationFrame(scan);
        };
        scanRafRef.current=requestAnimationFrame(scan);
      }else{setScanMsg(lg==="uz"?"Brauzer QR skanerini qo'llamaydi.":"QR scanner not supported.");}
    }catch(e){
      const isDenied=(e.name==="NotAllowedError"||(e.message||"").indexOf("denied")>=0||(e.message||"").indexOf("Permission")>=0);
      if(isDenied){setScanMsg(lg==="uz"?"Kamera ruxsati berilmadi. Sozlamalardan ruxsat bering yoki qo'lda kiriting.":"Camera denied. Allow in settings or enter manually.");}
      else{setScanMsg((lg==="uz"?"Kamera ochilmadi. Qo'lda kiriting.":"Camera unavailable.")+" ("+(e.name||"")+")");}
    }
  };
  const downloadFile=(content,filename,mime)=>{
    try{
      const blob=new Blob([content],{type:mime});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
    }catch(e){return false;}
  };
  const exportExcel=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setExportLoading(true);
    try{
      const month=tm();
      const esc=s=>{const v=String(s==null?"":s);if(v.indexOf('"')>=0||v.indexOf(";")>=0){return '"'+v.split('"').join('""')+'"';}return v;};
      // Tanlangan filtrga mos (Hammasi yoki a'zo); ruxsatsiz a'zo - faqat o'zi
      const exFil=canSeeReport?hisFil:user?.id;
      const exX=exFil==="all"?bX:bX.filter(x=>x.uid===exFil);
      const exD=exFil==="all"?bD:bD.filter(d=>d.uid===exFil);
      const exjX=exX.reduce((s,x)=>s+Number(x.summa||0),0);
      const exjD=exD.reduce((s,d)=>s+Number(d.summa||0),0);
      const rows=[];
      rows.push([lg==="uz"?"OILA HISOBOTI":"FAMILY REPORT",month].join(";"));
      rows.push("");
      rows.push([lg==="uz"?"Jami daromad":"Total income",exjD].join(";"));
      rows.push([lg==="uz"?"Jami xarajat":"Total expense",exjX].join(";"));
      rows.push([lg==="uz"?"Balans":"Balance",exjD-exjX].join(";"));
      rows.push([lg==="uz"?"Budjet":"Budget",bdj].join(";"));
      rows.push("");
      const bx=exX;
      if(bx.length>0){
        rows.push([lg==="uz"?"XARAJATLAR":"EXPENSES"].join(";"));
        rows.push(["#",lg==="uz"?"Sana":"Date",lg==="uz"?"Kategoriya":"Category",lg==="uz"?"Izoh":"Note",lg==="uz"?"Kim":"Who",lg==="uz"?"Summa":"Amount"].map(esc).join(";"));
        bx.forEach((x,i)=>rows.push([i+1,x.sana,KN[lg][KATS.findIndex(k=>k.id===x.kategoriya)]||"",x.izoh||"",gN(x.uid),x.summa].map(esc).join(";")));
        rows.push("");
      }
      const bd=exD;
      if(bd.length>0){
        rows.push([lg==="uz"?"DAROMADLAR":"INCOME"].join(";"));
        rows.push(["#",lg==="uz"?"Sana":"Date",lg==="uz"?"Tur":"Type",lg==="uz"?"Izoh":"Note",lg==="uz"?"Kim":"Who",lg==="uz"?"Summa":"Amount"].map(esc).join(";"));
        bd.forEach((d,i)=>rows.push([i+1,d.sana,DN[lg][DARS.findIndex(dr=>dr.id===d.tur)]||"",d.izoh||"",gN(d.uid),d.summa].map(esc).join(";")));
        rows.push("");
      }
      if(qarzlar.length>0){
        rows.push([lg==="uz"?"QARZLAR":"DEBTS"].join(";"));
        rows.push(["#",lg==="uz"?"Kim":"Person",lg==="uz"?"Tur":"Type",lg==="uz"?"Summa":"Amount",lg==="uz"?"Sana":"Date",lg==="uz"?"Holat":"Status"].map(esc).join(";"));
        qarzlar.forEach((q,i)=>rows.push([i+1,q.kim,q.tur==="bergan"?(lg==="uz"?"Berdim":"Lent"):(lg==="uz"?"Oldim":"Borrowed"),q.summa,q.sana,q.paid?(lg==="uz"?"Qaytarilgan":"Returned"):(lg==="uz"?"Faol":"Active")].map(esc).join(";")));
      }
      const csv="\uFEFF"+rows.join("\n");
      const okk=downloadFile(csv,"OilaHisobot_"+month+".csv","text/csv;charset=utf-8;");
      ok$(okk?(lg==="uz"?"Yuklab olindi! Excel da oching.":"Downloaded!"):(lg==="uz"?"Xatolik":"Error"),okk?"ok":"err");
    }catch(e){ok$((lg==="uz"?"Xatolik: ":"Error: ")+e.message,"err");}
    setExportLoading(false);
  };
  const exportPDF=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    try{
      const month=tm();
      // PDF tanlangan filtrga mos: "Hammasi" yoki tanlangan a'zo. Ruxsatsiz a'zo - faqat o'zi.
      const pdfFil=canSeeReport?hisFil:user?.id;
      const pX=pdfFil==="all"?bX:bX.filter(x=>x.uid===pdfFil);
      const pD=pdfFil==="all"?bD:bD.filter(d=>d.uid===pdfFil);
      const pdfWho=pdfFil==="all"?(lg==="uz"?"Butun oila":lg==="ru"?"Вся семья":"Whole family"):(azolar.find(a=>a.id===pdfFil)?.ism||"");
      const jX2=pX.reduce((s,x)=>s+Number(x.summa||0),0);
      const jD2=pD.reduce((s,d)=>s+Number(d.summa||0),0);
      const katRows=KATS.map((k,i)=>{const tot=pX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0);if(!tot)return"";const pct=jX2>0?Math.round(tot/jX2*100):0;return "<tr><td>"+KN[lg][i]+"</td><td style='text-align:right'>"+tot.toLocaleString()+" so'm</td><td style='text-align:center'>"+pct+"%</td></tr>";}).join("");
      const xRows=pX.slice(0,40).map(x=>"<tr><td>"+x.sana+"</td><td>"+KN[lg][KATS.findIndex(k=>k.id===x.kategoriya)]+"</td><td>"+(x.izoh||"")+"</td><td style='text-align:right'>"+x.summa.toLocaleString()+"</td><td>"+gN(x.uid)+"</td></tr>").join("");
      const qActive=qarzlar.filter(q=>!q.paid&&(pdfFil==="all"?(canSeeReport):(q.uid===pdfFil||(!q.uid&&pdfFil===user?.id))));
      const qRows=qActive.map(q=>"<tr><td>"+q.kim+"</td><td>"+(q.tur==="bergan"?(lg==="uz"?"Berdim":"Lent"):(lg==="uz"?"Oldim":"Borrowed"))+"</td><td style='text-align:right'>"+q.summa.toLocaleString()+"</td><td>"+(q.qaytSana||"-")+"</td></tr>").join("");
      // Har a'zo bo'yicha (faqat ruxsatli/bosh va 2+ a'zo)
      let memberSection="";
      if(canSeeReport&&azolar.length>1&&pdfFil==="all"){
        const memRows=azolar.map(a=>{
          const ax=bX.filter(x=>x.uid===a.id).reduce((s,x)=>s+Number(x.summa||0),0);
          const ad=bD.filter(d=>d.uid===a.id).reduce((s,d)=>s+Number(d.summa||0),0);
          const rel=RELATIONS.find(r=>r.id===a.rel);
          return "<tr><td>"+(a.ism||"")+(a.rol==="bosh"?" \ud83d\udc51":"")+"</td><td>"+(rel?(rel[lg]||rel.uz):"-")+"</td><td style='text-align:right' class='g'>+"+ad.toLocaleString()+"</td><td style='text-align:right' class='r'>-"+ax.toLocaleString()+"</td><td style='text-align:right'>"+(ad-ax).toLocaleString()+"</td></tr>";
        }).join("");
        memberSection="<h2>"+(lg==="uz"?"Oila a'zolari bo'yicha":lg==="ru"?"По участникам":"By members")+"</h2><table><thead><tr><th>"+(lg==="uz"?"A'zo":"Member")+"</th><th>"+(lg==="uz"?"Kim":"Relation")+"</th><th style='text-align:right'>"+(lg==="uz"?"Daromad":"Income")+"</th><th style='text-align:right'>"+(lg==="uz"?"Xarajat":"Expense")+"</th><th style='text-align:right'>"+(lg==="uz"?"Balans":"Balance")+"</th></tr></thead><tbody>"+memRows+"</tbody></table>";
      }
      // Referal QR - kimning hisoboti bo'lsa, shu taklif qiladi
      const refLink=window.location.origin+"/?ref="+(user?.id||"");
      const H="<\u0021DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Hisobot "+month+"</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px;font-size:22px}h2{color:#374151;margin-top:26px;font-size:16px}table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}.sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}.btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}.foot{margin-top:34px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}.hdr{display:flex;align-items:center;gap:12px;margin-bottom:6px}.logo{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo span{color:#fff;font-size:24px}.qr{display:flex;align-items:center;gap:14px;justify-content:center;margin-top:20px;padding:14px;background:#f9fafb;border-radius:12px}.qr img{width:80px;height:80px;border-radius:8px}@media print{.btn{display:none}}</style></head><body><div class='hdr'><div class='logo'><span>\ud83d\udcb0</span></div><div><div style='font-size:20px;font-weight:800;color:#6366f1'>Oila Hisobchi</div><div style='font-size:12px;color:#6b7280'>"+(oila&&oila.nomi?oila.nomi:"Oila")+" \u00b7 "+pdfWho+" \u00b7 "+month+"</div></div></div><div style='border-bottom:3px solid #6366f1;margin-bottom:14px'></div><p style='color:#6b7280;font-size:12px'>"+(lg==="uz"?"Yaratildi":"Generated")+": "+new Date().toLocaleString("uz-UZ")+"</p><div class='sum'><div class='box'><div class='lbl'>"+(lg==="uz"?"Daromad":"Income")+"</div><div class='val g'>"+jD2.toLocaleString()+"</div></div><div class='box'><div class='lbl'>"+(lg==="uz"?"Xarajat":"Expense")+"</div><div class='val r'>"+jX2.toLocaleString()+"</div></div><div class='box'><div class='lbl'>"+(lg==="uz"?"Balans":"Balance")+"</div><div class='val "+(jD2-jX2>=0?"g":"r")+"'>"+(jD2-jX2).toLocaleString()+"</div></div></div><h2>"+(lg==="uz"?"Kategoriyalar":"Categories")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Kategoriya":"Category")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th style='text-align:center'>%</th></tr></thead><tbody>"+(katRows||"<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>")+"</tbody></table><h2>"+(lg==="uz"?"Xarajatlar":"Expenses")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Sana":"Date")+"</th><th>"+(lg==="uz"?"Kategoriya":"Category")+"</th><th>"+(lg==="uz"?"Izoh":"Note")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th>"+(lg==="uz"?"Kim":"Who")+"</th></tr></thead><tbody>"+(xRows||"<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>")+"</tbody></table>"+(qActive.length>0?"<h2>"+(lg==="uz"?"Faol qarzlar":"Active debts")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Kim":"Person")+"</th><th>"+(lg==="uz"?"Tur":"Type")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th>"+(lg==="uz"?"Qaytarish":"Return")+"</th></tr></thead><tbody>"+qRows+"</tbody></table>":"")+"<div class='qr'><img src='https://api.qrserver.com/v1/create-qr-code/?size=160x160&data="+encodeURIComponent(refLink)+"' alt='QR'/><div style='text-align:left'><div style='font-size:13px;font-weight:700;color:#374151'>"+(lg==="uz"?(user?.ism||"")+" sizni taklif qiladi":(user?.ism||"")+" invites you")+"</div><div style='font-size:11px;color:#6b7280;margin-top:3px'>"+(lg==="uz"?"QR kodni skanerlab ilovaga qo'shiling":lg==="ru"?"Сканируйте QR чтобы присоединиться":"Scan QR to join the app")+"</div></div></div><div class='foot'>"+(lg==="uz"?"Bu hisobot Oila Hisobchi ilovasi tomonidan yaratilgan":lg==="ru"?"Отчёт создан в приложении Oila Hisobchi":"Generated by Oila Hisobchi app")+" \u00b7 "+month+"</div><button class='btn' onclick='window.print()'>"+(lg==="uz"?"PDF saqlash / Chop etish":"Save PDF / Print")+"</button></body></html>";
      const w=window.open("","_blank");
      if(w&&w.document){w.document.write(H);w.document.close();ok$(lg==="uz"?"PDF tayyor! Pastdagi tugmani bosing.":"PDF ready!");}
      else{const okk=downloadFile(H,"OilaHisobot_"+month+".html","text/html;charset=utf-8;");ok$(okk?(lg==="uz"?"HTML yuklandi! Oching va chop eting.":"HTML downloaded!"):(lg==="uz"?"Xatolik":"Error"),okk?"ok":"err");}
    }catch(e){ok$((lg==="uz"?"Xatolik: ":"Error: ")+e.message,"err");}
  };
  const sendFeedback=async()=>{
    if(!fbText.trim()&&fbRating===0)return ok$(lg==="uz"?"Baho yoki izoh kiriting":"Add rating or text","err");
    setFbSending(true);
    try{
      const fb={id:Date.now(),uid:user?.id||"anon",ism:user?.ism||"",type:fbType,rating:fbRating,text:fbText.trim(),sana:new Date().toISOString()};
      const all=(await db.g("feedback_all"))||[];
      await db.s("feedback_all",[fb,...all].slice(0,500));
      setFbRating(0);setFbText("");setFbType("taklif");
      ok$(lg==="uz"?"Rahmat! Fikringiz yuborildi.":"Thank you!");
    }catch(e){ok$(lg==="uz"?"Xatolik":"Error","err");}
    setFbSending(false);
  };
  const aiAdv=async()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setAdvL(true);setAdv("");setScr("maslahat");
    const mX=xar.filter(x=>x.sana&&x.sana.indexOf(tm())===0);
    const mD=dar.filter(d=>d.sana&&d.sana.indexOf(tm())===0);
    const totX=mX.reduce((s,x)=>s+Number(x.summa||0),0);
    const totD=mD.reduce((s,d)=>s+Number(d.summa||0),0);
    const budget=oila&&oila.budjet?oila.budjet:2000000;
    const bal=totD-totX;
    const dayN=new Date().getDate();
    const tips=[];
    const L=(uz,ru,en)=>lg==="uz"?uz:lg==="ru"?ru:en;
    if(totD>0||totX>0){
      if(bal>=0){tips.push("\u2705 "+L("Bu oy balansingiz ijobiy: +"+f(bal,true)+". Barakali boring!","Баланс положительный: +"+f(bal,true),"Positive balance: +"+f(bal,true)));}
      else{tips.push("\u26a0\ufe0f "+L("Bu oy xarajat daromaddan "+f(-bal,true)+" ko'p. Tejashga e'tibor bering.","Расходы превышают доход на "+f(-bal,true),"Expenses exceed income by "+f(-bal,true)));}
    }
    const bpct=budget>0?Math.round(totX/budget*100):0;
    if(bpct>=100){tips.push("\ud83d\udd34 "+L("Budjet "+bpct+"% ishlatildi! Keyingi oy uchun limitni qayta ko'rib chiqing.","Бюджет израсходован на "+bpct+"%!","Budget used "+bpct+"%!"));}
    else if(bpct>=80){tips.push("\ud83d\udfe1 "+L("Budjetning "+bpct+"% sarflandi. Oy oxirigacha ehtiyot bo'ling.","Израсходовано "+bpct+"%.","Used "+bpct+"%."));}
    else if(bpct>0&&dayN<=15&&bpct<40){tips.push("\ud83d\udc4d "+L("Ajoyib! Oy yarmida faqat "+bpct+"% sarfladingiz.","Отлично! Только "+bpct+"%.","Great! Only "+bpct+"%."));}
    const katTotals=KATS.map((k,i)=>({nom:KN[lg][i],sum:mX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)})).filter(k=>k.sum>0).sort((a,b)=>b.sum-a.sum);
    if(katTotals.length>0&&totX>0){const top=katTotals[0];const topPct=Math.round(top.sum/totX*100);tips.push("\ud83d\udcca "+L("Eng ko'p xarajat: "+top.nom+" ("+topPct+"%). "+(topPct>50?"Bu juda yuqori — kamaytirish mumkinmi?":"Nazoratda saqlang."),top.nom+" - "+topPct+"%",top.nom+" is "+topPct+"%"));}
    if(totD>0){
      const savePct=bal>0?Math.round(bal/totD*100):0;
      if(savePct>=20){tips.push("\ud83d\udcb0 "+L("Daromadning "+savePct+"% jamg'ardingiz. A'lo natija!","Сэкономлено "+savePct+"%!","Saved "+savePct+"%!"));}
      else if(savePct>0){tips.push("\ud83d\udca1 "+L("Daromadning faqat "+savePct+"% qoldi. 20% jamg'arish tavsiya etiladi.","Сэкономлено "+savePct+"%.","Only "+savePct+"% saved."));}
      else if(bal<0){tips.push("\ud83d\udca1 "+L("Bu oy jamg'arma bo'lmadi. Daromadning 10% ini avval ajrating.","Нет сбережений.","No savings."));}
    }
    if(maq.length>0){
      const ng=maq.filter(m=>!m.paid).map(m=>({...m,pct:Math.round(m.jamg/m.maqsad*100)})).sort((a,b)=>b.pct-a.pct)[0];
      if(ng){if(ng.pct>=80&&ng.pct<100){tips.push("\ud83c\udfaf "+L("'"+ng.ism+"' maqsadi "+ng.pct+"% bajarildi! Yana "+f(ng.maqsad-ng.jamg,true)+" qoldi.","Цель '"+ng.ism+"' на "+ng.pct+"%!","Goal '"+ng.ism+"' at "+ng.pct+"%!"));}else if(ng.pct<30){tips.push("\ud83c\udfaf "+L("'"+ng.ism+"' uchun har oy summa ajrating.","Откладывайте на '"+ng.ism+"'.","Save for '"+ng.ism+"'."));}}
    }else{tips.push("\ud83c\udfaf "+L("Maqsad qo'ying — jamg'arish uchun motivatsiya beradi.","Поставьте цель.","Set a goal."));}
    const aQ=qarzlar.filter(q=>!q.paid);
    const meOwe=aQ.filter(q=>q.tur==="olgan").reduce((s,q)=>s+q.summa,0);
    if(meOwe>0){tips.push("\ud83d\udcb8 "+L("Sizda "+f(meOwe,true)+" qarz bor. Eng eskisidan boshlab to'lang.","Долг: "+f(meOwe,true),"You owe "+f(meOwe,true)));}
    const genTips=[
      L("50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga (ijara, oziq-ovqat), 30% xohish va o'yin-kulgiga, 20% jamg'armaga yo'naltiring.","Правило 50/30/20: 50% на нужды, 30% на желания, 20% на сбережения.","Use 50/30/20 rule: 50% needs, 30% wants, 20% savings."),
      L("Kichik tejamkorlik — katta baraka. \"Tomchi-tomchi ko'l bo'lur.\" Har kuni 5 ming so'mlik ortiqcha xaridni chetga surib qo'ysangiz, bir yilda salkam 2 million so'm tejaladi.","Малая экономия — большая выгода. Откладывая по 5000 в день, за год сэкономите ~2 млн.","Small savings add up. Saving 5000 daily gives ~2M a year."),
      L("Xarid ro'yxati — eng yaxshi qalqon. Do'kon yoki bozorga kirishdan avval oilaviy xarid ro'yxatini tuzing va faqat undagi mahsulotlarni oling. Bu impulsiv xaridlardan himoya qiladi.","Список покупок — лучшая защита. Составьте список заранее и покупайте только по нему.","A shopping list is your best shield. Make one before shopping and stick to it."),
      L("Rejali ish buzilmas. Oylik daromad kelishi bilan birinchi navbatda kommunal va majburiy to'lovlarni chetga oling. Shunda qolgan pulni bemalol rejalashtirasiz.","Сначала оплатите обязательные платежи, затем планируйте остаток.","Pay mandatory bills first when income arrives, then plan the rest."),
      L("Moliyaviy xavfsizlik yostig'i: oila uchun kamida 3 oylik xarajatga teng zaxira fondi yarating. Daromad olgan zahoti 10% ini zaxiraga o'tkazing.","Создайте резерв на 3 месяца расходов. Откладывайте 10% сразу при получении дохода.","Build a 3-month emergency fund. Move 10% to savings as soon as income arrives.")
    ];
    tips.push("\ud83d\udca1 "+genTips[new Date().getDate()%genTips.length]);
    if(totX===0&&totD===0){setAdv(L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting, keyin shaxsiy tahlil olasiz!","Нет данных. Добавьте расходы и доходы.","No data yet. Add expenses and income."));}
    else{setAdv(L("\ud83d\udcc8 "+tm()+" tahlili\n\n","Анализ "+tm()+"\n\n","Analysis "+tm()+"\n\n")+tips.join("\n\n"));}
    setTimeout(()=>setAdvL(false),400);
  };
  const bX=useMemo(()=>xar.filter(x=>x.sana?.startsWith(tm())),[xar]);
  const bD=useMemo(()=>dar.filter(d=>d.sana?.startsWith(tm())),[dar]);
  const jX=bX.reduce((s,x)=>s+Number(x.summa||0),0);
  const jD=bD.reduce((s,d)=>s+Number(d.summa||0),0);
  // Shaxsiy (faqat o'z) hisob - bosh ekran salomlashuvi uchun
  const myX=bX.filter(x=>x.uid===user?.id).reduce((s,x)=>s+Number(x.summa||0),0);
  const myD=bD.filter(d=>d.uid===user?.id).reduce((s,d)=>s+Number(d.summa||0),0);
  const myBal=myD-myX;
  const bdj=oila?.budjet||2000000;
  const pct=Math.min(100,Math.round((jX/bdj)*100));
  const bRng=pct>=90?th.rd:pct>=70?th.am:th.gr;
  const bal=jD-jX;
  const canSeeReport=user?.rol==="bosh"||(oila?.reportAccess||[]).includes(user?.id);
  const gN=uid=>azolar.find(a=>a.id===uid)?.ism||"?";
  const gP=uid=>azolar.find(a=>a.id===uid)?.photo||null;
  const lineD=useMemo(()=>{const days=[];const now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push({k:d.toLocaleDateString("uz-UZ",{weekday:"short"}),x:Math.round(xar.filter(x=>x.sana===k).reduce((s,x)=>s+Number(x.summa||0),0)/1000),d:Math.round(dar.filter(x=>x.sana===k).reduce((s,x)=>s+Number(x.summa||0),0)/1000)});}return days;},[xar,dar]);
  const barD=useMemo(()=>{const m=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k=d.toISOString().slice(0,7);m.push({o:d.toLocaleDateString("uz-UZ",{month:"short"}),v:Math.round(xar.filter(x=>x.sana?.startsWith(k)).reduce((s,x)=>s+Number(x.summa||0),0)/1000)});}return m;},[xar]);
  const pieD=useMemo(()=>KATS.map((k,i)=>({name:KN[lg][i],value:bX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0),color:k.c})).filter(d=>d.value>0),[bX,lg]);
  const srchR=useMemo(()=>{if(!srch.trim())return[];const q=srch.toLowerCase();return[...xar.filter(x=>x.izoh?.toLowerCase().includes(q)),...dar.filter(d=>d.izoh?.toLowerCase().includes(q))].slice(0,20);},[srch,xar,dar]);

  const TxRow=({item})=>{
    const isX=!!item.kategoriya;
    const ki=isX?KATS.findIndex(k=>k.id===item.kategoriya):-1;
    const di=!isX?DARS.findIndex(d=>d.id===item.tur):-1;
    const cl=isX?KATS[ki]?.c||"#64748b":DARS[di]?.c||"#64748b";
    return <div style={{...S.cd,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
      <div style={{width:38,height:38,borderRadius:11,background:cl+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {isX?<KatIco id={item.kategoriya} c={cl} s={20}/>:<DarIco id={item.tur} c={cl} s={20}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:th.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {item.izoh}{item.repeat&&<span style={{marginLeft:5}}>{Ico.repeat(th.ac)}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
          <Av src={gP(item.uid)} name={gN(item.uid)} size={14} ac={th.ac}/>
          <span style={{fontSize:10,color:th.t2}}>{gN(item.uid)} · {item.sana}</span>
        </div>
      </div>
      <span style={{fontWeight:700,color:isX?th.rd:th.gr,fontSize:13,whiteSpace:"nowrap"}}>{isX?"-":"+"}{f(item.summa,true)}</span>
      {isX&&item.uid===user.id&&<button onClick={()=>delX(item)} style={{background:"none",border:"none",cursor:"pointer",flexShrink:0,display:"flex",padding:"2px"}}>{Ico.trash(th.t2)}</button>}
    </div>;
  };
  const SL=({ch})=><div style={S.sec}>{ch}</div>;
  const SC=({label,value,color})=><div style={{...S.cd,textAlign:"center",padding:"12px 8px",margin:0}}><div style={{fontSize:9,color:th.t2,marginBottom:3,fontWeight:600}}>{label}</div><div style={{fontSize:16,fontWeight:800,color}}>{value}</div></div>;

  if(boot)return <div style={{...S.pg,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>{Ico.wallet(th.ac)}</div>;

  // ===== TILXAT TEKSHIRUV SAHIFASI (QR skanerlaganda) =====
  if(verifyTilxat){
    const v=verifyTilxat;
    return <div style={{...S.pg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",background:dark?"#0f172a":"#f8fafc"}}>
      <div className="anim-scaleIn" style={{background:th.sur,borderRadius:24,padding:"30px 24px",maxWidth:420,width:"100%",border:"1px solid "+th.bor,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div className="anim-bounceIn" style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 14px",boxShadow:"0 12px 36px #10b98155"}}>✓</div>
          <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{lg==="uz"?"Hujjat tasdiqlandi":lg==="ru"?"Документ подтверждён":"Document verified"}</div>
          <div style={{fontSize:12,color:th.gr,fontWeight:600,marginTop:4}}>🔒 {lg==="uz"?"Oila Hisobchi rasmiy tilxati":"Official Oila Hisobchi receipt"}</div>
        </div>
        <div style={{background:th.bg,borderRadius:16,padding:"18px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Hujjat raqami":"Document №"}</span><span style={{fontSize:12,fontWeight:700,color:th.ac,fontFamily:"monospace"}}>{v.n}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qarzdor":"Debtor"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{v.q}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Kreditor":"Creditor"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{v.k}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Summa":"Amount"}</span><span style={{fontSize:15,fontWeight:800,color:th.gr}}>{f(Number(v.s),true)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Berilgan sana":"Date"}</span><span style={{fontSize:13,fontWeight:600,color:th.t1}}>{v.d}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qaytarish":"Return by"}</span><span style={{fontSize:13,fontWeight:600,color:th.t1}}>{v.r}</span></div>
        </div>
        <div style={{fontSize:11,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18,background:th.ac+"0d",borderRadius:10,padding:"10px 12px"}}>{lg==="uz"?"Bu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. Ma'lumotlar QR kod orqali tekshirildi.":"Confirmed by both parties in the app. Verified via QR."}</div>
        <button onClick={()=>{setVerifyTilxat(null);try{window.history.replaceState({},"",window.location.pathname);}catch(e){}}} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Ilovaga o'tish":lg==="ru"?"Открыть приложение":"Open app"}</button>
      </div>
    </div>;
  }
  // Onboarding
  if(onbStep>=0&&onbStep<ONB_SLIDES.length)return <OnboardingPage th={th} lg={lg} setLg={setLg} dark={dark} onbStep={onbStep} setOnbStep={setOnbStep}/>;
  // Login
  if(scr==="login")return <LoginPage th={th} S={S} lg={lg} setLg={setLg} dark={dark} reg={reg} setReg={setReg} kidLoginMode={kidLoginMode} setKidLoginMode={setKidLoginMode} join={join} setJoin={setJoin} fIsm={fIsm} setFIsm={setFIsm} fEm={fEm} setFEm={setFEm} fPw={fPw} setFPw={setFPw} fON={fON} setFON={setFON} fKd={fKd} setFKd={setFKd} fTel={fTel} setFTel={setFTel} fDial={fDial} setFDial={setFDial} fCountry={fCountry} setFCountry={setFCountry} showValDD={showValDD} setShowValDD={setShowValDD} fRel={fRel} setFRel={setFRel} showCountryDD={showCountryDD} setShowCountryDD={setShowCountryDD} showRelDD={showRelDD} setShowRelDD={setShowRelDD} showPw={showPw} setShowPw={setShowPw} showResetScreen={showResetScreen} setShowResetScreen={setShowResetScreen} showResetConfirm={showResetConfirm} setShowResetConfirm={setShowResetConfirm} resetEmail={resetEmail} setResetEmail={setResetEmail} resetInput={resetInput} setResetInput={setResetInput} resetSent={resetSent} setResetSent={setResetSent} fRefCode={fRefCode} setFRefCode={setFRefCode} val={val} setVal={setVal} tst={tst} ok$={ok$} doGoogleLogin={doGoogleLogin} handleAuth={handleAuth} handleResetPw={handleResetPw} t={t} isPremium={isPremium}/>;
  const navItems=isKid
    ?[
      {id:"bosh",   lb:t.home},
      {id:"vazifa", lb:lg==="uz"?"Vazifa":lg==="ru"?"Задания":"Tasks"},
      {id:"maqsad", lb:t.goal},
    ]
    :[
      {id:"bosh",   lb:t.home},
      {id:"qarz",   lb:lg==="uz"?"Qarz":lg==="ru"?"Долг":"Debt"},
      {id:"qoshish",pr:true},
      {id:"maqsad", lb:t.goal},
      {id:"hisobot",lb:t.rep},
    ];

  return <div style={S.pg}>
    <Tst msg={tst.msg} type={tst.type} th={th}/>
    <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={doPhoto}/>
    {/* VAZIFA QO'SHISH MODAL */}
    {showAddVazifa&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAddVazifa(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:14,textAlign:"center"}}>🎯 {lg==="uz"?"Yangi vazifa":lg==="ru"?"Новое задание":"New task"}</div>
        <label style={S.lb}>{lg==="uz"?"Tayyor vazifalardan tanlang":lg==="ru"?"Готовые задания":"Quick templates"}</label>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
          {VAZIFA_PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>{buzz(6);setVTitle(p[lg]||p.uz);setVEmoji(p.emoji);setVReward(String(p.reward));}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:vTitle===(p[lg]||p.uz)?th.ac+"18":th.sur,border:"1.5px solid "+(vTitle===(p[lg]||p.uz)?th.ac:th.bor),borderRadius:13,padding:"10px 12px",cursor:"pointer",minWidth:80}}>
              <span style={{fontSize:24}}>{p.emoji}</span>
              <span style={{fontSize:10,fontWeight:600,color:th.t1,textAlign:"center",lineHeight:1.2}}>{p[lg]||p.uz}</span>
              <span style={{fontSize:9,color:th.gr,fontWeight:700}}>{f(p.reward,true)}</span>
            </button>
          ))}
        </div>
        <div style={{height:1,background:th.bor,marginBottom:14}}/>
        <label style={S.lb}>{lg==="uz"?"Yoki o'zingiz yozing":lg==="ru"?"Или напишите сами":"Or write your own"}</label>
        <input style={S.ip} value={vTitle} onChange={e=>setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Xonani yig'ishtirish":"e.g. Clean room"}/>
        <label style={S.lb}>{lg==="uz"?"Belgi (emoji)":"Emoji"}</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {["📚","🧹","🛏️","🍽️","🦷","🏃","🕌","🎨","🐕","💧","🌱","📝"].map(em=>(
            <button key={em} onClick={()=>{buzz(6);setVEmoji(em);}} style={{width:44,height:44,borderRadius:12,border:"2px solid "+(vEmoji===em?th.ac:th.bor),background:vEmoji===em?th.ac+"18":th.sur,fontSize:22,cursor:"pointer"}}>{em}</button>
          ))}
        </div>
        <label style={S.lb}>{lg==="uz"?"Mukofot (so'm)":lg==="ru"?"Награда":"Reward"}</label>
        <MoneyInput value={vReward} onChange={setVReward} placeholder="20 000" th={th} style={S.ip}/>
        <label style={S.lb}>{lg==="uz"?"Kimga (farzand)":lg==="ru"?"Кому":"Assign to"}</label>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
          {azolar.filter(a=>a.rol==="kid"||a.id!==user.id).length===0?<div style={{fontSize:12,color:th.t2,textAlign:"center",padding:"12px",background:th.sur,borderRadius:12}}>{lg==="uz"?"Avval profil orqali bola akkaunti yarating":"Create a kid account first via Profile"}</div>:azolar.filter(a=>a.id!==user.id).map(a=>(
            <button key={a.id} onClick={()=>{buzz(6);setVAssignee(a.id);}} style={{display:"flex",alignItems:"center",gap:10,background:vAssignee===a.id?th.ac+"18":th.sur,border:"2px solid "+(vAssignee===a.id?th.ac:th.bor),borderRadius:13,padding:"11px 14px",cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:th.ac+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.rol==="kid"?"👶":"👤"}</div>
              <span style={{fontSize:14,fontWeight:600,color:th.t1}}>{a.ism}</span>
              {a.rol==="kid"&&<span style={{fontSize:9,background:th.gr+"22",color:th.gr,borderRadius:6,padding:"2px 7px",fontWeight:700,marginLeft:"auto"}}>KIDS</span>}
            </button>
          ))}
        </div>
        <button onClick={addVazifa} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Vazifa berish":lg==="ru"?"Создать":"Create task"}</button>
      </div>
    </div>}
    {/* BOLA AKKAUNTI QO'SHISH MODAL */}
    {/* SOVG'A KIRITISH MODAL */}
    {showGift&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowGift(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:42,textAlign:"center",marginBottom:8}}>🎁</div>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:6,textAlign:"center"}}>{lg==="uz"?"Sovg'a puli":lg==="ru"?"Подарок":"Gift money"}</div>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:18,lineHeight:1.5}}>{lg==="uz"?"Senga kimdir pul berdimi? Cho'ntagingga qo'sh!":"Did someone give you money? Add it!"}</div>
        <label style={S.lb}>{lg==="uz"?"Qancha?":"How much?"}</label>
        <MoneyInput value={giftSum} onChange={setGiftSum} placeholder="50 000" th={th} style={S.ip}/>
        <label style={S.lb}>{lg==="uz"?"Kim berdi? (ixtiyoriy)":"From whom? (optional)"}</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {[{e:"👵",uz:"Buvi",ru:"Бабушка",en:"Grandma"},{e:"👴",uz:"Bobo",ru:"Дедушка",en:"Grandpa"},{e:"🧔",uz:"Amaki",ru:"Дядя",en:"Uncle"},{e:"👩",uz:"Xola",ru:"Тётя",en:"Aunt"},{e:"🎂",uz:"Tug'ilgan kun",ru:"День рождения",en:"Birthday"},{e:"🎉",uz:"Hayit",ru:"Праздник",en:"Holiday"}].map((g,i)=>(
            <button key={i} onClick={()=>{buzz(6);setGiftFrom(g[lg]||g.uz);}} style={{display:"flex",alignItems:"center",gap:5,background:giftFrom===(g[lg]||g.uz)?th.gr+"18":th.sur,border:"1.5px solid "+(giftFrom===(g[lg]||g.uz)?th.gr:th.bor),borderRadius:11,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:600,color:th.t1}}>{g.e} {g[lg]||g.uz}</button>
          ))}
        </div>
        <input style={S.ip} value={giftFrom} onChange={e=>setGiftFrom(e.target.value)} placeholder={lg==="uz"?"Yoki o'zingiz yozing...":"Or write..."}/>
        <button onClick={addGift} style={{...S.bt("#10b981","#059669"),marginTop:6,marginBottom:0}}>{lg==="uz"?"Cho'ntagimga qo'shish":"Add to my pocket"}</button>
      </div>
    </div>}
    {/* SOVG'A PUL MODAL (bola) */}
    {showGift&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowGift(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:42,textAlign:"center",marginBottom:8}}>🎁</div>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:6,textAlign:"center"}}>{lg==="uz"?"Sovg'a pul qo'shish":lg==="ru"?"Подарочные деньги":"Add gift money"}</div>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:18,lineHeight:1.5}}>{lg==="uz"?"Buving, boboing yoki qarindoshing bergan pulni cho'ntagingga qo'sh":lg==="ru"?"Добавь деньги от бабушки или дедушки":"Add money from grandparents or relatives"}</div>
        <label style={S.lb}>{lg==="uz"?"Qancha pul?":"How much?"}</label>
        <MoneyInput value={giftSum} onChange={setGiftSum} placeholder="50 000" th={th} style={S.ip} autoFocus/>
        <label style={S.lb}>{lg==="uz"?"Kim berdi? (ixtiyoriy)":"From whom? (optional)"}</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {[{e:"👵",uz:"Buvim",ru:"Бабушка",en:"Grandma"},{e:"👴",uz:"Bobom",ru:"Дедушка",en:"Grandpa"},{e:"🎂",uz:"Tug'ilgan kun",ru:"День рождения",en:"Birthday"},{e:"🎉",uz:"Hayit",ru:"Праздник",en:"Holiday"}].map((g,i)=>(
            <button key={i} onClick={()=>{buzz(6);setGiftFrom(g[lg]||g.uz);}} style={{display:"flex",alignItems:"center",gap:5,background:giftFrom===(g[lg]||g.uz)?th.ac+"18":th.sur,border:"1.5px solid "+(giftFrom===(g[lg]||g.uz)?th.ac:th.bor),borderRadius:11,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:600,color:th.t1}}><span style={{fontSize:16}}>{g.e}</span>{g[lg]||g.uz}</button>
          ))}
        </div>
        <input style={S.ip} value={giftFrom} onChange={e=>setGiftFrom(e.target.value)} placeholder={lg==="uz"?"Yoki o'zingiz yozing":"Or type"}/>
        <button onClick={addGiftMoney} style={{...S.bt(),marginTop:6,marginBottom:0}}>🎁 {lg==="uz"?"Cho'ntakka qo'shish":"Add to pocket"}</button>
      </div>
    </div>}
    {showAddKid&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAddKid(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:42,textAlign:"center",marginBottom:8}}>👶</div>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:6,textAlign:"center"}}>{lg==="uz"?"Bola akkaunti yaratish":lg==="ru"?"Создать детский аккаунт":"Create kid account"}</div>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:18,lineHeight:1.5}}>{lg==="uz"?"Farzandingiz uchun login va parol yarating. U shu login bilan kiradi.":"Create a login for your child."}</div>
        <label style={S.lb}>{lg==="uz"?"Bola ismi":"Child's name"}</label>
        <input style={S.ip} value={kidName} onChange={e=>setKidName(e.target.value)} placeholder={lg==="uz"?"Jahongir":"Name"}/>
        <label style={S.lb}>{lg==="uz"?"Login (faqat harf/raqam)":"Login"}</label>
        <input style={S.ip} value={kidLogin} onChange={e=>setKidLogin(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())} placeholder="jahongir2015"/>
        <label style={S.lb}>{lg==="uz"?"Parol":"Password"}</label>
        <input style={S.ip} type="text" value={kidPw} onChange={e=>setKidPw(e.target.value)} placeholder={lg==="uz"?"Kamida 4 belgi":"Min 4 chars"}/>
        <button onClick={addKidAccount} style={{...S.bt(),marginTop:6,marginBottom:0}}>{lg==="uz"?"Akkaunt yaratish":"Create account"}</button>
      </div>
    </div>}
    {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
      <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
        {!resetSent?<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
          <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Parolni tiklash":lg==="ru"?"Сброс пароля":"Reset password"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"Ro'yxatdan o'tgan emailingizni kiriting. Tiklash havolasini yuboramiz.":"Enter your registered email."}</div>
          <label style={S.lb}>Email</label>
          <input style={S.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
          <button onClick={sendResetEmail} style={{...S.bt(),marginTop:6,marginBottom:10}}>{lg==="uz"?"Tiklash xatini yuborish":lg==="ru"?"Отправить":"Send reset link"}</button>
          <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{lg==="uz"?"Bekor qilish":"Cancel"}</button>
        </>:<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
          <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Xat yuborildi!":"Email sent!"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{lg==="uz"?"Parolni tiklash havolasi yuborildi:":"Reset link sent to:"}</div>
          <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
          <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"📌 Pochtangizni oching va havolani bosing. Ko'rinmasa, Spam papkasini tekshiring.":"Check inbox and Spam."}</div>
          <button onClick={()=>setShowResetScreen(false)} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Tushunarli":"Got it"}</button>
        </>}
      </div>
    </div>}

    {inviteQarz&&(()=>{
      const iq=inviteQarz;
      const link=(window.location.origin+"/?ref=")+(user?.id||"");
      const msg=(lg==="uz"?"Salom! Men sizga Oila Hisobchi ilovasida qarz yozmoqchiman. Ilovani o'rnating, qarzlarni birga kuzatamiz: ":"Hi! I want to record a debt with you on Oila Hisobchi app. Install it: ")+link;
      const saveSimple=async()=>{
        const item={id:Date.now(),uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:""};
        const upd=[item,...qarzlar];await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
        setInviteQarz(null);setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");setQarzTel("");setQarzLinked(false);
        ok$(t.xa);
      };
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setInviteQarz(null)}>
        <div style={{background:th.sur,borderRadius:24,padding:"26px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{width:60,height:60,borderRadius:17,background:th.am+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 12px"}}>📲</div>
            <div style={{fontSize:17,fontWeight:800,color:th.t1,marginBottom:6}}>{lg==="uz"?"Bu raqam ilovada yo'q":lg==="ru"?"Номер не в приложении":"Number not in app"}</div>
            <div style={{fontSize:13,color:th.t2,lineHeight:1.5}}>{lg==="uz"?iq.tel+" raqami Oila Hisobchidan foydalanmaydi. Taklif yuborsangiz, u qo'shilgach qarz tasdiqlanadi.":"This number doesn't use the app yet. Invite them to confirm the debt together."}</div>
          </div>
          <button onClick={()=>{const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(msg);window.open(url,"_blank");}} style={{width:"100%",background:"#2196F3",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:9,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {lg==="uz"?"Telegram orqali taklif yuborish":"Invite via Telegram"}
          </button>
          <button onClick={()=>{if(navigator.share){navigator.share({text:msg,url:link}).catch(()=>{});}else{try{navigator.clipboard.writeText(msg);ok$(lg==="uz"?"Nusxalandi!":"Copied!");}catch(e){}}}} style={{width:"100%",background:th.surH,border:"1px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t1,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="9" r="2" stroke={th.t1} strokeWidth="1.4"/><circle cx="14" cy="4" r="2" stroke={th.t1} strokeWidth="1.4"/><circle cx="14" cy="14" r="2" stroke={th.t1} strokeWidth="1.4"/><path d="M6 8l6-3M6 10l6 3" stroke={th.t1} strokeWidth="1.4"/></svg>
            {lg==="uz"?"Boshqa ilova orqali ulashish":"Share via other app"}
          </button>
          <div style={{height:1,background:th.bor,marginBottom:14}}/>
          <button onClick={saveSimple} style={{width:"100%",background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Oddiy qarz sifatida saqlash":lg==="ru"?"Сохранить как обычный долг":"Save as simple debt"}</button>
        </div>
      </div>;
    })()}
    {partialQarz&&(()=>{
      const q=partialQarz;const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;
      const pay=Number(partialSum)||0;const remain=q.summa-pay;
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>{setPartialQarz(null);setPartialSum("");}}>
        <div style={{background:th.sur,borderRadius:24,padding:"26px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{width:60,height:60,borderRadius:17,background:dc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 12px"}}>{isLent?"💰":"💸"}</div>
            <div style={{fontSize:17,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Qisman qaytarish":lg==="ru"?"Частичный возврат":"Partial payment"}</div>
            <div style={{fontSize:13,color:th.t2}}>{q.kim} · {lg==="uz"?"Jami":"Total"}: {f(q.summa,true)}</div>
          </div>
          <label style={S.lb}>{lg==="uz"?"Qaytarilgan summa":lg==="ru"?"Возвращённая сумма":"Returned amount"}</label>
          <MoneyInput autoFocus style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center"}} value={partialSum} onChange={setPartialSum} placeholder="0"/>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {[25,50,75].map(pct=>(<button key={pct} onClick={()=>setPartialSum(String(Math.round(q.summa*pct/100)))} style={{flex:1,background:th.bg,border:"1px solid "+th.bor,borderRadius:9,padding:"7px 0",color:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{pct}%</button>))}
            <button onClick={()=>setPartialSum(String(q.summa))} style={{flex:1,background:th.ac+"15",border:"1px solid "+th.ac+"33",borderRadius:9,padding:"7px 0",color:th.ac,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Hammasi":"All"}</button>
          </div>
          {pay>0&&<div style={{background:th.bg,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qaytarilmoqda":"Paying"}</span><span style={{fontSize:13,fontWeight:700,color:dc}}>{f(pay,true)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qoladi":"Remaining"}</span><span style={{fontSize:13,fontWeight:700,color:remain<=0?th.gr:th.t1}}>{remain<=0?(lg==="uz"?"To'liq yopiladi ✓":"Fully closed ✓"):f(remain,true)}</span></div>
          </div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setPartialQarz(null);setPartialSum("");}} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button>
            <button onClick={applyPartial} style={{flex:2,background:"linear-gradient(135deg,"+dc+","+dc+"cc)",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Tasdiqlash":lg==="ru"?"Подтвердить":"Confirm"}</button>
          </div>
        </div>
      </div>;
    })()}
    {qarzDonePrompt&&(()=>{
      const q=qarzDonePrompt;const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setQarzDonePrompt(null)}>
        <div style={{background:th.sur,borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{width:64,height:64,borderRadius:18,background:dc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 14px"}}>{isLent?"💰":"💸"}</div>
            <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:8}}>{isLent?(lg==="uz"?"Qarz qaytarib olindi":lg==="ru"?"Долг получен":"Debt received"):(lg==="uz"?"Qarz qaytarildi":lg==="ru"?"Долг возвращён":"Debt paid")}</div>
            <div style={{fontSize:14,color:th.t2,lineHeight:1.5}}>{isLent?(lg==="uz"?"Qaytarib olgan "+f(q.summa,true)+" pulni daromadlarga qo'shaylikmi?":lg==="ru"?"Добавить "+f(q.summa,true)+" в доходы?":"Add "+f(q.summa,true)+" to income?"):(lg==="uz"?"Qaytargan "+f(q.summa,true)+" pulni xarajatlarga qo'shaylikmi?":lg==="ru"?"Добавить "+f(q.summa,true)+" в расходы?":"Add "+f(q.summa,true)+" to expenses?")}</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setQarzDonePrompt(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Yo'q":lg==="ru"?"Нет":"No"}</button>
            <button onClick={()=>isLent?addQarzAsDaromad(q):addQarzAsXarajat(q)} style={{flex:2,background:"linear-gradient(135deg,"+dc+","+dc+"cc)",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Ha, qo'shilsin":lg==="ru"?"Да, добавить":"Yes, add"}</button>
          </div>
        </div>
      </div>;
    })()}
    {confetti&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      <style>{"@keyframes confFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}"}</style>
      {Array.from({length:60}).map((_,i)=>{
        const colors=["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4","#ef4444","#8b5cf6"];
        const c=colors[i%colors.length];
        const left=Math.random()*100;
        const delay=Math.random()*0.5;
        const dur=2+Math.random()*1.5;
        const size=6+Math.random()*8;
        return <div key={i} style={{position:"absolute",top:0,left:left+"%",width:size,height:size,background:c,borderRadius:i%2===0?"50%":"2px",animation:"confFall "+dur+"s "+delay+"s ease-in forwards"}}/>;
      })}
    </div>}
    <div style={{background:th.sur,padding:"14px 18px 10px",borderBottom:"1px solid "+th.bor,position:"sticky",top:0,zIndex:20}}>
      <div style={{...S.row,marginBottom:scr==="bosh"&&!showS?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>{setScr("profil");setPTab("main");}} style={{background:"none",border:"none",cursor:"pointer",padding:0,position:"relative"}}>
            <Av src={user?.photo} name={user?.ism} size={36} ac={th.ac}/>
            <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:th.gr,border:"2px solid "+th.sur}}/>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{user?.ism||t.app}</span>{isPremium&&<span style={{fontSize:8,background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",color:"#fff",borderRadius:20,padding:"1px 6px",fontWeight:700}}>PRO</span>}</div>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:-0.2}}>{lg==="uz"?<><span style={{color:th.ac}}>Oila</span><span style={{color:th.gr}}>Hisobchi</span></>:lg==="ru"?<><span style={{color:th.ac}}>Семейный</span><span style={{color:th.gr}}>Бюджет</span></>:<><span style={{color:th.ac}}>Family</span><span style={{color:th.gr}}>Budget</span></>}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{setShowS(v=>!v);setSrch("");}} style={{background:showS?th.ac+"18":"transparent",border:"1px solid "+(showS?th.ac:th.bor),borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.search(showS?th.ac:th.t2)}</button>

          <button onClick={()=>setShowNotifs(true)} style={{background:"transparent",border:"1px solid "+th.bor,borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",position:"relative"}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a4.5 4.5 0 00-4.5 4.5v2.7L3 12h12l-1.5-2.8V6.5A4.5 4.5 0 009 2z" fill={th.t2} opacity=".15" stroke={th.t2} strokeWidth="1.3" strokeLinejoin="round"/><path d="M7.5 14.5a1.5 1.5 0 003 0" stroke={th.t2} strokeWidth="1.3" strokeLinecap="round"/></svg>
            {notifs.filter(n=>!n.read).length>0&&<div style={{position:"absolute",top:2,right:2,minWidth:16,height:16,borderRadius:8,background:th.rd,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{notifs.filter(n=>!n.read).length>9?"9+":notifs.filter(n=>!n.read).length}</div>}
          </button>
        </div>
      </div>
      {showS&&<input autoFocus style={{...S.ip,marginBottom:0,marginTop:8}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder={t.sch}/>}
      {scr==="bosh"&&    <DashboardPage {...pageProps} showS={showS}/>}
      {scr==="grafik"&&  <ChartsPage    {...pageProps}/>}
      {scr==="maqsad"&&  <GoalsPage     {...pageProps} addM={addM} setAddM={setAddM} maqTab={maqTab} setMaqTab={setMaqTab} tupId={tupId} setTupId={setTupId} tupS={tupS} setTupS={setTupS} editMq={editMq} setEditMq={setEditMq} editMqN={editMqN} setEditMqN={setEditMqN} editMqS={editMqS} setEditMqS={setEditMqS} maqsadConfirmNotif={maqsadConfirmNotif} setMaqsadConfirmNotif={setMaqsadConfirmNotif} addMq={addMq} tupMq={tupMq} delMq={delMq} saveEditMq={saveEditMq} confirmMaqBought={confirmMaqBought} cancelMaqReturn={cancelMaqReturn}/>}
      {scr==="vazifa"&&  <TasksPage     {...pageProps} showAddVazifa={showAddVazifa} setShowAddVazifa={setShowAddVazifa} showGift={showGift} setShowGift={setShowGift} giftSum={giftSum} setGiftSum={setGiftSum} giftFrom={giftFrom} setGiftFrom={setGiftFrom} vTitle={vTitle} setVTitle={setVTitle} vReward={vReward} setVReward={setVReward} vAssignee={vAssignee} setVAssignee={setVAssignee} vEmoji={vEmoji} setVEmoji={setVEmoji} addVazifa={addVazifa} vazifaDone={vazifaDone} vazifaApprove={vazifaApprove} VAZIFA_PRESETS={VAZIFA_PRESETS}/>}
      {scr==="qarz"&&    <DebtsPage     {...pageProps} showAddQarz={showAddQarz} setShowAddQarz={setShowAddQarz} qarzTur={qarzTur} setQarzTur={setQarzTur} qarzKim={qarzKim} setQarzKim={setQarzKim} qarzSum={qarzSum} setQarzSum={setQarzSum} qarzIzoh={qarzIzoh} setQarzIzoh={setQarzIzoh} qarzSana={qarzSana} setQarzSana={setQarzSana} qarzQaytSana={qarzQaytSana} setQarzQaytSana={setQarzQaytSana} qarzTel={qarzTel} setQarzTel={setQarzTel} qarzLinked={qarzLinked} setQarzLinked={setQarzLinked} addQarz={addQarz} payQarz={payQarz} partialQarz={partialQarz} setPartialQarz={setPartialQarz} partialSum={partialSum} setPartialSum={setPartialSum} qarzDonePrompt={qarzDonePrompt} setQarzDonePrompt={setQarzDonePrompt} inviteQarz={inviteQarz} setInviteQarz={setInviteQarz} acceptQarzReq={acceptQarzReq} rejectQarzReq={rejectQarzReq} refreshQarzReqs={refreshQarzReqs} generateTilxat={generateTilxat} verifyTilxat={verifyTilxat} setVerifyTilxat={setVerifyTilxat}/>}
      {scr==="hisobot"&& <ReportsPage   {...pageProps} hisFil={hisFil} setHisFil={setHisFil} exportLoading={exportLoading} exportPDF={exportPDF} exportExcel={exportExcel} adv={adv} setAdv={setAdv} advL={advL} getAIAdvice={getAIAdvice} showImport={showImport} setShowImport={setShowImport} importRows={importRows} setImportRows={setImportRows} importStep={importStep} setImportStep={setImportStep} importFileRef={importFileRef} handleImport={handleImport} confirmImport={confirmImport}/>}
      {scr==="profil"&&  <ProfilePage   {...pageProps} pTab={pTab} setPTab={setPTab} edN={edN} setEdN={setEdN} newN={newN} setNewN={setNewN} fBj={fBj} setFBj={setFBj} fKL={fKL} setFKL={setFKL} faqO={faqO} setFaqO={setFaqO} pinStep={pinStep} setPinStep={setPinStep} pinVal={pinVal} setPinVal={setPinVal} pinCfm={pinCfm} setPinCfm={setPinCfm} finger={finger} setFinger={setFinger} showBilim={showBilim} setShowBilim={setShowBilim} showAddKid={showAddKid} setShowAddKid={setShowAddKid} kidName={kidName} setKidName={setKidName} kidLogin={kidLogin} setKidLogin={setKidLogin} kidPw={kidPw} setKidPw={setKidPw} showReferral={showReferral} setShowReferral={setShowReferral} refCount={refCount} fbRating={fbRating} setFbRating={setFbRating} fbText={fbText} setFbText={setFbText} fbType={fbType} setFbType={setFbType} fbSending={fbSending} sendFeedback={sendFeedback} adminStats={adminStats} adminLoad={adminLoad} loadAdminStats={loadAdminStats} waterGarden={waterGarden} gardenData={gardenData} stars={stars} addStar={addStar} activatePremium={activatePremium} logout={logout} saveProfile={saveProfile} fRef={fRef} doPhoto={doPhoto} rates={rates} rateL={rateL} fetchRates={fetchRates} notifEnabled={notifEnabled} setNotifEnabled={setNotifEnabled} notifTime={notifTime} setNotifTime={setNotifTime} APP_VER={APP_VER}/>}
    </div>}
    {showNotifs&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:998,display:"flex",justifyContent:"flex-end"}} onClick={()=>setShowNotifs(false)}>
      <div style={{background:th.bg,width:"100%",maxWidth:430,height:"100%",overflowY:"auto",boxShadow:"-4px 0 24px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:th.sur,borderBottom:"1px solid "+th.bor,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:2}}>
          <div style={{fontSize:17,fontWeight:800,color:th.t1}}>{lg==="uz"?"Bildirishnomalar":lg==="ru"?"Уведомления":"Notifications"}</div>
          <button onClick={()=>setShowNotifs(false)} style={{background:th.surH,border:"none",borderRadius:"50%",width:34,height:34,color:th.t1,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {notifs.length>0&&<div style={{display:"flex",gap:8,padding:"12px 18px",borderBottom:"1px solid "+th.bor}}>
          <button onClick={markAllRead} style={{flex:1,background:th.surH,border:"1px solid "+th.bor,borderRadius:10,padding:"8px 0",color:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Hammasini o'qilgan":"Mark all read"}</button>
          <button onClick={clearNotifs} style={{flex:1,background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,padding:"8px 0",color:th.rd,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Tozalash":"Clear"}</button>
        </div>}
        <div style={{padding:"12px 18px 40px"}}>
          {notifs.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:th.t2}}><div style={{fontSize:46,marginBottom:10,opacity:.5}}>🔔</div><div style={{fontSize:15}}>{lg==="uz"?"Bildirishnomalar yo'q":"No notifications"}</div></div>}
          {notifs.map(n=>{
            const icons={qarz:"💸",budjet:"⚠️",xarajat:"💰",yangilik:"🎉",maqsad_confirm:"🎯",maqsad_kid_confirm:"🎁",vazifa:"🏆"};
            const colors={qarz:th.ac,budjet:th.am,xarajat:th.rd,yangilik:th.gr,maqsad_confirm:"#f59e0b",maqsad_kid_confirm:"#22c55e",vazifa:"#8b5cf6"};
            const c=colors[n.type]||th.ac;
            const needParentAction=n.type==="maqsad_confirm"&&n.status==="pending"&&!isKid;
            const needKidAction=n.type==="maqsad_kid_confirm"&&n.status==="pending"&&isKid;
            return <div key={n.id} onClick={()=>markNotifRead(n.id)} style={{background:n.read?th.sur:c+"0d",border:"1px solid "+(n.read?th.bor:c+"33"),borderRadius:14,padding:"13px 15px",marginBottom:10,cursor:"pointer",display:"flex",gap:12,flexDirection:"column"}}>
              <div style={{display:"flex",gap:12}}>
                <div style={{width:40,height:40,borderRadius:11,background:c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icons[n.type]||"🔔"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:700,color:th.t1}}>{n.title}</span>{!n.read&&<span style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>}</div>
                  <div style={{fontSize:12,color:th.t2,marginTop:3,lineHeight:1.5}}>{n.text||n.body}</div>
                  <div style={{fontSize:10,color:th.t2,marginTop:5,opacity:.7}}>{new Date(n.sana).toLocaleString("uz-UZ",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              </div>
              {needParentAction&&<button onClick={e=>{e.stopPropagation();confirmMaqParent(n);}} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                🛍️ {lg==="uz"?"Ha, sotib berdim! Tasdiqlash":lg==="ru"?"Да, я купил(а)! Подтвердить":"Yes, I bought it! Confirm"}
              </button>}
              {needKidAction&&<button onClick={e=>{e.stopPropagation();confirmMaqKid(n);}} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                🎉 {lg==="uz"?"Ha, oldim! Mening orzuim amalga oshdi!":lg==="ru"?"Да, мне купили! Мечта сбылась!":"Yes! My dream came true!"}
              </button>}
            </div>;
          })}
        </div>
      </div>
    </div>}
    {showVoice&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <button onClick={()=>{stopVoice();setShowVoice(false);}} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:40,height:40,color:"#fff",fontSize:22,cursor:"pointer"}}>×</button>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>{lg==="uz"?"Ovoz bilan kiritish":lg==="ru"?"Голосовой ввод":"Voice input"}</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:36,textAlign:"center",maxWidth:300}}>{lg==="uz"?"Masalan: \"Transportga 20 ming ishlatdim\"":lg==="ru"?"Например: \"На транспорт 20 тысяч\"":"E.g. \"Spent 20000 on transport\""}</div>
      <button onClick={voiceOn?stopVoice:startVoice} style={{width:110,height:110,borderRadius:"50%",background:voiceOn?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#8b5cf6,#6366f1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:30,boxShadow:voiceOn?"0 0 0 12px rgba(239,68,68,.2),0 0 0 24px rgba(239,68,68,.1)":"0 8px 30px rgba(139,92,246,.5)",transition:"all .3s"}}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <div style={{fontSize:14,color:voiceOn?"#ef4444":"rgba(255,255,255,.7)",fontWeight:600,marginBottom:24}}>{voiceOn?(lg==="uz"?"Tinglayapman...":lg==="ru"?"Слушаю...":"Listening..."):(lg==="uz"?"Bosing va gapiring":lg==="ru"?"Нажмите и говорите":"Tap and speak")}</div>
      {voiceText&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:16,padding:"16px 20px",marginBottom:20,maxWidth:340,width:"100%"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Eshitildi":lg==="ru"?"Распознано":"Heard"}</div>
        <div style={{fontSize:15,color:"#fff",lineHeight:1.5}}>{voiceText}</div>
      </div>}
      {voiceParsed&&<div style={{background:"linear-gradient(135deg,#10b98122,#05966911)",border:"1.5px solid #10b98155",borderRadius:16,padding:"16px 20px",marginBottom:24,maxWidth:340,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{lg==="uz"?"Summa":lg==="ru"?"Сумма":"Amount"}</span>
          <span style={{fontSize:20,fontWeight:800,color:"#10b981"}}>{f(voiceParsed.summa,true)}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{lg==="uz"?"Kategoriya":lg==="ru"?"Категория":"Category"}</span>
          <span style={{fontSize:14,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:6}}>{KN[lg][KATS.findIndex(k=>k.id===voiceParsed.kat)]}</span>
        </div>
      </div>}
      {(voiceText&&!voiceOn)&&<div style={{display:"flex",gap:10,maxWidth:340,width:"100%"}}>
        <button onClick={()=>{setVoiceText("");setVoiceParsed(null);startVoice();}} style={{flex:1,background:"rgba(255,255,255,.15)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{lg==="uz"?"Qayta":lg==="ru"?"Заново":"Retry"}</button>
        <button onClick={applyVoice} disabled={!voiceParsed} style={{flex:2,background:voiceParsed?"linear-gradient(135deg,#10b981,#059669)":"rgba(255,255,255,.1)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:voiceParsed?"pointer":"not-allowed",opacity:voiceParsed?1:.5}}>{lg==="uz"?"Qo'shish":lg==="ru"?"Добавить":"Add"}</button>
      </div>}
    </div>}
    {showImport&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setShowImport(false);setImportRows([]);setImportStep("upload");}}>
      <div style={{background:th.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",padding:"22px 18px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:17,fontWeight:800,color:th.t1,display:"flex",alignItems:"center",gap:8}}>📄 {lg==="uz"?"Hisobot import":lg==="ru"?"Импорт":"Import"}</div>
          <button onClick={()=>{setShowImport(false);setImportRows([]);setImportStep("upload");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:th.t2}}>×</button>
        </div>
        {importStep==="upload"&&<div>
          <div style={{background:th.ac+"0d",border:"1.5px dashed "+th.ac+"55",borderRadius:16,padding:"32px 18px",textAlign:"center",marginBottom:14,cursor:"pointer"}} onClick={()=>importFileRef.current?.click()}>
            <div style={{fontSize:44,marginBottom:10}}>📁</div>
            <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:5}}>{lg==="uz"?"CSV faylni tanlang":lg==="ru"?"Выберите CSV":"Choose CSV file"}</div>
            <div style={{fontSize:11,color:th.t2}}>{lg==="uz"?"Bank hisobotini CSV formatda yuklang":"Upload bank statement as CSV"}</div>
          </div>
          <input ref={importFileRef} type="file" accept=".csv,text/csv" style={{display:"none"}} onChange={e=>handleImportFile(e.target.files?.[0])}/>
          <div style={{background:th.sur,borderRadius:12,padding:"13px 15px",fontSize:11,color:th.t2,lineHeight:1.7}}>
            <div style={{fontWeight:700,color:th.t1,marginBottom:6}}>{lg==="uz"?"💡 Qanday ishlaydi:":"💡 How it works:"}</div>
            {lg==="uz"?"1. Bank ilovangizdan hisobotni CSV qilib yuklab oling\n2. Shu yerga tanlang\n3. Ilova sana, summa, izohni avtomatik aniqlaydi\n4. Ko'rib chiqib, tasdiqlang":"1. Export statement as CSV from your bank\n2. Select it here\n3. App auto-detects date, amount, note\n4. Review and confirm"}
          </div>
        </div>}
        {importStep==="review"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:12,color:th.t2}}>{importRows.filter(r=>r.sel).length}/{importRows.length} {lg==="uz"?"tanlandi":"selected"}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setImportRows(rows=>rows.map(r=>({...r,sel:true})))} style={{fontSize:11,background:th.ac+"15",border:"none",borderRadius:8,padding:"5px 10px",color:th.ac,cursor:"pointer",fontWeight:600}}>{lg==="uz"?"Hammasi":"All"}</button>
              <button onClick={()=>setImportRows(rows=>rows.map(r=>({...r,sel:false})))} style={{fontSize:11,background:th.bor,border:"none",borderRadius:8,padding:"5px 10px",color:th.t2,cursor:"pointer",fontWeight:600}}>{lg==="uz"?"Hech biri":"None"}</button>
            </div>
          </div>
          <div style={{maxHeight:"42vh",overflowY:"auto",marginBottom:14}}>
            {importRows.map((r,i)=>(
              <div key={i} onClick={()=>setImportRows(rows=>rows.map((x,j)=>j===i?{...x,sel:!x.sel}:x))} style={{display:"flex",alignItems:"center",gap:10,background:r.sel?th.sur:th.bg,border:"1px solid "+(r.sel?(r.kind==="income"?th.gr+"44":th.rd+"33"):th.bor),borderRadius:11,padding:"10px 12px",marginBottom:7,cursor:"pointer",opacity:r.sel?1:.5}}>
                <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(r.sel?th.ac:th.bor),background:r.sel?th.ac:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.sel&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>
                <div style={{width:30,height:30,borderRadius:8,background:(r.kind==="income"?th.gr:th.rd)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{r.kind==="income"?"💰":"💸"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:th.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.izoh||(lg==="uz"?"(izohsiz)":"(no note)")}</div>
                  <div style={{fontSize:10,color:th.t2}}>{r.sana} · {r.kind==="income"?(lg==="uz"?"Daromad":"Income"):(KN[lg][KATS.findIndex(k=>k.id===r.kategoriya)]||"")}</div>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:r.kind==="income"?th.gr:th.rd,flexShrink:0}}>{r.kind==="income"?"+":"-"}{f(r.summa,true)}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setImportStep("upload");setImportRows([]);}} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:13,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Orqaga":"Back"}</button>
            <button onClick={confirmImport} style={{flex:2,...S.bt(),marginBottom:0}}>{lg==="uz"?"Import qilish":"Import"} ({importRows.filter(r=>r.sel).length})</button>
          </div>
        </div>}
      </div>
    </div>}
    {showScanner&&<div style={{position:"fixed",inset:0,background:"#000",zIndex:1000,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,.6)",position:"relative",zIndex:2}}>
        <div style={{color:"#fff",fontSize:16,fontWeight:700}}>{lg==="uz"?"Chek skaneri":"Receipt scanner"}</div>
        <button onClick={stopScanner} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:36,height:36,color:"#fff",fontSize:20,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <video ref={videoRef} playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
        <div style={{position:"relative",zIndex:2,width:240,height:240,border:"3px solid "+th.ac,borderRadius:24,boxShadow:"0 0 0 9999px rgba(0,0,0,.5)"}}>
          <div style={{position:"absolute",top:-3,left:-3,width:40,height:40,borderTop:"5px solid #fff",borderLeft:"5px solid #fff",borderRadius:"24px 0 0 0"}}/>
          <div style={{position:"absolute",top:-3,right:-3,width:40,height:40,borderTop:"5px solid #fff",borderRight:"5px solid #fff",borderRadius:"0 24px 0 0"}}/>
          <div style={{position:"absolute",bottom:-3,left:-3,width:40,height:40,borderBottom:"5px solid #fff",borderLeft:"5px solid #fff",borderRadius:"0 0 0 24px"}}/>
          <div style={{position:"absolute",bottom:-3,right:-3,width:40,height:40,borderBottom:"5px solid #fff",borderRight:"5px solid #fff",borderRadius:"0 0 24px 0"}}/>
        </div>
      </div>
      <div style={{padding:"20px 24px 40px",background:"rgba(0,0,0,.6)",textAlign:"center"}}>
        <div style={{color:"#fff",fontSize:14,marginBottom:6}}>{scanMsg}</div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginBottom:16}}>{lg==="uz"?"Chekdagi QR kodni ramka ichiga joylang":"Point the receipt QR into the frame"}</div>
        <button onClick={stopScanner} style={{background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{lg==="uz"?"Qo'lda kiritish":"Enter manually"}</button>
      </div>
    </div>}
    {showQrPick&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1001,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowQrPick(false)}>
      <div onClick={e=>e.stopPropagation()} style={{background:th.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column",padding:"0 0 32px"}}>
        <div style={{padding:"16px 20px 12px",borderBottom:"1.5px solid "+th.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:700,color:th.text}}>{lg==="uz"?"QR matnidan summani tanlang":"Select amount from QR text"}</div>
          <button onClick={()=>setShowQrPick(false)} style={{background:"none",border:"none",fontSize:22,color:th.sub,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"10px 16px 4px"}}>
          <div style={{fontSize:12,color:th.sub,marginBottom:6}}>{lg==="uz"?"Summa qatoriga bosing:":"Tap the amount line:"}</div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"0 16px 8px"}}>
          {qrRawText.split(/\n|\|/).map((line,i)=>{
            const trimmed=line.trim();
            if(!trimmed)return null;
            // Raqam bormi? (3+ raqam ketma-ket)
            const hasNum=/[0-9]{3,}/.test(trimmed);
            // Raqamni tozalab olish: vergul/nuqta/bo'sh joy bilan ajratilgan son
            const numMatch=trimmed.match(/([0-9][0-9 ,.']*[0-9])/);
            let parsedNum=0;
            if(numMatch){
              const clean=numMatch[1].replace(/[ ,']/g,"").replace(/\.(?=[0-9]{3})/g,"");
              parsedNum=parseInt(clean,10)||0;
            }
            return(
              <div key={i}
                onClick={()=>{
                  if(parsedNum>0){
                    setFS(String(parsedNum));
                    setShowQrPick(false);
                    ok$(lg==="uz"?"✓ "+f(parsedNum,true)+" — tekshiring":"✓ "+f(parsedNum,true)+" — verify");
                  }
                }}
                style={{
                  padding:"10px 14px",
                  marginBottom:4,
                  borderRadius:10,
                  background:hasNum?(th.ac+"18"):th.bg,
                  border:hasNum?("1.5px solid "+th.ac+"44"):"1.5px solid transparent",
                  cursor:parsedNum>0?"pointer":"default",
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center",
                  gap:8
                }}>
                <span style={{fontSize:13,color:parsedNum>0?th.text:th.sub,wordBreak:"break-all"}}>{trimmed}</span>
                {parsedNum>0&&<span style={{fontSize:13,fontWeight:700,color:th.ac,whiteSpace:"nowrap"}}>→ {f(parsedNum,true)}</span>}
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 16px 0"}}>
          <div style={{fontSize:11,color:th.sub,textAlign:"center"}}>{lg==="uz"?"Xom QR matn:":"Raw QR text:"}</div>
          <div style={{fontSize:10,color:th.sub,background:th.bg,borderRadius:8,padding:"8px 10px",marginTop:4,wordBreak:"break-all",maxHeight:60,overflow:"hidden"}}>{qrRawText.slice(0,200)}</div>
        </div>
      </div>
    </div>}
    {showPremModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowPremModal(false)}>
      <div style={{background:th.sur,borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:430}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:8}}>💎</div>
          <div style={{fontSize:22,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Premium versiya":"Premium Version"}</div>
          <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Barcha funksiyalarni oching!":"Unlock all features!"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[{label:lg==="uz"?"Bepul":"Free",items:lg==="uz"?["3 ta maqsad","2 oila a'zo","Asosiy hisobot","Qarzlar"]:["3 goals","2 members","Basic report","Debts"]},{label:"Premium",items:lg==="uz"?["♾️ Cheksiz maqsad","👨‍👩‍👧 Cheksiz a'zo","📄 PDF/Excel","🎤 Ovoz kiritish","📷 QR skaner","🤖 AI maslahat"]:["♾️ Unlimited goals","👨‍👩‍👧 Unlimited members","📄 PDF/Excel","🎤 Voice input","📷 QR scanner","🤖 AI advice"]}].map((plan,pi)=>(
            <div key={pi} style={{background:pi===1?"linear-gradient(135deg,"+th.ac+"22,"+th.ac2+"11)":th.surH,border:"1.5px solid "+(pi===1?th.ac:th.bor),borderRadius:16,padding:"14px 12px"}}>
              <div style={{fontSize:13,fontWeight:700,color:pi===1?th.ac:th.t2,marginBottom:10,textAlign:"center"}}>{plan.label}</div>
              {plan.items.map((item,ii)=>(<div key={ii} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,fontSize:12,color:th.t1}}><span style={{color:pi===1?th.ac:th.gr,fontSize:14}}>✓</span>{item}</div>))}
            </div>
          ))}
        </div>
        <div style={{background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",borderRadius:16,padding:"14px 20px",marginBottom:10,textAlign:"center"}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginBottom:4}}>{lg==="uz"?"Premium narxi":"Price"}</div>
          <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>15 000 – 25 000 {lg==="uz"?"so'm / oy":"UZS / month"}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>99 000 {lg==="uz"?"so'm / yil":"UZS / year"}</div>
        </div>
        <button onClick={activatePremium} style={{...S.bt(),marginBottom:8,fontSize:16}}>💎 {lg==="uz"?"Premium faollashtirish (Demo)":"Activate Premium (Demo)"}</button>
        <button onClick={()=>setShowPremModal(false)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Keyinroq":"Later"}</button>
      </div>
    </div>}
    <BottomNav navItems={navItems} scr={scr} setScr={setScr} th={th} isKid={isKid} buzz={buzz} setShowAddModal={setShowAddModal} setAddModalTab={setAddModalTab} setAddStep={setAddStep} setAddKat={setAddKat} setFS={setFS} setFIz={setFIz} setFSn={setFSn} setFDS={setFDS} setFDI={setFDI}/>
  </div>;
}