import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number; // Delay in milliseconds
  direction?: 'up' | 'none';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user prefers reduced motion, show immediately without waiting
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              const timer = setTimeout(() => {
                setIsVisible(true);
              }, delay);
              return () => clearTimeout(timer);
            } else {
              setIsVisible(true);
            }
            // Once visible, stop observing to keep element visible
            if (elementRef.current) {
              observer.unobserve(elementRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Triggers slightly before element enters deep into viewport
      }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [delay, threshold]);

  const transformStyle =
    direction === 'up'
      ? isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
      : isVisible
      ? 'opacity-100'
      : 'opacity-0';

  return (
    <div
      ref={elementRef}
      id={id}
      className={`transition-all duration-700 ease-out transform-gpu will-change-[opacity,transform] ${transformStyle} ${className}`}
    >
      {children}
    </div>
  );
};
