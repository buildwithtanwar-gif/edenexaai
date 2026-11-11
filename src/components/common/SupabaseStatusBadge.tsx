import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SetupGuideModal } from './SetupGuideModal';

export const SupabaseStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer ${
          isSupabaseConfigured
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
        }`}
        title={
          isSupabaseConfigured
            ? 'Supabase Connected (Click to view database details)'
            : 'Supabase Not Configured (Click to view setup guide & SQL schema)'
        }
      >
        <span className="relative flex h-2 w-2">
          {isSupabaseConfigured ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          )}
        </span>
        <Database className="w-3 h-3 opacity-80" />
        {!compact && (
          <span>{isSupabaseConfigured ? 'Supabase Live' : 'Connect Supabase'}</span>
        )}
      </button>

      <SetupGuideModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
