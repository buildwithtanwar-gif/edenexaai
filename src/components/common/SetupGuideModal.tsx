import React, { useState } from 'react';
import { X, Copy, Check, Database, Shield, Key, Terminal, ExternalLink, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'env' | 'schema' | 'admin'>('env');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedAdminSql, setCopiedAdminSql] = useState(false);
  const [copiedSchemaNote, setCopiedSchemaNote] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `# Copy into your .env file
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
`;

  const adminSqlSnippet = `-- Step 1: Create a user in Supabase Auth -> Users (e.g. admin@edenexa.in)
-- Step 2: Copy their User UID (UUID)
-- Step 3: Run this in Supabase SQL Editor:

INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_UUID_HERE', 'admin')
ON CONFLICT (user_id) DO NOTHING;
`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-[#DDE3E8] shadow-2xl overflow-hidden text-[#3A0F34]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DDE3E8] bg-[#F4F6F8]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#EAAA00]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3A0F34] flex items-center gap-2">
                Supabase Backend Setup Guide
                {isSupabaseConfigured ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold">
                    Connected
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                    Action Required
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#5C5260]">
                Full-stack PostgreSQL, Auth, and Row Level Security setup (Free Tier)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7280] hover:text-[#3A0F34] hover:bg-[#DDE3E8] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DDE3E8] bg-[#F8FAFC] px-4 pt-2">
          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'env'
                ? 'border-[#EAAA00] text-[#3A0F34]'
                : 'border-transparent text-[#7A7280] hover:text-[#3A0F34]'
            }`}
          >
            <Key className="w-4 h-4 text-[#EAAA00]" /> 1. Environment Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'schema'
                ? 'border-[#EAAA00] text-[#3A0F34]'
                : 'border-transparent text-[#7A7280] hover:text-[#3A0F34]'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#EAAA00]" /> 2. Live Database Schema
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#EAAA00] text-[#3A0F34]'
                : 'border-transparent text-[#7A7280] hover:text-[#3A0F34]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#EAAA00]" /> 3. First Admin Role
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] text-xs leading-relaxed text-[#5C5260]">
                <span className="font-bold text-[#3A0F34]">How to connect Supabase:</span>
                <ol className="list-decimal ml-4 mt-2 space-y-1.5 text-[#5C5260]">
                  <li>
                    Go to{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#EAAA00] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and create a free project.
                  </li>
                  <li>In your Supabase project dashboard, open <strong>Project Settings</strong> &rarr; <strong>API</strong>.</li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon (public) key</strong>.</li>
                  <li>Paste them into your root <code>.env</code> file.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between text-xs text-[#7A7280] mb-1 px-1">
                  <span>File: .env</span>
                  <button
                    onClick={() => copyToClipboard(envSnippet, setCopiedEnv)}
                    className="flex items-center gap-1 text-[#3A0F34] font-bold hover:text-[#EAAA00] cursor-pointer"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedEnv ? 'Copied!' : 'Copy snippet'}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-xs text-[#3A0F34] font-mono overflow-x-auto">
                  {envSnippet}
                </pre>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Security Note:</strong> Never paste your <code>service_role</code> key into the frontend. The application uses Row Level Security (RLS) with the public <code>anon</code> key.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <p className="text-[#5C5260] text-xs leading-relaxed">
                The live database schema documentation is located at <code className="text-[#3A0F34] font-bold bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DDE3E8]">supabase/LIVE_SCHEMA.md</code>. It serves as the single source of truth for all live database tables: <code className="text-[#3A0F34] font-semibold">inquiries</code>, <code className="text-[#3A0F34] font-semibold">services</code>, <code className="text-[#3A0F34] font-semibold">pricing_packages</code>, <code className="text-[#3A0F34] font-semibold">projects</code>, <code className="text-[#3A0F34] font-semibold">coupons</code>, <code className="text-[#3A0F34] font-semibold">faqs</code>, and <code className="text-[#3A0F34] font-semibold">site_settings</code>.
              </p>

              <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#DDE3E8] space-y-3">
                <h4 className="font-bold text-[#3A0F34] text-xs">Database Architecture Overview:</h4>
                <ul className="list-disc ml-4 space-y-1.5 text-xs text-[#5C5260]">
                  <li><strong>inquiries:</strong> Stores client project inquiries with status check (new, contacted, in_progress, completed, rejected).</li>
                  <li><strong>coupons:</strong> Stores promo codes validated live with minimum budget and expiry checks.</li>
                  <li><strong>pricing_packages:</strong> Standard packages with numeric rates or custom scope quotes.</li>
                  <li><strong>projects & services:</strong> Portfolio case studies and offerings with visibility toggles.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8]">
                <span className="text-xs text-[#3A0F34] font-mono">supabase/LIVE_SCHEMA.md</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                  Live Database Connected
                </span>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <p className="text-[#5C5260] text-xs leading-relaxed">
                For security, public signups cannot make themselves admins. Admin access is strictly governed by records in the <code className="text-[#3A0F34] font-bold bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DDE3E8]">user_roles</code> table where <code className="text-[#3A0F34] font-bold bg-[#F4F6F8] px-1.5 py-0.5 rounded border border-[#DDE3E8]">role = 'admin'</code>.
              </p>

              <div className="relative">
                <div className="flex items-center justify-between text-xs text-[#7A7280] mb-1 px-1">
                  <span>SQL Query to Grant Admin</span>
                  <button
                    onClick={() => copyToClipboard(adminSqlSnippet, setCopiedAdminSql)}
                    className="flex items-center gap-1 text-[#3A0F34] font-bold hover:text-[#EAAA00] cursor-pointer"
                  >
                    {copiedAdminSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAdminSql ? 'Copied!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-xs text-[#3A0F34] font-mono overflow-x-auto whitespace-pre">
                  {adminSqlSnippet}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8E6] border border-[#EAAA00]/40 text-[#3A0F34] text-xs">
                After running the SQL, navigate to <code className="underline font-bold">/admin/login</code> and sign in with the email and password you created in Supabase Auth.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#DDE3E8] bg-[#F4F6F8] text-xs">
          <span className="text-[#7A7280]">
            Edenexa is production-ready for free-tier Supabase
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3A0F34] hover:bg-[#250A21] text-white font-bold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
