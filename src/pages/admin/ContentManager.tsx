import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, Globe, Search } from 'lucide-react';
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

  // Form Fields: Global SEO Metadata
  const [seoTitle, setSeoTitle] = useState(
    INITIAL_SETTINGS.seo?.title || 'Edenexa | High-Performance Web Development Studio'
  );
  const [seoDescription, setSeoDescription] = useState(
    INITIAL_SETTINGS.seo?.description ||
      'Edenexa designs and builds bespoke, responsive websites that help businesses showcase their brand, build trust, and turn visitors into clients.'
  );
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(
    INITIAL_SETTINGS.seo?.canonicalUrl || 'https://edenexaai.vercel.app/'
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
          if (res.data.seo) {
            setSeoTitle(res.data.seo.title || INITIAL_SETTINGS.seo?.title || '');
            setSeoDescription(res.data.seo.description || INITIAL_SETTINGS.seo?.description || '');
            setSeoCanonicalUrl(res.data.seo.canonicalUrl || INITIAL_SETTINGS.seo?.canonicalUrl || '');
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

    const trimmedCanonical = seoCanonicalUrl.trim();
    if (trimmedCanonical) {
      try {
        const parsed = new URL(trimmedCanonical);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setErrorMessage('Canonical URL must start with https:// or http://');
          return;
        }
      } catch {
        setErrorMessage('Please enter a valid Canonical URL (e.g. https://edenexaai.vercel.app/).');
        return;
      }
    }

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

      const seoPayload = {
        title: seoTitle.trim(),
        description: seoDescription.trim(),
        canonicalUrl: trimmedCanonical,
      };

      await saveLiveSettings({
        brand: brandPayload,
        about: aboutPayload,
        seo: seoPayload,
      });

      showToast('Website content and SEO metadata updated successfully.', 'success');
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

          {/* Global SEO & Search Metadata Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-4 text-xs shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#EAAA00]" />
                <span>Global SEO &amp; Search Metadata</span>
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] font-bold uppercase tracking-wider w-fit">
                Dynamic Head Sync
              </span>
            </div>

            <p className="text-xs text-[#5C5260] leading-relaxed">
              Updates the document <code className="font-mono text-[#3A0F34]">&lt;title&gt;</code>,{' '}
              <code className="font-mono text-[#3A0F34]">&lt;meta name="description"&gt;</code>, OpenGraph / Twitter cards, and{' '}
              <code className="font-mono text-[#3A0F34]">&lt;link rel="canonical"&gt;</code> across your live site.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#3A0F34] font-bold">Global Site Title</label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    seoTitle.trim().length > 65 ? 'text-amber-600' : 'text-[#7A7280]'
                  }`}
                >
                  {seoTitle.trim().length} / 60 chars recommended
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                required
                maxLength={120}
                placeholder="Edenexa | High-Performance Web Development Studio"
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-semibold focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#3A0F34] font-bold">Meta Description</label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    seoDescription.trim().length > 165 ? 'text-amber-600' : 'text-[#7A7280]'
                  }`}
                >
                  {seoDescription.trim().length} / 160 chars recommended
                </span>
              </div>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                required
                rows={3}
                maxLength={320}
                placeholder="Summarize your studio value proposition in 1-2 compelling sentences..."
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">Canonical Base URL</label>
              <input
                type="url"
                value={seoCanonicalUrl}
                onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                required
                placeholder="https://edenexaai.vercel.app/"
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
              <span className="text-[10px] text-[#7A7280] mt-1 block">
                Primary authoritative URL for search engines and social share links (e.g. https://edenexaai.vercel.app/).
              </span>
            </div>

            {/* Search Result Snippet Preview */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A7280] mb-2">
                <Search className="w-3 h-3 text-[#EAAA00]" />
                <span>Search Engine Snippet Preview</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono truncate">
                {seoCanonicalUrl.trim() || 'https://edenexaai.vercel.app/'}
              </div>
              <div className="text-sm font-bold text-[#1A0DAB] truncate">
                {seoTitle.trim() || 'Edenexa | High-Performance Web Development Studio'}
              </div>
              <p className="text-xs text-[#5C5260] line-clamp-2 leading-relaxed">
                {seoDescription.trim() ||
                  'Edenexa designs and builds bespoke, responsive websites that help businesses showcase their brand, build trust, and turn visitors into clients.'}
              </p>
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
