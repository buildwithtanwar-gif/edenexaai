import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../common/Logo';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  hasProjects?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  hasProjects = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Services', id: 'services' },
    ...(hasProjects ? [{ label: 'Work', id: 'portfolio' }] : []),
    { label: 'Process', id: 'process' },
    { label: 'Why Us', id: 'why-us' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'About', id: 'about' },
    { label: 'FAQ', id: 'faq' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/92 backdrop-blur-xl border-b border-[#DDE3E8] py-3.5 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      {/* Scroll Progress Bar at very top in Golden Yellow & Deep Plum */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#3A0F34] via-[#EAAA00] to-[#F5B81A] transition-all duration-150 ease-out z-50 shadow-[0_0_8px_rgba(234,170,0,0.5)]"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="shrink-0">
            <button
              onClick={() => handleLinkClick('home')}
              className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EAAA00] rounded-lg group cursor-pointer"
              aria-label="Edenexa Home"
            >
              <Logo size="md" />
            </button>
          </div>

          {/* Navigation Links in Light Grey Surface Container */}
          <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F6F8] border border-[#DDE3E8] shadow-sm">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#3A0F34] border border-[#DDE3E8] shadow-sm font-bold'
                      : 'text-[#3A0F34]/70 hover:text-[#3A0F34] hover:bg-white/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Button */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleLinkClick('contact')}
              className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-[#3A0F34] bg-[#EAAA00] hover:bg-[#D69800] active:bg-[#C28A00] transition-all duration-300 shadow-sm shadow-[#EAAA00]/25 hover:shadow-md hover:shadow-[#EAAA00]/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 text-[#3A0F34]" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#3A0F34]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-2xl border-b border-[#DDE3E8] px-6 py-6 space-y-4 animate-fadeIn shadow-lg">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className="text-left py-2.5 text-sm font-semibold text-[#3A0F34]/80 hover:text-[#EAAA00] transition cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#DDE3E8] space-y-3">
            <button
              onClick={() => handleLinkClick('contact')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-md shadow-[#EAAA00]/25 cursor-pointer"
            >
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
