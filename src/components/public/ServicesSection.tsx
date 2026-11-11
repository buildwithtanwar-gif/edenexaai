import React, { useState } from 'react';
import {
  Globe,
  Bot,
  CalendarCheck,
  Layout,
  Gauge,
  Palette,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { Service } from '../../types';

interface ServicesSectionProps {
  services: Service[];
  fromDatabase: boolean;
  onSelectService: (serviceTitle: string) => void;
}

interface FlagshipService {
  number: string;
  title: string;
  short_description: string;
  features: string[];
  icon: React.ReactNode;
  accent: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  fromDatabase,
  onSelectService,
}) => {
  // 6 Flagship Capabilities requested by design constitution
  const flagshipServices: FlagshipService[] = [
    {
      number: '01',
      title: 'Premium Website Development',
      short_description:
        'Bespoke, high-performance web applications engineered with modern frameworks, silky smooth micro-interactions, and instant loading speeds.',
      features: [
        'React & TypeScript architecture',
        'Sub-second page speeds',
        'Custom interactive micro-animations',
        'SEO & structured metadata',
      ],
      icon: <Globe className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
    {
      number: '02',
      title: 'AI-Powered Digital Solutions',
      short_description:
        'Practical artificial intelligence integrations, automated smart inquiry routing, contextual chatbots, and generative content workflows.',
      features: [
        'AI prompt & workflow engineering',
        'Automated lead qualification',
        'Dynamic personalized responses',
        'Full data privacy compliance',
      ],
      icon: <Bot className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
    {
      number: '03',
      title: 'Booking & Appointment Systems',
      short_description:
        'Frictionless booking pipelines, direct WhatsApp reservation triggers, real-time calendar synchronization, and automated client notifications.',
      features: [
        '1-Tap WhatsApp direct reservations',
        'Automated SMS / email reminders',
        'Time-slot availability management',
        'Mobile-first friction-free UX',
      ],
      icon: <CalendarCheck className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
    {
      number: '04',
      title: 'Business Websites & Landing Pages',
      short_description:
        'Focused conversion destinations built for ambitious local businesses, cafes, and growing brands seeking authority in their market.',
      features: [
        'High-converting editorial copy layout',
        'Interactive culinary / retail menus',
        'Google Maps & local SEO pins',
        'Optimized for mobile thumbs',
      ],
      icon: <Layout className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
    {
      number: '05',
      title: 'Custom Dashboards & Admin Panels',
      short_description:
        'Secure, role-based internal management portals. Manage services, pricing, coupon codes, inquiries, and customer data in real time.',
      features: [
        'Role-based access control (RBAC)',
        'Live data synchronicity & CRUD',
        'Authentication & session guards',
        'CSV exports & audit history',
      ],
      icon: <Gauge className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
    {
      number: '06',
      title: 'UI/UX Design & Digital Experiences',
      short_description:
        'Award-winning visual identities, design systems, kinetic motion choreography, and tactile user interfaces that command respect.',
      features: [
        'Refined typography & visual hierarchy',
        'Interactive clickable prototypes',
        'Cohesive typography & dark mode',
        'Accessibility & contrast rigor',
      ],
      icon: <Palette className="w-6 h-6 text-[#00F0FF]" />,
      accent: 'from-[#00F0FF]/15 via-[#111524]/40 to-transparent',
    },
  ];

  // Mouse tilt tracking state for 3D card perspective
  const [tiltCards, setTiltCards] = useState<Record<number, { rx: number; ry: number }>>({});

  const handleCardMouseMove = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rx = -(y / (rect.height / 2)) * 6;
    const ry = (x / (rect.width / 2)) * 6;

    setTiltCards((prev) => ({ ...prev, [idx]: { rx, ry } }));
  };

  const handleCardMouseLeave = (idx: number) => {
    setTiltCards((prev) => ({ ...prev, [idx]: { rx: 0, ry: 0 } }));
  };

  return (
    <section id="services" className="py-24 md:py-32 bg-[#F4F6F8] relative overflow-hidden border-t border-[#DDE3E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Full-Stack Capabilities</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight leading-tight">
              Complete Digital Solutions for{' '}
              <span className="text-[#EAAA00] relative inline-block">
                Your Business
                <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#EAAA00]/25 rounded-full -z-10" />
              </span>
            </h2>

            <p className="mt-4 text-[#4A4550] text-base sm:text-lg leading-relaxed">
              We eliminate technical debt and generic templates. Every solution is architected with modern frontend craftsmanship, fast database reactivity, and intentional motion design.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[11px] px-3.5 py-1.5 rounded-full border border-[#DDE3E8] inline-flex items-center gap-2 font-semibold bg-white text-[#5C5260] shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Tailored Solutions</span>
            </span>
          </div>
        </div>

        {/* 6-Card Interactive 3D Perspective Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flagshipServices.map((service, index) => {
            const tilt = tiltCards[index] || { rx: 0, ry: 0 };

            return (
              <div
                key={service.number}
                onMouseMove={(e) => handleCardMouseMove(index, e)}
                onMouseLeave={() => handleCardMouseLeave(index)}
                data-cursor="SELECT"
                className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#3A0F34]/6 select-none text-left"
                style={{
                  transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div className="relative z-10">
                  {/* Top Header: Icon & Monogram Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FFF8E6] border border-[#EAAA00]/30 shadow-xs group-hover:scale-105 group-hover:border-[#EAAA00] transition-all duration-300 text-[#EAAA00]">
                      {service.icon}
                    </div>

                    <span className="text-2xl font-black font-mono text-[#DDE3E8] group-hover:text-[#EAAA00] transition-colors">
                      {service.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3A0F34] mb-3 group-hover:text-[#3A0F34] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4A4550] leading-relaxed mb-6 font-normal">
                    {service.short_description}
                  </p>

                  {/* Feature Checkpoints */}
                  <div className="space-y-2 mb-8 pt-4 border-t border-[#DDE3E8] text-xs text-[#5C5260]">
                    {service.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#EAAA00] shrink-0 font-bold" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA / Learn More */}
                <div className="relative z-10 pt-2">
                  <button
                    onClick={() => onSelectService(service.title)}
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F4F6F8] hover:bg-[#EAAA00] text-[#3A0F34] font-bold text-xs border border-[#DDE3E8] hover:border-[#EAAA00] transition-all duration-200 cursor-pointer group/btn shadow-xs hover:shadow-sm"
                  >
                    <span>Learn More & Consult</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
