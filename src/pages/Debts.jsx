import { useMemo, memo } from "react";
import { MoneyInput } from "../components/common/index.jsx";
import {
  PageHeader, SectionHeader, AppCard, StatCard, Badge, EmptyState,
  PrimaryButton, GhostButton, DangerButton, IconButton, UIAvatar, Switch,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";

// ── 7 tilni to'liq qo'llab-quvvatlaydigan tarjima helper (modul darajasida,
//    chunki bu faylda bir nechta alohida komponent funksiyalari `lg`ni
//    o'z prop'i sifatida oladi) ──
const L = (lg, uzVal, ruVal, enVal, kkVal, kyVal, tgVal, qrVal) => {
  const map = { uz: uzVal, ru: ruVal, en: enVal, kk: kkVal, ky: kyVal, tg: tgVal, qr: qrVal };
  return map[lg] !== undefined ? map[lg] : uzVal;
};

// ── Debts-lokal outline SVG ikonkalar (emoji o'rniga, DS 6) ──
const QIco = {
  coinIn: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="9" r="5.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M8 6.5v5M6.3 7.8c0-.7.7-1.1 1.7-1.1s1.7.4 1.7 1c0 1.6-3.4 1.3-3.4 2.9 0 .6.7 1 1.7 1s1.7-.4 1.7-1.1" stroke={c} strokeWidth="1" strokeLinecap="round"/><path d="M11 1.5l2.5 2.5M13.5 1.5v2.5h-2.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  coinOut: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="9" r="5.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M8 6.5v5M6.3 7.8c0-.7.7-1.1 1.7-1.1s1.7.4 1.7 1c0 1.6-3.4 1.3-3.4 2.9 0 .6.7 1 1.7 1s1.7-.4 1.7-1.1" stroke={c} strokeWidth="1" strokeLinecap="round"/><path d="M13.5 4L11 1.5M11 4V1.5h2.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  person: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={c} strokeWidth="1.3"/><path d="M2.5 14c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  check: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell: (c, s=13) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  doc: (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5.5L13 5v9.5H4V1.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M9.5 1.5V5H13M6 8.5h5M6 11h3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  family: (c, s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

// Qarz status badge'lari — kit Badge orqali
const DebtBadges = memo(function DebtBadges({ q, th, lg }) {
  return (
    <>
      {q.payStatus === "pending" && <Badge th={th} type="warning">{L(lg, "Qaytarish kutilmoqda", "Ожидается возврат", "Return pending", "Қайтару күтілуде", "Кайтаруу күтүлүүдө", "Баргардонидан интизор аст", "Qaytarıw kútilmekte")}</Badge>}
      {q.linked && q.linkStatus === "pending" && !q.payStatus && <Badge th={th} type="warning">{L(lg, "Kutilmoqda", "Ожидается", "Pending", "Күтілуде", "Күтүлүүдө", "Интизор аст", "Kútilmekte")}</Badge>}
      {q.linked && q.linkStatus === "accepted" && !q.payStatus && <Badge th={th} type="success" icon={QIco.check(th.gr, 10)}>{L(lg, "Tasdiqlangan", "Подтверждено", "Confirmed", "Расталды", "Ырасталды", "Тасдиқ шуд", "Tastıyıqlandı")}</Badge>}
      {q.linked && q.linkStatus === "rejected" && <Badge th={th} type="danger">{L(lg, "Rad etilgan", "Отклонено", "Rejected", "Қабылданбады", "Четке кагылды", "Рад карда шуд", "Biykar etildi")}</Badge>}
    </>
  );
});

// ═══ Faol qarz kartasi — React.memo (4-band) ═══
const DebtCard = memo(function DebtCard({ q, th, f, lg, user, markQarzPaid, sendQarzReminder, setPartialQarz, setPartialSum, generateTilxat, delQarz }) {
  const isLent = q.tur === "bergan";
  const color = isLent ? th.gr : th.rd;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = q.qaytSana && q.qaytSana < today;
  return (
    <AppCard th={th} style={{ padding: (SPACE.s3 + 1) + "px " + (SPACE.s4 - 1) + "px", border: "1px solid " + (overdue ? th.rd + ALPHA.strong : th.bor) }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACE.s2 + 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 2, background: color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(color) : QIco.coinOut(color)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.subtitle, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap" }}>
              {q.kim}
              <DebtBadges q={q} th={th} lg={lg} />
            </div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{q.sana}{q.qaytSana ? " → " + q.qaytSana : ""}</div>
            {q.izoh && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 1, fontStyle: "italic" }}>{q.izoh}</div>}
            {overdue && <div style={{ marginTop: SPACE.s1 }}><Badge th={th} type="danger">{L(lg, "Muddati o'tgan!", "Просрочено!", "Overdue!", "Мерзімі өткен!", "Мөөнөтү өткөн!", "Мӯҳлат гузашт!", "Múddeti ótken!")}</Badge></div>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 1, color, fontVariantNumeric: "tabular-nums" }}>{f(q.summa, true)}</div>
          {q.paidPart > 0
            ? <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: th.gr, marginTop: 2, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{L(lg, "To'langan: ", "Оплачено: ", "Paid: ", "Төленді: ", "Төлөндү: ", "Пардохта шуд: ", "Tólendi: ")}{f(q.paidPart, true)}</div>
            : <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{isLent ? L(lg, "ular qarzli", "они должны", "they owe", "олар қарыз", "алар карыз", "онҳо қарздор", "olar qarız") : L(lg, "men qarzman", "я должен(на)", "I owe", "мен қарызмын", "мен карыздармын", "ман қарздорам", "men qarızban")}</div>}
        </div>
      </div>

      {/* Qisman to'lovlar vaqt chizig'i (repayment timeline) */}
      {((q.timeline && q.timeline.length > 0) || q.paidPart > 0) && (
        <div style={{ marginTop: SPACE.s2, marginBottom: SPACE.s3, paddingTop: SPACE.s3, borderTop: "1px dashed " + th.bor }}>
          <div style={{ ...TYPE.tiny, fontWeight: 700, color: th.t2, marginBottom: SPACE.s2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {L(lg, "⏳ To'lovlar tarixi", "⏳ История платежей", "⏳ Repayment Timeline", "⏳ Төлемдер тарихы", "⏳ Төлөмдөр тарыхы", "⏳ Таърихи пардохтҳо", "⏳ Tólemler tarıyxı")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, position: "relative", paddingLeft: 14 }}>
            {/* Timeline vertical line */}
            <div style={{ position: "absolute", left: 3, top: 4, bottom: 4, width: 1.5, background: th.gr + ALPHA.strong }} />
            
            {q.timeline && q.timeline.map((p, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ position: "absolute", left: -14, top: 5, width: 7, height: 7, borderRadius: "50%", background: th.gr, boxShadow: "0 0 4px " + th.gr }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 600, color: th.t1, fontSize: TYPE.tiny.fontSize + 1 }}>
                    {p.ism}
                  </span>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, fontSize: 10 }}>
                    {p.sana}
                  </span>
                </div>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, fontVariantNumeric: "tabular-nums" }}>
                  +{f(p.summa, true)}
                </span>
              </div>
            ))}
            {/* Fallback virtual item if there is paidPart but timeline is empty (legacy data) */}
            {(!q.timeline || q.timeline.length === 0) && q.paidPart > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ position: "absolute", left: -14, top: 5, width: 7, height: 7, borderRadius: "50%", background: th.gr, boxShadow: "0 0 4px " + th.gr }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 600, color: th.t1, fontSize: TYPE.tiny.fontSize + 1 }}>
                    {L(lg, "Qisman to'lov", "Частичная оплата", "Partial repayment", "Ішінара төлем", "Жарым-жартылай төлөм", "Пардохти қисман", "Bólek tólem")}
                  </span>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, fontSize: 10 }}>
                    {q.sana}
                  </span>
                </div>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, fontVariantNumeric: "tabular-nums" }}>
                  +{f(q.paidPart, true)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: SPACE.s2 }}>
        {q.payStatus === "pending"
          ? <div style={{ flex: 1, background: th.am + ALPHA.soft, border: "1px solid " + th.am + ALPHA.med, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px 0", color: th.am, fontWeight: 700, fontSize: TYPE.caption.fontSize, textAlign: "center" }}>{q.payBy === user.id ? L(lg, "Tasdiq kutilmoqda...", "Ожидается подтверждение...", "Awaiting confirmation...", "Растау күтілуде...", "Ырастоо күтүлүүдө...", "Тасдиқ интизор аст...", "Tastıyıqlaw kútilmekte...") : L(lg, "Qaytarish so'rovi keldi", "Пришёл запрос на возврат", "Return requested", "Қайтару сұрауы келді", "Кайтаруу суроосу келди", "Дархости баргардонидан омад", "Qaytarıw soraw keldi")}</div>
          : <button className="ui-press" onClick={() => markQarzPaid(q.id)} style={{ flex: 1, background: color + ALPHA.tint, border: "1px solid " + color + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px 0", color, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit" }}>{isLent ? L(lg, "Qaytarib oldim", "Забрал(а) обратно", "Got it back", "Қайтарып алдым", "Кайра алдым", "Бозпас гирифтам", "Qaytarıp aldım") : L(lg, "Qaytardim", "Вернул(а)", "Paid back", "Қайтардым", "Кайтардым", "Баргардондам", "Qaytardım")}</button>}
        {q.payStatus !== "pending" && isLent && (
          <button className="ui-press" onClick={() => sendQarzReminder(q)} style={{ background: (overdue ? th.rd : th.am) + ALPHA.soft, border: "1px solid " + (overdue ? th.rd : th.am) + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", color: overdue ? th.rd : th.am, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, display: "flex", alignItems: "center", gap: SPACE.s1, fontFamily: "inherit" }}>
            {QIco.bell(overdue ? th.rd : th.am)}{L(lg, "Eslatish", "Напомнить", "Remind", "Еске салу", "Эскертүү", "Ёдоварӣ", "Eske salıw")}
          </button>
        )}
        {q.payStatus !== "pending" && (
          <button className="ui-press" onClick={() => { setPartialQarz(q); setPartialSum(""); }} style={{ background: th.ac + ALPHA.soft, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + SPACE.s3 + "px", color: th.ac, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, fontFamily: "inherit" }}>{L(lg, "Qisman", "Частично", "Partial", "Ішінара", "Жарым-жартылай", "Қисман", "Bólek")}</button>
        )}
        {q.linked && q.linkStatus === "accepted" && q.payStatus !== "pending" && (
          <button className="ui-press" onClick={() => generateTilxat(q)} title={L(lg, "Tilxat (PDF)", "Расписка (PDF)", "Receipt (PDF)", "Түбіртек (PDF)", "Түбөлтек (PDF)", "Расид (PDF)", "Tilxat (PDF)")} style={{ background: th.ac2 + ALPHA.soft, border: "1px solid " + th.ac2 + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", color: th.ac2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, display: "flex", alignItems: "center", gap: SPACE.s1, fontFamily: "inherit" }}>
            {QIco.doc(th.ac2)}{L(lg, "Tilxat", "Расписка", "Receipt", "Түбіртек", "Түбөлтек", "Расид", "Tilxat")}
          </button>
        )}
        {!(q.linked && q.linkStatus === "accepted") && (
          <button className="ui-press" onClick={() => delQarz(q.id)} aria-label="O'chirish" style={{ width: SPACE.s8 + SPACE.s1 + 2, background: th.rd + ALPHA.soft, border: "1px solid " + th.rd + ALPHA.med, borderRadius: RADIUS.s - 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.trash(th.rd)}</button>
        )}
      </div>
    </AppCard>
  );
});

// ═══ Qaytarilgan qarz qatori — React.memo, Paid = yashil Badge ═══
const PaidDebtRow = memo(function PaidDebtRow({ q, th, f, lg, delQarz }) {
  const isLent = q.tur === "bergan";
  const dc = isLent ? th.gr : th.rd;
  return (
    <AppCard th={th} style={{ padding: (SPACE.s2 + 3) + "px " + (SPACE.s4 - 1) + "px", marginBottom: SPACE.s2, borderLeft: "3px solid " + dc + ALPHA.strong, opacity: 0.92 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + 2, height: SPACE.s8 + 2, borderRadius: RADIUS.s - 1, background: dc + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(dc, 17) : QIco.coinOut(dc, 17)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.kim}</div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>
              <Badge th={th} type="success" icon={QIco.check(th.gr, 10)} style={{ fontSize: TYPE.tiny.fontSize }}>{isLent ? L(lg, "Qaytarib oldim", "Забрал(а) обратно", "Got back", "Қайтарып алдым", "Кайра алдым", "Бозпас гирифтам", "Qaytarıp aldım") : L(lg, "Qaytardim", "Вернул(а)", "Paid back", "Қайтардым", "Кайтардым", "Баргардондам", "Qaytardım")}</Badge>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{q.paidSana}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, flexShrink: 0 }}>
          <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 800, color: dc, fontVariantNumeric: "tabular-nums" }}>{isLent ? "+" : "−"}{f(q.summa, true)}</span>
          <button className="ui-press" onClick={() => delQarz(q.id)} aria-label="O'chirish" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}>{Ico.trash(th.t2)}</button>
        </div>
      </div>
    </AppCard>
  );
});

