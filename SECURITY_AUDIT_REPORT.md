# 🔐 Esther Project — Security Audit Report
## DevSecOps Analysis & Remediation Guide

**Audit Date**: November 12, 2025  
**Scope**: Frontend (React/Electron), Backend (Node/Express), Configuration, Dependencies  
**Standards**: OWASP Top 10, CWE, DevSecOps Best Practices

---

## Executive Summary

✅ **Overall Risk Level: MEDIUM (with actionable mitigations)**

The codebase demonstrates good foundational security practices (no hardcoded credentials, local-only data, trusted sources), but several vulnerabilities require immediate attention before production use. Below are **14 findings** across 5 categories.

---

## 🔴 CRITICAL ISSUES (Fix ASAP)

### 1. **Missing URL Validation (SSRF Risk)**
**File**: `backend/src/services/planetary-data.ts`, `backend/src/services/news-filter.ts`  
**Severity**: CRITICAL (CWE-918: Server-Side Request Forgery)  
**Risk**: Attacker could inject malicious URLs in settings, causing the app to request internal URLs or untrusted domains.

**Evidence**:
```typescript
// Line 89-93: axios.get() with unvalidated user-supplied URL
const response = await axios.get(`${this.jplSbdbBase}.api`, {
  params: {
    des: bodyName,  // ← bodyName not validated
    fields: 'full',
  },
});
```

**Impact**:
- RSS feed URL could be manipulated
- Could access internal/private URLs (localhost, intranet)
- Could be used for port scanning

**Fix**:
```typescript
// Add URL validation utility
import { URL as URLClass } from 'url';

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URLClass(urlString);
    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    // Block localhost/private IPs
    const hostname = url.hostname;
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) return false;
    // Block private IP ranges (basic check)
    if (/^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// Before parsing, validate:
const enabledSources = this.settings.newsFiltering.sources.filter(
  (s) => s.enabled && isValidUrl(s.url)  // ← Add validation
);
```

---

### 2. **Missing Input Validation on bodyName Parameter**
**File**: `backend/src/services/planetary-data.ts` (line 55)  
**Severity**: CRITICAL (CWE-20: Improper Input Validation)  
**Risk**: SQL Injection or command injection if bodyName is passed to a database/CLI later.

**Evidence**:
```typescript
async fetchJPLSmallBodyData(bodyName: string): Promise<PlanetaryData | null> {
  try {
    const response = await axios.get(`${this.jplSbdbBase}.api`, {
      params: {
        des: bodyName,  // ← No validation! Could contain special chars
        fields: 'full',
      },
    });
```

**Attack Example**: `bodyName = "123; DROP TABLE planets;--"`

**Fix**:
```typescript
async fetchJPLSmallBodyData(bodyName: string): Promise<PlanetaryData | null> {
  // Validate: only alphanumeric, spaces, hyphens, parentheses
  if (!/^[a-zA-Z0-9\s\-()]+$/.test(bodyName)) {
    console.error('Invalid bodyName:', bodyName);
    return null;
  }

  // Limit length
  if (bodyName.length > 100) {
    console.error('bodyName too long');
    return null;
  }

  try {
    const response = await axios.get(`${this.jplSbdbBase}.api`, {
      params: {
        des: bodyName.trim(),
        fields: 'full',
      },
    });
```

---

### 3. **No Rate Limiting on External API Calls**
**File**: `backend/src/services/news-filter.ts`, `backend/src/services/planetary-data.ts`  
**Severity**: CRITICAL (CWE-770: Allocation of Resources Without Limits)  
**Risk**: DoS attack. Attacker could trigger massive API requests, exhausting quotas or hitting rate limits.

**Evidence**:
```typescript
// Line 106: No rate limiting
async fetchFilteredNews(): Promise<NewsArticle[]> {
  for (const source of enabledSources) {
    try {
      const feed = await parser.parseURL(source.url);  // ← No queue/throttling
```

