import { useState, useRef } from "react";

export default function MaqsadConfirmModal({ info, th, lg, f, STY, onBought, onCancel, maq, setScr }) {
  const [step, setStep] = useState(1);
  const [giftPhoto, setGiftPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const goal = Array.isArray(maq) ? maq.find(m => m.id === info.maqsadId) : null;

  // Journey Calculations
  const created = goal?.createdAt ? new Date(goal.createdAt) : new Date();
  const completed = goal?.completedAt ? new Date(goal.completedAt) : new Date();
  const diffTime = Math.abs(completed - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Family contributors calculation
  const contribList = Array.isArray(goal?.contribs) ? goal.contribs : [];
  const members = Object.values(contribList.reduce((acc, c) => {
    const k = c.uid || "?";
    if (!acc[k]) acc[k] = { uid: c.uid, ism: c.ism || "", total: 0 };
    acc[k].total += Number(c.summa) || 0;
    if (c.ism) acc[k].ism = c.ism;
    return acc;
  }, {})).sort((a, b) => b.total - a.total);

  const totalGoalSum = goal?.maqsad || info.summa || 1;

  // Image Resizing to optimize Firestore storage limit
  const resizeImage = (base64Str, maxWidth = 350, maxHeight = 350) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) {
      alert(lg === "uz" ? "Rasm hajmi juda katta! 3 MB gacha yuklang." : "File is too large! Please upload under 3 MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const resized = await resizeImage(base64);
      setGiftPhoto(resized);
    };
    reader.readAsDataURL(file);
  };

  // Translations Map
  const T = {
    uz: {
      gReached: "Maqsadga yetdingiz!",
      didBuy: "Xarid qildingizmi?",
      noCancel: "Yo'q, voz kechdim",
      yesBought: "Ha, xarid qildim!",
      summaryTitle: "Sayohat xulosasi",
      daysDone: (days) => `Siz ${days} kunda orzuyingizga yetdingiz!`,
      contribTitle: "Kim qancha hissa qo'shdi:",
      uploadLabel: "Sovg'a rasmi (ixtiyoriy):",
      uploadPrompt: "Rasm yuklash",
      continueBtn: "Davom etish",
      newDreamTitle: "Yangi orzu?",
      newDreamPrompt: "Yana bir yangi orzu qo'yasizmi?",
      addDreamBtn: "Ha, yangi orzu qo'yish",
      laterBtn: "Keyinroq",
    },
    ru: {
      gReached: "Цель достигнута!",
      didBuy: "Вы купили это?",
      noCancel: "Нет, отменить",
      yesBought: "Да, купил!",
      summaryTitle: "Итоги путешествия",
      daysDone: (days) => `Вы достигли мечты за ${days} дней!`,
      contribTitle: "Кто сколько вложил:",
      uploadLabel: "Фото подарка (необязательно):",
      uploadPrompt: "Загрузить фото",
      continueBtn: "Продолжить",
      newDreamTitle: "Новая мечта?",
      newDreamPrompt: "Хотите поставить новую мечту?",
      addDreamBtn: "Да, поставить новую",
      laterBtn: "Позже",
    },
    en: {
      gReached: "Goal reached!",
      didBuy: "Did you buy it?",
      noCancel: "No, cancel",
      yesBought: "Yes, I bought it!",
      summaryTitle: "Journey Summary",
      daysDone: (days) => `You reached your dream in ${days} days!`,
      contribTitle: "Contribution breakdown:",
      uploadLabel: "Gift Photo (optional):",
      uploadPrompt: "Upload Photo",
      continueBtn: "Continue",
      newDreamTitle: "New Dream?",
      newDreamPrompt: "Would you like to set a new dream?",
      addDreamBtn: "Yes, set new dream",
      laterBtn: "Later",
    }
  };

  const t = T[lg] || T.uz;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
        
        {step === 1 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {/* Trophy SVG Icon instead of emojis */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px" }}>
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
              </svg>
              <div style={{ fontSize: 20, fontWeight: 800, color: th.t1, marginBottom: 8 }}>
                {t.gReached}
              </div>
              <div style={{ fontSize: 14, color: th.t2, lineHeight: 1.6, padding: "0 10px" }}>
                <b style={{ color: th.t1 }}>"{info.maqsadIsm}"</b> — {f(info.summa, true)}<br />
                <span style={{ color: th.t3 }}>{t.didBuy}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button 
                onClick={() => onCancel(info)} 
                style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                {t.noCancel}
              </button>
              <button 
                onClick={() => setStep(2)} 
                style={{ flex: 2, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {/* Checkmark SVG Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t.yesBought}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {/* Calendar / Timer Journey SVG icon */}
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 4 }}>
                {t.summaryTitle}
              </div>
              <div style={{ fontSize: 14, color: th.t2, fontWeight: 500, margin: "10px 0" }}>
                {t.daysDone(diffDays)}
              </div>
            </div>

            {/* If shared family goal, show breakdown */}
            {goal?.shared && members.length > 0 && (
              <div style={{ background: th.bg, borderRadius: 16, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 10 }}>
                  {t.contribTitle}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {members.map(m => {
                    const pct = Math.round((m.total / totalGoalSum) * 100) || 0;
                    return (
                      <div key={m.uid} style={{ fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: th.t1, marginBottom: 4 }}>
                          <span>{m.ism || (lg === "uz" ? "A'zo" : "Member")}</span>
                          <span style={{ fontWeight: 700 }}>{f(m.total, true)} ({pct}%)</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: th.bor, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: th.gr, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gift Photo Upload Component */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.t2, marginBottom: 8 }}>
                {t.uploadLabel}
              </div>
              
              {giftPhoto ? (
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid " + th.bor, background: th.bg, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={giftPhoto} alt="Gift preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button 
                    onClick={() => setGiftPhoto(null)} 
                    style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
                    title="Remove Photo"
                  >
                    {/* Trash Icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  style={{ border: "2px dashed " + th.bor, borderRadius: 16, padding: "20px", textAlign: "center", cursor: "pointer", background: th.bg, transition: "background 0.2s" }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: "none" }} 
                  />
                  {/* Camera SVG Outline Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={th.t2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px", display: "block" }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontSize: 13, color: th.t2, fontWeight: 500 }}>{t.uploadPrompt}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setStep(3)} 
              style={{ width: "100%", background: th.ac, border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
            >
              {t.continueBtn}
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              {/* Lightbulb / Idea SVG outline icon */}
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={th.ye || "#f59e0b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px" }}>
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.2 1.5 3.1.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 8 }}>
                {t.newDreamTitle}
              </div>
              <div style={{ fontSize: 14, color: th.t2 }}>
                {t.newDreamPrompt}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button 
                onClick={async () => {
                  await onBought(info, giftPhoto);
                  localStorage.setItem("open_add_goal", "true");
                  setScr("maqsad");
                }} 
                style={{ width: "100%", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                {t.addDreamBtn}
              </button>
              <button 
                onClick={async () => {
                  await onBought(info, giftPhoto);
                }} 
                style={{ width: "100%", background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                {t.laterBtn}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
