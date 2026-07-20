import { useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";

export function useExchangeRates() {
  const appState = useApp();
  const { rates, setRates, ok$, t } = appState;
  const [rateL, setRateL] = appState.rateL !== undefined
    ? [appState.rateL, appState.setRateL]
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
        const nameMap = { USD: t("xr_usd"), EUR: t("xr_eur"), RUB: t("xr_rub"), GBP: t("xr_gbp"), CNY: t("xr_cny"), KZT: t("xr_kzt") };
        const filt = want.filter(c => ratesObj[c]).map(c => ({
          code: c, rate: ratesObj[c] > 0 ? (1 / ratesObj[c]).toFixed(2) : "0",
          name: nameMap[c] || c, diff: "0",
        }));
        if (filt.length > 0) {
          setRates(filt);
          ok2 = true;
          try { localStorage.setItem("oilaV7Rates", JSON.stringify(filt)); localStorage.setItem("oilaV7RatesT", new Date().toISOString()); } catch {}
          ok$(t("xr_ratesUpdated"));
          break;
        }
      } catch (e) {}
    }
    if (!ok2) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem("oilaV7Rates")); } catch {}
      if (saved?.length > 0) {
        setRates(saved);
        ok$(t("xr_savedOffline"), "warn");
      } else {
        setRates([{ code: "USD", rate: "12850", name: t("xr_usd") }, { code: "EUR", rate: "13920", name: t("xr_eur") }, { code: "RUB", rate: "143", name: t("xr_rub") }]);
        ok$(t("xr_demoRates"), "warn");
      }
    }
    setRateL(false);
  }, [ok$, t, setRates]);

  return { fetchRates };
}
