import { useEffect } from 'react';

/**
 * Cookie-free lightweight analytics placeholder hook.
 * Does not track or set cookies until a measurement ID is explicitly configured.
 */
export function useAnalytics(measurementId?: string) {
  useEffect(() => {
    if (!measurementId || measurementId.trim() === '' || measurementId === '[YOUR_ANALYTICS_ID]') {
      // Analytics dormant: zero tracking or cookies initialized
      return;
    }

    // When an analytics ID is provided (e.g. Plausible, Cloudflare Web Analytics, or Minimal GA4):
    try {
      // Safe, cookie-free page view tracking hook
      if (typeof window !== 'undefined') {
        // Reserved for privacy-respecting client analytics integration
      }
    } catch (err) {
      console.warn('Analytics event skipped:', err);
    }
  }, [measurementId]);
}
