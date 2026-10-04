import {
  MOCK_ALBUMS,
  MOCK_TRACKS,
  MOCK_SERVICES,
} from './mockData';
import type { Album, Service, Track } from '@/types';

// Use proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;
// Use the "Universal" routing format since Hostinger servers sometimes block the standard /wp-json path
// Use the "Universal" routing format for better server compatibility
const WP_API_BASE = 'https://studioeighty7.com/index.php';
const WP_API_URL = isDev ? '/wp-api' : WP_API_BASE;

// Quiet logging - only log in development when DEBUG is enabled
const debugLog = (...args: unknown[]) => {
  if (isDev && localStorage.getItem('DEBUG') === 'true') {
    console.log('[WordPress]', ...args);
  }
};

// Mock data looks real on screen, so a fallback must never be silent in dev
const warnFallback = (what: string, error: unknown) => {
  if (isDev) console.warn(`[WordPress] ${what} failed, showing mock data:`, error);
};

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf?: Record<string, unknown> | [];
  meta?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

// Strips markup and decodes entities such as &#038; in one pass
export const decodeHtml = (html: string): string =>
  new DOMParser().parseFromString(html, 'text/html').documentElement
    .textContent?.trim() ?? '';

// ACF returns an empty array instead of an object when a post has no fields
const getField = (post: WPPost, key: string): unknown => {
  const acf = post.acf;
  const fromAcf = acf && !Array.isArray(acf) ? acf[key] : undefined;
  return fromAcf || post.meta?.[key] || undefined;
};

const getString = (post: WPPost, key: string): string | null => {
  const value = getField(post, key);
  return typeof value === 'string' && value ? value : null;
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getCover = (post: WPPost) =>
  post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
  getString(post, 'album_art') ||
  '/placeholder.svg';

// Fetch albums from WordPress - falls back to mock data on error
export const fetchAlbums = async (): Promise<Album[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/album&_embed`
    );

    if (response.status === 404) {
      debugLog('Album endpoints not found - using mock data');
      return MOCK_ALBUMS;
    }

    if (!response.ok) throw new Error(`Failed to fetch albums: HTTP ${response.status}`);

    const data: WPPost[] = await response.json();

    return data.map((album) => ({
      id: album.id.toString(),
      title: decodeHtml(album.title.rendered),
      year:
        getString(album, 'year') || new Date().getFullYear().toString(),
      cover: getCover(album),
      tracks: Number(getField(album, 'tracks')) || 0,
      spotifyUrl: getString(album, 'spotify_url'),
      appleMusicUrl: getString(album, 'apple_music_url'),
    }));
  } catch (error) {
    warnFallback('Fetching albums', error);
    return MOCK_ALBUMS;
  }
};

type WPMediaRef =
  | string
  | number
  | {
      url?: string;
      source_url?: string;
      id?: number | string;
      ID?: number | string;
    };

const parseMediaId = (value: number | string | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value))
    return parseInt(value, 10);
  return undefined;
};

const fetchMediaUrl = async (mediaId: number): Promise<string> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/media/${mediaId}`
    );
    if (response.ok) {
      const media = await response.json();
      return media.source_url || '';
    }
  } catch (e) {
    debugLog('Failed to resolve audio URL from ID:', mediaId);
  }

  return '';
};

const extractAudioUrlFromContent = (content?: string) => {
  if (!content) return '';

  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    try {
      const doc = new DOMParser().parseFromString(content, 'text/html');
      const audio = doc.querySelector('audio');
      const audioSrc = audio?.getAttribute('src');
      if (audioSrc) return audioSrc;

      const source = doc.querySelector('audio source, source');
      const sourceSrc = source?.getAttribute('src');
      if (sourceSrc) return sourceSrc;

      const link = doc.querySelector(
        'a[href$=".mp3"], a[href$=".wav"], a[href$=".m4a"], a[href$=".ogg"], a[href*=".mp3?"], a[href*=".wav?"], a[href*=".m4a?"], a[href*=".ogg?"]'
      );
      const linkHref = link?.getAttribute('href');
      if (linkHref) return linkHref;
    } catch (e) {
      debugLog('Failed to parse track content for audio URL');
    }
  }

  const match =
    content.match(/<audio[^>]*src=["']([^"']+)["']/i) ||
    content.match(/<source[^>]*src=["']([^"']+)["']/i) ||
    content.match(/href=["']([^"']+\.(mp3|wav|m4a|ogg)(\?[^"']*)?)["']/i);

  return match?.[1] ?? '';
};

// Helper function to resolve audio URL from attachment ID
const resolveAudioUrl = async (
  audioUrl: WPMediaRef | null | undefined
): Promise<string> => {
  if (!audioUrl) return '';

  // If it's already a URL (starts with http), return as-is
  if (typeof audioUrl === 'string') {
    if (audioUrl.startsWith('http') || audioUrl.startsWith('/')) {
      return audioUrl;
    }
  }

  // If it's a number (attachment ID), fetch the media details
  if (
    typeof audioUrl === 'number' ||
    (typeof audioUrl === 'string' && /^\d+$/.test(audioUrl))
  ) {
    const mediaId =
      typeof audioUrl === 'number' ? audioUrl : parseInt(audioUrl, 10);
    return fetchMediaUrl(mediaId);
  }

  if (typeof audioUrl === 'object') {
    if (typeof audioUrl.url === 'string') return audioUrl.url;
    if (typeof audioUrl.source_url === 'string') return audioUrl.source_url;

    const mediaId = parseMediaId(audioUrl.ID) ?? parseMediaId(audioUrl.id);
    if (mediaId !== undefined) {
      return fetchMediaUrl(mediaId);
    }
  }

  return '';
};

// Fetch tracks from WordPress - falls back to mock data on error
export const fetchTracks = async (): Promise<Track[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/track&_embed&per_page=20&orderby=menu_order&order=asc`
    );

    if (response.status === 404) {
      debugLog('Track endpoints not found - using mock data');
      return MOCK_TRACKS;
    }

    if (!response.ok) throw new Error(`Failed to fetch tracks: HTTP ${response.status}`);

    const data: WPPost[] = await response.json();

    return await Promise.all(
      data.map(async (track) => {
        const rawAudioUrl = getField(track, 'audio_url');
        const audioUrl =
          extractAudioUrlFromContent(track.content?.rendered) ||
          (rawAudioUrl ? await resolveAudioUrl(rawAudioUrl as WPMediaRef) : '');

        return {
          id: track.id.toString(),
          title: decodeHtml(track.title.rendered),
          artist: getString(track, 'artist') || 'Tek-Domain',
          duration: getString(track, 'duration'),
          cover: getCover(track),
          genre: capitalize(getString(track, 'genre') || 'Hip-hop'),
          audioUrl,
        };
      })
    );
  } catch (error) {
    warnFallback('Fetching tracks', error);
    return MOCK_TRACKS;
  }
};

// Fetch services from WordPress - falls back to mock data on error
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/service&per_page=10`
    );

    if (response.status === 404) {
      debugLog('Service endpoints not found - using mock data');
      return MOCK_SERVICES;
    }

    if (!response.ok) throw new Error(`Failed to fetch services: HTTP ${response.status}`);

    const data: WPPost[] = await response.json();

    return data.map((service) => ({
      id: service.id.toString(),
      title: decodeHtml(service.title.rendered),
      description: decodeHtml(service.excerpt.rendered),
    }));
  } catch (error) {
    warnFallback('Fetching services', error);
    return MOCK_SERVICES;
  }
};
