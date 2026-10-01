'use client';

import React, { useEffect, useState } from 'react';
import { createManualShipment, getAdminOrders, getAdminShipments, updateManualShipment } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Icon } from '@/components/Icon';
import { toast } from 'sonner';

type Shipment = {
    id: number;
    orderId: number;
    shipmentNumber: string;
    courierName: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    status: string;
    estimatedDelivery: string | null;
    createdAt: string;
    order?: { orderNumber: string; totalAmount: string };
};

const statuses = ['label_created', 'shipped', 'in_transit', 'delivered', 'cancelled'];

export default function DeliveryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ orderId: '', courierName: '', shipmentNumber: '', trackingNumber: '', trackingUrl: '', status: 'label_created', estimatedDelivery: '' });

    const load = async () => {
        setLoading(true);
        try {
            const [orderResponse, shipmentResponse] = await Promise.all([getAdminOrders(), getAdminShipments()]);
            setOrders(orderResponse.success ? orderResponse.data || [] : []);
            setShipments(shipmentResponse.success ? shipmentResponse.data || [] : []);
        } catch {
            toast.error('Unable to load delivery data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const availableOrders = orders.filter(order => !(order.shipments || []).length);

    const resetForm = () => {
        setEditingId(null);
        setForm({ orderId: '', courierName: '', shipmentNumber: '', trackingNumber: '', trackingUrl: '', status: 'label_created', estimatedDelivery: '' });
    };

    const editShipment = (shipment: Shipment) => {
        setEditingId(shipment.id);
        setForm({
            orderId: String(shipment.orderId),
            courierName: shipment.courierName || '',
            shipmentNumber: shipment.shipmentNumber || '',
            trackingNumber: shipment.trackingNumber || '',
            trackingUrl: shipment.trackingUrl || '',
            status: shipment.status || 'label_created',
            estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 10) : '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            const response = editingId
                ? await updateManualShipment(editingId, form)
                : await createManualShipment({ ...form, orderId: Number(form.orderId) });
            if (!response.success) throw new Error(response.error || 'Unable to save shipment');
            toast.success(editingId ? 'Shipment updated' : 'Shipment created');
            resetForm();
            await load();
        } catch (error: any) {
            toast.error(error.message || 'Unable to save shipment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading delivery operations...</div>;

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-full pb-12">
            <AdminPageHeader title="Manual Delivery" description="Assign low-cost couriers and maintain tracking details without a courier API integration." primaryAction={{ label: 'Refresh', onClick: load, icon: <Icon name="refresh" size={15} /> }} />

            <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="font-serif text-xl font-bold text-herbal-900">{editingId ? 'Update shipment' : 'Create manual shipment'}</h2>
                        <p className="text-sm text-gray-500">Choose a courier, enter the shipment/order number, and optionally add tracking details.</p>
                    </div>
                    {editingId && <button type="button" onClick={resetForm} className="text-sm font-bold text-gray-500 hover:text-gray-800">Cancel edit</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <label className="text-sm font-bold text-gray-700">Order<select required disabled={Boolean(editingId)} value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 font-normal">
                        <option value="">Select order</option>
                        {(editingId ? orders : availableOrders).map(order => <option key={order.id} value={order.id}>{order.orderNumber || `ORD-${order.id}`} · ₹{Number(order.totalAmount || 0).toFixed(2)}</option>)}
                    </select></label>
                    <label className="text-sm font-bold text-gray-700">Courier / shipper<input required value={form.courierName} onChange={e => setForm({ ...form, courierName: e.target.value })} placeholder="India Post, local courier, DTDC..." className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" /></label>
                    <label className="text-sm font-bold text-gray-700">Shipment / order number<input value={form.shipmentNumber} onChange={e => setForm({ ...form, shipmentNumber: e.target.value })} placeholder="Optional: generated if empty" className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" /></label>
                    <label className="text-sm font-bold text-gray-700">Tracking number<input value={form.trackingNumber} onChange={e => setForm({ ...form, trackingNumber: e.target.value })} placeholder="AWB or local reference" className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" /></label>
                    <label className="text-sm font-bold text-gray-700">Tracking URL<input type="url" value={form.trackingUrl} onChange={e => setForm({ ...form, trackingUrl: e.target.value })} placeholder="https://courier.example/track/..." className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" /></label>
                    <label className="text-sm font-bold text-gray-700">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 font-normal">{statuses.map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></label>
                    <label className="text-sm font-bold text-gray-700">Estimated delivery<input type="date" value={form.estimatedDelivery} onChange={e => setForm({ ...form, estimatedDelivery: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-normal" /></label>
                </div>
                <button disabled={saving} className="rounded-lg bg-herbal-800 px-5 py-3 text-sm font-bold text-white hover:bg-herbal-900 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update shipment' : 'Create shipment'}</button>
            </form>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 p-6"><h2 className="font-serif text-xl font-bold text-herbal-900">Manifested shipments</h2><p className="text-sm text-gray-500">{shipments.length} manual shipment record{shipments.length === 1 ? '' : 's'}.</p></div>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-6 py-4">Order</th><th className="px-6 py-4">Courier</th><th className="px-6 py-4">Shipment no.</th><th className="px-6 py-4">Tracking</th><th className="px-6 py-4">Status</th><th className="px-6 py-4"></th></tr></thead><tbody className="divide-y divide-gray-100">{shipments.map(shipment => <tr key={shipment.id}><td className="px-6 py-4 font-mono font-bold">{shipment.order?.orderNumber || `ORD-${shipment.orderId}`}</td><td className="px-6 py-4">{shipment.courierName}</td><td className="px-6 py-4 font-mono">{shipment.shipmentNumber}</td><td className="px-6 py-4">{shipment.trackingUrl ? <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="text-herbal-700 underline">{shipment.trackingNumber || 'Open link'}</a> : shipment.trackingNumber || '—'}</td><td className="px-6 py-4"><span className="rounded-full bg-herbal-50 px-3 py-1 text-xs font-bold capitalize text-herbal-800">{shipment.status.replace('_', ' ')}</span></td><td className="px-6 py-4 text-right"><button onClick={() => editShipment(shipment)} className="font-bold text-herbal-700 hover:underline">Edit</button></td></tr>)}{shipments.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No shipments created yet.</td></tr>}</tbody></table></div>
            </section>
        </div>
    );
}
