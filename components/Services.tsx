import React from 'react';
import type { Remote, Service } from '@/types';
import LoadError from './LoadError';

interface ServicesProps {
  services: Remote<Service[]>;
  onRetry: () => void;
  onBook: (title: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, onRetry, onBook }) => {
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="display text-4xl md:text-6xl mb-12">Services</h2>

        {services.status === 'error' ? (
          <LoadError what="services" onRetry={onRetry} />
        ) : services.status === 'loading' ? (
          <div className="grid gap-px" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-32 rounded-md bg-panel" />
            ))}
          </div>
        ) : (
          <ul>
            {services.data.map((service) => (
              <li
                key={service.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start border-t border-line py-8"
              >
                <h3 className="display text-4xl md:col-span-5">{service.title}</h3>
                <p className="text-dust md:col-span-5 max-w-[65ch]">{service.description}</p>
                <button
                  type="button"
                  onClick={() => onBook(service.title)}
                  className="justify-self-start whitespace-nowrap md:justify-self-end font-semibold text-amber hover:underline"
                >
                  Book this
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Services;
