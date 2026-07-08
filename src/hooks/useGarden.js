import { useCallback } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";

export function useGarden() {
  const { user, stars, setStars, gardenData, setGardenData, ok$, buzz, lg } = useApp();

  const waterGarden = useCallback(async () => {
    if (!user?.oilaId) return;
    const cost = 5;
    if (stars < cost) {
      ok$(lg === "uz" ? "Kamida 5⭐ kerak" : "Need 5⭐ to water", "warn");
      return;
    }
    try {
      const cur = Math.max(0, (await db.g("stars_" + user.oilaId)) || 0);
      if (cur < cost) { ok$(lg === "uz" ? "Yetarli yulduzcha yo'q" : "Not enough stars", "warn"); return; }
      const newStars = Math.max(0, cur - cost);
      const today = new Date().toISOString().slice(0, 10);
      const g = (await db.g("garden_" + user.oilaId)) || { level: 0, watered: null, totalStars: 0, wateredBy: [] };
      if (g.watered === today) {
        ok$(lg === "uz" ? "Bog' bugun allaqachon sug'orildi 🌿" : "Garden already watered today 🌿", "warn");
        return;
      }
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
      ok$(lg === "uz" ? "Bog' sug'orildi! 🌿 -5⭐" : "Garden watered! 🌿 -5⭐");
    } catch (e) {
      ok$(lg === "uz" ? "Xato yuz berdi" : "Error", "err");
    }
  }, [user, stars, ok$, buzz, lg]);

  return { waterGarden };
}
