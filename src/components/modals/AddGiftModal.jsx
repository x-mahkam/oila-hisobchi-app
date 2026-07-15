import React from "react";

export default function AddGiftModal({
  th,
  lg,
  STY,
  giftSum,
  setGiftSum,
  giftFrom,
  setGiftFrom,
  addGiftMoney,
  onClose,
  f
}) {
  const L = (uz, ru, en, kk, ky, tg, qr) => {
    return lg === "uz" ? uz :
           lg === "ru" ? ru :
           lg === "kk" ? kk :
           lg === "ky" ? ky :
           lg === "tg" ? tg :
           lg === "qr" ? qr :
           en;
  };

  const giftOptions = [
    ["\ud83d\udc74", L("Bobo", "Дедушка", "Grandpa", "Ата", "Таята", "Бобо", "Atan'")],
    ["\ud83d\udc75", L("Buvi", "Бабушка", "Grandma", "Әже", "Таяне", "Бибӣ", "An'ka")],
    ["\ud83d\udc68", L("Ota", "Папа", "Dad", "Әке", "Ата", "Падар", "Áke")],
    ["\ud83d\udc69", L("Ona", "Мама", "Mom", "Ана", "Апа", "Модар", "Ana")],
    ["\ud83e\uddd4", L("Tog'a", "Дядя (м)", "Uncle (m)", "Нағашы", "Таяке", "Тағо", "Tag'a")],
    ["\ud83d\udc68\u200d\ud83e\uddb1", L("Amaki", "Дядя (п)", "Uncle (p)", "Көкем", "Аба", "Амак", "Ake")],
    ["\ud83d\udc69\u200d\ud83e\uddb0", L("Amma", "Тетя (п)", "Aunt (p)", "Әпке", "Апа", "Амма", "Amma")],
    ["\ud83d\udc71\u200d\u2640\ufe0f", L("Xola", "Тетя (м)", "Aunt (m)", "Нағашы апа", "Таяже", "Хола", "Xala")],
    ["\ud83d\udc66", L("Aka", "Брат", "Brother", "Аға", "Байке", "Бародар", "Aka")],
    ["\ud83d\udc67", L("Opa", "Сестра", "Sister", "Әпке", "Эже", "Хоҳар", "Opa")],
    ["\ud83e\udd1d", L("Mehmon", "Гость", "Guest", "Қонақ", "Конок", "Меҳмон", "Meyman")],
    ["\ud83c\udf81", L("Boshqa", "Другое", "Other", "Басқа", "Башка", "Дигар", "Basqa")],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: th.bg, borderRadius: "24px 24px 0 0", maxWidth: 480, width: "100%", padding: "24px 20px 32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: th.bor, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>🎁</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 6, textAlign: "center" }}>{L("Sovg'a puli kiritish", "Добавить подарочные деньги", "Add gift money", "Сыйлық ақшасын қосу", "Сыйлык акчасын кошуу", "Иловаи пули тӯҳфавӣ", "Sıylıq pulın qosıw")}</div>
        <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>{L("Buvi, bobo yoki qarindosh bergan pulni qo'shing", "Добавьте деньги, подаренные бабушкой, дедушкой или родственниками", "Add money gifted by grandparents or relatives", "Әже, ата немесе туыстар берген ақшаны қосыңыз", "Таяне, таята же туугандар берген акчаны кошуңуз", "Пули аз ҷониби бибӣ, бобо ё хешовандон додашударо илова кунед", "An'ka, ata ya'ki qarındas' bergen puldı qosın'")}</div>
        <label style={STY.lb}>{L("Summa", "Сумма", "Amount", "Сомасы", "Суммасы", "Сумма", "Summa")}</label>
        <input style={{ ...STY.ip, fontSize: 22, fontWeight: 800, textAlign: "center" }} type="number" value={giftSum} onChange={e => setGiftSum(e.target.value)} placeholder="0" />
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          {[5000, 10000, 20000, 50000].map(sm => (
            <button key={sm} onClick={() => setGiftSum(String(sm))} style={{ flex: 1, background: String(giftSum) === String(sm) ? th.ac + "22" : th.surH, border: "1.5px solid " + (String(giftSum) === String(sm) ? th.ac : th.bor), borderRadius: 10, padding: "8px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: String(giftSum) === String(sm) ? th.ac : th.t2 }}>{f(sm, true)}</button>
          ))}
        </div>
        <label style={STY.lb}>{L("Kimdan?", "От кого?", "From whom?", "Кімнен?", "Кимден?", "Аз кӣ?", "Kimnen?")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
          {giftOptions.map(([em, nm]) => {
            const active = giftFrom === nm;
            return (
              <button key={nm} onClick={() => setGiftFrom(nm)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: active ? th.ac + "1c" : th.surH, border: "2px solid " + (active ? th.ac : th.bor), borderRadius: 12, padding: "9px 2px 7px", cursor: "pointer", minHeight: 62 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{em}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center" }}>{nm}</span>
              </button>
            );
          })}
        </div>
        <button onClick={addGiftMoney} style={{ ...STY.bt(), marginTop: 6, marginBottom: 0 }}>{L("Qo'shish", "Добавить", "Add", "Қосу", "Кошуу", "Илова кардан", "Qosıw")}</button>
      </div>
    </div>
  );
}