**Impact**:
- JPL API: typically 100 requests per minute
- NASA Horizons: rate limits enforced
- Could be blacklisted from these APIs

**Fix**:
```bash
# Install p-queue for rate limiting
npm install p-queue
```

```typescript
import PQueue from 'p-queue';

const queue = new PQueue({ interval: 60000, intervalCap: 50 }); // 50 reqs/min

async fetchFilteredNews(): Promise<NewsArticle[]> {
  for (const source of enabledSources) {
    try {
      const feed = await queue.add(() => parser.parseURL(source.url));
```

---

### 4. **Missing Content-Security-Policy (CSP) Headers**
**File**: Frontend (Electron main process)  
**Severity**: CRITICAL (CWE-693: Protection Mechanism Failure)  
**Risk**: XSS attacks could inject and execute arbitrary JavaScript.

**Impact**: If RSS feed contains malicious HTML/JavaScript, it could execute in the Electron renderer.

**Fix**: Create `backend/src/middleware/security.ts`:
```typescript
import express from 'express';
import helmet from 'helmet';

export function setupSecurityHeaders(app: express.Application) {
  // Use helmet for common security headers
  app.use(helmet());

  // Custom CSP: block inline scripts, allow only trusted sources
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval'; " +  // Electron needs some eval, but limit it
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https:; " +
      "connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov;"
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}
```

```bash
npm install helmet
```

---

## 🟠 HIGH SEVERITY ISSUES

### 5. **No Input Sanitization on RSS Content**
**File**: `backend/src/services/news-filter.ts` (line 117-128)  
**Severity**: HIGH (CWE-79: XSS)  
**Risk**: Malicious RSS feeds could include HTML/JavaScript that renders unsafely.

**Evidence**:
```typescript
articles.push({
  id: this.hashUrl(item.link),
  title,        // ← No sanitization
  link: item.link,  // ← URL not checked
  source: source.name,
  sourceId: source.id,
  pubDate: new Date(item.pubDate || Date.now()),
  description,  // ← Potentially malicious HTML
  category: source.category,
  relevanceScore: relevance,
});
```

**Fix**:
```bash
npm install dompurify
```

```typescript
import DOMPurify from 'dompurify';

// Sanitize before storing:
articles.push({
  id: this.hashUrl(item.link),
  title: DOMPurify.sanitize(item.title),
  link: new URL(item.link).href,  // Validate URL structure
  description: DOMPurify.sanitize(item.description || '', {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
  }),
  // ... rest
});
```

---

### 6. **Unsafe Type Coercion in Frontend**
**File**: `frontend/src/components/SettingsPanel.tsx` (line 57-63)  
**Severity**: HIGH (CWE-95: Improper Neutralization of Directives)  
**Risk**: User could pass non-numeric values to `parseInt()`, causing unexpected behavior.

**Evidence**:
```typescript
onChange={(e) =>
  handleIntervalChange('planetUpdateInterval', parseInt(e.target.value))
}
```

**Fix**:
```typescript
const handleIntervalChange = (key: string, value: string) => {
  const numValue = parseInt(value, 10);  // Explicit radix
  if (isNaN(numValue)) {
    console.error('Invalid interval value');
    return;
  }

  // Validate against SETTING_RANGES
  const range = SETTING_RANGES[key as keyof typeof SETTING_RANGES];
  if (range && (numValue < range.min || numValue > range.max)) {
    console.error(`Value ${numValue} outside valid range`);
    return;
  }

  setSettings({
    ...settings,
    [key]: numValue,
  });
};
```

---

### 7. **Missing Electron Sandbox & Preload Script**
**File**: Frontend entry point (NOT YET CREATED)  
**Severity**: HIGH (CWE-95: Improper Code Sandbox)  
**Risk**: Main process has direct access to Node APIs; renderer could access filesystem/system commands.

**Expected File**: `frontend/src/main.ts` or `frontend/public/electron.js`  
**Status**: ⚠️ NOT FOUND IN SCAFFOLD

