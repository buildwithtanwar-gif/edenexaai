import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '../../lib/whatsapp';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  displayNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '',
  displayNumber = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  if (!phoneNumber || !phoneNumber.trim()) {
    return null;
  }

  const url = buildWhatsAppUrl(phoneNumber, DEFAULT_WHATSAPP_MESSAGE);

  if (!url) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 p-3 rounded-2xl bg-white border border-[#DDE3E8] text-xs text-[#3A0F34] shadow-xl backdrop-blur-md animate-fadeIn">
          <div>
            <div className="font-bold text-[#3A0F34]">Chat with Edenexa</div>
            <div className="text-[11px] text-[#5C5260]">Questions? Message us directly</div>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="p-1 text-[#7A7280] hover:text-[#3A0F34] rounded-lg transition cursor-pointer"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with Edenexa on WhatsApp${displayNumber ? ` at ${displayNumber}` : ''}`}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-60 pointer-events-none" />
        <MessageSquare className="w-7 h-7 fill-white stroke-emerald-700 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
};
