const DEFAULT_API_URL = 'https://auditflow-g54b.onrender.com';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const resolveApiUrl = (value) => {
  const normalizedValue = trimTrailingSlash(value || DEFAULT_API_URL);

  return normalizedValue;
};

export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
export const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
