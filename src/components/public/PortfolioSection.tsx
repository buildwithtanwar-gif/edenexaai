import React from 'react';
import { ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { Project } from '../../types';

interface PortfolioSectionProps {
  projects: Project[];
  fromDatabase?: boolean;
  onBuildSimilar: (projectTitle: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  projects,
  onBuildSimilar,
}) => {
  // Only display active projects from database. If none, hide the section entirely.
  const activeProjects = projects.filter((p) => p.active !== false);

  if (activeProjects.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-[#DDE3E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Selected Works & Case Studies</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight leading-tight">
              Crafted Projects & <br className="hidden sm:inline" />
              <span className="text-[#EAAA00] relative inline-block">
                Client Implementations
                <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#EAAA00]/25 rounded-full -z-10" />
              </span>
            </h2>

            <p className="mt-4 text-[#4A4550] text-base sm:text-lg leading-relaxed">
              Explore how we design and engineer high-converting web applications for modern businesses.
            </p>
          </div>
        </div>

        {/* Project Cards Stack */}
        <div className="space-y-12">
          {activeProjects.map((project, idx) => {
            const isExternalDemo = project.project_url && !project.project_url.startsWith('#');

            return (
              <div
                key={project.id || idx}
                data-cursor="VIEW"
                className="group relative rounded-3xl bg-white border border-[#DDE3E8] hover:border-[#EAAA00] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#3A0F34]/6 text-left"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                  
                  {/* Left Column: Visual Showcase Preview */}
                  <div className="lg:col-span-7 bg-[#F4F6F8] p-4 sm:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#DDE3E8]">
                    <div className="relative rounded-2xl overflow-hidden border border-[#DDE3E8] shadow-md group/preview bg-white">
                      {/* Browser Chrome Bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#DDE3E8] text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#EAAA00]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A0F34]/40" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A0F34]" />
                        </div>
                        <span className="text-[11px] font-mono text-[#7A7280] truncate max-w-[240px]">
                          {project.project_url || project.slug}
                        </span>
                        <span className="text-[10px] text-[#EAAA00] font-mono font-bold">PROJECT</span>
                      </div>

                      {/* Project Image Preview */}
                      <div className="relative h-64 sm:h-80 overflow-hidden bg-[#F4F6F8]">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#7A7280] text-xs">
                            No preview image provided
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0F34]/20 via-transparent to-transparent opacity-40" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Project Details & Story */}
                  <div className="lg:col-span-5 p-6 sm:p-10 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-[#EAAA00] uppercase tracking-wider block font-bold">
                        {project.category}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight group-hover:text-[#3A0F34] transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A4550] leading-relaxed font-normal">
                      {project.description}
                    </p>

                    {/* Action Links */}
                    <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-[#DDE3E8]">
                      {isExternalDemo && (
                        <a
                          href={project.project_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-md shadow-[#EAAA00]/25 transition-all duration-200"
                        >
                          <span>Visit Live Project</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#3A0F34]" />
                        </a>
                      )}

                      <button
                        onClick={() => onBuildSimilar(project.title)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F8] text-[#3A0F34] font-semibold text-xs border border-[#DDE3E8] hover:border-[#EAAA00] transition shadow-xs"
                      >
                        <span>Build Similar Project</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#EAAA00]" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
