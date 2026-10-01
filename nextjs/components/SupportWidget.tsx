'use client';

import { useEffect } from 'react';

export function SupportWidget() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPPORT_BASE_URL?.replace(/\/$/, '');
    const websiteToken = process.env.NEXT_PUBLIC_SUPPORT_WEBSITE_TOKEN;
    if (!baseUrl || !websiteToken || document.querySelector('script[data-chatwoot]')) return;

    const script = document.createElement('script');
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.async = true;
    script.dataset.chatwoot = 'true';
    script.onload = () => {
      const chatwoot = (window as typeof window & { chatwootSDK?: { run: (config: { websiteToken: string; baseUrl: string }) => void } }).chatwootSDK;
      chatwoot?.run({ websiteToken, baseUrl });
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
