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
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';

// Mock Theme Switcher for testing Whitelabeling
function ThemeSwitcher() {
  const { theme, setTheme } = useAuthStore();
  
  const toggleTheme = () => {
    if (theme?.primaryColor === '#e11d48') {
      setTheme({ primaryColor: '#6366f1', secondaryColor: '#4f46e5' });
    } else {
      setTheme({ primaryColor: '#e11d48', secondaryColor: '#be123c' });
    }
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        zIndex: 9999,
        fontWeight: 'bold',
      }}
    >
      Toggle Theme
    </button>
  );
}

function App() {
  const theme = useAuthStore((state) => state.theme);

  useEffect(() => {
    if (theme?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary-500', theme.primaryColor);
    } else {
      document.documentElement.style.setProperty('--color-primary-500', '#6366f1'); // default
    }
    if (theme?.secondaryColor) {
      document.documentElement.style.setProperty('--color-accent-500', theme.secondaryColor);
    } else {
      document.documentElement.style.setProperty('--color-accent-500', '#8b5cf6'); // default
    }
  }, [theme]);

  return (
    <>
      <ThemeSwitcher />
      <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/gradebook" element={<GradebookPage />} />
        <Route path="/discussions" element={<DiscussionsPage />} />
        
        {/* Super Admin */}
        <Route path="/admin" element={<SuperAdminDashboard />} />
        <Route path="/admin/organizations" element={<OrganizationsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
