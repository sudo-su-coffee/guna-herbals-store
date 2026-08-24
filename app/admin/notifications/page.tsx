'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminNotifications, markEnquiryRead } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { toast } from 'sonner';

interface AdminNotification {
    id: string;
    type: 'order' | 'enquiry';
    title: string;
    body: string;
    status: string;
    createdAt: string;
    href: string;
}

export default function NotificationsPage() {
    const [items, setItems] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const response = await getAdminNotifications();
        setItems(response.success && response.data ? response.data : []);
        setLoading(false);
    };

    useEffect(() => { void load(); }, []);

    const markRead = async (item: AdminNotification) => {
        if (item.type === 'enquiry') {
            const response = await markEnquiryRead(Number(item.id.replace('enquiry-', '')));
            if (response.success) {
                toast.success('Enquiry marked as read');
                await load();
            } else toast.error(response.error || 'Unable to update enquiry');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <AdminPageHeader title="Notifications" description="Operational alerts from orders and customer enquiries." primaryAction={{ label: 'Refresh', onClick: load, icon: <span>↻</span> }} />
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-earth-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Open alerts</p><p className="mt-2 text-3xl font-serif text-herbal-900">{items.length}</p></div>
                <div className="rounded-2xl border border-earth-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Order alerts</p><p className="mt-2 text-3xl font-serif text-herbal-900">{items.filter(i => i.type === 'order').length}</p></div>
                <div className="rounded-2xl border border-earth-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer enquiries</p><p className="mt-2 text-3xl font-serif text-herbal-900">{items.filter(i => i.type === 'enquiry').length}</p></div>
            </div>
            <div className="rounded-2xl border border-earth-200 bg-white shadow-sm overflow-hidden">
                {loading ? <div className="p-10 text-center text-gray-500">Loading notifications...</div> : items.length === 0 ? <div className="p-10 text-center text-gray-500">You are all caught up.</div> : <div className="divide-y divide-earth-100">{items.map(item => <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-herbal-50/40"><div className="flex gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.type === 'order' ? 'bg-gold-100' : 'bg-herbal-100'}`}>{item.type === 'order' ? '📦' : '✉️'}</div><div><p className="font-bold text-herbal-950">{item.title}</p><p className="mt-1 text-sm text-gray-600">{item.body}</p><p className="mt-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('en-IN')}</p></div></div><div className="flex items-center gap-3"><button onClick={() => void markRead(item)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-herbal-300 hover:text-herbal-800">Mark read</button><Link href={item.href} className="rounded-lg bg-herbal-800 px-3 py-2 text-xs font-bold text-white hover:bg-herbal-900">Open</Link></div></div>)}</div>}
            </div>
        </div>
    );
}

