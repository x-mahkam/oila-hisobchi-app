import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { KATS, KN, DARS, DN } from "../utils/constants.js";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

// Maxsus native plagin (android/.../SaveToDownloadsPlugin.java) — faylni
// bevosita qurilmaning ommaviy "Yuklab olishlar" papkasiga saqlaydi,
// foydalanuvchi "Ulashish" oynasidan biror ilova tanlashi shart emas.
const SaveToDownloads = registerPlugin("SaveToDownloads");

export function useExport({ xar, dar, bdj, gN, canSeeReport, tm, qarzlar }) {
  const { isPremium, setShowPremModal, lg, ok$, user, oila, azolar, t } = useApp();
  const [exportLoading, setExportLoading] = useState(false);

  // `range` = { from, to } (YYYY-MM-DD, ISO satr taqqoslash orqali) — berilmasa
  // yoki bo'sh bo'lsa, standart xulq-atvor (joriy oy) saqlanadi.
  const filterByRange = (list, range) => {
    if (!range || (!range.from && !range.to)) {
      const month = tm();
      return list.filter((x) => x.sana?.startsWith(month));
    }
    const { from, to } = range;
    return list.filter((x) => x.sana && (!from || x.sana >= from) && (!to || x.sana <= to));
  };

  const rangeLabel = (range) => {
    if (!range || (!range.from && !range.to)) return tm();
    return (range.from || "…") + " — " + (range.to || "…");
  };

  const rangeFileTag = (range) => {
    if (!range || (!range.from && !range.to)) return tm();
    return (range.from || "boshi") + "_" + (range.to || "oxiri");
  };

  // Kunlik trend diagrammasi uchun kun ro'yxati — standart holatda joriy
  // oyning barcha kunlari, maxsus oraliqda esa "from"dan "to"gacha bo'lgan
  // har bir kun (juda uzun oraliqda cheksiz tsiklni oldini olish uchun
  // taxminan 2 yilgacha chegaralangan).
  const dailySeries = (range, month) => {
    if (range && (range.from || range.to)) {
      const start = range.from || range.to || month + "-01";
      const end = range.to || range.from || month + "-28";
      const dayList = [];
      let d = new Date(start + "T00:00:00");
      const endD = new Date(end + "T00:00:00");
      let guard = 0;
      while (d <= endD && guard < 731) {
        dayList.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
        guard++;
      }
      return dayList.length ? dayList : [start];
    }
    const [yy, mm] = month.split("-").map(Number);
    const dim = new Date(yy, mm, 0).getDate();
    return Array.from({ length: dim }, (_, i) => month + "-" + String(i + 1).padStart(2, "0"));
  };

  // Saqlangan faylni "qaysi ilovada ochasiz" tizim so'rovi bilan darhol
  // ochadi — foydalanuvchi "yuklab olindi" xabaridan keyin natijani darhol
  // ko'radi, qo'lda "Fayllar" ilovasiga kirib qidirishi shart emas.
  const openFile = async (uri, mimeType) => {
    if (!uri || !Capacitor.isNativePlatform()) return;
    try {
      await SaveToDownloads.open({ uri, mimeType });
    } catch (e) {
      console.warn("openFile failed:", e);
    }
  };

  // MUHIM: Android WebView'da `<a download>` + blob URL texnikasi
  // ISHLAMAYDI — WebView'da brauzerdagidek "Yuklab olishlar" menejeri
  // yo'q, shu sabab a.click() xatosiz bajariladi (shuning uchun ilova
  // "Yuklab olindi!" deb ko'rsatardi), lekin fayl qurilmada HECH QAYERGA
  // yozilmasdi. Native platformada endi fayl to'g'ridan-to'g'ri
  // SaveToDownloads plagini orqali qurilmaning "Yuklab olishlar"
  // papkasiga yoziladi — hech qanday "ulashish/yuborish" bosqichisiz.
  const downloadFile = async (content, filename, mime) => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          // MUHIM: MediaStore.MIME_TYPE ustuni "text/csv;charset=utf-8;"
          // kabi parametrli qiymatni emas, faqat toza MIME turini
          // ("text/csv") kutadi — aks holda yozuv rad etilishi mumkin.
          const cleanMime = (mime || "text/plain").split(";")[0].trim();
          const { uri } = await SaveToDownloads.save({ filename, content, mimeType: cleanMime });
          return { ok: true, uri, mime: cleanMime };
        } catch (e1) {
          console.warn("SaveToDownloads failed, falling back to share:", e1);
        }
        // Zaxira yo'l (masalan APK hali yangi plagin bilan qayta
        // qurilmagan bo'lsa): fayl keshga yoziladi, Ulashish oynasi ochiladi.
        const { uri } = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        // MUHIM: fayl yozish (yuqorida) va ulashish oynasi (pastda) ATAYIN
        // ikki alohida bosqich — foydalanuvchi Ulashish oynasini ilova
        // tanlamasdan yopib qo'ysa, ba'zi qurilmalarda Share.share() xato
        // (rad javobi) qaytaradi, lekin fayl allaqachon MUVAFFAQIYATLI
        // yozilgan bo'ladi. Shu xato tashqi try/catch'ga tushib "Xato"
        // deb noto'g'ri ko'rsatilmasligi uchun bu yerda alohida ushlanadi.
        try { await Share.share({ url: uri, title: filename }); } catch (_se) {}
        return { ok: true, uri: null, mime: null };
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { ok: true, uri: null, mime: null };
    } catch (e) {
      console.error("downloadFile error:", e);
      return { ok: false, uri: null, mime: null };
    }
  };

  // MUHIM: android.print.PrintDocumentAdapter orqali "WebView'ni PDF'ga
  // aylantirish" (avval sinalgan usul) build vaqtida xato berdi —
  // LayoutResultCallback/WriteResultCallback konstruktorlari package-private,
  // ilova kodi ulardan meros ololmaydi. Shu sabab PDF endi TO'LIQ JS
  // tomonida (html2canvas — HTML'ni canvas'ga "suratga oladi" — va jsPDF —
  // shu suratni sahifalarga bo'lib haqiqiy PDF fayl quradi) generatsiya
  // qilinadi. Natija (base64) so'ng mavjud, allaqachon ishlayotgan native
  // SaveToDownloads.save() metodiga beriladi.
  //
  // MUHIM (QR kod): hisobot/tilxat HTML'ida QR kod tashqi xizmatdan
  // (api.qrserver.com) <img> sifatida keladi — bu esa canvas'ni CORS
  // sababli "tainted" qilib, butun suratga olishni buzardi. Shu sabab
  // H/tilxat html generatorlarining o'zida (useExport.js va
  // useDebts.jsx) QR kod endi mahalliy "qrcode" kutubxonasi bilan
  // (tarmoqsiz, to'g'ridan-to'g'ri data: URI) generatsiya qilinadi —
  // canvas hech qachon "tainted" bo'lmaydi.
  const renderHtmlToCanvas = async (html) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-99999px";
    iframe.style.left = "0";
    iframe.style.width = "800px";
    iframe.style.height = "600px";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    try {
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.srcdoc = html;
      });
      const doc = iframe.contentDocument;
      // "Chop etish/saqlash" tugmasi faqat ekranda ko'rsatiladigan UI
      // elementi — PDF suratiga kirib qolmasligi uchun olib tashlanadi
      // (CSS'dagi @media print qoidasi html2canvas'da ishlamaydi).
      doc.querySelectorAll(".btn").forEach((el) => el.remove());
      const fullHeight = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
      iframe.style.height = fullHeight + "px";
      await new Promise((r) => setTimeout(r, 60));
      const scale = 2;
      // Diagrammalar/summalar/QR-kod qatori kabi "bo'linmasligi kerak"
      // bloklarning canvas'dagi (scale bilan) chegaralarini saqlab
      // qolamiz — sahifa bo'lish shu bloklar o'rtasidan (masalan QR
      // kodning yarmi bir varaqda, yarmi keyingisida qolib, uni skanerlab
      // bo'lmay qolishi mumkin edi) o'tib ketmasligi uchun.
      const keepTogether = Array.from(doc.querySelectorAll(".charts, .sum, .qr, .verify-box")).map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top * scale, bottom: rect.bottom * scale };
      });
      const canvas = await html2canvas(doc.body, {
        width: 800,
        windowWidth: 800,
        height: fullHeight,
        backgroundColor: "#ffffff",
        scale,
      });
      return { canvas, keepTogether };
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const canvasToPdfBase64 = (canvas, keepTogether = []) => {
    const pageWidthMM = 210, pageHeightMM = 297; // A4
    const pxPerMM = canvas.width / pageWidthMM;
    const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let renderedPx = 0;
    let firstPage = true;
    while (renderedPx < canvas.height) {
      let sliceEnd = Math.min(renderedPx + pageHeightPx, canvas.height);
      // Agar chegara "bo'linmasligi kerak" blokning o'rtasidan o'tsa,
      // chegarani o'sha blokning boshigacha qisqartiramiz — u to'liq
      // holda keyingi sahifada chiqadi.
      for (const block of keepTogether) {
        if (block.top > renderedPx && block.top < sliceEnd && block.bottom > sliceEnd) {
          sliceEnd = block.top;
        }
      }
      const sliceHeightPx = Math.max(1, sliceEnd - renderedPx);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      pageCanvas.getContext("2d").drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
      if (!firstPage) doc.addPage();
      doc.addImage(imgData, "JPEG", 0, 0, pageWidthMM, sliceHeightPx / pxPerMM);
      renderedPx += sliceHeightPx;
      firstPage = false;
    }
    return doc.output("datauristring").split(",")[1];
  };

  // HTML hisobotni HAQIQIY PDF fayliga aylantirib saqlaydi va native
  // platformada darhol "qaysi ilovada ochasiz" so'rovi bilan ochadi.
  // PDF generatsiyasi muvaffaqiyatsiz bo'lsa (masalan eski qurilmada
  // canvas cheklovi), HTML fayl sifatida zaxira yo'lga o'tadi.
  const savePdf = async (html, filename) => {
    try {
      const { canvas, keepTogether } = await renderHtmlToCanvas(html);
      const base64 = canvasToPdfBase64(canvas, keepTogether);
      if (Capacitor.isNativePlatform()) {
        const { uri } = await SaveToDownloads.save({ filename, content: base64, mimeType: "application/pdf", isBase64: true });
        await openFile(uri, "application/pdf");
        return true;
      }
      const link = document.createElement("a");
      link.href = "data:application/pdf;base64," + base64;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.warn("PDF generation failed, falling back to HTML download:", e);
      const htmlFilename = filename.replace(/\.pdf$/i, "") + ".html";
      const res = await downloadFile(html, htmlFilename, "text/html;charset=utf-8;");
      if (res.ok) await openFile(res.uri, "text/html");
      return res.ok;
    }
  };

  const exportExcel = async (range) => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    setExportLoading(true);
    try {
      const label = rangeLabel(range);
      const esc = (s) => {
        const v = String(s == null ? "" : s);
        if (v.indexOf('"') >= 0 || v.indexOf(";") >= 0) {
          return '"' + v.split('"').join('""') + '"';
        }
        return v;
      };
      const exFil = canSeeReport ? "all" : user?.id; // canSeeReport checks
      const scopedX = filterByRange(xar, range);
      const scopedD = filterByRange(dar, range);
      const exX = exFil === "all" ? scopedX : scopedX.filter((x) => x.uid === exFil);
      const exD = exFil === "all" ? scopedD : scopedD.filter((d) => d.uid === exFil);
      const exjX = exX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const exjD = exD.reduce((s, d) => s + Number(d.summa || 0), 0);
      const rows = [];
      rows.push([t("xp_familyReportTitle"), label].join(";"));
      rows.push("");
      rows.push([t("xp_totalIncome"), exjD].join(";"));
      rows.push([t("xp_totalExpense"), exjX].join(";"));
      rows.push([t("xp_balance"), exjD - exjX].join(";"));
      rows.push([t("xp_budget"), bdj].join(";"));
      rows.push("");
      if (exX.length > 0) {
        rows.push([t("xp_expensesHeader")].join(";"));
        rows.push(
          ["#", t("xp_colDate"), t("xp_colCategory"), t("xp_colNote"), t("xp_colWho"), t("xp_colAmount")]
            .map(esc)
            .join(";")
        );
        exX.forEach((x, i) =>
          rows.push([i + 1, x.sana, KN[lg][KATS.findIndex((k) => k.id === x.kategoriya)] || "", x.izoh || "", gN(x.uid), x.summa].map(esc).join(";"))
        );
        rows.push("");
      }
      if (exD.length > 0) {
        rows.push([t("xp_incomeHeader")].join(";"));
        rows.push(
          ["#", t("xp_colDate"), t("xp_colType"), t("xp_colNote"), t("xp_colWho"), t("xp_colAmount")]
            .map(esc)
            .join(";")
        );
        exD.forEach((d, i) =>
          rows.push([i + 1, d.sana, DN[lg][DARS.findIndex((dr) => dr.id === d.tur)] || "", d.izoh || "", gN(d.uid), d.summa].map(esc).join(";"))
        );
        rows.push("");
      }
      if (qarzlar.length > 0) {
        rows.push([t("xp_debtsHeader")].join(";"));
        rows.push(
          ["#", t("xp_colPerson"), t("xp_colType"), t("xp_colAmount"), t("xp_colDate"), t("xp_colStatus")]
            .map(esc)
            .join(";")
        );
        qarzlar.forEach((q, i) => {
          rows.push(
            [
              i + 1,
              q.kim,
              q.tur === "bergan" ? t("xp_lent") : t("xp_borrowed"),
              q.summa,
              q.sana,
              q.paid ? t("xp_returned") : t("xp_active"),
            ]
              .map(esc)
              .join(";")
          );
        });
      }
      const csv = "\uFEFF" + rows.join("\n");
      const res = await downloadFile(csv, "OilaHisobot_" + rangeFileTag(range) + ".csv", "text/csv;charset=utf-8;");
      if (res.ok) await openFile(res.uri, "text/csv");
      ok$(res.ok ? t("xp_downloaded") : t("xp_error"), res.ok ? "ok" : "err");
    } catch (e) {
      ok$(t("xp_errorMsg", { msg: e.message }), "err");
    }
    setExportLoading(false);
  };

  const exportPDF = async (scopeArg, range) => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    try {
      const month = tm();
      const label = rangeLabel(range);
      const sc = scopeArg === "mine" || scopeArg === "family" ? scopeArg : canSeeReport ? "family" : "mine";
      const scopedX = filterByRange(xar, range);
      const scopedD = filterByRange(dar, range);
      const pX = sc === "family" && canSeeReport ? scopedX : scopedX.filter((x) => x.uid === user?.id || !x.uid);
      const pD = sc === "family" && canSeeReport ? scopedD : scopedD.filter((d) => d.uid === user?.id || !d.uid);
      const pdfWho = sc === "family" ? t("xp_familyReport") : t("xp_personalReport", { name: user?.ism || "" });
      const jX2 = pX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const jD2 = pD.reduce((s, d) => s + Number(d.summa || 0), 0);

      // SVG donut generator
      // MUHIM: bu diagramma ilgari inline SVG (<path> yoylar) bilan
      // chizilgan edi — Playwright orqali haqiqiy Chromium'da vizual
      // tekshirilganda (rasm sifatida saqlanib ko'zdan kechirilganda)
      // aniqlandiki, html2canvas donut diagrammaning O'NG YARMINI qattiq
      // vertikal chiziq bilan kesib tashlar edi (SVG <path> ellips yoy
      // buyruqlarini (A) surating olishdagi html2canvas'ning nozik xatosi).
      // CSS conic-gradient() bilan almashtirish HAM ishlamadi — html2canvas
      // 1.4.1 uni umuman qo'llamaydi (diagramma butunlay ko'rinmay qoldi).
      // Shu sabab diagramma endi Canvas 2D API (ctx.arc()) bilan
      // OLDINDAN alohida <canvas>'da chizilib, tayyor PNG rasm (<img>)
      // sifatida joylashtiriladi — xuddi allaqachon ishonchli ishlayotgan
      // QR kod rasmlari kabi, html2canvas'ning CSS/SVG talqin qilishiga
      // umuman bog'liq emas (bu ham Playwright'da vizual tasdiqlangan).
      const donutSVG = (data, centerLabel) => {
        const total = data.reduce((s, d) => s + d.sum, 0);
        if (total <= 0) return "<div style='height:130px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px'>" + t("xp_noData") + "</div>";
        const size = 260; // 130 * 2 — aniqroq (retina) rasm uchun
        const dCanvas = document.createElement("canvas");
        dCanvas.width = size;
        dCanvas.height = size;
        const ctx = dCanvas.getContext("2d");
        const cx = size / 2, cy = size / 2;
        const rOuter = 116, rInner = 72; // asl SVG'dagi r=58/rIn=36 nisbatiga mos (x2)
        let angle = -Math.PI / 2;
        data.slice(0, 6).forEach((d) => {
          const sweep = Math.min((d.sum / total) * 2 * Math.PI, 2 * Math.PI - 0.002);
          ctx.beginPath();
          ctx.moveTo(cx + rInner * Math.cos(angle), cy + rInner * Math.sin(angle));
          ctx.arc(cx, cy, rOuter, angle, angle + sweep);
          ctx.arc(cx, cy, rInner, angle + sweep, angle, true);
          ctx.closePath();
          ctx.fillStyle = d.color;
          ctx.fill();
          angle += sweep;
        });
        ctx.fillStyle = "#6b7280";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText(centerLabel, cx, cy - 6);
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 20px Arial";
        ctx.fillText(total >= 1e6 ? (total / 1e6).toFixed(1) + " mln" : total.toLocaleString(), cx, cy + 20);
        const imgSrc = dCanvas.toDataURL("image/png");
        const legend = data
          .slice(0, 6)
          .map(
            (d) =>
              "<div style='display:flex;align-items:center;gap:5px;font-size:9px;color:#374151;margin-top:3px'><span style='width:8px;height:8px;border-radius:50%;background:" +
              d.color +
              ";display:inline-block;flex-shrink:0'></span><span style='flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>" +
              d.name +
              "</span><b>" +
              Math.round((d.sum / total) * 100) +
              "%</b></div>"
          )
          .join("");
        return (
          "<img src='" + imgSrc + "' width='130' height='130' style='display:block;margin:0 auto'/>" +
          "<div style='margin-top:8px'>" +
          legend +
          "</div>"
        );
      };

      // MUHIM: bu diagramma ilgari inline SVG (<rect>/<text>) bilan
      // chizilgan edi — donut diagrammalar ham SVG bo'lsa-da to'g'ri
      // chiqardi, lekin AYNAN shu bar-diagramma html2canvas'da ikki marta
      // (turli sozlamalar bilan) qayta urinishdan keyin ham yuqori qismi
      // "siqilib"/kesilib chiqishda davom etdi — html2canvas'ning ko'p
      // <rect> elementli SVG'larni piksel-aniq surating olishidagi ma'lum
      // nozik muammosi. Shu sabab endi oddiy HTML/CSS (flexbox+div)
      // ustunlar bilan chizilgan — bu yondashuv .sum/.charts kabi allaqachon
      // ishonchli ishlayotgan div-asosli bloklar bilan bir xil, SVG
      // scaling noaniqligiga umuman bog'liq emas.
      const barSVG = (() => {
        const dayList = dailySeries(range, month);
        const dim = dayList.length;
        const days = dayList.map((sana) => pX.filter((x) => x.sana === sana).reduce((s, x) => s + Number(x.summa || 0), 0));
        const mx = Math.max(...days, 1);
        const chartH = 84; // px
        const bars = days
          .map((v) => {
            const hPct = Math.max(v > 0 ? 4 : 2, Math.round((v / mx) * 100));
            const color = v > 0 ? "#6366f1" : "#e5e7eb";
            return (
              "<div style='flex:1;display:flex;align-items:flex-end;height:" +
              chartH +
              "px;min-width:1px'><div style='width:100%;height:" +
              hPct +
              "%;background:" +
              color +
              ";border-radius:1px 1px 0 0'></div></div>"
            );
          })
          .join("");
        return (
          "<div style='display:flex;align-items:flex-end;gap:1px;height:" +
          chartH +
          "px;width:100%;box-sizing:border-box'>" +
          bars +
          "</div>" +
          "<div style='display:flex;justify-content:space-between;font-size:8px;color:#9ca3af;margin-top:4px'><span>1</span><span>" +
          Math.round(dim / 2) +
          "</span><span>" +
          dim +
          "</span></div>" +
          "<div style='font-size:9px;color:#6b7280;text-align:center;margin-top:4px'>" +
          t("xp_dailyMax", { max: mx.toLocaleString() }) +
          "</div>"
        );
      })();

      // Diagramma ma'lumotlari
      const knownKat = new Set([...KATS.map((k) => k.id), "qarz", "maqsad"]);
      const katData = KATS.map((k, i) => ({ name: KN[lg][i], color: k.c, sum: pX.filter((x) => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) }))
        .concat([
          { name: t("xp_loanGiven"), color: "#F97316", sum: pX.filter((x) => x.kategoriya === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: t("xp_goalSavings"), color: "#EAB308", sum: pX.filter((x) => x.kategoriya === "maqsad").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: t("xp_otherRecords"), color: "#94A3B8", sum: pX.filter((x) => !knownKat.has(x.kategoriya)).reduce((s, x) => s + Number(x.summa || 0), 0) },
        ])
        .filter((d) => d.sum > 0)
        .sort((a, b) => b.sum - a.sum);

      const MEMC = ["#22C55E", "#3B82F6", "#A855F7", "#F97316", "#F5B731", "#EC4899", "#06B6D4"];
      const secondDonut =
        sc === "family" && canSeeReport && azolar.length > 1
          ? {
              title: t("xp_membersShare"),
              html: donutSVG(
                azolar
                  .map((a, i) => ({
                    name: a.ism || "?",
                    color: MEMC[i % MEMC.length],
                    sum: pX.filter((x) => x.uid === a.id || (!x.uid && a.id === user?.id)).reduce((s, x) => s + Number(x.summa || 0), 0),
                  }))
                  .filter((d) => d.sum > 0)
                  .sort((a, b) => b.sum - a.sum),
                t("xp_familyTotal")
              ),
            }
          : {
              title: t("xp_incomeTypes"),
              html: donutSVG(
                DARS.map((d, i) => ({ name: DN[lg]?.[i] || d.id, color: d.c, sum: pD.filter((x) => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0) }))
                  .concat([
                    { name: t("xp_loanReceived"), color: "#14B8A6", sum: pD.filter((x) => x.tur === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) },
                    {
                      name: t("xp_otherRecords"),
                      color: "#94A3B8",
                      sum: pD.filter((x) => !["oylik", "qoshimcha", "biznes", "sovga", "boshqa", "qarz"].includes(x.tur)).reduce((s, x) => s + Number(x.summa || 0), 0),
                    },
                  ])
                  .filter((d) => d.sum > 0)
                  .sort((a, b) => b.sum - a.sum),
                t("xp_income")
              ),
            };

      const katRows = KATS.map((k, i) => {
        const tot = pX.filter((x) => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
        if (!tot) return "";
        const pct2 = jX2 > 0 ? Math.round((tot / jX2) * 100) : 0;
        return "<tr><td>" + KN[lg][i] + "</td><td style='text-align:right'>" + tot.toLocaleString() + " " + t("xp_currency") + "</td><td style='text-align:center'>" + pct2 + "%</td></tr>";
      }).join("");

      const xRows = pX
        .slice(0, 40)
        .map((x) => "<tr><td style='white-space:nowrap'>" + x.sana + "</td><td style='white-space:nowrap'>" + KN[lg][KATS.findIndex((k) => k.id === x.kategoriya)] + "</td><td>" + (x.izoh || "") + "</td><td style='text-align:right;white-space:nowrap'>" + Number(x.summa).toLocaleString() + "</td><td style='white-space:nowrap'>" + gN(x.uid) + "</td></tr>")
        .join("");

      const qActive = qarzlar.filter((q) => !q.paid && (sc === "family" && canSeeReport ? true : q.uid === user?.id || !q.uid));
      const qRows = qActive
        .slice(0, 15)
        .map((q) => "<tr><td>" + q.kim + "</td><td style='white-space:nowrap'>" + (q.tur === "bergan" ? t("xp_lentPassive") : t("xp_borrowedPassive")) + "</td><td style='text-align:right;white-space:nowrap'>" + Number(q.summa).toLocaleString() + "</td><td style='white-space:nowrap'>" + (q.qaytSana || "-") + "</td></tr>")
        .join("");

      // QR - referal link
      const refLink = window.location.origin + "/?ref=" + (user?.id || "");
      // Mahalliy generatsiya (tarmoqsiz) — tashqi QR xizmati canvas'ni
      // CORS sababli "tainted" qilib, PDF suratga olishni buzardi.
      const refQR = await QRCode.toDataURL(refLink, { width: 160, margin: 1 });

      const H =
        "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Hisobot " +
        label +
        "</title><style>" +
        "*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}" +
        "h2{color:#374151;margin-top:26px;font-size:16px}" +
        "table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}" +
        ".sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}" +
        ".hdr{display:flex;align-items:center;gap:12px;margin-bottom:6px}" +
        ".charts{display:flex;align-items:stretch;gap:10px;margin:18px 0}.chart{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 10px;min-width:0;min-height:270px;box-sizing:border-box;overflow:visible}.chart .ct{font-size:11px;font-weight:800;color:#6366f1;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px}" +
        ".qr{display:flex;align-items:center;gap:14px;justify-content:center;margin-top:22px;padding:14px;background:#f9fafb;border:1.5px solid #6366f133;border-radius:12px}.qr img{width:88px;height:88px;border-radius:8px}" +
        ".foot{margin-top:30px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}" +
        ".btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}" +
        "@media print{.btn{display:none}.charts{page-break-inside:avoid}}</style></head><body>" +
        "<div class='hdr'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' style='width:48px;height:48px;border-radius:12px;margin-right:12px;'><rect width='120' height='120' rx='28' fill='#5D5CFF' /><path d='M12 46 L60 12 L108 46' stroke='#FFFFFF' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none' /><rect x='18' y='47' width='84' height='58' rx='14' stroke='#FFFFFF' stroke-width='7' fill='none' /><path d='M18 58 L102 58' stroke='#FFFFFF' stroke-width='7' stroke-linecap='round' /><path d='M60 95 C54 89 44 81 44 73 C44 68 48 64 53 64 C56.5 64 58.5 66 60 67 C61.5 66 63.5 64 67 64 C72 64 76 68 76 73 C76 81 66 89 60 95 Z' stroke='#FFFFFF' stroke-width='7' stroke-linecap='round' stroke-linejoin='round' fill='none' /></svg><div><div style='font-size:20px;font-weight:800;color:#6366f1'>Oila Hisobchi</div><div style='font-size:12px;color:#6b7280'>" +
        (oila && oila.nomi ? oila.nomi : t("xp_familyFallback")) +
        " \u00b7 " +
        pdfWho +
        " \u00b7 " +
        label +
        "</div></div></div>" +
        "<div style='border-bottom:3px solid #6366f1;margin-bottom:14px'></div>" +
        "<p style='color:#6b7280;font-size:12px'>" +
        t("xp_generated") +
        ": " +
        new Date().toLocaleString("uz-UZ") +
        "</p>" +
        "<div class='sum'><div class='box'><div class='lbl'>" +
        t("xp_income") +
        "</div><div class='val g'>" +
        jD2.toLocaleString() +
        "</div></div><div class='box'><div class='lbl'>" +
        t("xp_expense") +
        "</div><div class='val r'>" +
        jX2.toLocaleString() +
        "</div></div><div class='box'><div class='lbl'>" +
        t("xp_balance") +
        "</div><div class='val " +
        (jD2 - jX2 >= 0 ? "g" : "r") +
        "'>" +
        (jD2 - jX2).toLocaleString() +
        "</div></div></div>" +
        "<div class='charts'>" +
        "<div class='chart'><div class='ct'>" +
        t("xp_categories") +
        "</div>" +
        donutSVG(katData, t("xp_expense")) +
        "</div>" +
        "<div class='chart'><div class='ct'>" +
        secondDonut.title +
        "</div>" +
        secondDonut.html +
        "</div>" +
        "<div class='chart'><div class='ct'>" +
        t("xp_monthlyTrend") +
        "</div>" +
        barSVG +
        "</div>" +
        "</div>" +
        "<h2>" +
        t("xp_categories") +
        "</h2><table><thead><tr><th>" +
        t("xp_colCategory") +
        "</th><th style='text-align:right'>" +
        t("xp_colAmount") +
        "</th><th style='text-align:center'>%</th></tr></thead><tbody>" +
        (katRows || "<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>") +
        "</tbody></table>" +
        "<h2>" +
        t("xp_expensesTitle") +
        "</h2><table><thead><tr><th>" +
        t("xp_colDate") +
        "</th><th>" +
        t("xp_colCategory") +
        "</th><th>" +
        t("xp_colNote") +
        "</th><th style='text-align:right'>" +
        t("xp_colAmount") +
        "</th><th>" +
        t("xp_colWho") +
        "</th></tr></thead><tbody>" +
        (xRows || "<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>") +
        "</tbody></table>" +
        (qRows
          ? "<h2>" +
            t("xp_activeDebtsTitle") +
            "</h2><table><thead><tr><th>" +
            t("xp_colPerson") +
            "</th><th>" +
            t("xp_colType") +
            "</th><th style='text-align:right'>" +
            t("xp_colAmount") +
            "</th><th>" +
            t("xp_colReturn") +
            "</th></tr></thead><tbody>" +
            qRows +
            "</tbody></table>"
          : "") +
        "<div class='qr'><img src='" +
        refQR +
        "' alt='QR'/><div style='text-align:left'><div style='font-size:13px;font-weight:700;color:#374151'>" +
        t("xp_inviteText", { name: user?.ism || "" }) +
        "</div><div style='font-size:11px;color:#6b7280;margin-top:3px'>" +
        t("xp_qrScanText") +
        "</div><div style='font-size:9px;color:#9ca3af;margin-top:4px;word-break:break-all'>" +
        refLink +
        "</div></div></div>" +
        "<div class='foot'>" +
        t("xp_footerGenerated") +
        " \u00b7 " +
        label +
        "</div>" +
        "<button class='btn' onclick='window.print()'>" +
        t("xp_savePrintBtn") +
        "</button></body></html>";

      const okk = await savePdf(H, "OilaHisobot_" + rangeFileTag(range) + ".pdf");
      ok$(okk ? t("xp_downloaded") : t("xp_error"), okk ? "ok" : "err");
    } catch (e) {
      ok$(t("xp_errorMsg", { msg: e.message }), "err");
    }
  };

  return {
    exportLoading,
    exportExcel,
    exportPDF,
    downloadFile,
    savePdf,
  };
}
