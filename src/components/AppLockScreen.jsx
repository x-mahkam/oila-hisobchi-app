import { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { hp } from "../utils/formatters.js";
import { SPACE, RADIUS, TYPE, ALPHA, COMP } from "../utils/tokens.js";
import { NativeBiometric } from "capacitor-native-biometric";
import { useApp } from "../context/AppContext.jsx";
import { ConfirmDialog } from "./ui/index.js";

export default function AppLockScreen({ th, uid, onUnlock }) {
  const { t, logout } = useApp();
  const [pin, setPin] = useState("");
  const [storedPinHash, setStoredPinHash] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  // Qurilma biometrikani QO'LLAB-QUVVATLAYDIMI — sozlamalardagi "yoqilganmi"
  // belgisidan mustaqil. Belgi shu qiymatga qarab ko'rsatiladi, shunda
  // foydalanuvchi avval Sozlamalarga kirib alohida yoqmagan bo'lsa ham
  // qurilma qo'llab-quvvatlasa PIN ekranida darhol ko'rinadi.
  const [deviceBiometricAvailable, setDeviceBiometricAvailable] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  // VAQTINCHALIK DIAGNOSTIKA: App.jsx boot ketma-ketligi vaqt jurnali.
  const [bootLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oilaV7_bootLog") || "[]"); } catch (_e) { return []; }
  });

  useEffect(() => {
    NativeBiometric.isAvailable()
      .then(result => setDeviceBiometricAvailable(!!result.isAvailable))
      .catch(() => setDeviceBiometricAvailable(false));
  }, []);

  useEffect(() => {
    if (uid) {
      db.g("security_" + uid).then(sec => {
        if (sec && typeof sec === "object") {
          setStoredPinHash(sec.pinHash || null);
          setBiometricEnabled(!!sec.biometricEnabled);
          if (sec.biometricEnabled) {
            // Foydalanuvchi avval yoqqan bo'lsa — avtomatik so'raladi.
            triggerBiometrics();
          }
        }
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load security settings", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const triggerBiometrics = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: t("alk_biometricReason"),
          title: t("alk_biometricTitle"),
          subtitle: t("alk_biometricSubtitle"),
          description: t("alk_biometricDescription")
        });
        // Muvaffaqiyatli tasdiqlangach, keyingi safarlar avtomatik
        // so'ralishi uchun sozlamani ham yoqib qo'yamiz.
        if (uid && !biometricEnabled) {
          try {
            const cur = (await db.g("security_" + uid)) || {};
            await db.s("security_" + uid, { ...cur, biometricEnabled: true });
            setBiometricEnabled(true);
          } catch (_e) {}
        }
        onUnlock();
      }
    } catch (e) {
      console.error("Biometric authentication failed", e);
    }
  };

  const handleKeyPress = async (num) => {
    if (num === "") return;
    setError("");
    if (num === "del") {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    const nextPin = pin + String(num);
    setPin(nextPin);

    if (nextPin.length === 4) {
      const hashed = await hp(nextPin);
      if (hashed === storedPinHash) {
        onUnlock();
      } else {
        setError(t("alk_pinIncorrect"));
        setPin("");
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }
  };

  const confirmResetPin = async () => {
    setShowForgotConfirm(false);
    try {
      const cur = (await db.g("security_" + uid)) || {};
      await db.s("security_" + uid, { ...cur, pinHash: null, biometricEnabled: false });
    } catch (e) {
      console.error("Failed to reset PIN", e);
    }
    logout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 120, height: 120, borderRadius: RADIUS.m, background: th.sur, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke={th.bor} strokeWidth="2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: SPACE.s4,
      boxSizing: "border-box"
    }}>
      {/* Header / Lock Icon */}
      <div style={{ textAlign: "center", marginBottom: SPACE.s6 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: RADIUS.full,
          background: th.ac + ALPHA.soft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto " + SPACE.s3 + "px"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ ...TYPE.heading, color: th.t1, margin: 0 }}>
          {t("alk_appLocked")}
        </h2>
        <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, marginBottom: 0 }}>
          {t("alk_enterPinToContinue")}
        </p>
      </div>

      {/* Dots Indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s3, marginBottom: SPACE.s2 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: SPACE.s3,
            height: SPACE.s3,
            borderRadius: RADIUS.full,
            background: pin.length > i ? th.ac : th.bor,
            transition: "background 0.15s ease-in-out"
          }} />
        ))}
      </div>

      {/* Error Message */}
      <div style={{ height: 24, marginBottom: SPACE.s3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {error && (
          <span style={{ ...TYPE.tiny, color: th.rd, fontWeight: 600 }}>
            {error}
          </span>
        )}
      </div>

      {/* Numeric Keyboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACE.s2, width: "100%", maxWidth: 300 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, deviceBiometricAvailable ? "bio" : "", 0, "del"].map((num, ni) => {
          if (num === "bio") {
            return (
              <button key={ni} className="ui-press" onClick={triggerBiometrics} aria-label={t("alk_fingerprint")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: RADIUS.s + 2,
                  padding: SPACE.s3 + "px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: COMP.touchMin,
                  outline: "none"
                }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-10 10c0 1.25.23 2.45.65 3.56" />
                  <path d="M2.35 15.65A11 11 0 0 1 12 10a11 11 0 0 1 9.65 5.65" />
                  <path d="M21.35 15.65a10 10 0 0 0 .65-3.65A10 10 0 0 0 12 2" />
                  <path d="M8 12a4 4 0 0 1 8 0" />
                  <path d="M12 12v3" />
                  <path d="M12 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                </svg>
              </button>
            );
          }
          return (
            <button key={ni} className={num === "" ? "" : "ui-press"} onClick={() => handleKeyPress(num)} aria-label={num === "del" ? t("alk_delete") : String(num)}
              style={{
                background: typeof num === "number" ? th.surH : "transparent",
                border: typeof num === "number" ? "1px solid " + th.bor : "none",
                borderRadius: RADIUS.s + 2,
                padding: (SPACE.s3 + 2) + "px",
                fontSize: TYPE.heading.fontSize + 1,
                fontWeight: 700,
                color: th.t1,
                cursor: num === "" ? "default" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: COMP.touchMin,
                outline: "none"
              }}>
              {num === "del" ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4h9a2 2 0 012 2v8a2 2 0 01-2 2H7l-5-6 5-6z" stroke={th.rd} strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M10.5 8l4 4M14.5 8l-4 4" stroke={th.rd} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ) : num}
            </button>
          );
        })}
      </div>

      {/* Forgot PIN */}
      <button className="ui-press" onClick={() => setShowForgotConfirm(true)}
        style={{
          background: "transparent",
          border: "none",
          marginTop: SPACE.s6,
          padding: SPACE.s2,
          color: th.ac,
          ...TYPE.caption,
          fontWeight: 600,
          textDecoration: "underline",
          cursor: "pointer",
          fontFamily: "inherit"
        }}>
        {t("alk_forgotPin")}
      </button>

      {/* VAQTINCHALIK DIAGNOSTIKA: ilova ochilishida sessiya tiklanish
          bosqichlari qancha vaqt olganini ko'rsatadi. Muammo topilgach
          OLIB TASHLANADI. */}
      {bootLog.length > 0 && (
        <div style={{marginTop:SPACE.s4,padding:"8px 10px",borderRadius:8,background:th.surH,border:"1px solid "+th.bor,fontSize:9,fontFamily:"monospace",color:th.t3,maxWidth:320,width:"100%"}}>
          {bootLog.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <ConfirmDialog
        th={th}
        open={showForgotConfirm}
        onClose={() => setShowForgotConfirm(false)}
        onConfirm={confirmResetPin}
        title={t("alk_forgotPin")}
        message={t("alk_resetPinConfirmBody")}
        confirmText={t("alk_yes")}
        cancelText={t("alk_cancel")}
        danger={false}
      />
    </div>
  );
}
