import { useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";

export function useExchangeRates() {
  const { rates, setRates, ok$, lg } = useApp();
  const [rateL, setRateL] = useApp().rateL !== undefined
    ? [useApp().rateL, useApp().setRateL]
    : [false, () => {}];

  const fetchRates = useCallback(async () => {
    setRateL(true);
    let ok2 = false;
    const sources = [
      { url: "https://open.er-api.com/v6/latest/UZS" },
      { url: "https://api.exchangerate-api.com/v4/latest/UZS" },
    ];
    for (const src of sources) {
      try {
        const res = await fetch(src.url, { signal: AbortSignal.timeout(6000) });
        const raw = await res.json();
        const ratesObj = raw.rates || {};
        const want = ["USD", "EUR", "RUB", "GBP", "CNY", "KZT"];
        const nameMap = { USD: "AQSH dollari", EUR: "Yevropa evro", RUB: "Rossiya rubli", GBP: "Britaniya funti", CNY: "Xitoy yuani", KZT: "Qozog'iston tengesi" };
        const filt = want.filter(c => ratesObj[c]).map(c => ({
          code: c, rate: ratesObj[c] > 0 ? (1 / ratesObj[c]).toFixed(2) : "0",
          name: nameMap[c] || c, diff: "0",
        }));
        if (filt.length > 0) {
          setRates(filt);
          ok2 = true;
          try { localStorage.setItem("oilaV7Rates", JSON.stringify(filt)); localStorage.setItem("oilaV7RatesT", new Date().toISOString()); } catch {}
          ok$(lg === "uz" ? "Kurslar yangilandi!" : "Rates updated!");
          break;
        }
      } catch (e) {}
    }
    if (!ok2) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem("oilaV7Rates")); } catch {}
      if (saved?.length > 0) {
        setRates(saved);
        ok$(lg === "uz" ? "Saqlangan kurslar (internet yo'q)" : "Saved rates (offline)", "warn");
      } else {
        setRates([{ code: "USD", rate: "12850", name: "AQSH dollari" }, { code: "EUR", rate: "13920", name: "Evro" }, { code: "RUB", rate: "143", name: "Rossiya rubli" }]);
        ok$(lg === "uz" ? "Demo kurslar" : "Demo rates", "warn");
      }
    }
    setRateL(false);
  }, [ok$, lg, setRates]);

  return { fetchRates };
}
