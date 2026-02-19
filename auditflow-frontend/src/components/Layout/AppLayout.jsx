import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const AppLayout = ({ layoutType = 'workspace' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-mesh overflow-hidden p-0 sm:p-2 lg:p-4">
      {/* Sidebar Container */}
      <AppSidebar
        layoutType={layoutType}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 sm:bg-transparent backdrop-blur-3xl sm:backdrop-blur-none rounded-none sm:rounded-4xl ml-2 overflow-hidden shadow-2xl sm:shadow-none border border-white/20 sm:border-none">
        <AppHeader
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar"
        >
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <Outlet />
          </div>
        </motion.main>
      </div>

      {/* Background Orbs for extra premium feel */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-accent/10 blur-[100px] rounded-full -z-10" />
    </div>
  );
};

export default AppLayout;
