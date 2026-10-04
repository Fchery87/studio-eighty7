import React from 'react';
import { Play, Pause } from 'lucide-react';
import { GENRES } from '../constants';
import { usePlayer } from './player/PlayerProvider';

const SEGMENTS = 14;
const TIMING = [
  { duration: '1.3s', delay: '0s' },
  { duration: '1.9s', delay: '-0.4s' },
  { duration: '1.6s', delay: '-1.1s' },
  { duration: '2.2s', delay: '-0.7s' },
  { duration: '1.45s', delay: '-1.5s' },
];

const Hero: React.FC = () => {
  const { tracks, index, status, select, toggle } = usePlayer();
  const playing = status === 'playing';
  const latestPlaying = playing && index === 0;
  const canPlay = Boolean(tracks[0]?.audioUrl);

  const playLatest = () => {
    if (index === 0 && status !== 'idle') toggle();
    else select(0);
  };

  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
        <div className="lg:col-span-7">
          <h1 className="display text-hero text-bone">
            Studio
            <br />
            Eighty7
          </h1>
          <p className="mt-8 max-w-[34ch] text-lg text-dust">
            Production, mixing and mastering for hip-hop, trap, R&B, kompa and afro artists.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={playLatest}
              disabled={!canPlay}
              className="inline-flex min-w-[11.5rem] items-center justify-center gap-2 rounded-md bg-rec px-6 py-3 font-semibold text-bone disabled:opacity-50"
            >
              {latestPlaying ? <Pause size={18} /> : <Play size={18} />}
              {latestPlaying ? 'Pause' : 'Play the latest'}
            </button>
            <a
              href="#book"
              className="inline-flex items-center rounded-md border border-bone px-6 py-3 font-semibold text-bone"
            >
              Book a session
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <ul className="sr-only">
            {GENRES.map((genre) => (
              <li key={genre.name}>{genre.name}</li>
            ))}
          </ul>
          <div
            aria-hidden="true"
            className="flex justify-between rounded-xl border border-line bg-panel p-6"
          >
            {GENRES.map((genre, i) => (
              <div key={genre.name} className="flex flex-col items-center gap-3">
                <div className="flex gap-2 h-44 lg:h-80">
                  <div className="relative w-3">
                    <div className="absolute inset-0 flex flex-col gap-[2px]">
                      {Array.from({ length: SEGMENTS }, (_, s) => (
                        <span key={s} className="flex-1 rounded-[1px] bg-line" />
                      ))}
                    </div>
                    <div
                      className="meter-lit absolute inset-0 flex flex-col gap-[2px]"
                      data-live={playing}
                      style={
                        {
                          '--duration': TIMING[i % TIMING.length].duration,
                          '--delay': TIMING[i % TIMING.length].delay,
                        } as React.CSSProperties
                      }
                    >
                      {Array.from({ length: SEGMENTS }, (_, s) => (
                        <span
                          key={s}
                          className={`flex-1 rounded-[1px] ${s < 2 ? 'bg-rec' : 'bg-amber'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative w-6">
                    <span className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-line" />
                    <span
                      className="absolute left-0 h-4 w-6 -translate-y-1/2 rounded-sm bg-bone"
                      style={{ top: `${100 - genre.level}%` }}
                    />
                  </div>
                </div>
                <span className="data text-xs text-dust">{genre.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
