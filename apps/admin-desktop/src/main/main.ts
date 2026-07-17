import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const STATE_FILE = path.join(app.getPath('userData'), 'admin-window-state.json');

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized?: boolean;
}

function getSavedState(): WindowState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load window state:', err);
  }
  return { width: 1280, height: 800 };
}

function saveState(window: BrowserWindow) {
  try {
    const bounds = window.getBounds();
    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: window.isMaximized(),
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8');
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

function createWindow() {
  const state = getSavedState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
    title: 'CampusOS Platform Super Admin Console',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  if (state.isMaximized) {
    mainWindow.maximize();
  }

  loadApp();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('resize', () => {
    if (mainWindow) saveState(mainWindow);
  });
  mainWindow.on('move', () => {
    if (mainWindow) saveState(mainWindow);
  });

  // Secure navigation: restrict external URL openings to system browser
  mainWindow.webContents.on('will-navigate', (event: any, url: string) => {
    try {
      const parsed = new URL(url);
      if (isDev && parsed.hostname === 'localhost') return;
      event.preventDefault();
      shell.openExternal(url);
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        shell.openExternal(url);
      }
    } catch (e) {
      console.error('Blocked open window handler due to invalid URL:', url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadApp() {
  if (!mainWindow) return;
  if (isDev) {
    // Run on a separate port 5180 for the platform admin console
    mainWindow.loadURL('http://localhost:5180');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// IPC Handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// Enforce Platform Super Admin role verification at the Electron level (SDD §3.2.3.2)
ipcMain.handle('auth:verify-token-role', (_event: any, token: string): { valid: boolean; error?: string } => {
  try {
    // Decodes JWT payload to verify claims locally
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString();
    const payload = JSON.parse(jsonPayload);

    const roles = payload.roles || [];
    if (!roles.includes('platform_super_admin')) {
      return { valid: false, error: 'Forbidden: Access restricted to Platform Super Admins only.' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Invalid Token' };
  }
});

ipcMain.on('notification:show', (_event: any, { title, body }: { title: string; body?: string }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('app:version', () => {
  return app.getVersion();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
