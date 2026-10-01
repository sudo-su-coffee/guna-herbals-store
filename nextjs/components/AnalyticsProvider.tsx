'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      autocapture: false,
      respect_dnt: true,
    });

    const capturePageview = () => posthog.capture('$pageview', { path: window.location.pathname });
    capturePageview();
    window.addEventListener('popstate', capturePageview);
    return () => window.removeEventListener('popstate', capturePageview);
  }, []);

  return children;
}
