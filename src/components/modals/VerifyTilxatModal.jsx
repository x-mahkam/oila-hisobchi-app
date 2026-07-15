import React from "react";

export default function VerifyTilxatModal({ verifyTilxat, th, lg, STY, f, onClose }) {
  if (!verifyTilxat) return null;
  const v = verifyTilxat;

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
    <div style={{ ...STY.pg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "30px 24px", maxWidth: 420, width: "100%", border: "1px solid " + th.bor, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 14px" }}>
            <img src="/icon.svg" alt="Logo" style={{ width: 80, height: 80 }} referrerPolicy="no-referrer" />
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", border: "2.5px solid " + th.sur, boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }}>{"\u2713"}</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: th.t1 }}>{L("Hujjat tasdiqlandi", "Документ подтверждён", "Document verified", "Құжат расталды", "Документ тастыкталды", "Ҳуҷҷат тасдиқ шуд", "Hu'jjet tastıyıqlandı")}</div>
          <div style={{ fontSize: 12, color: th.gr, fontWeight: 600, marginTop: 4 }}>{"\ud83d\udd12"} {L("Oila Hisobchi rasmiy tilxati", "Официальная расписка Oila Hisobchi", "Official Oila Hisobchi receipt", "Oila Hisobchi ресми тілхаты", "Oila Hisobchi расмий тил каты", "Забонтили расмии Oila Hisobchi", "Oila Hisobchi rasmiy tilxatı")}</div>
        </div>
        <div style={{ background: th.bg, borderRadius: 16, padding: "18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Hujjat raqami", "Номер документа", "Document №", "Құжат нөмірі", "Документ номери", "Рақами ҳуҷҷат", "Hu'jjet nomeri")}</span><span style={{ fontSize: 12, fontWeight: 700, color: th.ac, fontFamily: "monospace" }}>{v.n}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Qarzdor", "Должник", "Debtor", "Борышкер", "Карызкор", "Қарздор", "Qarzdar")}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.q}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Kreditor", "Кредитор", "Creditor", "Кредитор", "Кредитор", "Кредитор", "Kreditor")}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.k}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Summa", "Сумма", "Amount", "Сомасы", "Суммасы", "Сумма", "Summa")}</span><span style={{ fontSize: 15, fontWeight: 800, color: th.gr }}>{f(Number(v.s), true)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Berilgan sana", "Дата выдачи", "Date", "Берілген күні", "Берилген күнү", "Таърихи супориш", "Berilgen sa'ne")}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.d}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ fontSize: 12, color: th.t2 }}>{L("Qaytarish", "Возврат", "Return by", "Қайтару күні", "Кайтаруу күнү", "Баргардонидан", "Qaytarıw")}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.r}</span></div>
        </div>
        <div style={{ fontSize: 11, color: th.t2, textAlign: "center", lineHeight: 1.6, marginBottom: 18, background: th.ac + "0d", borderRadius: 10, padding: "10px 12px" }}>{L("Bu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. Ma'lumotlar QR kod orqali tekshirildi.", "Этот документ подтверждён в приложении обеими сторонами. Данные проверены по QR-коду.", "This document has been electronically confirmed by both parties in the 'Oila Hisobchi' app. Data verified via QR code.", "Бұл құжат 'Oila Hisobchi' қосымшасында қос тараптан да электронды түрде расталған. Деректер QR-код арқылы тексерілді.", "Бул документ 'Oila Hisobchi' тиркемесинде эки тараптан тең электрондук түрдө тастыкталган. Маалыматтар QR-код аркылуу текшерилди.", "Ин ҳуҷҷат дар замимаи 'Oila Hisobchi' аз ҷониби ҳар ду тараф ба таври электронӣ тасдиқ шудааст. Маълумот тавассути рамзи QR санҷида шуд.", "Bul hu'jjet 'Oila Hisobchi' qosımshasında ha'r eki ta'repinen de elektron tastıyıqlang'an. Mag'lıwmatlar QR kod arqalı tekserildi.")}</div>
        <button onClick={onClose} style={{ ...STY.bt(), marginBottom: 0 }}>{L("Ilovaga o'tish", "Открыть приложение", "Open app", "Қосымшаға өту", "Тиркемеге өтүү", "Гузариш ба замима", "Qosımshag'a o'tiw")}</button>
      </div>
    </div>
  );
}
