export interface Service {
  id: string;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Genre {
  name: string;
  // Fader cap position as a percentage of the track height
  level: number;
}

export interface Album {
  id: string;
  title: string;
  year: string;
  cover: string;
  tracks: number;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string | null;
  cover: string;
  genre: string;
  audioUrl: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export enum AiState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
