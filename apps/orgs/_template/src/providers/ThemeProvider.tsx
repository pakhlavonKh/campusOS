import React, { createContext, useContext, useEffect } from 'react';
import orgConfig from '../../org.config.json';

interface ThemeContextType {
  tenantId: string;
  name: string;
  apiUrl: string;
  tokens: {
    colorPrimary: string;
    colorSecondary: string;
    fontFamily: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    customDomain: string | null;
  };
}

const ThemeContext = createContext<ThemeContextType>({
  tenantId: orgConfig.tenantId,
  name: orgConfig.name,
  apiUrl: orgConfig.apiUrl,
  tokens: orgConfig.tokens,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const tokens = orgConfig.tokens;
    if (tokens.colorPrimary) {
      document.documentElement.style.setProperty('--color-primary-500', tokens.colorPrimary);
      document.documentElement.style.setProperty('--color-primary-600', adjustColorBrightness(tokens.colorPrimary, -15));
      document.documentElement.style.setProperty('--color-primary-400', adjustColorBrightness(tokens.colorPrimary, 15));
    }
    if (tokens.colorSecondary) {
      document.documentElement.style.setProperty('--color-accent-500', tokens.colorSecondary);
      document.documentElement.style.setProperty('--color-accent-600', adjustColorBrightness(tokens.colorSecondary, -15));
      document.documentElement.style.setProperty('--color-accent-400', adjustColorBrightness(tokens.colorSecondary, 15));
    }
    if (tokens.fontFamily) {
      document.documentElement.style.setProperty('--font-body', `'${tokens.fontFamily}', sans-serif`);
      document.body.style.fontFamily = `'${tokens.fontFamily}', sans-serif`;
    }
  }, []);

  return (
    <ThemeContext.Provider value={orgConfig}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

function adjustColorBrightness(hex: string, percent: number): string {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, '0');
  const gHex = Math.round(G).toString(16).padStart(2, '0');
  const bHex = Math.round(B).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
