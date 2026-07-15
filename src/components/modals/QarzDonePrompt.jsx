export default function QarzDonePrompt({ q, th, STY, lg, f, onAddDaromad, onAddXarajat, onClose }) {
  const isLent = q.tur === "bergan";
  const dc = isLent ? th.gr : th.rd;

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: dc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>{isLent ? "💰" : "💸"}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 8 }}>
            {isLent 
              ? L("Qarz qaytarib olindi", "Долг возвращен вам", "Debt received", "Қарыз қайтарылды", "Карыз кайтарылды", "Қарз баргардонида шуд", "Qarız qaytarıp alındı")
              : L("Qarz qaytarildi", "Долг возвращен", "Debt paid", "Қарыз төленді", "Карыз төлөндү", "Қарз супорида шуд", "Qarız qaytarıldı")
            }
          </div>
          <div style={{ fontSize: 14, color: th.t2, lineHeight: 1.5 }}>
            {isLent
              ? L(
                  "Qaytarib olgan " + f(q.summa, true) + " pulni daromadlarga qo'shaylikmi?",
                  "Добавить полученные " + f(q.summa, true) + " в доходы?",
                  "Add " + f(q.summa, true) + " to income?",
                  "Қайтарылған " + f(q.summa, true) + " сомасын кіріске қосамыз ба?",
                  "Кайтарылган " + f(q.summa, true) + " суммасын кирешеге кошолубу?",
                  "Маблағи баргардонидашудаи " + f(q.summa, true) + "-ро ба даромадҳо илова кунем?",
                  "Qaytarıp alg'an " + f(q.summa, true) + " puldı da'ramatlarg'a qosayıq pa?"
                )
              : L(
                  "Qaytargan " + f(q.summa, true) + " pulni xarajatlarga qo'shaylikmi?",
                  "Добавить выплаченные " + f(q.summa, true) + " в расходы?",
                  "Add " + f(q.summa, true) + " to expenses?",
                  "Төленген " + f(q.summa, true) + " сомасын шығысқа қосамыз ба?",
                  "Төлөнгөн " + f(q.summa, true) + " суммасын чыгашага кошолубу?",
                  "Маблағи супоридашудаи " + f(q.summa, true) + "-ро ба хароҷотҳо илова кунем?",
                  "Qaytarg'an " + f(q.summa, true) + " puldı qa'rejetlerge qosayıq pa?"
                )
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{L("Yo'q", "Нет", "No", "Жоқ", "Жок", "Не", "Yaq")}</button>
          <button onClick={() => isLent ? onAddDaromad(q) : onAddXarajat(q)} style={{ flex: 2, background: "linear-gradient(135deg," + dc + "," + dc + "cc)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{L("Ha, qo'shilsin", "Да, добавить", "Yes, add", "Иә, қосылсын", "Ооба, кошулсун", "Бале, илова шавад", "Awa, qosılsın")}</button>
        </div>
      </div>
    </div>
  );
}
