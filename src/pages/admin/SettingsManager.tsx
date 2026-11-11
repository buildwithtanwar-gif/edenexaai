import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Phone, Globe, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { INITIAL_SETTINGS } from '../../lib/initialData';
import { sanitizePhoneNumber } from '../../lib/whatsapp';
import { SetupGuideModal } from '../../components/common/SetupGuideModal';
import { fetchLiveSettings, saveLiveSettings } from '../../lib/adminStore';

interface SettingsManagerProps {
  onDataUpdated?: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onDataUpdated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Contact Form Fields
  const [email, setEmail] = useState(INITIAL_SETTINGS.contact?.email || '');
  const [whatsapp, setWhatsapp] = useState(INITIAL_SETTINGS.contact?.whatsapp || '');
  const [whatsappDisplay, setWhatsappDisplay] = useState(INITIAL_SETTINGS.contact?.whatsappDisplay || '');
  const [location, setLocation] = useState(INITIAL_SETTINGS.contact?.location || '');
  const [hours, setHours] = useState(INITIAL_SETTINGS.contact?.hours || '');

  // Socials Form Fields
  const [github, setGithub] = useState(INITIAL_SETTINGS.socials?.github || '');
  const [instagram, setInstagram] = useState(INITIAL_SETTINGS.socials?.instagram || '');
  const [linkedin, setLinkedin] = useState(INITIAL_SETTINGS.socials?.linkedin || '');
  const [twitter, setTwitter] = useState(INITIAL_SETTINGS.socials?.twitter || '');

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
          if (res.data.contact) {
            setEmail(res.data.contact.email || '');
            setWhatsapp(res.data.contact.whatsapp || '');
            setWhatsappDisplay(res.data.contact.whatsappDisplay || '');
            setLocation(res.data.contact.location || '');
            setHours(res.data.contact.hours || '');
          }
          if (res.data.socials) {
            setGithub(res.data.socials.github || '');
            setInstagram(res.data.socials.instagram || '');
            setLinkedin(res.data.socials.linkedin || '');
            setTwitter(res.data.socials.twitter || '');
          }
        }
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setErrorMessage(err?.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let sanitizedWa = '';
    if (whatsapp.trim()) {
      const sanitized = sanitizePhoneNumber(whatsapp);
      if (!sanitized) {
        setErrorMessage('WhatsApp number must be a valid 10 to 15 digit international phone number.');
        return;
      }
      sanitizedWa = sanitized;
    }

    setIsSaving(true);
    try {
      const contactPayload = {
        email: email.trim(),
        whatsapp: sanitizedWa,
        whatsappDisplay: whatsappDisplay.trim(),
        location: location.trim(),
        hours: hours.trim(),
      };

      const socialsPayload = {
        github: github.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        twitter: twitter.trim(),
      };

      await saveLiveSettings({
        contact: contactPayload,
        socials: socialsPayload,
      });

      showToast('Agency settings updated successfully.', 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      showToast(`Failed to update agency settings: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl text-[#3A0F34]">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A0F34] tracking-tight">
          Agency & Contact Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5260] mt-1 font-medium">
          Configure public WhatsApp link targets, contact email, working hours, and social profiles.
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

      {/* Supabase Security & Architecture Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#EAAA00]" />
            <h2 className="text-sm font-bold text-[#3A0F34]">Database & Security Architecture</h2>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {isSupabaseConfigured ? 'Connected' : 'Setup Required'}
          </span>
        </div>

        <p className="text-xs text-[#5C5260] leading-relaxed">
          Edenexa connects to Supabase PostgreSQL with strict Row Level Security (RLS). Service-role keys are strictly forbidden in client-side code and are never stored in settings.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#F4F6F8] hover:bg-[#FFF8E6] text-xs text-[#3A0F34] font-bold border border-[#DDE3E8] hover:border-[#EAAA00] transition cursor-pointer"
          >
            View SQL Schema & Setup Guide
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-[#5C5260] text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Contact Information */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-4 text-xs shadow-xs">
            <h2 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Public Contact & WhatsApp Configuration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">
                  WhatsApp Phone Number (Clean Digits)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 14155552671"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
                <span className="text-[10px] text-[#7A7280]">
                  Country code + digits without spaces or '+' (used in wa.me/number). Leave empty if not using WhatsApp.
                </span>
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">
                  WhatsApp Display Format
                </label>
                <input
                  type="text"
                  value={whatsappDisplay}
                  onChange={(e) => setWhatsappDisplay(e.target.value)}
                  placeholder="e.g. +1 (415) 555-2671"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
                <span className="text-[10px] text-[#7A7280]">
                  Formatted string shown on the website contact cards
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">
                  Public Inquiries Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">
                  Agency Location / Base
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, USA or Remote"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#3A0F34] font-bold mb-1">
                Working Hours Display
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. Mon – Fri, 9:00 AM – 6:00 PM EST"
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
              />
            </div>
          </div>

          {/* Social Profile Links */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3E8] space-y-4 text-xs shadow-xs">
            <h2 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#EAAA00]" />
              <span>Social Profile URLs (Optional)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">GitHub Profile / Repo</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>

              <div>
                <label className="block text-[#3A0F34] font-bold mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-[#3A0F34] font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EAAA00] hover:bg-[#D69800] text-[#3A0F34] font-extrabold text-xs shadow-md shadow-[#EAAA00]/25 transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#3A0F34]" /> : <Save className="w-4 h-4 text-[#3A0F34]" />}
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

      <SetupGuideModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
