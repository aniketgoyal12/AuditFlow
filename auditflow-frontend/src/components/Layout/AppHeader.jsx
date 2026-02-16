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
  Settings
} from 'lucide-react';
import Avatar from '../common/Avatar';

const AppHeader = ({ onToggleSidebar }) => {
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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between relative z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5 text-neutral-600" />
        </motion.button>

        {/* Search Bar */}
        <motion.div 
          className={`
            relative flex-1 max-w-md
            transition-all duration-300
          `}
          animate={{
            scale: isSearchFocused ? 1.02 : 1,
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search audits, notes, members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-10 pr-4 py-2 rounded-xl
              border-2 transition-all duration-200
              ${isSearchFocused 
                ? 'border-primary-500 bg-white shadow-md ring-4 ring-primary-500/10' 
                : 'border-neutral-200 bg-neutral-50 hover:bg-white'
              }
              focus:outline-none
            `}
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-neutral-600" />
          ) : (
            <Moon className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-neutral-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
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
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden z-30"
                >
                  <div className="p-4 border-b border-neutral-200">
                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer
                          ${notification.unread ? 'bg-primary-50/30' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 status-dot" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-neutral-200 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-neutral-100 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Avatar 
              name="Sarah Chen" 
              size="sm" 
              status="online"
              variant="gradient"
            />
            <span className="text-sm font-medium text-neutral-900">Sarah Chen</span>
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
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
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden z-30"
                >
                  <div className="p-3 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">Sarah Chen</p>
                    <p className="text-xs text-neutral-500">sarah@acme.com</p>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <div className="p-2 border-t border-neutral-200">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg transition-colors"
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