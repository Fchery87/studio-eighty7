import React, { useState, useEffect } from 'react';
import { fetchServices } from '../services/wordpressService';
import { Music, Sliders, Headphones } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  music: <Music size={40} />,
  sliders: <Sliders size={40} />,
  headphones: <Headphones size={40} />,
};

const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="services" className="py-24 bg-samurai-black relative">
         <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-gray-500 animate-pulse">Loading services...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-24 bg-samurai-black relative">
       <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-sm font-bold tracking-[0.3em] text-samurai-red mb-2 uppercase">Studio Eighty7</h2>
          <h3 className="font-display text-5xl md:text-7xl text-white uppercase font-bold">Sonic Arsenal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="group relative p-8 border border-white/5 bg-white/5 backdrop-blur-sm hover:border-samurai-red/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
                 <span className="font-display text-6xl font-bold">0{index + 1}</span>
              </div>
              
              <div className="mb-6 text-samurai-red group-hover:scale-110 transition-transform duration-300 origin-left">
                {iconMap[service.icon]}
              </div>
              
              <h4 className="font-display text-2xl text-white mb-4 uppercase tracking-wide group-hover:text-samurai-red transition-colors">
                {service.title}
              </h4>
              
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {service.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-samurai-red group-hover:w-full transition-all duration-700"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
