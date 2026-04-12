import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  PanelLeftClose,
  PanelLeft,
  CheckCheck,
  FileText,
  Shield,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../lib/formatters';
import { formatUserRole } from '../../lib/roles';

const AppHeader = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const { user, token, clearSession, updateUser } = useAuth();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );
  const currentTheme = user?.preferences?.theme || document.documentElement.dataset.theme || 'light';
  const isDarkMode = currentTheme === 'dark';

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      setIsNotificationsLoading(true);
      const response = await api.getNotifications({ limit: 8 }, token);
      setNotifications(response?.data?.items || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [loadNotifications, token]);

  const handleLogout = useCallback(async () => {
    try {
      if (token) {
        await api.logout(token);
      }
    } catch {
      // no-op
    } finally {
      clearSession();
      navigate('/');
    }
  }, [clearSession, navigate, token]);

  const handleToggleTheme = useCallback(async () => {
    if (!user || !token) {
      return;
    }

    const nextTheme = isDarkMode ? 'light' : 'dark';
    const previousUser = user;

    updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        theme: nextTheme,
      },
    });

    try {
      const response = await api.updateProfile(
        {
          preferences: { theme: nextTheme },
        },
        token
      );
      updateUser(response.data);
    } catch {
      updateUser(previousUser);
    }
  }, [isDarkMode, token, updateUser, user]);

  const handleOpenNotifications = useCallback(() => {
    const nextOpenState = !showNotifications;
    setShowNotifications(nextOpenState);

    if (nextOpenState) {
      void loadNotifications();
    }
  }, [loadNotifications, showNotifications]);

  const handleNotificationNavigate = useCallback(
    (notification) => {
      if (notification?.metadata?.noteId || notification?.metadata?.inviteId) {
        navigate('/notepad');
        return;
      }

      if (notification?.type === 'security') {
        navigate('/audit-logs');
        return;
      }

      navigate('/dashboard');
    },
    [navigate]
  );

  const handleNotificationClick = useCallback(
    async (notification) => {
      if (!token) {
        return;
      }

      if (!notification.isRead) {
        setNotifications((current) =>
          current.map((entry) =>
            entry.id === notification.id
              ? {
                  ...entry,
                  isRead: true,
                  readAt: entry.readAt || new Date().toISOString(),
                }
              : entry
          )
        );

        try {
          await api.markNotificationRead(notification.id, token);
        } catch {
          void loadNotifications();
        }
      }

      setShowNotifications(false);
      handleNotificationNavigate(notification);
    },
    [handleNotificationNavigate, loadNotifications, token]
  );

  const handleMarkAllNotificationsRead = useCallback(async () => {
    if (!token || unreadCount === 0) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || readAt,
      }))
    );

    try {
      await api.markAllNotificationsRead(token);
    } catch {
      void loadNotifications();
    }
  }, [loadNotifications, token, unreadCount]);

  const getNotificationIcon = (notificationType) => {
    if (notificationType === 'invite' || notificationType === 'share') {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }

    if (notificationType === 'security') {
      return <Shield className="w-4 h-4 text-red-600" />;
    }

    return <Bell className="w-4 h-4 text-neutral-600" />;
  };

  return (
    <header className="h-20 px-4 sm:px-8 flex items-center justify-between relative z-10">
      <div className="flex items-center gap-6 flex-1">
        <motion.button
          onClick={onToggleSidebar}
          className="p-2.5 bg-white/50 hover:bg-white rounded-2xl shadow-sm border border-neutral-100 transition-all duration-300"
          whileHover={{ scale: 1.05, shadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5 text-neutral-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        <motion.div
          className="relative flex-1 max-w-xl hidden md:block"
          animate={{
            scale: isSearchFocused ? 1.01 : 1,
          }}
        >
          <div
            className={`
            absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
            ${isSearchFocused ? 'text-primary-600' : 'text-neutral-400'}
          `}
          >
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Quick search (Ctrl + K)"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-12 pr-4 py-3 rounded-2xl
              bg-white/50 border border-white/40
              transition-all duration-300 backdrop-blur-md
              ${
                isSearchFocused
                  ? 'bg-white border-primary-200 shadow-premium ring-4 ring-primary-500/5'
                  : 'hover:bg-white/80'
              }
              focus:outline-none placeholder:text-neutral-400 font-medium text-sm
            `}
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl">
          <motion.button
            onClick={handleToggleTheme}
            className="p-2 hover:bg-white rounded-xl transition-all duration-300 text-neutral-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <div className="w-px h-4 bg-neutral-200 mx-1" />

          <motion.button
            onClick={handleOpenNotifications}
            className="relative p-2 hover:bg-white rounded-xl transition-all duration-300 text-neutral-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-20"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-24 top-full mt-3 w-[360px] glass rounded-3xl shadow-premium p-2 z-30"
                >
                  <div className="p-4 border-b border-neutral-100 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Notifications</p>
                      <p className="text-xs text-neutral-500 mt-1">Recent workspace updates</p>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCheck className="w-4 h-4" />}
                        onClick={handleMarkAllNotificationsRead}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>

                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {isNotificationsLoading ? (
                      <div className="px-3 py-6 text-sm text-neutral-500 text-center">
                        Loading notifications…
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => void handleNotificationClick(notification)}
                          className={`w-full text-left rounded-2xl px-3 py-3 transition-colors ${
                            notification.isRead ? 'hover:bg-white/70' : 'bg-blue-50/70 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-medium text-neutral-800">{notification.message}</p>
                                {!notification.isRead && (
                                  <span className="mt-1 w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-2">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-sm text-neutral-500 text-center">
                        You’re all caught up.
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl hover:bg-white transition-all duration-300"
            whileHover={{ y: -1 }}
          >
            <Avatar name={user?.name || 'User'} size="sm" status="online" variant="gradient" />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-neutral-900 leading-none">{user?.name || 'AuditFlow User'}</p>
              <p className="text-[10px] text-neutral-500 mt-1">{user?.role ? formatUserRole(user.role) : ''}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-20"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-64 glass-dark rounded-3xl shadow-premium p-2 z-30"
                >
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-bold text-white">{user?.name || 'AuditFlow User'}</p>
                    <p className="text-xs text-neutral-400 mt-1">{user?.email || ''}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    {[
                      { icon: UserIcon, label: 'My profile', path: '/settings' },
                      { icon: Settings, label: 'Preferences', path: '/settings' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate(item.path);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const MemoizedAppHeader = memo(AppHeader);
MemoizedAppHeader.displayName = 'AppHeader';

export default MemoizedAppHeader;
