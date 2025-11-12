# 🛡️ Esther Security Remediation — Step-by-Step Guide for You

This is your **actionable checklist** to secure the Esther codebase. Follow these steps in order.

---

## STEP 1: Install Security Dependencies

Run these commands in your terminal:

```bash
cd /Users/ayeshaniazi/Documents/Esther

# Install common security packages
npm install helmet p-queue dompurify winston

# Add TypeScript types
npm install --save-dev @types/dompurify @types/node

# Optional: npm audit to check for known CVEs
npm audit
```

---

## STEP 2: Create URL Validation Utility

Create a new file: `backend/src/utils/validation.ts`

```typescript
import { URL as URLClass } from 'url';

/**
 * Validate URL for SSRF attacks
 * - Only allow http/https
 * - Block localhost/private IPs
 * - Block reserved IP ranges
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URLClass(urlString);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.warn(`Invalid protocol: ${url.protocol}`);
      return false;
    }
    
    // Block localhost/private IPs
    const hostname = url.hostname;
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(hostname)) {
      console.warn(`Blocked private hostname: ${hostname}`);
      return false;
    }
    
    // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const privateIpPattern = /^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./;
    if (privateIpPattern.test(hostname)) {
      console.warn(`Blocked private IP: ${hostname}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn(`Invalid URL format: ${urlString}`);
    return false;
  }
}

/**
 * Validate planet/asteroid body name (alphanumeric + spaces/hyphens only)
 */
export function validateBodyName(bodyName: string): boolean {
  if (typeof bodyName !== 'string') return false;
  if (bodyName.length === 0 || bodyName.length > 100) return false;
  
  // Only allow: letters, numbers, spaces, hyphens, parentheses
  return /^[a-zA-Z0-9\s\-()]+$/.test(bodyName);
}

/**
 * Sanitize numeric input with range validation
 */
export function validateNumberInRange(
  value: any,
  min: number,
  max: number
): number | null {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    console.warn(`Invalid number: ${value}`);
    return null;
  }
  
  if (num < min || num > max) {
    console.warn(`Number out of range: ${num} (${min}-${max})`);
    return null;
  }
  
  return num;
}
```

**Then update** `backend/src/services/planetary-data.ts`:

Replace the `fetchJPLSmallBodyData` function:

```typescript
import { validateBodyName } from '../utils/validation';

async fetchJPLSmallBodyData(bodyName: string): Promise<PlanetaryData | null> {
  // ADD THIS LINE: Validate input
  if (!validateBodyName(bodyName)) {
    console.error('Invalid body name:', bodyName);
    return null;
  }

  try {
    const response = await axios.get(`${this.jplSbdbBase}.api`, {
      params: {
        des: bodyName.trim(),
        fields: 'full',
      },
      timeout: 10000,
    });
    // ... rest of function
```

**Update** `backend/src/services/news-filter.ts`:

Add at the top:
```typescript
import { isValidUrl } from '../utils/validation';
```

In `fetchFilteredNews()` method, replace the loop:
```typescript
const enabledSources = this.settings.newsFiltering.sources.filter(
  (s) => s.enabled && isValidUrl(s.url)  // ← ADD isValidUrl check
);
```

---

## STEP 3: Implement Input Sanitization for RSS

Update `backend/src/services/news-filter.ts`:

Add at the top:
```typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify for Node.js
const window = new JSDOM('').window;
const purify = DOMPurify(window);
```

Replace the `articles.push()` section in `fetchFilteredNews()`:

```typescript
articles.push({
  id: this.hashUrl(item.link),
  title: purify.sanitize(title, { ALLOWED_TAGS: [] }),  // Strip all HTML
  link: this.validateUrl(item.link) ? item.link : '',    // ← Add URL validation
  source: source.name,
  sourceId: source.id,
  pubDate: new Date(item.pubDate || Date.now()),
  description: purify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  }),
  category: source.category,
  relevanceScore: relevance,
});

// Add this helper method
private validateUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}
```

Install jsdom:
```bash
npm install jsdom
```

---

## STEP 4: Add Rate Limiting

Create `backend/src/utils/rate-limiter.ts`:

```typescript
import PQueue from 'p-queue';

// Allow 50 requests per minute
export const apiQueue = new PQueue({
  interval: 60000,        // 1 minute
  intervalCap: 50,        // 50 requests max
  concurrency: 2,         // 2 concurrent requests
  timeout: 15000,         // 15 second timeout per request
});

