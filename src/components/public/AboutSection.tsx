import React from 'react';
import { Target, HeartHandshake, Eye, Sparkles } from 'lucide-react';

interface AboutSectionProps {
  heading?: string;
  paragraph1?: string;
  paragraph2?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  heading = 'About Edenexa',
  paragraph1 = "Edenexa is a modern web development and AI solutions studio focused on building clean, high-performance, and practical websites for businesses. We combine AI-assisted workflows with hands-on frontend engineering to create responsive digital experiences tailored to each brand's commercial goals.",
  paragraph2 = "Our philosophy is grounded: understand the business, engineer the architecture, design thoughtfully, and build a digital flagship that makes it effortless for customers to discover and engage with you.",
}) => {
  return (
    <section id="about" className="py-24 bg-white border-t border-[#DDE3E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Who We Are</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight">
              {heading}
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-[#5C5260] leading-relaxed">
              <p>{paragraph1}</p>
              <p>{paragraph2}</p>
            </div>

            {/* Core Values / Real Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#DDE3E8]">
              <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] hover:border-[#EAAA00] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] border border-[#EAAA00]/30 text-[#EAAA00] flex items-center justify-center mb-2">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#3A0F34] mb-1">Clear Scope</h4>
                <p className="text-xs text-[#5C5260]">
                  Agreed deliverables before writing a single line of code.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] hover:border-[#EAAA00] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] border border-[#EAAA00]/30 text-[#EAAA00] flex items-center justify-center mb-2">
                  <Eye className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#3A0F34] mb-1">Honest Work</h4>
                <p className="text-xs text-[#5C5260]">
                  Transparent pricing and upfront turnaround expectations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] hover:border-[#EAAA00] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] border border-[#EAAA00]/30 text-[#EAAA00] flex items-center justify-center mb-2">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#3A0F34] mb-1">Direct Support</h4>
                <p className="text-xs text-[#5C5260]">
                  Fast WhatsApp communication directly with senior engineers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Philosophy Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-[#F4F6F8] border border-[#DDE3E8] p-8 shadow-md">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[#3A0F34] bg-white px-3 py-1 rounded-full border border-[#DDE3E8] shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00]" />
                  <span>Our Philosophy</span>
                </div>

                <blockquote className="text-xl font-bold text-[#3A0F34] leading-snug">
                  "Your website shouldn't just look pretty on a desktop screen. It must load in milliseconds on any phone and make it effortless for customers to contact and trust you."
                </blockquote>

                <div className="pt-6 border-t border-[#DDE3E8] space-y-3 text-xs text-[#5C5260]">
                  <div className="flex items-center justify-between">
                    <span>Target Clients</span>
                    <span className="font-semibold text-[#3A0F34]">Brands, Modern Cafes, Salons & Startups</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Headquarters</span>
                    <span className="font-semibold text-[#3A0F34]">India</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Billing Currency</span>
                    <span className="font-bold text-[#EAAA00]">Indian Rupees (INR)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
