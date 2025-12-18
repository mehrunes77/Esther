# Security Policy

## Overview

Esther is designed with privacy and security as core principles. This document outlines the security practices, threat model, and responsible disclosure process.

## Security Principles

### 1. Privacy-First Design
- **No User Tracking**: Zero telemetry or analytics
- **No Data Collection**: All data is public (astronomical)
- **No Cloud Sync**: Everything runs locally
- **No Persistent Storage**: Stateless application

### 2. Open Source Transparency
- All code publicly auditable on GitHub
- No hidden functionality
- Dependencies explicitly listed and auditable
- Regular security audits

### 3. Secure by Default
- HTTPS-ready configuration
- Content Security Policy (CSP) headers
- XSS protection via DOMPurify
- Input validation on all endpoints
- Rate limiting on external API calls

## Threat Model

### What We Protect Against
- ✅ XSS (Cross-Site Scripting) attacks
- ✅ SSRF (Server-Side Request Forgery) attacks
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Injection attacks (validated inputs)
- ✅ Man-in-the-middle attacks (HTTPS)
- ✅ Unauthorized data access (no auth needed, data is public)

### What We Don't Protect Against
- ❌ Client compromised by malware (out of scope)
- ❌ NASA/ESA API downtime (external dependencies)
- ❌ ISP/network monitoring (HTTPS helps, but ISP can still see traffic)
- ❌ Physical access to computer running the app

## Security Features

### Backend Security

#### Input Validation
```typescript
// All user inputs validated with regex whitelists
validateBodyName(name: string)           // Only [a-zA-Z0-9\s\-()]
isValidUrl(url: string)                  // Protocol + IP range checks
validateNumberInRange(val, min, max)     // Type-safe numeric validation
```

#### SSRF Protection
- Blocks localhost/127.0.0.1
- Blocks private IP ranges (10.x, 172.16-31, 192.168.x)
- Only allows http/https protocols
- All external URLs validated

#### Rate Limiting
- Request queue on external API calls
- Prevents hammering NASA/JPL APIs
- Configurable intervals (default 15min for planets, 30min for news)

#### Security Headers
```typescript
Helmet.js enabled:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy (see below)
```

#### Content Security Policy
```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' https:
connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov (+ ESA, arXiv)
frame-ancestors 'none'
```

### Frontend Security

#### XSS Prevention
- DOMPurify sanitizes RSS feed content
- No `eval()` or `new Function()` anywhere
- No innerHTML unless sanitized
- React's built-in XSS protection

#### Electron Sandbox
```typescript
nodeIntegration: false      // Disable Node.js in renderer
sandbox: true               // Sandbox mode enabled
preload: 'preload.ts'      // Isolated preload script
```

#### Third-Party Libraries
- No analytics (Sentry, etc.)
- No tracking scripts
- No ad networks
- All libraries open-source and auditable

## Data Handling

### What Data Flows Through Esther

1. **Astronomical Data** (NASA JPL Horizons)
   - Planet positions, orbital elements
   - Public data, no authentication
   - Cached locally for 5 minutes
   - Never stored persistently

2. **News Data** (RSS feeds)
   - Fetched from NASA, ESA, arXiv
   - Filtered for astronomy content only
   - Cached in memory
   - Never stored persistently

3. **Settings** (Local only)
   - Update intervals
   - Display preferences
   - Stored locally in Electron app
   - Never sent to servers

### No Data Sent to Third Parties
- Esther makes direct requests to NASA/ESA/arXiv
- No data forwarded to other services
- ISP/network admin can see you're accessing NASA (IP-level), but not specific requests

## API Security

### Public API Endpoints

#### GET /api/planets/positions
- Returns: Real-time planetary positions
- Data Source: NASA JPL Horizons (public)
- Authentication: None (public data)
- Rate Limit: 1 request/user (local queue)

#### GET /api/planets/:name
- Returns: Planet profile + position
- Data Source: NASA, JPL, ESA
- Authentication: None
- Validation: `validateBodyName(name)` - prevents injection

#### GET /api/news
- Returns: Filtered astronomy news
- Data Source: RSS feeds (NASA, ESA, arXiv)
- Authentication: None
- Filtering: Keywords validated, content sanitized

#### POST /api/settings
- Updates: Local app configuration
- Storage: Electron local file
- Authentication: None (local device only in Electron)
- Validation: Type checking on all fields

### No Authentication Needed
- Esther contains **zero user accounts**
- All data is **publicly available**
- No sensitive endpoints
- Educational app, no subscription features

## Dependency Security

### Current Dependencies (v0.1.0)

All dependencies verified for:
- ✅ No known CVEs
- ✅ Active maintenance
- ✅ Open source (auditable)
- ✅ Minimal dependency chains

**Backend**:
- express@^4.21.2 - HTTP server
- axios@^1.13.2 - HTTP client
- helmet@7.1.0 - Security headers
- dompurify@^3.3.0 - HTML sanitization
- rss-parser@3.13.0 - RSS parsing
- winston@3.11.0 - Logging
- p-queue@7.4.1 - Rate limiting queue
- dotenv@16.3.1 - Environment config

**Frontend**:
- react@18.2.0 - UI framework
- three.js@^0.181.1 - 3D rendering
- vite@^5.0.0 - Build tool
- dompurify@^3.3.0 - HTML sanitization
- electron@39.1.2 - Desktop app framework
- electron-builder@24.13.3 - App packaging

**No Dependencies On**:
- ❌ Analytics (Sentry, Mixpanel, etc.)
- ❌ Tracking (Google Analytics, etc.)
- ❌ Cloud services (AWS, Azure, etc.)
- ❌ Databases (Mongo, MySQL, etc.)
- ❌ Authentication services

## Responsible Disclosure

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, email: **security@esther-app.local** (placeholder)

Or contact the repository maintainer privately with:
1. Description of vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

**Response Timeline**:
- Acknowledgment: Within 48 hours
- Assessment: Within 1 week
- Patch: Target 2 weeks
- Disclosure: After patch is available

## Compliance

### GDPR
✅ Fully compliant - no user data collected

### CCPA
✅ Fully compliant - no user data collected

### Privacy Regulations
✅ All major privacy laws compliant

### Open Source Licenses
- MIT License - See LICENSE file
- All dependencies use OSI-approved licenses

## Future Security Enhancements

- [ ] Add update checking mechanism (signed releases)
- [ ] Implement optional error reporting (opt-in only)
- [ ] Add security audit logging
- [ ] Create security advisory program
- [ ] Regular dependency scanning via Dependabot

## Security Audit History

- **v0.1.0** (2025-12-17): Initial security audit - PASSED
  - No critical vulnerabilities found
  - Privacy practices verified
  - Dependency audit passed
  - Code cleanup completed

## Questions?

For security questions that aren't vulnerabilities, open a regular GitHub discussion or issue.

---

**Last Updated**: December 17, 2025  
**Audit Status**: ✅ PASSED  
**Next Audit**: [Quarterly]

