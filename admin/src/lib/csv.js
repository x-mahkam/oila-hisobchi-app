// ═══════════════════════════════════════════════════════════
//  CSV eksport yordamchisi.
//  UTF-8 BOM bilan — Excel o'zbekcha/ruscha matnni to'g'ri ochadi.
//  columns: [{ key, title, value?: (row) => string }]
// ═══════════════════════════════════════════════════════════

function esc(v) {
  const s = v == null ? "" : String(v);
  // Vergul, qo'shtirnoq yoki yangi qator bo'lsa — qo'shtirnoqqa o'raymiz
  if (/[",\n\r;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => esc(c.title)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => esc(c.value ? c.value(r) : r[c.key])).join(",")
  );
  const csv = "\uFEFF" + [header, ...lines].join("\r\n"); // BOM — Excel uchun
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function stamp() {
  return new Date().toISOString().slice(0, 10);
}
