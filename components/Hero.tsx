import React from 'react';
import { STATS, GENRES } from '../constants';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-samurai-black pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
         {/* Large blurred glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-samurai-red/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px]"></div>
        
        {/* Abstract "Slash" Graphic */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
             <path d="M0,0 L100,0 L100,100 Z" fill="#111" />
           </svg>
        </div>

        {/* The Studio/Tech Vibe Background Image - NOW FULL WIDTH */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
                alt="Studio Background" 
                className="w-full h-full object-cover opacity-40 grayscale"
                style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
            />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column (Text Overlay Logic) - visually centered in design but structured for grid */}
        <div className="lg:col-span-12 relative flex flex-col items-center justify-center text-center">
          
          {/* Main Visual Composition */}
          <div className="relative w-full h-[50vh] flex items-center justify-center">
            
            {/* Central Graphic (Simulating the Artist) */}
            <div className="absolute z-20 top-10 md:top-0 w-64 md:w-96 h-full flex items-center justify-center animate-pulse">
                 <div className="w-full h-4/5 bg-gradient-to-t from-black via-transparent to-transparent absolute bottom-0"></div>
                 {/* Silhouette / Speaker vibe */}
                <img 
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop" 
                    alt="Producer Silhouette"
                    className="h-full object-cover opacity-80 mix-blend-screen contrast-125 brightness-75" 
                    style={{ maskImage: 'radial-gradient(circle, black 60%, transparent 100%)' }}
                />
            </div>

            {/* Typography Behind/Around */}
            <h1 className="absolute z-30 text-6xl md:text-9xl font-display font-bold uppercase tracking-tighter leading-none italic select-none pointer-events-none">
              <span className="block text-white mix-blend-overlay opacity-80 -ml-20 md:-ml-40">Audio</span>
              <span className="block text-stroke-red opacity-90 md:ml-40">Tek-Domain</span>
            </h1>

             {/* Floating Elements (Audio Waves/Sparks) */}
             <div className="absolute top-10 left-10 w-20 h-1 bg-white rotate-45 animate-pulse opacity-50"></div>
             <div className="absolute bottom-20 right-20 w-32 h-1 bg-samurai-red -rotate-12 opacity-60"></div>

          </div>

          {/* Genres Display */}
          <div className="w-full max-w-4xl mt-8 mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Mastering These Genres</div>
            <div className="flex flex-wrap justify-center gap-3">
              {GENRES.map((genre, index) => (
                <div 
                  key={index}
                  className="px-5 py-2 border border-white/20 text-white text-sm font-semibold uppercase tracking-wider hover:border-white/50 transition-colors cursor-default"
                  style={{ borderColor: `${genre.color}40` }}
                >
                  {genre.name}
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Socials - Bottom Layer */}
          <div className="w-full max-w-5xl mt-4 flex flex-col md:flex-row justify-between items-end gap-8">
            
            {/* Stats */}
            <div className="flex gap-8 md:gap-12">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="font-display text-4xl md:text-5xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-4">
               {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-samurai-red hover:text-white transition-colors duration-300">
                    <Icon size={20} />
                 </a>
               ))}
            </div>

          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white to-transparent"></div>
        <span className="text-[10px] uppercase tracking-widest">Listen</span>
      </div>
    </section>
  );
};

export default Hero;
