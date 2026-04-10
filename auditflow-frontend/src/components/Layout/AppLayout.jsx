import { Suspense, lazy, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from '../../lib/motion';
import Skeleton from '../common/Skeleton';

const AppHeader = lazy(() => import('./AppHeader'));
const AppSidebar = lazy(() => import('./AppSidebar'));

const SidebarSkeleton = () => (
  <aside className="hidden md:flex h-[calc(100vh-2rem)] m-4 w-[280px] rounded-4xl border border-white/20 bg-white/60 p-6 shadow-premium">
    <div className="flex h-full w-full flex-col justify-between">
      <div className="space-y-6">
        <Skeleton className="h-12 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  </aside>
);

const HeaderSkeleton = () => (
  <div className="h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton className="h-11 w-11 rounded-2xl" />
      <Skeleton className="hidden md:block h-12 w-full max-w-xl" />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-28 rounded-2xl" />
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  </div>
);

const AppLayout = ({ layoutType = 'workspace' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((current) => !current);
  }, []);

  return (
    <div className="flex h-screen bg-mesh overflow-hidden p-0 sm:p-2 lg:p-4">
      <Suspense fallback={<SidebarSkeleton />}>
        <AppSidebar layoutType={layoutType} isCollapsed={isSidebarCollapsed} />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0 bg-white/40 sm:bg-transparent backdrop-blur-3xl sm:backdrop-blur-none rounded-none sm:rounded-4xl ml-2 overflow-hidden shadow-2xl sm:shadow-none border border-white/20 sm:border-none">
        <Suspense fallback={<HeaderSkeleton />}>
          <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        </Suspense>

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
