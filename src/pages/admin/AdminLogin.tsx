import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Loader2,
  Database,
  ArrowLeft,
  Info,
  AlertCircle
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToWebsite }) => {
  const { signIn, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMessage(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-4 sm:p-6 relative text-[#3A0F34]">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#EAAA00]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Back to website button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DDE3E8] text-xs font-bold text-[#3A0F34] hover:border-[#EAAA00] shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#EAAA00]" />
          <span>Back to Edenexa</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#3A0F34] tracking-tight">
            Agency Management Portal
          </h1>
          <p className="text-xs text-[#5C5260] mt-1 font-medium">
            Restricted to authorized Edenexa administrators only
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white border border-[#DDE3E8] p-8 shadow-xl space-y-6">
          {/* Supabase connection alert */}
          {!isSupabaseConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <Database className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-amber-900">Database Connection Required</span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Supabase credentials are not yet configured in <code>.env</code>.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(errorMessage || authError) && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed">{errorMessage || authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edenexa.in"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-sm text-[#3A0F34] placeholder-[#7A7280]/50 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3A0F34] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7A7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#DDE3E8] text-sm text-[#3A0F34] placeholder-[#7A7280]/50 focus:outline-none focus:ring-2 focus:ring-[#EAAA00]/40 focus:border-[#EAAA00] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-[#3A0F34] bg-[#EAAA00] hover:bg-[#D69800] transition-all duration-200 shadow-md shadow-[#EAAA00]/25 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#3A0F34]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#3A0F34]" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* First Admin Instructions Callout */}
          <div className="pt-4 border-t border-[#DDE3E8] text-xs text-[#5C5260] space-y-2">
            <div className="flex items-center gap-1.5 text-[#3A0F34] font-bold">
              <Info className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>First-Time Admin Setup</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#5C5260]">
              Admin roles are strictly governed by the <code className="text-[#3A0F34] font-bold bg-[#F4F6F8] px-1 py-0.5 rounded border border-[#DDE3E8]">user_roles</code> table. To create an admin account, create the user in Supabase Auth, copy their UUID, and run:
            </p>
            <pre className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#DDE3E8] text-[10px] text-[#3A0F34] font-mono overflow-x-auto whitespace-pre">
              {`INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
