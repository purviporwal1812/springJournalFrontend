import React from 'react';

const MobileMenu = ({ isOpen, onLinkClick }) => {
  const navLinks = ["Home", "Features", "About"];

  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-cream z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        {navLinks.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} onClick={onLinkClick} className="text-3xl text-gray-700 hover:text-terracotta-600 transition-colors">{link}</a>
        ))}
        <div className="flex flex-col space-y-4 w-4/5 max-w-xs pt-8">
            <button onClick={onLinkClick} className="w-full text-terracotta-600 border border-terracotta-500 font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:bg-terracotta-500 hover:text-white">
                Login
            </button>
            <button onClick={onLinkClick} className="w-full bg-terracotta-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-terracotta-600 transition-all duration-300">
                Sign Up
            </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;