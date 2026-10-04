import React, { useState } from 'react';
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
import { useRemote } from './components/useRemote';
import { SECTIONS } from './constants';
import { fetchAlbums, fetchServices } from './services/wordpressService';

const App: React.FC = () => {
  const [services, retryServices] = useRemote(fetchServices);
  const [remoteAlbums] = useRemote(fetchAlbums);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Records are optional, so a failed load hides the section instead of showing an error
  const albums = remoteAlbums.status === 'ready' ? remoteAlbums.data : [];

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
          <Services services={services} onRetry={retryServices} onBook={bookService} />
          <Albums albums={albums} />
          <About />
          <AiOracle />
          <Contact
            services={services.status === 'ready' ? services.data : null}
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
