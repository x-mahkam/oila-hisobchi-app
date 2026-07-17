// ═══════════════════════════════════════════════════════════
//  NOTIFICATION CENTER (Sprint 3C) — Play Market darajasidagi
//  bildirishnoma markazi. Faqat Component Kit + tokenlar; emoji yo'q.
//  Mavjud notif_<uid> ma'lumotini o'qiydi (sxema o'zgarmaydi).
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useState, useCallback } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { SectionHeader, AppCard, Badge, BottomSheet, EmptyState, PrimaryButton, SecondaryButton, GhostButton } from "../ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, MOTION, PREMIUM } from "../../utils/tokens.js";
import {
  catOf, prioOf, prioRank, catColor, prioColor, catIcon,
  NCAT_LABEL, catAction, catActionLabel, groupNotifs,
} from "../../utils/notify.jsx";

const fmtDate = (iso, lg) => {
  try {
    return new Date(iso).toLocaleString(lg === "ru" ? "ru-RU" : lg === "en" ? "en-US" : "uz-UZ",
      { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch (e) { return ""; }
};

// ── Bitta bildirishnoma qatori (memoizatsiya qilingan) ──
const NotifRow = memo(function NotifRow({ th, lg, n, onOpen }) {
  const cat = catOf(n);
  const c = catColor(cat, th, PREMIUM);
  const prio = prioOf(n);
  const unread = !n.read;
  return (
    <button className="ui-press" onClick={() => onOpen(n)}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
        background: unread ? c + ALPHA.faint : th.sur, border: "1px solid " + (unread ? c + ALPHA.med : th.bor),
        borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s2, display: "flex", gap: SPACE.s3, alignItems: "flex-start", boxSizing: "border-box" }}>
      <span style={{ width: COMP.touchMin - SPACE.s3, height: COMP.touchMin - SPACE.s3, borderRadius: RADIUS.s + 2, background: c + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {catIcon(cat, c)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
          {prio === "critical" && <span style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: prioColor(prio, th), flexShrink: 0 }} />}
          <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{n.title}</span>
          {n._group && <Badge th={th} tone={c}>{n._count}</Badge>}
          {unread && <span style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: c, flexShrink: 0 }} />}
        </span>
        <span style={{ ...TYPE.caption, color: th.t2, marginTop: 2, lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{n.text || n.body}</span>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 + 1 }}>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: c, fontWeight: 700 }}>{NCAT_LABEL[cat] ? (NCAT_LABEL[cat][lg] || NCAT_LABEL[cat].uz) : cat}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>· {fmtDate(n.sana, lg)}</span>
        </span>
      </span>
    </button>
  );
});

