'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/lib/types';
import { getAllOrders, getAllProducts, createOrder } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import { toast } from 'sonner';
import { Icon } from '@/components/Icon';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const [ordersData, productsData] = await Promise.all([
                getAllOrders(),
                getAllProducts()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (err) {
            console.error("Load orders error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (filter === 'All') return sorted;
        return sorted.filter(o => o.status === filter.toLowerCase());
    }, [orders, filter]);

    const exportToCsv = () => {
        if (filteredOrders.length === 0) return;
        const header = "Order ID,Date,Customer,Email,Phone,Total,Status,Payment Method";
        const rows = filteredOrders.map(o =>
            `${o.id},${o.date},"${o.shipping.name}","${o.shipping.email}",${o.shipping.phone},${o.total},${o.status},${o.paymentMethod}`
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns: Column<any>[] = [
        {
            header: "Order ID",
            accessor: (o) => <span className="font-mono font-bold text-herbal-700">#{o.id}</span>,
            sortKey: 'id'
        },
        {
            header: "Date",
            accessor: (o) => new Date(o.createdAt).toLocaleDateString(),
            className: "hidden md:table-cell",
            sortKey: 'createdAt'
        },
        {
            header: "Customer",
            accessor: (o) => (
                <div>
                    <div className="font-bold text-gray-800">{o.user?.name || o.user?.phone || 'Guest'}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[100px] md:max-w-none">{o.shippingAddress?.city || 'N/A'}</div>
                </div>
            ),
            sortKey: 'userId'
        },
        {
            header: "Total",
            accessor: (o) => <span className="font-bold text-gray-900">₹{parseFloat(o.totalAmount).toLocaleString()}</span>,
            sortKey: 'totalAmount'
        },
        {
            header: "Status",
            accessor: (o) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                    o.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        o.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'delivered' ? 'bg-green-500' :
                        o.status === 'pending' ? 'bg-yellow-500' :
                            o.status === 'cancelled' ? 'bg-red-500' :
                                'bg-blue-500'
                        }`}></span>
                    {o.status}
                </span>
            ),
            sortKey: 'status'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12 w-full max-w-full">
            <AdminPageHeader
                title="Orders"
                description="Process and track customer purchases."
                primaryAction={{ label: "Manual Order", onClick: () => setCreateModalOpen(true), icon: <Icon name="plus" size={15} /> }}
                secondaryAction={{ label: "Export CSV", onClick: exportToCsv, icon: <Icon name="download" size={15} /> }}
            />

            {/* Filter Tabs */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-x-auto scrollbar-hide">
                <div className="flex space-x-1 min-w-max">
                    {(['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${filter === f
                                ? 'bg-herbal-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                }`}
                        >
                            {f}
                            {f !== 'All' && (
                                <span className={`ml-2 text-xs opacity-70 ${filter === f ? 'text-white' : 'text-gray-400'}`}>
                                    {orders.filter(o => o.status === f.toLowerCase()).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AdminTable
                data={filteredOrders}
                columns={columns}
                keyField="id"
                searchKeys={['id', 'totalAmount']}
                onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
                emptyMessage="No orders found."
            />

            {isCreateModalOpen && <CreateOrderModal products={products} onClose={() => setCreateModalOpen(false)} onRefresh={loadOrders} />}
        </div>
    );
};


const CreateOrderModal = ({ products, onClose, onRefresh }: { products: any[], onClose: () => void, onRefresh: () => void }) => {
    const [shipping, setShipping] = useState<any>({ name: '', phone: '', email: '', address: '', city: '', state: '', zip: '' });
    const [items, setItems] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');

    const total = items.reduce((sum, i) => sum + (parseFloat(i.variant.price) * i.quantity), 0);

    const handleAddItem = () => {
        const defaultProduct = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))[0];
        if (defaultProduct) {
            const variant = defaultProduct.variants?.[0] || { price: '0', id: 0 };
            setItems(prev => [...prev, { product: defaultProduct, variant, quantity: 1 }]);
        }
    };

    const handleQtyChange = (index: number, quantity: number) => {
        const newItems = [...items];
        newItems[index].quantity = Math.max(1, quantity);
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            const orderData = {
                userId: 0, // Guest/Manual
                items: items.map(i => ({ variantId: i.variant.id, quantity: i.quantity, price: i.variant.price })),
                totalAmount: total.toString(),
                status: 'processing',
                paymentMethod: 'cash_on_delivery',
                shippingAddress: shipping,
                orderSource: 'manual'
            };
            await createOrder(orderData as any);
            onRefresh();
            onClose();
            toast.success("Order Created Successfully");
        } catch (err) {
            toast.error("Failed to Create Order");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
                <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold font-serif text-herbal-900">Create Manual Order</h2>
                    <p className="text-xs text-gray-500">For phone or whatsapp orders.</p>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" onChange={(e) => setShipping((s: any) => ({ ...s, name: e.target.value }))} placeholder="Customer Name" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none" />
                        <input name="phone" onChange={(e) => setShipping((s: any) => ({ ...s, phone: e.target.value }))} placeholder="Phone Number" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none" />
                    </div>
                    <textarea name="address" onChange={(e) => setShipping((s: any) => ({ ...s, address: e.target.value }))} placeholder="Full Delivery Address" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none h-20 resize-none" />

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-800">Order Items</h3>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search product..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-herbal-500 w-full sm:w-48"
                                />
                                <button onClick={handleAddItem} className="text-xs font-bold bg-herbal-800 text-white px-4 py-2 rounded hover:bg-herbal-900 transition-colors whitespace-nowrap">
                                    <Icon name="plus" size={14} /> Add Item
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 rounded bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={item.product.images?.[0]?.imageUrl || '/placeholder.jpg'} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-sm font-bold flex-grow">{item.product.name}</span>
                                    <input type="number" value={item.quantity} onChange={e => handleQtyChange(index, parseInt(e.target.value))} className="w-16 p-2 border border-gray-200 rounded text-center text-sm font-bold" min="1" />
                                    <span className="text-sm font-bold w-20 text-right">₹{parseFloat(item.variant.price) * item.quantity}</span>
                                    <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 px-2"><Icon name="plus" size={14} className="rotate-45" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-gray-500">Total Amount</span>
                        <span className="text-2xl font-bold text-herbal-900">₹{total}</span>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} className="bg-herbal-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-herbal-900 transition-all">Create Order</button>
                </div>
            </div>
        </div>
    );
};
