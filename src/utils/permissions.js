// ═══════════════════════════════════════════════════════════
//  PERMISSIONS — vazifa huquqlarining YAGONA haqiqat manbai
//  Qoida (Sprint 4):
//   • Vazifa BERISH  — barcha katta a'zolar (rol !== "kid").
//   • Tasdiqlash     — barcha katta a'zolar.
//   • Bajarish       — faqat vazifa biriktirilgan BOLA.
//   • O'chirish      — oila boshi HAMMASINI; oddiy katta a'zo
//                      faqat O'ZI bergan vazifani.
//  Sof funksiyalar — birlik test qilinadi (build gate).
// ═══════════════════════════════════════════════════════════

const nm = x => (x || "").trim().toLowerCase();

/** Vazifa shu bolaga tegishlimi (id / login / ism bo'yicha moslash). */
export const taskMatchesKid = (v, k) => !!(v && k && (
  v.assignedTo === k.id ||
  (v.assignedLogin && k.login && v.assignedLogin === k.login) ||
  (v.assignedName && k.ism && nm(v.assignedName) === nm(k.ism))
));

/** Vazifa bera oladimi — bola rolidan tashqari barcha katta a'zolar. */
export const canAssignTask = (user) => !!user && user.rol !== "kid";

/** Bajarilgan vazifani tasdiqlay oladimi — barcha katta a'zolar. */
export const canApproveTask = (user) => !!user && user.rol !== "kid";

/** "Bajardim" deb belgilay oladimi — faqat biriktirilgan bola. */
export const canCompleteTask = (user, v) =>
  !!(user && user.rol === "kid" && taskMatchesKid(v, user));

/** O'chira oladimi — bosh hammasini, katta a'zo faqat o'zinikini.
 *  Eski yozuvlarda createdBy bo'lmasligi mumkin — u holda katta
 *  a'zolarga ruxsat (regressiya bo'lmasligi uchun). */
export const canDeleteTask = (user, v) =>
  !!(user && (
    user.rol !== "kid"
      ? (user.rol === "bosh" || !v?.createdBy || v.createdBy === user.id)
      : (v?.status === "proposed" && v?.createdBy === user.id)
  ));
