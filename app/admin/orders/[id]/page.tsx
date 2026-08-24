'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminOrderById, updateAdminPaymentStatus, updateOrderStatus } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const orderId = Number(params.id);
    const load = async () => {
        setLoading(true);
        const response = await getAdminOrderById(orderId);
        if (response.success) setOrder(response.data);
        else toast.error(response.error || 'Order not found');
        setLoading(false);
    };

    useEffect(() => { load(); }, [orderId]);

    const changeOrderStatus = async (status: string) => {
        setSaving(true);
        const response = await updateOrderStatus(orderId, status);
        if (!response.success) toast.error(response.error || 'Unable to update order');
        else { toast.success('Order status updated'); await load(); }
        setSaving(false);
    };

    const changePaymentStatus = async (status: typeof paymentStatuses[number]) => {
        setSaving(true);
        const response = await updateAdminPaymentStatus(orderId, status);
        if (!response.success) toast.error(response.error || 'Unable to update payment');
        else { toast.success('Payment status updated'); await load(); }
        setSaving(false);
    };

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading order...</div>;
    if (!order) return <div className="p-12 text-center"><p className="mb-4 text-gray-500">Order not found.</p><button onClick={() => router.back()} className="font-bold text-herbal-700">Go back</button></div>;

    const address = order.shippingAddress || {};
    const items = order.items || [];
    const subtotal = Number(order.subtotal || 0);
    const shipping = Number(order.shippingCharge || 0);
    const tax = Number(order.taxAmount || 0);
    const discount = Number(order.discountAmount || 0);
    const total = Number(order.totalAmount || 0);
    const shipment = order.shipments?.[0];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <AdminPageHeader title={`Order ${order.orderNumber || `ORD-${order.id}`}`} description={`Placed ${new Date(order.createdAt).toLocaleString()}`} primaryAction={{ label: 'Back to Orders', onClick: () => router.push('/admin/orders'), icon: <Icon name="arrow-left" size={15} /> }} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Order status</p><select value={order.orderStatus} disabled={saving} onChange={e => changeOrderStatus(e.target.value)} className="mt-2 rounded-lg border border-gray-200 bg-white p-2 font-bold capitalize text-herbal-900">{orderStatuses.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></div>
                            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment</p><select value={order.paymentStatus} disabled={saving} onChange={e => changePaymentStatus(e.target.value as typeof paymentStatuses[number])} className="mt-2 rounded-lg border border-gray-200 bg-white p-2 font-bold capitalize text-herbal-900">{paymentStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
                            <Link href="/admin/delivery" className="rounded-lg bg-herbal-800 px-4 py-2 text-sm font-bold text-white hover:bg-herbal-900">Manage shipment</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-5 pt-5 md:grid-cols-4"><div><p className="text-xs uppercase text-gray-400">Method</p><p className="mt-1 font-bold uppercase">{order.paymentMethod}</p></div><div><p className="text-xs uppercase text-gray-400">Items</p><p className="mt-1 font-bold">{items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0)}</p></div><div><p className="text-xs uppercase text-gray-400">Customer ID</p><p className="mt-1 font-bold">{order.userId || 'Guest'}</p></div><div><p className="text-xs uppercase text-gray-400">Total</p><p className="mt-1 font-bold text-herbal-800">₹{total.toFixed(2)}</p></div></div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-5 font-serif text-xl font-bold text-herbal-900">Items</h2><div className="divide-y divide-gray-100">{items.map((item: any) => { const price = Number(item.unitPrice || item.price || item.variant?.price || 0); const product = item.variant?.product; return <div key={item.id} className="flex items-center gap-4 py-4"><div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100">{product?.images?.[0]?.imageUrl && <img src={product.images[0].imageUrl} alt="" className="h-full w-full object-cover" />}</div><div className="flex-1"><p className="font-bold text-gray-900">{item.productName || product?.name || 'Product'}</p><p className="text-xs text-gray-500">SKU: {item.sku || item.variant?.sku || '—'} · Qty {item.quantity}</p></div><p className="font-bold">₹{(price * Number(item.quantity || 0)).toFixed(2)}</p></div>; })}</div><div className="mt-5 space-y-2 border-t border-gray-100 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div><div className="flex justify-between"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div><div className="flex justify-between"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold text-herbal-900"><span>Total</span><span>₹{total.toFixed(2)}</span></div></div></div>
                </section>
                <aside className="space-y-6"><div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-xl font-bold text-herbal-900">Delivery</h2>{shipment ? <div className="space-y-3 text-sm"><div><p className="text-xs uppercase text-gray-400">Courier</p><p className="font-bold">{shipment.courierName}</p></div><div><p className="text-xs uppercase text-gray-400">Shipment number</p><p className="font-mono font-bold">{shipment.shipmentNumber}</p></div><div><p className="text-xs uppercase text-gray-400">Tracking number</p><p className="font-mono">{shipment.trackingNumber || '—'}</p></div><div><p className="text-xs uppercase text-gray-400">Status</p><p className="font-bold capitalize">{shipment.status?.replace('_', ' ')}</p></div>{shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-herbal-50 p-3 text-center font-bold text-herbal-800">Open courier tracking</a>}</div> : <p className="text-sm text-gray-500">No manual shipment has been assigned.</p>}</div><div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-4 font-serif text-xl font-bold text-herbal-900">Ship to</h2><div className="space-y-1 text-sm text-gray-600"><p className="font-bold text-gray-900">{address.name || 'Customer'}</p><p>{address.addressLine1 || address.address || '—'}</p><p>{[address.city, address.state, address.postalCode || address.zip].filter(Boolean).join(', ')}</p><p>{address.phone || '—'}</p></div></div></aside>
            </div>
        </div>
    );
}
