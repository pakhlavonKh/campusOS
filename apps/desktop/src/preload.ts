import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title: string, body?: string) => {
    ipcRenderer.send('notification:show', { title, body });
  },
  openExternal: (url: string) => {
    ipcRenderer.send('shell:openExternal', url);
  },
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  onNetworkStatusChange: (callback: (status: 'online' | 'offline') => void) => {
    const listener = (_event: any, status: 'online' | 'offline') => callback(status);
    ipcRenderer.on('network:status-change', listener);
    return () => {
      ipcRenderer.removeListener('network:status-change', listener);
    };
  },
  retryConnection: () => ipcRenderer.send('app:retry'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
});

