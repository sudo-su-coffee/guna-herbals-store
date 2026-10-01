'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminPaymentById } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

export default function AdminPaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const paymentId = Number(id);
    const [payment, setPayment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const response = await getAdminPaymentById(paymentId);
            if (response.success) setPayment(response.data);
            else toast.error(response.error || 'Payment not found');
            setLoading(false);
        };
        if (Number.isInteger(paymentId)) load();
    }, [paymentId]);

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading payment...</div>;
    if (!payment) return <div className="p-12 text-center"><p className="mb-4 text-gray-500">Payment not found.</p><button onClick={() => router.push('/admin/payments')} className="font-bold text-herbal-700">Back to payments</button></div>;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <AdminPageHeader title={`Payment #${payment.id}`} description={`${payment.order?.orderNumber || `ORD-${payment.orderId}`} · ${payment.paymentMethod}`} primaryAction={{ label: 'Back to payments', onClick: () => router.push('/admin/payments'), icon: <Icon name="arrow-left" size={15} /> }} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-400">Amount</p>
                    <p className="mt-2 font-serif text-4xl font-bold text-herbal-900">₹{Number(payment.amount || 0).toFixed(2)}</p>
                    <p className="mt-3 text-sm capitalize text-gray-500">{payment.status} · {payment.paymentMethod}</p>
                    <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm"><div className="flex justify-between"><span className="text-gray-500">Currency</span><span className="font-bold">{payment.currency || 'INR'}</span></div><div className="flex justify-between"><span className="text-gray-500">Gateway</span><span className="font-bold">{payment.paymentGateway || '—'}</span></div><div className="flex justify-between"><span className="text-gray-500">Created</span><span>{new Date(payment.createdAt).toLocaleString()}</span></div><div className="flex justify-between"><span className="text-gray-500">Paid at</span><span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '—'}</span></div></div>
                </section>
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-5 font-serif text-xl font-bold text-herbal-900">Gateway and order references</h2>
                    <dl className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2"><div><dt className="text-xs uppercase text-gray-400">Order</dt><dd><button onClick={() => router.push(`/admin/orders/${payment.orderId}`)} className="font-bold text-herbal-700 underline">{payment.order?.orderNumber || `ORD-${payment.orderId}`}</button></dd></div><div><dt className="text-xs uppercase text-gray-400">Order total</dt><dd className="font-bold">₹{Number(payment.order?.totalAmount || 0).toFixed(2)}</dd></div><div><dt className="text-xs uppercase text-gray-400">Gateway order ID</dt><dd className="break-all font-mono">{payment.gatewayOrderId || '—'}</dd></div><div><dt className="text-xs uppercase text-gray-400">Gateway payment ID</dt><dd className="break-all font-mono">{payment.gatewayPaymentId || '—'}</dd></div></dl>{payment.failureReason && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{payment.failureReason}</p>}
                    <h2 className="mb-3 mt-8 font-serif text-xl font-bold text-herbal-900">Webhook timeline</h2>{payment.webhooks?.length ? <div className="space-y-3">{payment.webhooks.map((webhook: any) => <div key={webhook.id} className="rounded-lg border border-gray-100 p-4 text-sm"><div className="flex flex-wrap justify-between gap-3"><span className="font-bold">{webhook.eventType}</span><span className="capitalize text-gray-500">{webhook.status || 'received'}</span></div><p className="mt-1 text-xs text-gray-400">{webhook.provider} · {webhook.receivedAt ? new Date(webhook.receivedAt).toLocaleString() : '—'}</p></div>)}</div> : <p className="text-sm text-gray-500">No gateway webhooks recorded.</p>}
                </section>
            </div>
        </div>
    );
}
