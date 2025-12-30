import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrackPlayer from './components/TrackPlayer';
import Services from './components/Services';
import Albums from './components/Albums';
import About from './components/About';
import AiOracle from './components/AiOracle';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-samurai-black text-white selection:bg-samurai-red selection:text-white font-sans">
      <Navbar />
      <main>
        <Hero />
        <TrackPlayer />
        <Services />
        <Albums />
        <About />
        <AiOracle />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
