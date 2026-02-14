import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const AppLayout = ({ layoutType = 'workspace' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AppSidebar 
        layoutType={layoutType} 
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;