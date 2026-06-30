// ═══════════════════════════════════════════════════════════
//  Ilova umumiy stil ob'ekti
// ═══════════════════════════════════════════════════════════
export function makeS(th) {
  return {
    pg:  { minHeight:"100vh", background:th.bg, fontFamily:"'Inter',system-ui,sans-serif", color:th.t1, maxWidth:430, margin:"0 auto" },
    cd:  { background:th.sur, borderRadius:18, padding:16, border:"1px solid "+th.bor, marginBottom:10 },
    ip:  { width:"100%", background:th.surH, border:"1.5px solid "+th.bor, borderRadius:13, padding:"13px 16px", color:th.t1, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:12 },
    lb:  { fontSize:10, color:th.t2, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:1.4, fontWeight:600 },
    bt:  (a, b) => ({ width:"100%", background:"linear-gradient(135deg,"+(a||th.ac)+","+(b||th.ac2)+")", border:"none", borderRadius:14, padding:"14px", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:9, boxShadow:"0 4px 14px "+(a||th.ac)+"44" }),
    tb:  on  => ({ flex:1, background:on?th.ac+"18":"transparent", border:"1.5px solid "+(on?th.ac:th.bor), borderRadius:11, padding:"9px 0", color:on?th.ac:th.t2, cursor:"pointer", fontWeight:700, fontSize:13 }),
    ch:  (on, c) => ({ whiteSpace:"nowrap", background:on?(c||th.ac)+"18":"transparent", border:"1px solid "+(on?(c||th.ac):th.bor), borderRadius:20, padding:"6px 14px", color:on?(c||th.ac):th.t2, cursor:"pointer", fontSize:12, fontWeight:600 }),
    row: { display:"flex", justifyContent:"space-between", alignItems:"center" },
    sec: { fontSize:10, color:th.t2, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:8 },
  };
}
