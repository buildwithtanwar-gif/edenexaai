import React from 'react';
import { Compass, Lightbulb, Palette, Code2, Rocket, Sparkles } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'DISCOVER',
      subtitle: 'Audit & Understand',
      icon: <Compass className="w-5 h-5 text-[#EAAA00]" />,
      description:
        'Understand the business, audience, core competencies, and high-value conversion goals. We identify exactly how customers search and choose your services.',
    },
    {
      number: '02',
      title: 'STRATEGIZE',
      subtitle: 'Information Architecture',
      icon: <Lightbulb className="w-5 h-5 text-[#EAAA00]" />,
      description:
        'Define the digital experience, site structure, conversion funnels (direct WhatsApp routing, reservation pipeline), and technical stack.',
    },
    {
      number: '03',
      title: 'DESIGN',
      subtitle: 'Visual Identity & UI/UX',
      icon: <Palette className="w-5 h-5 text-[#EAAA00]" />,
      description:
        'Develop the bespoke visual identity, editorial typography, light atmospheric surfaces, and tactile interface components tailored to your market.',
    },
    {
      number: '04',
      title: 'BUILD',
      subtitle: 'Precision Development',
      icon: <Code2 className="w-5 h-5 text-[#EAAA00]" />,
      description:
        'Implement the website with clean React & TypeScript, sub-second loading performance, responsive touch controls, and robust Supabase database connectivity.',
    },
    {
      number: '05',
      title: 'LAUNCH',
      subtitle: 'Deployment & Evolution',
      icon: <Rocket className="w-5 h-5 text-[#EAAA00]" />,
      description:
        'Rigorous cross-device testing, custom domain SSL routing, local SEO verification, and complete client ownership handoff with ongoing support.',
    },
  ];

  return (
    <section id="process" className="py-24 md:py-32 bg-[#F4F6F8] border-t border-[#DDE3E8] relative overflow-hidden">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#EAAA00]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Structured 5-Phase Methodology</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight leading-tight">
            How We Engineer Your <br />
            <span className="text-[#EAAA00]">
              Digital Flagship
            </span>
          </h2>

          <p className="mt-4 text-[#5C5260] text-base sm:text-lg leading-relaxed">
            A collaborative, milestone-driven workflow designed to deliver high-ticket digital experiences with zero guesswork or missed deadlines.
          </p>
        </div>

        {/* 5-Step Process Grid with Connecting Golden Track */}
        <div className="relative">
          {/* Connecting Track on Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] -translate-y-12 bg-gradient-to-r from-transparent via-[#EAAA00]/40 to-transparent -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-[#EAAA00]/10 text-left flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Number Watermark & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF8E6] border border-[#EAAA00]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#EAAA00] group-hover:text-[#3A0F34] transition-all duration-300 text-[#EAAA00]">
                      {step.icon}
                    </div>

                    <span className="text-xl font-black font-mono text-[#DDE3E8] group-hover:text-[#EAAA00] transition-colors">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-extrabold text-[#3A0F34] tracking-wide mb-1">
                    {step.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#EAAA00] uppercase mb-3 font-bold">
                    {step.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#5C5260] leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Step Indicator Dot */}
                <div className="pt-4 mt-4 border-t border-[#DDE3E8] flex items-center gap-1.5 text-[10px] font-mono text-[#7A7280]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00]" />
                  <span>Phase {step.number} of 05</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
