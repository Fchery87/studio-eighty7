import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-samurai-black/90 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo Area */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-samurai-red flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-300">
            <span className="font-display font-bold text-white text-xl transform group-hover:-rotate-45">87</span>
          </div>
          <span className="font-display text-2xl tracking-widest text-white">STUDIO EIGHTY7</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-sm font-semibold tracking-widest text-gray-400 hover:text-white transition-colors uppercase relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-samurai-red group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
          <a 
            href="#contact"
            className="relative group px-6 py-2 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-samurai-gray transform -skew-x-12 group-hover:bg-samurai-red transition-colors duration-300 border border-gray-700 group-hover:border-samurai-red"></span>
            <span className="relative font-display text-lg tracking-wider text-white uppercase">Contact Us</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-samurai-black border-t border-gray-800 p-6 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-xl font-display text-white hover:text-samurai-red uppercase"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a 
            href="#contact"
            className="text-xl font-display text-samurai-red uppercase"
            onClick={() => setMobileOpen(false)}
          >
            Contact Us
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
