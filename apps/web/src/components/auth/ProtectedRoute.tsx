/**
 * ProtectedRoute & RoleRoute — Route-level authentication and authorization guards.
 *
 * SRS §5.1  — All protected pages require a valid session.
 * SRS §5.30 — Role-based route access: users may only reach routes their role permits.
 * SDD §3.2.3.2 — Platform Super Admin routes are isolated; non-super_admin users are
 *               rejected at the route level (defense-in-depth, never trust nav hiding alone).
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

// ---------------------------------------------------------------------------
// ProtectedRoute — blocks unauthenticated access to any wrapped route.
// Redirects to /login and preserves the originally requested path so the
// user can be returned there after a successful sign-in.
// ---------------------------------------------------------------------------
export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ---------------------------------------------------------------------------
// RoleRoute — blocks access to routes that require specific role(s).
// Must be nested inside <ProtectedRoute> so token is already guaranteed.
//
// Props:
//   allowedRoles  — array of role strings that may access this route.
//   redirectTo    — where to send unauthorized users (default: '/dashboard').
//
// Usage:
//   <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
//     <Route path="/admin" element={<SuperAdminDashboard />} />
//   </Route>
// ---------------------------------------------------------------------------
interface RoleRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleRoute({ allowedRoles, redirectTo = '/dashboard' }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  // Resolve the active role from the active membership or the flat role field.
  // This mirrors the resolution used by DashboardLayout and SessionContextProvider.
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (
    activeMembership?.role ||
    user?.role ||
    user?.roles?.[0] ||
    ''
  ).toLowerCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

// ---------------------------------------------------------------------------
// Convenience: pre-configured guard for super_admin-only routes.
// Reflects SRS §5.28 intent — super admin routes should be fully isolated,
// but until apps/admin-desktop is built, these routes live in apps/web
// behind this strict role guard and must never be reachable by other roles.
//
// NOTE (SRS §5.28): These routes are a temporary scaffold. They MUST be
// migrated to apps/admin-desktop before production release so that no
// platform-management code ships inside a customer-facing build.
// ---------------------------------------------------------------------------
export function SuperAdminRoute() {
  return <RoleRoute allowedRoles={['super_admin']} />;
}

// ---------------------------------------------------------------------------
// Convenience: pre-configured guard for admin-tier routes.
// Allows super_admin, org_admin, and branch_admin.
// ---------------------------------------------------------------------------
export function AdminRoute() {
  return <RoleRoute allowedRoles={['super_admin', 'org_admin', 'branch_admin']} />;
}
