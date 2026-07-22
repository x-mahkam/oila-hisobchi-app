import { useState } from "react";
import { AppCard, ListItem } from "../ui/index.js";
import { SPACE, RADIUS, ALPHA, SHADOW, TYPE } from "../../utils/tokens.js";
import { Ico } from "../../utils/icons.jsx";
import { FAQS } from "../../utils/constants.js";
import { fbDB, fbAuth } from "../../firebase.js";
import { collection, addDoc } from "firebase/firestore";

const T = {
  uz: { title: "Yordam", close: "Yopish", contact: "Murojaat yuborish", contactPh: "Savolingiz yoki muammoingizni yozing…", send: "Yuborish", sent: "Yuborildi! Javob bildirishnoma sifatida keladi.", err: "Yuborilmadi, qayta urinib ko'ring" },
  ru: { title: "Помощь", close: "Закрыть", contact: "Написать в поддержку", contactPh: "Опишите вопрос или проблему…", send: "Отправить", sent: "Отправлено! Ответ придёт уведомлением.", err: "Не отправлено, попробуйте ещё раз" },
  en: { title: "Help", close: "Close", contact: "Contact support", contactPh: "Describe your question or issue…", send: "Send", sent: "Sent! You'll get a reply as a notification.", err: "Failed to send, please retry" },
  kk: { title: "Көмек", close: "Жабу", contact: "Қолдауға жазу", contactPh: "Сұрағыңызды жазыңыз…", send: "Жіберу", sent: "Жіберілді!", err: "Жіберілмеді" },
  ky: { title: "Жардам", close: "Жабуу", contact: "Колдоого жазуу", contactPh: "Сурооңузду жазыңыз…", send: "Жөнөтүү", sent: "Жөнөтүлдү!", err: "Жөнөтүлгөн жок" },
  tg: { title: "Ёрдам", close: "Пӯшидан", contact: "Ба дастгирӣ нависед", contactPh: "Саволатонро нависед…", send: "Фиристодан", sent: "Фиристода шуд!", err: "Фиристода нашуд" },
  qr: { title: "Ja'rdem", close: "Jabiw", contact: "Qollawg'a jazıw", contactPh: "Sorawın'ızdı jazın'…", send: "Jiberiw", sent: "Jiberildi!", err: "Jiberilmedi" },
};

export default function HelpModal({ th, lg, onClose, onReplayTour, user }) {
  const [openIdx, setOpenIdx] = useState(null);
  const lang = lg || "uz";
  const t = T[lang] || T.uz;
  const faqList = FAQS[lang] || FAQS.uz;

  // ── Support murojaati ──
  const [msg, setMsg] = useState("");
  const [sendState, setSendState] = useState(""); // "" | "busy" | "ok" | "err"
  const sendTicket = async () => {
    const text = msg.trim();
    if (!text || sendState === "busy") return;
    setSendState("busy");
    try {
      const authUid = fbAuth.currentUser?.uid;
      if (!authUid) throw new Error("auth yo'q");
      await addDoc(collection(fbDB, "support_tickets"), {
        authUid,
        userId: user?.id || authUid,
        ism: user?.ism || "",
        email: user?.email || "",
        tel: user?.tel || "",
        oilaId: user?.oilaId || "",
        lg: lang,
        text,
        t: Date.now(),
        status: "new",
        messages: [{ from: "user", text, t: Date.now() }],
      });
      setMsg("");
      setSendState("ok");
    } catch (e) {
      console.error("support ticket:", e);
      setSendState("err");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: th.sur,
          borderRadius: RADIUS.l,
          padding: "24px",
          width: "100%",
          maxWidth: "420px",
          border: "1px solid " + th.bor,
          boxShadow: SHADOW.e3,
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={th.ac}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 12px", display: "block" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ ...TYPE.title, color: th.t1 }}>{t.title}</div>
        </div>

        {/* FAQs List Area */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginBottom: 20 }}>
          {faqList.map((item, i) => (
            <AppCard
              key={i}
              th={th}
              pad={0}
              style={{
                marginBottom: SPACE.s2,
                overflow: "hidden",
                border: "1px solid " + th.bor,
              }}
            >
              <ListItem
                th={th}
                title={item.q}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                right={Ico.chevron(th.ac, openIdx === i)}
                divider={openIdx === i}
                style={{
                  background: openIdx === i ? th.ac + ALPHA.soft : "transparent",
                  cursor: "pointer",
                }}
              />
              {openIdx === i && (
                <div
                  style={{
                    background: th.surH,
                    padding: SPACE.s3 + "px " + SPACE.s4 + "px",
                    ...TYPE.caption,
                    color: th.t2,
                    lineHeight: 1.75,
                  }}
                >
                  {item.a}
                </div>
              )}
            </AppCard>
          ))}
        </div>

        {/* ── Murojaat yuborish (support) ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 700, marginBottom: 6 }}>💬 {t.contact}</div>
          <textarea
            value={msg}
            onChange={(e) => { setMsg(e.target.value); if (sendState) setSendState(""); }}
            placeholder={t.contactPh}
            maxLength={2000}
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical",
              background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.m,
              padding: "10px 12px", color: th.t1, fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />
          {sendState === "ok" && <div style={{ ...TYPE.caption, color: th.ac, marginTop: 4 }}>{t.sent}</div>}
          {sendState === "err" && <div style={{ ...TYPE.caption, color: "#e5484d", marginTop: 4 }}>{t.err}</div>}
          <button
            onClick={sendTicket}
            disabled={!msg.trim() || sendState === "busy"}
            style={{
              width: "100%", marginTop: 8, background: msg.trim() ? th.ac : th.surH,
              border: "1px solid " + (msg.trim() ? th.ac : th.bor), borderRadius: RADIUS.m,
              padding: "11px", color: msg.trim() ? "#fff" : th.t2, cursor: msg.trim() ? "pointer" : "default",
              fontWeight: 700, fontSize: 13,
            }}
          >
            {sendState === "busy" ? "…" : t.send}
          </button>
        </div>

        {/* Action Button */}
        {onReplayTour && (
          <button
            onClick={onReplayTour}
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid " + th.bor,
              borderRadius: RADIUS.m,
              padding: "11px",
              color: th.t1,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={th.t1}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {{
              uz: "Qo'llanmani qayta ko'rish",
              ru: "Повторить тур",
              en: "Replay Tour",
              kk: "Шолуды қайталау",
              ky: "Турду кайталоо",
              tg: "Дастури такрорӣ",
              qr: "Qayta ko'riw",
            }[lang] || "Replay Tour"}
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: th.ac,
            border: "none",
            borderRadius: RADIUS.m,
            padding: "13px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
