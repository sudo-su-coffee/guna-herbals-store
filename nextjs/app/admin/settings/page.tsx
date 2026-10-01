'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getAdminIntegrationHealth } from '@/lib/api';

type ProviderHealth = Record<string, { provider: string; configured: boolean }>;

const integrationLabels: Record<string, string> = {
    media: 'Media storage',
    support: 'Customer support',
    analytics: 'Product analytics',
    notifications: 'Transactional email',
    payments: 'Payments',
    authentication: 'Authentication',
};

export default function SettingsPage() {
    const [health, setHealth] = useState<ProviderHealth>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHealth = async () => {
        setLoading(true);
        setError(null);
        const response = await getAdminIntegrationHealth();
        if (response.success && response.data) setHealth(response.data);
        else setError(response.error || 'Unable to load runtime configuration');
        setLoading(false);
    };

    // The first render must fetch server-side configuration; this is an intentional data-loading effect.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadHealth();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-12 w-full max-w-5xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Store Settings</h1>
                    <p className="text-gray-500">Operational configuration for the production storefront.</p>
                </div>
                <button onClick={() => void loadHealth()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
                    <Icon name="refresh" size={16} />
                    {loading ? 'Checking…' : 'Refresh status'}
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Storefront" description="Public store identity is intentionally code- and environment-driven, not browser-persisted mock state.">
                    <InfoRow label="Store name" value="Guna Herbals" />
                    <InfoRow label="Store location" value="Tenkasi, Tamil Nadu" />
                    <InfoRow label="Catalog and content" value="Managed through the admin catalog and journal routes" />
                </Section>

                <Section title="Payments" description="Secrets stay server-side. Payment credentials are supplied through deployment environment variables.">
                    <InfoRow label="Online payments" value={health.payments?.configured ? `Ready (${health.payments.provider})` : 'Credential required'} tone={health.payments?.configured ? 'success' : 'warning'} />
                    <InfoRow label="Cash on delivery" value="Available for checkout and manual admin orders" />
                    <Link href="/admin/integrations" className="inline-flex items-center gap-2 text-sm font-bold text-herbal-800 hover:text-herbal-950">Open integration health <Icon name="arrow-right" size={15} /></Link>
                </Section>

                <Section title="Shipping and fulfillment" description="Shipping is deliberately provider-neutral and managed through the manual courier workflow.">
                    <InfoRow label="Courier mode" value="Manual shipper assignment" />
                    <InfoRow label="Order flow" value="Processing → Shipped → Delivered" />
                    <Link href="/admin/delivery" className="inline-flex items-center gap-2 text-sm font-bold text-herbal-800 hover:text-herbal-950">Open delivery operations <Icon name="arrow-right" size={15} /></Link>
                </Section>

                <Section title="Provider status" description="Only configuration presence is shown here; secret values are never returned to the browser.">
                    <div className="space-y-3">
                        {Object.entries(integrationLabels).map(([key, label]) => {
                            const item = health[key];
                            return <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                <div><p className="text-sm font-bold text-gray-800">{label}</p><p className="text-xs text-gray-500">{item?.provider || 'Environment configuration'}</p></div>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item?.configured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item?.configured ? 'Ready' : 'Needs setup'}</span>
                            </div>;
                        })}
                    </div>
                </Section>

                <Section title="Data and migration" description="Database backups and provider migration are operational tasks, not client-side downloads from a mock store.">
                    <InfoRow label="Primary database" value="Neon PostgreSQL via Drizzle" />
                    <InfoRow label="Future headless target" value="Medusa, with staging SQL foundation documented" />
                    <Link href="/admin/logs" className="inline-flex items-center gap-2 text-sm font-bold text-herbal-800 hover:text-herbal-950">Review audit logs <Icon name="arrow-right" size={15} /></Link>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 border-b border-gray-100 pb-4"><h2 className="font-serif text-xl font-bold text-gray-800">{title}</h2><p className="mt-1 text-sm text-gray-500">{description}</p></div><div className="space-y-4">{children}</div></section>;
}

function InfoRow({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
    const toneClass = tone === 'success' ? 'text-green-700' : tone === 'warning' ? 'text-amber-700' : 'text-gray-800';
    return <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><span className="text-sm text-gray-500">{label}</span><span className={`max-w-[65%] text-right text-sm font-bold ${toneClass}`}>{value}</span></div>;
}
