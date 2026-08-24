// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { Product, ShippingDetails, CartItem, Order } from '@/lib/types';
import { useShop } from '@/lib/ShopContext';

interface CreateOrderModalProps {
    products: Product[];
    onClose: () => void;
}

export function CreateOrderModal({ products, onClose }: CreateOrderModalProps) {
    const { createOrder } = useShop();
    const [shipping, setShipping] = useState<ShippingDetails>({ name: '', phone: '', email: '', address: '', city: '', state: '', zip: '' });
    const [items, setItems] = useState<CartItem[]>([]);
    const [productSearch, setProductSearch] = useState('');

    const total = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

    const handleAddItem = () => {
        const defaultProduct = products.filter(p => p.price > 0 && p.name.toLowerCase().includes(productSearch.toLowerCase()))[0];
        if (defaultProduct) {
            setItems(prev => [...prev, { product: defaultProduct, quantity: 1 }]);
        }
    };

    const handleItemChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = [...items];
            newItems[index].product = product;
            setItems(newItems);
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
        const order: Order = {
            id: `ORD-M-${Date.now() % 100000}`,
            date: new Date().toISOString(),
            shipping,
            items,
            total,
            status: 'Processing',
            paymentMethod: 'Manual',
            paymentStatus: 'Pending',
            orderSource: 'Manual'
        };
        await createOrder(order);
        onClose();
    };

    const filteredProducts = products.filter(p => p.price > 0 && p.name.toLowerCase().includes(productSearch.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
                <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold font-serif text-herbal-900">Create Manual Order</h2>
                    <p className="text-xs text-gray-500">For phone or whatsapp orders.</p>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" onChange={(e) => setShipping(s => ({ ...s, name: e.target.value }))} placeholder="Customer Name" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none" />
                        <input name="phone" onChange={(e) => setShipping(s => ({ ...s, phone: e.target.value }))} placeholder="Phone Number" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none" />
                    </div>
                    <textarea name="address" onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))} placeholder="Full Delivery Address (incl. City, Zip)" className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:ring-2 focus:ring-herbal-500 outline-none h-20 resize-none" />

                    {/* Items */}
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
                                    + Add Item
                                </button>
                            </div>
                        </div>
                        {items.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">No items added yet. Search and add products.</p>}

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 rounded bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={item.product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <select
                                        value={item.product.id}
                                        onChange={e => handleItemChange(index, e.target.value)}
                                        className="p-2 border border-gray-200 rounded flex-grow bg-white text-sm max-w-[200px] sm:max-w-xs"
                                    >
                                        <option value={item.product.id}>{item.product.name} - ₹{item.product.price}</option>
                                        {filteredProducts.filter(p => p.id !== item.product.id).map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                                        ))}
                                    </select>
                                    <input type="number" value={item.quantity} onChange={e => handleQtyChange(index, parseInt(e.target.value))} className="w-16 p-2 border border-gray-200 rounded text-center text-sm font-bold" min="1" />
                                    <span className="text-sm font-bold w-20 text-right">₹{item.product.price * item.quantity}</span>
                                    <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 px-2">✕</button>
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
}
