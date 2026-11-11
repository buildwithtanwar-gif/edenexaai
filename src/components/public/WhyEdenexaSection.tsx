import React from 'react';
import { ShieldCheck, Code, Smartphone, Zap, MessageSquare, Award, ArrowRight } from 'lucide-react';

interface WhyEdenexaProps {
  onStartProject: () => void;
}

export const WhyEdenexaSection: React.FC<WhyEdenexaProps> = ({ onStartProject }) => {
  const pillars = [
    {
      title: 'Business-Focused Architecture',
      description:
        'Every layout, content hierarchy, and call-to-action is structured to make it easy for prospective clients to understand your value and get in touch.',
      icon: <Award className="w-5 h-5 text-[#EAAA00]" />,
    },
    {
      title: 'Thoughtful Visual Design & Meticulous Craft',
      description:
        'Clean editorial typography, balanced white space, and refined color harmony tailored to reflect the quality of your brand.',
      icon: <Zap className="w-5 h-5 text-[#EAAA00]" />,
    },
    {
      title: 'Mobile-First Usability',
      description:
        'A majority of visitors browse on mobile devices. Every drawer, button size, and interactive flow is optimized for comfortable thumb navigation.',
      icon: <Smartphone className="w-5 h-5 text-[#EAAA00]" />,
    },
    {
      title: 'Modern Engineering Stack',
      description:
        'Built with modern technologies like React, TypeScript, and Tailwind CSS for fast loading times, responsive interactions, and clean maintainability.',
      icon: <Code className="w-5 h-5 text-[#EAAA00]" />,
    },
    {
      title: 'Direct, Transparent Communication',
      description:
        'Direct collaboration with developers, realistic milestones, and straightforward pricing without hidden fees or agency bureaucracy.',
      icon: <MessageSquare className="w-5 h-5 text-[#EAAA00]" />,
    },
    {
      title: 'Strict Security & Modern Performance',
      description:
        'Database connections protected by Row Level Security (RLS) with clean, secure code standards designed to keep client data private.',
      icon: <ShieldCheck className="w-5 h-5 text-[#EAAA00]" />,
    },
  ];

  return (
    <section id="why-us" className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-[#DDE3E8]">
      {/* Subtle radial back glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#EAAA00]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & Narrative */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#EAAA00]" />
              <span>Why Choose Edenexa</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight leading-tight">
              Websites Engineered for Real Business Results. <br />
              <span className="text-[#EAAA00]">
                Clean, Fast, and Purposeful.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#5C5260] leading-relaxed font-normal">
              Many business websites suffer from bloated templates, sluggish load times, and cluttered layouts. Edenexa builds focused web applications designed to load quickly, communicate clearly, and convert visitors into clients.
            </p>

            <div className="pt-2">
              <button
                onClick={onStartProject}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-md shadow-[#EAAA00]/25 transition cursor-pointer"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 text-[#3A0F34]" />
              </button>
            </div>
          </div>

          {/* Right Column: 6 Pillars Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F4F6F8] border border-[#DDE3E8] hover:border-[#EAAA00] hover:bg-white transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg hover:shadow-[#EAAA00]/10"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] border border-[#EAAA00]/30 flex items-center justify-center mb-4 text-[#EAAA00]">
                  {pillar.icon}
                </div>

                <h3 className="text-sm font-bold text-[#3A0F34] mb-2 leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-xs text-[#5C5260] leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
