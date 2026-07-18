import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { td } from "../utils/formatters.js";
import { Capacitor, registerPlugin } from "@capacitor/core";

// Android WebView'da brauzerning Web Speech API'si (window.SpeechRecognition)
// ishlamaydi — RECORD_AUDIO ruxsati berilgan bo'lsa ham "not-allowed" xatosi
// bilan to'xtaydi. Shu sabab native platformada maxsus native plagin
// (android/.../SpeechToTextPlugin.java, qurilmaning tizim darajasidagi
// android.speech.SpeechRecognizer'ini ishlatadi) orqali ishlaydi; faqat
// oddiy brauzerda (native bo'lmagan platformada) eski Web Speech API
// zaxira sifatida qoladi.
const SpeechToText = registerPlugin("SpeechToText");

const SR_LANG = { uz: "uz-UZ", ru: "ru-RU", kk: "kk-KZ", ky: "ky-KG", tg: "tg-TJ", qr: "uz-UZ", en: "en-US" };

export function useVoiceInput({ addX }) {
  const {
    isPremium,
    setShowPremModal,
    lg,
    ok$,
    t,
  } = useApp();

  const [showVoice, setShowVoice] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceParsed, setVoiceParsed] = useState(null);
  const voiceRecRef = useRef(null);
  const voiceListenersRef = useRef([]);

  const removeVoiceListeners = () => {
    voiceListenersRef.current.forEach((h) => {
      try {
        h.remove();
      } catch (e) {}
    });
    voiceListenersRef.current = [];
  };

  const parseVoice = (text) => {
    if (!text) return null;
    const low = text.toLowerCase();
    let summa = 0;
    const mingMatch = low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(ming|tisyacha|\u0442\u044b\u0441\u044f\u0447|k)/);
    const milMatch = low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(million|mln|\u043c\u043b\u043d|millon)/);
    const plainMatch = low.match(/([0-9]{3,})/);
    if (milMatch) {
      summa = Math.round(parseFloat(milMatch[1].replace(",", ".")) * 1000000);
    } else if (mingMatch) {
      summa = Math.round(parseFloat(mingMatch[1].replace(",", ".")) * 1000);
    } else if (plainMatch) {
      summa = parseInt(plainMatch[1]);
    }

    const katKeys = {
      oziq: ["ovqat", "ovkat", "yeg", "tushlik", "nonushta", "kechki", "restoran", "kafe", "kofe", "choy", "non", "sut", "gosht", "go'sht", "meva", "sabzavot", "bozor", "produkt", "food", "oziq", "ovqatlanish"],
      transport: ["transport", "taksi", "taxi", "yo'l", "benzin", "yoqilg'i", "avtobus", "metro", "mashina", "fuel", "gas"],
      kommunal: ["kommunal", "svet", "gaz", "suv", "elektr", "internet", "telefon to'lov", "utility"],
      sog: ["dori", "dorixona", "shifokor", "kasalxona", "apteka", "sog'liq", "tibbiyot", "health", "medicine", "klinika"],
      kiyim: ["kiyim", "ko'ylak", "poyabzal", "kross", "clothes", "kiyinish"],
      konil: ["kino", "o'yin", "sayohat", "dam", "konsert", "entertainment", "kongilochar", "ko'ngil"],
      talim: ["kitob", "o'qish", "kurs", "ta'lim", "maktab", "universitet", "study", "education", "dars"],
      boshqa: ["boshqa", "other"],
    };

    let kat = "boshqa";
    for (const [k, words] of Object.entries(katKeys)) {
      if (words.some(w => low.includes(w))) {
        kat = k;
        break;
      }
    }

    if (summa <= 0) return null;
    return { summa, kat, text };
  };

  const startVoiceNative = async (lang) => {
    try {
      removeVoiceListeners();
      const resultHandle = await SpeechToText.addListener("result", (data) => {
        setVoiceText(data.transcript || "");
        const parsed = parseVoice(data.transcript);
        if (parsed) setVoiceParsed(parsed);
      });
      const errorHandle = await SpeechToText.addListener("error", (data) => {
        if (data.error === "not-allowed") {
          ok$(t("uvi_micDenied"), "warn");
        } else if (data.error !== "no-speech") {
          ok$(t("uvi_error"), "warn");
        }
      });
      const endHandle = await SpeechToText.addListener("end", () => {
        setVoiceOn(false);
        removeVoiceListeners();
      });
      voiceListenersRef.current = [resultHandle, errorHandle, endHandle];
      setVoiceOn(true);
      await SpeechToText.start({ lang });
    } catch (e) {
      setVoiceOn(false);
      removeVoiceListeners();
      if ((e.message || "").indexOf("not-allowed") >= 0) {
        ok$(t("uvi_micDenied"), "warn");
      } else {
        ok$(t("uvi_error"), "warn");
      }
    }
  };

  const startVoiceWeb = (lang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      ok$(t("uvi_notSupported"), "warn");
      return;
    }
    setVoiceOn(true);
    try {
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) {
          txt += e.results[i][0].transcript;
        }
        setVoiceText(txt);
        const parsed = parseVoice(txt);
        if (parsed) setVoiceParsed(parsed);
      };
      rec.onerror = (e) => {
        setVoiceOn(false);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          ok$(t("uvi_micDenied"), "warn");
        }
      };
      rec.onend = () => {
        setVoiceOn(false);
      };
      voiceRecRef.current = rec;
      rec.start();
    } catch (e) {
      setVoiceOn(false);
      ok$(t("uvi_error"), "warn");
    }
  };

  const startVoice = () => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    setShowVoice(true);
    setVoiceText("");
    setVoiceParsed(null);
    const lang = SR_LANG[lg] || "en-US";
    if (Capacitor.isNativePlatform()) {
      startVoiceNative(lang);
    } else {
      startVoiceWeb(lang);
    }
  };

  const stopVoice = () => {
    if (Capacitor.isNativePlatform()) {
      SpeechToText.stop().catch(() => {});
    } else if (voiceRecRef.current) {
      try {
        voiceRecRef.current.stop();
      } catch (e) {}
    }
    setVoiceOn(false);
  };

  // MUHIM: bu yerda to'g'ridan-to'g'ri Firestore'ga yozish O'RNIGA xuddi
  // qo'lda kiritishda ishlatiladigan addX (useTransactions.js) chaqiriladi
  // — aks holda ovoz bilan kiritilgan xarajatlar balans/byudjet
  // tekshiruvisiz saqlanardi VA ENG MUHIMI addStar() chaqirilmagani uchun
  // foydalanuvchiga tanga berilmasdi.
  const applyVoice = async () => {
    const parsed = voiceParsed || parseVoice(voiceText);
    if (!parsed) {
      return ok$(t("uvi_noAmountFound"), "err");
    }
    await addX({ kategoriya: parsed.kat, summa: parsed.summa, izoh: parsed.text.slice(0, 50), sana: td(), repeat: false });
    setShowVoice(false);
    setVoiceText("");
    setVoiceParsed(null);
  };

  return {
    showVoice,
    setShowVoice,
    voiceOn,
    setVoiceOn,
    voiceText,
    setVoiceText,
    voiceParsed,
    setVoiceParsed,
    startVoice,
    stopVoice,
    applyVoice,
  };
}
