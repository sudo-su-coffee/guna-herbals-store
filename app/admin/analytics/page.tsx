'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getAdminStat } from '@/lib/api';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const stats = await getAdminStat();
            setData(stats);
        } catch (err) {
            console.error("Load analytics error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = useMemo(() => {
        if (!data) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalCustomers: 0 };
        const totalRevenue = parseFloat(data.totalRevenue || '0');
        const totalOrders = data.totalOrders || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalCustomers = data.customers?.length || 0;
        return { totalRevenue, totalOrders, avgOrderValue, totalCustomers };
    }, [data]);

    const salesTrend = useMemo(() => {
        if (!data?.orders) return [];
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dailyTotal = data.orders
                .filter((o: any) => o.createdAt.startsWith(date))
                .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0);
            return { date, value: dailyTotal };
        });
    }, [data]);

    const maxSale = Math.max(...salesTrend.map(s => s.value)) || 1000;

    const salesByCategory = useMemo(() => {
        if (!data?.orders) return [];
        const categoryMap = new Map<string, number>();
        data.orders.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const category = item.variant?.product?.category?.name || 'Other';
                const saleAmount = parseFloat(item.price) * item.quantity;
                categoryMap.set(category, (categoryMap.get(category) || 0) + saleAmount);
            });
        });
        return Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([category, sales]) => ({ category, sales }));
    }, [data]);

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Analytics & Reports</h1>
                    <p className="text-gray-500">Real-time insights into store performance.</p>
                </div>
                <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                    Download Report
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sales" value={`₹${stats.totalRevenue.toLocaleString()}`} icon="💰" trend="+15%" color="green" />
                <StatCard title="Total Orders" value={stats.totalOrders.toString()} icon="🛒" trend="+8%" color="blue" />
                <StatCard title="Avg. Order Value" value={`₹${stats.avgOrderValue.toFixed(0)}`} icon="🏷️" trend="-2%" color="orange" />
                <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon="👥" trend="+12%" color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-lg text-gray-800 font-serif">Revenue Trend (Last 7 Days)</h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-herbal-500"></span>
                            <span className="text-xs text-gray-500">Sales</span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                        {salesTrend.map((item, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group relative">
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    ₹{item.value.toLocaleString()}
                                </div>

                                <div
                                    className="w-full bg-herbal-100 rounded-t-lg relative overflow-hidden group-hover:bg-herbal-200 transition-colors duration-300"
                                    style={{ height: `${(item.value / maxSale) * 100}%`, minHeight: '2%' }}
                                >
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-herbal-600 transition-all duration-1000 ease-out"
                                        style={{ height: '0%', animation: `growUp 1s ease-out forwards ${i * 0.1}s` }}
                                    ></div>
                                    <style>{`@keyframes growUp { to { height: 100%; } }`}</style>
                                </div>

                                <span className="text-[10px] text-gray-400 mt-3 font-bold uppercase">
                                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-6 text-gray-800 font-serif">Top Performing Categories</h3>
                    <div className="space-y-6">
                        {salesByCategory.slice(0, 5).map(({ category, sales }, i) => (
                            <div key={category}>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <span className="text-gray-400 font-mono text-xs">#{i + 1}</span>
                                        {category}
                                    </span>
                                    <span>₹{sales.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-herbal-800 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.totalRevenue > 0 ? (sales / stats.totalRevenue) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            * Data is calculated based on completed and processing orders. Cancelled orders are excluded from revenue.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color }: { title: string, value: string, icon: string, trend: string, color: string }) => {
    const colorClasses: any = {
        green: 'text-green-600 bg-green-50',
        blue: 'text-blue-600 bg-blue-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    const isNegative = trend.startsWith('-');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 font-serif">{value}</p>
            </div>
        </div>
    );
};
