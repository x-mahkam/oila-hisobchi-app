import React from "react";
import { KN, KATS } from "../../utils/constants.js";

export default function VoiceInputModal({
  th,
  lg,
  f,
  t,
  voiceOn,
  voiceText,
  setVoiceText,
  voiceParsed,
  setVoiceParsed,
  startVoice,
  stopVoice,
  applyVoice,
  onClose
}) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 22, cursor: "pointer" }}>{"\u00d7"}</button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{t("vim_title")}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 36, textAlign: "center", maxWidth: 300 }}>{t("vim_example")}</div>
      <button onClick={voiceOn ? stopVoice : startVoice} style={{ width: 110, height: 110, borderRadius: "50%", background: voiceOn ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 30, boxShadow: voiceOn ? "0 0 0 12px rgba(239,68,68,.2),0 0 0 24px rgba(239,68,68,.1)" : "0 8px 30px rgba(139,92,246,.5)", transition: "all .3s" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <div style={{ fontSize: 14, color: voiceOn ? "#ef4444" : "rgba(255,255,255,.7)", fontWeight: 600, marginBottom: 24 }}>{voiceOn ? t("vim_listening") : t("vim_tapAndSpeak")}</div>
      {voiceText && <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 16, padding: "16px 20px", marginBottom: 20, maxWidth: 340, width: "100%" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{t("vim_heard")}</div>
        <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.5 }}>{voiceText}</div>
      </div>}
      {voiceParsed && <div style={{ background: "linear-gradient(135deg,#10b98122,#05966911)", border: "1.5px solid #10b98155", borderRadius: 16, padding: "16px 20px", marginBottom: 24, maxWidth: 340, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{t("vim_amount")}</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{f(voiceParsed.summa, true)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{t("vim_category")}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{(KN[lg] || KN.uz)[KATS.findIndex(k => k.id === voiceParsed.kat)]}</span>
        </div>
      </div>}
      {(voiceText && !voiceOn) && <div style={{ display: "flex", gap: 10, maxWidth: 340, width: "100%" }}>
        <button onClick={() => { setVoiceText(""); setVoiceParsed(null); startVoice(); }} style={{ flex: 1, background: "rgba(255,255,255,.15)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t("vim_retry")}</button>
        <button onClick={applyVoice} disabled={!voiceParsed} style={{ flex: 2, background: voiceParsed ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,.1)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: voiceParsed ? "pointer" : "not-allowed", opacity: voiceParsed ? 1 : .5 }}>{t("vim_add")}</button>
      </div>}
    </div>
  );
}
