import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ } from '../../types';

interface FaqSectionProps {
  faqs: FAQ[];
  fromDatabase: boolean;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, fromDatabase }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#F4F6F8] border-t border-[#DDE3E8] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight">
            Frequently Asked <span className="text-[#EAAA00]">Questions</span>
          </h2>

          <p className="mt-4 text-[#5C5260] text-base">
            Everything you need to know about our web development process, pricing, revisions, and setup.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-heading-${faq.id || index}`;
            const panelId = `faq-panel-${faq.id || index}`;

            return (
              <div
                key={faq.id || index}
                className={`rounded-2xl transition-all duration-200 border bg-white ${
                  isOpen
                    ? 'border-[#EAAA00] shadow-md shadow-[#EAAA00]/10'
                    : 'border-[#DDE3E8] hover:border-[#EAAA00]/50'
                }`}
              >
                <h3>
                  <button
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EAAA00] rounded-2xl cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#3A0F34] pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`p-1.5 rounded-full bg-[#F4F6F8] border border-[#DDE3E8] text-[#3A0F34] transition-all duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 bg-[#EAAA00] text-[#3A0F34] border-[#EAAA00]' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5C5260] leading-relaxed border-t border-[#DDE3E8] animate-fadeIn"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
