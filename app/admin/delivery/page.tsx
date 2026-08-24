// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { DelhiveryShipment, Order } from '../../../lib/types';
import { delhiveryService } from '@/services/delhiveryService';
import { useShop } from '@/lib/ShopContext';

export default function DeliveryPage() {
    const { orders, linkShipmentToOrder } = useShop();
    const [shipments, setShipments] = useState<DelhiveryShipment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshShipments = async () => {
        setIsLoading(true);
        const data = await delhiveryService.getShipments();
        setShipments(data);
        setIsLoading(false);
    };

    useEffect(() => {
        refreshShipments();
    }, []);

    const handleCreateShipment = async (order: Order) => {
        try {
            const newShipment = await delhiveryService.createShipment(order);
            // Link the shipment to the order in global state
            linkShipmentToOrder(order.id, newShipment.awb);

            await refreshShipments();
            alert(`Shipment created! AWB: ${newShipment.awb}`);
        } catch (e) {
            console.error("Shipment creation failed:", e);
            alert("Failed to create shipment. check console.");
        }
    };

    const unshippedOrders = (orders || []).filter(o => !o.shipmentDetails && o.status === 'Processing');

    return (
        <div className="space-y-8 animate-fade-in w-full max-w-full">
            <div>
                <h1 className="text-3xl font-bold font-serif text-gray-800">Delivery Management</h1>
                <p className="text-gray-500">Create shipments and track packages via Delhivery.</p>
            </div>

            {/* Orders Awaiting Shipment Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
                <h3 className="font-bold text-lg mb-4">Orders Awaiting Shipment ({unshippedOrders.length})</h3>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 md:px-6 md:py-4">Order ID</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Customer</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">City</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Items</th>
                                <th className="px-4 py-3 md:px-6 md:py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {unshippedOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono font-bold text-herbal-700">{order.id}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">{order.shipping.name}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">{order.shipping.city}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">{order.items.length}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                                        <button onClick={() => handleCreateShipment(order)} className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-md hover:bg-orange-600">
                                            Create Shipment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {unshippedOrders.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders are awaiting shipment.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manifested Shipments Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
                <h3 className="font-bold text-lg mb-4">Manifested Shipments</h3>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 md:px-6 md:py-4">AWB</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Order ID</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Creation Date</th>
                                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                                <th className="px-4 py-3 md:px-6 md:py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {shipments.map(s => (
                                <tr key={s.awb}>
                                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono font-bold text-herbal-700">{s.awb}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono">{s.orderId}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">{new Date(s.creationDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">{s.status}</td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                                        <button className="text-xs bg-gray-100 font-bold px-3 py-1 rounded-md hover:bg-gray-200">Track</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
