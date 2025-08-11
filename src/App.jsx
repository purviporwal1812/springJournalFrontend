import React, { useState } from 'react';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Feature from './components/About';
import Icon from './components/Icon';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
  const closeMenuAndScroll = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={`bg-cream text-gray-800 transition-all duration-300 ${isMenuOpen ? 'overflow-hidden' : ''}`}>
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
      <MobileMenu isOpen={isMenuOpen} onLinkClick={closeMenuAndScroll} />
      
      <main className={`transition-filter duration-300 ${isMenuOpen ? 'blur-sm' : ''}`}>
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center text-center px-4 pt-24 pb-12">
            <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Dancing Script', cursive" }}>
                    A quiet space for your thoughts.
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    SpringJournal is your private, secure, and beautiful online diary. Reflect on your day, track your moods, and watch yourself grow over time.
                </p>
                <button 
                    className="text-terracotta-700 hover:text-white hover:bg-terracotta-500 border border-terracotta-500 font-semibold py-2 px-5 rounded-full transition-all duration-300"
                >
                    Start Your Journal
                </button>
            </div>
        </section>

        <section id="features" className="py-20 bg-teal-100/40 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Why You'll Love SpringJournal</h2>
                    <p className="text-gray-600 mt-2">Everything you need to build a consistent journaling habit.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Feature icon={<Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />} title="Completely Private">
                        Your entries are encrypted and secure. Only you can read your thoughts.
                    </Feature>
                    <Feature icon={<Icon path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} title="Mood Tracking">
                        Visually track your emotions over time to gain valuable self-insight.
                    </Feature>
                    <Feature icon={<Icon path="M10.34 1.87a.75.75 0 01.66 0l7.5 4.125a.75.75 0 010 1.32l-7.5 4.125a.75.75 0 01-.66 0L2.84 8.64a.75.75 0 010-1.32l7.5-4.125zM2.5 10.875l7.5 4.125 7.5-4.125" />} title="Simple & Elegant">
                        A clean, distraction-free interface designed to help you focus on writing.
                    </Feature>
                </div>
            </div>
        </section>
      </main>

    </div>
  );
}