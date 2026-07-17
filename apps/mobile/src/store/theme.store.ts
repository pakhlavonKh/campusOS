import { create } from 'zustand';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loading: boolean;
  error: string | null;
  
  setTheme: (
    primaryColor: string, 
    secondaryColor: string, 
    fontFamily?: string,
    logoUrl?: string | null,
    faviconUrl?: string | null
  ) => void;
  fetchTheme: (slug: string, backendUrl?: string) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  primaryColor: '#6366f1', // Default Indigo
  secondaryColor: '#4f46e5',
  fontFamily: 'System',
  logoUrl: null,
  faviconUrl: null,
  loading: false,
  error: null,
  
  setTheme: (primaryColor, secondaryColor, fontFamily = 'System', logoUrl = null, faviconUrl = null) => 
    set({ primaryColor, secondaryColor, fontFamily, logoUrl, faviconUrl }),

  fetchTheme: async (slug: string, backendUrl = 'http://localhost:3000') => {
    set({ loading: true, error: null });
    try {
      // In React Native development, 'localhost' refers to the emulator/device itself.
      // In production, the backendUrl is configured globally.
      const url = `${backendUrl}/api/organizations/${slug}/white-label/public`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to resolve organization theme.');
      }
      const result = await response.json();
      if (result.success && result.data && result.data.tokens) {
        const { tokens } = result.data;
        set({
          primaryColor: tokens.colorPrimary || '#6366f1',
          secondaryColor: tokens.colorSecondary || '#4f46e5',
          fontFamily: tokens.fontFamily || 'System',
          logoUrl: tokens.logoUrl || null,
          faviconUrl: tokens.faviconUrl || null,
          loading: false,
        });
      } else {
        throw new Error('Invalid theme token response format.');
      }
    } catch (err: any) {
      console.warn('Failed to fetch mobile theme config:', err.message);
      set({ error: err.message, loading: false });
    }
  },
}));
