import { useState } from "react";
import { AppCard, ListItem } from "../ui/index.js";
import { SPACE, RADIUS, ALPHA, SHADOW, TYPE } from "../../utils/tokens.js";
import { Ico } from "../../utils/icons.jsx";
import { FAQS } from "../../utils/constants.js";

const T = {
  uz: { title: "Yordam", close: "Yopish" },
  ru: { title: "Помощь", close: "Закрыть" },
  en: { title: "Help", close: "Close" },
  kk: { title: "Көмек", close: "Жабу" },
  ky: { title: "Жардам", close: "Жабуу" },
  tg: { title: "Ёрдам", close: "Пӯшидан" },
  qr: { title: "Ja'rdem", close: "Jabiw" },
};

export default function HelpModal({ th, lg, onClose, onReplayTour }) {
  const [openIdx, setOpenIdx] = useState(null);
  const lang = lg || "uz";
  const t = T[lang] || T.uz;
  const faqList = FAQS[lang] || FAQS.uz;

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
