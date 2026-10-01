'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCart, updateCartItem, removeFromCart, getCurrentUser } from '@/lib/api';

// UI Type for Cart Item
interface CartUIItem {
    id: number; // cartItem id
    quantity: number;
    productName: string;
    categoryName: string;
    size?: string | null;
    price: number;
    subtotal: number;
    imageUrl: string;
    productId: number;
    variantId: number;
}

export default function Cart() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartUIItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    const fetchCart = async () => {
        try {
            const userRes = await getCurrentUser();
            if (!userRes.success || !userRes.data) {
                setLoading(false);
                return;
            }
            setUserId(userRes.data.id);

            const cartRes = await getCart();
            if (cartRes.success && cartRes.data) {
                const items = cartRes.data;
                // Transform API result to UI structure
                const formatted: CartUIItem[] = items.map((i: any) => {
                    const variant = i.variant;
                    const product = variant?.product || i.product;
                    const images = product?.images || [];
                    const image = images.find((img: any) => img.isPrimary) || images[0];

                    const price = i.priceAtTime ? parseFloat(i.priceAtTime.toString()) : 0;

                    return {
                        id: i.id,
                        quantity: i.quantity,
                        productName: product?.name || 'Unknown Product',
                        categoryName: product?.category?.name || 'Herbal',
                        size: variant?.weight ? `${variant.weight}g` : (variant?.sku || ''),
                        price: price,
                        subtotal: price * i.quantity,
                        imageUrl: image?.imageUrl || '/placeholder.jpg',
                        productId: product?.id || 0,
                        variantId: variant?.id || 0
                    };
                }).filter(item => item.productName !== 'Unknown Product');

                setCartItems(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            await handleRemoveItem(cartItemId);
        } else {
            const res = await updateCartItem(cartItemId, newQuantity);
            if (res.success) fetchCart();
            else alert(res.error || "Failed to update quantity");
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        const res = await removeFromCart(cartItemId);
        if (res.success) fetchCart();
        else alert(res.error || "Failed to remove item");
    };

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = total > 500 ? 0 : 50;
    const finalTotal = total + shipping;

    if (loading) return <div className="min-h-screen pt-32 text-center font-serif text-lg">Loading cart...</div>;

    return (
        <div className="w-full min-h-screen bg-earth-50 py-8 px-4 md:px-12 pt-24 md:pt-32">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-herbal-900 mb-6 md:mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="bg-white p-12 md:p-16 rounded-xl shadow-sm text-center border border-dashed border-gray-200 flex flex-col items-center">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-3xl md:text-4xl opacity-50">🛒</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 mb-8 font-serif italic max-w-sm text-sm md:text-base">Looks like you haven't discovered our herbal treasures yet.</p>
                                <button onClick={() => router.push('/shop')} className="bg-herbal-800 text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-serif font-bold hover:bg-herbal-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base">Start Shopping</button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center transition-all hover:shadow-md">
                                            <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 bg-earth-50 rounded-lg overflow-hidden border border-earth-100">
                                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-gray-900 text-base md:text-xl line-clamp-1">{item.productName}</h3>
                                                        <p className="text-xs md:text-sm text-gray-500">{item.size} • {item.categoryName}</p>
                                                    </div>
                                                    <p className="font-bold text-herbal-900 text-lg md:text-xl font-serif">₹{item.subtotal}</p>
                                                </div>

                                                <div className="mt-2 md:mt-4 flex flex-wrap gap-4 justify-between items-center">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 md:gap-4 bg-earth-50 rounded-full px-2 py-1 border border-earth-200">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-600 font-bold transition-colors text-xs md:text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold text-gray-900 w-4 md:w-6 text-center font-serif text-sm md:text-base">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-herbal-700 rounded-full shadow-sm hover:bg-herbal-800 text-white font-bold transition-colors text-xs md:text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-xs md:text-sm text-red-400 hover:text-red-600 font-medium hover:underline font-serif flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="bg-white p-4 rounded-lg border border-earth-100 flex items-center gap-3 shadow-sm">
                                        <div className="text-xl md:text-2xl">🛡️</div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">Secure Payment</p>
                                            <p className="text-xs text-gray-500">256-bit SSL Encryption</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-earth-100 flex items-center gap-3 shadow-sm">
                                        <div className="text-xl md:text-2xl">🌿</div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">100% Natural</p>
                                            <p className="text-xs text-gray-500">Quality Guaranteed</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-earth-100 flex items-center gap-3 shadow-sm">
                                        <div className="text-xl md:text-2xl">🚚</div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">Fast Shipping</p>
                                            <p className="text-xs text-gray-500">Across India</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="font-serif text-lg md:text-xl mb-4 md:mb-6 text-gray-900 border-b pb-4">Order Summary</h3>
                            <div className="space-y-3 md:space-y-4 text-gray-600 mb-6 font-serif text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-herbal-600 font-bold">Free</span> : `₹${shipping}`}</span>
                                </div>
                                {shipping > 0 && <p className="text-[10px] md:text-xs text-herbal-600 bg-herbal-50 p-2 rounded text-center">Add ₹{500 - total} more for free shipping!</p>}
                            </div>
                            <div className="flex justify-between font-bold text-xl md:text-2xl text-herbal-900 mb-6 md:mb-8 pt-4 border-t border-gray-100 font-serif">
                                <span>Total</span>
                                <span>₹{finalTotal}</span>
                            </div>
                            <button
                                disabled={cartItems.length === 0}
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-herbal-800 hover:bg-herbal-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-serif font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg text-base md:text-lg flex justify-center items-center gap-2 group"
                            >
                                <span>Proceed to Checkout</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            <div className="mt-6 flex justify-center gap-3 opacity-80 hover:opacity-100 transition-all duration-500 bg-white p-2 rounded-lg">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 object-contain" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 object-contain" alt="Mastercard" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-6 object-contain" alt="UPI" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-5 object-contain" alt="Razorpay" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
