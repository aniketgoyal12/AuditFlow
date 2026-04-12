const USER_ROLES = ["admin", "user"];

const ROLE_ALIASES = {
  admin: "admin",
  administrator: "admin",
  Admin: "admin",
  Administrator: "admin",
  user: "user",
  User: "user",
  editor: "user",
  Editor: "user",
};

const normalizeUserRole = (role, fallback = "user") => {
  const normalized = String(role || "").trim();
  return ROLE_ALIASES[normalized] || ROLE_ALIASES[normalized.toLowerCase()] || fallback;
};

const isAdminRole = (role) => normalizeUserRole(role) === "admin";

const hasUserRole = (user, allowedRoles = []) => {
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeUserRole(role));
  return Boolean(user && normalizedAllowedRoles.includes(normalizeUserRole(user.role)));
};

module.exports = {
  USER_ROLES,
  hasUserRole,
  isAdminRole,
  normalizeUserRole,
};
