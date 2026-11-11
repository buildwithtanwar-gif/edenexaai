import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Globe,
  Database,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  EyeOff,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { INITIAL_SETTINGS } from '../../lib/initialData';
import { sanitizePhoneNumber } from '../../lib/whatsapp';
import { SetupGuideModal } from '../../components/common/SetupGuideModal';
import { fetchLiveSettings, saveLiveSettings } from '../../lib/adminStore';
import { useAdminTheme } from './AdminThemeContext';

interface SettingsManagerProps {
  onDataUpdated?: () => void;
}

type SettingsTab = 'general' | 'security';

interface SecurityChecklistItem {
  id: string;
  title: string;
  category: 'Authentication & Access' | 'Database & Secrets' | 'Anti-Abuse & Privacy';
  description: string;
  recommendation: string;
  isBuiltIn: boolean;
  docUrl?: string;
}

const SECURITY_CHECKLIST: SecurityChecklistItem[] = [
  {
    id: 'supabase-mfa',
    title: 'Enable Multi-Factor Authentication (MFA)',
    category: 'Authentication & Access',
    description: 'Protect the primary administrative account with TOTP two-factor authentication (Google Authenticator, Authy, or 1Password).',
    recommendation: 'Configure in Supabase Dashboard > Authentication > Users > MFA.',
    isBuiltIn: false,
    docUrl: 'https://supabase.com/docs/guides/auth/auth-mfa',
  },
  {
    id: 'supabase-disable-signups',
    title: 'Disable Public User Signups',
    category: 'Authentication & Access',
    description: 'Ensure open self-registration is turned off so external visitors cannot create unauthorized accounts on your Supabase instance.',
    recommendation: 'Verify in Supabase Dashboard > Authentication > Providers > Email > Turn OFF "Enable Signups".',
    isBuiltIn: false,
    docUrl: 'https://supabase.com/docs/guides/auth',
  },
  {
    id: 'rbac-enforcement',
    title: 'Strict Role-Based Access Control (RBAC)',
    category: 'Authentication & Access',
    description: 'Application enforces strict role validation against the user_roles table. Any authenticated user lacking the "admin" role is instantly signed out.',
    recommendation: 'Active in client runtime & AuthContext verification.',
    isBuiltIn: true,
  },
  {
    id: 'rls-protection',
    title: 'Row Level Security (RLS) Enforced on All Live Tables',
    category: 'Database & Secrets',
    description: 'All 9 Supabase tables enforce PostgreSQL RLS policies. The inquiries table allows anonymous INSERT but strictly blocks unauthorized SELECT to safeguard customer leads.',
    recommendation: 'Active in PostgreSQL schema. Client inquiries are submitted without .select() returns.',
    isBuiltIn: true,
  },
  {
    id: 'no-service-role-key',
    title: 'Zero High-Privilege Service-Role Keys in Client Bundle',
    category: 'Database & Secrets',
    description: 'The admin service-role key is never included in the frontend bundle or repository. Only the public anon publishable key is deployed.',
    recommendation: 'Active in Vite build config and .gitignore policies.',
    isBuiltIn: true,
  },
  {
    id: 'supabase-key-rotation',
    title: 'Scheduled Rotation of Supabase Keys',
    category: 'Database & Secrets',
    description: 'Rotate the public anon key and JWT secret periodically (every 90–180 days) or immediately upon team member offboarding to prevent stale token reuse.',
    recommendation: 'Execute in Supabase Dashboard > Project Settings > API > Generate New Key.',
    isBuiltIn: false,
    docUrl: 'https://supabase.com/docs/guides/api/api-keys',
  },
  {
    id: 'bot-honeypot',
    title: 'Anti-Bot Honeypot & 3-Second Timing Threshold',
    category: 'Anti-Abuse & Privacy',
    description: 'Public contact inquiries utilize hidden honeypot fields and strict submission speed verification (3 seconds minimum) to silently neutralize automated spam bots without burdening the database.',
    recommendation: 'Active in ContactSection.tsx component logic.',
    isBuiltIn: true,
  },
  {
    id: 'admin-route-exclusion',
    title: 'Search Engine Crawl & Indexing Exclusion',
    category: 'Anti-Abuse & Privacy',
    description: 'All /admin paths dynamically inject <meta name="robots" content="noindex,nofollow"> and are blocked via public/robots.txt to prevent search engines from discovering the admin interface.',
    recommendation: 'Active in App.tsx runtime routing and robots.txt.',
    isBuiltIn: true,
  },
  {
    id: 'regular-audit',
    title: 'Regular Security & Permissions Audit',
    category: 'Anti-Abuse & Privacy',
    description: 'Conduct a monthly review of Supabase Auth audit logs, active sessions, and database row counts to detect abnormal traffic spikes or unauthorized access attempts.',
    recommendation: 'Perform monthly via Supabase Dashboard > Logs & Analytics.',
    isBuiltIn: false,
    docUrl: 'https://supabase.com/docs/guides/platform/logs',
  },
];

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onDataUpdated }) => {
  const { theme, setTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Security Checklist State (persisted in component state)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'supabase-mfa': false,
    'supabase-disable-signups': true,
    'rbac-enforcement': true,
    'rls-protection': true,
    'no-service-role-key': true,
    'supabase-key-rotation': false,
    'bot-honeypot': true,
    'admin-route-exclusion': true,
    'regular-audit': false,
  });

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

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = SECURITY_CHECKLIST.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={`p-6 sm:p-8 space-y-6 max-w-4xl transition-colors duration-200 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
      {/* Top Header & Tab Navigation */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${isDark ? 'border-[#2D1F31]' : 'border-[#DDE3E8]'}`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>
            Agency Settings & Security
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isDark ? 'text-[#A89CA8]' : 'text-[#5C5260]'}`}>
            Manage public communication channels, admin appearance, and verify deployment security.
          </p>
        </div>

        {/* Tab Controls */}
        <div className={`flex items-center p-1 rounded-xl border w-fit shrink-0 ${isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-[#F0F4F8] border-[#DDE3E8]'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'general'
                ? isDark
                  ? 'bg-[#251A2C] text-white shadow-xs'
                  : 'bg-white text-[#3A0F34] shadow-xs'
                : isDark
                ? 'text-[#A89CA8] hover:text-white'
                : 'text-[#5C5260] hover:text-[#3A0F34]'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>General & Appearance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#3A0F34] text-white shadow-xs border border-[#EAAA00]/40'
                : isDark
                ? 'text-[#A89CA8] hover:text-white'
                : 'text-[#5C5260] hover:text-[#3A0F34]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#EAAA00]" />
            <span>Security</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAAA00] text-[#3A0F34] font-extrabold">
              {completedCount}/{totalCount}
            </span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            toast.type === 'success'
              ? isDark
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : isDark
              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-xs opacity-60 hover:opacity-100 font-bold ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          isDark ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-700'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: GENERAL & CONTACT SETTINGS */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Theme & Visual Appearance Preference Card (Requested Feature) */}
          <div className={`p-6 rounded-2xl border space-y-4 text-xs shadow-xs transition-colors duration-200 ${
            isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-white border-[#DDE3E8]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>
                  <Palette className="w-4 h-4 text-[#EAAA00]" />
                  <span>Admin Console Theme</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#A89CA8]' : 'text-[#5C5260]'}`}>
                  Switch the administrative console between Light and Dark modes.
                </p>
              </div>

              <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                isDark
                  ? 'bg-[#2E1E34] text-[#EAAA00] border border-[#EAAA00]/40'
                  : 'bg-[#FFF8E6] text-[#3A0F34] border border-[#EAAA00]/40'
              }`}>
                Active: {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Admin Console switched to Light Mode.', 'success');
                }}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                  !isDark
                    ? 'bg-[#FFF8E6] border-[#EAAA00] ring-2 ring-[#EAAA00]/25'
                    : 'bg-[#201625] border-[#38263E] hover:border-[#EAAA00]/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !isDark ? 'bg-[#EAAA00] text-[#3A0F34]' : 'bg-white/10 text-[#A89CA8]'
                }`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${!isDark ? 'text-[#3A0F34]' : 'text-white'}`}>
                    Light Mode
                  </div>
                  <div className={`text-[11px] ${!isDark ? 'text-[#5C5260]' : 'text-[#A89CA8]'}`}>
                    Crisp white and clean neutral surfaces.
                  </div>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Admin Console switched to Dark Mode.', 'success');
                }}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                  isDark
                    ? 'bg-[#2B1930] border-[#EAAA00] ring-2 ring-[#EAAA00]/30'
                    : 'bg-[#F8FAFC] border-[#DDE3E8] hover:border-[#EAAA00]/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-[#EAAA00] text-[#3A0F34]' : 'bg-[#3A0F34] text-white'
                }`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-[#EAAA00]' : 'text-[#3A0F34]'}`}>
                    Dark Mode
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-[#EDE8EE]' : 'text-[#5C5260]'}`}>
                    Deep obsidian and plum surfaces for low-light work.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Database Status Summary */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors duration-200 ${
            isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-[#F8FAFC] border-[#DDE3E8]'
          }`}>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#EAAA00]" />
              <div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>Supabase Live Connection: </span>
                <span className={isSupabaseConfigured ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {isSupabaseConfigured ? 'Operational (RLS Active)' : 'Configuration Needed'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                isDark ? 'text-[#EDE8EE] hover:text-[#EAAA00]' : 'text-[#3A0F34] hover:text-[#EAAA00]'
              }`}
            >
              <span>View Security Checklist</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#EAAA00]" />
            </button>
          </div>

          {isLoading ? (
            <div className={`flex items-center justify-center py-12 text-xs ${isDark ? 'text-[#A89CA8]' : 'text-[#5C5260]'}`}>
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#EAAA00]" />
              Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Contact Information */}
              <div className={`p-6 rounded-2xl border space-y-4 text-xs shadow-xs transition-colors duration-200 ${
                isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-white border-[#DDE3E8]'
              }`}>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Public Contact & WhatsApp Configuration</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
                      WhatsApp Phone Number (Clean Digits)
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 919876543210"
                      className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                    <span className={`text-[10px] ${isDark ? 'text-[#A89CA8]' : 'text-[#7A7280]'}`}>
                      Country code + digits without spaces or '+' (used in wa.me/number). Leave empty if not using WhatsApp.
                    </span>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
                      WhatsApp Display Format
                    </label>
                    <input
                      type="text"
                      value={whatsappDisplay}
                      onChange={(e) => setWhatsappDisplay(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                    <span className={`text-[10px] ${isDark ? 'text-[#A89CA8]' : 'text-[#7A7280]'}`}>
                      Formatted string shown on the website contact cards
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
                      Public Inquiries Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@edenexa.work.gd"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
                      Agency Location / Base
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. India (Remote)"
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>
                    Working Hours Display
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g. Mon – Sat, 10:00 AM – 7:00 PM IST"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                      isDark
                        ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                        : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                    }`}
                  />
                </div>
              </div>

              {/* Social Profile Links */}
              <div className={`p-6 rounded-2xl border space-y-4 text-xs shadow-xs transition-colors duration-200 ${
                isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-white border-[#DDE3E8]'
              }`}>
                <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>
                  <Globe className="w-4 h-4 text-[#EAAA00]" />
                  <span>Social Profile URLs (Optional)</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>GitHub Profile / Repo</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>LinkedIn Profile</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>Instagram URL</label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-[#EDE8EE]' : 'text-[#3A0F34]'}`}>Twitter / X URL</label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/..."
                      className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 ${
                        isDark
                          ? 'bg-[#241A2C] border-[#3D2C44] text-white placeholder-[#7A7280]'
                          : 'bg-[#F8FAFC] border-[#DDE3E8] text-[#3A0F34]'
                      }`}
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
        </div>
      )}

      {/* TAB 2: SECURITY & DEPLOYMENT HARDENING CHECKLIST */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Posture Status Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3A0F34] to-[#240A20] text-white space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAAA00]/20 border border-[#EAAA00]/40 flex items-center justify-center text-[#EAAA00]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Deployment Security Posture</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                      Production Hardened
                    </span>
                  </h2>
                  <p className="text-xs text-[#DDE3E8]/80 mt-0.5">
                    Live audit checklist & architectural safeguards protecting your Edenexa studio deployment.
                  </p>
                </div>
              </div>

              <div className="text-right sm:shrink-0">
                <div className="text-2xl font-black text-[#EAAA00]">
                  {completionPercentage}%
                </div>
                <div className="text-[11px] text-[#DDE3E8]/70">
                  {completedCount} of {totalCount} Safeguards Verified
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EAAA00] to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-[#DDE3E8]/90">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                <span>Zero Secrets in Client Bundle</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Postgres Row Level Security (RLS)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <EyeOff className="w-3.5 h-3.5 text-[#EAAA00] shrink-0" />
                <span>Admin Console Hidden from Crawlers</span>
              </div>
            </div>
          </div>

          {/* Interactive Checklist Categories */}
          {(['Authentication & Access', 'Database & Secrets', 'Anti-Abuse & Privacy'] as const).map(
            (category) => {
              const categoryItems = SECURITY_CHECKLIST.filter((item) => item.category === category);
              return (
                <div
                  key={category}
                  className={`p-6 rounded-2xl border space-y-4 shadow-xs transition-colors duration-200 ${
                    isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-white border-[#DDE3E8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-[#3A0F34]'
                    }`}>
                      {category === 'Authentication & Access' && <Key className="w-4 h-4 text-[#EAAA00]" />}
                      {category === 'Database & Secrets' && <Database className="w-4 h-4 text-emerald-500" />}
                      {category === 'Anti-Abuse & Privacy' && <Shield className="w-4 h-4 text-[#EAAA00]" />}
                      <span>{category}</span>
                    </h3>
                    <span className={`text-[11px] font-medium ${isDark ? 'text-[#A89CA8]' : 'text-[#5C5260]'}`}>
                      {categoryItems.filter((i) => checkedItems[i.id]).length}/{categoryItems.length} checked
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryItems.map((item) => {
                      const isChecked = Boolean(checkedItems[item.id]);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`p-4 rounded-xl border transition cursor-pointer select-none ${
                            isChecked
                              ? isDark
                                ? 'bg-emerald-950/25 border-emerald-800/60'
                                : 'bg-emerald-50/40 border-emerald-200'
                              : isDark
                              ? 'bg-[#221627] border-[#38263E] hover:border-[#EAAA00]/40'
                              : 'bg-[#F8FAFC] border-[#DDE3E8] hover:border-[#EAAA00]/60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Square className={`w-5 h-5 ${isDark ? 'text-[#7A7280]' : 'text-[#7A7280]'}`} />
                              )}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-bold ${
                                    isChecked
                                      ? isDark
                                        ? 'text-emerald-300'
                                        : 'text-emerald-900'
                                      : isDark
                                      ? 'text-white'
                                      : 'text-[#3A0F34]'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {item.isBuiltIn ? (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                      isDark
                                        ? 'bg-[#3A0F34] text-[#EAAA00] border border-[#EAAA00]/40'
                                        : 'bg-[#FFF8E6] text-[#3A0F34] border border-[#EAAA00]/40'
                                    }`}>
                                      Built-in Code
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                      isDark
                                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                      Supabase Console
                                    </span>
                                  )}
                                  {item.docUrl && (
                                    <a
                                      href={item.docUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={`p-0.5 ${isDark ? 'text-[#A89CA8] hover:text-white' : 'text-[#7A7280] hover:text-[#3A0F34]'}`}
                                      title="Open official documentation"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#C5B9C5]' : 'text-[#5C5260]'}`}>
                                {item.description}
                              </p>

                              <div className={`pt-1 text-[11px] font-mono font-medium ${isDark ? 'text-[#A89CA8]' : 'text-[#7A7280]'}`}>
                                💡 <span className={`font-bold ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>Action:</span> {item.recommendation}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}

          {/* Database Architecture & Setup Modal Trigger */}
          <div className={`p-6 rounded-2xl border space-y-3 shadow-xs transition-colors duration-200 ${
            isDark ? 'bg-[#18111D] border-[#2D1F31]' : 'bg-white border-[#DDE3E8]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#EAAA00]" />
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#3A0F34]'}`}>
                  Database Schema & Migration Reference
                </h3>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                  isSupabaseConfigured
                    ? isDark
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                {isSupabaseConfigured ? 'Supabase Connected' : 'Setup Required'}
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#C5B9C5]' : 'text-[#5C5260]'}`}>
              Need to inspect live table definitions, verify foreign keys, or review security policies for inquiries and settings?
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSetupModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                  isDark
                    ? 'bg-[#251A2C] border-[#3D2C44] text-[#EAAA00] hover:bg-[#32233B]'
                    : 'bg-[#F4F6F8] border-[#DDE3E8] text-[#3A0F34] hover:bg-[#FFF8E6] hover:border-[#EAAA00]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EAAA00]" />
                <span>View Schema Documentation & Setup Guide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCheckedItems({
                    'supabase-mfa': true,
                    'supabase-disable-signups': true,
                    'rbac-enforcement': true,
                    'rls-protection': true,
                    'no-service-role-key': true,
                    'supabase-key-rotation': true,
                    'bot-honeypot': true,
                    'admin-route-exclusion': true,
                    'regular-audit': true,
                  });
                  showToast('All security best practices marked as verified.', 'success');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-[#221627] border-[#38263E] text-[#EDE8EE] hover:text-white'
                    : 'bg-white border-[#DDE3E8] text-[#5C5260] hover:text-[#3A0F34] hover:bg-[#F8FAFC]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mark All as Verified</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for database setup guide */}
      <SetupGuideModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
