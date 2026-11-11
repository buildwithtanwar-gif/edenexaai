import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { SiteSettings } from '../../types';
import { INITIAL_SETTINGS } from '../../lib/initialData';
import { fetchLiveSettings, saveLiveSettings } from '../../lib/adminStore';

interface ContentManagerProps {
  onDataUpdated?: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ onDataUpdated }) => {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields: Brand & Hero
  const [brandName, setBrandName] = useState(INITIAL_SETTINGS.brand?.name || 'EDENEXA');
  const [tagline, setTagline] = useState(INITIAL_SETTINGS.brand?.tagline || 'Your Vision. Built for the Web.');
  const [heroEyebrow, setHeroEyebrow] = useState(INITIAL_SETTINGS.brand?.eyebrow || 'DIGITAL CRAFT & HIGH-PERFORMANCE WEB STUDIO');
  const [heroHeadline, setHeroHeadline] = useState(INITIAL_SETTINGS.brand?.headline || 'Your Business Deserves a High-Performance Website.');
  const [heroDescription, setHeroDescription] = useState(
    INITIAL_SETTINGS.brand?.description ||
      'We craft modern, high-converting websites and digital experiences tailored to your business goals. Fast, mobile-first, and designed to turn visitors into customers.'
  );
  const [heroSupportingLine, setHeroSupportingLine] = useState(
    INITIAL_SETTINGS.brand?.supportingLine ||
      'Mobile-first performance · Transparent rates · Direct developer collaboration'
  );

  // Form Fields: About Copy
  const [aboutHeading, setAboutHeading] = useState(INITIAL_SETTINGS.about?.heading || 'About Edenexa');
  const [aboutParagraph1, setAboutParagraph1] = useState(
    INITIAL_SETTINGS.about?.paragraph1 ||
      "Edenexa is an engineering-driven web development agency focused on building clean, high-performance, and practical digital solutions for businesses."
  );
  const [aboutParagraph2, setAboutParagraph2] = useState(
    INITIAL_SETTINGS.about?.paragraph2 ||
      "Our approach is simple: understand the business, agree on the scope, design thoughtfully, and build a website that makes it easier for customers to discover and contact you."
  );

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchLiveSettings();
        if (res.data) {
          setSettings(res.data);
          if (res.data.brand) {
            setBrandName(res.data.brand.name || 'EDENEXA');
            setTagline(res.data.brand.tagline || '');
            setHeroEyebrow(res.data.brand.eyebrow || '');
            setHeroHeadline(res.data.brand.headline || '');
            setHeroDescription(res.data.brand.description || '');
            setHeroSupportingLine(res.data.brand.supportingLine || '');
          }
          if (res.data.about) {
            setAboutHeading(res.data.about.heading || 'About Edenexa');
            setAboutParagraph1(res.data.about.paragraph1 || '');
            setAboutParagraph2(res.data.about.paragraph2 || '');
          }
        }
      } catch (err: any) {
        console.error('Error loading site content:', err);
        setErrorMessage(err?.message || 'Failed to load website content');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsSaving(true);
    try {
      const brandPayload = {
        name: brandName.trim(),
        tagline: tagline.trim(),
        eyebrow: heroEyebrow.trim(),
        headline: heroHeadline.trim(),
        description: heroDescription.trim(),
        supportingLine: heroSupportingLine.trim(),
      };

      const aboutPayload = {
        heading: aboutHeading.trim(),
        paragraph1: aboutParagraph1.trim(),
        paragraph2: aboutParagraph2.trim(),
      };

      await saveLiveSettings({
        brand: brandPayload,
        about: aboutPayload,
      });

      showToast('Website content updated successfully.', 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      console.error('Error saving site content:', err);
      showToast(`Failed to update site content: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl text-[#3A0F34]">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
          Website Content Management
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
          Customize public headlines, hero supporting text, and agency descriptions stored in Supabase.
        </p>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-xs opacity-60 hover:opacity-100 font-bold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading content...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand & Hero Section Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-4 text-xs shadow-xs">
            <h2 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EAAA00]" />
              <span>Hero & Brand Copy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Hero Eyebrow</label>
              <input
                type="text"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] uppercase font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Hero Main Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-bold focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Hero Subtitle / Description</label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Supporting Trust Line</label>
              <input
                type="text"
                value={heroSupportingLine}
                onChange={(e) => setHeroSupportingLine(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>
          </div>

          {/* About Section Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-4 text-xs shadow-xs">
            <h2 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#EAAA00]" />
              <span>About Section Copy</span>
            </h2>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Section Heading</label>
              <input
                type="text"
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Paragraph 1 (Core Identity)</label>
              <textarea
                value={aboutParagraph1}
                onChange={(e) => setAboutParagraph1(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Paragraph 2 (Methodology & Philosophy)</label>
              <textarea
                value={aboutParagraph2}
                onChange={(e) => setAboutParagraph2(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-md shadow-[#EAAA00]/25 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#3A0F34]" /> : <Save className="w-4 h-4 text-[#3A0F34]" />}
              <span>Save Website Content</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