export async function queueApiCall<T>(
  fn: () => Promise<T>,
  name: string = 'API Call'
): Promise<T> {
  console.log(`Queued: ${name}`);
  return apiQueue.add(fn);
}
```

Update `backend/src/services/news-filter.ts`:

```typescript
import { queueApiCall } from '../utils/rate-limiter';

// In fetchFilteredNews():
for (const source of enabledSources) {
  try {
    const feed = await queueApiCall(
      () => parser.parseURL(source.url),
      `Fetch news from ${source.name}`
    );
    // ... rest
```

---

## STEP 5: Add Security Headers with Helmet

Create `backend/src/middleware/security.ts`:

```typescript
import express from 'express';
import helmet from 'helmet';

export function setupSecurityHeaders(app: express.Application) {
  // Use helmet for standard security headers
  app.use(helmet());

  // Custom headers
  app.use((req, res, next) => {
    // Strict Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https:; " +
      "connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov https://www.nasa.gov https://www.esa.int https://www.space.com https://arxiv.org; " +
      "font-src 'self'; " +
      "frame-ancestors 'none';"
    );

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  });
}
```

In your main backend file (`backend/src/main.ts` or wherever Express is initialized):

```typescript
import express from 'express';
import { setupSecurityHeaders } from './middleware/security';

const app = express();

// Apply security headers FIRST
setupSecurityHeaders(app);

// Then other middleware
app.use(express.json());
```

---

## STEP 6: Create Electron Preload Script

Create `frontend/public/preload.ts`:

```typescript
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Preload script - runs before renderer loads
 * Exposes only SAFE APIs to the frontend via context isolation
 */

contextBridge.exposeInMainWorld('estherAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Planet data
  getPlanetPositions: () => ipcRenderer.invoke('get-planet-positions'),
  getPlanetProfile: (name: string) => ipcRenderer.invoke('get-planet-profile', name),

  // News
  getNews: () => ipcRenderer.invoke('get-news'),

  // Event listeners (renderer can listen, not send raw events)
  onPlanetUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('planet-update', (_, data) => callback(data));
  },
  onNewsUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('news-update', (_, data) => callback(data));
  },
});

// TypeScript support
declare global {
  interface Window {
    estherAPI: {
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<void>;
      getPlanetPositions: () => Promise<any>;
      getPlanetProfile: (name: string) => Promise<any>;
      getNews: () => Promise<any>;
      onPlanetUpdate: (callback: (data: any) => void) => void;
      onNewsUpdate: (callback: (data: any) => void) => void;
    };
  }
}
```

Create `frontend/public/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import * as fs from 'fs/promises';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,           // ✅ CRITICAL: Disable Node in renderer
      contextIsolation: true,           // ✅ CRITICAL: Enable context isolation
      enableRemoteModule: false,        // ✅ Disable remote module
      preload: path.join(__dirname, 'preload.ts'),
      sandbox: true,                    // ✅ Enable sandbox
      // Security: disable features we don't need
      devTools: !isDev,                 // Only allow devtools in dev
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
```

---

## STEP 7: Update Frontend Settings Component

Update `frontend/src/components/SettingsPanel.tsx`:

Replace the `handleIntervalChange` function:

```typescript
import { validateNumberInRange } from '../utils/validation';  // Import from backend utils
import { SETTING_RANGES } from '../../../backend/src/config/settings';

const handleIntervalChange = (key: string, value: string) => {
  const numValue = validateNumberInRange(
    value,
    SETTING_RANGES[key as keyof typeof SETTING_RANGES]?.min || 0,
    SETTING_RANGES[key as keyof typeof SETTING_RANGES]?.max || Infinity
  );

  if (numValue === null) {
    console.error('Invalid interval value');
    return;
  }

  setSettings({
    ...settings,
    [key]: numValue,
  });
};
```

Add error handling to `handleSave`:

```typescript
const handleSave = async () => {
  try {
    // Validate before sending
    if (!settings.newsFiltering || !Array.isArray(settings.newsFiltering.sources)) {
      throw new Error('Invalid settings structure');
    }

    // Call backend
    const response = await fetch('http://localhost:5000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.statusText}`);
    }

    onSave(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    // Show user-friendly error message
    alert('Failed to save settings. Please try again.');
  }
};
```

---

## STEP 8: Add Structured Logging

Create `backend/src/logger.ts`:

```typescript
import winston from 'winston';
import path from 'path';

const logsDir = path.join(process.env.HOME || '/tmp', '.esther/logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'esther' },
  transports: [
    // Only log to file in production
    process.env.NODE_ENV === 'production'
      ? new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' })
      : new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
  ],
});

