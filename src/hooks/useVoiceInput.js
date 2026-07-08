import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { db } from "../firebase.js";
import { td, nt } from "../utils/formatters.js";
import { KATS, KN } from "../utils/constants.js";

export function useVoiceInput() {
  const {
    user,
    xar,
    setXar,
    isPremium,
    setShowPremModal,
    lg,
    ok$,
    f,
  } = useApp();

  const [showVoice, setShowVoice] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceParsed, setVoiceParsed] = useState(null);
  const voiceRecRef = useRef(null);

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

  const startVoice = () => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setShowVoice(true);
      setVoiceText("");
      setVoiceParsed(null);
      ok$(lg === "uz" ? "Brauzer ovozni qo'llamaydi. Qo'lda yozing." : "Voice not supported.", "warn");
      return;
    }
    setShowVoice(true);
    setVoiceText("");
    setVoiceParsed(null);
    setVoiceOn(true);
    try {
      const rec = new SR();
      rec.lang = lg === "uz" ? "uz-UZ" : "en-US";
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
          ok$(lg === "uz" ? "Mikrofon ruxsati berilmadi." : "Mic denied.", "warn");
        }
      };
      rec.onend = () => {
        setVoiceOn(false);
      };
      voiceRecRef.current = rec;
      rec.start();
    } catch (e) {
      setVoiceOn(false);
      ok$(lg === "uz" ? "Xatolik. Qo'lda yozing." : "Error.", "warn");
    }
  };

  const stopVoice = () => {
    if (voiceRecRef.current) {
      try {
        voiceRecRef.current.stop();
      } catch (e) {}
    }
    setVoiceOn(false);
  };

  const applyVoice = async () => {
    const parsed = voiceParsed || parseVoice(voiceText);
    if (!parsed) {
      return ok$(lg === "uz" ? "Summa topilmadi. Masalan: 'transportga 20 ming'" : "No amount found.", "err");
    }
    const item = {
      id: Date.now(),
      kategoriya: parsed.kat,
      summa: parsed.summa,
      izoh: parsed.text.slice(0, 50),
      sana: td(),
      vaqt: nt(),
      repeat: false,
    };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar([{ ...item, uid: user.id }, ...xar]);
    setShowVoice(false);
    setVoiceText("");
    setVoiceParsed(null);
    ok$(lg === "uz" ? "Qo'shildi: " + f(parsed.summa, true) + " — " + KN[lg][KATS.findIndex(k => k.id === parsed.kat)] : "Added: " + f(parsed.summa, true));
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
