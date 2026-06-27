import { Ico } from "../../utils/icons.jsx";
import { td } from "../../utils/formatters.js";

export default function BottomNav({
  navItems, scr, setScr, th, isKid, buzz,
  setShowAddModal, setAddModalTab, setAddStep, setAddKat,
  setFS, setFIz, setFSn, setFDS, setFDI
}) {
  return (
    <div style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430, background:th.sur,
      borderTop:"1px solid "+th.bor, padding:"8px 12px 22px",
      display:"flex", justifyContent:"space-around", alignItems:"center", zIndex:20
    }}>
      {navItems.map(item => item.pr
        ? <button key="add"
            onClick={() => {
              buzz(15);
              setShowAddModal(true);
              setAddModalTab(isKid ? "daromad" : "xarajat");
              setAddStep("kat");
              setAddKat(null);
              setFS(""); setFIz(""); setFSn(td());
              setFDS(""); setFDI("");
            }}
            style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 22px "+th.ac+"55", flexShrink:0 }}
            className="anim-pulse">
            {Ico.add("#fff")}
          </button>
        : <button key={item.id}
            onClick={() => { buzz(8); setScr(item.id); }}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, opacity:scr===item.id?1:0.5, transition:"all .2s", padding:"4px 8px", transform:scr===item.id?"translateY(-2px)":"none" }}>
            {item.id==="bosh"    && Ico.navHome(scr===item.id?th.ac:th.t2)}
            {item.id==="grafik"  && Ico.navChart(scr===item.id?th.ac:th.t2)}
            {item.id==="maqsad"  && Ico.navGoal(scr===item.id?th.ac:th.t2)}
            {item.id==="hisobot" && Ico.navRep(scr===item.id?th.ac:th.t2)}
            {item.id==="qarz" && (
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="3" y="6" width="20" height="14" rx="3" fill={scr===item.id?th.ac:th.t2} opacity=".15" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.4"/>
                <path d="M3 10h20" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.3"/>
                <path d="M7 14h5M16 14h3" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            {item.id==="vazifa" && (
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="4" y="3" width="18" height="20" rx="3" fill={scr===item.id?th.ac:th.t2} opacity=".15" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.4"/>
                <path d="M8 9l2 2 4-4" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16h9" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:.5, color:scr===item.id?th.ac:th.t2 }}>{item.lb}</span>
          </button>
      )}
    </div>
  );
}
