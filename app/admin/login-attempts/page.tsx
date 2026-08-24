'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getAdminAuditLogs } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

export default function LoginAttemptsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); const response = await getAdminAuditLogs(); if (response.success) setEvents((response.data || []).filter((event: any) => /login|auth|session|password|security/i.test(`${event.action} ${event.entity}`))); else toast.error(response.error || 'Unable to load security events'); setLoading(false); };
    useEffect(() => { load(); }, []);
    const filtered = useMemo(() => events.filter(event => `${event.action} ${event.entity} ${event.userEmail || ''} ${event.ipAddress || ''}`.toLowerCase().includes(query.toLowerCase())), [events, query]);
    return <div className="space-y-6 animate-fade-in"><AdminPageHeader title="Security events" description="Authentication and session events recorded by the commerce system." primaryAction={{ label: 'Refresh', onClick: load, icon: <Icon name="refresh" size={15} /> }} /><div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search action, email, or IP address" className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-herbal-600" /></div><div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Event</th><th className="px-6 py-4">Actor</th><th className="px-6 py-4">IP / user agent</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading security events...</td></tr> : filtered.map(event => <tr key={event.id}><td className="whitespace-nowrap px-6 py-4 text-gray-500">{new Date(event.createdAt).toLocaleString()}</td><td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{event.action}</span><p className="mt-2 font-mono text-xs text-gray-500">{event.entity}{event.entityId ? ` #${event.entityId}` : ''}</p></td><td className="px-6 py-4">{event.userEmail || `User #${event.userId || 'system'}`}</td><td className="px-6 py-4 text-xs text-gray-500">{event.ipAddress || '—'}{event.userAgent ? ` · ${event.userAgent.slice(0, 70)}` : ''}</td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No security events found.</td></tr>}</tbody></table></div></div></div>;
}
