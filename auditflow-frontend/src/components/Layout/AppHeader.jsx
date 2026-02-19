import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import Avatar from '../common/Avatar';

const AppHeader = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notifications = [
    { id: 1, title: 'New audit log entry', time: '5m ago', unread: true },
    { id: 2, title: 'Sarah Chen updated Q4 Report', time: '1h ago', unread: true },
    { id: 3, title: 'System maintenance scheduled', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => navigate('/');

  return (
    <header className="h-20 px-4 sm:px-8 flex items-center justify-between relative z-10">
      {/* Left Section */}
      <div className="flex items-center gap-6 flex-1">
        <motion.button
          onClick={onToggleSidebar}
          className="p-2.5 bg-white/50 hover:bg-white rounded-2xl shadow-sm border border-neutral-100 transition-all duration-300"
          whileHover={{ scale: 1.05, shadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5 text-neutral-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        {/* Search Bar */}
        <motion.div
          className="relative flex-1 max-w-xl hidden md:block"
          animate={{
            scale: isSearchFocused ? 1.01 : 1,
          }}
        >
          <div className={`
            absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
            ${isSearchFocused ? 'text-primary-600' : 'text-neutral-400'}
          `}>
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Quick search (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-12 pr-4 py-3 rounded-2xl
              bg-white/50 border border-white/40
              transition-all duration-300 backdrop-blur-md
              ${isSearchFocused
                ? 'bg-white border-primary-200 shadow-premium ring-4 ring-primary-500/5'
                : 'hover:bg-white/80'
              }
              focus:outline-none placeholder:text-neutral-400 font-medium text-sm
            `}
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Actions Group */}
        <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl">
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-white rounded-xl transition-all duration-300 text-neutral-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <div className="w-px h-4 bg-neutral-200 mx-1" />

          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white rounded-xl transition-all duration-300 text-neutral-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full border-2 border-white" />
            )}
          </motion.button>
        </div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl hover:bg-white transition-all duration-300"
            whileHover={{ y: -1 }}
          >
            <div className="relative">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Sarah"
                className="w-8 h-8 rounded-xl ring-2 ring-white"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-accent border-2 border-white rounded-full" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-neutral-900 leading-none">Sarah Chen</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
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
                    <p className="text-sm font-bold text-white">Sarah Chen</p>
                    <p className="text-xs text-neutral-400 mt-1">sarah@acme.com</p>
                  </div>

                  <div className="p-2 space-y-1">
                    {[
                      { icon: UserIcon, label: 'My profile', path: '/settings' },
                      { icon: Settings, label: 'Preferences', path: '/settings' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setShowUserMenu(false); navigate(item.path); }}
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

export default AppHeader;
