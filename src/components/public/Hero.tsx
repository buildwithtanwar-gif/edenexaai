import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, CheckCircle2, MessageSquare, Code, Layers } from 'lucide-react';

const EdenexaCore3D = lazy(() =>
  import('../common/EdenexaCore3D').then((module) => ({ default: module.EdenexaCore3D }))
);

interface HeroProps {
  onStartProject: () => void;
  onExploreWork: () => void;
  eyebrow?: string;
  headline?: string;
  description?: string;
  supportingLine?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onStartProject,
  onExploreWork,
  eyebrow = 'Web Engineering & Digital Craft',
  headline = 'Build Smarter. Grow Faster.',
  description = 'Edenexa builds fast, modern, and purposeful websites for growing businesses. High-performance engineering, responsive craft, and direct developer collaboration.',
  supportingLine = 'Mobile-first performance · Transparent milestones · Direct developer communication',
}) => {
  const [shouldLoad3D, setShouldLoad3D] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (!prefersReducedMotion && !isMobile) {
      setShouldLoad3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-white">
      {/* Subtle Ambient Brand Glows: Deep Plum (#3A0F34) + Golden Yellow (#EAAA00) */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#EAAA00]/8 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-[#3A0F34]/5 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Fine Architectural Grid in Light Grey */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(221, 227, 232, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(221, 227, 232, 0.45) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Typography & Actions */}
          <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8 z-10">
            {/* Status & Availability Indicator */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold tracking-wide uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#EAAA00] animate-pulse" />
                <span>{eyebrow}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F6F8] border border-[#DDE3E8] text-[11px] font-mono text-[#7A7280]">
                <span className="text-[#EAAA00] font-bold">●</span>
                <span>Open for Client Projects</span>
              </div>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#3A0F34] tracking-tight leading-[1.08]">
              <span>Build Smarter.</span>{' '}
              <span className="block sm:inline">
                Grow{' '}
                <span className="text-[#EAAA00] relative inline-block">
                  Faster.
                  <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#EAAA00]/25 rounded-full -z-10" />
                </span>
              </span>
            </h1>

            {/* Supporting Editorial Paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-[#4A4550] max-w-2xl font-normal leading-relaxed">
              {description}
            </p>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onStartProject}
                data-cursor="LET'S TALK"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-extrabold text-[#3A0F34] bg-[#EAAA00] hover:bg-[#D69800] active:bg-[#C28A00] transition-all duration-300 shadow-md shadow-[#EAAA00]/30 hover:shadow-lg hover:shadow-[#EAAA00]/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#3A0F34]" />
              </button>

              <button
                onClick={onExploreWork}
                data-cursor="EXPLORE"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-[#3A0F34] bg-white hover:bg-[#F4F6F8] border border-[#DDE3E8] hover:border-[#EAAA00] transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                <span>Explore Services</span>
                <ChevronRight className="w-4 h-4 text-[#7A7280] group-hover:text-[#3A0F34]" />
              </button>
            </div>

            {/* Honest Technical Foundations & Trust Signals */}
            <div className="pt-4 border-t border-[#DDE3E8] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#5C5260] font-medium">
              <span className="inline-flex items-center gap-1.5 text-[#3A0F34]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#EAAA00]" />
                Modern Responsive Architecture
              </span>
              <span className="text-[#DDE3E8]">·</span>
              <span className="inline-flex items-center gap-1.5 text-[#3A0F34]">
                <MessageSquare className="w-3.5 h-3.5 text-[#3A0F34]" />
                Direct Communication
              </span>
              <span className="text-[#DDE3E8]">·</span>
              <span className="inline-flex items-center gap-1.5 text-[#3A0F34]">
                <Code className="w-3.5 h-3.5 text-[#EAAA00]" />
                Clean TypeScript & Tailwind
              </span>
            </div>
          </div>

          {/* Right Column: Central 3D Centerpiece / Static Visual Fallback */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft Plum & Gold Glow Ring */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#EAAA00]/15 via-[#3A0F34]/8 to-[#EAAA00]/10 rounded-full blur-3xl pointer-events-none opacity-80" />

            {/* Honest Floating Signal 1 (Top Left) */}
            <div className="absolute -top-3 -left-4 sm:-left-6 z-20 p-3.5 rounded-2xl bg-white/95 border border-[#DDE3E8] shadow-lg shadow-[#3A0F34]/8 backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] border border-[#EAAA00]/30 flex items-center justify-center text-[#EAAA00] shrink-0 font-bold">
                <Code className="w-4 h-4 text-[#EAAA00]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[#7A7280] uppercase tracking-wider">MODERN STACK</div>
                <div className="text-xs font-bold text-[#3A0F34]">React & TypeScript</div>
              </div>
            </div>

            {/* Honest Floating Signal 2 (Bottom Right) */}
            <div className="absolute -bottom-3 -right-3 sm:-right-5 z-20 p-3.5 rounded-2xl bg-white/95 border border-[#DDE3E8] shadow-lg shadow-[#3A0F34]/8 backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFF5] border border-[#3A0F34]/20 flex items-center justify-center text-[#3A0F34] shrink-0 font-bold">
                <Layers className="w-4 h-4 text-[#3A0F34]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[#7A7280] uppercase tracking-wider">COLLABORATION</div>
                <div className="text-xs font-bold text-[#3A0F34]">Clear Scoping & Updates</div>
              </div>
            </div>

            {/* Container for 3D Engine or Mobile/Reduced Motion Static Insignia */}
            <div className="relative w-full max-w-[520px] rounded-3xl bg-white border border-[#DDE3E8] shadow-xl shadow-[#3A0F34]/6 backdrop-blur-sm overflow-hidden p-2">
              <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-mono text-[#3A0F34] uppercase tracking-widest pointer-events-none z-10 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#EAAA00]" />
                <span>EDENEXA STUDIO</span>
              </div>

              <div className="absolute top-3 right-4 text-[10px] font-mono text-[#7A7280] uppercase pointer-events-none z-10 font-medium">
                DIGITAL ARCHITECTURE
              </div>

              {shouldLoad3D ? (
                <Suspense
                  fallback={
                    <div className="h-[360px] sm:h-[430px] lg:h-[470px] flex items-center justify-center bg-white">
                      <div className="w-12 h-12 rounded-2xl border-2 border-[#EAAA00]/40 border-t-[#EAAA00] animate-spin" />
                    </div>
                  }
                >
                  <EdenexaCore3D height="h-[360px] sm:h-[430px] lg:h-[470px]" />
                </Suspense>
              ) : (
                <div className="h-[320px] sm:h-[380px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#FFFDF9] to-[#F8FAFC]">
                  <div className="w-24 h-24 rounded-3xl bg-[#FFF8E6] border-2 border-[#EAAA00]/40 flex items-center justify-center mb-5 shadow-lg shadow-[#EAAA00]/20">
                    <span className="text-3xl font-black text-[#3A0F34] tracking-wider font-mono">EX</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#3A0F34]">High-Performance Web Engineering</h3>
                  <p className="text-xs text-[#5C5260] max-w-xs mt-2 leading-relaxed">
                    Purpose-built digital experiences combining architectural precision with seamless mobile responsiveness.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
