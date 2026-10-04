import { Stat, Genre } from "./types";

export const SECTIONS = [
  { id: 'listen', label: 'Listen' },
  { id: 'services', label: 'Services' },
  { id: 'records', label: 'Records' },
  { id: 'studio', label: 'Studio' },
  { id: 'write', label: 'Hook lab' },
  { id: 'book', label: 'Book' },
] as const;

export const STATS: Stat[] = [
  { label: 'Tracks produced', value: '870+' },
  { label: 'Streams', value: '2M+' },
  { label: 'Years', value: '12+' },
];

export const GENRES: Genre[] = [
  { name: 'Hip-hop', level: 72 },
  { name: 'Trap', level: 48 },
  { name: 'R&B', level: 60 },
  { name: 'Kompa', level: 34 },
  { name: 'Afro', level: 80 },
];
