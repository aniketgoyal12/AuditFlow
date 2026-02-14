import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// Workspace Pages
import DashboardPage from '../pages/Workspace/DashboardPage';
import AuditLogsPage from '../pages/Workspace/AuditLogsPage';
import NotesPage from '../pages/Workspace/NotesPage';
import SettingsPage from '../pages/Workspace/SettingsPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Workspace Routes */}
        <Route element={<AppLayout layoutType="workspace" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notepad" element={<NotesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;