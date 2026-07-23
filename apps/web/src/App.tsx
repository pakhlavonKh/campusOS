/**
 * App.tsx — Root router.
 *
 * Route structure:
 *  /login                  — Public. Redirects authenticated users to /dashboard.
 *  <ProtectedRoute>        — Requires a valid JWT; unauthenticated users → /login.
 *    <DashboardLayout>     — Shared shell (sidebar/topbar, role-filtered nav).
 *      /dashboard          — All authenticated roles.
 *      /courses            — All authenticated roles.
 *      /attendance         — All authenticated roles.
 *      /messaging          — All authenticated roles.
 *      /gradebook          — All authenticated roles.
 *      /discussions        — All authenticated roles.
 *
 *      <AdminRoute>        — super_admin | org_admin | branch_admin only.
 *        /users
 *        /settings
 *
 *      <SuperAdminRoute>   — super_admin only (SRS §5.28 / SDD §3.2.3.2).
 *        /admin
 *        /organizations
 *
 *  *                       — Catch-all: authenticated → /dashboard, else /login.
 *
 * SRS §5.28 NOTE: /admin and /organizations are scaffold routes for the super_admin
 * role that MUST be migrated to apps/admin-desktop before production. They are kept
 * here temporarily behind a strict SuperAdminRoute guard.
 */

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
// ── New pages (GAP-FE-02) ─────────────────────────────────────────────────
import { SchedulePage } from './pages/schedule/SchedulePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { GroupsPage } from './pages/groups/GroupsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { BranchesPage } from './pages/branches/BranchesPage';
import { CRMPage } from './pages/crm/CRMPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AssessmentPage } from './pages/assessment/AssessmentPage';
import { VoicePage } from './pages/voice/VoicePage';
import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  RoleRoute,
} from './components/auth/ProtectedRoute';
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
  const token = useAuthStore((state) => state.token);
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
      document.documentElement.style.setProperty('--color-primary-500', '#6366f1');
    }
    if (tokens?.colorSecondary) {
      document.documentElement.style.setProperty('--color-accent-500', tokens.colorSecondary);
    } else {
      document.documentElement.style.setProperty('--color-accent-500', '#8b5cf6');
    }
  }, [whiteLabelConfig]);

  return (
    <>
      <ThemeSwitcher />
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        {/*
         * Already-authenticated users visiting /login are redirected to the
         * dashboard so they don't re-login unnecessarily.
         */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* ── Protected — all authenticated roles ────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* General pages — visible to every authenticated role */}
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/courses"        element={<CoursesPage />} />
            <Route path="/attendance"     element={<AttendancePage />} />
            <Route path="/messaging"      element={<MessagingPage />} />
            <Route path="/gradebook"      element={<GradebookPage />} />
            <Route path="/discussions"    element={<DiscussionsPage />} />
            <Route path="/assessments"    element={<AssessmentPage />} />
            <Route path="/voice"          element={<VoicePage />} />
            <Route path="/schedule"       element={<SchedulePage />} />
            <Route path="/notifications"  element={<NotificationsPage />} />
            <Route path="/profile"        element={<ProfilePage />} />

            {/* Parent + all admin roles — payments */}
            <Route element={<RoleRoute allowedRoles={['parent', 'org_admin', 'branch_admin', 'super_admin']} />}>
              <Route path="/payments" element={<PaymentsPage />} />
            </Route>

            {/* Teacher + admin tier — groups */}
            <Route element={<RoleRoute allowedRoles={['teacher', 'assistant_teacher', 'org_admin', 'branch_admin', 'super_admin']} />}>
              <Route path="/groups" element={<GroupsPage />} />
            </Route>

            {/* Admin tier — super_admin | org_admin | branch_admin */}
            <Route element={<AdminRoute />}>
              <Route path="/users"     element={<UsersPage />} />
              <Route path="/settings"  element={<SettingsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/branches"  element={<BranchesPage />} />
              <Route path="/crm"       element={<CRMPage />} />
            </Route>

            {/*
             * Super-admin tier — super_admin ONLY.
             * SRS §5.28 / SDD §3.2.3.2:
             *   These routes are a temporary scaffold and MUST be moved to
             *   apps/admin-desktop before production. They are kept here strictly
             *   guarded so no other role can reach them via URL manipulation.
             */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/admin"         element={<SuperAdminDashboard />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
            </Route>

          </Route>
        </Route>

        {/* ── Catch-all ──────────────────────────────────────────────────── */}
        {/*
         * Authenticated users go to /dashboard.
         * Unauthenticated users go to /login (ProtectedRoute will handle the
         * redirect, but this provides a fast path for the catch-all case).
         */}
        <Route
          path="*"
          element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
