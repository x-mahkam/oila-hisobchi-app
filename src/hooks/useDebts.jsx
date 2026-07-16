import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { qmail } from "../utils/qmail.js";
import { td, nt, f, normTel, fmtN, sonSoz } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import i18n from "../i18n/index.js";

export function useDebts() {
  const {
    user, oila, azolar, qarzlar, setQarzlar,
    xar, setXar, dar, setDar,
    qarzReqs, setQarzReqs, notifs, setNotifs,
    ok$, buzz, addNotif, lg, val,
  } = useApp();

  const [showAddQarz, setShowAddQarz] = useState(false);
  const [qarzTur, setQarzTur] = useState("olgan");
  const [qarzKim, setQarzKim] = useState("");
  const [qarzSum, setQarzSum] = useState("");
  const [qarzIzoh, setQarzIzoh] = useState("");
  const [qarzSana, setQarzSana] = useState(td());
  const [qarzQaytSana, setQarzQaytSana] = useState("");
  const [qarzTel, setQarzTel] = useState("");
  const [qarzLinked, setQarzLinked] = useState(false);
  const [qarzDonePrompt, setQarzDonePrompt] = useState(null);
  const [partialQarz, setPartialQarz] = useState(null);
  const [partialSum, setPartialSum] = useState("");
  const [inviteQarz, setInviteQarz] = useState(null);
  const [tilxatView, setTilxatView] = useState(null);

  // ── TILXAT (RASPISKA) PDF — faqat ikki tomon tasdiqlagan qarzlar uchun ──
  const generateTilxat = (q) => {
    if (!q.linked || q.linkStatus !== "accepted") {
      ok$(i18n.t("debt_receipt_only_linked"), "err");
      return;
    }
    try {
      // Tomonlar: tur="olgan" — men qarzdor, kim=kreditor; tur="bergan" — men kreditor, kim=qarzdor
      const menQarzdor = q.tur === "olgan";
      const qarzdor = menQarzdor ? (user.ism || "") : q.kim;
      const kreditor = menQarzdor ? q.kim : (user.ism || "");
      const qarzdorTel = menQarzdor ? (user.tel || "") : q.linkedTel;
      const kreditorTel = menQarzdor ? q.linkedTel : (user.tel || "");
      const summaSom = Number(q.asl || (Number(q.summa) + Number(q.paidPart || 0)));
      const sanaStr = q.sana || td();
      const qaytStr = q.qaytSana || i18n.t("debt_as_agreed");

      const summaRaqam = fmtN(summaSom, val, false);
      const summaSoz = lg === "uz" ? sonSoz(summaSom) : "";
      const summaText = summaRaqam + (summaSoz ? " (" + summaSoz + " so'm)" : "");
      const hujjatRaqami = "OH-" + String(q.id).slice(-8);
      // QR → ilovaning tekshiruv havolasi (skanerlaganda tasdiq sahifasi ochiladi)
      const tilxatJson = JSON.stringify({ id: q.id, q: qarzdor, k: kreditor, s: summaSom, d: sanaStr, r: qaytStr, n: hujjatRaqami });
      const verifyUrl = window.location.origin + "/?tilxat=" + encodeURIComponent(tilxatJson);
      const verifyQR = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=L&data=" + encodeURIComponent(verifyUrl);

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tilxat ${hujjatRaqami}</title><style>
        @page{size:A4;margin:2cm}
        body{font-family:'Times New Roman',serif;color:#1a1a1a;line-height:1.8;font-size:14px}
        .head{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:16px}
        .title{font-size:22px;font-weight:bold;letter-spacing:1px;margin-bottom:6px}
        .sub{font-size:12px;color:#666}
        .body{text-align:justify;margin:24px 0}
        .body p{margin:14px 0}
        .field{font-weight:bold;text-decoration:underline}
        .sum{font-size:16px;font-weight:bold;color:#000;background:#f5f5f5;padding:2px 8px}
        .sign{margin-top:48px;display:flex;justify-content:space-between}
        .sign-box{width:45%;text-align:center}
        .sign-line{border-top:1px solid #333;margin-top:40px;padding-top:6px;font-size:12px}
        .foot{margin-top:40px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:12px}
        .doc-num{text-align:right;font-size:11px;color:#666;margin-bottom:8px}
        .clause{margin:12px 0;text-align:justify}
        .num{display:inline-block;width:22px;font-weight:bold}
        .verify-box{margin-top:24px;display:flex;align-items:center;gap:16px;padding:14px 16px;border:2px solid #4f46e5;border-radius:10px;background:#4f46e506}
        .verify-box img{width:90px;height:90px}
        .legal{margin-top:18px;font-size:11px;color:#444;line-height:1.6;background:#fafafa;border-left:3px solid #4f46e5;padding:10px 14px}
        .btn{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#4f46e5;color:#fff;border:none;padding:13px 32px;border-radius:28px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(79,70,229,.4)}
        @media print{.btn{display:none}}
      </style></head><body>
        <div class="doc-num">${i18n.t("dt_docNum")} ${hujjatRaqami}</div>
        <div class="head">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="width:54px;height:54px;display:block;margin:0 auto 8px;">
            <rect width="120" height="120" rx="28" fill="#5D5CFF" />
            <path d="M12 46 L60 12 L108 46" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <rect x="18" y="47" width="84" height="58" rx="14" stroke="#FFFFFF" stroke-width="7" fill="none" />
            <path d="M18 58 L102 58" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" />
            <path d="M60 95 C54 89 44 81 44 73 C44 68 48 64 53 64 C56.5 64 58.5 66 60 67 C61.5 66 63.5 64 67 64 C72 64 76 68 76 73 C76 81 66 89 60 95 Z" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
          <div class="title">${i18n.t("dt_title")}</div>
          <div class="sub">${i18n.t("dt_subtitle")}</div>
        </div>
        <div class="body">
          <p>${sanaStr}</p>
          <div class="clause"><span class="num">1.</span>${i18n.t("dt_iPronoun")}, <span class="field">${qarzdor}</span>${qarzdorTel ? ", tel: " + qarzdorTel : ""} (${i18n.t("dt_hereinafterDebtor")}), ${i18n.t("dt_voluntarilyReceivedFrom")} <span class="field">${kreditor}</span>${kreditorTel ? ", tel: " + kreditorTel : ""} (${i18n.t("dt_hereinafterCreditor")}) ${i18n.t("dt_tookAsLoan")}:</div>
          <p style="text-align:center"><span class="sum">${summaText}</span></p>
          <div class="clause"><span class="num">2.</span>${i18n.t("dt_undertakeRepay")} <span class="field">${qaytStr}</span> ${i18n.t("dt_repayByDateSuffix")}</div>
          <div class="clause"><span class="num">3.</span>${i18n.t("dt_clause3")}</div>
          <div class="clause"><span class="num">4.</span>${i18n.t("dt_clause4")}</div>
          ${q.paidPart > 0 ? '<div class="clause"><span class="num">5.</span>' + i18n.t("dt_partialClause", { paid: Number(q.paidPart).toLocaleString(), remain: Number(q.summa).toLocaleString() }) + "</div>" : ""}
        </div>
        <div class="sign">
          <div class="sign-box"><div class="sign-line">${i18n.t("dt_debtorLabel")}<br>${qarzdor}<br>${i18n.t("dt_signatureLabel")}</div></div>
          <div class="sign-box"><div class="sign-line">${i18n.t("dt_creditorLabel")}<br>${kreditor}<br>${i18n.t("dt_signatureLabel")}</div></div>
        </div>
        <div class="verify-box">
          <img src="${verifyQR}" alt="QR"/>
          <div>
            <div style="font-size:13px;font-weight:bold;color:#4f46e5">🔑 ${i18n.t("dt_electronicConfirm")}</div>
            <div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">${i18n.t("dt_verifyBoxText")}</div>
            <div style="font-size:10px;color:#888;margin-top:4px">${i18n.t("dt_docNumberLabel")}: ${hujjatRaqami} · ID: ${q.id}</div>
          </div>
        </div>
        <div class="legal">
          <b>${i18n.t("dt_legalNoteLabel")}</b> ${i18n.t("dt_legalParagraph")}
        </div>
        <div class="foot">
          ${i18n.t("dt_footerGenerated")} · ${new Date().toLocaleDateString("uz-UZ")}
        </div>
        <button class="btn" onclick="window.print()">${i18n.t("dt_savePrintBtn")}</button>
      </body></html>`;

      setTilxatView({ html, num: hujjatRaqami });
    } catch (e) { console.error("tilxat:", e); ok$(i18n.t("dt_tilxatGenError"), "err"); }
  };

  // Bazadan yangi qarz ro'yxati (eskirgan lokal holat bilan ustidan yozib yubormaslik uchun)
  const freshQarz = async () => (await db.g("qarz_" + user.oilaId)) || [];

  // Joriy foydalanuvchi balansi (uid'siz eski yozuvlar ham o'ziniki hisoblanadi)
  const getMyBal = () => {
    const d = dar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
    const x = xar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
    return d - x;
  };

  const resetQarzForm = () => {
    setQarzKim(""); setQarzSum(""); setQarzIzoh("");
    setQarzSana(td()); setQarzQaytSana(""); setQarzTur("olgan");
    setQarzTel(""); setQarzLinked(false); setShowAddQarz(false);
  };

  // Qarz qo'shish (telefonsiz)
  const addQarz = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(i18n.t("fill_all_fields"), "err");
    }
    // Balans tekshiruvi (qarz berish uchun)
    if (qarzTur === "bergan") {
      const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      const myBal = myDar - myXar;
      if (myBal < Number(qarzSum)) {
        return ok$(
          i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, myBal), val, true), req: fmtN(Number(qarzSum), val, true) }),
          "err"
        );
      }
    }

    const item = {
      id: Date.now(), uid: user.id, tur: qarzTur,
      kim: qarzKim.trim(), summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana,
      paid: false, paidSana: "",
    };
    const upd = [item, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);

    // Telefonsiz: avtomatik balansga bog'lash
    const sum = Number(qarzSum);
    const izohTxt = qarzTur === "olgan"
      ? i18n.t("loan_received_izoh", { name: qarzKim.trim() })
      : i18n.t("loan_given_izoh", { name: qarzKim.trim() });

    if (qarzTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, fromQarz: item.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
      ok$(i18n.t("loan_received_izoh", { name: "" }) + " +" + fmtN(sum, val, true));
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: item.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
      ok$(i18n.t("loan_given_izoh", { name: "" }) + " -" + fmtN(sum, val, true));
    }
    resetQarzForm();
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, user, qarzlar, xar, dar, ok$, val]);

  // Telefon bilan qarz so'rovi yuborish
  const sendQarzRequest = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(i18n.t("fill_all_fields"), "err");
    }
    if (!qarzLinked) { await addQarz(); return; }
    if (!qarzTel.trim()) return ok$(i18n.t("enter_phone"), "err");
    // Qarz beruvchi: yuborishdan oldin balans tekshiruvi
    if (qarzTur === "bergan" && getMyBal() < Number(qarzSum)) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(Number(qarzSum), val, true) }),
        "err"
      );
    }

    const cleanTel = qarzTel.trim().replace(/[^0-9+]/g, "");
    const targetUid = await db.g("tel_" + cleanTel);
    if (!targetUid) { setInviteQarz({ tel: cleanTel, kim: qarzKim.trim(), summa: Number(qarzSum) }); return; }
    if (targetUid === user.id) return ok$(i18n.t("cannot_send_to_yourself"), "err");

    const req = {
      id: Date.now(), fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "",
      toTel: cleanTel, tur: qarzTur, summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, status: "pending",
    };
    // XAVFSIZLIK: begona pochtani o'qimaymiz — alohida hujjat yaratamiz
    await qmail.send(cleanTel, req);

    const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("new_debt_request_title"), body: (user.ism || "") + " - " + fmtN(Number(qarzSum), val, true), sana: new Date().toISOString(), read: false };
    const rC = (await db.g("notif_" + targetUid)) || [];
    await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));

    const myItem = { id: req.id, uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, paid: false, paidSana: "", linked: true, linkedTel: cleanTel, linkStatus: "pending" };
    const upd = [myItem, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    resetQarzForm();
    ok$(i18n.t("debt_request_sent"));
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, qarzTel, qarzLinked, user, qarzlar, xar, dar, ok$, val, addQarz]);

  // So'rovni qabul qilish
  // Tasdiqlangandan keyin: qarz BERGAN balansidan (-), qarz OLGAN balansiga (+).
  // Qarz FAOL (paid:false) bo'lib qoladi — "qaytarildi" deb YOPILMAYDI.
  const acceptQarzReq = useCallback(async (req) => {
    const myTur = req.tur === "bergan" ? "olgan" : "bergan";

    // Balans tekshiruvi: men qarz BERUVCHI bo'lsam, balans yetarli bo'lishi shart
    if (myTur === "bergan" && getMyBal() < Number(req.summa)) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(Number(req.summa), val, true) }),
        "err"
      );
    }

    // MUHIM: uid qo'shildi — busiz bir oilada ikkala tomonga "meniki" bo'lib ko'rinardi
    const item = { id: req.id, uid: user.id, tur: myTur, kim: req.fromIsm, summa: req.summa, izoh: req.izoh, sana: req.sana, qaytSana: req.qaytSana, paid: false, paidSana: "", linked: true, linkedTel: req.fromTel, linkStatus: "accepted" };
    const upd = [item, ...(await freshQarz()).filter(q => !(q.id === item.id && q.uid === user.id))];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);

    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);

    // XAVFSIZLIK: sender OILASINING hujjatlariga yozmaymiz — javob xabari
    // yuboramiz; sender ilovasi keyingi yuklanishda O'Z hujjatlarini yangilaydi.
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "ls_" + req.id + "_" + Date.now(), type: "link_status", debtId: req.id, status: "accepted", byIsm: user.ism, byUid: user.id });
    }
    {
      // Sender'ga xabar
      const sN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("confirmed"), body: (user.ism || "") + " " + i18n.t("debt_confirmed_linked") + ": " + fmtN(Number(req.summa), val, true), sana: new Date().toISOString(), read: false };
      const sC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [sN, ...sC].slice(0, 100));
    }

    // O'z balansga bog'lash
    if (myTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: req.summa, izoh: i18n.t("loan_received_izoh", { name: req.fromIsm }), sana: req.sana, vaqt: nt(), uid: user.id, fromQarz: req.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    }
    if (myTur === "bergan") {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: req.summa, izoh: i18n.t("loan_given_izoh", { name: req.fromIsm }), sana: req.sana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: req.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    ok$(i18n.t("debt_confirmed_linked"));
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, val]);

  // So'rovni rad etish
  const rejectQarzReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    // XAVFSIZLIK: rad javobi ham xabar orqali — sender o'zi qo'llaydi
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "ls_" + req.id + "_" + Date.now(), type: "link_status", debtId: req.id, status: "rejected", byIsm: user.ism, byUid: user.id });
    }
    ok$(i18n.t("rejected_alert"), "warn");
  }, [qarzReqs, user, ok$]);

  // Qarzni to'langan deb belgilash
  const markQarzPaid = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Men qarzdorman va qaytarmoqchiman → balans yetarli bo'lishi shart (minusga tushmaslik)
    if (q && q.tur === "olgan" && getMyBal() < Number(q.summa)) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(Number(q.summa), val, true) }),
        "err"
      );
    }
    if (q?.linked && q?.linkStatus === "accepted" && q?.linkedTel) {
      const targetUid = await db.g("tel_" + q.linkedTel);
      if (targetUid) {
        const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, payStatus: "pending", payBy: user.id } : x);
        await db.s("qarz_" + user.oilaId, upd);
        setQarzlar(upd);
        const payReq = { id: "pay_" + id + "_" + Date.now(), debtId: id, fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "", toTel: q.linkedTel, summa: q.summa, paySum: Number(q.summa), partial: false, kim: q.kim, tur: q.tur, sana: td(), type: "payment" };
        await qmail.send(q.linkedTel, payReq);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("return_pending"), body: (user.ism || "") + " " + i18n.t("says_returned_msg", { name: "" }) + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        ok$(i18n.t("return_request_sent"));
        return;
      }
    }
    // Bog'lanmagan qarz: darhol yopiladi va balansga AVTOMATIK yoziladi (so'rovsiz)
    const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, paid: true, paidSana: td() } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q) {
      if (q.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: Number(q.summa), izoh: i18n.t("loan_received_izoh", { name: q.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
        ok$(i18n.t("returned_added_bal", { sum: fmtN(Number(q.summa), val, true) }));
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: Number(q.summa), izoh: i18n.t("loan_given_izoh", { name: q.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
        ok$(i18n.t("repaid_deducted_bal", { sum: fmtN(Number(q.summa), val, true) }));
      }
    }
  }, [qarzlar, user, xar, dar, ok$, val]);

  // Qisman qaytarish
  const applyPartial = useCallback(async () => {
    if (!partialQarz || !partialSum || Number(partialSum) <= 0) return ok$(i18n.t("enter_amount"), "err");
    const pay = Number(partialSum);
    const q = partialQarz;
    if (pay >= q.summa) { setPartialQarz(null); setPartialSum(""); markQarzPaid(q.id); return; }
    // Qarzdor qisman qaytaryapti → balans yetarli bo'lishi shart
    if (q.tur === "olgan" && getMyBal() < pay) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(pay, val, true) }),
        "err"
      );
    }
    // Bog'langan qarz: qisman qaytarish ham ikkinchi tomon TASDIG'INI talab qiladi
    if (q.linked && q.linkStatus === "accepted" && q.linkedTel) {
      const targetUid = await db.g("tel_" + q.linkedTel);
      if (targetUid) {
        const list = await freshQarz();
        const upd = list.map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, payStatus: "pending", payBy: user.id } : x);
        await db.s("qarz_" + user.oilaId, upd);
        setQarzlar(upd);
        const payReq = { id: "pay_" + q.id + "_" + Date.now(), debtId: q.id, fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "", toTel: q.linkedTel, summa: q.summa, paySum: pay, partial: true, kim: q.kim, tur: q.tur, sana: td(), type: "payment" };
        await qmail.send(q.linkedTel, payReq);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("partial_return_request_title"), body: (user.ism || "") + " " + i18n.t("says_partially_returned") + ": " + fmtN(pay, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        setPartialQarz(null); setPartialSum("");
        ok$(i18n.t("partial_return_request_sent"));
        return;
      }
    }
    // Bog'lanmagan qarz: darhol qo'llanadi + balansga AVTOMATIK yoziladi
    const paidSoFar = (q.paidPart || 0) + pay;
    const newTimeline = [...(q.timeline || []), { sana: td(), summa: pay, ism: user.ism || i18n.t("me") }];
    const upd = (await freshQarz()).map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, summa: x.summa - pay, paidPart: paidSoFar, asl: x.asl || q.summa + (q.paidPart || 0), timeline: newTimeline } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q.tur === "bergan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: pay, izoh: i18n.t("partial_return", { name: q.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: pay, izoh: i18n.t("partial_repayment", { name: q.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    setPartialQarz(null); setPartialSum("");
    ok$(i18n.t("partial_payment_done", { pay: fmtN(pay, val, true), rem: fmtN(q.summa - pay, val, true) }));
  }, [partialQarz, partialSum, qarzlar, user, xar, dar, ok$, val, markQarzPaid]);

  // Qarzni o'chirish
  const delQarz = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Bog'langan va tasdiqlangan qarz TO'LIQ YOPILMAGUNCHA o'chirib bo'lmaydi
    if (q && q.linked && q.linkStatus === "accepted" && !q.paid) {
      return ok$(i18n.t("cannot_delete_linked_debt"), "err");
    }
    const upd = list.filter(x => !(x.id === id && (!x.uid || x.uid === user.id)));
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
  }, [qarzlar, user, ok$]);

  // Eslatma yuborish
  const sendQarzReminder = useCallback(async (q) => {
    if (!q.linked || !q.linkedTel) {
      const msg = i18n.t("says_returned_msg", { name: "" }) + ": " + fmtN(q.summa, val, true);
      try { navigator.clipboard.writeText(msg); ok$(i18n.t("copied")); } catch { ok$(msg); }
      return;
    }
    const targetUid = await db.g("tel_" + q.linkedTel);
    if (targetUid) {
      const rN = { id: Date.now() + Math.random(), type: "qarz", title: "🔔 " + i18n.t("reminder_sent"), body: (user.ism || "") + " " + i18n.t("says_returned_msg", { name: "" }) + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
      const rC = (await db.g("notif_" + targetUid)) || [];
      await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
      ok$(i18n.t("reminder_sent"));
    }
  }, [user, ok$, val]);

  // Daromad/xarajatga qo'shish
  const addQarzAsDaromad = useCallback(async (q) => {
    const item = { id: Date.now(), tur: "boshqa", summa: q.summa, izoh: i18n.t("returned") + ": " + q.kim, sana: td(), vaqt: nt() };
    const key = "d_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setDar(d => [{ ...item, uid: user.id }, ...d]);
    setQarzDonePrompt(null);
    ok$(i18n.t("added_to_income", { sum: fmtN(q.summa, val, true) }));
  }, [user, ok$, val]);

  const addQarzAsXarajat = useCallback(async (q) => {
    if (getMyBal() < Number(q.summa)) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(Number(q.summa), val, true) }),
        "err"
      );
    }
    const item = { id: Date.now(), kategoriya: "boshqa", summa: q.summa, izoh: i18n.t("returned") + ": " + q.kim, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar(x => [{ ...item, uid: user.id }, ...x]);
    setQarzDonePrompt(null);
    ok$(i18n.t("added_to_expenses", { sum: fmtN(q.summa, val, true) }));
  }, [user, xar, dar, ok$, val]);

  // Qaytarishni tasdiqlash
  const acceptPayReq = useCallback(async (req) => {
    const paySum = Number(req.paySum || req.summa || 0);
    const list = await freshQarz();
    const doneQ = list.find(q => q.id === req.debtId && (!q.uid || q.uid === user.id));
    // To'liq yopiladimi yoki qisman qoladimi?
    const closeIt = doneQ ? (Number(doneQ.summa) - paySum) <= 0 : !req.partial;
    // Men qarzdorman va "qaytarib oldim" da'vosini tasdiqlayapman → mendan pul chiqadi
    if (doneQ && doneQ.tur === "olgan" && getMyBal() < paySum) {
      return ok$(
        i18n.t("insufficient_balance", { bal: fmtN(Math.max(0, getMyBal()), val, true), req: fmtN(paySum, val, true) }),
        "err"
      );
    }
    const upd = list.map(q => {
      if (q.id === req.debtId && (!q.uid || q.uid === user.id)) {
        const newTimeline = [...(q.timeline || []), { sana: td(), summa: paySum, ism: req.fromIsm || i18n.t("partner") }];
        return closeIt
          ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed", timeline: newTimeline }
          : { ...q, summa: Number(q.summa) - paySum, paidPart: (q.paidPart || 0) + paySum, asl: q.asl || Number(q.summa) + (q.paidPart || 0), payStatus: null, payBy: null, timeline: newTimeline };
      }
      return q;
    });
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    // MENING balansimga avtomatik yozuv (hech qanday qo'shimcha so'rovsiz)
    if (doneQ && paySum > 0) {
      if (doneQ.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: paySum, izoh: i18n.t("loan_received_izoh", { name: doneQ.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: doneQ.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: paySum, izoh: i18n.t("loan_given_izoh", { name: doneQ.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: doneQ.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
      }
    }
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    // XAVFSIZLIK: qarshi tomon hujjatlariga yozmaymiz — natija xabari yuboriladi,
    // uning ilovasi O'Z qarz_/x_/d_ hujjatlarini keyingi yuklanishda yangilaydi.
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "pr_" + req.id + "_" + Date.now(), type: "pay_result", debtId: req.debtId, status: "confirmed", paySum, closeIt, byIsm: user.ism });
    }
    try {
      const pN = { id: Date.now() + Math.random(), type: "qarz", title: closeIt ? i18n.t("confirmed") : i18n.t("partial_repayment_label"), body: (user.ism || "") + ": " + fmtN(paySum, val, true), sana: new Date().toISOString(), read: false };
      const pC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [pN, ...pC].slice(0, 100));
    } catch {}
    ok$(closeIt ? i18n.t("return_confirmed_bal") : i18n.t("partial_return_confirmed_bal"));
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, val]);

  const rejectPayReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "pr_" + req.id + "_" + Date.now(), type: "pay_result", debtId: req.debtId, status: "rejected", paySum: 0, closeIt: false, byIsm: user.ism });
    }
    ok$(i18n.t("return_rejected_alert"), "warn");
  }, [qarzReqs, user, ok$]);

  // To'liq yangilash: so'rovlar, qarzlar, bildirishnomalar VA balans (xarajat/daromad)
  // silent === true bo'lsa toast ko'rsatilmaydi (avtomatik sinxronizatsiya uchun)
  const refreshQarzReqs = useCallback(async (silent) => {
    if (!user?.id) return;
    try {
      if (user.tel) {
        const pending = await qmail.load(user, { setQarzlar, setXar, setDar }, i18n.language);
        setQarzReqs(pending);
      }
      setQarzlar((await db.g("qarz_" + user.oilaId)) || []);
      setNotifs((await db.g("notif_" + user.id)) || []);
      // Balans sinxronizatsiyasi: barcha a'zolarning xarajat/daromadlari
      if ((azolar || []).length) {
        const allX = [], allD = [];
        await Promise.all(azolar.map(async (m) => {
          try {
            const xA = await db.g("x_" + user.oilaId + "_" + m.id);
            const dA = await db.g("d_" + user.oilaId + "_" + m.id);
            if (xA?.length) allX.push(...xA.map(x => ({ ...x, uid: m.id })));
            if (dA?.length) allD.push(...dA.map(d => ({ ...d, uid: m.id })));
          } catch {}
        }));
        setXar(allX);
        setDar(allD);
      }
      if (silent !== true) ok$(i18n.t("refreshed"));
    } catch (e) { console.error("refreshQarzReqs:", e); }
  }, [user, azolar, ok$]);

  return {
    // State
    showAddQarz, setShowAddQarz,
    qarzTur, setQarzTur, qarzKim, setQarzKim,
    qarzSum, setQarzSum, qarzIzoh, setQarzIzoh,
    qarzSana, setQarzSana, qarzQaytSana, setQarzQaytSana,
    qarzTel, setQarzTel, qarzLinked, setQarzLinked,
    qarzDonePrompt, setQarzDonePrompt,
    partialQarz, setPartialQarz, partialSum, setPartialSum,
    inviteQarz, setInviteQarz,
    tilxatView, setTilxatView,
    // Actions
    addQarz, sendQarzRequest, acceptQarzReq, rejectQarzReq,
    markQarzPaid, applyPartial, delQarz, sendQarzReminder,
    addQarzAsDaromad, addQarzAsXarajat,
    acceptPayReq, rejectPayReq, refreshQarzReqs, generateTilxat,
  };
}