**Fix**: Create `frontend/public/preload.ts`:
```typescript
// Minimal preload: only expose safe APIs to renderer
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  onPlanetUpdate: (callback: any) => ipcRenderer.on('planet-update', callback),
});
```

Create `frontend/public/main.ts`:
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,           // ✅ Disabled
      contextIsolation: true,           // ✅ Enabled
      enableRemoteModule: false,        // ✅ Disabled
      preload: path.join(__dirname, 'preload.ts'),
      sandbox: true,                    // ✅ Enabled
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Dev server
}

app.on('ready', createWindow);

// Safe IPC handlers (validate all inputs)
ipcMain.handle('get-settings', async () => {
  // Load from file/storage with validation
  return getSafeSettings();
});

ipcMain.handle('save-settings', async (_, newSettings) => {
  // Validate schema before saving
  validateSettings(newSettings);
  return saveSettings(newSettings);
});
```

---

### 8. **No Timeout on axios Requests**
**File**: `backend/src/services/planetary-data.ts` (line 34)  
**Severity**: HIGH (CWE-770: Resource Exhaustion)  
**Risk**: Hanging connections could block the app; slow RSS feeds could cause timeouts.

**Evidence**:
```typescript
// timeout: 10000 is set, BUT:
const response = await axios.get(`${this.nasaFactSheetBase}.html`, {
  timeout: 10000,  // ✅ This is fine
});
```

**Actually OK** (already has timeouts), but ensure consistency.

**Recommendation**: Add retry logic:
```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url, { timeout: 10000 });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

---

### 9. **No HTTPS Enforcement**
**File**: All axios calls  
**Severity**: HIGH (CWE-295: Improper Certificate Validation)  
**Risk**: Man-in-the-middle attacks if any API endpoint doesn't use HTTPS.

**Current Status**: ✅ All URLs use `https://`

**Enforce** by adding validation:
```typescript
function assertHttpsOnly(url: string) {
  if (!url.startsWith('https://')) {
    throw new Error(`URL must use HTTPS: ${url}`);
  }
}

// Before any axios call:
assertHttpsOnly(source.url);
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 10. **Weak Hash Function for URL Deduplication**
**File**: `backend/src/services/news-filter.ts` (line 137-145)  
**Severity**: MEDIUM (CWE-327: Weak Cryptography)  
**Risk**: Simple bit-manipulation hash could have collisions; not suitable for security.

**Evidence**:
```typescript
private hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `article_${Math.abs(hash)}`;
}
```

**Fix**: Use crypto for consistency:
```typescript
import { createHash } from 'crypto';

private hashUrl(url: string): string {
  return 'article_' + createHash('sha256').update(url).digest('hex').substring(0, 16);
}
```

---

### 11. **Console Logging Sensitive Information**
**File**: Multiple files  
**Severity**: MEDIUM (CWE-215: Information Exposure Through Debug Info)  
**Risk**: In production builds, console logs might expose error details to users/attackers.

**Evidence**:
```typescript
console.log(`Fetching from ${source.name}...`);
console.error(`Failed to fetch from ${source.name}:`, errorMsg);
console.log(`Filtered out: ${title}`);
```

**Fix**: Use structured logging:
```bash
npm install winston
```

```typescript
import logger from './logger';

// Replace console.log/error with:
logger.info('Fetching news source', { source: source.name });
logger.error('Failed to fetch', { source: source.name, error: errorMsg });
```

In production, only log to file, not console.

---

### 12. **Missing Settings Persistence & Validation**
**File**: `backend/src/config/settings.ts`  
**Severity**: MEDIUM (CWE-434: Unrestricted Upload of File with Dangerous Type)  
**Risk**: If settings are stored as JSON without validation, attacker could craft malicious config.

**Evidence**: Settings interface exists, but no persistence layer shown.

**Fix**: Create `backend/src/storage/settings-store.ts`:
```typescript
import fs from 'fs/promises';
import path from 'path';
import { AppSettings, SETTING_RANGES, DEFAULT_SETTINGS } from '../config/settings';

