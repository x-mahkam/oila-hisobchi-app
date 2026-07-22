import { useCallback, useEffect, useRef, useState } from "react";
import { call } from "./firebase.js";

// ═══════════════════════════════════════════════════════════
//  So'rov hook'i + KESH (stale-while-revalidate).
//  Muammo: har tab ochilganda Cloud Function qayta chaqirilar,
//  "uxlab qolgan" funksiya (cold start) 3-8 soniya olar edi.
//  Yechim: natija xotira keshida saqlanadi — tab qayta ochilganda
//  keshdagi darhol ko'rsatiladi, fonda jimgina yangilanadi.
//  prefetch() esa kirishdanoq funksiyalarni "isitadi".
// ═══════════════════════════════════════════════════════════

const cache = new Map(); // "fn::params" -> natija
const keyOf = (fnName, params) => fnName + "::" + JSON.stringify(params || {});

// Login paytida tayyor natijani keshga qo'yish (masalan probe javobi)
export function seedCache(fnName, params, data) {
  cache.set(keyOf(fnName, params), data);
}

// Fonda chaqirib keshga yozish — funksiyani isitadi + tabni tezlashtiradi
export function prefetch(fnName, params) {
  return call(fnName, params || {})
    .then((d) => { cache.set(keyOf(fnName, params), d); return d; })
    .catch(() => null); // isitish xatosi UXga ta'sir qilmasin
}

export function useQuery(fnName, params, { enabled = true } = {}) {
  const initialKey = keyOf(fnName, params);
  const [data, setData] = useState(() => (cache.has(initialKey) ? cache.get(initialKey) : null));
  const [loading, setLoading] = useState(enabled && !cache.has(initialKey));
  const [error, setError] = useState("");
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const reload = useCallback(async (override) => {
    const p = override !== undefined ? override : paramsRef.current;
    const k = keyOf(fnName, p);
    // Keshda bor bo'lsa — spinner ko'rsatmaymiz, jim yangilaymiz (SWR)
    if (!cache.has(k)) setLoading(true);
    else setData(cache.get(k));
    setError("");
    try {
      const res = await call(fnName, p);
      cache.set(k, res);
      setData(res);
      return res;
    } catch (e) {
      setError(e.message || "Xato yuz berdi");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fnName]);

  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  return { data, setData, loading, error, reload };
}
