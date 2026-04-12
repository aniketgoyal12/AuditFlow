const ROLE_ALIASES = {
  admin: 'admin',
  administrator: 'admin',
  user: 'user',
  editor: 'user',
};

export const normalizeUserRole = (role, fallback = 'user') => {
  const normalizedKey = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[normalizedKey] || fallback;
};

export const isAdminRole = (role) => normalizeUserRole(role) === 'admin';

export const isAdminUser = (user) => isAdminRole(user?.role);

export const formatUserRole = (role) =>
  isAdminRole(role) ? 'Admin' : 'User';

export const getHomeRouteForUser = (user) =>
  isAdminUser(user) ? '/admin' : '/dashboard';
