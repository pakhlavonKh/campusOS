import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  theme: Record<string, string> | null;
  
  setAuth: (token: string, user: User, organizationId: string, theme?: Record<string, string>) => void;
  setTheme: (theme: Record<string, string>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      organizationId: null,
      theme: null,

      setAuth: (token, user, organizationId, theme) => set({ token, user, organizationId, theme: theme || null }),
      
      setTheme: (theme) => set({ theme }),

      logout: () => set({ token: null, user: null, organizationId: null, theme: null }),
      
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
