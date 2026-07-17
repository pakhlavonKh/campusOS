import { useEffect, useState } from 'react';

// Declare global interface so TypeScript knows about window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      sendNotification: (title: string, body?: string) => void;
      openExternal: (url: string) => void;
      getAppVersion: () => Promise<string>;
      onNetworkStatusChange: (callback: (status: 'online' | 'offline') => void) => () => void;
      retryConnection: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

export function useDesktop() {
  const [isDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
  });

  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [isMac] = useState<boolean>(() => {
    return typeof window !== 'undefined' && (
      navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.userAgent.includes('Macintosh')
    );
  });

  useEffect(() => {
    if (!isDesktop || !window.electronAPI) return;

    window.electronAPI.getAppVersion().then((version) => {
      setAppVersion(version);
    }).catch((err) => {
      console.error('Failed to get electron app version:', err);
    });
  }, [isDesktop]);

  const sendNotification = (title: string, body?: string) => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.sendNotification(title, body);
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      console.log('Notification:', title, body);
    }
  };

  const openExternal = (url: string) => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const minimize = () => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const maximize = () => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const close = () => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return {
    isDesktop,
    isMac,
    appVersion,
    sendNotification,
    openExternal,
    minimize,
    maximize,
    close,
  };
}

