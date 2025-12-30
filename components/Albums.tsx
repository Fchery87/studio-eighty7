import React, { useState, useEffect } from 'react';
import { fetchAlbums } from '../services/wordpressService';
import { Play, ExternalLink } from 'lucide-react';

const Albums: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const data = await fetchAlbums();
      setAlbums(data);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="albums" className="py-24 bg-samurai-black relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-gray-500 animate-pulse">Loading albums...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="albums" className="py-24 bg-samurai-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-bold tracking-[0.3em] text-samurai-red mb-2 uppercase">The Collection</h2>
          <h3 className="font-display text-5xl md:text-7xl text-white uppercase font-bold">Albums & EPs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className="group relative bg-white/5 border border-white/10 hover:border-samurai-red/50 transition-all duration-500 overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={album.cover} 
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-xs text-samurai-red font-bold uppercase tracking-widest mb-2">{album.year}</div>
                  <h4 className="font-display text-3xl text-white uppercase font-bold mb-1">{album.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{album.subtitle}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{album.tracks} Tracks</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-samurai-red hover:bg-red-700 text-white text-sm font-semibold uppercase tracking-wider transition-colors">
                        <Play size={16} />
                        Preview
                      </button>
                      <a 
                        href={album.appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Buy
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Border Animation */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-samurai-red to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Albums;
