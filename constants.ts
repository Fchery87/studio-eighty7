import { NavItem, Service, Stat, Genre, Track, Album } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: 'MUSIC', href: '#music' },
  { label: 'ALBUMS', href: '#albums' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
];

export const STATS: Stat[] = [
  { label: 'Tracks Produced', value: '870+' },
  { label: 'Global Streams', value: '2M+' },
  { label: 'Years Active', value: '12+' },
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Music Production',
    description: 'Full-scale sonic architecture. From raw concept to radio-ready anthem.',
    icon: 'music'
  },
  {
    id: '2',
    title: 'Mixing & Mastering',
    description: 'Surgical frequency precision. Making your sound cut through the noise.',
    icon: 'sliders'
  },
  {
    id: '3',
    title: 'Custom Beats',
    description: 'Bespoke rhythms and soundscapes forged specifically for your flow.',
    icon: 'headphones'
  }
];

export const GENRES: Genre[] = [
  { name: 'Hip-Hop', color: '#DC2626' },
  { name: 'Trap', color: '#7C3AED' },
  { name: 'R&B', color: '#0891B2' },
  { name: 'Kompa', color: '#059669' },
  { name: 'Afro', color: '#EA580C' }
];

export const ALBUMS: Album[] = [
  {
    id: '1',
    title: 'Tek-Domain',
    subtitle: 'Genre-Bending Soundscapes',
    year: '2025',
    cover: 'https://studioeighty7.com/wp-content/uploads/2025/05/Domain-logo.webp',
    tracks: 12,
    description: 'A fusion of hip-hop, trap, and Caribbean rhythms. This collection pushes boundaries and redefines modern sound.'
  },
  {
    id: '2',
    title: 'Night Shift',
    subtitle: 'Midnight Sessions Vol. 1',
    year: '2024',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop',
    tracks: 8,
    description: 'Late-night vibes and smooth transitions. Perfect for those after-hours sessions.'
  }
];

export const FEATURED_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Domain Anthem',
    artist: 'Tek-Domain',
    duration: '3:42',
    cover: 'https://studioeighty7.com/wp-content/uploads/2025/05/Domain-logo.webp',
    genre: 'Hip-Hop'
  },
  {
    id: '2',
    title: 'Trap Gods',
    artist: 'Tek-Domain',
    duration: '2:58',
    cover: 'https://studioeighty7.com/wp-content/uploads/2025/05/Domain-logo.webp',
    genre: 'Trap'
  },
  {
    id: '3',
    title: 'Island Vibes',
    artist: 'Tek-Domain',
    duration: '4:15',
    cover: 'https://studioeighty7.com/wp-content/uploads/2025/05/Domain-logo.webp',
    genre: 'Afro'
  },
  {
    id: '4',
    title: 'Neon Dreams',
    artist: 'Tek-Domain',
    duration: '3:30',
    cover: 'https://studioeighty7.com/wp-content/uploads/2025/05/Domain-logo.webp',
    genre: 'R&B'
  }
];