// ═══ Oila a'zosi qarzi kartasi — React.memo ═══
const MemberDebtCard = memo(function MemberDebtCard({ q, th, f, lg, owner, ownerName }) {
  const isLent = q.tur === "bergan";
  const color = isLent ? th.gr : th.rd;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = q.qaytSana && q.qaytSana < today;
  return (
    <AppCard th={th} style={{ padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s2 + 1, borderLeft: "3px solid " + th.ac }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2, paddingBottom: SPACE.s2, borderBottom: "1px solid " + th.bor }}>
        <UIAvatar th={th} src={owner?.photo} name={owner?.ism || q.kim} size={SPACE.s6 + 2} />
        <span style={{ ...TYPE.caption, fontWeight: 700, color: th.ac }}>{ownerName}</span>
        <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{L(lg, "ning qarzi", "— долг", "'s debt", "қарызы", "карызы", "— қарзи", "qarızı")}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + SPACE.s1 + 2, height: SPACE.s8 + SPACE.s1 + 2, borderRadius: RADIUS.s + 1, background: color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(color, 18) : QIco.coinOut(color, 18)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{q.kim}</div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{q.sana}{q.qaytSana ? " → " + q.qaytSana : ""}</div>
            {q.izoh && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, fontStyle: "italic" }}>{q.izoh}</div>}
            {overdue && <div style={{ marginTop: SPACE.s1 }}><Badge th={th} type="danger">{L(lg, "Muddati o'tgan", "Просрочено", "Overdue", "Мерзімі өткен", "Мөөнөтү өткөн", "Мӯҳлат гузашт", "Múddeti ótken")}</Badge></div>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...TYPE.subtitle, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{f(q.summa, true)}</div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{isLent ? L(lg, "ular qarzli", "они должны", "they owe", "олар қарыз", "алар карыз", "онҳо қарздор", "olar qarız") : L(lg, "qarzdor", "должен(на)", "owes", "қарыздар", "карыздар", "қарздор", "qarızdar")}</div>
        </div>
      </div>
    </AppCard>
  );
});

