import { useState } from "react";
import { db } from "../../firebase.js";
import { hp } from "../../utils/formatters.js";
import { SPACE, RADIUS, TYPE, ALPHA, COMP } from "../../utils/tokens.js";
import { NativeBiometric } from "capacitor-native-biometric";
import { useApp } from "../../context/AppContext.jsx";

// Ro'yxatdan o'tgach birinchi marta ko'rsatiladigan PIN o'rnatish oynasi.
// Har bosqichda "O'tkazib yuborish" mavjud — majburiy emas.
export default function PinSetupModal({ th, uid, onDone }) {
  const { t } = useApp();
  const [step, setStep] = useState("enter"); // enter -> confirm -> biometric -> done
  const [pinVal, setPinVal] = useState("");
  const [pinCfm, setPinCfm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = () => onDone();

  const handleKeyPress = async (num) => {
    if (num === "") return;
    setError("");
    const isEnter = step === "enter";
    const cur = isEnter ? pinVal : pinCfm;
    const setter = isEnter ? setPinVal : setPinCfm;
    if (num === "del") { setter(cur.slice(0, -1)); return; }
    const next = cur + String(num);
    setter(next);
    if (next.length !== 4) return;

    if (isEnter) {
      setTimeout(() => setStep("confirm"), 250);
      return;
    }

    if (next !== pinVal) {
      setError(t("psm_mismatch"));
      setPinCfm("");
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(100);
      return;
    }

    setBusy(true);
    try {
      const hashed = await hp(next);
      const cur2 = (await db.g("security_" + uid)) || {};
      await db.s("security_" + uid, { ...cur2, pinHash: hashed });
    } catch (e) {
      console.error("PIN setup save failed", e);
    }
    setBusy(false);

    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) { setStep("biometric"); return; }
    } catch (_e) {}
    finish();
  };

  const enableBiometric = async () => {
    setBusy(true);
    try {
      await NativeBiometric.verifyIdentity({
        reason: t("alk_biometricReason"),
        title: t("alk_biometricTitle"),
        subtitle: t("alk_biometricSubtitle"),
        description: t("alk_biometricDescription"),
      });
      const cur2 = (await db.g("security_" + uid)) || {};
      await db.s("security_" + uid, { ...cur2, biometricEnabled: true });
    } catch (e) {
      console.error("Biometric enable failed", e);
    }
    setBusy(false);
    finish();
  };

  const activeVal = step === "enter" ? pinVal : pinCfm;

  if (step === "biometric") {
    return (
      <div style={{ position: "fixed", inset: 0, background: th.bg, zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: SPACE.s4, boxSizing: "border-box" }}>
        <div style={{ width: 80, height: 80, borderRadius: RADIUS.full, background: th.gr + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s3 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
            <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
            <circle cx="9" cy="10" r="0.6" fill={th.gr} stroke="none" />
            <circle cx="15" cy="10" r="0.6" fill={th.gr} stroke="none" />
            <path d="M9 14.5c1 1 5 1 6 0" />
          </svg>
        </div>
        <h2 style={{ ...TYPE.heading, color: th.t1, margin: 0, textAlign: "center" }}>{t("psm_bioTitle")}</h2>
        <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, marginBottom: SPACE.s6, textAlign: "center", maxWidth: 300 }}>{t("psm_bioSubtitle")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, width: "100%", maxWidth: 300 }}>
          <button className="ui-press" disabled={busy} onClick={enableBiometric}
            style={{ background: th.ac, border: "none", borderRadius: RADIUS.s + 2, padding: SPACE.s3 + "px", color: "#fff", fontWeight: 700, fontSize: TYPE.body.fontSize, cursor: busy ? "default" : "pointer", fontFamily: "inherit", opacity: busy ? .6 : 1, minHeight: COMP.touchMin }}>
            {t("psm_bioEnable")}
          </button>
          <button className="ui-press" disabled={busy} onClick={finish}
            style={{ background: "transparent", border: "none", padding: SPACE.s2, color: th.t2, fontWeight: 600, fontSize: TYPE.caption.fontSize, cursor: busy ? "default" : "pointer", fontFamily: "inherit" }}>
            {t("psm_skip")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: th.bg, zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: SPACE.s4, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: SPACE.s6 }}>
        <div style={{ width: 80, height: 80, borderRadius: RADIUS.full, background: th.ac + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto " + SPACE.s3 + "px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ ...TYPE.heading, color: th.t1, margin: 0 }}>{t("psm_title")}</h2>
        <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, marginBottom: 0 }}>
          {step === "enter" ? t("psm_enterSubtitle") : t("psm_confirmSubtitle")}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s3, marginBottom: SPACE.s2 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: SPACE.s3, height: SPACE.s3, borderRadius: RADIUS.full, background: activeVal.length > i ? th.ac : th.bor, transition: "background 0.15s ease-in-out" }} />
        ))}
      </div>

      <div style={{ height: 24, marginBottom: SPACE.s3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {error && <span style={{ ...TYPE.tiny, color: th.rd, fontWeight: 600 }}>{error}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 78px)", gridAutoRows: "78px", gap: 22, justifyContent: "center", width: "100%", marginTop: SPACE.s8 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((num, ni) => (
          <button key={ni} className={num === "" ? "" : "ui-press"} disabled={busy} onClick={() => handleKeyPress(num)} aria-label={num === "del" ? t("alk_delete") : String(num)}
            style={{
              background: typeof num === "number" ? th.surH : "transparent",
              border: typeof num === "number" ? "1px solid " + th.bor : "none",
              borderRadius: RADIUS.full,
              fontSize: TYPE.heading.fontSize + 4,
              fontWeight: 700,
              color: th.t1,
              cursor: num === "" || busy ? "default" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              outline: "none"
            }}>
            {num === "del" ? (
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M7 4h9a2 2 0 012 2v8a2 2 0 01-2 2H7l-5-6 5-6z" stroke={th.rd} strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M10.5 8l4 4M14.5 8l-4 4" stroke={th.rd} strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ) : num}
          </button>
        ))}
      </div>

      <button className="ui-press" disabled={busy} onClick={finish}
        style={{ background: "transparent", border: "none", marginTop: SPACE.s6, padding: SPACE.s2, color: th.t2, ...TYPE.caption, fontWeight: 600, cursor: busy ? "default" : "pointer", fontFamily: "inherit" }}>
        {t("psm_skip")}
      </button>
    </div>
  );
}
