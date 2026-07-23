import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as dns from 'dns';

// Disable hardware acceleration to avoid glitches in certain environments
app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let isOnline = true;
let networkInterval: NodeJS.Timeout | null = null;

// Window state storage configuration
interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized?: boolean;
}

function getSavedState(): WindowState {
  try {
    const stateFile = path.join(app.getPath('userData'), 'window-state.json');
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load window state:', err);
  }
  return { width: 1280, height: 800 };
}

function saveState(window: BrowserWindow) {
  try {
    const stateFile = path.join(app.getPath('userData'), 'window-state.json');
    const bounds = window.getBounds();
    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: window.isMaximized(),
    };
    fs.writeFileSync(stateFile, JSON.stringify(state), 'utf8');
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

function startNetworkMonitoring() {
  if (networkInterval) clearInterval(networkInterval);

  networkInterval = setInterval(() => {
    // Perform a quick DNS lookup to detect internet status
    dns.lookup('google.com', (err: any) => {
      const status = err ? 'offline' : 'online';
      const changed = (status === 'online') !== isOnline;
      if (changed) {
        isOnline = status === 'online';
        console.log(`Network status changed: ${status}`);
        mainWindow?.webContents.send('network:status-change', status);
      }
    });
  }, 5000);
}

function stopNetworkMonitoring() {
  if (networkInterval) {
    clearInterval(networkInterval);
    networkInterval = null;
  }
}

function createWindow() {
  const state = getSavedState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  if (state.isMaximized) {
    mainWindow.maximize();
  }

  // Load the web app
  loadApp();

  // Start checking connection status
  startNetworkMonitoring();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle failure to load (e.g. offline)
  mainWindow.webContents.on('did-fail-load', (event: any, errorCode: number, errorDescription: string, validatedURL: string) => {
    // Avoid redirect loop if offline page itself fails
    if (validatedURL.includes('offline.html')) return;
    
    console.log(`Failed to load URL: ${validatedURL}. Loading offline page.`);
    mainWindow?.loadFile(path.join(__dirname, 'offline.html'));
  });

  // Track window state on move/resize
  mainWindow.on('resize', () => {
    if (mainWindow) saveState(mainWindow);
  });
  mainWindow.on('move', () => {
    if (mainWindow) saveState(mainWindow);
  });

  // Safe navigation checks (Security Best Practice)
  mainWindow.webContents.on('will-navigate', (event: any, navigationUrl: string) => {
    try {
      const parsed = new URL(navigationUrl);
      if (isDev && parsed.hostname === 'localhost') return;
      
      // Prevent internal navigation to external sites; open them in browser instead
      event.preventDefault();
      shell.openExternal(navigationUrl);
    } catch (e) {
      event.preventDefault();
    }
  });

  // Handle links opening in a new window (e.g., target="_blank")
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
    stopNetworkMonitoring();
    mainWindow = null;
  });
}

function loadApp() {
  if (!mainWindow) return;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../web/dist/index.html'));
  }
}

// IPC listener registrations
ipcMain.on('shell:openExternal', (_event: any, url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      shell.openExternal(url);
    }
  } catch (err) {
    console.error('Blocked external open for invalid URL:', url);
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

ipcMain.handle('auth:verify-token-role', (_event: any, token: string): { valid: boolean; error?: string } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString();
    const payload = JSON.parse(jsonPayload);

    const roles: string[] = payload.roles || [];
    const allowedDesktopRoles = ['platform_super_admin', 'org_admin', 'branch_admin', 'admin', 'teacher', 'assistant_teacher'];
    const hasAllowedRole = roles.some((r) => allowedDesktopRoles.includes(r));

    if (!hasAllowedRole) {
      return {
        valid: false,
        error: 'Access Denied: Desktop application is restricted to Admin, Teacher, and Assistant Teacher accounts only.',
      };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Invalid Token' };
  }
});

ipcMain.on('app:retry', () => {
  console.log('Retry connection request received, reloading app...');
  loadApp();
});

// Frameless Window Control Handlers
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

// App lifecycle
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


