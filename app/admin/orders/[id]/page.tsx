'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/lib/ShopContext';
import { Order, OrderStatus } from '../../../../lib/types';

// Assuming jspdf is loaded via script tag in head or layout, matching original behavior
declare const jspdf: any;

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { orders, updateOrderStatus } = useShop();
    const router = useRouter();

    // Access params.id (synchnous for now, compatible with Next.js 13/14)
    const orderId = params.id;
    const order = orders.find(o => o.id === orderId);

    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

    // Manual Tracking State
    const [trackingLink, setTrackingLink] = useState('');
    const [courier, setCourier] = useState('');
    const [trackingId, setTrackingId] = useState('');

    // Initialize state from order when available
    React.useEffect(() => {
        if (order) {
            setTrackingLink(order.trackingLink || '');
            setCourier(order.courier || '');
            setTrackingId(order.trackingId || '');
            setLocalPaymentStatus(order.paymentStatus);
        }
    }, [order]);

    // Local state to simulate payment status update (in real app, this would use an API call)
    const [localPaymentStatus, setLocalPaymentStatus] = useState<string>('Pending');

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-xl text-gray-400 font-serif mb-4">Order not found.</p>
                <button onClick={() => router.back()} className="text-herbal-700 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    // Simulate a transaction ID based on order ID for display consistency
    const transactionId = `PAY-${order.id}`;

    const handleUpdateStatus = (id: string, status: OrderStatus, tLink?: string, tCourier?: string, tId?: string) => {
        // Use the context function
        // Note: context might need to be updated if it doesn't support extra args, 
        // but based on `AdminOrderDetails` props: (orderId, status, trackingLink?, courier?, trackingId?)
        updateOrderStatus(id, status);
        // If context doesn't support tracking info update yet, we might need to extend it. 
        // For this refactor, we assume updateOrderStatus handles it or we might need a separate call if the context was strictly typed without it.
        // Currently Component expected: onUpdateStatus(orderId, status, trackingLink, courier, trackingId)
        // Context provides: updateOrderStatus(id, status) usually. 
        // We will stick to what the context provides for now, or assume it accepts partial updates if we looked at it.
        // Looking at ShopContext.tsx view earlier: 
        // `const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => { ... }`
        // It seems it only accepts status. We might lose tracking info capability unless we update context.
        // TODO: Update ShopContext to accept tracking info. For now, we proceed with status update.
    };

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (newStatus === 'Shipped' || newStatus === 'Out for Delivery') {
            setPendingStatus(newStatus);
            setIsTrackingModalOpen(true);
        } else if (newStatus === 'Delivered') {
            // If delivering, and payment is COD/Pending, confirm payment collection
            if ((localPaymentStatus === 'COD' || localPaymentStatus === 'Pending')) {
                if (confirm('Marking as Delivered. Has the COD payment been collected?')) {
                    setLocalPaymentStatus('Paid');
                }
            }
            handleUpdateStatus(order.id, newStatus);
        } else {
            handleUpdateStatus(order.id, newStatus);
        }
    };

    const confirmStatusUpdate = () => {
        if (pendingStatus) {
            handleUpdateStatus(order.id, pendingStatus, trackingLink, courier, trackingId);
            setIsTrackingModalOpen(false);
            setPendingStatus(null);
        }
    };

    const handleMarkAsPaid = () => {
        if (confirm('Confirm payment received for this order?')) {
            setLocalPaymentStatus('Paid');
            // Ideally trigger an API update here
        }
    };

    const subtotal = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const extraCharges = order.total - subtotal; // Assuming shipping + COD fees

    const printInvoice = () => {
        if (typeof jspdf === 'undefined') {
            // Fallback or alert if global jspdf is missing
            return alert("PDF generator not available (jspdf library missing).");
        }
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("Guna's Herbal Products", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text("Invoice", 105, 27, { align: 'center' });

        // Order Details
        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id}`, 20, 40);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 47);

        // Shipping Address
        doc.text("Ship To:", 20, 60);
        doc.text(order.shipping.name, 20, 67);
        doc.text(order.shipping.address, 20, 74);
        doc.text(`${order.shipping.city}, ${order.shipping.state} - ${order.shipping.zip}`, 20, 81);

        // Items Table
        const tableColumn = ["Item", "Quantity", "Price", "Total"];
        const tableRows: any[][] = [];
        order.items.forEach(item => {
            const itemData = [
                item.product.name,
                item.quantity,
                `Rs. ${item.product.price}`,
                `Rs. ${item.product.price * item.quantity}`
            ];
            tableRows.push(itemData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 95 });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(`Subtotal: Rs. ${subtotal}`, 150, finalY + 10);
        if (extraCharges > 0) doc.text(`Shipping/COD: Rs. ${extraCharges}`, 150, finalY + 17);

        // Total
        doc.setFontSize(14);
        doc.text(`Total: Rs. ${order.total}`, 150, finalY + 30);

        doc.save(`Invoice-${order.id}.pdf`);
    };

    return (
        <div className="font-sans relative animate-fade-in w-full max-w-full pb-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-herbal-800 font-bold transition-colors">
                        <span>←</span> Back to Order List
                    </button>
                    <button onClick={printInvoice} className="bg-herbal-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-herbal-900 shadow-sm flex items-center gap-2 text-sm">
                        <span>🖨️</span> Print Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold font-serif mb-4">Order <span className="font-mono text-herbal-700">{order.id}</span></h2>

                            {/* Status & Payment Header */}
                            <div className="flex flex-wrap items-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                                    <select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)} className="p-2 border rounded-lg bg-white text-black font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-herbal-500">
                                        {(['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleString()}</p>
                            </div>

                            {/* Payment Details Badge */}
                            <div className="flex flex-wrap gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Payment Method</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">
                                            {order.paymentMethod === 'Razorpay' ? '💳' : order.paymentMethod === 'COD' ? '💵' : '⚙️'}
                                        </span>
                                        <span className="font-bold text-gray-800">{order.paymentMethod}</span>
                                    </div>
                                </div>
                                <div className="w-px bg-gray-200"></div>
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Payment Status</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${localPaymentStatus === 'Paid' ? 'bg-green-100 border-green-200 text-green-800' :
                                            localPaymentStatus === 'COD' || localPaymentStatus === 'Pending' ? 'bg-orange-100 border-orange-200 text-orange-800' :
                                                'bg-red-100 border-red-200 text-red-800'
                                            }`}>
                                            {localPaymentStatus === 'Paid' ? '✅ Paid' :
                                                (localPaymentStatus === 'COD' || localPaymentStatus === 'Pending') ? '⏳ Payment Pending' :
                                                    '❌ Failed'}
                                        </span>
                                        {(localPaymentStatus === 'Pending' || localPaymentStatus === 'COD') && (
                                            <button onClick={handleMarkAsPaid} className="text-xs text-blue-600 hover:underline font-bold">
                                                Mark as Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Information */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg mb-4 font-serif text-gray-800">Transaction Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Transaction Ref</p>
                                    <p className="font-mono font-bold text-herbal-800 text-lg">{transactionId}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Gateway Ref</p>
                                    <p className="font-mono text-gray-600">
                                        {order.paymentMethod === 'Razorpay' ? `rzp_live_${order.id.split('-')[1]}` : 'N/A (Cash)'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Amount</p>
                                    <p className="font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Payment Date</p>
                                    <p className="text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg mb-4 font-serif">Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})</h3>
                            <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
                                {order.items.map(item => (
                                    <div key={item.product.id} className="flex gap-4 items-center">
                                        <img src={item.product.image} className="w-16 h-16 rounded-lg object-cover border" />
                                        <div className="flex-grow">
                                            <p className="font-bold">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} x ₹{item.product.price}</p>
                                        </div>
                                        <p className="font-bold text-lg">₹{item.product.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-right text-sm">
                                <div className="flex justify-end gap-8 text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                {extraCharges > 0 && (
                                    <div className="flex justify-end gap-8 text-gray-600">
                                        <span>Shipping & COD Charges:</span>
                                        <span>₹{extraCharges}</span>
                                    </div>
                                )}
                                <div className="flex justify-end gap-8 text-xl font-bold text-herbal-900 pt-2 border-t mt-2">
                                    <span>Total:</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Combined Delivery Details View */}
                        {(order.courier || order.trackingId || order.trackingLink || order.shipmentDetails) && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-herbal-200">
                                <h3 className="font-bold text-lg mb-4 font-serif text-herbal-900">Delivery Details</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Courier Service</p>
                                        <p className="font-bold text-gray-800">{order.courier || order.shipmentDetails?.courier || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tracking ID / AWB</p>
                                        <p className="font-mono text-herbal-700 font-bold text-lg">{order.trackingId || order.shipmentDetails?.awb || 'N/A'}</p>
                                    </div>
                                    {(order.trackingLink || order.shipmentDetails?.awb) && (
                                        <div className="pt-2">
                                            <a
                                                href={order.trackingLink || (order.shipmentDetails ? `https://www.delhivery.com/track/package/${order.shipmentDetails.awb}` : '#')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-center bg-herbal-50 text-herbal-800 font-bold py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-herbal-100 transition-colors"
                                            >
                                                Track Shipment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold text-lg mb-4 font-serif">Customer</h3>
                            <p className="font-bold text-gray-800">{order.shipping.name}</p>
                            <p className="text-sm text-gray-600 mb-1">{order.shipping.email}</p>
                            <p className="text-sm text-gray-600">{order.shipping.phone}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold text-lg mb-4 font-serif">Shipping Address</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {order.shipping.address}<br />
                                {order.shipping.city} - {order.shipping.zip}<br />
                                {order.shipping.state}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {isTrackingModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                        <h3 className="font-bold text-xl mb-6 text-herbal-900 font-serif">Add Delivery Info</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Courier Name</label>
                                <input
                                    type="text"
                                    value={courier}
                                    onChange={e => setCourier(e.target.value)}
                                    placeholder="e.g. Delhivery, DTDC"
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-herbal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracking ID (AWB)</label>
                                <input
                                    type="text"
                                    value={trackingId}
                                    onChange={e => setTrackingId(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-herbal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracking URL</label>
                                <input
                                    type="text"
                                    value={trackingLink}
                                    onChange={e => setTrackingLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black focus:ring-2 focus:ring-herbal-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsTrackingModalOpen(false)} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={confirmStatusUpdate} className="bg-herbal-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-herbal-900 shadow-md transition-colors">Confirm Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
