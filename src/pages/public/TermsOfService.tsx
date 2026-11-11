import React from 'react';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
  contactEmail?: string;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, contactEmail = 'contact@edenexa.in' }) => {
  return (
    <div className="min-h-screen bg-white text-[#3A0F34]">
      {/* Top Header */}
      <div className="border-b border-[#DDE3E8] bg-[#F4F6F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#DDE3E8] text-xs font-bold text-[#3A0F34] hover:border-[#EAAA00] transition cursor-pointer mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Back to Edenexa</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Clear Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3A0F34] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-2">
            Effective Date: November 1, 2026 · Transparent client collaboration terms
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm sm:text-base text-[#4A4550] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">1. Services Overview</h2>
          <p>
            Edenexa provides bespoke website design, frontend development, website redesigns, and technical support. Specific scopes, deliverables, timelines, and fees are agreed upon in writing before commencing project work.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">2. Project Engagement & Milestone Deliverables</h2>
          <p>
            To ensure complete clarity and alignment:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Scope Definition:</strong> Every project begins with a confirmed scope listing included pages, features, and target timelines.</li>
            <li><strong>Client Materials:</strong> Clients are responsible for providing business information, logos, photographs, and menu/service items in a timely manner.</li>
            <li><strong>Revisions:</strong> Standard packages include agreed revision rounds (1 round for Starter, 2 rounds for Business) to fine-tune copy, imagery, and layout within the agreed scope.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">3. Fees & Third-Party Expenses</h2>
          <p>
            Quoted design and development fees represent our upfront labor for the agreed build. External recurring costs (such as domain registration, paid hosting tiers, third-party email providers, or payment gateway processor fees) are separate expenses billed directly by those respective providers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">4. Intellectual Property & Ownership</h2>
          <p>
            Upon settlement of the final project milestone, full ownership of the custom website code, design layout, and provided brand assets is transferred to the client. Edenexa reserves the right to showcase the completed project in its portfolio and case studies unless a non-disclosure agreement (NDA) is executed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">5. Questions & Contact</h2>
          <p>
            For any questions or clarification regarding these terms, please contact us directly at{' '}
            <a href={`mailto:${contactEmail}`} className="text-[#3A0F34] font-bold underline hover:text-[#EAAA00]">
              {contactEmail}
            </a>.
          </p>
        </section>

        <section className="pt-6 border-t border-[#DDE3E8] space-y-2 text-xs text-[#7A7280]">
          <p>Edenexa Studio · Digital Craft & Web Development</p>
          <p>Terms subject to written project agreements and mutual consent.</p>
        </section>
      </div>
    </div>
  );
};
