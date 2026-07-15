import React from "react";

export default function KidCreatedModal({ th, lg, kidCreated, buzz, onClose }) {
  if (!kidCreated) return null;

  const L = (uz, ru, en, kk, ky, tg, qr) => {
    return lg === "uz" ? uz :
           lg === "ru" ? ru :
           lg === "kk" ? kk :
           lg === "ky" ? ky :
           lg === "tg" ? tg :
           lg === "qr" ? qr :
           en;
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:1002, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background: th.sur, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:360, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>👶✅</div>
        <div style={{ fontSize:20, fontWeight:800, color:th.t1, marginBottom:8 }}>
          {L("Akkaunt yaratildi!", "Аккаунт создан!", "Account created!", "Аккаунт жасалды!", "Аккаунт түзүлдү!", "Аккаунт сохта шуд!", "Akkaunt jaratıldı!")}
        </div>
        <div style={{ fontSize:13, color:th.t2, marginBottom:20, lineHeight:1.6 }}>
          {L("Farzandingiz quyidagi ma'lumotlar bilan kirishi mumkin:", "Ваш ребенок может войти со следующими данными:", "Your child can log in with the following credentials:", "Балаңыз келесі деректермен жүйеге кіре алады:", "Балаңыз төмөнкү маалыматтар менен кире алат:", "Кӯдаки шумо метавонад бо маълумоти зерин ворид шавад:", "Farzandın'ız to'mendegi mag'lıwmatlar menen kirisi mu'mkin:")}
        </div>
        <div style={{ background:th.bg, borderRadius:16, padding:"16px 20px", marginBottom:20, textAlign:"left" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:th.t2 }}>{L("Ism", "Имя", "Name", "Есімі", "Аты", "Ном", "Atı")}</span>
            <span style={{ fontSize:14, fontWeight:700, color:th.t1 }}>{kidCreated.ism}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:th.t2 }}>Login</span>
            <span style={{ fontSize:14, fontWeight:800, color:th.ac, fontFamily:"monospace" }}>{kidCreated.login}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:th.t2 }}>{L("Parol", "Пароль", "Password", "Құпия сөз", "Сырсөз", "Парол", "Parol")}</span>
            <span style={{ fontSize:14, fontWeight:800, color:th.gr, fontFamily:"monospace" }}>{kidCreated.pw}</span>
          </div>
        </div>
        <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:12, color:th.am, lineHeight:1.5 }}>
          ⚠️ {L("Bu parolni yozib oling! Keyinchalik ko'rsatilmaydi.", "Запишите этот пароль! Он больше не будет показан.", "Write down this password! It will not be shown again.", "Бұл құпия сөзді жазып алыңыз! Ол кейін көрсетілмейді.", "Бул сырсөздү жазып алыңыз! Кийин көрсөтүлбөйт.", "Ин паролро сабт кунед! Он дигар нишон дода намешавад.", "Bul paroldı jazıp alan'! Keyinirek ko'rsetilmeydi.")}
        </div>
        <button onClick={() => { onClose(); buzz(10); }} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"14px", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
          {L("Tushunarli, yopish", "Понятно, закрыть", "Got it, close", "Түсінікті, жабу", "Түшүнүктүү, жабуу", "Фаҳмо, пӯшидан", "Tu'sinikli, jabiw")}
        </button>
      </div>
    </div>
  );
}
