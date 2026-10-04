# AGENTS.md - Studio Eighty7

## Project Snapshot
Simple single-project React + Vite application for Studio Eighty7 music production studio. Features AI-powered lyric generation, WordPress CMS integration, and dark-themed UI. See component/service directories for detailed patterns.

## Setup Commands
```bash
npm install                    # Install dependencies
npm run dev                   # Start dev server on port 3000
npm run build                 # Build for production
npm run preview               # Preview production build
```

## Universal Conventions
- TypeScript strict mode enabled
- Use functional components with `React.FC`
- Absolute imports via `@/` alias (e.g., `import { Service } from '@/types'`)
- All components in `components/` directory
- All API calls in `services/` directory
- Type definitions in `types.ts`
- Static content in `constants.ts`
- Environment: secrets live only in `server/.env` (`GEMINI_API_KEY`). The frontend calls `/api/*` and never sees a key

## Security & Secrets
- Never commit `.env.local` or any `.env.*` files
- Never expose API keys to the frontend bundle (no Vite `define`, no `VITE_` secrets). Gemini is called from `server/index.ts`
- WordPress API URL is public (`https://studioeighty7.com/wp-json/wp/v2`)
- No PII handling

## JIT Index - Directory Map

### Directory Structure
- Components: `components/` → page sections, plus `components/player/` (shared audio player)
- Services: `services/` → WordPress & Gemini AI integrations
- Types: `types.ts` → TypeScript interfaces & enums
- Constants: `constants.ts` → Static data (albums, tracks, services, etc.)
- Entry: `App.tsx`, `index.tsx`, `index.html`

### Quick Find Commands
- Find a component: `rg -n "const \w+: React\.FC" components/`
- Find TypeScript interface: `rg -n "export (interface|type|enum)" types.ts`
- Find service function: `rg -n "export const (fetch|generate)" services/`
- Find constant arrays: `rg -n "export const (SECTIONS|STATS|GENRES)" constants.ts`

## Definition of Done
- Code compiles with TypeScript
- App builds successfully (`npm run build`)
- No console errors in browser
- Dev server runs without errors
