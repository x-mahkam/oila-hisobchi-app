import React from "react";

export default function TilxatViewModal({
  tilxatView,
  th,
  lg,
  ok$,
  downloadFile,
  onClose
}) {
  if (!tilxatView) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.75)", zIndex: 1200, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: th.sur, borderBottom: "1px solid " + th.bor, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: th.t1 }}>{"\ud83d\udcc4"} Tilxat {tilxatView.num}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { try { const fr = document.getElementById("tilxatFrame"); fr && fr.contentWindow && fr.contentWindow.print(); } catch (e) { const okk = downloadFile(tilxatView.html, "Tilxat_" + tilxatView.num + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "Yuklab olindi!" : "Downloaded!") : "Xato", okk ? "ok" : "err"); } }} style={{ background: th.ac, border: "none", borderRadius: 9, padding: "8px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{lg === "uz" ? "PDF / Chop etish" : "PDF / Print"}</button>
          <button onClick={() => { const okk = downloadFile(tilxatView.html, "Tilxat_" + tilxatView.num + ".html", "text/html;charset=utf-8;"); ok$(okk ? (lg === "uz" ? "Yuklab olindi!" : "Downloaded!") : "Xato", okk ? "ok" : "err"); }} style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: 9, padding: "8px 12px", color: th.t1, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{lg === "uz" ? "Yuklab olish" : "Download"}</button>
          <button onClick={onClose} style={{ background: th.rd + "22", border: "1px solid " + th.rd + "55", borderRadius: 9, padding: "8px 12px", color: th.rd, cursor: "pointer", fontWeight: 800, fontSize: 12 }}>{"\u2715"}</button>
        </div>
      </div>
      <iframe id="tilxatFrame" title="Tilxat" srcDoc={tilxatView.html} style={{ flex: 1, width: "100%", border: "none", background: "#fff" }} />
    </div>
  );
}
