# Contributing to Esther

Thank you for your interest in Esther! This document outlines guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on scientific accuracy and accessibility
- No spam, harassment, or self-promotion
- Contributions should serve the project's educational mission

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/esther.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development

```bash
# Start dev servers (frontend + backend)
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## What We Welcome

- **Data Enhancements**: Improved planetary data, better news filtering keywords, new data sources
- **UI/UX**: Retro aesthetic design improvements, accessibility features, better visualizations
- **Performance**: Optimizations for data fetching, caching, rendering
- **Documentation**: Clearer guides, API docs, educational content about astrology/astronomy
- **Testing**: Unit tests, integration tests, edge case coverage
- **Bug Fixes**: Issues affecting core functionality

## Areas We Don't Accept

- User authentication systems (project is local-only)
- Community forums, messaging, or social features
- Closed-source or proprietary data sources
- Cryptocurrency, NFT, or blockchain integrations

## Pull Request Process

1. Update `README.md` with any significant changes
2. Add tests for new features or bug fixes
3. Ensure all tests pass: `npm run test`
4. Run linting: `npm run lint` (if available)
5. Write a clear PR description explaining your changes
6. Reference related issues if applicable

## Adding New News Sources

To add astronomy news sources:

1. Edit `backend/src/config/settings.ts`
2. Add source to `DEFAULT_SETTINGS.newsFiltering.sources`
3. Verify RSS feed works and contains astronomy content
4. Test filtering in `backend/src/services/news-filter.ts`
5. Add unit tests in `tests/news-filter.test.ts`

Example:
```typescript
{
  id: 'my-source',
  name: 'My Astronomy News',
  url: 'https://example.com/feed.xml',
  category: 'astronomy',
  enabled: true,
}
```

## Adding New Planetary Data

To enhance planetary profiles:

1. Source data from NASA, ESA, or JPL (must be public domain)
2. Add to `backend/src/services/planetary-data.ts`
3. Update `getMockNASAData()` with new fields
4. Include source URLs and last-updated timestamp
5. Add tests verifying data accuracy

## Commit Messages

Follow conventional commits:
- `feat: add new news source`
- `fix: correct planet position calculation`
- `docs: update API documentation`
- `test: add tests for ephemeris service`
- `chore: update dependencies`

## Questions?

Open an issue or start a discussion. We're here to help!

---

**License**: MIT. By contributing, you agree your code will be released under the MIT license.
