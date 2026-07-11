import React from "react";

export default function AddVazifaModal({
  th,
  lg,
  dark,
  azolar,
  isKid,
  user,
  vAssignee,
  setVAssignee,
  vEmoji,
  setVEmoji,
  vTitle,
  setVTitle,
  vReward,
  setVReward,
  vDeadline,
  setVDeadline,
  vTargetParentId,
  setVTargetParentId,
  addVazifa,
  onClose
}) {
  const formatWithSpaces = (val) => {
    const s = String(val).replace(/\D/g, "");
    if (!s) return "";
    let r = "";
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) r += " ";
      r += s[i];
    }
    return r;
  };

  const parents = azolar.filter(a => a.rol !== "kid");

  React.useEffect(() => {
    if (isKid && user?.id && vAssignee !== user.id) {
      setVAssignee(user.id);
    }
  }, [isKid, user, vAssignee, setVAssignee]);
  const lIco = {
    kitob:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 4.5C8.5 3.2 6.3 2.8 3 3v12c3.3-.2 5.5.2 7 1.5 1.5-1.3 3.7-1.7 7-1.5V3c-3.3-.2-5.5.2-7 1.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 4.5v12" stroke={c} strokeWidth="1.3"/></svg>,
    xona:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M12.5 2l-3 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9.8 9.5c-2.6-.4-4.6 1-5.3 4l-1 3.5c3.5.6 8.5 1 9.8-3l.8-2.7-4.3-1.8z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 13.5l-.8 3.3M9.5 14l-.6 3.2" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
    idish:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="11" cy="10" r="6.5" stroke={c} strokeWidth="1.4"/><circle cx="11" cy="10" r="3" stroke={c} strokeWidth="1.2" opacity=".6"/><path d="M2.5 3v5M2.5 8v9M1 3v3c0 1 .7 2 1.5 2S4 7 4 6V3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    dokon:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 3h2.2l1.9 9.5h9.4l1.7-7H5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.3" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/><circle cx="14.2" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/></svg>,
    gul:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 17v-6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11C10 7 7.5 5 3.5 5c0 4 2.5 6 6.5 6zM10 9c0-3 2-4.7 5.5-4.7 0 3.5-2 4.7-5.5 4.7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 17h10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    axlat:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 5.5h12M8 5.5V3.5h4v2M5.3 5.5l.9 11h7.6l.9-11" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.3 8.5v5M11.7 8.5v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    orin:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M2 15.5V9c0-1.1.9-2 2-2h9.5c2.5 0 4.5 1.8 4.5 4.5v4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M2 13h16M2 16.5V13M18 16.5V13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><circle cx="6" cy="10" r="1.6" fill={c} opacity=".35"/></svg>,
    darslik:  c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="2.5" width="11" height="15" rx="1.8" stroke={c} strokeWidth="1.4"/><path d="M6.5 6.5h5M6.5 9.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M11 15.5l5.5-5.5c.6-.6 1.5.3.9.9L12 16.4l-1.8.4.8-1.3z" fill={c} opacity=".2" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
    kir:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3.5 8h13l-1.2 8.5h-10.6L3.5 8z" fill={c} opacity=".1" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8c0-2.3 1.8-4 4-4s4 1.7 4 4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 11.5c1 .8 2.3 1.2 3.5 1.2s2.5-.4 3.5-1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    ovqat:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="11.5" r="5.5" stroke={c} strokeWidth="1.4"/><path d="M13.8 8.2L18 4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="11.5" r="2.2" stroke={c} strokeWidth="1.1" opacity=".55"/></svg>,
    sport:    c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="4.6" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><circle cx="15.4" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><path d="M4.6 13.5L8 7h5.5M10 13.5L8 7M12.5 4.5h2.5l.7 2" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    musiqa:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M7.5 15.5V4.5L16 3v10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.3" cy="15.5" r="2.2" stroke={c} strokeWidth="1.3"/><circle cx="13.8" cy="13.5" r="2.2" stroke={c} strokeWidth="1.3"/></svg>,
    oyinchoq: c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11.5" r="5" fill={c} opacity=".1" stroke={c} strokeWidth="1.4"/><circle cx="5" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="15" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="8.2" cy="11" r=".9" fill={c}/><circle cx="11.8" cy="11" r=".9" fill={c}/><path d="M8.7 13.7c.8.6 1.8.6 2.6 0" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
    hayvon:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 10.5c-2.6 0-4.5 1.9-4.5 4 0 1.4 1 2.3 2.3 2.3 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.3 0 2.3-.9 2.3-2.3 0-2.1-1.9-4-4.5-4z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><ellipse cx="5" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="15" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="8" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="12" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/></svg>,
    deraza:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="3" width="13" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M10 3v14M3.5 10h13" stroke={c} strokeWidth="1.2"/><path d="M5.5 6.5l2-2" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/></svg>,
    soz:      c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5a5.5 5.5 0 00-3 10.1c.7.5 1.2 1.2 1.2 2.1h3.6c0-.9.5-1.6 1.2-2.1a5.5 5.5 0 00-3-10.1z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4"/><path d="M8 16.8h4M8.6 18.5h2.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M8.3 7.5L10 5.8l1.7 1.7" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>,
    buvi:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 16.5s-5.5-3.3-5.5-7A3 3 0 0110 7.4a3 3 0 015.5 2.1c0 3.7-5.5 7-5.5 7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 12.5c1.5 2.5 4 4.5 8 6 4-1.5 6.5-3.5 8-6" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".5"/></svg>,
    rasm:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5c-4.4 0-8 3.2-8 7.3 0 4 3.6 7.2 8 7.2 1 0 1.7-.7 1.7-1.6 0-.5-.2-.8-.4-1.1-.3-.4-.4-.7-.4-1.1 0-.9.7-1.6 1.7-1.6h1.9c2 0 3.5-1.5 3.5-3.4 0-3.2-3.6-5.7-8-5.7z" stroke={c} strokeWidth="1.4"/><circle cx="6" cy="8" r="1" fill={c}/><circle cx="10" cy="6" r="1" fill={c}/><circle cx="14" cy="8" r="1" fill={c}/></svg>,
    sayr:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="11" cy="3.8" r="1.7" stroke={c} strokeWidth="1.3"/><path d="M8 18l2-4.5-2-2 1.2-4 3 1.5 2.8 1.2M9.2 7.5L6 9v3M10 13.5l3 1 1 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    boshqa:   c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2.5l1.7 4.6 4.8.4-3.7 3.1 1.2 4.7L10 12.7l-4 2.6 1.2-4.7-3.7-3.1 4.8-.4L10 2.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    task:     c => <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="15" rx="2" stroke={c} strokeWidth="1.4"/><path d="M7.5 3.5V2h5v1.5" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 8.5l1.5 1.5L12 6.8M7 13.5h6" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  };

  const categories = [
    {e:"📚",uz:"Kitob o'qish",en:"Reading", id:"kitob"},
    {e:"🧹",uz:"Xona yig'ish",en:"Clean room", id:"xona"},
    {e:"🍽️",uz:"Idish yuvish",en:"Wash dishes", id:"idish"},
    {e:"🛒",uz:"Do'kon xarid",en:"Grocery run", id:"dokon"},
    {e:"🌱",uz:"Gul sug'orish",en:"Water plants", id:"gul"},
    {e:"🚮",uz:"Axlat to'kish",en:"Take out trash", id:"axlat"},
    {e:"🛏️",uz:"O'rin yig'ish",en:"Make the bed", id:"orin"},
    {e:"📝",uz:"Dars qilish",en:"Homework", id:"darslik"},
    {e:"🧺",uz:"Kir yig'ish",en:"Laundry help", id:"kir"},
    {e:"🍳",uz:"Ovqat tayyorlash",en:"Help cooking", id:"ovqat"},
    {e:"🚴",uz:"Sport qilish",en:"Exercise", id:"sport"},
    {e:"🎹",uz:"Musiqa mashqi",en:"Music practice", id:"musiqa"},
    {e:"🧸",uz:"O'yinchoq yig'ish",en:"Tidy toys", id:"oyinchoq"},
    {e:"🐕",uz:"Hayvon boqish",en:"Pet care", id:"hayvon"},
    {e:"🪟",uz:"Deraza artish",en:"Clean windows", id:"deraza"},
    {e:"🧠",uz:"So'z yodlash",en:"Learn words", id:"soz"},
    {e:"🤲",uz:"Kattalarga ko'mak",en:"Help elders", id:"buvi"},
    {e:"🎨",uz:"Rasm chizish",en:"Drawing", id:"rasm"},
    {e:"🏃",uz:"Hovli sayri",en:"Outdoor walk", id:"sayr"},
    {e:"✨",uz:"Boshqa",en:"Other", id:"boshqa"},
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:th.bg, borderRadius:"24px 24px 0 0", maxWidth:480, width:"100%", padding:"24px 20px 36px", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:th.bor, margin:"0 auto 20px" }}/>
        <div style={{ fontSize:18, fontWeight:800, color:th.t1, marginBottom:20, textAlign:"center" }}>
          {"📋 "}
          {isKid
            ? (lg === "uz" ? "Yangi vazifa taklif qilish" : "Propose new task")
            : (lg === "uz" ? "Yangi vazifa berish" : "Add new task")
          }
        </div>
        
        {!isKid ? (
          <>
            <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Kim uchun?":"For whom?"}</label>
            {azolar.filter(a=>a.rol==="kid").length === 0
              ? <div style={{ background:th.am+"15", border:"1px solid "+th.am+"44", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:12, color:th.am }}>{"⚠️ "}{lg==="uz"?"Avval bola akkaunti yarating (Profil)":"Create a kid account first (Profile)"}</div>
              : <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
                  {azolar.filter(a=>a.rol==="kid").map(k => (
                    <button key={k.id} onClick={() => setVAssignee(k.id)} style={{ flexShrink:0, background:vAssignee===k.id?th.ac+"18":th.surH, border:"2px solid "+(vAssignee===k.id?th.ac:th.bor), borderRadius:14, padding:"10px 16px", cursor:"pointer", color:vAssignee===k.id?th.ac:th.t2, fontWeight:700, fontSize:13 }}>{"👶 "}{k.ism}</button>
                  ))}
                </div>
            }
          </>
        ) : (
          <>
            <div style={{ background:th.ac+"12", borderRadius:14, padding:"12px 14px", marginBottom:14, fontSize:13, color:th.t1, fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
              <span>💡</span>
              <span>{lg === "uz" ? "Ushbu vazifani o'zingiz bajarish uchun taklif qilasiz." : "You are proposing this task for yourself to complete."}</span>
            </div>
            {parents.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Kimga taklif yuboriladi?":"Whom to propose to?"}</label>
                <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
                  <button
                    type="button"
                    onClick={() => setVTargetParentId("all")}
                    style={{
                      flexShrink:0,
                      background: (!vTargetParentId || vTargetParentId === "all") ? th.ac+"18" : th.surH,
                      border: "2px solid " + ((!vTargetParentId || vTargetParentId === "all") ? th.ac : th.bor),
                      borderRadius:14,
                      padding:"10px 16px",
                      cursor:"pointer",
                      color: (!vTargetParentId || vTargetParentId === "all") ? th.ac : th.t2,
                      fontWeight:700,
                      fontSize:13
                    }}
                  >
                    {lg === "uz" ? "👨‍👩‍👧‍👦 Ikkalasiga ham / Barchaga" : "👨‍👩‍👧‍👦 Everyone / All parents"}
                  </button>
                  {parents.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setVTargetParentId(p.id)}
                      style={{
                        flexShrink:0,
                        background: vTargetParentId === p.id ? th.ac+"18" : th.surH,
                        border: "2px solid " + (vTargetParentId === p.id ? th.ac : th.bor),
                        borderRadius:14,
                        padding:"10px 16px",
                        cursor:"pointer",
                        color: vTargetParentId === p.id ? th.ac : th.t2,
                        fontWeight:700,
                        fontSize:13
                      }}
                    >
                      {p.rol === "bosh" ? "👑 " : "👤 "}{p.ism}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa turi":"Task type"}</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:20 }}>
          {categories.map(p => {
            const active = vEmoji === p.e;
            const activeColor = active ? th.ac : th.t2;
            const renderIco = lIco[p.id] || lIco.task;
            return (
              <button key={p.e} className="ui-press" onClick={() => { setVEmoji(p.e); setVTitle(lg==="uz"?p.uz:p.en); }}
                style={{
                  background: active ? th.ac + "18" : th.surH,
                  border: "2px solid " + (active ? th.ac : th.bor),
                  borderRadius: 14,
                  padding: "10px 4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  minHeight: 74,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, color: activeColor }}>
                  {renderIco(activeColor)}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>
                  {lg === "uz" ? p.uz : p.en}
                </span>
              </button>
            );
          })}
        </div>
        <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Vazifa nomi":"Task title"}</label>
        <input style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:14 }} value={vTitle} onChange={e => setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Xonani yig'ishtirish":"e.g. Clean the room"} />
        <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Mukofot (so'm)":"Reward (UZS)"}</label>
        <input
          type="text"
          inputMode="numeric"
          style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:18, fontWeight:800, textAlign:"center", outline:"none", boxSizing:"border-box", marginBottom:20 }}
          value={formatWithSpaces(vReward)}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, "");
            setVReward(raw);
          }}
          placeholder="0"
        />
        <label style={{ fontSize:11, color:th.t2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8, display:"block" }}>{lg==="uz"?"Muddat (ixtiyoriy)":"Deadline (optional)"}</label>
        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
          {[{n:0,uz:"Bugun",en:"Today"},{n:1,uz:"Ertaga",en:"Tomorrow"},{n:3,uz:"3 kun",en:"3 days"},{n:7,uz:"1 hafta",en:"1 week"}].map(o => {
            const d = new Date(); d.setDate(d.getDate()+o.n);
            const ds = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
            const on = vDeadline===ds;
            return <button key={o.n} onClick={() => setVDeadline(on?"":ds)} style={{ flex:"1 0 auto", background:on?th.ac+"18":th.surH, border:"1.5px solid "+(on?th.ac:th.bor), borderRadius:10, padding:"9px 12px", cursor:"pointer", color:on?th.ac:th.t2, fontWeight:700, fontSize:12 }}>{lg==="uz"?o.uz:o.en}</button>;
          })}
          <button onClick={() => setVDeadline("")} style={{ flex:"1 0 auto", background:!vDeadline?th.ac+"18":th.surH, border:"1.5px solid "+(!vDeadline?th.ac:th.bor), borderRadius:10, padding:"9px 12px", cursor:"pointer", color:!vDeadline?th.ac:th.t2, fontWeight:700, fontSize:12 }}>{lg==="uz"?"Muddatsiz":"None"}</button>
        </div>
        <input type="date" value={vDeadline||""} onChange={e => setVDeadline(e.target.value)} style={{ width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"12px 14px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:vDeadline?6:20, colorScheme:dark?"dark":"light" }} />
        {vDeadline && <div style={{ fontSize:12, color:th.t2, marginBottom:20 }}>{lg==="uz"?"Muddatida bajarilmasa, mukofot berilmaydi.":"No reward if the deadline is missed."}</div>}
        <button onClick={addVazifa} style={{ width:"100%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:14, padding:"15px", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer" }}>
          {isKid
            ? (lg === "uz" ? "Taklif jo'natish" : "Send proposal")
            : (lg === "uz" ? "Vazifa berish" : "Assign task")
          }
        </button>
      </div>
    </div>
  );
}
