import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Mail,
  Clock,
  ExternalLink
} from 'lucide-react';
import { BusinessType, PricingPackage, Coupon } from '../../types';
import { submitInquiry, isSupabaseConfigured, validateCouponCode } from '../../lib/supabase';
import { buildWhatsAppUrl, sanitizePhoneNumber } from '../../lib/whatsapp';

interface ContactSectionProps {
  pricingPackages: PricingPackage[];
  selectedPackageName?: string;
  publicEmail?: string;
  publicWhatsAppNumber?: string;
  publicWhatsAppDisplay?: string;
  workingHours?: string;
  location?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  pricingPackages,
  selectedPackageName = 'Starter Website',
  publicEmail = '',
  publicWhatsAppNumber = '',
  publicWhatsAppDisplay = '',
  workingHours = 'Mon – Sat, 10:00 AM – 7:00 PM IST',
  location = 'India',
}) => {
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Cafe / Restaurant');
  const [packageInterest, setPackageInterest] = useState(selectedPackageName);
  const [budget, setBudget] = useState('₹2,000–₹5,000');
  const [requirements, setRequirements] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscountDisplay, setCouponDiscountDisplay] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await validateCouponCode(trimmed);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscountDisplay(res.discountDisplay || 'Discount applied');
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponDiscountDisplay(null);
        setCouponError(res.error || 'Invalid or expired coupon code.');
      }
    } catch (err: any) {
      setCouponError('Failed to validate coupon code.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountDisplay(null);
    setCouponError(null);
    setCouponCode('');
  };

  // Honeypot & Timing for spam abuse prevention
  const [honeypot, setHoneypot] = useState('');
  const formMountTimeRef = useRef<number>(Date.now());

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Keep package in sync when selected from PricingSection
  useEffect(() => {
    if (selectedPackageName) {
      setPackageInterest(selectedPackageName);
    }
  }, [selectedPackageName]);

  useEffect(() => {
    formMountTimeRef.current = Date.now();
  }, []);

  const businessTypes: BusinessType[] = [
    'Cafe / Restaurant',
    'Salon / Beauty',
    'Local Business',
    'Startup',
    'Personal Brand',
    'Other',
  ];

  const budgetOptions = [
    'Under ₹2,000',
    '₹2,000–₹5,000',
    '₹5,000–₹10,000',
    '₹10,000+',
    'Need guidance',
  ];

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (fullName.trim().length > 120) {
      errors.fullName = 'Full name must be under 120 characters.';
    }

    const cleanPhoneDigits = whatsappNumber.replace(/\D/g, '');
    if (!whatsappNumber.trim()) {
      errors.whatsappNumber = 'Phone number is required.';
    } else if (cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 15) {
      errors.whatsappNumber = 'Please enter a valid phone number (10 to 15 digits).';
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!requirements.trim()) {
      errors.requirements = 'Project requirements are required.';
    } else if (requirements.trim().length < 10) {
      errors.requirements = 'Please provide a little more detail (at least 10 characters).';
    } else if (requirements.trim().length > 2500) {
      errors.requirements = 'Requirements must be under 2,500 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Honeypot check or minimum time-to-submit check (3 seconds): silently drop bot submissions
    const elapsedSeconds = (Date.now() - formMountTimeRef.current) / 1000;
    const isBot = Boolean(honeypot.trim()) || elapsedSeconds < 3;

    if (isBot) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFullName('');
        setBusinessName('');
        setEmail('');
        setWhatsappNumber('');
        setRequirements('');
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponDiscountDisplay(null);
        setValidationErrors({});
      }, 400);
      return;
    }

    if (!isSupabaseConfigured) {
      setSubmitError('Online inquiry form is currently not connected. Please contact us on WhatsApp directly.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const cleanPhone = whatsappNumber.trim();

    const result = await submitInquiry({
      name: fullName.trim(),
      business_name: businessName.trim() || null,
      email: email.trim() || null,
      phone: cleanPhone,
      business_type: businessType,
      service: packageInterest,
      budget: budget || null,
      requirements: requirements.trim(),
      coupon_code: appliedCoupon?.code || null,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      setFullName('');
      setBusinessName('');
      setEmail('');
      setWhatsappNumber('');
      setRequirements('');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponDiscountDisplay(null);
      setValidationErrors({});
    } else {
      setSubmitError(result.error || 'Failed to submit inquiry. Please try again.');
    }
  };

  // WhatsApp click-to-chat action if phone is provided
  const directWhatsAppUrl = publicWhatsAppNumber
    ? buildWhatsAppUrl(
        publicWhatsAppNumber,
        `Hi Edenexa, I would like to inquire about a website for my ${businessType}. Package: ${packageInterest}.`
      )
    : null;

  const fallbackWhatsAppUrl = publicWhatsAppNumber
    ? buildWhatsAppUrl(
        publicWhatsAppNumber,
        'Hi Edenexa, I would like to inquire about starting a web project.'
      )
    : null;

  return (
    <section id="contact" className="py-24 bg-white border-t border-[#DDE3E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Start Your Project</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3A0F34] tracking-tight leading-tight">
            LET'S BUILD SOMETHING <span className="text-[#EAAA00]">EXTRAORDINARY.</span>
          </h2>

          <p className="mt-4 text-[#5C5260] text-base sm:text-lg leading-relaxed">
            Tell us what you're imagining. We'll help you turn the idea into an engineered digital experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact & Agency Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#F4F6F8] border border-[#DDE3E8] space-y-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#3A0F34]">Direct Communication</h3>
              <p className="text-xs sm:text-sm text-[#5C5260] leading-relaxed">
                Prefer immediate communication? Reach out directly. We are ready to answer your questions and discuss project specifications.
              </p>

              <div className="space-y-4 pt-2">
                {/* WhatsApp (only if configured) */}
                {publicWhatsAppNumber && (
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-[#DDE3E8]">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-[#7A7280] uppercase font-bold">WhatsApp</div>
                      <div className="text-sm font-bold text-[#3A0F34]">{publicWhatsAppDisplay || publicWhatsAppNumber}</div>
                      <div className="text-[11px] text-[#5C5260]">Fastest response channel</div>
                    </div>
                  </div>
                )}

                {/* Email (if configured) */}
                {publicEmail && (
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-[#DDE3E8]">
                    <div className="p-2 rounded-lg bg-[#FFF8E6] text-[#EAAA00] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-[#7A7280] uppercase font-bold">Email</div>
                      <div className="text-sm font-bold text-[#3A0F34]">{publicEmail}</div>
                      <div className="text-[11px] text-[#5C5260]">Detailed scopes & documentation</div>
                    </div>
                  </div>
                )}

                {/* Operating Hours & Location */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-[#DDE3E8]">
                  <div className="p-2 rounded-lg bg-[#FFF8E6] text-[#EAAA00] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-[#7A7280] uppercase font-bold">Working Hours</div>
                    <div className="text-sm font-bold text-[#3A0F34]">{workingHours}</div>
                    {location && <div className="text-[11px] text-[#5C5260]">Base: {location}</div>}
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA */}
              {directWhatsAppUrl && (
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start WhatsApp Conversation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4F6F8] border border-[#DDE3E8] shadow-lg relative">
              {submitSuccess ? (
                /* Success Confirmation State */
                <div className="py-10 text-center space-y-5 animate-fadeIn">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold text-[#3A0F34]">Inquiry Received!</h3>

                  <p className="text-sm text-[#5C5260] max-w-md mx-auto leading-relaxed">
                    Thank you. Your inquiry has been successfully received. We will review your project details and reach out to discuss the next steps.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {directWhatsAppUrl && (
                      <a
                        href={directWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Continue to WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#F4F6F8] border border-[#DDE3E8] text-[#3A0F34] text-xs font-semibold transition"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : !isSupabaseConfigured ? (
                /* Friendly WhatsApp notice if Supabase is unconfigured */
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#EAAA00] flex items-center justify-center mx-auto shadow-xs">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3A0F34]">Please Contact Us on WhatsApp</h3>
                  <p className="text-sm text-[#5C5260] max-w-md mx-auto leading-relaxed">
                    Our direct messaging line is open and ready. Tap below to chat directly with our team on WhatsApp for fast responses and project estimates.
                  </p>
                  {fallbackWhatsAppUrl && (
                    <div className="pt-2">
                      <a
                        href={fallbackWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Live Inquiry Form */
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Honeypot field (hidden from genuine users) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_url_check">Leave empty</label>
                    <input
                      id="website_url_check"
                      type="text"
                      name="website_url_check"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Submission Error Alert */}
                  {submitError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1 space-y-1">
                        <div className="font-bold text-rose-800">Submission Notice</div>
                        <div>{submitError}</div>
                      </div>
                    </div>
                  )}

                  {/* Row 1: Full Name & WhatsApp Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        Full Name <span className="text-[#EAAA00]">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        maxLength={120}
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition ${
                          validationErrors.fullName ? 'border-rose-500' : 'border-[#DDE3E8]'
                        }`}
                      />
                      {validationErrors.fullName && (
                        <p className="text-[11px] text-rose-600 mt-1">{validationErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        WhatsApp / Phone <span className="text-[#EAAA00]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. +1 (555) 234-5678"
                        maxLength={25}
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition ${
                          validationErrors.whatsappNumber ? 'border-rose-500' : 'border-[#DDE3E8]'
                        }`}
                      />
                      {validationErrors.whatsappNumber && (
                        <p className="text-[11px] text-rose-600 mt-1">{validationErrors.whatsappNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Business Name & Email (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        Business Name <span className="text-[#7A7280] text-[10px] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Artisanal Cafe"
                        maxLength={150}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDE3E8] text-sm text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        Email Address <span className="text-[#7A7280] text-[10px] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        maxLength={150}
                        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition ${
                          validationErrors.email ? 'border-rose-500' : 'border-[#DDE3E8]'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Business Type & Package Interest */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        Business Type <span className="text-[#EAAA00]">*</span>
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDE3E8] text-sm text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition"
                      >
                        {businessTypes.map((type) => (
                          <option key={type} value={type} className="bg-white text-[#3A0F34]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                        Package Interest <span className="text-[#EAAA00]">*</span>
                      </label>
                      <select
                        value={packageInterest}
                        onChange={(e) => setPackageInterest(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DDE3E8] text-sm text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition"
                      >
                        {pricingPackages.length > 0 ? (
                          pricingPackages.map((pkg) => (
                            <option key={pkg.id} value={pkg.name} className="bg-white text-[#3A0F34]">
                              {pkg.name} ({pkg.price === null ? "Let's Discuss" : `₹${Number(pkg.price).toLocaleString('en-IN')}`})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Custom Website Project" className="bg-white text-[#3A0F34]">
                              Custom Website Project
                            </option>
                            <option value="Cafe / Restaurant Website" className="bg-white text-[#3A0F34]">
                              Cafe / Restaurant Website
                            </option>
                            <option value="Business Website" className="bg-white text-[#3A0F34]">
                              Business Website
                            </option>
                            <option value="Website Redesign" className="bg-white text-[#3A0F34]">
                              Website Redesign
                            </option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Budget Range */}
                  <div>
                    <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                      Estimated Budget <span className="text-[#7A7280] text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {budgetOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBudget(opt)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                            budget === opt
                              ? 'bg-[#EAAA00] border-[#EAAA00] text-[#3A0F34] font-extrabold shadow-sm'
                              : 'bg-white border-[#DDE3E8] text-[#5C5260] hover:text-[#3A0F34] hover:border-[#EAAA00]/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 4.5: Promo / Coupon Code */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#DDE3E8] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#3A0F34]">
                        Promo / Referral Code <span className="text-[#7A7280] text-[10px] font-normal">(Optional)</span>
                      </label>
                      {appliedCoupon && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {appliedCoupon.code} ({couponDiscountDisplay}) ✓
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10"
                        disabled={Boolean(appliedCoupon)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DDE3E8] text-xs font-mono font-bold uppercase text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 disabled:bg-[#F4F6F8] disabled:text-[#7A7280]"
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3.5 py-2 rounded-xl bg-[#F4F6F8] hover:bg-rose-50 text-rose-600 border border-[#DDE3E8] text-xs font-bold transition cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="px-4 py-2 rounded-xl bg-[#3A0F34] hover:bg-[#250A21] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {isValidatingCoupon ? 'Validating...' : 'Apply'}
                        </button>
                      )}
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                    )}
                  </div>

                  {/* Row 5: Project Requirements */}
                  <div>
                    <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                      Project Requirements <span className="text-[#EAAA00]">*</span>
                    </label>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Please describe your business, key features needed (e.g. online booking, visual menu, contact flow), reference sites you admire, and your timeline."
                      rows={4}
                      maxLength={2500}
                      required
                      className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-[#3A0F34] placeholder-[#7A7280]/60 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition ${
                        validationErrors.requirements ? 'border-rose-500' : 'border-[#DDE3E8]'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {validationErrors.requirements ? (
                        <p className="text-[11px] text-rose-600">{validationErrors.requirements}</p>
                      ) : (
                        <span className="text-[10px] text-[#7A7280]">Provide as much detail as you'd like</span>
                      )}
                      <span className="text-[10px] text-[#7A7280] font-mono">
                        {requirements.length}/2500
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-extrabold text-sm text-[#3A0F34] bg-[#EAAA00] hover:bg-[#D69800] transition-all duration-300 shadow-md shadow-[#EAAA00]/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#3A0F34]" />
                          <span>Submitting Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#3A0F34]" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-[#7A7280] text-center mt-2.5">
                      Your details are handled in accordance with our Privacy Policy.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
