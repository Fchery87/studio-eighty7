// Mock data for development when WordPress API is not available

import type { Album, Service, Track } from '@/types';

// SVG placeholder generator - creates local placeholders without network requests
const createPlaceholder = (text: string, size = 500) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#1A1411"/>
    <rect x="10" y="10" width="${size - 20}" height="${
    size - 20
  }" fill="none" stroke="#F0A23B" stroke-width="2"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#F0A23B" font-family="sans-serif" font-size="32" font-weight="bold">${text}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const MOCK_ALBUMS: Album[] = [
  {
    id: '1',
    title: 'Katana Dreams',
    year: '2024',
    cover: createPlaceholder('KATANA'),
    tracks: 12,
    spotifyUrl: null,
    appleMusicUrl: null,
  },
  {
    id: '2',
    title: 'Blade Runner',
    year: '2023',
    cover: createPlaceholder('BLADE'),
    tracks: 10,
    spotifyUrl: null,
    appleMusicUrl: null,
  },
  {
    id: '3',
    title: 'Ronin Mode',
    year: '2023',
    cover: createPlaceholder('RONIN'),
    tracks: 8,
    spotifyUrl: null,
    appleMusicUrl: null,
  },
  {
    id: '4',
    title: 'Shadow Warrior',
    year: '2022',
    cover: createPlaceholder('SHADOW'),
    tracks: 15,
    spotifyUrl: null,
    appleMusicUrl: null,
  },
];

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Katana Sharp',
    artist: 'Tek-Domain',
    duration: '3:45',
    cover: createPlaceholder('TRACK 1'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '2',
    title: 'Blade Dance',
    artist: 'Tek-Domain',
    duration: '4:12',
    cover: createPlaceholder('TRACK 2'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '3',
    title: 'Ronin Rise',
    artist: 'Tek-Domain',
    duration: '3:28',
    cover: createPlaceholder('TRACK 3'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '4',
    title: 'Shadow Walk',
    artist: 'Tek-Domain',
    duration: '3:55',
    cover: createPlaceholder('TRACK 4'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '5',
    title: 'Warrior Code',
    artist: 'Tek-Domain',
    duration: '4:02',
    cover: createPlaceholder('TRACK 5'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    title: 'Music Production',
    description:
      'Full-scale beat production from concept to completion. We craft custom instrumentals tailored to your vision, genre, and style.',
  },
  {
    id: '2',
    title: 'Mixing & Mastering',
    description:
      'Professional mixing and mastering services to give your tracks the polished, radio-ready sound they deserve.',
  },
  {
    id: '3',
    title: 'Artist Development',
    description:
      'Comprehensive artist development including branding, sound design, and career guidance for emerging talent.',
  },
];
