import React from 'react';
import { STATS } from '../constants';

const FEATURES = [
  {
    title: 'Five genres',
    text: 'Hip-hop, trap, R&B, kompa and afro, produced by people who listen to all of them.',
  },
  {
    title: 'Fast turnaround',
    text: 'Clear timelines and steady delivery, so a record does not sit waiting.',
  },
  {
    title: 'Releases that landed',
    text: 'A catalog of finished records and artists who come back for the next one.',
  },
];

const About: React.FC = () => {
  return (
    <section id="studio" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <h2 className="display text-4xl md:text-6xl mb-8">The studio</h2>

          <p className="text-dust max-w-[65ch] mb-4">
            Studio Eighty7 makes beats, full productions, mixes and masters. For over a decade we have worked with artists from the first sketch to the final file.
          </p>
          <p className="text-dust max-w-[65ch]">
            Most of the work is hip-hop, trap and R&B, with kompa and afro projects alongside. Our clients are independent artists who want a producer who stays with the record.
          </p>

          <ul className="mt-10 grid grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <li key={stat.label}>
                <p className="display text-2xl md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-dust">{stat.label}</p>
              </li>
            ))}
          </ul>

          <ul className="mt-12 border-t border-line">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="border-b border-line py-5">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-dust">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <img
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1000&fit=crop"
          alt="Studio Eighty7 recording studio"
          className="w-full h-auto rounded-xl"
        />
      </div>
    </section>
  );
};

export default About;
