import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import * as fs from 'fs/promises';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,           // ✅ CRITICAL: Disable Node in renderer
      contextIsolation: true,           // ✅ CRITICAL: Enable context isolation
      preload: path.join(__dirname, 'preload.ts'),
      sandbox: true,                    // ✅ Enable sandbox
      devTools: isDev,                  // ✅ Enable devtools in dev mode
      webSecurity: true,                // HTTPS enforcement
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers - VALIDATE ALL INPUTS

ipcMain.handle('get-settings', async () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    const data = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {}; // Return defaults
  }
});

ipcMain.handle('save-settings', async (_, newSettings) => {
  // Validate settings object BEFORE saving
  validateSettingsObject(newSettings);

  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
});

function validateSettingsObject(settings: any): void {
  if (typeof settings !== 'object' || settings === null) {
    throw new Error('Settings must be an object');
  }

  // Validate update intervals
  if (settings.planetUpdateInterval !== undefined) {
    const val = settings.planetUpdateInterval;
    if (typeof val !== 'number' || val < 60000 || val > 3600000) {
      throw new Error('Invalid planetUpdateInterval');
    }
  }

  // Similar validation for other fields...
}

ipcMain.handle('get-planet-positions', async () => {
  // Call backend API to fetch planet positions
  const response = await fetch('http://localhost:5000/api/planets/positions');
  return response.json();
});

ipcMain.handle('get-news', async () => {
  const response = await fetch('http://localhost:5000/api/news');
  return response.json();
});
