'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderithDetails } from '@/lib/api';

// Separate component to use useSearchParams which requires Suspense
function TrackOrderContent() {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams.get('orderId') || '';

    const [orderId, setOrderId] = useState(initialOrderId);
    const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError('');
        setSearchedOrder(null);

        try {
            // Handle ORD-123 format or just 123
            let numericId = parseInt(orderId.replace(/\D/g, ''), 10);

            if (isNaN(numericId)) {
                setError('Invalid Order ID format. Please use numbers or ORD-XXX format.');
                setLoading(false);
                return;
            }

            const found = await getOrderWithDetails(numericId);
            if (found) {
                setSearchedOrder(found);
            } else {
                setError(`Order #${orderId} not found.`);
            }
        } catch (err) {
            console.error('Tracking error:', err);
            setError('An error occurred while tracking your order.');
        } finally {
            setLoading(false);
        }
    };

    // Auto search if orderId provided in URL
    useEffect(() => {
        if (initialOrderId) {
            handleTrack();
        }
    }, [initialOrderId]);

    return (
        <div className="max-w-2xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-herbal-950 mb-6">Track Your Shipment</h1>
            <p className="text-gray-500 mb-10 font-light">Enter your Order ID to see current status</p>

            <form onSubmit={handleTrack} className="flex gap-4 mb-12 max-w-lg mx-auto">
                <input
                    type="text"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    className="flex-1 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-herbal-900 outline-none shadow-sm text-black"
                    placeholder="Order ID (e.g., ORD-123)"
                />
                <button
                    type="submit"
                    disabled={loading || !orderId}
                    className="bg-herbal-900 text-white px-8 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? '...' : 'Track'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-8 border border-red-100 inline-block font-bold">
                    {error}
                </div>
            )}

            {searchedOrder && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-earth-100 text-left animate-slide-up">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-2xl font-serif font-bold text-herbal-900">{searchedOrder.status}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                            <p className="text-lg font-bold text-green-700">
                                {new Date(searchedOrder.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-10 mt-8">
                        <div className="h-1 bg-gray-100 w-full absolute top-1/2 -translate-y-1/2 z-0 rounded-full"></div>
                        <div
                            className="h-1 bg-herbal-900 absolute top-1/2 -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                            style={{
                                width: searchedOrder.status?.toLowerCase() === 'delivered' ? '100%' :
                                    searchedOrder.status?.toLowerCase() === 'shipped' ? '66%' : '33%'
                            }}
                        ></div>

                        <div className="flex justify-between relative z-10 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {['Placed', 'Shipped', 'Delivered'].map((step, idx) => {
                                const status = searchedOrder.status?.toLowerCase();
                                const isCompleted =
                                    (status === 'delivered') ||
                                    (status === 'shipped' && idx <= 1) ||
                                    (idx === 0);

                                return (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-herbal-900 border-herbal-900' : 'bg-white border-gray-300'}`}></div>
                                        <span className={isCompleted ? 'text-herbal-900' : ''}>{step}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {searchedOrder.shipment ? (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <div className="flex gap-4 items-start">
                                <div className="bg-white p-3 rounded-full shadow-sm text-2xl">🚚</div>
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-1">On the way with {searchedOrder.shipment.courier}</h4>
                                    <p className="text-sm text-blue-700 mb-4">Tracking ID: {searchedOrder.shipment.trackingId || searchedOrder.shipment.awb}</p>
                                    {searchedOrder.shipment.trackingLink && (
                                        <button onClick={() => window.open(searchedOrder.shipment.trackingLink, '_blank')} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                            View on Courier Website
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm border border-yellow-100">
                            Shipment details will be updated once the order is dispatched.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function TrackOrder() {
    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 relative overflow-hidden">
            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

            <Suspense fallback={<div className="text-center pt-20">Loading Tracker...</div>}>
                <TrackOrderContent />
            </Suspense>
        </div>
    );
}
