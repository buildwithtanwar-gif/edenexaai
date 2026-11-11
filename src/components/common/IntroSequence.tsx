import React, { useState, useEffect } from 'react';

interface IntroSequenceProps {
  onComplete?: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'loading' | 'exiting' | 'hidden'>(() => {
    if (typeof window === 'undefined') return 'hidden';
    try {
      const alreadyShown = localStorage.getItem('edenexa_intro_shown') === 'true';
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 768;
      if (alreadyShown || prefersReducedMotion || isMobile) {
        return 'hidden';
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return 'loading';
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === 'hidden') {
      onComplete?.();
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1600; // ~1.6 seconds for swift intro
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const linearRatio = Math.min(elapsed / duration, 1);

      const easedRatio =
        linearRatio < 0.5
          ? 2 * linearRatio * linearRatio
          : 1 - Math.pow(-2 * linearRatio + 2, 2) / 2;

      const currentPercent = Math.min(Math.floor(easedRatio * 100), 100);
      setProgress(currentPercent);

      if (linearRatio < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setProgress(100);
        setTimeout(() => {
          setStage('exiting');
          try {
            localStorage.setItem('edenexa_intro_shown', 'true');
          } catch {
            // Ignore storage write failure
          }
          setTimeout(() => {
            setStage('hidden');
            onComplete?.();
          }, 450);
        }, 150);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  if (stage === 'hidden') return null;

  const getStatusText = (pct: number) => {
    if (pct < 30) return 'INITIALIZING WORKSPACE...';
    if (pct < 70) return 'LOADING INTERFACE...';
    if (pct < 95) return 'PREPARING EXPERIENCE...';
    return 'EDENEXA STUDIO READY';
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-500 ease-out ${
        stage === 'exiting' ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Edenexa Loading Screen"
      role="status"
    >
      {/* Ambient background glows: Deep Plum (#3A0F34) + Golden Yellow (#EAAA00) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(244,246,248,0.98)_65%,rgba(221,227,232,0.5)_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EAAA00]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Central Animated Core */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Monogram Box */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#3A0F34] via-[#EAAA00] to-[#D69800] p-[2px] shadow-lg shadow-[#3A0F34]/15">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
              <span className="text-3xl font-black text-[#3A0F34] font-mono tracking-tight">
                E
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.35em] text-[#3A0F34] uppercase mb-2 font-mono">
          EDENEXA
        </h1>

        <p className="text-[11px] sm:text-xs font-mono tracking-[0.2em] text-[#7A7280] uppercase mb-7">
          BUILD SMARTER · GROW FASTER
        </p>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="relative h-1.5 w-full bg-[#DDE3E8] rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3A0F34] via-[#EAAA00] to-[#F5B81A] transition-all duration-75 ease-out relative"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-[#7A7280] font-semibold tracking-wide">
              {getStatusText(progress)}
            </span>
            <span className="text-[#3A0F34] font-bold tracking-wider font-mono text-xs">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
