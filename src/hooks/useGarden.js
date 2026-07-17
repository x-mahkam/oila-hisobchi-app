import { useCallback } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";

export function useGarden() {
  const { user, stars, setStars, gardenData, setGardenData, ok$, buzz, t } = useApp();

  const waterGarden = useCallback(async () => {
    if (!user?.oilaId) return;
    const cost = 5;
    if (stars < cost) {
      ok$(t("ugd_needStars"), "warn");
      return;
    }
    try {
      const cur = Math.max(0, (await db.g("stars_" + user.oilaId)) || 0);
      if (cur < cost) { ok$(t("ugd_notEnoughStars"), "warn"); return; }
      const newStars = Math.max(0, cur - cost);
      const today = new Date().toISOString().slice(0, 10);
      const g = (await db.g("garden_" + user.oilaId)) || { level: 0, watered: null, totalStars: 0, wateredBy: [] };
      const wCount = (g.wateredBy || []).filter(w => w.sana && w.sana >= new Date(Date.now() - 30 * 86400000).toISOString()).length + 1;
      const newLevel = Math.min(Math.floor(wCount / 3), 6);
      const newG = {
        ...g, level: newLevel, watered: today, totalStars: (g.totalStars || 0) + cost,
        wateredBy: [{ uid: user.id, ism: user.ism, sana: new Date().toISOString() }, ...(g.wateredBy || []).slice(0, 29)],
      };
      await db.s("garden_" + user.oilaId, newG);
      await db.s("stars_" + user.oilaId, newStars);
      setStars(newStars);
      setGardenData(newG);
      buzz(20);
      ok$(t("ugd_watered"));
    } catch (e) {
      ok$(t("ugd_errorOccurred"), "err");
    }
  }, [user, stars, ok$, buzz, t]);

  return { waterGarden };
}
