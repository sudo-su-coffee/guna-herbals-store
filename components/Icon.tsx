'use client';

import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'dashboard' | 'package' | 'truck' | 'leaf' | 'users' | 'shield'
  | 'credit-card' | 'chart' | 'image' | 'scroll' | 'settings' | 'store'
  | 'logout' | 'bell' | 'mail' | 'refresh' | 'download' | 'arrow-left'
  | 'check' | 'search' | 'heart' | 'user' | 'plus';

const paths: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  package: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></>,
  truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
  leaf: <><path d="M20.8 3.2C12.5 3.1 5.5 6.2 4.1 12.4c-.8 3.7 2.2 7.3 6 7.3 6.2 0 9.7-7.1 10.7-16.5Z"/><path d="M3 21c4-5 8-8 14-11"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  'credit-card': <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 3 2 5-7"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  scroll: <><path d="M8 3h11v18H8a3 3 0 0 1 0-6h11"/><path d="M8 3a3 3 0 0 0 0 6h11M12 12h4M12 16h4"/></>,
  settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 17l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 11H1.5a2 2 0 1 1 0-4h.2a2 2 0 0 0 1.4-3.4L3 3.5A2 2 0 1 1 5.8.7l.1.1A2 2 0 0 0 9.3 0v-.2a2 2 0 1 1 4 0V0a2 2 0 0 0 3.4.8l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 21 7h.2a2 2 0 1 1 0 4H21a2 2 0 0 0-1.6 4Z"/></>,
  store: <><path d="M3 10h18M5 10v10h14V10M3 10l2-6h14l2 6"/><path d="M8 20v-5h8v5"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.7-4L3 10M3 4v6h6M4 13a8 8 0 0 0 14.7 4L21 14m0 6v-6h-6"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></>,
  'arrow-left': <><path d="m15 18-6-6 6-6M9 12h12"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  heart: <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>
};

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
