'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminPayments } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

type Payment = { id: number; orderId: number; paymentMethod: string; paymentGateway: string | null; gatewayOrderId: string | null; gatewayPaymentId: string | null; amount: string; currency: string | null; status: 'pending' | 'paid' | 'failed' | 'refunded'; failureReason: string | null; createdAt: string; paidAt: string | null; order?: { orderNumber: string } };
const methods = ['All', 'razorpay', 'cod', 'card', 'upi'];
const statuses = ['All', 'pending', 'paid', 'failed', 'refunded'];

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [method, setMethod] = useState('All');
    const [status, setStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Payment | null>(null);

    const load = async () => {
        setLoading(true);
        const response = await getAdminPayments();
        if (response.success) setPayments(response.data || []);
        else toast.error(response.error || 'Unable to load payments');
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => payments.filter(payment => (method === 'All' || payment.paymentMethod === method) && (status === 'All' || payment.status === status)), [payments, method, status]);
    const exportCsv = () => {
        const header = 'Payment ID,Order ID,Gateway,Method,Amount,Currency,Status,Created At';
        const rows = filtered.map(payment => [payment.id, payment.order?.orderNumber || `ORD-${payment.orderId}`, payment.paymentGateway || '', payment.paymentMethod, payment.amount, payment.currency || 'INR', payment.status, payment.createdAt].map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
        const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'guna-payments.csv'; link.click(); URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading payment ledger...</div>;
    if (selected) return <div className="space-y-6 animate-fade-in"><AdminPageHeader title="Payment details" description={`Payment #${selected.id}`} primaryAction={{ label: 'Back to payments', onClick: () => setSelected(null), icon: <Icon name="arrow-left" size={15} /> }} /><div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3"><div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs uppercase tracking-wider text-gray-400">Amount</p><p className="mt-2 font-serif text-4xl font-bold text-herbal-900">₹{Number(selected.amount).toFixed(2)}</p><p className="mt-4 text-sm capitalize text-gray-500">{selected.status} · {selected.paymentMethod}</p></div><div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2"><dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2"><div><dt className="text-xs uppercase text-gray-400">Order</dt><dd><button onClick={() => router.push(`/admin/orders/${selected.orderId}`)} className="font-bold text-herbal-700 underline">{selected.order?.orderNumber || `ORD-${selected.orderId}`}</button></dd></div><div><dt className="text-xs uppercase text-gray-400">Gateway</dt><dd className="font-bold">{selected.paymentGateway || '—'}</dd></div><div><dt className="text-xs uppercase text-gray-400">Gateway order</dt><dd className="break-all font-mono">{selected.gatewayOrderId || '—'}</dd></div><div><dt className="text-xs uppercase text-gray-400">Gateway payment</dt><dd className="break-all font-mono">{selected.gatewayPaymentId || '—'}</dd></div><div><dt className="text-xs uppercase text-gray-400">Created</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div><div><dt className="text-xs uppercase text-gray-400">Paid at</dt><dd>{selected.paidAt ? new Date(selected.paidAt).toLocaleString() : '—'}</dd></div></dl>{selected.failureReason && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{selected.failureReason}</p>}</div></div></div>;

    return <div className="space-y-6 animate-fade-in"><AdminPageHeader title="Payment ledger" description="Review Razorpay, COD, and other payment records from the commerce database." primaryAction={{ label: 'Refresh', onClick: load, icon: <Icon name="refresh" size={15} /> }} secondaryAction={{ label: 'Export CSV', onClick: exportCsv, icon: <Icon name="download" size={15} /> }} /><div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase text-gray-400">Method</span>{methods.map(item => <button key={item} onClick={() => setMethod(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${method === item ? 'bg-herbal-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{item}</button>)}</div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase text-gray-400">Status</span>{statuses.map(item => <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status === item ? 'bg-herbal-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{item}</button>)}</div></div><div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Order</th><th className="px-6 py-4">Method</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Created</th><th className="px-6 py-4"></th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(payment => <tr key={payment.id}><td className="px-6 py-4"><button onClick={() => router.push(`/admin/orders/${payment.orderId}`)} className="font-mono font-bold text-herbal-700 underline">{payment.order?.orderNumber || `ORD-${payment.orderId}`}</button><p className="text-xs text-gray-400">Payment #{payment.id}</p></td><td className="px-6 py-4 capitalize">{payment.paymentMethod}</td><td className="px-6 py-4 font-bold">₹{Number(payment.amount).toFixed(2)}</td><td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize">{payment.status}</span></td><td className="px-6 py-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 text-right"><button onClick={() => router.push(`/admin/payments/${payment.id}`)} className="font-bold text-herbal-700 hover:underline">View</button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No payment records match these filters.</td></tr>}</tbody></table></div></div></div>;
}
