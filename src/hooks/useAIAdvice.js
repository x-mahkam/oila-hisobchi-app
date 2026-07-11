import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { tm, fmtN } from "../utils/formatters.js";
import { KATS, KN } from "../utils/constants.js";

export function useAIAdvice() {
  const {
    xar, dar, oila, maq, qarzlar, user, isPremium,
    setShowPremModal, setScr, lg, val
  } = useApp();

  const [adv, setAdv] = useState("");
  const [advL, setAdvL] = useState(false);
  const [advErr, setAdvErr] = useState("");

  const f = useCallback((n, sh) => fmtN(n, val, sh), [val]);

  // Lokal tahlil dvigateli — internetga bog'liq emas, HAR DOIM tahlil natijasini taqdim etadi.
  const buildLocalAdvice = useCallback(() => {
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const budget = oila && oila.budjet ? oila.budjet : 2000000;
    const bal2 = totD - totX;
    const dayN = new Date().getDate();
    const tips = [];
    const L = (uz, en) => lg === "uz" ? uz : en;

    if (totD > 0 || totX > 0) {
      if (bal2 >= 0) tips.push(L("◆ Ijobiy balans: ", "◆ Positive balance: ") + L("Bu oy balansingiz ijobiy: +" + f(bal2, true) + ". Barakali boring!", "Positive balance: +" + f(bal2, true)));
      else tips.push(L("◆ Diqqat: ", "◆ Attention: ") + L("Bu oy xarajat daromaddan " + f(-bal2, true) + " ko'p.", "Expenses exceed income by " + f(-bal2, true)));
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) tips.push(L("◆ Budjet ogohlantirishi: ", "◆ Budget warning: ") + L("Budjet " + bpct + "% ishlatildi!", "Budget used " + bpct + "%!"));
    else if (bpct >= 80) tips.push(L("◆ Budjet nazorati: ", "◆ Budget check: ") + L("Budjetning " + bpct + "% sarflandi.", "Used " + bpct + "%."));
    else if (bpct > 0 && dayN <= 15 && bpct < 40) tips.push(L("◆ Zo'r natija: ", "◆ Great progress: ") + L("Ajoyib! Oy yarmida faqat " + bpct + "% sarfladingiz.", "Great! Only " + bpct + "%."));
    
    const katTotals = KATS.map((k, i) => ({ nom: KN[lg][i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) { const top = katTotals[0]; const topPct = Math.round(top.sum / totX * 100); tips.push(L("◆ Eng yuqori xarajat: ", "◆ Top spending: ") + L("Eng ko'p xarajat: " + top.nom + " (" + topPct + "%).", top.nom + " is " + topPct + "%")); }
    
    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) tips.push(L("◆ Jamg'arma muvaffaqiyati: ", "◆ Savings success: ") + L("Daromadning " + savePct + "% jamg'ardingiz. A'lo natija!", "Saved " + savePct + "%!"));
      else if (savePct > 0) tips.push(L("◆ Jamg'arma tahlili: ", "◆ Savings analysis: ") + L("Daromadning faqat " + savePct + "% qoldi.", "Only " + savePct + "% saved."));
      else if (bal2 < 0) tips.push(L("◆ Jamg'arma tahlili: ", "◆ Savings analysis: ") + L("Bu oy jamg'arma bo'lmadi.", "No savings."));
    }
    
    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) { if (ng.pct >= 80 && ng.pct < 100) tips.push(L("◆ Maqsad progressi: ", "◆ Goal progress: ") + L("'" + ng.ism + "' maqsadi " + ng.pct + "% bajarildi!", "Goal '" + ng.ism + "' at " + ng.pct + "%!")); else if (ng.pct < 30) tips.push(L("◆ Maqsad maslahati: ", "◆ Goal tip: ") + L("'" + ng.ism + "' uchun har oy summa ajrating.", "Save for '" + ng.ism + "'.")); }
    } else tips.push(L("◆ Maqsad qo'ying: ", "◆ Set a goal: ") + L("Maqsad qo'ying — jamg'arish uchun motivatsiya veradi.", "Set a goal."));
    
    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) tips.push(L("◆ Majburiyatlar: ", "◆ Liabilities: ") + L("Sizda " + f(meOwe, true) + " qarz bor.", "You owe " + f(meOwe, true)));
    
    const genTips = [
      L("50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga, 30% xohish-istaklarga, 20% jamg'armaga.", "Use 50/30/20 rule: 50% needs, 30% wants, 20% savings."),
      L("Kichik tejamkorlik — katta baraka. Har kuni ozgina tejasangiz, yiliga katta summa bo'ladi.", "Small savings add up over a year."),
      L("Xarid ro'yxati — eng yaxshi qalqon. Ro'yxat tuzib, faqat shu mahsulotlarni oling.", "A shopping list is your best shield."),
      L("Oylik daromad kelishi bilan birinchi navbatda majburiy to'lovlarni chetga oling.", "Pay mandatory bills first when income arrives."),
      L("Moliyaviy xavfsizlik yostig'i: kamida 3 oylik xarajatga teng zaxira fondi yarating.", "Build a 3-month emergency fund."),
    ];
    tips.push(L("◆ Maslahat: ", "◆ Practical tip: ") + genTips[new Date().getDate() % genTips.length]);
    
    const MOTIV = [
      L("Boylik bir kunda yig'ilmaydi — lekin har kungi to'g'ri qaror sizni unga yaqinlashtiradi. Siz to'g'ri yo'ldasiz!", "Wealth is built one good decision at a time."),
      L("Pulni boshqarayotgan odam — kelajagini boshqarayotgan odam. Davom eting!", "Manage your money, manage your future."),
      L("Bugungi kichik tejamkorlik — ertangi katta imkoniyat. Har bir so'm ishlasin!", "Small savings today, big opportunities tomorrow."),
      L("Eng yaxshi sarmoya — o'z moliyaviy intizomingizga qilingan sarmoya. Barakalla!", "Discipline is the best investment."),
      L("Maqsadi bor odam yo'ldan adashmaydi. Maqsadlaringizga sodiq qoling!", "A person with a goal never gets lost."),
      L("Daromad qancha bo'lishidan qat'i nazar, uni hisoblab yurgan oila hech qachon kam bo'lmaydi.", "A family that counts never lacks."),
      L("Sabr va izchillik — moliyaviy erkinlikning ikki qanoti. Siz uchyapsiz!", "Patience and consistency are the wings of financial freedom."),
      L("Har hisobot — bir qadam oldinga. O'zingizni tahlil qilayotganingiz allaqachon g'alaba!", "Every report is a step forward."),
    ];
    tips.push(L("◆ Motivatsiya: ", "◆ Motivation: ") + MOTIV[new Date().getDate() % MOTIV.length]);
    
    const salom = totX === 0 && totD === 0 ? ""
      : bal2 >= 0
        ? L("◆ Barakalla, " + (user?.ism || "do'stim") + "! Siz moliyangizni nazoratda tutyapsiz — bu ko'pchilikning qo'lidan kelmaydi. Keling, tahlilni ko'ramiz:", "◆ Great job, " + (user?.ism || "") + "!")
        : L("◆ Diqqatli bo'ling, " + (user?.ism || "Do'stim") + ", tashvishlanmang — har bir katta yutuq kichik qadamdan boshlanadi. Bu oy tahlili sizga yo'l ko'rsatadi:", "◆ Don't worry, every big win starts small.");
    
    if (totX === 0 && totD === 0) return L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting!", "No data yet. Add expenses and income.");
    return salom + "\n\n" + L("◆ " + tm() + " tahlili\n\n", "Analysis " + tm() + "\n\n") + tips.join("\n\n");
  }, [xar, dar, oila, maq, qarzlar, user, lg, f]);

  // Masofaviy AI API (ixtiyoriy): VITE_AI_API_URL sozlansa shu endpointga so'rov yuboriladi.
  const fetchRemoteAdvice = useCallback(async () => {
    const AI_URL = import.meta.env.VITE_AI_API_URL;
    if (!AI_URL) return null;
    if (typeof navigator !== "undefined" && navigator.onLine === false) throw new Error("offline");
    
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const kats = KATS.map((k, i) => ({ nom: KN[lg][i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0);
    
    const prompt = (lg === "uz"
      ? "Siz oilaviy moliya bo'yicha maslahatchisiz. Quyidagi oy ma'lumotlari asosida qisqa, amaliy moliyaviy maslahat bering (o'zbek tilida): "
      : "You are a family finance advisor. Give short practical advice based on this month: ")
      + JSON.stringify({ oy: tm(), daromad: totD, xarajat: totX, budjet: oila?.budjet || 0, kategoriyalar: kats });
    
    const resp = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, lang: lg }),
      signal: AbortSignal.timeout(12000),
    });
    if (!resp.ok) throw new Error("API " + resp.status);
    const data = await resp.json();
    const text = data.advice || data.text || data.result || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
    if (!text || typeof text !== "string") throw new Error("empty response");
    return text;
  }, [xar, dar, oila, lg]);

  const aiAdv = useCallback(async () => {
    if (!isPremium) { setShowPremModal(true); return; }
    setAdvL(true); setAdv(""); setAdvErr(""); setScr("maslahat");
    try {
      let text = null;
      try { text = await fetchRemoteAdvice(); }
      catch (e) { text = null; }
      if (!text) text = buildLocalAdvice();
      setAdv(text);
    } catch (e) {
      setAdvErr(lg === "uz"
        ? "Maslahat tayyorlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring."
        : "Failed to generate advice. Check your connection and retry.");
    } finally {
      setTimeout(() => setAdvL(false), 400);
    }
  }, [isPremium, setShowPremModal, setScr, fetchRemoteAdvice, buildLocalAdvice, lg]);

  return {
    adv,
    advL,
    advErr,
    aiAdv,
    setAdv,
  };
}
