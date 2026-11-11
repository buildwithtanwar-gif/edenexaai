import React from 'react';
import {
  Check,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Star
} from 'lucide-react';
import { PricingPackage } from '../../types';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

interface PricingSectionProps {
  packages: PricingPackage[];
  fromDatabase?: boolean;
  publicWhatsAppNumber?: string;
  onSelectPackage: (pkg: PricingPackage) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  packages,
  publicWhatsAppNumber = '',
  onSelectPackage,
}) => {
  const activePackages = packages.filter((p) => p.active !== false);

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#F4F6F8] border-t border-[#DDE3E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Honest & Upfront Rates</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight">
            Clear Packages. <span className="text-[#EAAA00]">Transparent Rates.</span>
          </h2>

          <p className="mt-4 text-[#5C5260] text-base sm:text-lg leading-relaxed">
            Transparent milestones, production-ready code, and agreed scopes. Zero hidden surprises.
          </p>
        </div>

        {/* Display Active Packages */}
        {activePackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-12">
            {activePackages.map((pkg) => {
              const isHighlighted = pkg.highlighted;
              const priceDisplay =
                pkg.price === null || pkg.price === undefined
                  ? "Let's Discuss"
                  : `₹${Number(pkg.price).toLocaleString('en-IN')}`;

              const waMessage = `Hi Edenexa, I am interested in the ${pkg.name} package (${priceDisplay}). Could we discuss the timeline and deliverables?`;
              const waUrl = publicWhatsAppNumber?.trim() ? buildWhatsAppUrl(publicWhatsAppNumber, waMessage) : null;

              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 bg-white ${
                    isHighlighted
                      ? 'border-2 border-[#EAAA00] shadow-xl shadow-[#EAAA00]/15 -translate-y-2'
                      : 'border border-[#DDE3E8] hover:border-[#EAAA00]/60 shadow-sm hover:shadow-xl'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#3A0F34]" />
                      <span>Recommended</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold text-[#3A0F34] mb-2">{pkg.name}</h3>

                    {pkg.description && (
                      <p className="text-xs text-[#5C5260] mb-6 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}

                    {/* Price Display */}
                    <div className="mb-6 pb-6 border-b border-[#DDE3E8]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#3A0F34] tracking-tight">
                          {priceDisplay}
                        </span>
                        {pkg.price !== null && (
                          <span className="text-xs text-[#7A7280] font-mono">
                            standard scope
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#7A7280] mt-1.5 block">
                        Milestone delivery · Transparent pricing · 0 hidden fees
                      </span>
                    </div>

                    {/* Feature Breakdown */}
                    <div className="space-y-3 mb-8">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]">
                        Deliverables Included:
                      </div>
                      {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                        pkg.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#5C5260]">
                            <div className="w-4 h-4 rounded-full bg-[#FFF8E6] text-[#EAAA00] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span>{feature}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#7A7280] italic">Custom scope agreed upfront</div>
                      )}
                    </div>
                  </div>

                  {/* Card CTAs */}
                  <div className="space-y-2.5 pt-4 border-t border-[#DDE3E8]">
                    <button
                      onClick={() => onSelectPackage(pkg)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        isHighlighted
                          ? 'bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] shadow-md shadow-[#EAAA00]/25'
                          : 'bg-[#FFF8E6] hover:bg-[#EAAA00] text-[#3A0F34] border border-[#EAAA00]/40'
                      }`}
                    >
                      <span>Select Package & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#5C5260] hover:text-[#3A0F34] hover:bg-[#F4F6F8] transition flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-[#7A7280] text-sm">
            Custom package quotes available upon inquiry.
          </div>
        )}
      </div>
    </section>
  );
};
