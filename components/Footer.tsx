import React from 'react';
import type { Section } from '@/types';

interface FooterProps {
  sections: readonly Section[];
}

const Footer: React.FC<FooterProps> = ({ sections }) => {
  return (
    <footer className="border-t border-line py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="display text-4xl md:text-6xl">Have a record in mind?</p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#book"
              className="inline-flex rounded-md bg-rec px-6 py-3 font-semibold text-bone"
            >
              Book a session
            </a>
            <a href="mailto:info@studioeighty7.com" className="text-amber hover:underline">
              info@studioeighty7.com
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          <nav aria-label="Footer">
            <h2 className="mb-3 font-semibold">Site</h2>
            <ul className="space-y-2 text-dust">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className="hover:text-bone">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 font-semibold">Contact</h2>
            <ul className="space-y-2 text-dust">
              <li>
                <a href="mailto:info@studioeighty7.com" className="hover:text-bone">
                  info@studioeighty7.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/studioeighty7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bone"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-semibold">Studio</h2>
            <p className="text-dust max-w-[34ch]">
              Production, mixing and mastering. Hip-hop, trap, R&B, kompa, afro.
            </p>
          </div>
        </div>

        <div className="mt-16 flex justify-between gap-4 border-t border-line pt-6 text-sm text-dust">
          <p>© {new Date().getFullYear()} Studio Eighty7</p>
          <a href="#" className="hover:text-bone">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
