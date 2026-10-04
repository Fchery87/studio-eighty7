import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Listen from './components/Listen';
import Services from './components/Services';
import Albums from './components/Albums';
import About from './components/About';
import AiOracle from './components/AiOracle';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { PlayerProvider } from './components/player/PlayerProvider';
import { SECTIONS } from './constants';
import { fetchAlbums, fetchServices } from './services/wordpressService';
import type { Album, Service } from './types';

const App: React.FC = () => {
  const [services, setServices] = useState<Service[] | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    fetchServices().then(setServices);
    fetchAlbums().then(setAlbums);
  }, []);

  const sections = SECTIONS.filter(
    (section) => section.id !== 'records' || albums.length > 0
  );

  const bookService = (title: string) => {
    setSelectedService(title);
    document.getElementById('book')?.scrollIntoView();
  };

  return (
    <PlayerProvider>
      <div className="min-h-screen bg-walnut text-bone font-sans selection:bg-amber selection:text-walnut">
        <Header sections={sections} />
        <main>
          <Hero />
          <Listen />
          <Services services={services} onBook={bookService} />
          <Albums albums={albums} />
          <About />
          <AiOracle />
          <Contact
            services={services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />
        </main>
        <Footer sections={sections} />
      </div>
    </PlayerProvider>
  );
};

export default App;
