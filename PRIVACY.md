# Privacy Policy

**Last Updated**: December 17, 2025

## Summary

**Esther collects ZERO personal data.** This is a privacy-first educational application that runs entirely on your computer with no cloud sync, no tracking, and no user accounts.

## What Data Esther Accesses

### 1. Astronomical Data
- **Real-time planet positions** from NASA JPL Horizons API
- **Planet profiles** from NASA Fact Sheets
- **Asteroid data** from JPL Small-Body Database
- **News articles** from public RSS feeds (NASA, ESA, arXiv)

**Status**: All public data, no authentication required

### 2. Your Local Settings
- Update intervals you configure
- Display preferences
- Stored only on your computer
- Never sent anywhere

**Storage**: 
- **Desktop/Electron**: `~/.esther/config.json`
- **Web**: Browser localStorage (your device only)

### 3. What We DON'T Collect

❌ No personal information  
❌ No location data  
❌ No browsing history  
❌ No IP address tracking  
❌ No cookies for tracking  
❌ No behavioral analytics  
❌ No user identifiers  
❌ No device fingerprinting  

## How We Use Data

We don't use any data. Esther:
- ✅ Fetches public data only
- ✅ Displays it in the app
- ✅ Caches it locally
- ✅ Never stores it permanently
- ✅ Never sends it anywhere

## Third-Party Services

### Data Accessed From
1. **NASA JPL Horizons API** - Planetary positions
   - Public API, no authentication
   - Your request: Direct from your device
   - NASA's privacy policy: https://www.nasa.gov/about/privacy.html

2. **NASA Fact Sheets** - Planet information
   - Public website, no tracking
   - NASA's privacy policy: https://www.nasa.gov/about/privacy.html

3. **ESA Data Portal** - Space agency data
   - Public data, no tracking
   - ESA's privacy policy: https://www.esa.int/esapub/bulletin/bulletin-108/note_en.html

4. **arXiv.org** - Astronomy research papers
   - Public RSS feed, no tracking
   - arXiv's privacy policy: https://arxiv.org/about/privacy

### What They Receive
These services receive:
- ✅ Your direct API requests (they see your IP address)
- ❌ NOT your personal information
- ❌ NOT any data about your usage of Esther
- ❌ NOT your location or device info

## Cookies & Storage

### Desktop (Electron)
- Settings stored in: `~/.esther/config.json`
- No cookies
- No tracking

### Web Version
- Settings stored in browser localStorage
- No cookies for tracking
- Your device only, not synced

## Data Retention

### Temporary Cache
- Planet positions: **5 minutes**
- News articles: **In-memory only**
- Deleted when app closes

### Local Settings
- Stored until you manually delete them
- Never automatically sent anywhere
- Fully under your control

## Updates & Security

### Software Updates
- Check for updates manually (no auto-update tracking)
- When released: Signed releases on GitHub
- Your choice to update

### No Automatic Crash Reporting
- Errors logged locally only
- No crash dumps sent
- No Sentry, Rollbar, or similar

## Your Rights

### Access
You have access to all data Esther stores:
- Your settings file: Open `~/.esther/config.json` with any text editor
- Your cache: Lives in application memory only

### Deletion
Delete all Esther data:
```bash
# Linux/macOS
rm -rf ~/.esther

# Windows
rmdir /s %APPDATA%\.esther
```

### Portability
Export your settings: Copy `~/.esther/config.json` anywhere

### No Data Requests
You can never request "your data" from Esther because:
- We don't store personal data
- You already have all your settings
- We don't have a backend database

## Compliance

### GDPR (EU)
✅ **Fully Compliant**
- No personal data collected
- No processing
- No storage
- No third-party sharing
- Right to deletion: Delete config.json

### CCPA (California)
✅ **Fully Compliant**
- No personal information collected
- No sale of consumer information
- No tracking

### PIPEDA (Canada)
✅ **Fully Compliant**

### LGPD (Brazil)
✅ **Fully Compliant**

## Open Source & Transparency

Esther is open-source on GitHub. You can:
- ✅ Read all source code
- ✅ Verify no tracking code
- ✅ See all external API calls
- ✅ Audit all dependencies
- ✅ Build from source yourself

**Repository**: https://github.com/mehrunes77/Esther

## Changes to This Policy

We'll update this policy if:
- We add new data collection
- We change how data is handled
- We add new third-party services

You'll be notified via:
- GitHub releases page
- Updated CHANGELOG
- New version of the app

## Questions?

### Privacy Questions
Open an issue on GitHub: https://github.com/mehrunes77/Esther/issues

### Security Concerns
See SECURITY.md for responsible disclosure

### Data Requests
Since we don't store data, contact us with questions about:
- How specific data flows work
- Our privacy practices
- Third-party API usage

## Technical Details

### Network Calls

Esther makes direct HTTPS requests to:

**Planets**:
```
GET https://ssd-api.jpl.nasa.gov/api/horizons.api
```

**News**:
```
GET https://www.nasa.gov/feed/
GET https://www.esa.int/esafeed/rss.xml
GET https://arxiv.org/rss/astro-ph
```

**NO calls to**:
- Google Analytics
- Segment
- Sentry
- Mixpanel
- Facebook Pixel
- Any tracking service

### Local Storage Locations

**Desktop (Electron)**:
```
~/.esther/config.json          # Your settings
~/.esther/cache/               # Temporary cache
```

**Web Version**:
```
window.localStorage            # Your browser's storage
sessionStorage                 # Temporary session data
```

## Philosophy

> "Your data is yours. Always."

We believe:
- Applications should respect user privacy
- Transparency builds trust
- No tracking means no incentive to misuse data
- Open source proves good intentions

Esther proves it's possible to build powerful applications without surveillance.

---

**Effective Date**: December 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ Reviewed & Approved

