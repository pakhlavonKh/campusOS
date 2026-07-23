/**
 * auth.store.ts — Zustand authentication store.
 *
 * SRS §5.1  — Session management: JWT token, user identity, organization context.
 * SRS §5.30 — Multi-Membership support: a user may hold (org, branch, role) tuples.
 *             The activeMembership drives role-based rendering. Context switching
 *             changes activeMembership without a full re-login.
 * SDD §3.2.2 — Users Context: Membership entity links user → org → branch → role(s).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhiteLabelConfig {
  tier: 'token' | 'layout_variant' | 'custom_build';
  tokens: {
    colorPrimary: string;
    colorSecondary: string;
    fontFamily: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    customDomain: string | null;
  };
  layoutVariant: string | null;
  customBuildRef: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Flat role — used when the user has a single membership (most common case). */
  role?: string;
  /** All roles held across memberships — used to build the Membership list. */
  roles?: string[];
}

/**
 * Membership — SRS §5.30, SDD §3.2.2.
 * Represents a single (organization, branch, role) combination a user belongs to.
 * Users with multiple memberships can switch between them without re-logging in.
 */
export interface Membership {
  /** Unique identifier for this membership record. */
  id: string;
  organizationId: string;
  organizationName: string;
  branchId: string | null;
  branchName: string | null;
  /** The role held in this specific (org, branch) context. */
  role: string;
  /** Display label shown in the context switcher. */
  label: string;
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface AuthState {
  token: string | null;
  user: User | null;
  /** Deprecated flat organizationId; prefer activeMembership.organizationId. */
  organizationId: string | null;
  whiteLabelConfig: WhiteLabelConfig | null;
  /** Legacy compatibility field for components that read theme tokens directly. */
  theme: Record<string, string> | null;

  // ── Multi-Membership (SRS §5.30) ──────────────────────────────────────────
  /** All memberships this user holds across organizations and branches. */
  memberships: Membership[];
  /** The currently active membership that drives role-based rendering. */
  activeMembership: Membership | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  setAuth: (
    token: string,
    user: User,
    organizationId: string,
    whiteLabelConfig?: WhiteLabelConfig,
    memberships?: Membership[],
  ) => void;
  setWhiteLabelConfig: (config: WhiteLabelConfig) => void;
  /**
   * switchMembership — SRS §5.30 context switch.
   * Changes the active (org, branch, role) context without re-login.
   * Immediately re-scopes role-based rendering; the caller is responsible
   * for clearing stale page data (e.g., reset React Query cache or navigate to /dashboard).
   */
  switchMembership: (membershipId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set: any, get: any) => ({
      token: null as string | null,
      user: null as User | null,
      organizationId: null as string | null,
      whiteLabelConfig: null as WhiteLabelConfig | null,
      theme: null as Record<string, string> | null,

      memberships: [] as Membership[],
      activeMembership: null as Membership | null,

      setAuth: (
        token: string,
        user: User,
        organizationId: string,
        config?: WhiteLabelConfig,
        memberships?: Membership[],
      ) => {
        const legacyTheme = config?.tokens
          ? {
              primaryColor: config.tokens.colorPrimary,
              secondaryColor: config.tokens.colorSecondary,
            }
          : undefined;

        // Derive memberships list if not explicitly provided by the backend.
        // Falls back to constructing one synthetic membership from the flat
        // role field — supports the existing single-role backend response shape.
        const resolvedMemberships: Membership[] =
          memberships && memberships.length > 0
            ? memberships
            : (user.roles || (user.role ? [user.role] : ['student'])).map(
                (role, index): Membership => ({
                  id: `m_${user.id}_${index}`,
                  organizationId,
                  organizationName: 'Default Organization',
                  branchId: null,
                  branchName: null,
                  role,
                  label: role
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' '),
                }),
              );

        // Restore the most recently used membership if it still exists,
        // otherwise default to the first one (SRS §5.30: "most recently used
        // context is remembered as the default on next login").
        const previousActiveId = get().activeMembership?.id;
        const restoredActive =
          resolvedMemberships.find((m) => m.id === previousActiveId) ??
          resolvedMemberships[0] ??
          null;

        set({
          token,
          user,
          organizationId,
          whiteLabelConfig: config || null,
          theme: legacyTheme || null,
          memberships: resolvedMemberships,
          activeMembership: restoredActive,
        });
      },

      setWhiteLabelConfig: (config: WhiteLabelConfig) => {
        const legacyTheme = {
          primaryColor: config.tokens.colorPrimary,
          secondaryColor: config.tokens.colorSecondary,
        };
        set({ whiteLabelConfig: config, theme: legacyTheme });
      },

      /**
       * switchMembership — SRS §5.30.
       * Must immediately re-scope data, navigation, and permissions to the
       * selected membership. UI components derive their role from activeMembership.
       */
      switchMembership: (membershipId: string) => {
        const { memberships } = get() as AuthState;
        const target = memberships.find((m) => m.id === membershipId);
        if (!target) return;
        set({
          activeMembership: target,
          // Keep the flat organizationId in sync for legacy consumers.
          organizationId: target.organizationId,
        });
      },

      logout: () =>
        set({
          token: null,
          user: null,
          organizationId: null,
          whiteLabelConfig: null,
          theme: null,
          memberships: [],
          activeMembership: null,
        }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    },
  ),
);
