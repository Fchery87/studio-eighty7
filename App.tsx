import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Listen from './components/Listen';
import Services from './components/Services';
import Albums from './components/Albums';
import About from './components/About';
import AiOracle from './components/AiOracle';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { PlayerProvider } from './components/player/PlayerProvider';

const App: React.FC = () => {
  return (
    <PlayerProvider>
    <div className="min-h-screen bg-samurai-black text-white selection:bg-samurai-red selection:text-white font-sans">
      <Navbar />
      <main>
        <Hero />
        <Listen />
        <Services />
        <Albums />
        <About />
        <AiOracle />
        <Contact />
      </main>
      <Footer />
    </div>
    </PlayerProvider>
  );
};

export default App;
