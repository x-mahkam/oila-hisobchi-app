import { useEffect, useRef, useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { DataTable, Badge, ConfirmDialog, useToast } from "../../shared/ui.jsx";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleString("uz"); } catch { return String(ms); }
}

const AUDIENCES = [
  { id: "all", label: "👥 Barcha foydalanuvchilar" },
  { id: "premium", label: "⭐ Faqat premium oilalar" },
  { id: "lang", label: "🌐 Til bo'yicha" },
  { id: "platform", label: "📱 Platforma bo'yicha" },
];
const LANGS = ["uz", "ru", "en", "kk", "ky", "tg", "qr"];
const PLATFORMS = [{ id: "android", label: "Android" }, { id: "web", label: "Web" }];

const STATUS_BADGE = {
  sent: ["Yuborildi", "on"],
  scheduled: ["Rejalashtirilgan", "warn"],
  cancelled: ["Bekor qilingan", "off"],
  error: ["Xato", "warn"],
};

export default function PushPage() {
  const toast = useToast();
  const listQ = useQuery("adminPush", { op: "list" });

  // Forma
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audType, setAudType] = useState("all");
  const [audLang, setAudLang] = useState("uz");
  const [audPlatform, setAudPlatform] = useState("android");
  const [when, setWhen] = useState("now"); // now | later
  const [whenAt, setWhenAt] = useState("");

  // Auditoriya hajmi (jonli sanash)
  const [audCount, setAudCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const countTimer = useRef(null);

  const audience = () => ({
    type: audType,
    lang: audType === "lang" ? audLang : null,
    platform: audType === "platform" ? audPlatform : null,
  });

  useEffect(() => {
    // Auditoriya o'zgarganda hajmni qayta sanaymiz (biroz kechiktirib)
    setAudCount(null);
    setCounting(true);
    clearTimeout(countTimer.current);
    countTimer.current = setTimeout(async () => {
      try {
        setAudCount(await call("adminPush", { op: "audience", audience: audience() }));
      } catch { setAudCount(null); }
      finally { setCounting(false); }
    }, 400);
    return () => clearTimeout(countTimer.current);
  }, [audType, audLang, audPlatform]); // eslint-disable-line

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const doSend = async () => {
    setSending(true);
    try {
      const payload = { op: "send", title, body, audience: audience() };
      if (when === "later" && whenAt) {
        payload.sendAtMs = new Date(whenAt).getTime();
      }
      const res = await call("adminPush", payload);
      if (res.scheduled) {
        toast("⏰ Rejalashtirildi: " + fmtT(res.sendAt), "ok");
      } else {
        toast(`✅ Yuborildi: ${res.sent} ta qurilma (${res.failed} xato)`, "ok");
      }
      setTitle(""); setBody(""); setConfirmOpen(false);
      listQ.reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setSending(false); }
  };

  const cancelCampaign = async (id) => {
    try {
      await call("adminPush", { op: "cancel", id });
      toast("Bekor qilindi", "ok");
      listQ.reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
  };

  const canSend = title.trim() && body.trim() && (when === "now" || whenAt);

  return (
    <div>
      {/* ── Yuborish formasi ── */}
      <div className="panel">
        <h2>🔔 Push xabar yuborish</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <input className="input" placeholder="Sarlavha (masalan: Yangi funksiya!)" maxLength={120}
            value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="textarea" placeholder="Xabar matni…" maxLength={500} rows={3}
            value={body} onChange={(e) => setBody(e.target.value)} />

          <div className="toolbar" style={{ marginBottom: 0 }}>
            <select className="select" style={{ width: 230 }} value={audType} onChange={(e) => setAudType(e.target.value)}>
              {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            {audType === "lang" && (
              <select className="select" style={{ width: 100 }} value={audLang} onChange={(e) => setAudLang(e.target.value)}>
                {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            )}
            {audType === "platform" && (
              <select className="select" style={{ width: 130 }} value={audPlatform} onChange={(e) => setAudPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            )}
            <Badge tone={audCount?.tokenCount ? "on" : "off"}>
              {counting ? "sanalmoqda…"
                : audCount ? `${audCount.tokenCount} qurilma · ${audCount.usersWithTokens} foydalanuvchi`
                : "auditoriya noma'lum"}
            </Badge>
          </div>

          <div className="toolbar" style={{ marginBottom: 0 }}>
            <select className="select" style={{ width: 190 }} value={when} onChange={(e) => setWhen(e.target.value)}>
              <option value="now">🚀 Darhol yuborish</option>
              <option value="later">⏰ Rejalashtirish</option>
            </select>
            {when === "later" && (
              <input className="input" type="datetime-local" style={{ width: 220 }}
                value={whenAt} onChange={(e) => setWhenAt(e.target.value)} />
            )}
            <span style={{ flex: 1 }} />
            <button className="btn green" disabled={!canSend} onClick={() => setConfirmOpen(true)}>
              {when === "later" ? "⏰ Rejalashtirish" : "🔔 Yuborish"}
            </button>
          </div>

          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            Til/platforma ma'lumoti foydalanuvchining oxirgi faolligidan olinadi (act). Rejalashtirilgan
            xabarlar har 10 daqiqada tekshirilib yuboriladi. Push faqat Android ilovasini o'rnatib,
            ruxsat bergan foydalanuvchilarga yetadi.
          </div>
        </div>
      </div>

      {/* ── Tarix ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Kampaniyalar tarixi</h2>
        <DataTable
          keyFn={(r) => r.id}
          empty="Hali push yuborilmagan"
          columns={[
            { key: "t", title: "Sana", render: (r) => fmtT(r.status === "scheduled" ? r.sendAt : (r.sentAt || r.t)) },
            { key: "title", title: "Sarlavha", render: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
            {
              key: "aud", title: "Auditoriya",
              render: (r) => {
                const a = r.audience || {};
                return a.type === "lang" ? "Til: " + (a.lang || "").toUpperCase()
                  : a.type === "platform" ? "Platforma: " + a.platform
                  : a.type === "premium" ? "Premium" : "Barcha";
              },
            },
            {
              key: "res", title: "Natija",
              render: (r) => r.status === "sent" ? `${r.sent ?? 0} ✓ / ${r.failed ?? 0} ✗` : "—",
            },
            {
              key: "status", title: "Holat",
              render: (r) => {
                const [lb, tone] = STATUS_BADGE[r.status] || [r.status, "off"];
                return <Badge tone={tone}>{lb}</Badge>;
              },
            },
            {
              key: "act", title: "",
              render: (r) => r.status === "scheduled"
                ? <button className="btn red sm" onClick={() => cancelCampaign(r.id)}>Bekor</button>
                : null,
            },
          ]}
          rows={listQ.data?.campaigns || []}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title={when === "later" ? "Rejalashtirishni tasdiqlang" : "Yuborishni tasdiqlang"}
        text={
          `"${title}" — ${audCount ? audCount.tokenCount + " ta qurilmaga" : "auditoriyaga"} ` +
          (when === "later" && whenAt ? fmtT(new Date(whenAt).getTime()) + " da yuboriladi." : "DARHOL yuboriladi.") +
          " Yuborilgan xabarni qaytarib bo'lmaydi!"
        }
        confirmLabel={when === "later" ? "Ha, rejalashtir" : "Ha, yubor"}
        busy={sending}
        onConfirm={doSend}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
