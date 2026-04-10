import { useEffect, useMemo, useState } from 'react';
import { api, clearRequestCache } from '../lib/api';
import { AuthContext } from './authContext';

const STORAGE_KEY = 'auditflow_auth';
const emptyAuthState = { token: null, user: null, rememberMe: false };

const readStoredAuth = () => {
  try {
    const localSession = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const browserSession = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');

    return localSession || browserSession || emptyAuthState;
  } catch {
    return emptyAuthState;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

const persistAuth = (auth) => {
  clearStoredAuth();

  if (!auth?.token || !auth?.user) {
    return;
  }

  const storage = auth.rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

const resolveTheme = (themePreference) => {
  if (themePreference === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return themePreference || 'light';
};

export const AuthProvider = ({ children }) => {
  const initialAuth = useMemo(() => readStoredAuth(), []);
  const [auth, setAuth] = useState(initialAuth);
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(initialAuth.token));

  useEffect(() => {
    persistAuth(auth);
  }, [auth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearRequestCache();
      clearStoredAuth();
      setAuth(emptyAuthState);
      setIsBootstrapping(false);
    };

    window.addEventListener('auditflow:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auditflow:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!auth.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await api.getProfile(auth.token);
        setAuth((current) => ({ ...current, user: response.data }));
      } catch {
        clearStoredAuth();
        setAuth(emptyAuthState);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [auth.token]);

  useEffect(() => {
    const themePreference = auth.user?.preferences?.theme || 'light';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(themePreference);
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (themePreference !== 'auto') {
      return undefined;
    }

    const handleChange = () => applyTheme();
    mediaQuery.addEventListener?.('change', handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, [auth.user?.preferences?.theme]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user),
      isBootstrapping,
      rememberMe: Boolean(auth.rememberMe),
      setSession: ({ token, user, rememberMe = false }) => {
        clearRequestCache();
        setAuth({ token, user, rememberMe });
      },
      updateUser: (user) => setAuth((current) => ({ ...current, user })),
      clearSession: () => {
        clearRequestCache();
        clearStoredAuth();
        setAuth(emptyAuthState);
      },
    }),
    [auth, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
