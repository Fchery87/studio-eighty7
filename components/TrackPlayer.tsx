import React, { useState, useEffect } from 'react';
import { fetchTracks } from '../services/wordpressService';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const TrackPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const track = tracks[currentTrack];

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await fetchTracks();
      setTracks(data);
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setProgress(0);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <section id="music" className="py-24 bg-samurai-black relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-gray-500 animate-pulse">Loading tracks...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="music" className="py-24 bg-samurai-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-sm font-bold tracking-[0.3em] text-samurai-red mb-2 uppercase">Featured Tracks</h2>
          <h3 className="font-display text-5xl md:text-7xl text-white uppercase font-bold">Listen Now</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Track List */}
          <div className="space-y-3">
            {tracks.map((t, index) => (
              <div
                key={t.id}
                onClick={() => selectTrack(index)}
                className={`group flex items-center gap-4 p-4 border cursor-pointer transition-all duration-300 ${
                  currentTrack === index 
                    ? 'border-samurai-red bg-samurai-red/10' 
                    : 'border-white/10 bg-white/5 hover:border-samurai-red/50'
                }`}
              >
                <div className="relative w-16 h-16 overflow-hidden">
                  <img 
                    src={t.cover} 
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />
                  {currentTrack === index && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-4 bg-samurai-red animate-pulse"></div>
                        <div className="w-1 h-4 bg-samurai-red animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-4 bg-samurai-red animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-display text-lg text-white uppercase mb-1">{t.title}</div>
                  <div className="text-sm text-gray-400">{t.artist} • {t.genre}</div>
                </div>

                <div className="text-gray-500 font-mono text-sm">{t.duration}</div>

                {currentTrack === index ? (
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 text-samurai-red">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                ) : (
                  <button className="p-2 text-gray-500 group-hover:text-white transition-colors">
                    <Play size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Now Playing */}
          <div className="bg-white/5 border border-white/10 p-8 sticky top-24">
            <div className="mb-6">
              <div className="text-xs text-samurai-red font-bold uppercase tracking-widest mb-2">Now Playing</div>
              
              <div className="aspect-square mb-6 overflow-hidden">
                <img 
                  src={track?.cover} 
                  alt={track?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h4 className="font-display text-3xl text-white uppercase font-bold mb-2">{track?.title}</h4>
              <div className="flex items-center gap-3 text-gray-400">
                <span>{track?.artist}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-samurai-red/20 text-samurai-red text-xs uppercase tracking-wider">{track?.genre}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-samurai-red transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>0:00</span>
                <span>{track?.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={prevTrack} className="p-3 text-gray-400 hover:text-white transition-colors">
                <SkipBack size={24} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-samurai-red hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
              </button>
              
              <button onClick={nextTrack} className="p-3 text-gray-400 hover:text-white transition-colors">
                <SkipForward size={24} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Volume2 size={20} className="text-gray-500" />
              <div className="w-32 h-1 bg-white/10 rounded-full">
                <div className="w-3/4 h-full bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackPlayer;
