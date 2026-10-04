# Components - Studio Eighty7

## Package Identity
React functional components for Studio Eighty7 website page sections. Each component represents a distinct section of the single-page application (Hero, Music, Services, etc.).

## Patterns & Conventions

### File Organization
- All components are named exports: `export default ComponentName`
- File name matches component name: `Hero.tsx` exports `Hero`
- One component per file
- Section components organized by page flow (order in App.tsx)

### Component Structure Pattern
```tsx
import React from 'react';
import { ExternalComponent } from 'lucide-react';  // Icons from lucide-react
import { CONSTANTS } from '../constants';           // Import from constants as needed
import { Types } from '../types';                   // Types from central types file

const ComponentName: React.FC = () => {
  // State management (useState, useEffect, etc.)
  
  // Event handlers
  
  // Render
  return (
    <section className="className">
      {/* Component JSX */}
    </section>
  );
};

export default ComponentName;
```

### ✅ DO
- Use `React.FC` type for all components
- Use `<section>` elements whose `id` matches an entry in `SECTIONS` (`constants.ts`). Header, footer and scroll-spy all read that registry
- Import icons from `lucide-react` only (see `components/Hero.tsx:3`)
- Use Tailwind utility classes for styling
- Copy patterns from existing components
- Use the brand tokens from `index.css` `@theme`: `walnut`, `panel`, `line`, `bone`, `dust`, `amber`, `rec`. Tailwind's default palette is reset, so `red-500` etc. do not exist
- `rec` red means sound or booking (play state, primary CTA, logo). Do not use it for decoration
- Type is Archivo only. Use the `display` utility for headings and `data` for numbers and times
- Read and control playback through `usePlayer()` (`components/player/PlayerProvider.tsx`). Never create another `<audio>` element
- Apply responsive breakpoints: `md:`, `lg:`
- Use `const [state, setState] = useState()` for state management
- Use `useEffect` for side effects and data loading

### ❌ DON'T
- Use class components (always functional)
- Import icons from other libraries
- Hardcode colors (use Tailwind color tokens)
- Mix different styling approaches (stick to Tailwind)
- Create files in other directories (all components go in `components/`)

### Component Examples
- **Player consumer**: `components/Hero.tsx`, `components/Listen.tsx`
- **Form with state management**: `components/AiOracle.tsx`
- **Booking form with zod validation**: `components/Contact.tsx`
- **Navigation with mobile menu and mini transport**: `components/Header.tsx`

## Touch Points / Key Files
- Component entry point: `App.tsx` (imports and renders all components)
- Icon library: All icons from `lucide-react`
- Tailwind v4 tokens and custom CSS: `index.css`
- Constants: `constants.ts` (import static data as needed)
- Types: `types.ts` (import TypeScript interfaces as needed)

## JIT Index Hints
- Find a component: `rg -n "const \w+: React\.FC" components/`
- Find icon usage: `rg -n "from 'lucide-react'" components/`
- Find service imports: `rg -n "from '\.\./services" components/`
- Find sections with IDs: `rg -n 'id="' components/`

## Common Gotchas
- Icons from `lucide-react` need `size={number}` prop
- All sections must have `id` attributes for navigation links
- Range inputs use the `.range` class in `index.css`. Set `--fill` for the WebKit progress fill
- Mobile menu pattern: `hidden md:flex` for desktop, conditional render for mobile

## Pre-PR Checks
```bash
npm run build  # Ensure build succeeds with new component
```
