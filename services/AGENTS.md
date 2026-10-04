# Services - Studio Eighty7

## Package Identity
API integration layer for Studio Eighty7 application. Provides TypeScript interfaces and async functions for external APIs (WordPress CMS and Google Gemini AI).

## Setup & Run
- No separate setup (uses project dev server)
- Services are imported directly by components
- Environment variable required for Gemini: `GEMINI_API_KEY` in `server/.env` (server only)

## Patterns & Conventions

### File Organization
- Each service file exports:
  1. TypeScript interfaces for API response types
  2. Async functions that fetch/process data
  3. Errors thrown to the caller (components show them through `useRemote` + `LoadError`)
- File naming: `wordpressService.ts` (lowercase service + Service.ts)

### Service Function Pattern
```typescript
// Interfaces at top
export interface ApiType {
  field: string;
}

// Fetch function: throw on failure, never substitute data
export const fetchData = async (): Promise<ReturnType[]> => {
  const response = await fetch(`${API_URL}/endpoint`);
  if (!response.ok) throw new Error(`Failed to fetch data: HTTP ${response.status}`);

  const data: ApiType[] = await response.json();
  return data.map((item) => ({
    id: item.id.toString(),
    title: decodeHtml(item.title.rendered),
  }));
};
```

### ✅ DO
- Return `Promise<ReturnType[]>` from fetch functions
- Throw on a failed request and include the HTTP status in the message
- Load data in components with `useRemote(fetcher)` (`components/useRemote.ts`), which gives a `Remote<T>` (`loading` / `ready` / `error`) and a `retry`
- Render `<LoadError what="…" onRetry={retry} />` for the error state
- Decode WordPress HTML entities with `decodeHtml` at the boundary
- Transform data to consistent format before returning
- Use `response.ok` check before `response.json()`
- Map WordPress ACF fields to simplified types
- Keep API keys on the server (`server/.env`); the frontend calls `/api/*`

### ❌ DON'T
- Substitute mock or empty data when a request fails. Visitors would see invented content with no sign anything broke
- Expose raw API responses to components
- Hardcode API URLs (use constants)
- Mix API logic in components (keep in services)
- Use `any` type extensively (define proper interfaces)

### Service Examples
- **WordPress API fetcher**: `services/wordpressService.ts` (fetches albums, tracks, services)
- **AI API integration**: `services/geminiService.ts` (calls the server's `/api/generate`)
- **Error handling pattern**: `components/useRemote.ts` and `components/Services.tsx`
- **Data transformation**: `fetchServices` in `wordpressService.ts`

## Touch Points / Key Files
- WordPress API URL constant: `wordpressService.ts:1`
- WordPress types: `wordpressService.ts:3-37` (WPPost, WPAlbum, WPTrack interfaces)
- Gemini AI client: `geminiService.ts:1` (GoogleGenAI import)
- Environment variable config: `vite.config.ts:14-15` (API key injection)

## JIT Index Hints
- Find service function: `rg -n "export const (fetch|generate)" services/`
- Find TypeScript interfaces: `rg -n "export interface" services/`
- Find API calls: `rg -n "await fetch" services/`
- Find error states: `rg -n "LoadError|useRemote" components/ App.tsx`

## Common Gotchas
- WordPress API URL is public (no auth needed)
- Gemini needs `GEMINI_API_KEY` in `server/.env`. The frontend never reads it
- The dev proxy (`/wp-api` in `vite.config.ts`) strips cookies; studioeighty7.com rejects oversized localhost cookie headers with a 400
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
