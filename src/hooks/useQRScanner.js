import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { td } from "../utils/formatters.js";

export function useQRScanner({ setShowAddModal, setAddModalTab, setAddStep, setAddKat }) {
  const { isPremium, setShowPremModal, lg, ok$, f } = useApp();

  const [showScanner, setShowScanner] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [scanPrefill, setScanPrefill] = useState(null);
  const scanVideoRef = useRef(null);
  const scanStreamRef = useRef(null);
  const scanRafRef = useRef(null);

  const stopScanner = () => {
    if (scanRafRef.current) {
      cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }
    if (scanStreamRef.current) {
      scanStreamRef.current.getTracks().forEach((tr) => tr.stop());
      scanStreamRef.current = null;
    }
    setShowScanner(false);
    setScanMsg("");
  };

  const openWithPrefill = (summa, sana, izoh) => {
    setScanPrefill({ summa, sana: sana || td(), izoh: izoh || "" });
    setAddModalTab("xarajat");
    setAddStep("form");
    setAddKat("boshqa");
    setShowAddModal(true);
  };

  const startScanner = async () => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    setShowScanner(true);
    setScanMsg(lg === "uz" ? "Kamera ochilmoqda..." : "Opening camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      scanStreamRef.current = stream;
      if (scanVideoRef.current) {
        scanVideoRef.current.srcObject = stream;
        await scanVideoRef.current.play();
      }
      setScanMsg(lg === "uz" ? "QR kodni ramkaga joylang" : "Point QR into frame");

      if ("BarcodeDetector" in window) {
        // eslint-disable-next-line no-undef
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        const scan = async () => {
          if (!scanVideoRef.current || !scanStreamRef.current) return;
          try {
            const codes = await detector.detect(scanVideoRef.current);
            if (codes && codes.length > 0) {
              const raw = codes[0].rawValue;
              stopScanner();
              const isUrl = /^https?:\/\//i.test(raw);
              let sana = "";
              const tmm = raw.match(/[?&]t=(\d{8})/i);
              if (tmm) {
                const d = tmm[1];
                sana = d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8);
              }
              const rm = raw.match(/[?&]r=(\d+)/i);
              const izoh = rm ? (lg === "uz" ? "Chek #" : "Receipt #") + rm[1] : "";

              const im = raw.match(/[?&]i=([0-9]+)/i);
              if (im) {
                const v = Math.round(parseInt(im[1], 10) / 100);
                if (v > 0) {
                  openWithPrefill(v, sana, izoh);
                  ok$("\u2713 " + f(v, true) + (lg === "uz" ? " — tekshiring va saqlang" : " — verify & save"));
                  return;
                }
              }

              if (isUrl) {
                ok$(lg === "uz" ? "Chek yuklanmoqda..." : "Loading receipt...");
                try {
                  const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(raw);
                  const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
                  const data = await resp.json();
                  const html = data.contents || "";
                  let summa = 0;
                  const jamiRgx = /[Jj]ami[^<]{0,60}?([\d][\d\s.,]*[\d])/;
                  const jm = html.replace(/<[^>]+>/g, " ").match(jamiRgx);
                  if (jm) {
                    const numStr = jm[1]
                      .replace(/\s/g, "")
                      .replace(/,(\d{2})$/, "")
                      .replace(/\.(\d{2})$/, "")
                      .replace(/[,.\s]/g, "");
                    const v = parseInt(numStr, 10);
                    if (v >= 100 && v <= 999999999) {
                      summa = v;
                    }
                  }
                  if (summa > 0) {
                    openWithPrefill(summa, sana, izoh);
                    ok$("\u2713 " + f(summa, true) + (lg === "uz" ? " — tekshiring va saqlang" : " — verify & save"));
                  } else {
                    openWithPrefill("", sana, izoh);
                    ok$(lg === "uz" ? "Summa topilmadi, qo'lda kiriting" : "Amount not found", "warn");
                  }
                } catch (err) {
                  openWithPrefill("", sana, izoh);
                  ok$(lg === "uz" ? "Chek yuklanmadi, qo'lda kiriting" : "Load failed", "warn");
                }
              } else {
                const jm = raw.match(/[Jj]ami[^\n]{0,60}?([\d][\d\s.,]*[\d])/);
                if (jm) {
                  const numStr = jm[1]
                    .replace(/\s/g, "")
                    .replace(/,(\d{2})$/, "")
                    .replace(/\.(\d{2})$/, "")
                    .replace(/[,.\s]/g, "");
                  const v = parseInt(numStr, 10);
                  if (v >= 100 && v <= 999999999) {
                    openWithPrefill(v, sana, izoh);
                    ok$("\u2713 " + f(v, true));
                    return;
                  }
                }
                openWithPrefill("", sana, izoh);
                ok$(lg === "uz" ? "Summa topilmadi, qo'lda kiriting" : "Amount not found", "warn");
              }
              return;
            }
          } catch (e) {}
          scanRafRef.current = requestAnimationFrame(scan);
        };
        scanRafRef.current = requestAnimationFrame(scan);
      } else {
        setScanMsg(lg === "uz" ? "Brauzer QR skanerini qo'llamaydi." : "QR scanner not supported.");
      }
    } catch (e) {
      const isDenied =
        e.name === "NotAllowedError" ||
        (e.message || "").indexOf("denied") >= 0 ||
        (e.message || "").indexOf("Permission") >= 0;
      if (isDenied) {
        setScanMsg(lg === "uz" ? "Kamera ruxsati berilmadi. Sozlamalardan ruxsat bering." : "Camera denied.");
      } else {
        setScanMsg((lg === "uz" ? "Kamera ochilmadi. Qo'lda kiriting." : "Camera unavailable.") + " (" + (e.name || "") + ")");
      }
    }
  };

  return {
    showScanner,
    setShowScanner,
    scanMsg,
    setScanMsg,
    scanPrefill,
    setScanPrefill,
    scanVideoRef,
    scanStreamRef,
    scanRafRef,
    startScanner,
    stopScanner,
    openWithPrefill,
  };
}
