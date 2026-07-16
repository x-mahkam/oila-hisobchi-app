import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { KATS, KN, DARS, DN } from "../utils/constants.js";
import i18n from "../i18n/index.js";

export function useExport({ bX, bD, bdj, gN, canSeeReport, tm, qarzlar }) {
  const { isPremium, setShowPremModal, ok$, user, oila, azolar } = useApp();
  const [exportLoading, setExportLoading] = useState(false);

  const downloadFile = (content, filename, mime) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch {
      return false;
    }
  };

  const exportExcel = () => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    setExportLoading(true);
    try {
      const month = tm();
      const esc = (s) => {
        const v = String(s == null ? "" : s);
        if (v.indexOf('"') >= 0 || v.indexOf(";") >= 0) {
          return '"' + v.split('"').join('""') + '"';
        }
        return v;
      };
      const exFil = canSeeReport ? "all" : user?.id; // canSeeReport checks
      const exX = exFil === "all" ? bX : bX.filter((x) => x.uid === exFil);
      const exD = exFil === "all" ? bD : bD.filter((d) => d.uid === exFil);
      const exjX = exX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const exjD = exD.reduce((s, d) => s + Number(d.summa || 0), 0);
      const rows = [];
      rows.push([i18n.t("export_family_report", { defaultValue: "OILA HISOBOTI" }), month].join(";"));
      rows.push("");
      rows.push([i18n.t("export_total_income", { defaultValue: "Jami daromad" }), exjD].join(";"));
      rows.push([i18n.t("export_total_expense", { defaultValue: "Jami xarajat" }), exjX].join(";"));
      rows.push([i18n.t("export_balance", { defaultValue: "Balans" }), exjD - exjX].join(";"));
      rows.push([i18n.t("export_budget", { defaultValue: "Budjet" }), bdj].join(";"));
      rows.push("");
      if (exX.length > 0) {
        rows.push([i18n.t("export_expenses", { defaultValue: "XARAJATLAR" }).toUpperCase()].join(";"));
        rows.push(
          [
            "#",
            i18n.t("export_date", { defaultValue: "Sana" }),
            i18n.t("export_category", { defaultValue: "Kategoriya" }),
            i18n.t("export_note", { defaultValue: "Izoh" }),
            i18n.t("export_who", { defaultValue: "Kim" }),
            i18n.t("export_amount", { defaultValue: "Summa" })
          ]
            .map(esc)
            .join(";")
        );
        exX.forEach((x, i) => {
          const catName = i18n.t("cat_" + x.kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex((k) => k.id === x.kategoriya)] || x.kategoriya });
          rows.push([i + 1, x.sana, catName, x.izoh || "", gN(x.uid), x.summa].map(esc).join(";"));
        });
        rows.push("");
      }
      if (exD.length > 0) {
        rows.push([i18n.t("export_income", { defaultValue: "DAROMADLAR" }).toUpperCase()].join(";"));
        rows.push(
          [
            "#",
            i18n.t("export_date", { defaultValue: "Sana" }),
            i18n.t("export_type", { defaultValue: "Tur" }),
            i18n.t("export_note", { defaultValue: "Izoh" }),
            i18n.t("export_who", { defaultValue: "Kim" }),
            i18n.t("export_amount", { defaultValue: "Summa" })
          ]
            .map(esc)
            .join(";")
        );
        exD.forEach((d, i) => {
          const incName = i18n.t("inc_" + d.tur, { defaultValue: DN[i18n.language]?.[DARS.findIndex((dr) => dr.id === d.tur)] || d.tur });
          rows.push([i + 1, d.sana, incName, d.izoh || "", gN(d.uid), d.summa].map(esc).join(";"));
        });
        rows.push("");
      }
      if (qarzlar.length > 0) {
        rows.push([i18n.t("export_debts", { defaultValue: "QARZLAR" }).toUpperCase()].join(";"));
        rows.push(
          [
            "#",
            i18n.t("export_person", { defaultValue: "Kim" }),
            i18n.t("export_type", { defaultValue: "Tur" }),
            i18n.t("export_amount", { defaultValue: "Summa" }),
            i18n.t("export_date", { defaultValue: "Sana" }),
            i18n.t("export_status", { defaultValue: "Holat" })
          ]
            .map(esc)
            .join(";")
        );
        qarzlar.forEach((q, i) => {
          rows.push(
            [
              i + 1,
              q.kim,
              q.tur === "bergan" ? i18n.t("export_lent", { defaultValue: "Berdim" }) : i18n.t("export_borrowed", { defaultValue: "Oldim" }),
              q.summa,
              q.sana,
              q.paid ? i18n.t("export_returned", { defaultValue: "Qaytarilgan" }) : i18n.t("export_active", { defaultValue: "Faol" }),
            ]
              .map(esc)
              .join(";")
          );
        });
      }
      const csv = "\uFEFF" + rows.join("\n");
      const okk = downloadFile(csv, "OilaHisobot_" + month + ".csv", "text/csv;charset=utf-8;");
      ok$(
        okk
          ? i18n.t("export_downloaded_success", { defaultValue: "Yuklab olindi!" })
          : i18n.t("error_generic", { defaultValue: "Xatolik" }),
        okk ? "ok" : "err"
      );
    } catch (e) {
      ok$(i18n.t("error_generic", { defaultValue: "Xatolik" }) + ": " + e.message, "err");
    }
    setExportLoading(false);
  };

  const exportPDF = (scopeArg) => {
    if (!isPremium) {
      setShowPremModal(true);
      return;
    }
    try {
      const month = tm();
      const sc = scopeArg === "mine" || scopeArg === "family" ? scopeArg : canSeeReport ? "family" : "mine";
      const pX = sc === "family" && canSeeReport ? bX : bX.filter((x) => x.uid === user?.id || !x.uid);
      const pD = sc === "family" && canSeeReport ? bD : bD.filter((d) => d.uid === user?.id || !d.uid);
      const pdfWho = sc === "family"
        ? i18n.t("export_family_report_title", { defaultValue: "Oila hisoboti" })
        : (user?.ism || "") + " \u00b7 " + i18n.t("export_personal_report_title", { defaultValue: "Shaxsiy hisobot" });
      const jX2 = pX.reduce((s, x) => s + Number(x.summa || 0), 0);
      const jD2 = pD.reduce((s, d) => s + Number(d.summa || 0), 0);

      // SVG donut generator
      const arcPath = (cx, cy, r, rIn, a0, a1) => {
        const lg2 = a1 - a0 > Math.PI ? 1 : 0;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + rIn * Math.cos(a1), y2 = cy + rIn * Math.sin(a1);
        const x3 = cx + rIn * Math.cos(a0), y3 = cy + rIn * Math.sin(a0);
        return "M" + x0.toFixed(1) + " " + y0.toFixed(1) + " A" + r + " " + r + " 0 " + lg2 + " 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1) + " A" + rIn + " " + rIn + " 0 " + lg2 + " 0 " + x3.toFixed(1) + " " + y3.toFixed(1) + " Z";
      };

      const donutSVG = (data, centerLabel) => {
        const total = data.reduce((s, d) => s + d.sum, 0);
        if (total <= 0) return `<div style='height:130px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px'>${i18n.t("no_data", { defaultValue: "Ma'lumot yo'q" })}</div>`;
        let a = -Math.PI / 2;
        const segs = data
          .slice(0, 6)
          .map((d) => {
            const ang = Math.min((d.sum / total) * 2 * Math.PI, 2 * Math.PI - 0.002);
            const p = arcPath(65, 65, 58, 36, a + 0.015, a + ang - 0.015 > a + 0.015 ? a + ang - 0.015 : a + ang);
            a += ang;
            return "<path d='" + p + "' fill='" + d.color + "'/>";
          })
          .join("");
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
          "<svg width='130' height='130' viewBox='0 0 130 130' style='display:block;margin:0 auto'>" +
          segs +
          "<text x='65' y='62' text-anchor='middle' font-size='9' fill='#6b7280'>" +
          centerLabel +
          "</text>" +
          "<text x='65' y='75' text-anchor='middle' font-size='10' font-weight='800' fill='#1f2937'>" +
          (total >= 1e6 ? (total / 1e6).toFixed(1) + " mln" : total.toLocaleString()) +
          "</text></svg>" +
          "<div style='margin-top:8px'>" +
          legend +
          "</div>"
        );
      };

      const barSVG = (() => {
        const [yy, mm] = month.split("-").map(Number);
        const dim = new Date(yy, mm, 0).getDate();
        const days = Array.from({ length: dim }, (_, i) => {
          const sana = month + "-" + String(i + 1).padStart(2, "0");
          return pX.filter((x) => x.sana === sana).reduce((s, x) => s + Number(x.summa || 0), 0);
        });
        const mx = Math.max(...days, 1);
        const W = 190,
          H = 108,
          bw = W / dim;
        const bars = days
          .map((v, i) => {
            const h = Math.max(v > 0 ? 3 : 1, (v / mx) * (H - 24));
            return (
              "<rect x='" +
              (i * bw + 0.5).toFixed(1) +
              "' y='" +
              (H - 14 - h).toFixed(1) +
              "' width='" +
              Math.max(bw - 1.2, 1.5).toFixed(1) +
              "' height='" +
              h.toFixed(1) +
              "' rx='1.2' fill='" +
              (v > 0 ? "#6366f1" : "#e5e7eb") +
              "'/>"
            );
          })
          .join("");
        const labels = [1, Math.round(dim / 2), dim]
          .map((d) => "<text x='" + ((d - 0.5) * bw).toFixed(1) + "' y='" + (H - 3) + "' text-anchor='middle' font-size='8' fill='#9ca3af'>" + d + "</text>")
          .join("");
        return (
          "<svg width='100%' height='" +
          H +
          "' viewBox='0 0 " +
          W +
          " " +
          H +
          "' preserveAspectRatio='none' style='display:block'>" +
          bars +
          labels +
          "</svg>" +
          "<div style='font-size:9px;color:#6b7280;text-align:center;margin-top:4px'>" +
          i18n.t("export_daily_max", { defaultValue: "Kunlik xarajatlar \u00b7 maks: " }) +
          mx.toLocaleString() +
          "</div>"
        );
      })();

      // Diagramma ma'lumotlari
      const knownKat = new Set([...KATS.map((k) => k.id), "qarz", "maqsad"]);
      const katData = KATS.map((k, i) => ({ name: i18n.t("cat_" + k.id, { defaultValue: KN[i18n.language]?.[i] || k.id }), color: k.c, sum: pX.filter((x) => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) }))
        .concat([
          { name: i18n.t("export_loan_given", { defaultValue: "Qarz berildi" }), color: "#F97316", sum: pX.filter((x) => x.kategoriya === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: i18n.t("export_goal_savings", { defaultValue: "Jamg'arma (maqsad)" }), color: "#EAB308", sum: pX.filter((x) => x.kategoriya === "maqsad").reduce((s, x) => s + Number(x.summa || 0), 0) },
          { name: i18n.t("export_other_records", { defaultValue: "Boshqa yozuvlar" }), color: "#94A3B8", sum: pX.filter((x) => !knownKat.has(x.kategoriya)).reduce((s, x) => s + Number(x.summa || 0), 0) },
        ])
        .filter((d) => d.sum > 0)
        .sort((a, b) => b.sum - a.sum);

      const MEMC = ["#22C55E", "#3B82F6", "#A855F7", "#F97316", "#F5B731", "#EC4899", "#06B6D4"];
      const secondDonut =
        sc === "family" && canSeeReport && azolar.length > 1
          ? {
              title: i18n.t("export_members_share", { defaultValue: "Oila a'zolari ulushi" }),
              html: donutSVG(
                azolar
                  .map((a, i) => ({
                    name: a.ism || "?",
                    color: MEMC[i % MEMC.length],
                    sum: pX.filter((x) => x.uid === a.id || (!x.uid && a.id === user?.id)).reduce((s, x) => s + Number(x.summa || 0), 0),
                  }))
                  .filter((d) => d.sum > 0)
                  .sort((a, b) => b.sum - a.sum),
                i18n.t("export_oila_jami", { defaultValue: "Oila jami" })
              ),
            }
          : {
              title: i18n.t("export_income_types", { defaultValue: "Daromad turlari" }),
              html: donutSVG(
                DARS.map((d, i) => ({ name: i18n.t("inc_" + d.id, { defaultValue: DN[i18n.language]?.[i] || d.id }), color: d.c, sum: pD.filter((x) => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0) }))
                  .concat([
                    { name: i18n.t("export_loan_received", { defaultValue: "Qarz olindi" }), color: "#14B8A6", sum: pD.filter((x) => x.tur === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0) },
                    {
                      name: i18n.t("export_other_records", { defaultValue: "Boshqa yozuvlar" }),
                      color: "#94A3B8",
                      sum: pD.filter((x) => !["oylik", "qoshimcha", "biznes", "sovga", "boshqa", "qarz"].includes(x.tur)).reduce((s, x) => s + Number(x.summa || 0), 0),
                    },
                  ])
                  .filter((d) => d.sum > 0)
                  .sort((a, b) => b.sum - a.sum),
                i18n.t("income", { defaultValue: "Daromad" })
              ),
            };

      const katRows = KATS.map((k, i) => {
        const tot = pX.filter((x) => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
        if (!tot) return "";
        const pct2 = jX2 > 0 ? Math.round((tot / jX2) * 100) : 0;
        const name = i18n.t("cat_" + k.id, { defaultValue: KN[i18n.language]?.[i] || k.id });
        return "<tr><td>" + name + "</td><td style='text-align:right'>" + tot.toLocaleString() + " so'm</td><td style='text-align:center'>" + pct2 + "%</td></tr>";
      }).join("");

      const xRows = pX
        .slice(0, 40)
        .map((x) => {
          const catName = i18n.t("cat_" + x.kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex((k) => k.id === x.kategoriya)] || x.kategoriya });
          return "<tr><td>" + x.sana + "</td><td>" + catName + "</td><td>" + (x.izoh || "") + "</td><td style='text-align:right'>" + Number(x.summa).toLocaleString() + "</td><td>" + gN(x.uid) + "</td></tr>";
        })
        .join("");

      const qActive = qarzlar.filter((q) => !q.paid && (sc === "family" && canSeeReport ? true : q.uid === user?.id || !q.uid));
      const qRows = qActive
        .slice(0, 15)
        .map((q) => {
          const typeLabel = q.tur === "bergan" ? i18n.t("export_lent", { defaultValue: "Berilgan" }) : i18n.t("export_borrowed", { defaultValue: "Olingan" });
          return "<tr><td>" + q.kim + "</td><td>" + typeLabel + "</td><td style='text-align:right'>" + Number(q.summa).toLocaleString() + "</td><td>" + (q.qaytSana || "-") + "</td></tr>";
        })
        .join("");

      // QR - referal link
      const refLink = window.location.origin + "/?ref=" + (user?.id || "");
      const refQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(refLink);

      const H =
        "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Hisobot " +
        month +
        "</title><style>" +
        "*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}" +
        "h2{color:#374151;margin-top:26px;font-size:16px}" +
        "table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}" +
        ".sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}" +
        ".hdr{display:flex;align-items:center;gap:12px;margin-bottom:6px}" +
        ".charts{display:flex;gap:10px;margin:18px 0}.chart{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 10px;min-width:0}.chart .ct{font-size:11px;font-weight:800;color:#6366f1;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px}" +
        ".qr{display:flex;align-items:center;gap:14px;justify-content:center;margin-top:22px;padding:14px;background:#f9fafb;border:1.5px solid #6366f133;border-radius:12px}.qr img{width:88px;height:88px;border-radius:8px}" +
        ".foot{margin-top:30px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}" +
        ".btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}" +
        "@media print{.btn{display:none}.charts{page-break-inside:avoid}}</style></head><body>" +
        "<div class='hdr'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' style='width:48px;height:48px;border-radius:12px;margin-right:12px;'><rect width='120' height='120' rx='28' fill='#5D5CFF' /><path d='M12 46 L60 12 L108 46' stroke='#FFFFFF' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none' /><rect x='18' y='47' width='84' height='58' rx='14' stroke='#FFFFFF' stroke-width='7' fill='none' /><path d='M18 58 L102 58' stroke='#FFFFFF' stroke-width='7' stroke-linecap='round' /><path d='M60 95 C54 89 44 81 44 73 C44 68 48 64 53 64 C56.5 64 58.5 66 60 67 C61.5 66 63.5 64 67 64 C72 64 76 68 76 73 C76 81 66 89 60 95 Z' stroke='#FFFFFF' stroke-width='7' stroke-linecap='round' stroke-linejoin='round' fill='none' /></svg><div><div style='font-size:20px;font-weight:800;color:#6366f1'>Oila Hisobchi</div><div style='font-size:12px;color:#6b7280'>" +
        (oila && oila.nomi ? oila.nomi : i18n.t("family", { defaultValue: "Oila" })) +
        " \u00b7 " +
        pdfWho +
        " \u00b7 " +
        month +
        "</div></div></div>" +
        "<div style='border-bottom:3px solid #6366f1;margin-bottom:14px'></div>" +
        "<p style='color:#6b7280;font-size:12px'>" +
        i18n.t("export_generated", { defaultValue: "Yaratildi" }) +
        ": " +
        new Date().toLocaleString() +
        "</p>" +
        "<div class='sum'><div class='box'><div class='lbl'>" +
        i18n.t("income", { defaultValue: "Daromad" }) +
        "</div><div class='val g'>" +
        jD2.toLocaleString() +
        "</div></div><div class='box'><div class='lbl'>" +
        i18n.t("expense", { defaultValue: "Xarajat" }) +
        "</div><div class='val r'>" +
        jX2.toLocaleString() +
        "</div></div><div class='box'><div class='lbl'>" +
        i18n.t("export_balance_label", { defaultValue: "Balans" }) +
        "</div><div class='val " +
        (jD2 - jX2 >= 0 ? "g" : "r") +
        "'>" +
        (jD2 - jX2).toLocaleString() +
        "</div></div></div>" +
        "<div class='charts'>" +
        "<div class='chart'><div class='ct'>" +
        i18n.t("export_categories_title", { defaultValue: "Kategoriyalar" }) +
        "</div>" +
        donutSVG(katData, i18n.t("expense", { defaultValue: "Xarajat" })) +
        "</div>" +
        "<div class='chart'><div class='ct'>" +
        secondDonut.title +
        "</div>" +
        secondDonut.html +
        "</div>" +
        "<div class='chart'><div class='ct'>" +
        i18n.t("export_monthly_trend_title", { defaultValue: "Oy dinamikasi" }) +
        "</div>" +
        barSVG +
        "</div>" +
        "</div>" +
        "<h2>" +
        i18n.t("export_categories_title", { defaultValue: "Kategoriyalar" }) +
        "</h2><table><thead><tr><th>" +
        i18n.t("export_category", { defaultValue: "Kategoriya" }) +
        "</th><th style='text-align:right'>" +
        i18n.t("export_amount", { defaultValue: "Summa" }) +
        "</th><th style='text-align:center'>%</th></tr></thead><tbody>" +
        (katRows || "<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>") +
        "</tbody></table>" +
        "<h2>" +
        i18n.t("export_expenses_title", { defaultValue: "Xarajatlar" }) +
        "</h2><table><thead><tr><th>" +
        i18n.t("export_date", { defaultValue: "Sana" }) +
        "</th><th>" +
        i18n.t("export_category", { defaultValue: "Kategoriya" }) +
        "</th><th>" +
        i18n.t("export_note", { defaultValue: "Izoh" }) +
        "</th><th style='text-align:right'>" +
        i18n.t("export_amount", { defaultValue: "Summa" }) +
        "</th><th>" +
        i18n.t("export_who", { defaultValue: "Kim" }) +
        "</th></tr></thead><tbody>" +
        (xRows || "<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>") +
        "</tbody></table>" +
        (qRows
          ? "<h2>" +
            i18n.t("export_active_debts_title", { defaultValue: "Faol qarzlar" }) +
            "</h2><table><thead><tr><th>" +
            i18n.t("export_person", { defaultValue: "Kim" }) +
            "</th><th>" +
            i18n.t("export_type", { defaultValue: "Tur" }) +
            "</th><th style='text-align:right'>" +
            i18n.t("export_amount", { defaultValue: "Summa" }) +
            "</th><th>" +
            i18n.t("export_return_label", { defaultValue: "Qaytarish" }) +
            "</th></tr></thead><tbody>" +
            qRows +
            "</tbody></table>"
          : "") +
        "<div class='qr'><img src='" +
        refQR +
        "' alt='QR'/><div style='text-align:left'><div style='font-size:13px;font-weight:700;color:#374151'>" +
        i18n.t("export_invitation_text", { name: user?.ism || "", defaultValue: `${user?.ism || ""} sizni taklif qiladi` }) +
        "</div><div style='font-size:11px;color:#6b7280;margin-top:3px'>" +
        i18n.t("export_scan_qr_desc", { defaultValue: "QR kodni skanerlab Oila Hisobchi ilovasiga qo'shiling" }) +
        "</div><div style='font-size:9px;color:#9ca3af;margin-top:4px;word-break:break-all'>" +
        refLink +
        "</div></div></div>" +
        "<div class='foot'>" +
        i18n.t("export_footer_note", { defaultValue: "Bu hisobot Oila Hisobchi ilovasi tomonidan yaratilgan" }) +
        " \u00b7 " +
        month +
        "</div>" +
        "<button class='btn' onclick='window.print()'>" +
        i18n.t("export_pdf_button", { defaultValue: "PDF saqlash / Chop etish" }) +
        "</button></body></html>";

      // Use a hidden iframe to bypass popup blockers and WebView constraints
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
        doc.write(H);
        doc.close();

        iframe.contentWindow.focus();
        setTimeout(() => {
          let printInitiated = false;
          try {
            iframe.contentWindow.print();
            printInitiated = true;
          } catch (pe) {
            console.error("Iframe print failed:", pe);
          }

          // Mobil qurilmalar va WebView cheklovlari uchun, chop etish darchasi bilan bir qatorda
          // darhol oflayn HTML hisobot faylini ham yuklab beramiz.
          const okk = downloadFile(H, "OilaHisobot_" + month + ".html", "text/html;charset=utf-8;");

          if (printInitiated) {
            ok$(
              i18n.t("export_print_success_html_fallback", { defaultValue: "Chop etish yuborildi va oflayn HTML hisobot fayli yuklab olindi!" }),
              "ok"
            );
          } else {
            ok$(
              okk
                ? i18n.t("export_html_success_pdf_guide", { defaultValue: "HTML hisobot fayli yuklandi! Uni ochib osongina PDF saqlashingiz mumkin." })
                : i18n.t("error_generic", { defaultValue: "Yuklashda xatolik yuz berdi" }),
              okk ? "ok" : "err"
            );
          }

          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (errClean) {}
          }, 1500);
        }, 300);
      } catch (errIframe) {
        console.error("Iframe printing failed:", errIframe);
        const okk = downloadFile(H, "OilaHisobot_" + month + ".html", "text/html;charset=utf-8;");
        ok$(okk ? i18n.t("export_html_success_pdf_guide", { defaultValue: "HTML hisobot fayli yuklandi!" }) : i18n.t("error_generic", { defaultValue: "Xatolik" }), okk ? "ok" : "err");
      }
    } catch (e) {
      ok$(i18n.t("error_generic", { defaultValue: "Xatolik" }) + ": " + e.message, "err");
    }
  };

  return {
    exportLoading,
    exportExcel,
    exportPDF,
    downloadFile,
  };
}
