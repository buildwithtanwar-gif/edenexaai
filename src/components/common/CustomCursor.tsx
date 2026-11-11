import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  const targetRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices and when reduced-motion is not requested
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Check for hover state and custom cursor labels
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest('button, a, input, select, textarea, [data-cursor], [role="button"]');
        if (interactiveEl) {
          setIsHovered(true);
          const label = interactiveEl.getAttribute('data-cursor');
          setCursorLabel(label);
        } else {
          setIsHovered(false);
          setCursorLabel(null);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth follower easing animation loop
    let currentX = -100;
    let currentY = -100;

    const render = () => {
      currentX += (targetRef.current.x - currentX) * 0.18;
      currentY += (targetRef.current.y - currentY) * 0.18;
      setFollowerPos({ x: currentX, y: currentY });
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* Central High-Precision Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#EAAA00] shadow-[0_0_10px_rgba(234,170,0,0.85)] transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) scale(${isClicking ? 0.6 : 1})`,
        }}
      />

      {/* Lagging Soft Orbit Follower */}
      <div
        className={`fixed top-0 left-0 -ml-5 -mt-5 rounded-full border transition-[width,height,border-color,background-color] duration-200 flex items-center justify-center ${
          isHovered
            ? 'w-16 h-16 -ml-8 -mt-8 border-[#EAAA00] bg-[#EAAA00]/15 backdrop-blur-[1px] shadow-[0_0_20px_rgba(234,170,0,0.25)]'
            : 'w-10 h-10 border-[#3A0F34]/25 bg-transparent'
        }`}
        style={{
          transform: `translate3d(${followerPos.x}px, ${followerPos.y}px, 0) scale(${isClicking ? 0.85 : 1})`,
        }}
      >
        {cursorLabel && (
          <span className="text-[9px] font-mono tracking-widest text-[#3A0F34] uppercase font-bold animate-fadeIn">
            {cursorLabel}
          </span>
        )}
      </div>
    </div>
  );
};