export default function DebtsPage({
  user, azolar, qarzlar, qarzReqs, isBosh,
  th, t, f, lg,
  showAddQarz, setShowAddQarz,
  qarzTur, setQarzTur, qarzKim, setQarzKim,
  qarzSum, setQarzSum, qarzIzoh, setQarzIzoh,
  qarzSana, setQarzSana, qarzQaytSana, setQarzQaytSana,
  qarzTel, setQarzTel, qarzLinked, setQarzLinked,
  partialQarz, setPartialQarz, partialSum, setPartialSum,
  addQarz, sendQarzRequest, acceptQarzReq, rejectQarzReq,
  markQarzPaid, delQarz, sendQarzReminder,
  acceptPayReq, rejectPayReq, refreshQarzReqs,
  generateTilxat,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const gN2 = uid => azolar.find(a => a.id === uid)?.ism || "?";

  const myQ = qarzlar.filter(q => !q.uid || q.uid === user.id);
  const memberQ = isBosh ? qarzlar.filter(q => q.uid && q.uid !== user.id) : [];
  const active = myQ.filter(q => !q.paid);
  const done = myQ.filter(q => q.paid);
  const memberActive = memberQ.filter(q => !q.paid);
  const olganSum = active.filter(q => q.tur === "bergan").reduce((s, q) => s + Number(q.summa || 0), 0);
  const berganSum = active.filter(q => q.tur === "olgan").reduce((s, q) => s + Number(q.summa || 0), 0);

  return (
    <div>
      <PageHeader th={th} title={L(lg, "Qarzlar", "Долги", "Debts", "Қарыздар", "Карыздар", "Қарзҳо", "Qarızlar")} style={{ marginBottom: SPACE.s4 }}
        right={
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <IconButton th={th} label={L(lg, "Yangilash", "Обновить", "Refresh", "Жаңарту", "Жаңылоо", "Навсозӣ", "Jańalaw")} icon={Ico.repeat(th.t2)} onClick={refreshQarzReqs} style={{ background: th.surH, border: "1px solid " + th.bor }} />
            <IconButton th={th} label={L(lg, "Qo'shish", "Добавить", "Add", "Қосу", "Кошуу", "Илова кардан", "Qosıw")} icon={showAddQarz ? <span style={{ ...TYPE.subtitle, color: "#fff" }}>×</span> : Ico.add("#fff")} onClick={() => setShowAddQarz(v => !v)} style={{ background: th.ac, boxShadow: SHADOW.e1(th.ac) }} />
          </div>
        } />

      {showAddQarz && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.ac, marginBottom: SPACE.s3 }}>{L(lg, "Yangi qarz", "Новый долг", "New debt", "Жаңа қарыз", "Жаңы карыз", "Қарзи нав", "Jańa qarız")}</div>
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <button className="ui-press" onClick={() => setQarzTur("olgan")} style={{ ...STY.tb(qarzTur === "olgan"), flex: 1, fontFamily: "inherit" }}>{L(lg, "Oldim", "Я взял(а)", "I borrowed", "Мен алдым", "Мен алдым", "Ман гирифтам", "Men aldım")}</button>
            <button className="ui-press" onClick={() => setQarzTur("bergan")} style={{ ...STY.tb(qarzTur === "bergan"), flex: 1, fontFamily: "inherit" }}>{L(lg, "Berdim", "Я дал(а)", "I lent", "Мен бердім", "Мен бердим", "Ман додам", "Men berdim")}</button>
          </div>
          <div style={{ background: (qarzTur === "olgan" ? th.rd : th.gr) + ALPHA.soft, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 1) + "px " + (SPACE.s3 + 1) + "px", marginBottom: SPACE.s3, ...TYPE.caption, color: qarzTur === "olgan" ? th.rd : th.gr, fontWeight: 600 }}>
            {qarzTur === "olgan"
              ? L(lg, "Kimdir menga pul berdi — men qarzdorman", "Кто-то дал мне денег — я должен(на)", "Someone lent me money — I owe", "Біреу маған ақша берді — мен қарыздармын", "Бирөө мага акча берди — мен карыздармын", "Касе ба ман пул дод — ман қарздорам", "Birew maǵan aqsha berdi — men qarızban")
              : L(lg, "Men birovga pul berdim — ular qarzdor", "Я дал(а) кому-то денег — они должны", "I lent money — they owe me", "Мен біреуге ақша бердім — олар қарыздар", "Мен бирөөгө акча бердим — алар карыздар", "Ман ба каси пул додам — онҳо қарздоранд", "Men birewge aqsha berdim — olar qarızdar")}
          </div>
          <label style={STY.lb}>{L(lg, "Ism (kim?)", "Имя (кто?)", "Person name", "Аты (кім?)", "Аты (ким?)", "Ном (кӣ?)", "Atı (kim?)")}</label>
          <input style={STY.ip} value={qarzKim} onChange={e => setQarzKim(e.target.value)} placeholder={L(lg, "Masalan: Akbar aka", "Например: Иван", "e.g. John", "Мысалы: Асан аға", "Мисалы: Асан байке", "Масалан: Акбар", "Máselen: Akbar aǵa")} />
          <label style={STY.lb}>{L(lg, "Summa (so'm)", "Сумма (сум)", "Amount", "Сома (сум)", "Сумма (сум)", "Маблағ (сум)", "Sóm muǵdarı")}</label>
          <MoneyInput style={{ ...STY.ip, ...TYPE.title, fontSize: TYPE.title.fontSize + 2, textAlign: "center" }} value={qarzSum} onChange={setQarzSum} placeholder="0" th={th} />
          <label style={STY.lb}>{L(lg, "Sana", "Дата", "Date", "Күні", "Күнү", "Сана", "Sáne")}</label>
          <input type="date" style={STY.ip} value={qarzSana} onChange={e => setQarzSana(e.target.value)} />
          <label style={STY.lb}>{L(lg, "Qaytarish sanasi", "Дата возврата", "Return date", "Қайтару күні", "Кайтаруу күнү", "Санаи баргардонидан", "Qaytarıw sánesi")}</label>
          <input type="date" style={STY.ip} value={qarzQaytSana} onChange={e => setQarzQaytSana(e.target.value)} />
          <label style={STY.lb}>{L(lg, "Izoh (ixtiyoriy)", "Заметка (необязательно)", "Note (optional)", "Ескерту (міндетті емес)", "Эскертүү (милдеттүү эмес)", "Тавзеҳ (ихтиёрӣ)", "Eskertiw (mındetli emes)")}</label>
          <input style={STY.ip} value={qarzIzoh} onChange={e => setQarzIzoh(e.target.value)} placeholder="..." />
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: qarzLinked ? SPACE.s3 : SPACE.s3 + 2, background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.s + 3, padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px" }}>
            <Switch th={th} checked={!!qarzLinked} onChange={() => setQarzLinked(v => !v)} label={L(lg, "Telefon orqali bog'lash", "Связать по телефону", "Link by phone", "Телефон арқылы байланыстыру", "Телефон аркылуу байланыштыруу", "Пайваст кардан тавассути телефон", "Telefon arqalı baylanıstırıw")} />
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: th.t1, fontWeight: 600 }}>{L(lg, "Telefon orqali bog'lash", "Связать по телефону", "Link by phone", "Телефон арқылы байланыстыру", "Телефон аркылуу байланыштыруу", "Пайваст кардан тавассути телефон", "Telefon arqalı baylanıstırıw")}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{L(lg, "Tasdiqlash so'rovi yuboriladi", "Будет отправлен запрос на подтверждение", "Sends confirmation", "Растау сұрауы жіберіледі", "Ырастоо суроосу жөнөтүлөт", "Дархости тасдиқ фиристода мешавад", "Tastıyıqlaw sorawı jiberiledi")}</div>
            </div>
          </div>
          {qarzLinked && (
            <>
              <label style={STY.lb}>{L(lg, "Qarzdor telefon raqami", "Телефон должника", "Person's phone", "Қарыздар телефоны", "Карыздардын телефону", "Рақами телефони қарздор", "Qarızdardıń telefonı")}</label>
              <input style={STY.ip} type="tel" value={qarzTel} onChange={e => setQarzTel(e.target.value)} placeholder="+998 90 123 45 67" />
              <div style={{ background: th.ac + ALPHA.soft, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 1) + "px " + (SPACE.s3 + 1) + "px", marginBottom: SPACE.s3, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{L(lg,
                "Bu raqam bilan ro'yxatdan o'tgan foydalanuvchiga so'rov boradi.",
                "Запрос будет отправлен пользователю, зарегистрированному с этим номером.",
                "A request is sent to the registered user.",
                "Осы нөмірмен тіркелген пайдаланушыға сұрау жіберіледі.",
                "Ушул номер менен катталган колдонуучуга суроо жөнөтүлөт.",
                "Дархост ба корбарони ин рақам сабтшуда фиристода мешавад.",
                "Usı nomer menen dizimnen ótken paydalanıwshıǵa soraw jiberiledi."
              )}</div>
            </>
          )}
          <PrimaryButton th={th} onClick={qarzLinked ? sendQarzRequest : addQarz}>{qarzLinked ? L(lg, "So'rov yuborish", "Отправить запрос", "Send request", "Сұрау жіберу", "Суроо жөнөтүү", "Фиристодани дархост", "Soraw jiberiw") : L(lg, "Saqlash", "Сохранить", "Save", "Сақтау", "Сактоо", "Захира кардан", "Saqlaw")}</PrimaryButton>
        </AppCard>
      )}

      {qarzReqs.length > 0 && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.am + ALPHA.strong, background: th.am + ALPHA.faint }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.am, marginBottom: SPACE.s3, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
            {QIco.bell(th.am, 16)}{L(lg, "Yangi qarz so'rovlari", "Новые запросы о долге", "New requests", "Жаңа қарыз сұраулары", "Жаңы карыз суроолору", "Дархостҳои нави қарз", "Jańa qarız sorawları")} ({qarzReqs.length})
          </div>
          {qarzReqs.map(req => {
            const isPay = req.type === "payment";
            const theyLent = req.tur === "bergan";
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + (SPACE.s4 - 1) + "px", marginBottom: SPACE.s2 + 2, border: "1px solid " + (isPay ? th.gr + ALPHA.strong : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 + 2 }}>
                  <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 2, background: (isPay ? th.gr : th.ac) + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isPay ? QIco.check(th.gr) : QIco.person(th.ac)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{req.fromIsm}</div><div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{req.fromTel}</div></div>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: isPay ? th.gr : (theyLent ? th.rd : th.gr), fontVariantNumeric: "tabular-nums" }}>{f(isPay ? (req.paySum || req.summa) : req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s2 + 2, ...TYPE.caption, color: th.t1 }}>
                  {isPay
                    ? <span style={{ fontWeight: 600, color: th.gr }}>{
                        req.fromIsm + " " + (req.partial
                          ? L(lg,
                              "qarzning " + f(req.paySum || 0, true) + " qismini qaytardim deyapti. Tasdiqlaysizmi?",
                              "говорит, что вернул(а) часть долга " + f(req.paySum || 0, true) + ". Подтверждаете?",
                              "says part of the debt (" + f(req.paySum || 0, true) + ") is returned. Confirm?",
                              "қарыздың " + f(req.paySum || 0, true) + " бөлігін қайтардым дейді. Растайсыз ба?",
                              "карыздын " + f(req.paySum || 0, true) + " бөлүгүн кайтардым дейт. Ырастайсызбы?",
                              "мегӯяд, ки қисми қарз (" + f(req.paySum || 0, true) + ") баргардонда шуд. Тасдиқ мекунед?",
                              "qarızdıń " + f(req.paySum || 0, true) + " bólegin qaytardım dep atır. Tastıyıqlaysız ba?"
                            )
                          : L(lg,
                              "qarzni qaytardim deyapti. Tasdiqlaysizmi?",
                              "говорит, что вернул(а) долг. Подтверждаете?",
                              "says the debt is returned. Confirm?",
                              "қарызды қайтардым дейді. Растайсыз ба?",
                              "карызды кайтардым дейт. Ырастайсызбы?",
                              "мегӯяд, ки қарз баргардонда шуд. Тасдиқ мекунед?",
                              "qarızdı qaytardım dep atır. Tastıyıqlaysız ba?"
                            ))
                      }</span>
                    : (theyLent
                        ? L(lg, req.fromIsm + " sizga " + f(req.summa, true) + " qarz berdi", req.fromIsm + " одолжил(а) вам " + f(req.summa, true), "They lent you money", req.fromIsm + " сізге " + f(req.summa, true) + " қарыз берді", req.fromIsm + " сизге " + f(req.summa, true) + " карыз берди", req.fromIsm + " ба шумо " + f(req.summa, true) + " қарз дод", req.fromIsm + " sizge " + f(req.summa, true) + " qarız berdi")
                        : L(lg, "Siz " + req.fromIsm + " dan " + f(req.summa, true) + " oldingiz", "Вы взяли " + f(req.summa, true) + " у " + req.fromIsm, "You borrowed", "Сіз " + req.fromIsm + " дан " + f(req.summa, true) + " алдыңыз", "Сиз " + req.fromIsm + " дан " + f(req.summa, true) + " алдыңыз", "Шумо аз " + req.fromIsm + " " + f(req.summa, true) + " гирифтед", "Siz " + req.fromIsm + " nan " + f(req.summa, true) + " aldıńız"))}
                  {!isPay && req.qaytSana && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 3 }}>{L(lg, "Qaytarish", "Возврат", "Return", "Қайтару", "Кайтаруу", "Баргардонидан", "Qaytarıw")}: {req.qaytSana}</div>}
                </div>
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <PrimaryButton th={th} onClick={() => isPay ? acceptPayReq(req) : acceptQarzReq(req)} style={{ flex: 1, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{isPay ? L(lg, "Qaytarildi, tasdiqlash", "Возвращено, подтвердить", "Confirm return", "Қайтарылды, растау", "Кайтарылды, ырастоо", "Баргардонда шуд, тасдиқ", "Qaytarıldı, tastıyıqlaw") : L(lg, "Tasdiqlash", "Подтвердить", "Accept", "Растау", "Ырастоо", "Тасдиқ кардан", "Tastıyıqlaw")}</PrimaryButton>
                  <DangerButton th={th} onClick={() => isPay ? rejectPayReq(req) : rejectQarzReq(req)} style={{ flex: 1, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{L(lg, "Rad etish", "Отклонить", "Reject", "Қабылдамау", "Четке кагуу", "Рад кардан", "Biykar etiw")}</DangerButton>
                </div>
              </div>
            );
          })}
        </AppCard>
      )}

      {/* Xulosa: menga qaytariladi / men qaytaraman */}
      <div style={{ display: "flex", gap: SPACE.s2 + 2, marginBottom: SPACE.s4 }}>
        <StatCard th={th} icon={QIco.coinIn(th.gr, 18)} value={f(olganSum, true)} label={L(lg, "Menga qaytariladi", "Мне вернут", "They owe me", "Маған қайтарылады", "Мага кайтарылат", "Ба ман бармегардонанд", "Maǵan qaytarıladı")} tone={th.gr}
          style={{ border: "1px solid " + th.gr + ALPHA.strong }} />
        <StatCard th={th} icon={QIco.coinOut(th.rd, 18)} value={f(berganSum, true)} label={L(lg, "Men qaytaraman", "Я верну", "I owe", "Мен қайтараман", "Мен кайтарамын", "Ман бармегардонам", "Men qaytaraman")} tone={th.rd}
          style={{ border: "1px solid " + th.rd + ALPHA.strong }} />
      </div>

      {active.length > 0 && (
        <div>
          <SectionHeader th={th}>{isBosh && memberActive.length > 0
            ? L(lg, "Mening qarzlarim", "Мои долги", "My debts", "Менің қарыздарым", "Менин карыздарым", "Қарзҳои ман", "Meniń qarızlarım")
            : L(lg, "Faol qarzlar", "Активные долги", "Active debts", "Белсенді қарыздар", "Активдүү карыздар", "Қарзҳои фаъол", "Belsendi qarızlar")} ({active.length})</SectionHeader>
          {active.map(q => (
            <DebtCard key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg} user={user}
              markQarzPaid={markQarzPaid} sendQarzReminder={sendQarzReminder}
              setPartialQarz={setPartialQarz} setPartialSum={setPartialSum}
              generateTilxat={generateTilxat} delQarz={delQarz} />
          ))}
        </div>
      )}

      {isBosh && memberActive.length > 0 && (
        <div style={{ marginTop: active.length > 0 ? SPACE.s4 + 2 : 0 }}>
          <SectionHeader th={th}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{QIco.family(th.t2)}{L(lg, "Oila a'zolari qarzlari", "Долги членов семьи", "Members' debts", "Отбасы мүшелерінің қарыздары", "Үй-бүлө мүчөлөрүнүн карыздары", "Қарзҳои аъзоёни оила", "Shańaraq aǵzalarınıń qarızları")} ({memberActive.length})</span></SectionHeader>
          {memberActive.map(q => (
            <MemberDebtCard key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg}
              owner={azolar.find(a => a.id === q.uid)} ownerName={gN2(q.uid)} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <SectionHeader th={th}>{L(lg, "Qaytarilganlar", "Возвращённые", "Returned", "Қайтарылғандар", "Кайтарылгандар", "Баргардонидашуда", "Qaytarılǵanlar")} ({done.length})</SectionHeader>
          {done.slice(0, 8).map(q => (
            <PaidDebtRow key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg} delQarz={delQarz} />
          ))}
        </div>
      )}

      {qarzlar.length === 0 && !showAddQarz && qarzReqs.length === 0 && (
        <EmptyState th={th} preset="debt"
          title={L(lg, "Hali qarz yo'q", "Пока нет долгов", "No debts yet", "Әзірге қарыз жоқ", "Азырынча карыз жок", "Ҳанӯз қарз нест", "Áli qarız joq")}
          message={L(lg, "Qarz olgan yoki berganingizni yozib boring — hech narsa unutilmaydi", "Записывайте, кому должны вы или кто должен вам — ничего не забудется", "Track money you lend or borrow — never forget", "Кімге қарыз болғаныңызды немесе кім сізге қарыз екенін жазыңыз — ештеңе ұмытылмайды", "Кимге карыз экениңизди же ким сизге карыз экенин жазыңыз — эч нерсе унутулбайт", "Қайд кунед, ки ба кӣ қарздоред ё кӣ ба шумо қарздор аст — ҳеҷ чиз фаромӯш намешавад", "Kimge qarız ekenińizdi jazıp barıń — heshnárse umıtılmaydı")}
          actionText={L(lg, "Qarz qo'shish", "Добавить долг", "Add debt", "Қарыз қосу", "Карыз кошуу", "Илова кардани қарз", "Qarız qosıw")} onAction={() => setShowAddQarz(true)} />
      )}
    </div>
  );
}
