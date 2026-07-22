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

  // Kesh-birinchi tez o'tish: PIN/biometrik bilan qulfdan chiqilgach
  // dashboard darhol (tarmoqni kutmasdan) ko'rinishi uchun, avval mahalliy
  // keshda (oldingi kirishdan saqlangan) nima bo'lsa — shuni darhol
  // qo'llaymiz. Pastdagi asosiy loadFam esa tarmoqdan HAQIQIY (yangi)
  // ma'lumotni fonda yuklab, keyin qayta yangilaydi — foydalanuvchi buni
  // kutib turmaydi (o'lchov bilan tasdiqlangan muammo: bir oilaning barcha
  // hujjatlarini tarmoqdan ketma-ket o'qish 5-15+ soniya olishi mumkin edi).
  const applyFamFromCache = useCallback((u) => {
    try {
      const oilaId = u.oilaId;
      const ms = db.gCache("fam_" + oilaId) || db.gCache("oila_" + oilaId);
      const memberIds = ms?.azolarIds || ms?.azolar || [u.id];
      const members = memberIds.map(id => db.gCache("user_" + id)).filter(Boolean);
      if (members.length) setAzolar(members);
      if (ms) setOila(ms);

      const cacheMembers = members.length ? members : [u];
      const allXar = [];
      const allDar = [];
      cacheMembers.forEach(member => {
        const xArr = db.gCache("x_" + oilaId + "_" + member.id);
        const dArr = db.gCache("d_" + oilaId + "_" + member.id);
        if (xArr?.length) allXar.push(...xArr.map(x => ({ ...x, uid: member.id })));
        if (dArr?.length) allDar.push(...dArr.map(d => ({ ...d, uid: member.id })));
      });
      if (allXar.length) setXar(allXar);
      if (allDar.length) setDar(allDar);

      const maqR = db.gCache("maq_" + oilaId);
      const qarzR = db.gCache("qarz_" + oilaId);
      const xreqR = db.gCache("xreq_" + u.id);
      const notifR = db.gCache("notif_" + u.id);
      const vazR = db.gCache("vazifa_" + oilaId);
      const kidbR = db.gCache("kidbal_" + oilaId);
      if (maqR) setMaq(maqR);
      if (qarzR) setQarzlar(qarzR);
      if (xreqR) setXReqs(xreqR);
      if (notifR) setNotifs(notifR);
      if (vazR) setVazifalar(vazR);
      if (kidbR) setKidBalances(kidbR);

      const g = db.gCache("baraka_garden_" + oilaId) || db.gCache("garden_" + oilaId);
      const s = db.gCache("stars_" + oilaId);
      if (g) setGardenData(g);
      if (s != null && s >= 0) setStars(s);
    } catch (_e) {}
  }, [setAzolar, setOila, setXar, setDar, setMaq, setQarzlar, setXReqs, setNotifs, setVazifalar, setKidBalances, setGardenData, setStars]);

  const loadFam = useCallback(async (u) => {
    applyFamFromCache(u);
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
      // O'Z-O'ZINI DAVOLASH: eski notif_ hujjatlarda _o (oila) yorlig'i yo'q —
      // oiladoshlar unga xabar yoza olmaydi (permissions xatosi). Bir marta
      // qayta saqlaymiz — db.s joriy kontekstdan _o/_u muhrini bosadi.
      try { await db.s("notif_" + u.id, notifR || []); } catch {}
      setVazifalar(vazR || []);
      setKidBalances(kidbR || {});

      // Garden
      try {
        let g = await db.g("baraka_garden_" + oilaId);
        if (!g) g = await db.g("garden_" + oilaId);
        let s = await db.g("stars_" + oilaId);
        if (g) {
          // DARAJA SINXRONI: baraka hujjatida "level" maydoni yo'q —
          // Profil/KidHome ko'rsatadigan daraja = eng rivojlangan
          // uchastka bosqichi. (Eski garden_ hujjatida level tayyor.)
          if (g.level == null) {
            const allPlots = g.gardensPlots
              ? Object.values(g.gardensPlots).flat()
              : (g.plots || []);
            g = { ...g, level: allPlots.reduce((m, p) => Math.max(m, p?.stage || 0), 0) };
          }
          setGardenData(g);
        }
        if (s != null) {
          if (s < 0) {
            s = 0;
            await db.s("stars_" + oilaId, 0);
          }
          setStars(s);
        }
      } catch {}

    } catch (e) {
      console.error("loadFam:", e);
    }
  }, [applyFamFromCache]);

  return { loadFam };
}
