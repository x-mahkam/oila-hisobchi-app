// ═══════════════════════════════════════════════════════════
//  RBAC skeleti (Faza 0).
//  Hozircha server bitta "admin" darajasini biladi (ADMIN_UIDS).
//  Keyingi fazada admin_roles/{uid} dan haqiqiy rol yuklanadi —
//  UI allaqachon permission'larga tayanib qurilgani uchun
//  server qo'shilganda hech narsa qayta yozilmaydi.
// ═══════════════════════════════════════════════════════════

export const ROLES = {
  super_admin: { label: "Super Admin", permissions: ["*"] },
  admin: {
    label: "Admin",
    permissions: [
      "dashboard.read", "users.read", "users.write",
      "families.read", "premium.write", "i18n.read", "i18n.write",
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

// Hozircha: ADMIN_UIDS dan o'tgan har kim super_admin deb qabul qilinadi.
// Keyingi fazada adminStats javobiga role qo'shamiz va bu funksiya
// haqiqiy rolni qaytaradi.
export function resolveRole(_user) {
  return "super_admin";
}

export function hasPermission(role, permission) {
  const def = ROLES[role];
  if (!def) return false;
  if (def.permissions.includes("*")) return true;
  return def.permissions.includes(permission);
}
