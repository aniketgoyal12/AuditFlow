import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  ScrollText, 
  Settings, 
  Globe, 
  Users, 
  ChevronRight,
  Shield
} from 'lucide-react';

const AppSidebar = ({ layoutType = 'workspace', isCollapsed = false }) => {
  const location = useLocation();

  const workspaceLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notepad', path: '/notepad', icon: FileText },
    { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const platformLinks = [
    { name: 'Platform Dashboard', path: '/platform', icon: Globe },
    { name: 'Members', path: '/platform/members', icon: Users },
    { name: 'Settings', path: '/platform/settings', icon: Settings },
  ];

  const links = layoutType === 'platform' ? platformLinks : workspaceLinks;

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' },
  };

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white border-r border-neutral-200 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold font-display text-gradient">
                  AuditFlow
                </h1>
                <p className="text-xs text-neutral-500">Enterprise Edition</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-3"
            >
              {layoutType === 'platform' ? 'Platform' : 'Workspace'}
            </motion.div>
          )}
        </AnimatePresence>

        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={link.path}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl
                  font-medium text-sm
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-neutral-600 hover:bg-neutral-50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon 
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-primary-600' : 'text-neutral-500'
                  }`} 
                />

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 0, x: 0 }}
                      whileHover={{ opacity: 1, x: 5 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-neutral-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-neutral-200">
        <motion.div 
          className={`
            flex items-center gap-3 px-3 py-2 rounded-xl
            hover:bg-neutral-50 cursor-pointer transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
            SC
          </div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-neutral-900 truncate">
                  Sarah Chen
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  Admin
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;