export default logger;
```

Replace all `console.log/error` with:

```typescript
import logger from './logger';

// Instead of: console.log('Fetching from NASA...')
logger.info('Fetching news source', { source: 'NASA' });

// Instead of: console.error('API failed')
logger.error('Failed to fetch data', { source: 'NASA', error: error.message });
```

---

## STEP 9: Fix Dependency Versions

Edit `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "1.6.2",
    "dompurify": "3.0.6"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "electron": "27.0.0",
    "electron-builder": "24.6.4",
    "typescript": "5.2.2",
    "@types/react": "18.2.37",
    "@types/react-dom": "18.2.15",
    "@testing-library/react": "14.0.0"
  }
}
```

Edit `backend/package.json`:

```json
{
  "dependencies": {
    "express": "4.18.2",
    "axios": "1.6.2",
    "rss-parser": "3.13.0",
    "dotenv": "16.3.1",
    "helmet": "7.1.0",
    "p-queue": "7.4.1",
    "dompurify": "3.0.6",
    "jsdom": "22.1.0",
    "winston": "3.11.0"
  },
  "devDependencies": {
    "typescript": "5.2.2",
    "@types/express": "4.17.21",
    "@types/node": "20.10.5",
    "@types/dompurify": "3.0.5",
    "nodemon": "3.0.2",
    "ts-node": "10.9.2",
    "jest": "29.7.0",
    "@types/jest": "29.5.11",
    "ts-jest": "29.1.1"
  }
}
```

Then run:
```bash
npm ci  # Use npm ci instead of npm install for production
```

---

## STEP 10: Run Security Audit

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically (carefully review changes)
npm audit fix

# Generate security report
npm audit --json > audit-report.json
```

---

## STEP 11: Create Environment File Securely

```bash
# Create .env file (NEVER commit to git)
cp .env.example .env.local

# Edit with your API keys (if you have any)
nano .env.local

# Make sure it's in .gitignore
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

---

## STEP 12: Update .gitignore

Create/update `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# Dependencies
node_modules/
/.pnp
.pnp.js

# Build
/build
/dist
out/

# Electron
electron-builder/
release/

# macOS
.DS_Store
*.dmg

# Windows
Thumbs.db
*.exe

# VSCode
.vscode/
*.code-workspace

# IDE
.idea/
*.swp
*.swo

# Test coverage
coverage/
.nyc_output/

# Temp files
*.tmp
.cache/

# User settings (local)
~/.esther/
```

---

## STEP 13: Add Pre-Commit Security Checks

Create `.husky/pre-commit` (if using husky):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint 2>&1

# Run type check
npx tsc --noEmit 2>&1

# Run security audit
npm audit --production 2>&1
```

Install husky:
```bash
npm install husky --save-dev
npx husky install
```

---

## STEP 14: Final Verification Checklist

Run through this before launching:

```bash
# Install all dependencies
npm install

# Build frontend
npm run build:web

# Build backend
npm run build:api

# Run tests
npm run test

# Check types
npx tsc --noEmit

# Audit dependencies
npm audit

# Test locally
npm run dev

# Verify Electron sandbox is enabled (in DevTools Console):
# window.estherAPI  ← Should exist
# require('fs')     ← Should FAIL (no Node access)
```

---

## 🔒 Security Best Practices Going Forward

1. **Always validate external input** — Never trust URLs, API responses, user settings
2. **Update dependencies monthly** — `npm audit` and fix CVEs
3. **Use HTTPS everywhere** — No HTTP in production
4. **Log securely** — Never log passwords, tokens, or PII
5. **Sanitize user data** — DOMPurify for any HTML content
6. **Rate limit API calls** — Prevent DoS and quota exhaustion
7. **Sandbox the renderer** — Keep `nodeIntegration: false`
8. **Review error messages** — Don't expose internals to users
9. **Pin dependencies** — Exact versions in production
10. **Test security** — Add security tests to your CI/CD

---

## 📞 Questions?

Check these for detailed info:
- `SECURITY_AUDIT_REPORT.md` — Full audit with evidence
- `CONTRIBUTING.md` — Development guidelines
- `.github/copilot-instructions.md` — Architecture & patterns

**Total Time Estimate**: 2-3 hours for all 14 steps.  
**Difficulty**: Intermediate (copying & pasting mostly, with small logic updates)

Good luck! 🛡️
