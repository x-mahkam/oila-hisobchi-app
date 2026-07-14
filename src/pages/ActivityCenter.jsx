// ═══════════════════════════════════════════════════════════
//  FAMILY ACTIVITY CENTER (Sprint 3D)
//  Oiladagi barcha faoliyat tarixi — statistika, filtr, qidiruv,
//  vaqt bo'yicha guruhlash, rich kartalar. Faqat Component Kit +
//  tokenlar; emoji yo'q; mavjud ma'lumotdan hosila (sxema o'zgarmaydi).
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useState, useCallback } from "react";
import { PageHeader, SectionHeader, AppCard, StatCard, UIAvatar, Badge, TextInput, PrimaryButton, EmptyState } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, COMP, PREMIUM } from "../utils/tokens.js";
import {
  deriveActivities, smartGroup, groupByTime, activityStats,
  actIcon, actColor, actScreen, actScreenLabel,
  ACAT_LABEL, relTime, clockTime,
} from "../utils/activity.jsx";

// ── Bitta activity kartasi (memoizatsiya) ──
const ActivityRow = memo(function ActivityRow({ th, lg, a, now, onOpen }) {
  const c = actColor(a.cat, th, PREMIUM);
  return (
    <button className="ui-press" onClick={() => onOpen(a)}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px", marginBottom: SPACE.s2, display: "flex", gap: SPACE.s3, alignItems: "flex-start", boxSizing: "border-box" }}>
      <span style={{ position: "relative", flexShrink: 0 }}>
        <UIAvatar th={th} src={a.photo} name={a.name} size={COMP.touchMin - SPACE.s1} />
        <span style={{ position: "absolute", bottom: -2, right: -2, width: SPACE.s6, height: SPACE.s6, borderRadius: RADIUS.full, background: c + ALPHA.tint, border: "2px solid " + th.sur, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {actIcon(a.cat, c)}
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap" }}>
          <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1 }}>{a.name}</span>
          {a._group && <Badge th={th} tone={c}>{a._count}</Badge>}
        </span>
        <span style={{ display: "block", ...TYPE.caption, color: th.t1, marginTop: 1 }}>{a.action}</span>
        {a.desc ? <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.desc}</span> : null}
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 + 1 }}>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: c, fontWeight: 700 }}>{ACAT_LABEL[a.cat] ? (ACAT_LABEL[a.cat][lg] || ACAT_LABEL[a.cat].uz) : a.cat}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>· {relTime(a.ts, lg, now)}</span>
        </span>
      </span>
    </button>
  );
});

