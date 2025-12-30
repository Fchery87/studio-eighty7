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
- Use `<section>` elements for page sections with semantic `id` attributes (e.g., `id="music"`)
- Import icons from `lucide-react` only (see `components/Hero.tsx:3`)
- Use Tailwind utility classes for styling
- Copy patterns from existing components
- Use custom Tailwind colors: `samurai-black`, `samurai-red`, `samurai-gray`
- Use font families: `font-sans` (Rajdhani), `font-display` (Teko)
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
- **Hero with icons & social links**: `components/Hero.tsx`
- **Form with state management**: `components/AiOracle.tsx`
- **Data fetching from services**: `components/TrackPlayer.tsx`
- **Navigation with mobile menu**: `components/Navbar.tsx`

## Touch Points / Key Files
- Component entry point: `App.tsx` (imports and renders all components)
- Icon library: All icons from `lucide-react`
- Tailwind config: `index.html` (lines 13-31)
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
- Use `bg-samurai-black` (not just black) for background consistency
- Custom CSS classes defined in `index.html` (lines 37-50) for text strokes and clip paths
- Mobile menu pattern: `hidden md:flex` for desktop, conditional render for mobile

## Pre-PR Checks
```bash
npm run build  # Ensure build succeeds with new component
```
