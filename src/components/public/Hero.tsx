import React from 'react';
import { ArrowRight, ChevronRight, CheckCircle2, MessageSquare, Code, Layers, Sparkles, Monitor, Smartphone, Gauge } from 'lucide-react';

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
  return (
    <section className="relative min-h-[85vh] flex items-center pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-white">
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

              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#5C5260] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Accepting New Client Projects</span>
              </div>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3A0F34] tracking-tight leading-[1.08] uppercase">
              {headline.includes('.') ? (
                <>
                  {headline.split('.')[0]}.
                  <br />
                  <span className="text-[#EAAA00]">{headline.split('.')[1] || ''}</span>
                </>
              ) : (
                headline
              )}
            </h1>

            {/* Strategic Value Proposition */}
            <p className="text-base sm:text-lg text-[#5C5260] max-w-2xl font-normal leading-relaxed">
              {description}
            </p>

            {/* Honest Supporting Note */}
            <p className="text-xs sm:text-sm text-[#7A7280] font-mono tracking-tight">
              {supportingLine}
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onStartProject}
                data-cursor="START"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-bold text-[#3A0F34] bg-[#EAAA00] hover:bg-[#D69800] transition-all duration-200 shadow-md shadow-[#EAAA00]/25 hover:shadow-lg hover:shadow-[#EAAA00]/35 cursor-pointer transform active:scale-[0.98]"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 text-[#3A0F34]" />
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
                Modern Responsive Websites
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

          {/* Right Column: Editorial Studio Showcase Card (Clean, Instant-Load) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft Plum & Gold Glow Ring */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#EAAA00]/15 via-[#3A0F34]/8 to-[#EAAA00]/10 rounded-full blur-3xl pointer-events-none opacity-80" />

            {/* Floating Signal 1 (Top Left) */}
            <div className="absolute -top-3 -left-4 sm:-left-6 z-20 p-3.5 rounded-2xl bg-white/95 border border-[#DDE3E8] shadow-lg shadow-[#3A0F34]/8 backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] border border-[#EAAA00]/30 flex items-center justify-center text-[#EAAA00] shrink-0 font-bold">
                <Code className="w-4 h-4 text-[#EAAA00]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[#7A7280] uppercase tracking-wider">MODERN STACK</div>
                <div className="text-xs font-bold text-[#3A0F34]">React & TypeScript</div>
              </div>
            </div>

            {/* Floating Signal 2 (Bottom Right) */}
            <div className="absolute -bottom-3 -right-3 sm:-right-5 z-20 p-3.5 rounded-2xl bg-white/95 border border-[#DDE3E8] shadow-lg shadow-[#3A0F34]/8 backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F6EFF5] border border-[#3A0F34]/20 flex items-center justify-center text-[#3A0F34] shrink-0 font-bold">
                <Layers className="w-4 h-4 text-[#3A0F34]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[#7A7280] uppercase tracking-wider">COLLABORATION</div>
                <div className="text-xs font-bold text-[#3A0F34]">Clear Scoping & Updates</div>
              </div>
            </div>

            {/* Studio Showcase Card Container */}
            <div className="relative w-full max-w-[500px] rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl shadow-[#3A0F34]/8 overflow-hidden">
              {/* Card Browser Bar Header */}
              <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#DDE3E8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] font-mono text-[#7A7280] font-medium hidden sm:inline">
                    edenexa.work.gd
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#3A0F34] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#EAAA00] animate-pulse" />
                  <span>EDENEXA STUDIO</span>
                </div>
              </div>

              {/* Card Content Interior */}
              <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-white to-[#FDFBF7]">
                {/* Brand Emblem & Studio Title */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF8E6] border border-[#EAAA00]/40 flex items-center justify-center text-[#3A0F34] shadow-sm shrink-0">
                    <span className="text-2xl font-black font-mono tracking-wider text-[#3A0F34]">EX</span>
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F4F6F8] text-[10px] font-mono font-bold text-[#3A0F34] uppercase">
                      <Sparkles className="w-3 h-3 text-[#EAAA00]" />
                      <span>Web Development Studio</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#3A0F34] tracking-tight">
                      Engineered for Growth & Trust
                    </h3>
                  </div>
                </div>

                {/* Core Strengths Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#DDE3E8] shadow-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Monitor className="w-4 h-4" />
                      <span className="text-xs font-bold text-[#3A0F34]">Desktop Polish</span>
                    </div>
                    <p className="text-[11px] text-[#5C5260] leading-snug">
                      Pixel-crisp layouts crafted with deliberate typographic hierarchy.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#DDE3E8] shadow-xs space-y-1">
                    <div className="flex items-center gap-2 text-[#EAAA00]">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-xs font-bold text-[#3A0F34]">Mobile First</span>
                    </div>
                    <p className="text-[11px] text-[#5C5260] leading-snug">
                      Engineered specifically for fluid smartphone navigation and touch.
                    </p>
                  </div>
                </div>

                {/* Performance & Delivery Banner */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EAAA00]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FFF8E6] text-[#EAAA00] shrink-0">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#3A0F34]">High-Performance Code</div>
                      <div className="text-[10px] text-[#5C5260]">Lightweight bundles · Fast rendering · SEO ready</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-white border border-[#DDE3E8] font-mono font-bold text-emerald-700 shrink-0">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
