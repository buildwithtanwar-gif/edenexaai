import React from 'react';
import { Database, Zap, Code, Layout, Globe } from 'lucide-react';

export const TechStrip: React.FC = () => {
  const technologies = [
    { name: 'React', category: 'Frontend UI Framework', icon: <Globe className="w-4 h-4 text-[#3A0F34]" /> },
    { name: 'TypeScript', category: 'Strict Type Safety', icon: <Code className="w-4 h-4 text-[#EAAA00]" /> },
    { name: 'Supabase', category: 'Database & Auth', icon: <Database className="w-4 h-4 text-[#3A0F34]" /> },
    { name: 'Tailwind CSS', category: 'Modern Styling', icon: <Layout className="w-4 h-4 text-[#EAAA00]" /> },
    { name: 'Vercel', category: 'Edge Performance', icon: <Zap className="w-4 h-4 text-[#3A0F34]" /> },
  ];

  return (
    <section className="py-10 bg-[#F4F6F8] border-y border-[#DDE3E8] relative overflow-hidden" aria-label="Technologies we build with">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#7A7280] font-bold">
            Technologies we build with
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center max-w-4xl mx-auto">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-[#DDE3E8] shadow-xs hover:border-[#EAAA00]/60 hover:shadow-sm transition-all duration-200 group text-center min-w-[140px] sm:min-w-[160px] flex-1"
            >
              <div className="mb-1.5 p-2 rounded-lg bg-[#F4F6F8] group-hover:bg-[#FFF8E6] transition-colors">
                {tech.icon}
              </div>
              <span className="text-xs font-bold text-[#3A0F34] truncate w-full">
                {tech.name}
              </span>
              <span className="text-[10px] text-[#7A7280] truncate w-full mt-0.5">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
