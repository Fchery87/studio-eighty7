# Services - Studio Eighty7

## Package Identity
API integration layer for Studio Eighty7 application. Provides TypeScript interfaces and async functions for external APIs (WordPress CMS and Google Gemini AI).

## Setup & Run
- No separate setup (uses project dev server)
- Services are imported directly by components
- Environment variable required for Gemini: `GEMINI_API_KEY` in `.env.local`

## Patterns & Conventions

### File Organization
- Each service file exports:
  1. TypeScript interfaces for API response types
  2. Async functions that fetch/process data
  3. Error handling with console logging
- File naming: `wordpressService.ts` (lowercase service + Service.ts)

### Service Function Pattern
```typescript
// Interfaces at top
export interface ApiType {
  field: string;
}

// Fetch function
export const fetchData = async (): Promise<ReturnType[]> => {
  try {
    const response = await fetch(`${API_URL}/endpoint`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    // Map/transform data
    return data.map((item: ApiType) => ({
      id: item.id.toString(),
      title: item.title.rendered,
      // ...other fields
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];  // Return empty array on error (fail-soft)
  }
};
```

### ✅ DO
- Return `Promise<ReturnType[]>` from fetch functions
- Use `try/catch` blocks for error handling
- Return empty array `[]` on errors (fail-soft pattern, see `wordpressService.ts:60`)
- Log errors with `console.error()`
- Transform data to consistent format before returning
- Use `response.ok` check before `response.json()`
- Map WordPress ACF fields to simplified types
- Use environment variables for API keys (via `process.env.API_KEY`)

### ❌ DON'T
- Throw errors that crash the app (return empty arrays instead)
- Expose raw API responses to components
- Hardcode API URLs (use constants)
- Mix API logic in components (keep in services)
- Use `any` type extensively (define proper interfaces)

### Service Examples
- **WordPress API fetcher**: `services/wordpressService.ts` (fetches albums, tracks, services)
- **AI API integration**: `services/geminiService.ts` (uses Google GenAI SDK)
- **Error handling pattern**: `wordpressService.ts:58-61` (try/catch with fallback)
- **Data transformation**: `wordpressService.ts:47-57` (map WP response to app types)

## Touch Points / Key Files
- WordPress API URL constant: `wordpressService.ts:1`
- WordPress types: `wordpressService.ts:3-37` (WPPost, WPAlbum, WPTrack interfaces)
- Gemini AI client: `geminiService.ts:1` (GoogleGenAI import)
- Environment variable config: `vite.config.ts:14-15` (API key injection)

## JIT Index Hints
- Find service function: `rg -n "export const (fetch|generate)" services/`
- Find TypeScript interfaces: `rg -n "export interface" services/`
- Find API calls: `rg -n "await fetch" services/`
- Find error handling: `rg -n "catch.*error" services/`

## Common Gotchas
- WordPress API URL is public (no auth needed)
- Gemini API requires valid `GEMINI_API_KEY` in `.env.local`
- Use `process.env.API_KEY` (not `process.env.GEMINI_API_KEY`) in code
- WordPress fields with `?` are optional (check existence before use)
- `_embedded` field in WP responses contains featured media
- Use `item.field?.toString()` to safely convert optional types

## Pre-PR Checks
```bash
# No separate test - verify by running app with real API
npm run dev  # Services will fetch on component mount
```

## API Details

### WordPress REST API
- Base URL: `https://studioeighty7.com/wp-json/wp/v2`
- Endpoints used:
  - `/album?_embed` - Albums with featured media
  - `/track?_embed&per_page=20` - Tracks with featured media
  - `/service?per_page=10` - Services
  - `/pages?slug=about` - About page content
- Uses ACF (Advanced Custom Fields) for custom data
- Requires `_embed` param for featured media images

### Google Gemini AI
- SDK: `@google/genai`
- Model: `gemini-3-flash-preview`
- Use case: Lyric/hook generation for music production
- Error handling: Returns fallback string on failure
