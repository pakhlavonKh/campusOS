import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  organizationId: string | null; // For multi-tenant context
  whiteLabelConfig: WhiteLabelConfig | null;
  theme: Record<string, string> | null; // Legacy compatibility
  
  setAuth: (
    token: string,
    user: User,
    organizationId: string,
    whiteLabelConfig?: WhiteLabelConfig,
  ) => void;
  setWhiteLabelConfig: (config: WhiteLabelConfig) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: any, get: any) => ({
      token: null,
      user: null,
      organizationId: null,
      whiteLabelConfig: null,
      theme: null,

      setAuth: (token: string, user: User, organizationId: string, config?: WhiteLabelConfig) => {
        const legacyTheme = config?.tokens
          ? {
              primaryColor: config.tokens.colorPrimary,
              secondaryColor: config.tokens.colorSecondary,
            }
          : undefined;

        set({
          token,
          user,
          organizationId,
          whiteLabelConfig: config || null,
          theme: legacyTheme || null,
        });
      },
      
      setWhiteLabelConfig: (config: WhiteLabelConfig) => {
        const legacyTheme = {
          primaryColor: config.tokens.colorPrimary,
          secondaryColor: config.tokens.colorSecondary,
        };
        set({ whiteLabelConfig: config, theme: legacyTheme });
      },

      logout: () => set({ token: null, user: null, organizationId: null, whiteLabelConfig: null, theme: null }),
      
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
