import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { qmail } from "../utils/qmail.js";
import { td, nt, f, normTel, fmtN, sonSoz } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

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
      ok$(lg === "uz" ? "Tilxat faqat ikki tomon tasdiqlagan qarzlar uchun" : "Receipt only for mutually confirmed debts", "err");
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
      const qaytStr = q.qaytSana || (lg === "uz" ? "kelishuv bo'yicha" : "as agreed");

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
        <div class="doc-num">\${lg === "uz" ? "Hujjat \u2116" : lg === "ru" ? "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u2116" : "Document \u2116"} \${hujjatRaqami}</div>
        <div class="head">
          <div class="title">\${lg === "uz" ? "TILXAT" : lg === "ru" ? "\u0420\u0410\u0421\u041f\u0418\u0421\u041a\u0410" : "RECEIPT"}</div>
          <div class="sub">\${lg === "uz" ? "pul qarzi olinganligi to'g'risida" : lg === "ru" ? "\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0438 \u0434\u0435\u043d\u0435\u0436\u043d\u043e\u0433\u043e \u0437\u0430\u0439\u043c\u0430" : "of a monetary loan"}</div>
        </div>
        <div class="body">
          <p>\${sanaStr}</p>
          <div class="clause"><span class="num">1.</span>\${lg === "uz" ? "Men" : lg === "ru" ? "\u042f" : "I"}, <span class="field">\${qarzdor}</span>\${qarzdorTel ? ", tel: " + qarzdorTel : ""} (\${lg === "uz" ? "bundan keyin \u2014 Qarzdor" : lg === "ru" ? "\u0434\u0430\u043b\u0435\u0435 \u2014 \u0414\u043e\u043b\u0436\u043d\u0438\u043a" : "hereinafter \u2014 Debtor"}), \${lg === "uz" ? "o'z ixtiyorim bilan, quyidagi shaxsdan" : lg === "ru" ? "\u0434\u043e\u0431\u0440\u043e\u0432\u043e\u043b\u044c\u043d\u043e \u043f\u043e\u043b\u0443\u0447\u0438\u043b(\u0430) \u043e\u0442" : "voluntarily received from"} <span class="field">\${kreditor}</span>\${kreditorTel ? ", tel: " + kreditorTel : ""} (\${lg === "uz" ? "bundan keyin \u2014 Kreditor" : lg === "ru" ? "\u0434\u0430\u043b\u0435\u0435 \u2014 \u041a\u0440\u0435\u0434\u0438\u0442\u043e\u0440" : "hereinafter \u2014 Creditor"}) \${lg === "uz" ? "naqd pul mablag'ini qarz sifatida oldim" : lg === "ru" ? "\u0434\u0435\u043d\u0435\u0436\u043d\u044b\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432 \u0434\u043e\u043b\u0433" : "a monetary loan"}:</div>
          <p style="text-align:center"><span class="sum">\${summaText}</span></p>
          <div class="clause"><span class="num">2.</span>\${lg === "uz" ? "Yuqoridagi summani" : lg === "ru" ? "\u0423\u043a\u0430\u0437\u0430\u043d\u043d\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u043e\u0431\u044f\u0437\u0443\u044e\u0441\u044c \u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0434\u043e" : "I undertake to repay the above amount by"} <span class="field">\${qaytStr}</span> \${lg === "uz" ? "sanasigacha to'liq qaytarishni zimmamga olaman." : ""}</div>
          <div class="clause"><span class="num">3.</span>\${lg === "uz" ? "Mazkur tilxat ikki tomonning erkin xohish-irodasi asosida tuzildi. Tomonlar hujjat mazmuni va oqibatlarini to'liq anglaydilar." : lg === "ru" ? "\u0420\u0430\u0441\u043f\u0438\u0441\u043a\u0430 \u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0430 \u043f\u043e \u0434\u043e\u0431\u0440\u043e\u0439 \u0432\u043e\u043b\u0435 \u043e\u0431\u0435\u0438\u0445 \u0441\u0442\u043e\u0440\u043e\u043d." : "Made by free will of both parties."}</div>
          <div class="clause"><span class="num">4.</span>\${lg === "uz" ? "Nizo kelib chiqqan taqdirda, tomonlar uni muzokara yo'li bilan, kelisha olmagan holda esa O'zbekiston Respublikasi qonunchiligiga muvofiq sud tartibida hal etadilar." : lg === "ru" ? "\u0421\u043f\u043e\u0440\u044b \u0440\u0435\u0448\u0430\u044e\u0442\u0441\u044f \u043f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u0430\u043c\u0438 \u0438\u043b\u0438 \u0432 \u0441\u0443\u0434\u0435." : "Disputes resolved by negotiation or court."}</div>
          \${q.paidPart > 0 ? '<div class="clause"><span class="num">5.</span>' + (lg === "uz" ? "Qisman qaytarilgan: <b>" + Number(q.paidPart).toLocaleString("uz-UZ") + " so'm</b>. Qoldiq: <b>" + Number(q.summa).toLocaleString("uz-UZ") + " so'm</b>." : "Partially repaid: " + Number(q.paidPart).toLocaleString() + ". Remaining: " + Number(q.summa).toLocaleString() + ".") + "</div>" : ""}
        </div>
        <div class="sign">
          <div class="sign-box"><div class="sign-line">\${lg === "uz" ? "Qarzdor" : lg === "ru" ? "\u0414\u043e\u043b\u0436\u043d\u0438\u043a" : "Debtor"}<br>\${qarzdor}<br>\${lg === "uz" ? "(imzo)" : lg === "ru" ? "(\u043f\u043e\u0434\u043f\u0438\u0441\u044c)" : "(signature)"}</div></div>
          <div class="sign-box"><div class="sign-line">\${lg === "uz" ? "Kreditor" : lg === "ru" ? "\u041a\u0440\u0435\u0434\u0438\u0442\u043e\u0440" : "Creditor"}<br>\${kreditor}<br>\${lg === "uz" ? "(imzo)" : lg === "ru" ? "(\u043f\u043e\u0434\u043f\u0438\u0441\u044c)" : "(signature)"}</div></div>
        </div>
        <div class="verify-box">
          <img src="\${verifyQR}" alt="QR"/>
          <div>
            <div style="font-size:13px;font-weight:bold;color:#4f46e5">🔑 \${lg === "uz" ? "Elektron tasdiq" : lg === "ru" ? "\u042d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u043e\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435" : "Electronic confirmation"}</div>
            <div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">\${lg === "uz" ? "Ushbu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. QR kod hujjat haqiqiyligini bildiradi." : lg === "ru" ? "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u043e\u0431\u0435\u0438\u043c\u0438 \u0441\u0442\u043e\u0440\u043e\u043d\u0430\u043c\u0438. QR \u0443\u0434\u043e\u0441\u0442\u043e\u0432\u0435\u0440\u044f\u0435\u0442 \u043f\u043e\u0434\u043b\u0438\u043d\u043d\u043e\u0441\u0442\u044c." : "Confirmed by both parties. QR verifies authenticity."}</div>
            <div style="font-size:10px;color:#888;margin-top:4px">\${lg === "uz" ? "Hujjat raqami" : "Doc"}: \${hujjatRaqami} · ID: \${q.id}</div>
          </div>
        </div>
        <div class="legal">
          <b>\${lg === "uz" ? "Huquqiy eslatma:" : lg === "ru" ? "\u041f\u0440\u0430\u0432\u043e\u0432\u0430\u044f \u0441\u043f\u0440\u0430\u0432\u043a\u0430:" : "Legal note:"}</b> \${lg === "uz" ? "Mazkur tilxat O'zbekiston Republic Fuqarolik kodeksining qarz shartnomasiga oid normalariga muvofiq tuzilgan va tomonlar o'rtasidagi kelishuvni qayd etuvchi yozma dalil hisoblanadi. To'liq yuridik kuchga ega bo'lishi uchun notarial tasdiqlash yoki E-IMZO tavsiya etiladi. Aniq holatlar bo'yicha malakali yuristga murojaat qiling." : lg === "ru" ? "\u0420\u0430\u0441\u043f\u0438\u0441\u043a\u0430 \u0441\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0430 \u0441\u043e\u0433\u043b\u0430\u0441\u043d\u043e \u043d\u043e\u0440\u043c\u0430\u043c \u0413\u041a \u043e \u0437\u0430\u0439\u043c\u0435. \u0414\u043b\u044f \u043f\u043e\u043b\u043d\u043e\u0439 \u0441\u0438\u043b\u044b \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u043d\u043e\u0442\u0430\u0440\u0438\u0443\u0441 \u0438\u043b\u0438 \u042d\u0426\u041f." : "Drawn up per civil-law loan provisions. For full force, notarization or e-signature is recommended."}
        </div>
        <div class="foot">
          \${lg === "uz" ? "Oila Hisobchi ilovasi tomonidan yaratilgan" : lg === "ru" ? "\u0421\u043e\u0437\u0434\u0430\u043d\u043e \u0432 Oila Hisobchi" : "Generated by Oila Hisobchi"} · \${new Date().toLocaleDateString("uz-UZ")}
        </div>
        <button class="btn" onclick="window.print()">\${lg === "uz" ? "PDF saqlash / Chop etish" : "Save PDF / Print"}</button>
      </body></html>`;

      let opened = false;
      try {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.style.zIndex = "-1000";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        iframe.contentWindow.focus();
        setTimeout(() => {
          try {
            iframe.contentWindow.print();
            opened = true;
            ok$(lg === "uz" ? "Chop etish darchasi ochildi!" : "Print dialog opened!");
          } catch (pe) {
            console.error("Debts iframe print failed:", pe);
          }
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (errClean) {}
          }, 1500);
          if (!opened) {
            setTilxatView({ html, num: hujjatRaqami });
          }
        }, 300);
      } catch (errIframe) {
        console.error("Debts iframe creation failed:", errIframe);
        setTilxatView({ html, num: hujjatRaqami });
      }
    } catch (e) { console.error("tilxat:", e); ok$(lg === "uz" ? "Tilxat yaratishda xato" : "Error", "err"); }
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
      return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    }
    // Balans tekshiruvi (qarz berish uchun)
    if (qarzTur === "bergan") {
      const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      const myBal = myDar - myXar;
      if (myBal < Number(qarzSum)) {
        return ok$(
          lg === "uz"
            ? "❌ Balansda yetarli mablag' yo'q! Balans: " + fmtN(Math.max(0, myBal), val, true) + ", Kerak: " + fmtN(Number(qarzSum), val, true)
            : "❌ Insufficient balance!",
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
      ? (lg === "uz" ? "Qarz olindi: " : "Loan received: ") + qarzKim.trim()
      : (lg === "uz" ? "Qarz berildi: " : "Loan given: ") + qarzKim.trim();

    if (qarzTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, fromQarz: item.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
      ok$(lg === "uz" ? "Qarz olindi va balansga qo'shildi! +" + fmtN(sum, val, true) : "Loan added to balance!");
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: item.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
      ok$(lg === "uz" ? "Qarz berildi va balansdan ayirildi! -" + fmtN(sum, val, true) : "Loan deducted!");
    }
    resetQarzForm();
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, user, qarzlar, xar, dar, ok$, lg, val]);

  // Telefon bilan qarz so'rovi yuborish
  const sendQarzRequest = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    }
    if (!qarzLinked) { await addQarz(); return; }
    if (!qarzTel.trim()) return ok$(lg === "uz" ? "Telefon raqamini kiriting" : "Enter phone", "err");
    // Qarz beruvchi: yuborishdan oldin balans tekshiruvi
    if (qarzTur === "bergan" && getMyBal() < Number(qarzSum)) {
      return ok$(
        lg === "uz"
          ? "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ You cannot lend — insufficient balance!",
        "err"
      );
    }

    const cleanTel = qarzTel.trim().replace(/[^0-9+]/g, "");
    const targetUid = await db.g("tel_" + cleanTel);
    if (!targetUid) { setInviteQarz({ tel: cleanTel, kim: qarzKim.trim(), summa: Number(qarzSum) }); return; }
    if (targetUid === user.id) return ok$(lg === "uz" ? "O'zingizga yubora olmaysiz" : "Cannot send to yourself", "err");

    const req = {
      id: Date.now(), fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "",
      toTel: cleanTel, tur: qarzTur, summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, status: "pending",
    };
    // XAVFSIZLIK: begona pochtani o'qimaymiz — alohida hujjat yaratamiz
    await qmail.send(cleanTel, req);

    const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Yangi qarz so'rovi" : "New debt request", body: (user.ism || "") + " - " + fmtN(Number(qarzSum), val, true), sana: new Date().toISOString(), read: false };
    const rC = (await db.g("notif_" + targetUid)) || [];
    await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));

    const myItem = { id: req.id, uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, paid: false, paidSana: "", linked: true, linkedTel: cleanTel, linkStatus: "pending" };
    const upd = [myItem, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    resetQarzForm();
    ok$(lg === "uz" ? "Qarz so'rovi yuborildi!" : "Debt request sent!");
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, qarzTel, qarzLinked, user, qarzlar, xar, dar, ok$, lg, val, addQarz]);

  // So'rovni qabul qilish
  // Tasdiqlangandan keyin: qarz BERGAN balansidan (-), qarz OLGAN balansiga (+).
  // Qarz FAOL (paid:false) bo'lib qoladi — "qaytarildi" deb YOPILMAYDI.
  const acceptQarzReq = useCallback(async (req) => {
    const myTur = req.tur === "bergan" ? "olgan" : "bergan";

    // Balans tekshiruvi: men qarz BERUVCHI bo'lsam, balans yetarli bo'lishi shart
    if (myTur === "bergan" && getMyBal() < Number(req.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true) + ", Kerak: " + fmtN(Number(req.summa), val, true)
          : "❌ You cannot lend — insufficient balance!",
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
      const sN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "✅ Qarz tasdiqlandi" : "Debt confirmed", body: (user.ism || "") + " " + (lg === "uz" ? "qarzni tasdiqladi" : "confirmed the debt") + ": " + fmtN(Number(req.summa), val, true), sana: new Date().toISOString(), read: false };
      const sC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [sN, ...sC].slice(0, 100));
    }

    // O'z balansga bog'lash
    if (myTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz olindi (tasdiqlangan): " : "Loan received: ") + req.fromIsm, sana: req.sana, vaqt: nt(), uid: user.id, fromQarz: req.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    }
    if (myTur === "bergan") {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz berildi: " : "Loan given: ") + req.fromIsm, sana: req.sana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: req.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    ok$(lg === "uz" ? "Qarz tasdiqlandi va balansga bog'landi! ✅" : "Debt confirmed! ✅");
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, lg, val]);

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
    ok$(lg === "uz" ? "Rad etildi" : "Rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  // Qarzni to'langan deb belgilash
  const markQarzPaid = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Men qarzdorman va qaytarmoqchiman → balans yetarli bo'lishi shart (minusga tushmaslik)
    if (q && q.tur === "olgan" && getMyBal() < Number(q.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
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
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Qarz qaytarish so'rovi" : "Debt return request", body: (user.ism || "") + " " + (lg === "uz" ? "qarzni qaytardim deyapti" : "says debt is returned") + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        ok$(lg === "uz" ? "Qaytarish so'rovi yuborildi!" : "Return request sent!");
        return;
      }
    }
    // Bog'lanmagan qarz: darhol yopiladi va balansga AVTOMATIK yoziladi (so'rovsiz)
    const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, paid: true, paidSana: td() } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q) {
      if (q.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: Number(q.summa), izoh: (lg === "uz" ? "Qarz qaytdi: " : "Debt returned: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
        ok$(lg === "uz" ? "Qaytarib olindi! Balansga qo'shildi: +" + fmtN(Number(q.summa), val, true) : "Returned! Added to balance");
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: Number(q.summa), izoh: (lg === "uz" ? "Qarz qaytarildi: " : "Debt repaid: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
        ok$(lg === "uz" ? "Qaytarildi! Balansdan yechildi: -" + fmtN(Number(q.summa), val, true) : "Repaid! Deducted from balance");
      }
    }
  }, [qarzlar, user, xar, dar, ok$, lg, val]);

  // Qisman qaytarish
  const applyPartial = useCallback(async () => {
    if (!partialQarz || !partialSum || Number(partialSum) <= 0) return ok$(lg === "uz" ? "Summa kiriting" : "Enter amount", "err");
    const pay = Number(partialSum);
    const q = partialQarz;
    if (pay >= q.summa) { setPartialQarz(null); setPartialSum(""); markQarzPaid(q.id); return; }
    // Qarzdor qisman qaytaryapti → balans yetarli bo'lishi shart
    if (q.tur === "olgan" && getMyBal() < pay) {
      return ok$(
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
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
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Qisman qaytarish so'rovi" : "Partial return request", body: (user.ism || "") + " " + (lg === "uz" ? "qisman qaytardim deyapti" : "says partially returned") + ": " + fmtN(pay, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        setPartialQarz(null); setPartialSum("");
        ok$(lg === "uz" ? "Qisman qaytarish so'rovi yuborildi! Tasdiq kutilmoqda." : "Partial return request sent!");
        return;
      }
    }
    // Bog'lanmagan qarz: darhol qo'llanadi + balansga AVTOMATIK yoziladi
    const paidSoFar = (q.paidPart || 0) + pay;
    const newTimeline = [...(q.timeline || []), { sana: td(), summa: pay, ism: user.ism || (lg === "uz" ? "Men" : "Me") }];
    const upd = (await freshQarz()).map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, summa: x.summa - pay, paidPart: paidSoFar, asl: x.asl || q.summa + (q.paidPart || 0), timeline: newTimeline } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q.tur === "bergan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: pay, izoh: (lg === "uz" ? "Qarz qisman qaytdi: " : "Partial return: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: pay, izoh: (lg === "uz" ? "Qarz qisman qaytarildi: " : "Partial repayment: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    setPartialQarz(null); setPartialSum("");
    ok$(lg === "uz" ? "Qisman qaytarildi: " + fmtN(pay, val, true) + ". Qoldi: " + fmtN(q.summa - pay, val, true) : "Partial payment done");
  }, [partialQarz, partialSum, qarzlar, user, xar, dar, ok$, lg, val, markQarzPaid]);

  // Qarzni o'chirish
  const delQarz = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Bog'langan va tasdiqlangan qarz TO'LIQ YOPILMAGUNCHA o'chirib bo'lmaydi
    if (q && q.linked && q.linkStatus === "accepted" && !q.paid) {
      return ok$(
        lg === "uz"
          ? "❌ Bu qarz ikki tomon tasdiqlagan. Faqat to'liq qaytarilib yopilgandan keyin o'chirish mumkin!"
          : "❌ Confirmed debt can only be deleted after it is fully closed!",
        "err"
      );
    }
    const upd = list.filter(x => !(x.id === id && (!x.uid || x.uid === user.id)));
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
  }, [qarzlar, user, ok$, lg]);

  // Eslatma yuborish
  const sendQarzReminder = useCallback(async (q) => {
    if (!q.linked || !q.linkedTel) {
      const msg = (lg === "uz" ? "Assalomu alaykum! " + fmtN(q.summa, val, true) + " qarz haqida eslatma." : "Debt reminder: " + fmtN(q.summa, val, true));
      try { navigator.clipboard.writeText(msg); ok$(lg === "uz" ? "Nusxalandi!" : "Copied!"); } catch { ok$(msg); }
      return;
    }
    const targetUid = await db.g("tel_" + q.linkedTel);
    if (targetUid) {
      const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "🔔 Qarz eslatmasi" : "Debt reminder", body: (user.ism || "") + " " + (lg === "uz" ? "qarz haqida eslatma yubordi" : "sent a debt reminder") + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
      const rC = (await db.g("notif_" + targetUid)) || [];
      await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
      ok$(lg === "uz" ? "Eslatma yuborildi!" : "Reminder sent!");
    }
  }, [user, ok$, lg, val]);

  // Daromad/xarajatga qo'shish
  const addQarzAsDaromad = useCallback(async (q) => {
    const item = { id: Date.now(), tur: "boshqa", summa: q.summa, izoh: (lg === "uz" ? "Qarz qaytishi: " : "Debt return: ") + q.kim, sana: td(), vaqt: nt() };
    const key = "d_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setDar(d => [{ ...item, uid: user.id }, ...d]);
    setQarzDonePrompt(null);
    ok$(lg === "uz" ? "Daromadlarga qo'shildi! +" + fmtN(q.summa, val, true) : "Added to income!");
  }, [user, ok$, lg, val]);

  const addQarzAsXarajat = useCallback(async (q) => {
    if (getMyBal() < Number(q.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Balans yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance!",
        "err"
      );
    }
    const item = { id: Date.now(), kategoriya: "boshqa", summa: q.summa, izoh: (lg === "uz" ? "Qarz qaytarish: " : "Debt payment: ") + q.kim, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar(x => [{ ...item, uid: user.id }, ...x]);
    setQarzDonePrompt(null);
    ok$(lg === "uz" ? "Xarajatlarga qo'shildi! -" + fmtN(q.summa, val, true) : "Added to expenses!");
  }, [user, xar, dar, ok$, lg, val]);

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
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
        "err"
      );
    }
    const upd = list.map(q => {
      if (q.id === req.debtId && (!q.uid || q.uid === user.id)) {
        const newTimeline = [...(q.timeline || []), { sana: td(), summa: paySum, ism: req.fromIsm || (lg === "uz" ? "Hamkor" : "Partner") }];
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
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: paySum, izoh: (lg === "uz" ? "Qarz qaytdi: " : "Debt returned: ") + doneQ.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: doneQ.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: paySum, izoh: (lg === "uz" ? "Qarz qaytarildi: " : "Debt repaid: ") + doneQ.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: doneQ.id };
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
      const pN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? (closeIt ? "✅ Qarz qaytarishi tasdiqlandi" : "✅ Qisman qaytarish tasdiqlandi") : "Return confirmed", body: (user.ism || "") + ": " + fmtN(paySum, val, true), sana: new Date().toISOString(), read: false };
      const pC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [pN, ...pC].slice(0, 100));
    } catch {}
    ok$(lg === "uz" ? (closeIt ? "Qaytarish tasdiqlandi! Balansga yozildi." : "Qisman qaytarish tasdiqlandi! Balansga yozildi.") : "Return confirmed!");
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, lg, val]);

  const rejectPayReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "pr_" + req.id + "_" + Date.now(), type: "pay_result", debtId: req.debtId, status: "rejected", paySum: 0, closeIt: false, byIsm: user.ism });
    }
    ok$(lg === "uz" ? "Qaytarish rad etildi" : "Return rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  // To'liq yangilash: so'rovlar, qarzlar, bildirishnomalar VA balans (xarajat/daromad)
  // silent === true bo'lsa toast ko'rsatilmaydi (avtomatik sinxronizatsiya uchun)
  const refreshQarzReqs = useCallback(async (silent) => {
    if (!user?.id) return;
    try {
      if (user.tel) {
        const pending = await qmail.load(user, { setQarzlar, setXar, setDar }, lg);
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
      if (silent !== true) ok$(lg === "uz" ? "Yangilandi" : "Refreshed");
    } catch (e) { console.error("refreshQarzReqs:", e); }
  }, [user, azolar, ok$, lg]);

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
