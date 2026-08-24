'use client';
// @ts-nocheck

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/lib/ShopContext';
import { Order, Customer, Session } from '../../../../lib/types';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const { customers, orders: allOrders, banUser, unbanUser, forceLogoutUser, terminateSession } = useShop();
    const router = useRouter();

    // Unwrap params using React.use for compatibility with potential future async params
    // In current Next.js 13/14 versions, params is available directly, but wrapping protects against future changes
    // Or simply access it directly if we are sure of the version. Let's stick to standard prop access for now to be safe with current setup.
    const customerId = params.id;

    const customer = customers.find(c => String(c.id) === customerId);
    const customerOrders = allOrders.filter(o => o.shipping.email === customer?.email || o.shipping.phone === customer?.phone);

    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'security' | 'sessions'>('overview');

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-xl text-gray-400 font-serif mb-4">Customer not found.</p>
                <button onClick={() => router.back()} className="text-herbal-700 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    const activeSessions = (customer.sessions || []).filter(s => s.isActive);
    const riskLevel = customer.riskScore > 70 ? 'Critical' : customer.riskScore > 30 ? 'Moderate' : 'Low';
    const riskColor = customer.riskScore > 70 ? 'bg-red-100 text-red-800' : customer.riskScore > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

    const handleBack = () => router.push('/admin/customers');
    const handleViewOrder = (orderId: string) => router.push(`/admin/orders/${orderId}`);

    return (
        <div className="animate-fade-in pb-12 w-full max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 bg-white p-2 rounded-full shadow-sm border border-gray-200 transition-colors">←</button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif text-gray-900 flex items-center gap-2">
                            {customer.name}
                            {customer.status === 'banned' && <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider">Banned</span>}
                        </h1>
                        <p className="text-sm text-gray-500">{customer.email || 'No Email'} • {customer.phone}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {customer.status === 'banned' ? (
                        <button onClick={() => unbanUser(customer.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                            Unban Account
                        </button>
                    ) : (
                        <>
                            <button onClick={() => forceLogoutUser(customer.id)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                Force Logout
                            </button>
                            <button onClick={() => { if (confirm('Ban this user? They will lose access immediately.')) banUser(customer.id) }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                Ban User
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 bg-herbal-50 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                                {customer.name.charAt(0)}
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${riskColor} mb-2`}>
                                Risk Score: {customer.riskScore}/100 ({riskLevel})
                            </div>
                            <p className="text-xs text-gray-400">Customer ID: {customer.id}</p>
                        </div>
                        <div className="space-y-4 text-sm border-t border-gray-100 pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Spend</span>
                                <span className="font-bold text-gray-900">₹{customer.totalSpend.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Orders</span>
                                <span className="font-bold text-gray-900">{customer.totalOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Registered</span>
                                <span className="font-bold text-gray-900">{new Date(customer.registeredAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4">Saved Addresses</h3>
                        {customer.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {customer.addresses.map((addr, i) => (
                                    <div key={i} className="text-xs border-l-2 border-herbal-300 pl-3">
                                        <p className="font-bold">{addr.address}</p>
                                        <p className="text-gray-500">{addr.city} - {addr.zip}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-xs italic">No saved addresses.</p>
                        )}
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="lg:col-span-3">
                    <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto scrollbar-hide">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Orders" />
                        <TabButton active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} label={`Sessions (${activeSessions.length})`} />
                        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Security Logs" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="p-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Overview</h3>
                                <p className="text-gray-500 text-sm mb-8">Summary of user activity and status.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Lifetime Value</p>
                                        <p className="text-2xl font-bold text-blue-900">₹{customer.totalSpend}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="text-xs text-purple-600 font-bold uppercase mb-1">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-purple-900">₹{customer.totalOrders > 0 ? Math.round(customer.totalSpend / customer.totalOrders) : 0}</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <p className="text-xs text-orange-600 font-bold uppercase mb-1">Last Active</p>
                                        <p className="text-lg font-bold text-orange-900">{activeSessions[0] ? new Date(activeSessions[0].lastActive || Date.now()).toLocaleDateString() : 'Inactive'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {customerOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono font-bold text-herbal-700">{order.id}</td>
                                                <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-right">₹{order.total}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleViewOrder(order.id)} className="text-blue-600 hover:underline text-xs font-bold">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {customerOrders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No orders found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div className="p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    Active Sessions
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{activeSessions.length}</span>
                                </h3>
                                <div className="space-y-4">
                                    {activeSessions.map(session => (
                                        <div key={session.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-white transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                                    {session.deviceType === 'Mobile' ? '📱' : '💻'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{session.os} - {session.browser}</p>
                                                    <p className="text-xs text-gray-500 font-mono">IP: {session.ip} • {session.location}</p>
                                                    <p className="text-[10px] text-gray-400">Started: {new Date(session.startTime || Date.now()).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => terminateSession(session.id)}
                                                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold border border-red-200 transition-colors"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                    {activeSessions.length === 0 && <p className="text-gray-400 italic text-sm">No active sessions.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4">IP Address</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {customer.loginHistory?.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-bold text-gray-700">Login Attempt</td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.ip || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!customer.loginHistory || customer.loginHistory.length === 0) && (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">No logs available.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button
        onClick={onClick}
        className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${active ? 'border-herbal-800 text-herbal-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
    >
        {label}
    </button>
);
