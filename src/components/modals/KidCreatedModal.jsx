import React from "react";

export default function KidCreatedModal({ th, lg, kidCreated, buzz, onClose }) {
  if (!kidCreated) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:1002, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background: th.sur, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:360, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>👶✅</div>
        <div style={{ fontSize:20, fontWeight:800, color:th.t1, marginBottom:8 }}>
          {lg==="uz" ? "Akkaunt yaratildi!" : "Account created!"}
        </div>
        <div style={{ fontSize:13, color:th.t2, marginBottom:20, lineHeight:1.6 }}>
          {lg==="uz" ? "Farzandingiz quyidagi ma'lumotlar bilan kirishi mumkin:" : "Your child can log in with:"}
        </div>
        <div style={{ background:th.bg, borderRadius:16, padding:"16px 20px", marginBottom:20, textAlign:"left" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Ism":"Name"}</span>
            <span style={{ fontSize:14, fontWeight:700, color:th.t1 }}>{kidCreated.ism}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:th.t2 }}>Login</span>
            <span style={{ fontSize:14, fontWeight:800, color:th.ac, fontFamily:"monospace" }}>{kidCreated.login}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Parol":"Password"}</span>
            <span style={{ fontSize:14, fontWeight:800, color:th.gr, fontFamily:"monospace" }}>{kidCreated.pw}</span>
          </div>
        </div>
        <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:12, color:th.am, lineHeight:1.5 }}>
          ⚠️ {lg==="uz" ? "Bu parolni yozib oling! Keyinchalik ko'rsatilmaydi." : "Save this password! It won't be shown again."}
        </div>
        <button onClick={() => { onClose(); buzz(10); }} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"14px", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
          {lg==="uz" ? "Tushunarli, yopish" : "Got it, close"}
        </button>
      </div>
    </div>
  );
}
