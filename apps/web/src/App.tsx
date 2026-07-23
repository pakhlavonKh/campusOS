import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CoursesPage } from './pages/courses/CoursesPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { MessagingPage } from './pages/messaging/MessagingPage';
import { GradebookPage } from './pages/gradebook/GradebookPage';
import { DiscussionsPage } from './pages/collaboration/DiscussionsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { UsersPage } from './pages/users/UsersPage';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { useDesktop } from './hooks/useDesktop';

// Theme Switcher for testing Tiers 1 & 2 of the Whitelabeling Architecture
function ThemeSwitcher() {
  const { whiteLabelConfig, setWhiteLabelConfig } = useAuthStore();
  
  const toggleTheme = () => {
    const isRed = whiteLabelConfig?.tokens?.colorPrimary === '#e11d48';
    const currentLayout = whiteLabelConfig?.layoutVariant || 'sidebar';
    const nextLayout = currentLayout === 'sidebar' ? 'top_nav' : 'sidebar';

    setWhiteLabelConfig({
      tier: 'layout_variant',
      tokens: {
        colorPrimary: isRed ? '#6366f1' : '#e11d48',
        colorSecondary: isRed ? '#4f46e5' : '#be123c',
        fontFamily: 'Inter',
        logoUrl: null,
        faviconUrl: null,
        customDomain: null,
      },
      layoutVariant: nextLayout,
      customBuildRef: null,
    });
  };

  return (
    <button 
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'var(--color-primary-500)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 9999,
        fontWeight: 'bold',
      }}
    >
      Toggle Layout & Theme
    </button>
  );
}

function App() {
  const whiteLabelConfig = useAuthStore((state: any) => state.whiteLabelConfig);
  const { isDesktop, isMac } = useDesktop();

  useEffect(() => {
    if (isDesktop) {
      document.documentElement.classList.add('is-desktop');
      if (isMac) {
        document.documentElement.classList.add('is-mac');
      }
    }
  }, [isDesktop, isMac]);

  useEffect(() => {
    const tokens = whiteLabelConfig?.tokens;
    if (tokens?.colorPrimary) {
      document.documentElement.style.setProperty('--color-primary-500', tokens.colorPrimary);
    } else {
      document.documentElement.style.setProperty('--color-primary-500', '#6366f1'); // default
    }
    if (tokens?.colorSecondary) {
      document.documentElement.style.setProperty('--color-accent-500', tokens.colorSecondary);
    } else {
      document.documentElement.style.setProperty('--color-accent-500', '#8b5cf6'); // default
    }
  }, [whiteLabelConfig]);

  return (
    <>
      <ThemeSwitcher />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard & App Pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<SuperAdminDashboard />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/messaging" element={<MessagingPage />} />
          <Route path="/gradebook" element={<GradebookPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
