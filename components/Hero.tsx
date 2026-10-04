import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from './player/PlayerProvider';

const PHOTO = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=70';

const Hero: React.FC = () => {
  const { tracks, index, status, select, toggle } = usePlayer();
  const latestPlaying = status === 'playing' && index === 0;
  const canPlay = Boolean(tracks[0]?.audioUrl);

  const playLatest = () => {
    if (index === 0 && status !== 'idle') toggle();
    else select(0);
  };

  return (
    <section className="relative isolate flex min-h-[calc(100svh-64px)] max-h-[860px] items-end overflow-hidden">
      <img
        src={`${PHOTO}&w=1600`}
        srcSet={`${PHOTO}&w=800 800w, ${PHOTO}&w=1600 1600w, ${PHOTO}&w=2400 2400w`}
        sizes="100vw"
        alt="Recording studio control room with guitars on the wall"
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
      />
      {/* Keeps the copy legible over the brightest parts of the photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-walnut from-25% via-walnut/80 via-55% to-walnut/10 md:bg-gradient-to-r md:from-walnut md:from-0% md:via-walnut/70 md:via-45% md:to-transparent"
      />

      <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-40 md:pb-24">
        <h1 className="display max-w-[14ch] text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] text-bone">
          Records made right here.
        </h1>
        <p className="mt-6 max-w-[38ch] text-lg text-bone/80">
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
            className="inline-flex items-center rounded-md border border-bone bg-walnut/40 px-6 py-3 font-semibold text-bone backdrop-blur-sm"
          >
            Book a session
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