// Toifa -> nav (Family Feed va Center umumiy ishlatadi)
export default function ActivityCenter({
  user, azolar = [], xar = [], dar = [], maq = [], qarzlar = [], vazifalar = [], acts = [],
  th, lg, f, setScr,
}) {
  const uz = lg === "uz";
  const now = Date.now();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);

  // Hosila (barcha faoliyat) — og'ir hisob memoized
  const all = useMemo(
    () => deriveActivities({ xar, dar, maq, qarzlar, vazifalar, azolar, acts, lg }),
    [xar, dar, maq, qarzlar, vazifalar, azolar, acts, lg]
  );

  const stats = useMemo(() => activityStats(all, azolar, lg), [all, azolar, lg]);

  // Mavjud toifalar (bo'sh chip ko'rsatmaslik)
  const chips = useMemo(() => {
    const present = new Set(all.map(a => a.cat));
    return ["budget", "goals", "debt", "tasks", "garden", "family", "ai", "premium"].filter(c => present.has(c));
  }, [all]);

  // Filtr + qidiruv + smart-group (memoized)
  const sections = useMemo(() => {
    let arr = all;
    if (filter !== "all") arr = arr.filter(a => a.cat === filter);
    const term = q.trim().toLowerCase();
    if (term) arr = arr.filter(a =>
      (a.name || "").toLowerCase().includes(term) ||
      (a.action || "").toLowerCase().includes(term) ||
      (a.desc || "").toLowerCase().includes(term) ||
      (ACAT_LABEL[a.cat] && (ACAT_LABEL[a.cat][lg] || ACAT_LABEL[a.cat].uz).toLowerCase().includes(term))
    );
    const grouped = smartGroup(arr, lg);
    return groupByTime(grouped, lg, new Date());
  }, [all, filter, q, lg]);

  const openDetail = useCallback(a => setSel(a), []);
  const goAction = useCallback(() => {
    if (!sel) return;
    const scr = actScreen(sel.cat);
    setSel(null);
    if (scr && setScr) setScr(scr);
  }, [sel, setScr]);

  const Chip = ({ id, label }) => (
    <button className="ui-press" onClick={() => setFilter(id)}
      style={{ flexShrink: 0, background: filter === id ? th.ac + ALPHA.tint : th.bg, border: "1.5px solid " + (filter === id ? th.ac : th.bor), borderRadius: RADIUS.pill, padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", color: filter === id ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );

  const selColor = sel ? actColor(sel.cat, th, PREMIUM) : th.ac;
  const actLabel = sel ? actScreenLabel(sel.cat, lg) : null;
  const empty = sections.length === 0;

  return (
    <div>
      <PageHeader th={th} title={uz ? "Oila faoliyati" : lg === "ru" ? "Активность семьи" : "Family Activity"} onBack={() => setScr("bosh")} />

      {/* Statistika */}
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2 }}>
        <StatCard th={th} value={stats.today} label={uz ? "Bugun" : lg === "ru" ? "Сегодня" : "Today"} tone={th.ac} />
        <StatCard th={th} value={stats.week} label={uz ? "Hafta" : lg === "ru" ? "Неделя" : "Week"} tone={th.gr} />
        <StatCard th={th} value={stats.month} label={uz ? "Oy" : lg === "ru" ? "Месяц" : "Month"} tone={th.am} />
      </div>

      {/* Top contributor */}
      {stats.top && (
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
          <UIAvatar th={th} src={stats.top.photo} name={stats.top.name} size={SPACE.s12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Eng faol a'zo" : lg === "ru" ? "Самый активный" : "Top contributor"}</div>
            <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stats.top.name}</div>
          </div>
          <Badge th={th} type="status" tone={th.ac}>{stats.top.count} {uz ? "amal" : lg === "ru" ? "действ." : "actions"}</Badge>
        </AppCard>
      )}

      {/* Qidiruv */}
      <TextInput th={th} value={q} onChange={setQ} placeholder={uz ? "Ism, amal yoki toifa bo'yicha qidirish..." : lg === "ru" ? "Поиск..." : "Search name, action, category..."} />

      {/* Filtr chips */}
      <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, marginBottom: SPACE.s2, WebkitOverflowScrolling: "touch" }}>
        <Chip id="all" label={uz ? "Hammasi" : lg === "ru" ? "Все" : "All"} />
        {chips.map(c => <Chip key={c} id={c} label={ACAT_LABEL[c][lg] || ACAT_LABEL[c].uz} />)}
      </div>

      {/* Timeline yoki Empty */}
      {empty ? (
        <div style={{ paddingTop: SPACE.s8 }}>
          <EmptyState th={th}
            icon={<svg width="52" height="52" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={th.t3} strokeWidth="1.3" fill={th.t3} fillOpacity="0.06"/><path d="M12 7v5l3 3" stroke={th.t3} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title={q || filter !== "all" ? (uz ? "Hech narsa topilmadi" : lg === "ru" ? "Ничего не найдено" : "Nothing found") : (uz ? "Faoliyat yo'q" : lg === "ru" ? "Нет активности" : "No activity yet")}
            message={uz ? "Oila faoliyati shu yerda vaqt bo'yicha ko'rinadi." : lg === "ru" ? "Активность семьи появится здесь." : "Family activity will appear here over time."} />
        </div>
      ) : (
        sections.map(sec => (
          <div key={sec.key}>
            <SectionHeader th={th} right={<span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>{sec.items.length}</span>}>{sec.title}</SectionHeader>
            {sec.items.map(a => <ActivityRow key={a.id} th={th} lg={lg} a={a} now={now} onOpen={openDetail} />)}
          </div>
        ))
      )}

      {/* Detail — BottomSheet (rich card) */}
      {sel && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(0,0,0,.45)", zIndex: 997, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setSel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: th.bg, width: "100%", maxWidth: COMP.pageMax, borderTopLeftRadius: RADIUS.l, borderTopRightRadius: RADIUS.l, padding: SPACE.s4, boxSizing: "border-box" }}>
            <div style={{ width: SPACE.s8 + SPACE.s2, height: 4, borderRadius: RADIUS.full, background: th.bor, margin: "0 auto " + SPACE.s4 }} />
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3 }}>
              <span style={{ position: "relative", flexShrink: 0 }}>
                <UIAvatar th={th} src={sel.photo} name={sel.name} size={SPACE.s12 + SPACE.s2} />
                <span style={{ position: "absolute", bottom: -2, right: -2, width: SPACE.s6, height: SPACE.s6, borderRadius: RADIUS.full, background: selColor + ALPHA.tint, border: "2px solid " + th.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{actIcon(sel.cat, selColor)}</span>
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...TYPE.subtitle, color: th.t1 }}>{sel.name}</div>
                <div style={{ ...TYPE.caption, color: th.t2 }}>{sel.action}</div>
              </div>
            </div>
            {sel.desc ? <div style={{ ...TYPE.body, color: th.t1, marginBottom: SPACE.s2 }}>{sel.desc}</div> : null}
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginBottom: SPACE.s4 }}>
              {relTime(sel.ts, lg, now)} · {clockTime(sel.ts, lg)}
            </div>
            {actLabel && <PrimaryButton th={th} onClick={goAction}>{actLabel}</PrimaryButton>}
            <button className="ui-press" onClick={() => setSel(null)} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: TYPE.caption.fontSize + 1 }}>{uz ? "Yopish" : lg === "ru" ? "Закрыть" : "Close"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FAMILY FEED — Dashboard widgeti (oxirgi 5 activity)
// ══════════════════════════════════════════════════════════════
export const FamilyFeed = memo(function FamilyFeed({
  user, azolar = [], xar = [], dar = [], maq = [], qarzlar = [], vazifalar = [], acts = [],
  th, lg, onOpen,
}) {
  const uz = lg === "uz";
  const now = Date.now();
  const recent = useMemo(() => {
    const all = deriveActivities({ xar, dar, maq, qarzlar, vazifalar, azolar, acts, lg });
    return smartGroup(all, lg).slice(0, 5);
  }, [xar, dar, maq, qarzlar, vazifalar, azolar, acts, lg]);

  if (!recent.length) return null;

  return (
    <>
      <SectionHeader th={th} right={
        <button className="ui-press" onClick={onOpen} style={{ background: "transparent", border: "none", color: th.ac, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit" }}>
          {uz ? "Hammasi" : lg === "ru" ? "Все" : "All"}
        </button>
      }>{uz ? "Oila faoliyati" : lg === "ru" ? "Активность семьи" : "Family activity"}</SectionHeader>
      <AppCard th={th} pad={0}>
        {recent.map((a, i) => {
          const c = actColor(a.cat, th, PREMIUM);
          return (
            <button key={a.id} className="ui-press" onClick={onOpen}
              style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: "transparent", border: "none", borderBottom: i < recent.length - 1 ? "1px solid " + th.bor : "none", padding: SPACE.s3 + "px " + SPACE.s4 + "px", display: "flex", alignItems: "center", gap: SPACE.s3, boxSizing: "border-box" }}>
              <span style={{ position: "relative", flexShrink: 0 }}>
                <UIAvatar th={th} src={a.photo} name={a.name} size={SPACE.s8 + SPACE.s2} />
                <span style={{ position: "absolute", bottom: -3, right: -3, width: SPACE.s4 + 4, height: SPACE.s4 + 4, borderRadius: RADIUS.full, background: c + ALPHA.tint, border: "2px solid " + th.sur, display: "flex", alignItems: "center", justifyContent: "center" }}>{actIcon(a.cat, c)}</span>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", ...TYPE.caption, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <b style={{ fontWeight: 700 }}>{a.name}</b> · {a.action}{a._group ? " (" + a._count + ")" : ""}
                </span>
                <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1 }}>{relTime(a.ts, lg, now)}</span>
              </span>
            </button>
          );
        })}
      </AppCard>
    </>
  );
});
