import React from 'react';
import { ArrowLeft, Shield, Lock, Trash2, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  contactEmail?: string;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, contactEmail = 'contact@edenexa.in' }) => {
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
            <Shield className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Transparency & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3A0F34] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5260] mt-2">
            Effective Date: November 1, 2026 · Plain language notice
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm sm:text-base text-[#4A4550] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">1. Our Core Commitment</h2>
          <p>
            At Edenexa, we respect your privacy. We believe in minimal data collection and zero deceptive tracking. We do not sell, rent, or trade your personal information with third parties or data brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">2. What Data We Collect</h2>
          <p>
            When you choose to contact us or submit a project inquiry through our website contact form, we collect only the information you voluntarily provide:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Full Name:</strong> To address you professionally in communications.</li>
            <li><strong>WhatsApp Phone Number:</strong> To contact you directly regarding your inquiry and project deliverables.</li>
            <li><strong>Business Name (Optional):</strong> To understand your business context.</li>
            <li><strong>Email Address (Optional):</strong> To send formal scopes, proposals, or invoices.</li>
            <li><strong>Project Requirements & Budget:</strong> To prepare accurate scope assessments and milestone estimates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">3. Why We Collect This Data & How We Use It</h2>
          <p>
            Your information is used exclusively for legitimate business communication:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
            <li>Reviewing your project goals and answering inquiries.</li>
            <li>Providing technical proposals, timeline estimates, and milestones.</li>
            <li>Coordinating design drafts and frontend feedback.</li>
          </ul>
          <p>
            We do not use your contact information for automated marketing blasts, spam calls, or unrelated newsletters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">4. Data Storage & Security</h2>
          <p>
            Your submissions are stored in our secure database with PostgreSQL Row Level Security (RLS) enabled. Only authenticated studio administrators have access to inquiry records. We employ strict access controls to prevent unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">5. Cookies & Tracking</h2>
          <p>
            This website does not use tracking cookies, advertising pixels, or cross-site fingerprinting. We use browser storage strictly for functional preferences (such as remembering if the introductory animation has been viewed).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#3A0F34]">6. How to Request Data Deletion</h2>
          <p>
            You have full ownership of your data. If you ever want us to permanently delete your inquiry record or contact information from our database, email us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-[#3A0F34] font-bold underline hover:text-[#EAAA00]">
              {contactEmail}
            </a>{' '}
            with your name and phone number. We will permanently delete your records within 48 business hours and confirm upon completion.
          </p>
        </section>

        <section className="pt-6 border-t border-[#DDE3E8] space-y-2 text-xs text-[#7A7280]">
          <p>Edenexa Studio · Digital Craft & Web Development</p>
          <p>For inquiries regarding this privacy statement, contact us at {contactEmail}.</p>
        </section>
      </div>
    </div>
  );
};