const SETTINGS_FILE = path.join(process.env.HOME || '/tmp', '.esther/config.json');

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    
    // Validate each field
    return validateSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function validateSettings(settings: any): AppSettings {
  // Validate update intervals
  if (typeof settings.planetUpdateInterval !== 'number') {
    settings.planetUpdateInterval = DEFAULT_SETTINGS.planetUpdateInterval;
  }
  const range = SETTING_RANGES.planetUpdateInterval;
  if (settings.planetUpdateInterval < range.min || settings.planetUpdateInterval > range.max) {
    settings.planetUpdateInterval = DEFAULT_SETTINGS.planetUpdateInterval;
  }

  // Similar for other fields...
  
  return settings as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const validated = validateSettings(settings);
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(validated, null, 2), 'utf-8');
}
```

---

### 13. **Missing Error Boundary in React**
**File**: `frontend/src/components/SettingsPanel.tsx`  
**Severity**: MEDIUM (CWE-248: Uncaught Exception)  
**Risk**: If `onSave` callback throws, component crashes without graceful recovery.

**Fix**: Add error boundary:
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SettingsPanelErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  componentDidCatch(error: Error) {
    this.setState({ hasError: true, error });
    logger.error('SettingsPanel error', { error: error.message });
  }

  render() {
    if (this.state.hasError) {
      return <div>Failed to load settings. Please restart the app.</div>;
    }
    return <SettingsPanel {...this.props} />;
  }
}
```

---

### 14. **Dependency Version Pinning Issues**
**File**: `frontend/package.json`, `backend/package.json`  
**Severity**: MEDIUM (CWE-1104: Use of Unmaintained Third Party Components)  
**Risk**: `electron: latest` could pull breaking changes; caret ranges (`^`) allow buggy minor versions.

**Evidence**:
```json
"electron": "latest",        // ← Too loose
"react": "^18.2.0",          // ← Allows 18.3.0 which could break things
"typescript": "^5.0.0",      // ← Same issue
```

**Fix**: Pin exact versions:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "1.6.2",
    "electron": "27.0.0"
  },
  "devDependencies": {
    "typescript": "5.2.2"
  }
}
```

And use `npm ci` instead of `npm install` in CI/production.

---

## ✅ POSITIVE FINDINGS

- ✅ **No hardcoded credentials** in code
- ✅ **All data sources are HTTPS**
- ✅ **Timeouts configured** on external API calls
- ✅ **Local-only app** (no user accounts = no auth bypass risks)
- ✅ **TypeScript used** (type safety)
- ✅ **Trusted data sources only** (NASA, ESA, JPL)
- ✅ **No database** initially (simpler attack surface)

---

## 📋 REMEDIATION ROADMAP

### Phase 1: CRITICAL (Do First — Before Any Deployment)
- [ ] Add URL validation utility
- [ ] Validate all input parameters (bodyName, etc.)
- [ ] Implement rate limiting (p-queue)
- [ ] Add Content-Security-Policy headers (helmet)
- [ ] Create Electron preload script with sandbox
- [ ] Sanitize RSS feed content (dompurify)

### Phase 2: HIGH (Before Alpha Release)
- [ ] Add structured logging (winston)
- [ ] Implement settings validation & persistence
- [ ] Add React error boundaries
- [ ] Pin exact dependency versions
- [ ] Add HTTPS enforcement checks

### Phase 3: MEDIUM (Before Beta Release)
- [ ] Add request retry logic with exponential backoff
- [ ] Implement Content Security Policy testing
- [ ] Add security headers audit (npm audit)
- [ ] Penetration testing on RSS feed parser

### Phase 4: ONGOING
- [ ] `npm audit fix` monthly
- [ ] Security updates for dependencies
- [ ] Code review before any data changes
- [ ] Monitor for CVEs in Electron/Express/React

---

