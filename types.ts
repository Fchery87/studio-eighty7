export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Genre {
  name: string;
  color: string;
}

export interface Album {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  cover: string;
  tracks: number;
  description: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  genre: string;
  audioUrl: string;
}

export enum AiState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
