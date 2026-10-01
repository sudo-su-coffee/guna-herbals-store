'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getAdminAuditLogs } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); const response = await getAdminAuditLogs(); if (response.success) setLogs(response.data || []); else toast.error(response.error || 'Unable to load audit logs'); setLoading(false); };
    useEffect(() => { load(); }, []);
    const filtered = useMemo(() => logs.filter(log => `${log.action} ${log.entity} ${log.entityId || ''} ${log.userEmail || ''}`.toLowerCase().includes(query.toLowerCase())), [logs, query]);
    const exportCsv = () => { const header = 'Time,Action,Entity,Entity ID,Actor,IP Address'; const rows = filtered.map(log => [log.createdAt, log.action, log.entity, log.entityId || '', log.userEmail || log.userId || 'system', log.ipAddress || ''].map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n'); const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'guna-audit-logs.csv'; link.click(); URL.revokeObjectURL(url); };
    return <div className="space-y-6 animate-fade-in"><AdminPageHeader title="Audit logs" description="Operational changes recorded by the commerce system." primaryAction={{ label: 'Refresh', onClick: load, icon: <Icon name="refresh" size={15} /> }} secondaryAction={{ label: 'Export CSV', onClick: exportCsv, icon: <Icon name="download" size={15} /> }} /><div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search action, entity, user, or ID" className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-herbal-600" /></div><div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Entity</th><th className="px-6 py-4">Actor</th><th className="px-6 py-4">Request</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading audit logs...</td></tr> : filtered.map(log => <tr key={log.id}><td className="whitespace-nowrap px-6 py-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td><td className="px-6 py-4"><span className="rounded-full bg-herbal-50 px-3 py-1 text-xs font-bold text-herbal-800">{log.action}</span></td><td className="px-6 py-4 font-mono text-xs">{log.entity}{log.entityId ? ` #${log.entityId}` : ''}</td><td className="px-6 py-4">{log.userEmail || `User #${log.userId || 'system'}`}</td><td className="px-6 py-4 text-xs text-gray-500">{log.ipAddress || '—'}{log.userAgent ? ` · ${log.userAgent.slice(0, 60)}` : ''}</td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No audit events found.</td></tr>}</tbody></table></div></div></div>;
}
