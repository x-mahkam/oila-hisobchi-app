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
  const giftOptions = [
    ["\ud83d\udc74", lg === "uz" ? "Bobo" : "Grandpa"],
    ["\ud83d\udc75", lg === "uz" ? "Buvi" : "Grandma"],
    ["\ud83d\udc68", lg === "uz" ? "Ota" : "Dad"],
    ["\ud83d\udc69", lg === "uz" ? "Ona" : "Mom"],
    ["\ud83e\uddd4", lg === "uz" ? "Tog'a" : "Uncle (m)"],
    ["\ud83d\udc68\u200d\ud83e\uddb1", lg === "uz" ? "Amaki" : "Uncle (p)"],
    ["\ud83d\udc69\u200d\ud83e\uddb0", lg === "uz" ? "Amma" : "Aunt (p)"],
    ["\ud83d\udc71\u200d\u2640\ufe0f", lg === "uz" ? "Xola" : "Aunt (m)"],
    ["\ud83d\udc66", lg === "uz" ? "Aka" : "Brother"],
    ["\ud83d\udc67", lg === "uz" ? "Opa" : "Sister"],
    ["\ud83e\udd1d", lg === "uz" ? "Mehmon" : "Guest"],
    ["\ud83c\udf81", lg === "uz" ? "Boshqa" : "Other"],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: th.bg, borderRadius: "24px 24px 0 0", maxWidth: 480, width: "100%", padding: "24px 20px 32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: th.bor, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>🎁</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 6, textAlign: "center" }}>{lg === "uz" ? "Sovg'a puli kiritish" : "Add gift money"}</div>
        <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>{lg === "uz" ? "Buvi, bobo yoki qarindosh bergan pulni qo'shing" : "Add money from relatives"}</div>
        <label style={STY.lb}>{lg === "uz" ? "Summa" : "Amount"}</label>
        <input style={{ ...STY.ip, fontSize: 22, fontWeight: 800, textAlign: "center" }} type="number" value={giftSum} onChange={e => setGiftSum(e.target.value)} placeholder="0" />
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          {[5000, 10000, 20000, 50000].map(sm => (
            <button key={sm} onClick={() => setGiftSum(String(sm))} style={{ flex: 1, background: String(giftSum) === String(sm) ? th.ac + "22" : th.surH, border: "1.5px solid " + (String(giftSum) === String(sm) ? th.ac : th.bor), borderRadius: 10, padding: "8px 0", cursor: "pointer", fontSize: 11, fontWeight: 700, color: String(giftSum) === String(sm) ? th.ac : th.t2 }}>{f(sm, true)}</button>
          ))}
        </div>
        <label style={STY.lb}>{lg === "uz" ? "Kimdan?" : "From whom?"}</label>
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
        <button onClick={addGiftMoney} style={{ ...STY.bt(), marginTop: 6, marginBottom: 0 }}>{lg === "uz" ? "Qo'shish" : "Add"}</button>
      </div>
    </div>
  );
}
