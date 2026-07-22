import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore, WhiteLabelConfig } from '../store/auth.store';

interface ThemeContextType {
  config: WhiteLabelConfig | null;
  loading: boolean;
  error: Error | null;
}

const ThemeContext = createContext<ThemeContextType>({
  config: null,
  loading: true,
  error: null,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { whiteLabelConfig, setWhiteLabelConfig } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchThemeConfig = async () => {
      try {
        // Resolve tenant slug from URL
        let slug = 'default';
        const host = window.location.hostname;
        if (host !== 'localhost' && !host.startsWith('127.0.0.1')) {
          slug = host.split('.')[0];
        } else {
          const params = new URLSearchParams(window.location.search);
          slug = params.get('tenant') || localStorage.getItem('tenant-slug') || 'default';
        }

        // Cache slug locally for development/refresh persistence
        if (slug !== 'default') {
          localStorage.setItem('tenant-slug', slug);
        }

        const response = await fetch(`/api/v1/organizations/${slug}/white-label/public`);
        if (!response.ok) {
          throw new Error('Failed to resolve white-label configuration');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setWhiteLabelConfig(result.data);
        }
      } catch (err: any) {
        console.error('White-label resolution error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeConfig();
  }, [setWhiteLabelConfig]);

  // Inject CSS Custom Properties when config changes
  useEffect(() => {
    const config = whiteLabelConfig;
    if (!config || !config.tokens) {
      // Use defaults if no configuration available
      document.documentElement.style.setProperty('--color-primary-500', '#6366f1');
      document.documentElement.style.setProperty('--color-accent-500', '#8b5cf6');
      document.body.style.fontFamily = "'Inter', sans-serif";
      return;
    }

    const { tokens } = config;

    // Inject Primary & Accent Colors
    if (tokens.colorPrimary) {
      document.documentElement.style.setProperty('--color-primary-500', tokens.colorPrimary);
      // Generate hover/focus variations dynamically or use fallback
      document.documentElement.style.setProperty('--color-primary-600', adjustColorBrightness(tokens.colorPrimary, -15));
      document.documentElement.style.setProperty('--color-primary-400', adjustColorBrightness(tokens.colorPrimary, 15));
    }

    if (tokens.colorSecondary) {
      document.documentElement.style.setProperty('--color-accent-500', tokens.colorSecondary);
      document.documentElement.style.setProperty('--color-accent-600', adjustColorBrightness(tokens.colorSecondary, -15));
      document.documentElement.style.setProperty('--color-accent-400', adjustColorBrightness(tokens.colorSecondary, 15));
    }

    // Inject Font Family
    if (tokens.fontFamily) {
      document.documentElement.style.setProperty('--font-body', `'${tokens.fontFamily}', sans-serif`);
      document.body.style.fontFamily = `'${tokens.fontFamily}', sans-serif`;
    }

    // Dynamically Swap Favicon
    if (tokens.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = tokens.faviconUrl;
    }
  }, [whiteLabelConfig]);

  return (
    <ThemeContext.Provider value={{ config: whiteLabelConfig, loading, error }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Utility helper to lighten or darken Hex colors for hover variations
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
