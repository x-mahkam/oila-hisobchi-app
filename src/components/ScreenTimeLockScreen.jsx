import React, { useState } from "react";
import { SPACE, RADIUS, TYPE, SHADOW, ALPHA } from "../utils/tokens.js";
import { PrimaryButton } from "./ui/index.js";

const T = {
  title: {
    uz: "Bugungi ekran vaqtingiz tugadi!",
    ru: "Время использования экрана истекло!",
    en: "Your screen time limit has been reached today!",
    kk: "Бүгінгі экран уақытыңыз аяқталды!",
    ky: "Бүгүнкү экран убактыңыз бүттү!",
    tg: "Вақти экрани имрӯзаи шумо ба охир расид!",
    qr: "Bug'ingi ekran waqtin'iz bitti!"
  },
  desc: (limit, minutes) => ({
    uz: `Kunlik limit: ${limit} daqiqa. Siz bugun ${minutes} daqiqa davomida ilovadan foydalandingiz.`,
    ru: `Дневной лимит: ${limit} мин. Сегодня вы использовали приложение ${minutes} мин.`,
    en: `Daily limit: ${limit} minutes. You have used the app for ${minutes} minutes today.`,
    kk: `Күнделікті лимит: ${limit} минут. Бүгін сіз қолданбаны ${minutes} минут пайдаландыңыз.`,
    ky: `Күнүмдүк чектөө: ${limit} мүнөт. Сиз бүгүн тиркемени ${minutes} мүнөт колдондуңуз.`,
    tg: `Лимити рӯзона: ${limit} дақиқа. Шумо имрӯз барномаро ${minutes} дақиқа истифода бурдед.`,
    qr: `Ku'ndelikli limit: ${limit} minut. Siz bug'in ilovadan ${minutes} minut paydalandin'iz.`
  }),
  statusLabel: {
    uz: "Ekran vaqti holati",
    ru: "Статус экранного времени",
    en: "Screen Time Status",
    kk: "Экран уақытының күйі",
    ky: "Экран убактысынын абалы",
    tg: "Ҳолати вақти экран",
    qr: "Ekran waqti jag'dayi"
  },
  locked: {
    uz: "Bloklandi",
    ru: "Заблокировано",
    en: "Blocked",
    kk: "Бұғатталды",
    ky: "Бөгөттөлдү",
    tg: "Қулф шуд",
    qr: "Bloklandi"
  },
  sent: {
    uz: "So'rov yuborildi. Ota-onangiz tasdiqlashini kuting.",
    ru: "Запрос отправлен. Ожидайте одобрения родителей.",
    en: "Request sent. Waiting for parent's approval.",
    kk: "Сұраныс жіберілді. Ата-анаңыздың мақұлдауын күтіңіз.",
    ky: "Сурам жөнөтүлдү. Ата-энеңиздин ырастоосун күтүңүз.",
    tg: "Дархост фиристода шуд. Интизори тасдиқи волидон бошед.",
    qr: "Soraw jiberildi. Ata-anan'iz tastiyqlawin kutin'."
  },
  sending: {
    uz: "Yuborilmoqda...",
    ru: "Отправка...",
    en: "Sending...",
    kk: "Жіберілуде...",
    ky: "Жөнөтүлүүдө...",
    tg: "Фиристода мешавад...",
    qr: "Jiberilmekte..."
  },
  requestBtn: {
    uz: "Ota-onadan qo'shimcha vaqt so'rash (+15 m)",
    ru: "Попросить еще время у родителей (+15 мин)",
    en: "Request more time from parents (+15 min)",
    kk: "Ата-анадан қосымша уақыт сұрау (+15 мин)",
    ky: "Ата-энеден кошумча убакыт суроо (+15 мүн)",
    tg: "Дархости вақти иловагӣ аз волидон (+15 дақиқа)",
    qr: "Ata-anadan qosimsha waqit soraw (+15 min)"
  }
};

export default function ScreenTimeLockScreen({
  th,
  lg,
  todayMinutes,
  dailyLimit,
  extraMinutesToday,
  requestExtraTime
}) {
  const [requested, setRequested] = useState(false);
  const [sending, setSending] = useState(false);

  const totalLimit = dailyLimit + extraMinutesToday;
  const l = lg || "uz";

  const handleRequest = async () => {
    if (requested || sending) return;
    setSending(true);
    try {
      await requestExtraTime(15); // Standard request for 15 minutes
      setRequested(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      id="screen-time-lock-screen"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: th.bg,
        color: th.t1,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: SPACE.s6,
        boxSizing: "border-box",
        textAlign: "center"
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: SPACE.s5
        }}
      >
        {/* Hourglass SVG Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: RADIUS.full,
            backgroundColor: th.ac + "15",
            color: th.ac,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: SPACE.s2
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 2h14" />
            <path d="M5 22h14" />
            <path d="M19 2v4c0 3.87-3.13 7-7 7s-7-3.13-7-7V2" />
            <path d="M5 22v-4c0-3.87 3.13-7 7-7s7 3.13 7 7v4" />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            ...TYPE.title,
            fontWeight: 800,
            color: th.t1,
            margin: 0,
            lineHeight: 1.3
          }}
        >
          {T.title[l] || T.title.uz}
        </h1>

        {/* Subtitle with details */}
        <p
          style={{
            ...TYPE.body,
            color: th.t2,
            margin: 0,
            lineHeight: 1.6
          }}
        >
          {(T.desc(totalLimit, todayMinutes)[l] || T.desc(totalLimit, todayMinutes).uz)}
        </p>

        {/* Box representing lock status */}
        <div
          style={{
            backgroundColor: th.sur,
            border: `1.5px solid ${th.bor}`,
            borderRadius: RADIUS.m,
            padding: SPACE.s4,
            width: "100%",
            boxSizing: "border-box",
            boxShadow: SHADOW.e1
          }}
        >
          <div
            style={{
              ...TYPE.caption,
              color: th.t3,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: SPACE.s2
            }}
          >
            {T.statusLabel[l] || T.statusLabel.uz}
          </div>

          <div
            style={{
              ...TYPE.heading,
              fontWeight: 800,
              color: th.rd,
              margin: 0
            }}
          >
            {T.locked[l] || T.locked.uz}
          </div>
        </div>

        {/* Actions */}
        <div style={{ width: "100%", marginTop: SPACE.s2 }}>
          {requested ? (
            <div
              style={{
                ...TYPE.caption,
                color: th.gr,
                fontWeight: 700,
                backgroundColor: th.gr + "10",
                padding: SPACE.s3,
                borderRadius: RADIUS.m,
                border: `1.5px solid ${th.gr}30`
              }}
            >
              {T.sent[l] || T.sent.uz}
            </div>
          ) : (
            <PrimaryButton
              th={th}
              onClick={handleRequest}
              disabled={sending}
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${th.ac}, ${th.ac2 || th.ac})`
              }}
            >
              {sending
                ? (T.sending[l] || T.sending.uz)
                : (T.requestBtn[l] || T.requestBtn.uz)}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