export default function NotifCenter({
  notifs = [], th, lg, isKid, onClose,
  onMarkRead, onMarkAll, onClear,
  onConfirmParent, onConfirmKid, setScr,
  setBilimInitialView,
  onApproveTime, onDenyTime,
}) {
  const { t } = useApp();
  const [filter, setFilter] = useState("all");     // all | unread | <cat>
  const [sel, setSel] = useState(null);            // ochilgan bildirishnoma (detail)

  // ── Filtrlangan + saralangan ro'yxat (priority, keyin sana) ──
  const list = useMemo(() => {
    let arr = notifs.slice();
    if (filter === "unread") arr = arr.filter(n => !n.read);
    else if (filter !== "all") arr = arr.filter(n => catOf(n) === filter);
    arr.sort((a, b) => {
      const pr = prioRank(a) - prioRank(b);
      if (pr !== 0) return pr;
      return (Date.parse(b.sana) || 0) - (Date.parse(a.sana) || 0);
    });
    return groupNotifs(arr);
  }, [notifs, filter]);

  const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

  // Filtrlarda mavjud toifalar (bo'sh chip ko'rsatmaslik uchun)
  const chips = useMemo(() => {
    const present = new Set(notifs.map(catOf));
    const order = ["goal", "budget", "garden", "ai", "family", "premium", "debt"];
    return order.filter(c => present.has(c));
  }, [notifs]);

  const openDetail = useCallback((n) => {
    if (!n.read && onMarkRead && !n._group) onMarkRead(n.id);
    setSel(n);
  }, [onMarkRead]);

  const goAction = useCallback(() => {
    if (!sel) return;
    let scr = catAction(catOf(sel));
    if (sel.type === "bilim_proposal" || sel.type === "bilim_approved" || sel.type === "bilim_done" || sel.type === "bilim_offer" || sel.type === "bilim_offer_accepted" || sel.type === "bilim_offer_rejected" || sel.type === "bilim_offer_countered" || (sel.type && sel.type.startsWith("bilim_"))) {
      scr = "bilim";
      if (setBilimInitialView) {
        setBilimInitialView("market");
      }
    }
    setSel(null);
    if (scr && setScr) { setScr(scr); onClose && onClose(); }
  }, [sel, setScr, onClose, setBilimInitialView]);

  const Chip = ({ id, label }) => (
    <button className="ui-press" onClick={() => setFilter(id)}
      style={{ flexShrink: 0, background: filter === id ? th.ac + ALPHA.tint : th.bg, border: "1.5px solid " + (filter === id ? th.ac : th.bor), borderRadius: RADIUS.pill, padding: (SPACE.s1 + 3) + "px " + SPACE.s3 + "px", color: filter === id ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );

  const selCat = sel ? catOf(sel) : null;
  const selColor = sel ? catColor(selCat, th, PREMIUM) : th.ac;
  const needParent = sel && sel.type === "maqsad_confirm" && sel.status === "pending" && !isKid;
  const needKid = sel && sel.type === "maqsad_kid_confirm" && sel.status === "pending" && isKid;
  const needTimeApproval = sel && sel.type === "vaqt_sorov" && sel.status === "pending" && !isKid;
  const isBilimNotif = sel && (sel.type === "bilim_proposal" || sel.type === "bilim_approved" || sel.type === "bilim_done" || sel.type === "bilim_offer" || sel.type === "bilim_offer_accepted" || sel.type === "bilim_offer_rejected" || sel.type === "bilim_offer_countered" || sel.type.startsWith("bilim_"));
  const actLabel = isBilimNotif
    ? t("ncnt_goToKnowledgeMarket")
    : (sel ? catActionLabel(selCat) : null);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(0,0,0,.5)", zIndex: 998, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ background: th.bg, width: "100%", maxWidth: COMP.pageMax, height: "100%", overflowY: "auto", boxShadow: SHADOW.e2, display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: th.sur, borderBottom: "1px solid " + th.bor, padding: SPACE.s4 + "px " + SPACE.s4 + "px " + SPACE.s2 + "px", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3 }}>
            <span style={{ ...TYPE.heading, color: th.t1 }}>{t("ncnt_title")}{unreadCount > 0 ? " · " + unreadCount : ""}</span>
            <button className="ui-press" onClick={onClose} aria-label={t("prem_close")}
              style={{ background: th.surH, border: "none", borderRadius: RADIUS.full, width: SPACE.s8 + 2, height: SPACE.s8 + 2, color: th.t1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke={th.t1} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, WebkitOverflowScrolling: "touch" }}>
            <Chip id="all" label={t("act_all")} />
            <Chip id="unread" label={t("ncnt_unread") + (unreadCount ? " " + unreadCount : "")} />
            {chips.map(c => <Chip key={c} id={c} label={NCAT_LABEL[c][lg] || NCAT_LABEL[c].uz} />)}
          </div>
        </div>

        {/* Amallar */}
        {notifs.length > 0 && (
          <div style={{ display: "flex", gap: SPACE.s2, padding: SPACE.s3 + "px " + SPACE.s4 }}>
            <SecondaryButton th={th} onClick={onMarkAll} style={{ flex: 1, fontSize: TYPE.caption.fontSize }}>{t("ncnt_markAllRead")}</SecondaryButton>
            <SecondaryButton th={th} onClick={onClear} style={{ flex: 1, fontSize: TYPE.caption.fontSize, background: th.rd + ALPHA.soft, color: th.rd, border: "1px solid " + th.rd + ALPHA.strong }}>{t("ncnt_clear")}</SecondaryButton>
          </div>
        )}

        {/* Ro'yxat / Empty */}
        <div style={{ flex: 1, padding: SPACE.s1 + "px " + SPACE.s4 + "px " + SPACE.s8 }}>
          {list.length === 0 ? (
            <div style={{ paddingTop: SPACE.s16 }}>
              <EmptyState th={th}
                icon={<svg width="52" height="52" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 00-6 6v3l-2 3h16l-2-3V9a6 6 0 00-6-6z" stroke={th.t3} strokeWidth="1.3" fill={th.t3} fillOpacity="0.08"/><path d="M10 19a2 2 0 004 0" stroke={th.t3} strokeWidth="1.3" strokeLinecap="round"/></svg>}
                title={filter === "all" ? t("ncnt_noNotifications") : t("ncnt_nothingHere")}
                message={t("ncnt_newWillAppear")} />
            </div>
          ) : (
            list.map(n => <NotifRow key={n.id} th={th} lg={lg} n={n} onOpen={openDetail} />)
          )}
        </div>
      </div>

      {/* Detail — BottomSheet */}
      <div onClick={e => e.stopPropagation()}>
        <BottomSheet th={th} open={!!sel} onClose={() => setSel(null)} title={sel?.title || ""}>
          {sel && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
                <span style={{ width: SPACE.s12, height: SPACE.s12, borderRadius: RADIUS.m, background: selColor + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{catIcon(selCat, selColor)}</span>
                <div style={{ minWidth: 0 }}>
                  <Badge th={th} tone={selColor}>{NCAT_LABEL[selCat] ? (NCAT_LABEL[selCat][lg] || NCAT_LABEL[selCat].uz) : selCat}</Badge>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: SPACE.s1 }}>{fmtDate(sel.sana, lg)}</div>
                </div>
              </div>
              <div style={{ ...TYPE.body, color: th.t1, lineHeight: 1.6, marginBottom: SPACE.s4 }}>{sel.text || sel.body}</div>

              {needParent ? (
                <PrimaryButton th={th} onClick={() => { const n = sel; setSel(null); onConfirmParent && onConfirmParent(n); }} style={{ background: "linear-gradient(135deg," + th.gr + "," + th.gr + ")" }}>
                  {t("ncnt_yesIBoughtIt")}
                </PrimaryButton>
              ) : needKid ? (
                <PrimaryButton th={th} onClick={() => { const n = sel; setSel(null); onConfirmKid && onConfirmKid(n); }} style={{ background: PREMIUM.grad }}>
                  {t("ncnt_dreamCameTrue")}
                </PrimaryButton>
              ) : needTimeApproval ? (
                <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginBottom: SPACE.s2 }}>
                  <PrimaryButton th={th} onClick={() => { const n = sel; setSel(null); onApproveTime && onApproveTime(n); }} style={{ background: "linear-gradient(135deg," + th.gr + "," + th.gr + ")" }}>
                    {t("ncnt_giveExtraTime")}
                  </PrimaryButton>
                  <PrimaryButton th={th} onClick={() => { const n = sel; setSel(null); onDenyTime && onDenyTime(n); }} style={{ background: "linear-gradient(135deg," + th.rd + "," + th.rd + ")" }}>
                    {t("ncnt_no")}
                  </PrimaryButton>
                </div>
              ) : actLabel ? (
                <PrimaryButton th={th} onClick={goAction}>{actLabel}</PrimaryButton>
              ) : null}

              <GhostButton th={th} onClick={() => setSel(null)}>{t("prem_close")}</GhostButton>
            </div>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}
