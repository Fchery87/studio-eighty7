import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { fetchTracks } from '@/services/wordpressService';
import type { Track } from '@/types';
import { formatTime } from './formatTime';

type PlayerStatus = 'idle' | 'playing' | 'paused';
type PlayerState = { tracks: Track[]; index: number; status: PlayerStatus };
type PlayerAction =
  | { type: 'loaded'; tracks: Track[] }
  | { type: 'select'; index: number }
  | { type: 'toggle' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'ended' };

const isPlayable = (track: Track | undefined) => Boolean(track?.audioUrl);

// Walks from `from` in the given direction, wrapping, to the first playable track
const findPlayable = (tracks: Track[], from: number, direction: 1 | -1) => {
  for (let step = 1; step <= tracks.length; step++) {
    const index = (((from + direction * step) % tracks.length) + tracks.length) % tracks.length;
    if (isPlayable(tracks[index])) return index;
  }
  return -1;
};

const reducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'loaded':
      return { tracks: action.tracks, index: 0, status: 'idle' };
    case 'select':
      return isPlayable(state.tracks[action.index])
        ? { ...state, index: action.index, status: 'playing' }
        : state;
    case 'toggle':
      if (!isPlayable(state.tracks[state.index])) return state;
      return { ...state, status: state.status === 'playing' ? 'paused' : 'playing' };
    case 'next':
    case 'prev': {
      const index = findPlayable(
        state.tracks,
        state.index,
        action.type === 'next' ? 1 : -1
      );
      return index === -1 ? state : { ...state, index, status: 'playing' };
    }
    case 'ended': {
      const index = state.tracks.findIndex(
        (track, i) => i > state.index && isPlayable(track)
      );
      return index === -1
        ? { ...state, status: 'paused' }
        : { ...state, index, status: 'playing' };
    }
  }
};

interface PlayerContextValue {
  tracks: Track[];
  loading: boolean;
  index: number;
  track: Track | undefined;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  durations: Record<string, string>;
  select: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName));

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ tracks, index, status }, dispatch] = useReducer(reducer, {
    tracks: [],
    index: 0,
    status: 'idle',
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [durations, setDurations] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement>(null);
  const track = tracks[index];

  useEffect(() => {
    let cancelled = false;
    fetchTracks()
      .then((data) => {
        if (!cancelled) dispatch({ type: 'loaded', tracks: data });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read every track's length in the background so the list shows real times
  useEffect(() => {
    const probes = tracks
      .filter((t) => t.audioUrl)
      .map((t) => {
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.onloadedmetadata = () =>
          setDurations((prev) => ({ ...prev, [t.id]: formatTime(probe.duration) }));
        probe.src = t.audioUrl;
        return probe;
      });
    return () => {
      probes.forEach((probe) => {
        probe.onloadedmetadata = null;
        probe.removeAttribute('src');
      });
    };
  }, [tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === 'playing') {
      // A rejected play() is an interrupted load or blocked autoplay; the next user action retries
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [status, track?.audioUrl]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [track?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (status === 'idle') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTypingTarget(e.target)) return;
      e.preventDefault();
      dispatch({ type: 'toggle' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status]);

  const select = useCallback((i: number) => dispatch({ type: 'select', index: i }), []);
  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    if (value > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => setMuted((prevMuted) => !prevMuted), []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      loading,
      index,
      track,
      status,
      currentTime,
      duration,
      volume,
      muted,
      durations,
      select,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
    }),
    [
      tracks,
      loading,
      index,
      track,
      status,
      currentTime,
      duration,
      volume,
      muted,
      durations,
      select,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.audioUrl || undefined}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => dispatch({ type: 'ended' })}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
};
