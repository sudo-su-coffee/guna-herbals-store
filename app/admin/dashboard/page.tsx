'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, getAllProducts } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function DashboardPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [orderList, productResponse] = await Promise.all([getAllOrders(), getAllProducts()]);
                setOrders(orderList);
                setProducts(productResponse.success && productResponse.data ? productResponse.data : []);
            } finally {
                setLoading(false);
            }
        }
        void loadDashboard();
    }, []);

    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading Dashboard Data...</div>;

    return (
        <div className="space-y-8 pb-12">
            <AdminPageHeader title="Dashboard" description="Store overview and operations" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ['Revenue', `₹${revenue.toLocaleString('en-IN')}`],
                    ['Orders', orders.length.toString()],
                    ['Products', products.length.toString()],
                    ['Low stock', products.filter((p) => (p.stock || 0) < 10).length.toString()],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-sans font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
                        <p className="mt-3 text-3xl font-serif text-herbal-900">{value}</p>
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-serif text-herbal-900">Recent activity</h2>
                <p className="mt-2 text-sm text-gray-500">Your storefront is connected. Use the customer-facing shop to review catalog, cart, and checkout flows.</p>
            </div>
        </div>
    );
}
