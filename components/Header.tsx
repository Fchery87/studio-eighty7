import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Play, Pause } from 'lucide-react';
import type { Section } from '@/types';
import { usePlayer } from './player/PlayerProvider';

interface HeaderProps {
  sections: readonly Section[];
}

const Header: React.FC<HeaderProps> = ({ sections }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { track, status, currentTime, duration, toggle } = usePlayer();
  const playing = status === 'playing';
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const playButton = status !== 'idle' && (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      onClick={toggle}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-bone ${
        playing ? 'bg-rec' : 'border border-line'
      }`}
    >
      {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
    </button>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-16 border-b bg-walnut/85 backdrop-blur ${
          scrolled ? 'border-line' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-6 px-6">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <span className="data flex size-8 items-center justify-center rounded-full bg-rec text-sm text-bone">
              87
            </span>
            <span className="display text-base">Studio Eighty7</span>
          </a>

          <nav aria-label="Sections" className="hidden md:flex items-center gap-6 ml-auto">
            {sections.filter(({ id }) => id !== 'book').map(({ id, label }) => {
              const active = id === activeId;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`py-1 text-sm border-b-2 ${
                    active ? 'border-amber text-bone' : 'border-transparent text-dust hover:text-bone'
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          {track && status !== 'idle' && (
            <div className="hidden md:flex w-48 shrink-0 items-center gap-3">
              {playButton}
              <div className="min-w-0 flex-1">
                <a href="#listen" className="block truncate text-sm">
                  {track.title}
                </a>
                <div className="h-0.5 bg-line">
                  <div className="h-full bg-amber" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          <a
            href="#book"
            className="hidden md:inline-flex shrink-0 items-center rounded-md bg-rec px-4 py-2 text-sm font-semibold text-bone"
          >
            Book a session
          </a>

          <div className="ml-auto flex items-center gap-3 md:hidden">
            {playButton}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-1"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-walnut px-6 py-8 md:hidden"
        >
          <nav aria-label="Sections" className="flex flex-col gap-6">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={id === activeId ? 'true' : undefined}
                onClick={() => setMenuOpen(false)}
                className={`display text-4xl ${id === activeId ? 'text-bone' : 'text-dust'}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#book"
            onClick={() => setMenuOpen(false)}
            className="mt-10 inline-flex rounded-md bg-rec px-6 py-3 font-semibold text-bone"
          >
            Book a session
          </a>
        </div>
      )}
    </>
  );
};

export default Header;
