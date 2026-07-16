import { useCallback } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";
import i18n from "../i18n/index.js";

export function useGarden() {
  const { user, stars, setStars, gardenData, setGardenData, ok$, buzz } = useApp();

  const waterGarden = useCallback(async () => {
    if (!user?.oilaId) return;
    const cost = 5;
    if (stars < cost) {
      ok$(i18n.t("garden_need_stars", { defaultValue: "Kamida 5⭐ kerak" }), "warn");
      return;
    }
    try {
      const cur = Math.max(0, (await db.g("stars_" + user.oilaId)) || 0);
      if (cur < cost) {
        ok$(i18n.t("garden_not_enough_stars", { defaultValue: "Yetarli yulduzcha yo'q" }), "warn");
        return;
      }
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
      ok$(i18n.t("garden_watered_success", { defaultValue: "Bog' sug'orildi! 🌿 -5⭐" }));
    } catch (e) {
      ok$(i18n.t("error_generic", { defaultValue: "Xato yuz berdi" }), "err");
    }
  }, [user, stars, ok$, buzz]);

  return { waterGarden };
}
