import React from "react";
import { KN, KATS } from "../../utils/constants.js";
import { useTranslation } from "react-i18next";

export default function VoiceInputModal({
  th,
  lg,
  f,
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
  const { t, i18n } = useTranslation();
  const L = (key, uz, ru = uz, en = uz, kk = uz, ky = uz, tg = uz, qr = uz) => {
    const activeLg = i18n.language || lg || "uz";
    const fallback = activeLg === "uz" ? uz :
                     activeLg === "ru" ? ru :
                     activeLg === "kk" ? kk :
                     activeLg === "ky" ? ky :
                     activeLg === "tg" ? tg :
                     activeLg === "qr" ? qr :
                     en;
    return t(key, fallback);
  };

  const activeLg = i18n.language || lg || "uz";
  const catNames = KN[activeLg] || KN.uz;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 22, cursor: "pointer" }}>{"\u00d7"}</button>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{L("voice_input_title", "Ovoz bilan kiritish", "Голосовой ввод", "Voice input", "Дауыспен енгізу", "Үн менен киргизүү", "Воридоти овозӣ", "Ovoz arqali kirgiziw")}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 36, textAlign: "center", maxWidth: 300 }}>{L("voice_input_example", "Masalan: \"Transportga 20 ming ishlatdim\"", "Например: \"Потратил 20 тысяч на транспорт\"", "E.g. \"Spent 20000 on transport\"", "Мысалы: \"Көлікке 20 мың жұмсадым\"", "Мисалы: \"Унаага 20 миң короттум\"", "Барои намуна: \"Барои нақлиёт 20 ҳазор сарф кардам\"", "Masalan: \"Transportqa 20 min' sarpladım\"")}</div>
      <button onClick={voiceOn ? stopVoice : startVoice} style={{ width: 110, height: 110, borderRadius: "50%", background: voiceOn ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 30, boxShadow: voiceOn ? "0 0 0 12px rgba(239,68,68,.2),0 0 0 24px rgba(239,68,68,.1)" : "0 8px 30px rgba(139,92,246,.5)", transition: "all .3s" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <div style={{ fontSize: 14, color: voiceOn ? "#ef4444" : "rgba(255,255,255,.7)", fontWeight: 600, marginBottom: 24 }}>{voiceOn ? L("listening", "Tinglayapman...", "Слушаю...", "Listening...", "Тыңдап тұрмын...", "Угуп жатам...", "Гӯш карда истодаам...", "Tin'lapman...") : L("tap_and_speak", "Bosing va gapiring", "Нажмите и говорите", "Tap and speak", "Басып сөйлеңіз", "Басып сүйлөңүз", "Пахш кунед ва гап занед", "Basın' ha'm so'ylen'")}</div>
      {voiceText && <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 16, padding: "16px 20px", marginBottom: 20, maxWidth: 340, width: "100%" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{L("voice_heard", "Eshitildi", "Распознано", "Heard", "Естілді", "Угулду", "Шунида шуд", "Esitildi")}</div>
        <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.5 }}>{voiceText}</div>
      </div>}
      {voiceParsed && <div style={{ background: "linear-gradient(135deg,#10b98122,#05966911)", border: "1.5px solid #10b98155", borderRadius: 16, padding: "16px 20px", marginBottom: 24, maxWidth: 340, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{L("summa", "Summa", "Сумма", "Amount", "Сомасы", "Суммасы", "Маблағ", "Summa")}</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{f(voiceParsed.summa, true)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{L("kategoriya", "Kategoriya", "Категория", "Category", "Санат", "Категория", "Категория", "Kategoriya")}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{catNames[KATS.findIndex(k => k.id === voiceParsed.kat)]}</span>
        </div>
      </div>}
      {(voiceText && !voiceOn) && <div style={{ display: "flex", gap: 10, maxWidth: 340, width: "100%" }}>
        <button onClick={() => { setVoiceText(""); setVoiceParsed(null); startVoice(); }} style={{ flex: 1, background: "rgba(255,255,255,.15)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{L("retry", "Qayta", "Повторить", "Retry", "Қайталау", "Кайрадан", "Дугона", "Qayta")}</button>
        <button onClick={applyVoice} disabled={!voiceParsed} style={{ flex: 2, background: voiceParsed ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,.1)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: voiceParsed ? "pointer" : "not-allowed", opacity: voiceParsed ? 1 : .5 }}>{L("add", "Qo'shish", "Добавить", "Add", "Қосу", "Кошуу", "Илова кардан", "Qosıw")}</button>
      </div>}
    </div>
  );
}
