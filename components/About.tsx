import React from 'react';
import { Headphones, Music, Star, Zap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-samurai-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-[0.3em] text-samurai-red mb-2 uppercase">About Studio Eighty7</h2>
              <h3 className="font-display text-5xl md:text-6xl text-white uppercase font-bold leading-tight">
                Where Sound Meets Vision
              </h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed mb-6 text-lg">
              For over a decade, Studio Eighty7 has been at the forefront of sonic innovation. We don't just produce music—we craft experiences that resonate across cultures and generations.
            </p>
            
            <p className="text-gray-400 leading-relaxed mb-8">
              From underground hip-hop to mainstream R&B, from trap beats to Caribbean kompa and afro rhythms, our genre-bending approach has earned us recognition from artists worldwide. Every track we create is a testament to our commitment to quality and creativity.
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-samurai-red mb-2">12+</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Years</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-samurai-red mb-2">870+</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-samurai-red mb-2">2M+</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Streams</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-samurai-red/10 to-transparent p-1">
              <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1000&fit=crop"
                alt="Studio Eighty7"
                className="w-full h-auto grayscale opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-samurai-red p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <Headphones className="text-white" size={32} />
                <div>
                  <div className="text-sm text-gray-200 uppercase tracking-wider">Signature Sound</div>
                  <div className="font-display text-2xl font-bold text-white">Production</div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-samurai-red/30"></div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-samurai-red/10 rounded-lg">
              <Music className="text-samurai-red" size={24} />
            </div>
            <div>
              <h4 className="font-display text-xl text-white mb-2 uppercase">Multi-Genre Expertise</h4>
              <p className="text-gray-400 text-sm">Master of hip-hop, trap, R&B, kompa, and afro rhythms</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-samurai-red/10 rounded-lg">
              <Zap className="text-samurai-red" size={24} />
            </div>
            <div>
              <h4 className="font-display text-xl text-white mb-2 uppercase">Fast Turnaround</h4>
              <p className="text-gray-400 text-sm">Professional delivery without compromising quality</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-samurai-red/10 rounded-lg">
              <Star className="text-samurai-red" size={24} />
            </div>
            <div>
              <h4 className="font-display text-xl text-white mb-2 uppercase">Proven Results</h4>
              <p className="text-gray-400 text-sm">Track record of successful releases and satisfied artists</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
