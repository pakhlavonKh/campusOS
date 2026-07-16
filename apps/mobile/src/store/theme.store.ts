import { create } from 'zustand';

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  setTheme: (primary: string, secondary: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  primaryColor: '#6366f1', // Default indigo
  secondaryColor: '#4f46e5',
  
  setTheme: (primaryColor, secondaryColor) => set({ primaryColor, secondaryColor }),
}));
