import { useCallback } from "react";
import { db, auth } from "../firebase.js";
import { qmail } from "../utils/qmail.js";
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

      // Oila hujjatini olish (azolarIds maydoni bilan)
      const ms = await db.g("fam_" + oilaId) || await db.g("oila_" + oilaId);

      // Oila a'zolari ro'yxati — azolarIds yoki azolar maydonidan
      const memberIds = ms?.azolarIds || ms?.azolar || [u.id];

      // Barcha a'zolar ma'lumotlarini yuklash
      const members = await Promise.all(memberIds.map(id => db.g("user_" + id)));
      const validMembers = members.filter(Boolean);
      setAzolar(validMembers);
      setOila(ms || { id: oilaId, oilaId, azolarIds: [u.id] });

      // Barcha a'zolarning xarajat va daromadlarini yuklash
      const allXar = [];
      const allDar = [];
      await Promise.all(validMembers.map(async (member) => {
        try {
          const xArr = await db.g("x_" + oilaId + "_" + member.id);
          const dArr = await db.g("d_" + oilaId + "_" + member.id);
          if (xArr?.length) allXar.push(...xArr.map(x => ({ ...x, uid: member.id })));
          if (dArr?.length) allDar.push(...dArr.map(d => ({ ...d, uid: member.id })));
        } catch {}
      }));
      setXar(allXar);
      setDar(allDar);

      // Umumiy oila ma'lumotlari
      const [maqR, qarzR, xreqR, notifR, vazR, kidbR] = await Promise.all([
        db.g("maq_" + oilaId),
        db.g("qarz_" + oilaId),
        db.g("xreq_" + u.id),
        db.g("notif_" + u.id),
        db.g("vazifa_" + oilaId),
        db.g("kidbal_" + oilaId),
      ]);

      setMaq(maqR || []);
      setQarzlar(qarzR || []);
      // XAVFSIZLIK: qarz pochtasi endi hujjat-boshiga (qi_). Javob xabarlari
      // (tasdiq/rad/to'lov natijasi) shu yerda O'Z hujjatlarimizga qo'llanadi.
      try {
        const pending = await qmail.load(u, { setQarzlar, setXar, setDar }, "uz");
        setQarzReqs(pending);
      } catch { setQarzReqs([]); }
      setXReqs(xreqR || []);
      setNotifs(notifR || []);
      setVazifalar(vazR || []);
      setKidBalances(kidbR || {});

      // Garden
      try {
        const g = await db.g("garden_" + oilaId);
        const s = await db.g("stars_" + oilaId);
        if (g) setGardenData(g);
        if (s != null) setStars(s);
      } catch {}

    } catch (e) {
      console.error("loadFam:", e);
    }
  }, []);

  return { loadFam };
}
