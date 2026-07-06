// ═══════════════════════════════════════════════════════════
//  SMART GOALS — metadata store (DECOUPLED)
//  ───────────────────────────────────────────────────────────
//  Nega alohida store?
//  Mavjud `addMq` (useGoals.js) faqat {ism,maqsad,rang,shared}
//  saqlaydi va unga TEGISH TAQIQLANGAN (Firebase/business logic
//  o'zgarmasin). Shu sabab SMART meta (muddat, rasm, tur, lokal
//  timeline, notification holati) shu yerda — App state va
//  Firebase'dan MUSTAQIL — localStorage'da saqlanadi.
//
//  Bog'lanish kaliti: goal.id (Date.now() — barqaror, unikal).
//  Real ma'lumot (jamg, contribs, createdAt, completedAt) esa
//  o'zgarmagan holda `maq` prop'idan keladi.
//
//  UPGRADE PATH: kelajakda useGoals'ga tegishga ruxsat berilsa,
//  bu meta to'g'ridan-to'g'ri goal obyektiga ko'chiriladi va bu
//  fayl migrator sifatida ishlatiladi (getMeta → goal.deadline).
// ═══════════════════════════════════════════════════════════

const KEY = "oh_goals_smart_v1";     // { [goalId]: Meta }
const PENDING_KEY = "oh_goals_pending_v1"; // yangi maqsad id-binding navbati

// ── Meta shakli ──
// { deadline: "YYYY-MM-DD" | null,
//   img: string | null,          // URL yoki emoji
//   type: "personal"|"family"|"kid"|preset,
//   events: [{ t: "edited"|"deadline", at: ISO, note?: string }],
//   notif: { [notifKey]: ISO }   // dedupe uchun oxirgi yuborilgan vaqt
// }

const isBrowser = typeof window !== "undefined" && !!window.localStorage;
const listeners = new Set();

function readRaw(k) {
  if (!isBrowser) return {};
  try { return JSON.parse(window.localStorage.getItem(k) || "{}") || {}; }
  catch { return {}; }
}
function writeRaw(k, v) {
  if (!isBrowser) return;
  try { window.localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

function emit() { listeners.forEach(fn => { try { fn(); } catch {} }); }

/** React subscription uchun (useSyncExternalStore). */
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Barcha meta (snapshot — o'zgarmas ref, useSyncExternalStore mos). */
let _cache = null, _cacheStr = "";
export function allMeta() {
  const cur = isBrowser ? (window.localStorage.getItem(KEY) || "{}") : "{}";
  if (cur !== _cacheStr) { _cacheStr = cur; try { _cache = JSON.parse(cur); } catch { _cache = {}; } }
  return _cache || {};
}

/** Bitta maqsad meta'si (bo'lmasa bo'sh default). */
export function getMeta(id) {
  const m = allMeta()[String(id)];
  return m || { deadline: null, img: null, type: null, events: [], notif: {} };
}

/** Meta'ni qisman yangilash (merge). */
export function setMeta(id, patch) {
  const all = { ...allMeta() };
  const prev = all[String(id)] || { deadline: null, img: null, type: null, events: [], notif: {} };
  all[String(id)] = { ...prev, ...patch };
  writeRaw(KEY, all);
  _cacheStr = ""; // invalidate
  emit();
  return all[String(id)];
}

/** Timeline hodisasi qo'shish (edited / deadline). */
export function pushEvent(id, type, note) {
  const meta = getMeta(id);
  const events = Array.isArray(meta.events) ? meta.events.slice() : [];
  events.push({ t: type, at: new Date().toISOString(), ...(note ? { note } : {}) });
  return setMeta(id, { events });
}

/** Notification dedupe: oxirgi yuborilgan vaqtni belgilash. */
export function markNotif(id, notifKey) {
  const meta = getMeta(id);
  const notif = { ...(meta.notif || {}) };
  notif[notifKey] = new Date().toISOString();
  return setMeta(id, { notif });
}

/** O'chirilgan maqsad meta'sini tozalash (maq bilan sinxron). */
export function pruneMeta(validIds) {
  const valid = new Set(validIds.map(String));
  const all = allMeta();
  let changed = false;
  const next = {};
  for (const k of Object.keys(all)) if (valid.has(k)) next[k] = all[k]; else changed = true;
  if (changed) { writeRaw(KEY, next); _cacheStr = ""; emit(); }
}

// ── Yangi maqsad id-binding navbati ─────────────────────────
// addMq id'ni ichida generatsiya qiladi va qaytarmaydi. Shu sabab
// yangi maqsad yaratilганда meta'ni "pending" ga yozamiz, keyin
// `maq` yangilanganda mos id topilib bog'lanadi (reconcile).

export function enqueuePending(rec) {
  const list = readRaw(PENDING_KEY);
  const arr = Array.isArray(list) ? list : [];
  arr.push({ ...rec, ts: Date.now() });
  writeRaw(PENDING_KEY, arr);
}

export function getPending() {
  const list = readRaw(PENDING_KEY);
  return Array.isArray(list) ? list : [];
}

export function removePending(pid) {
  const arr = getPending().filter(p => p.pid !== pid);
  writeRaw(PENDING_KEY, arr);
}

/**
 * reconcilePending(maq): yangi yaratilgan maqsadlarga meta'ni bog'laydi.
 * Mos maqsad = knownIds'da yo'q + ism & maqsad bir xil.
 * 60s dan eski, bog'lanmagan pending'lar tozalanadi (addMq rad etgan bo'lsa).
 * Returns: bog'langanlar soni (>0 bo'lsa UI yangilanadi).
 */
export function reconcilePending(maq) {
  const pend = getPending();
  if (!pend.length || !Array.isArray(maq)) return 0;
  let bound = 0;
  for (const p of pend) {
    const known = new Set((p.knownIds || []).map(String));
    const g = maq.find(m =>
      !known.has(String(m.id)) &&
      String(m.ism || "").trim() === String(p.ism || "").trim() &&
      Number(m.maqsad) === Number(p.maqsad)
    );
    if (g) {
      const meta = getMeta(g.id);
      const events = Array.isArray(meta.events) ? meta.events.slice() : [];
      if (p.meta?.deadline) events.push({ t: "deadline", at: new Date().toISOString() });
      setMeta(g.id, { ...p.meta, events });
      removePending(p.pid);
      bound++;
    } else if (Date.now() - (p.ts || 0) > 60000) {
      removePending(p.pid); // GC: addMq muvaffaqiyatsiz bo'lgan
    }
  }
  return bound;
}
