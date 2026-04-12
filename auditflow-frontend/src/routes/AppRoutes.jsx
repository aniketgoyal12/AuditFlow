import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PageSkeleton from '../components/common/PageSkeleton';
import { useAuth } from '../hooks/useAuth';
import { getHomeRouteForUser } from '../lib/roles';

const AppLayout = lazy(() => import('../components/Layout/AppLayout'));
const DashboardPage = lazy(() => import('../pages/Workspace/DashboardPage'));
const AuditLogsPage = lazy(() => import('../pages/Workspace/AuditLogsPage'));
const NotesPage = lazy(() => import('../pages/Workspace/NotesPage'));
const SettingsPage = lazy(() => import('../pages/Workspace/SettingsPage'));
const AdminDashboard = lazy(() => import('../pages/Workspace/AdminDashboard'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const SharedNotePage = lazy(() => import('../pages/Workspace/SharedNotePage'));

const AppRoutes = () => {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const defaultRoute = getHomeRouteForUser(user);

  if (isBootstrapping) {
    return <PageSkeleton variant="auth" />;
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={<PageSkeleton variant={isAuthenticated ? 'workspace' : 'auth'} />}
      >
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <SignupPage />}
          />
          <Route path="/shared/:token" element={<SharedNotePage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout layoutType="workspace" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notepad" element={<NotesPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : '/'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
