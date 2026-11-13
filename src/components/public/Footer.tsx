import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onNavigateLegal?: (path: string) => void;
  tagline?: string;
  publicEmail?: string;
  location?: string;
  hasProjects?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateLegal,
  tagline = 'Your Vision. Built for the Web.',
  publicEmail = '',
  location = '',
  hasProjects = false,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#3A0F34] text-[#DDE3E8] text-xs relative overflow-hidden">
      {/* Decorative top accent gold line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#EAAA00] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => onNavigate('home')} className="text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-extrabold text-base text-[#3A0F34] shadow-md border border-[#EAAA00]">
                  E
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-white block leading-none">
                    EDENEXA
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#EAAA00]">
                    Web Engineering Studio
                  </span>
                </div>
              </div>
            </button>
            <p className="text-white font-medium text-sm">
              {tagline}
            </p>
            <p className="text-[#DDE3E8]/80 text-xs leading-relaxed max-w-sm">
              We design and engineer bespoke, mobile-first, and high-performance digital web solutions for growing businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Services
                </button>
              </li>
              {hasProjects && (
                <li>
                  <button onClick={() => onNavigate('portfolio')} className="hover:text-[#EAAA00] transition cursor-pointer">
                    Work & Case Studies
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('process')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Process Timeline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('why-us')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Why Edenexa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Pricing & Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Information & Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Information & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  About Edenexa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#EAAA00] transition cursor-pointer">
                  Project Inquiry
                </button>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    if (onNavigateLegal && !e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onNavigateLegal('/privacy');
                    }
                  }}
                  className="hover:text-[#EAAA00] transition cursor-pointer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    if (onNavigateLegal && !e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onNavigateLegal('/terms');
                    }
                  }}
                  className="hover:text-[#EAAA00] transition cursor-pointer"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Studio Info
            </h4>
            <div className="space-y-2 text-xs text-[#DDE3E8]/80">
              {publicEmail && <p>Email: {publicEmail}</p>}
              {location && <p>Base: {location}</p>}
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-[#EAAA00] hover:underline font-semibold transition cursor-pointer"
                >
                  Start a Project →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#DDE3E8]/70">
          <div>
            &copy; {new Date().getFullYear()} EDENEXA. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-[#DDE3E8] hover:text-[#EAAA00] transition cursor-pointer"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#EAAA00]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
