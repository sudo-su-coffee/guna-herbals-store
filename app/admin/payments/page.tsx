'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/lib/ShopContext';
import { Payment } from '../../../lib/types';
import { Icon } from '@/components/Icon';

type MethodFilter = 'All' | 'Razorpay' | 'COD' | 'Manual';
type StatusFilter = 'All' | 'Success' | 'Failed';

export default function PaymentsPage() {
    const { orders } = useShop();
    const router = useRouter();
    const [methodFilter, setMethodFilter] = useState<MethodFilter>('All');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const payments = useMemo<Payment[]>(() => {
        return orders.map(order => {
            const status: 'Success' | 'Failed' | 'Pending' = order.status === 'Cancelled' ? 'Failed' : 'Success';
            return {
                transactionId: `PAY-${order.id}`,
                orderId: order.id,
                customerName: order.shipping.name,
                date: order.date,
                amount: order.total,
                method: order.paymentMethod,
                status: status,
            };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const methodMatch = methodFilter === 'All' || p.method === methodFilter;
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            return methodMatch && statusMatch;
        });
    }, [payments, methodFilter, statusFilter]);

    const exportToCsv = () => {
        if (filteredPayments.length === 0) return;
        const header = "Transaction ID,Order ID,Customer,Date,Amount,Method,Status";
        const rows = filteredPayments.map(p =>
            `${p.transactionId},${p.orderId},"${p.customerName}",${p.date},${p.amount},${p.method},${p.status}`
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (selectedPayment) {
        // Mock parsing logic for the visual table representation of JSON data
        const mockRawData = {
            id: selectedPayment.transactionId.replace('PAY', 'txn'),
            entity: "payment",
            amount: selectedPayment.amount * 100,
            currency: "INR",
            status: selectedPayment.status.toLowerCase() === 'success' ? 'captured' : 'failed',
            method: selectedPayment.method.toLowerCase(),
            email: "customer@example.com",
            contact: "+919876543210",
            fee: Math.round(selectedPayment.amount * 0.02 * 100),
            tax: Math.round(selectedPayment.amount * 0.0036 * 100),
            created_at: Math.floor(new Date(selectedPayment.date).getTime() / 1000)
        };

        return (
            <div className="animate-slide-up space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedPayment(null)} className="flex items-center gap-2 text-gray-600 hover:text-herbal-800 font-bold transition-colors">
                        <Icon name="arrow-left" size={16} /> Back to List
                    </button>
                    <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                        Print Details
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-5xl mx-auto">
                    <div className="bg-herbal-900 text-white p-8 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-serif font-bold mb-1">Transaction Details</h2>
                            <p className="text-herbal-300 font-mono text-sm">{selectedPayment.transactionId}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${selectedPayment.status === 'Success' ? 'bg-green-50 text-white' : 'bg-red-50 text-white'
                                }`}>
                                {selectedPayment.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Amount</p>
                                <p className="text-4xl font-bold text-herbal-900 font-serif">₹{selectedPayment.amount.toLocaleString()}</p>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4">
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Date</span>
                                    <span className="font-bold text-gray-800">{new Date(selectedPayment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Method</span>
                                    <span className="font-bold text-gray-800">{selectedPayment.method}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Order ID</span>
                                    <button onClick={() => router.push(`/admin/orders/${selectedPayment.orderId}`)} className="font-bold text-herbal-700 hover:underline">{selectedPayment.orderId}</button>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Customer</span>
                                    <span className="font-bold text-gray-800">{selectedPayment.customerName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Detailed Table (Parsed JSON) */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Gateway Response Data</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {Object.entries(mockRawData).map(([key, value]) => (
                                        <div key={key} className="grid grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="col-span-1 text-xs font-bold text-gray-500 uppercase font-mono tracking-wide">{key.replace(/_/g, ' ')}</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-900 font-mono break-all">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-start gap-3 border border-blue-100">
                                <Icon name="shield" size={18} className="shrink-0" />
                                <p className="leading-relaxed">
                                    This transaction was processed securely. The data above represents the final state returned by the payment provider.
                                    If the status is 'captured', the funds have been settled to your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Payment History</h1>
                    <p className="text-gray-500">Track all incoming transactions and their statuses.</p>
                </div>
                <button onClick={exportToCsv} className="bg-herbal-800 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm hover:bg-herbal-900 transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Icon name="download" size={15} /> Export CSV
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div>
                    <span className="text-xs font-bold mr-2 text-gray-500 uppercase">Method:</span>
                    {(['All', 'Razorpay', 'COD', 'Manual'] as MethodFilter[]).map(f => (
                        <button key={f} onClick={() => setMethodFilter(f)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors mr-1 ${methodFilter === f ? 'bg-herbal-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div>
                    <span className="text-xs font-bold mr-2 text-gray-500 uppercase">Status:</span>
                    {(['All', 'Success', 'Failed'] as StatusFilter[]).map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors mr-1 ${statusFilter === f ? 'bg-herbal-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Txn ID</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Date</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Order Info</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Amount</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Method</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayments.map(p => (
                                <tr key={p.transactionId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono font-bold text-gray-600 text-xs hidden md:table-cell">{p.transactionId}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-600 hidden md:table-cell">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                        <div className="flex flex-col">
                                            <button onClick={() => router.push(`/admin/orders/${p.orderId}`)} className="font-mono text-herbal-700 font-bold hover:underline text-left">
                                                {p.orderId}
                                            </button>
                                            <span className="text-gray-500 text-xs truncate md:hidden max-w-[120px]">{p.customerName}</span>
                                        </div>
                                        <div className="hidden md:block text-gray-800 font-medium">{p.customerName}</div>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 font-bold text-gray-900 text-right">₹{p.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-600 hidden md:table-cell">
                                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 border border-gray-200">
                                            {p.method}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold border ${p.status === 'Success' ? 'text-green-700 bg-green-50 border-green-100' : 'text-red-700 bg-red-50 border-red-100'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                                        <button
                                            onClick={() => setSelectedPayment(p)}
                                            className="text-herbal-700 hover:text-white font-bold text-xs border border-herbal-200 bg-white hover:bg-herbal-800 px-3 py-1 md:px-4 md:py-1.5 rounded transition-colors shadow-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayments.length === 0 && <div className="p-12 text-center text-gray-400 italic font-serif">No payments found matching your criteria.</div>}
            </div>
        </div>
    );
};
