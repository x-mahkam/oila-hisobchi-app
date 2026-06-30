import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";

export function usePremium() {
  const { user, oila, setOila, isPremium, setIsPremium, ok$, lg } = useApp();
  const [showPremModal, setShowPremModal] = useState(false);

  const activatePremium = useCallback(async () => {
    localStorage.setItem("oilaV7Prem", "1");
    setIsPremium(true);
    setShowPremModal(false);
    // Oila obyektiga ham premium belgisi
    if (user?.oilaId && user?.rol === "bosh") {
      try {
        const o = await db.g("oila_" + user.oilaId);
        if (o) { o.premium = true; await db.s("oila_" + user.oilaId, o); setOila(o); }
      } catch (e) {}
    }
    ok$(lg === "uz" ? "Premium faollashtirildi!" : "Premium activated!");
  }, [user, setIsPremium, setOila, ok$, lg]);

  return { showPremModal, setShowPremModal, activatePremium };
}
