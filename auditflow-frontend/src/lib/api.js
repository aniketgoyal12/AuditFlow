const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const GET_CACHE_TTL_MS = 10_000;
const requestCache = new Map();
const inflightRequests = new Map();

export class ApiError extends Error {
  constructor(message, { statusCode = 500, requestId = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

const buildHeaders = (token, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const buildQueryString = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString();

const buildRequestKey = (path, method, token) => `${method}:${path}:${token || 'anonymous'}`;

const clearRequestCache = () => {
  requestCache.clear();
  inflightRequests.clear();
};

export const apiRequest = async (path, options = {}, token) => {
  const method = (options.method || 'GET').toUpperCase();
  const useCache = method === 'GET' && options.cache !== 'no-store';
  const cacheKey = buildRequestKey(path, method, token);
  const cachedEntry = useCache ? requestCache.get(cacheKey) : null;

  if (cachedEntry && Date.now() - cachedEntry.timestamp < GET_CACHE_TTL_MS) {
    return cachedEntry.payload;
  }

  if (useCache && inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(token, options.headers),
    });
    const requestId = response.headers.get('x-request-id');

    const payload = await response.json().catch(() => ({
      success: false,
      message: 'Unable to parse server response',
      data: null,
    }));

    if (!response.ok || payload.success === false) {
      if (response.status === 401 && token) {
        window.dispatchEvent(new CustomEvent('auditflow:unauthorized'));
      }

      throw new ApiError(payload.message || 'Something went wrong', {
        statusCode: response.status,
        requestId,
      });
    }

    if (useCache) {
      requestCache.set(cacheKey, {
        payload,
        timestamp: Date.now(),
      });
    } else {
      clearRequestCache();
    }

    return payload;
  })();

  if (useCache) {
    inflightRequests.set(cacheKey, requestPromise);
  }

  try {
    return await requestPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
};

export const api = {
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: (token) => apiRequest('/auth/logout', { method: 'POST' }, token),
  getProfile: (token) => apiRequest('/auth/me', {}, token),
  updateProfile: (body, token) =>
    apiRequest('/auth/me', { method: 'PUT', body: JSON.stringify(body) }, token),
  changePassword: (body, token) =>
    apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }, token),
  getDashboard: (token) => apiRequest('/dashboard', {}, token),
  getNotes: (params, token) =>
    apiRequest(`/notes?${buildQueryString(params)}`, {}, token),
  createNote: (body, token) =>
    apiRequest('/notes', { method: 'POST', body: JSON.stringify(body) }, token),
  getNote: (id, token) => apiRequest(`/notes/${id}`, {}, token),
  updateNote: (id, body, token) =>
    apiRequest(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  deleteNote: (id, token) => apiRequest(`/notes/${id}`, { method: 'DELETE' }, token),
  getNoteSharing: (id, token) => apiRequest(`/notes/${id}/sharing`, {}, token),
  shareNote: (id, body, token) =>
    apiRequest(`/notes/${id}/share`, { method: 'POST', body: JSON.stringify(body) }, token),
  getNoteInvitations: (token) => apiRequest('/notes/invitations', {}, token),
  respondToNoteInvitation: (inviteId, body, token) =>
    apiRequest(`/notes/invitations/${inviteId}/respond`, { method: 'POST', body: JSON.stringify(body) }, token),
  cancelNoteInvite: (noteId, inviteId, token) =>
    apiRequest(`/notes/${noteId}/invites/${inviteId}`, { method: 'DELETE' }, token),
  removeNoteCollaborator: (noteId, userId, token) =>
    apiRequest(`/notes/${noteId}/collaborators/${userId}`, { method: 'DELETE' }, token),
  getAuditLogs: (params, token) =>
    apiRequest(`/audit-logs?${buildQueryString(params)}`, {}, token),
  getAdminOverview: (token) => apiRequest('/admin/overview', {}, token),
  getAdminUsers: (token) => apiRequest('/admin/users', {}, token),
  updateAdminUser: (id, body, token) =>
    apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
};

export { API_BASE_URL };
export { clearRequestCache };
