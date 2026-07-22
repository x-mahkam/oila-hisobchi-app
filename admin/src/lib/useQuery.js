import { useCallback, useEffect, useRef, useState } from "react";
import { call } from "./firebase.js";

// Oddiy so'rov hook'i: callable funksiyani chaqiradi, holatini boshqaradi.
// reload() — qayta yuklash; setData — optimistik yangilash uchun.
export function useQuery(fnName, params, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const reload = useCallback(async (override) => {
    setLoading(true);
    setError("");
    try {
      const res = await call(fnName, override !== undefined ? override : paramsRef.current);
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
