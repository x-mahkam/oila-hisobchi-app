import { useCallback } from "react";
import { db, auth } from "../firebase.js";
import { td, nt, hp } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

export function useAuth() {
  const { setUser, setOila, setAzolar, setXar, setDar, setMaq,
          setQarzlar, setVazifalar, setKidBalances, setNotifs,
          setQarzReqs, setXReqs, setStars, setGardenData,
          setScr, setBoot, ok$, lg } = useApp();

  const loadFam = useCallback(async (u) => {
    try {
      const oilaId = u.oilaId;
      const [ms, xArr, dArr, maqR, qarzR, qreqR, xreqR, notifR, vazR, kidbR] = await Promise.all([
        db.g("fam_" + oilaId),
        db.g("x_" + oilaId + "_" + u.id),
        db.g("d_" + oilaId + "_" + u.id),
        db.g("maq_" + oilaId),
        db.g("qarz_" + oilaId),
        db.g("qreq_" + (u.tel||"")),
        db.g("xreq_" + u.id),
        db.g("notif_" + u.id),
        db.g("vazifa_" + oilaId),
        db.g("kidbal_" + oilaId),
      ]);

      setOila(ms);
      setXar((xArr||[]).map(x=>({...x, uid:u.id})));
      setDar((dArr||[]).map(d=>({...d, uid:u.id})));
      setMaq(maqR||[]);
      setQarzlar(qarzR||[]);
      setQarzReqs(qreqR||[]);
      setXReqs(xreqR||[]);
      setNotifs(notifR||[]);
      setVazifalar(vazR||[]);
      setKidBalances(kidbR||{});

      // Garden
      try {
        const g = await db.g("garden_" + oilaId);
        const s = await db.g("stars_" + oilaId);
        if (g) setGardenData(g);
        if (s != null) setStars(s);
      } catch {}

      // Oila a'zolari
      if (ms?.azolar?.length) {
        const members = await Promise.all(ms.azolar.map(id => db.g("user_" + id)));
        setAzolar(members.filter(Boolean));
      }
    } catch(e) {
      console.error("loadFam:", e);
    }
  }, []);

  return { loadFam };
}
