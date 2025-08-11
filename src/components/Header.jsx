import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { Link } from 'react-router-dom';

const Header = ({ onMenuToggle, isMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-cream/80 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Dancing Script', cursive" }}>
          SpringJournal
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/login">
          <button className="text-terracotta-700 hover:text-white hover:bg-terracotta-500 border border-terracotta-500 font-semibold py-2 px-5 rounded-full transition-all duration-300">
            Login
          </button>
          </Link>
          <Link to="/signup">
          <button  className="text-terracotta-700 hover:text-white hover:bg-terracotta-500 border border-terracotta-500 font-semibold py-2 px-5 rounded-full transition-all duration-300">
            Sign Up
          </button>
          </Link>
        </nav>

        <div className="md:hidden">
          <button onClick={onMenuToggle} className="text-gray-800 focus:outline-none">
            <Icon path={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;