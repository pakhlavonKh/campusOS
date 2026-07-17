import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script — isolates window context and exposes controlled IPC handlers.
 * SDD §3.2.3.2 and §14.0.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  verifyTokenRole: (token: string) => ipcRenderer.invoke('auth:verify-token-role', token),
  showNotification: (title: string, body?: string) => ipcRenderer.send('notification:show', { title, body }),
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});
