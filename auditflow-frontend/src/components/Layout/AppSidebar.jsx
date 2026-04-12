import { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  Settings,
  Globe,
  Users,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { formatUserRole, isAdminUser } from '../../lib/roles';

const platformLinks = [
  { name: 'Platform Dashboard', path: '/admin', icon: Globe },
  { name: 'Members', path: '/admin', icon: Users },
  { name: 'Settings', path: '/admin', icon: Settings },
];

const AppSidebar = ({ layoutType = 'workspace', isCollapsed = false }) => {
  const location = useLocation();
  const { user } = useAuth();

  const workspaceLinks = useMemo(
    () => [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Notepad', path: '/notepad', icon: FileText },
      { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
      { name: 'Settings', path: '/settings', icon: Settings },
      ...(isAdminUser(user) ? [{ name: 'Admin', path: '/admin', icon: Globe }] : []),
    ],
    [user]
  );

  const links = layoutType === 'platform' ? platformLinks : workspaceLinks;

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '88px' },
  };

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="h-[calc(100vh-2rem)] m-4 glass rounded-4xl flex flex-col shadow-premium z-50 border-white/20"
    >
      {/* Logo Section */}
      <div className="p-8">
        <motion.div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-primary"
            whileHover={{ rotate: -10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold font-display tracking-tight text-neutral-900 leading-tight">
                Audit<span className="text-primary-600">Flow</span>
              </h1>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Navigation</p>
          </div>
        )}

        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={link.path}
                className={`
                  relative flex items-center gap-4 px-4 py-3.5 rounded-2xl
                  font-semibold text-sm transition-all duration-300 group
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-glow-primary'
                    : 'text-neutral-500 hover:bg-white/50 hover:text-neutral-900'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 
                    ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary-500'}`}
                />

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1"
                  >
                    {link.name}
                  </motion.span>
                )}

                {!isCollapsed && isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Pro Badge - Upsell UI pattern */}
      {!isCollapsed && (
        <div className="px-4 pt-4 mb-4">
          <div className="bg-primary-50/50 rounded-3xl p-5 border border-primary-100/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-neutral-800 tracking-tight">AI Insights</p>
            </div>
            <p className="text-[11px] text-neutral-500 mb-4 leading-relaxed font-medium">
              Upgrade to unlock deep security forensic analysis & anomaly detection.
            </p>
            <button className="w-full py-2 bg-white text-primary-600 text-[11px] font-bold rounded-xl shadow-sm border border-primary-100 hover:bg-primary-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 border-t border-neutral-100/50">
        <motion.div
          className={`
            flex items-center gap-4 p-2 rounded-2xl
            hover:bg-white/50 cursor-pointer transition-all duration-300
            ${isCollapsed ? 'justify-center' : ''}
          `}
          whileHover={{ scale: 1.02 }}
        >
          <Avatar name={user?.name || 'User'} size="md" status="online" variant="gradient" />

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate tracking-tight">
                {user?.name || 'AuditFlow User'}
              </p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1">
                {user?.role ? formatUserRole(user.role) : 'Workspace User'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
};

const MemoizedAppSidebar = memo(AppSidebar);
MemoizedAppSidebar.displayName = 'AppSidebar';

export default MemoizedAppSidebar;
