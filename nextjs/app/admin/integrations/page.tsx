'use client';

import React, { useEffect, useState } from 'react';
import { getAdminIntegrationHealth } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

const labels: Record<string, string> = { media: 'Product media', support: 'Customer support', analytics: 'Analytics', notifications: 'Transactional email', payments: 'Payments', auth: 'Authentication' };

export default function IntegrationsPage() {
    const [health, setHealth] = useState<Record<string, { provider: string; configured: boolean }>>({}); const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); const response = await getAdminIntegrationHealth(); if (response.success && response.data) setHealth(response.data); else toast.error(response.error || 'Unable to load integration status'); setLoading(false); };
    // Initial server-health fetch is intentional; status is not available during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, []);
    return <div className="space-y-8 animate-fade-in"><AdminPageHeader title="Integrations" description="Provider health and activation status. Secrets stay in deployment environment variables." primaryAction={{ label: 'Refresh', onClick: load, icon: <Icon name="refresh" size={15} /> }} /><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{Object.entries(labels).map(([key, label]) => { const item = health[key]; return <div key={key} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-herbal-50 text-herbal-800"><Icon name={key === 'media' ? 'image' : key === 'support' ? 'users' : key === 'analytics' ? 'chart' : key === 'notifications' ? 'mail' : key === 'payments' ? 'credit-card' : 'shield'} size={19} /></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item?.configured ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{loading ? 'Checking' : item?.configured ? 'Configured' : 'Not configured'}</span></div><h2 className="font-serif text-lg font-bold text-gray-900">{label}</h2><p className="mt-1 text-sm text-gray-500">{item?.provider || '—'}</p><p className="mt-4 text-xs leading-relaxed text-gray-400">Configure this provider through the deployment environment. The admin UI never stores or displays provider secrets.</p></div>; })}</div><div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 text-sm text-blue-900"><p className="font-bold">Activation policy</p><p className="mt-2 leading-relaxed">Razorpay webhooks, SendGrid sender verification, Google OAuth callbacks, Cloudinary signing, Chatwoot widget configuration, PostHog project keys, and production domains must be completed in the deployment provider after local verification.</p></div></div>;
}
