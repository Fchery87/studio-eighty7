import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from './player/PlayerProvider';
import { formatTime } from './player/formatTime';
import LoadError from './LoadError';

const fillStyle = (value: number, max: number) =>
  ({ '--fill': `${max > 0 ? (value / max) * 100 : 0}%` }) as React.CSSProperties;

const Listen: React.FC = () => {
  const {
    tracks,
    loadStatus,
    retryTracks,
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
  } = usePlayer();
  const playing = status === 'playing';
  const level = muted ? 0 : volume;

  return (
    <section id="listen" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="display text-4xl md:text-6xl mb-12">Listen</h2>

        {loadStatus === 'error' ? (
          <LoadError what="tracks" onRetry={retryTracks} />
        ) : loadStatus === 'loading' ? (
          <div className="grid gap-px" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[72px] rounded-md bg-panel" />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-dust">No tracks yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <ul className="lg:col-span-7 border-t border-line">
              {tracks.map((t, i) => {
                const current = i === index;
                return (
                  <li key={t.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={current}
                      disabled={!t.audioUrl}
                      onClick={() => (current ? toggle() : select(i))}
                      className={`grid w-full grid-cols-[1.5rem_3rem_1fr_auto] md:grid-cols-[1.5rem_3rem_1fr_6rem_3rem] items-center gap-4 px-3 py-3 text-left disabled:opacity-50 ${
                        current ? 'bg-panel' : 'hover:bg-panel/60'
                      }`}
                    >
                      <span className="data text-sm text-dust">
                        {current && playing ? (
                          <span className="block size-2 rounded-full bg-rec" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <img
                        src={t.cover}
                        alt={`${t.title} cover art`}
                        className="size-12 rounded object-cover"
                      />
                      <span className="min-w-0">
                        <span className={`block truncate ${current ? 'text-bone' : 'text-bone/90'}`}>
                          {t.title}
                        </span>
                        <span className="block truncate text-sm text-dust">{t.artist}</span>
                      </span>
                      <span className="hidden md:block text-sm text-dust">{t.genre}</span>
                      <span className="data text-sm text-dust text-right">
                        {durations[t.id] ?? t.duration ?? '--:--'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {track && (
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-[88px] rounded-xl bg-panel p-6">
                  <img
                    src={track.cover}
                    alt={`${track.title} cover art`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <h3 className="display mt-6 text-2xl leading-[1.05]">{track.title}</h3>
                  <p className="mt-2 text-dust">{track.artist}</p>
                  <p className="text-dust">{track.genre}</p>

                  <input
                    type="range"
                    aria-label="Seek"
                    className="range mt-6"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    disabled={!duration}
                    style={fillStyle(currentTime, duration)}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                  />
                  <div className="data flex justify-between text-sm text-dust">
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration ? formatTime(duration) : (durations[track.id] ?? track.duration ?? '--:--')}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-6">
                    <button type="button" aria-label="Previous track" onClick={prev} className="p-3 text-dust hover:text-bone">
                      <SkipBack size={24} />
                    </button>
                    <button
                      type="button"
                      aria-label={playing ? 'Pause' : 'Play'}
                      onClick={toggle}
                      disabled={!track.audioUrl}
                      className="flex size-16 items-center justify-center rounded-full bg-rec text-bone disabled:opacity-50"
                    >
                      {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    <button type="button" aria-label="Next track" onClick={next} className="p-3 text-dust hover:text-bone">
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                      onClick={toggleMute}
                      className="text-dust hover:text-bone"
                    >
                      {level === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      aria-label="Volume"
                      className="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={level}
                      style={fillStyle(level, 1)}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Listen;
