import React, { useState } from "react";
import { SPACE, RADIUS, TYPE, SHADOW, ALPHA } from "../utils/tokens.js";
import { PrimaryButton } from "./ui/index.js";

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

  const uz = lg === "uz";
  const totalLimit = dailyLimit + extraMinutesToday;

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
          {uz ? "Bugungi ekran vaqtingiz tugadi!" : "Время использования экрана истекло!"}
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
          {uz
            ? `Kunlik limit: ${totalLimit} daqiqa. Siz bugun ${todayMinutes} daqiqa davomida ilovadan foydalandingiz.`
            : `Дневной лимит: ${totalLimit} мин. Сегодня вы использовали приложение ${todayMinutes} мин.`}
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
            {uz ? "Ekran vaqti holati" : "Статус экранного времени"}
          </div>

          <div
            style={{
              ...TYPE.heading,
              fontWeight: 800,
              color: th.rd,
              margin: 0
            }}
          >
            {uz ? "Bloklandi" : "Заблокировано"}
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
              {uz
                ? "So'rov yuborildi. Ota-onangiz tasdiqlashini kuting."
                : "Запрос отправлен. Ожидайте одобрения родителей."}
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
                ? (uz ? "Yuborilmoqda..." : "Отправка...")
                : (uz ? "Ota-onadan qo'shimcha vaqt so'rash (+15 m)" : "Попросить еще время у родителей (+15 мин)")}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
