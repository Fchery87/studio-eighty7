import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <span className="font-display font-bold text-samurai-red text-xl">87</span>
            <span className="text-gray-500 text-sm tracking-widest">© {new Date().getFullYear()} STUDIO EIGHTY7</span>
        </div>
        
        <div className="flex gap-8 text-sm text-gray-500 uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
