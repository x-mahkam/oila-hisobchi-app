import React from "react";

export default function ReceiptScannerModal({
  th,
  scanVideoRef,
  scanMsg,
  stopScanner,
  t
}) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000", zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,.6)", position: "relative", zIndex: 2 }}>
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{t("rsm_title")}</div>
        <button onClick={stopScanner} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer" }}>{"\u00d7"}</button>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video ref={scanVideoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}/>
        <div style={{ position: "relative", zIndex: 2, width: 240, height: 240, border: "3px solid " + th.ac, borderRadius: 24, boxShadow: "0 0 0 9999px rgba(0,0,0,.5)" }}>
          <div style={{ position: "absolute", top: -3, left: -3, width: 40, height: 40, borderTop: "5px solid #fff", borderLeft: "5px solid #fff", borderRadius: "24px 0 0 0" }}/>
          <div style={{ position: "absolute", top: -3, right: -3, width: 40, height: 40, borderTop: "5px solid #fff", borderRight: "5px solid #fff", borderRadius: "0 24px 0 0" }}/>
          <div style={{ position: "absolute", bottom: -3, left: -3, width: 40, height: 40, borderBottom: "5px solid #fff", borderLeft: "5px solid #fff", borderRadius: "0 0 0 24px" }}/>
          <div style={{ position: "absolute", bottom: -3, right: -3, width: 40, height: 40, borderBottom: "5px solid #fff", borderRight: "5px solid #fff", borderRadius: "0 0 24px 0" }}/>
        </div>
      </div>
      <div style={{ padding: "20px 24px 40px", background: "rgba(0,0,0,.6)", textAlign: "center" }}>
        <div style={{ color: "#fff", fontSize: 14, marginBottom: 6 }}>{scanMsg}</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12, marginBottom: 16 }}>{t("rsm_pointQrIntoFrame")}</div>
        <button onClick={stopScanner} style={{ background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t("rsm_enterManually")}</button>
      </div>
    </div>
  );
}
