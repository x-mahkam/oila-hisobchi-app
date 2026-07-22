// ═══════════════════════════════════════════════════════════
//  RBAC — rollar va ruxsatlar.
//  Haqiqiy rol SERVERDA aniqlanadi (assertAdmin): ADMIN_UIDS (env)
//  super_admin, admin_roles/{uid} hujjati esa panel orqali berilgan
//  rollar. Kirishda adminDashboard javobidagi myRole ishlatiladi.
//  UI bu matritsadan faqat sidebar'ni filtrlash uchun foydalanadi —
//  server baribir har amalda qayta tekshiradi.
//  MUHIM: bu ro'yxat functions/index.js dagi ROLE_PERMS bilan
//  bir xil bo'lishi shart.
// ═══════════════════════════════════════════════════════════

export const ROLES = {
  super_admin: { label: "Super Admin", permissions: ["*"] },
  admin: {
    label: "Admin",
    permissions: [
      "dashboard.read", "users.read", "users.write", "families.read",
      "premium.write", "i18n.read", "i18n.write", "push.send", "config.write",
    ],
  },
  moderator: {
    label: "Moderator",
    permissions: ["dashboard.read", "users.read", "families.read", "i18n.read", "i18n.write"],
  },
  support: {
    label: "Support",
    permissions: ["dashboard.read", "users.read", "families.read"],
  },
};

export function hasPermission(role, permission) {
  const def = ROLES[role];
  if (!def) return false;
  if (def.permissions.includes("*")) return true;
  return def.permissions.includes(permission);
}
