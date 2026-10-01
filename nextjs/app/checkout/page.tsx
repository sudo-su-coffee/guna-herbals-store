'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';
import { getCart, createOrder, verifyPayment, clearCart, getCurrentUser, getUserAddresses, createAddress } from '@/lib/api';
import { SITE_CONFIG } from '@/lib/constants';
import { ShippingDetails } from '@/lib/types';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    }
}

async function loadRazorpayScript() {
    if (window.Razorpay) return true;
    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
        document.body.appendChild(script);
    });
    return Boolean(window.Razorpay);
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = 7000): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
    ]);
}

export default function Checkout() {
    const router = useRouter();
    const { items: cartItems } = useCart();
    const [cart, setCart] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [generatedOrder, setGeneratedOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'PayU' | 'COD'>('Razorpay');
    const [addresses, setAddresses] = useState<any[]>([]);

    const [details, setDetails] = useState<ShippingDetails>({
        name: '', phone: '', email: '', address: '', city: '', state: '', zip: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const userRes = await withTimeout(getCurrentUser(), { success: false, data: null } as any);
                if (userRes.success && userRes.data) {
                    const user = userRes.data;
                    setCurrentUser(user);
                    setDetails(prev => ({
                        ...prev,
                        name: user.name || prev.name,
                        email: user.email || prev.email,
                        phone: user.phone || prev.phone
                    }));

                    // CartContext already contains the authenticated Neon cart and keeps it synchronized.
                    // Addresses are loaded on demand during order placement to keep checkout resilient.
                    setAddresses([]);
                } else {
                    router.push('/login?redirect=/checkout');
                }
            } catch (err) {
                console.error("Load checkout error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [router]);

    useEffect(() => {
        setCart(cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceAtTime: item.price,
            variant: {
                id: item.variantId,
                price: item.price,
                product: {
                    name: item.name,
                    images: item.image ? [{ imageUrl: item.image }] : []
                }
            }
        })));
    }, [cartItems]);

    // Calculations
    const subtotal = cart.reduce((sum, item) => {
        const price = item.variant?.price ? parseFloat(item.variant.price.toString()) : 0;
        return sum + (price * item.quantity);
    }, 0);
    const shipping = subtotal > SITE_CONFIG.shipping.freeShippingThreshold ? 0 : SITE_CONFIG.shipping.standardRate;
    const codCharge = paymentMethod === 'COD' ? SITE_CONFIG.payments.codExtraCharge : 0;
    const finalTotal = subtotal + shipping + codCharge;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const fillAddress = (addr: ShippingDetails) => {
        setDetails(addr);
    };

    const handlePayment = async () => {
        if (!details.name || !details.phone || !details.address) {
            toast.error("Missing Details", {
                description: "Please fill in your Name, WhatsApp Number, and Address."
            });
            return;
        }

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Ensure we have an address in the DB
            let shippingAddressId: number;

            // Check if current details match any saved address
            const existingAddr = addresses.find(a =>
                a.addressLine1 === details.address &&
                a.city === details.city &&
                a.postalCode === details.zip
            );

            if (existingAddr) {
                shippingAddressId = existingAddr.id;
            } else {
                const newAddrRes = await createAddress(currentUser.id, {
                    userId: currentUser.id,
                    type: 'shipping',
                    name: details.name,
                    phone: details.phone,
                    addressLine1: details.address,
                    city: details.city,
                    state: details.state,
                    postalCode: details.zip,
                    country: 'India',
                    isDefault: addresses.length === 0
                });
                if (!newAddrRes.success || !newAddrRes.data) {
                    throw new Error(newAddrRes.error || "Failed to save address");
                }
                shippingAddressId = newAddrRes.data.id;
            }

            // 2. Create the order
            const orderRes = await createOrder({
                shippingAddressId,
                billingAddressId: shippingAddressId, // Simplified for now
                paymentMethod: paymentMethod.toLowerCase(),
                notes: "Direct checkout from website"
            });

            if (orderRes.success && orderRes.data) {
                const createdOrder = orderRes.data;
                if (paymentMethod === 'Razorpay') {
                    if (!createdOrder.payment) throw new Error('Razorpay payment order was not created');
                    const loaded = await loadRazorpayScript();
                    if (!loaded || !window.Razorpay) throw new Error('Razorpay Checkout is unavailable');

                    await new Promise<void>((resolve, reject) => {
                        const checkout = new window.Razorpay!({
                            key: createdOrder.payment.key,
                            amount: createdOrder.payment.amount,
                            currency: createdOrder.payment.currency,
                            name: SITE_CONFIG.name,
                            description: 'Guna Herbals order',
                            order_id: createdOrder.payment.id,
                            prefill: { name: details.name, email: details.email, contact: details.phone },
                            notes: { orderId: String(createdOrder.orderId) },
                            theme: { color: '#315b45' },
                            handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                                try {
                                    const verification = await verifyPayment(response);
                                    if (!verification.success) throw new Error(verification.error || 'Payment verification failed');
                                    resolve();
                                } catch (error) {
                                    reject(error);
                                }
                            },
                            modal: { ondismiss: () => reject(new Error('Payment was cancelled')) }
                        });
                        checkout.open();
                    });
                }

                await clearCart();
                setGeneratedOrder({
                    ...createdOrder,
                    id: `ORD-${createdOrder.orderId}`,
                    paymentMethod,
                    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
                    total: finalTotal
                });
                setOrderComplete(true);
            } else {
                throw new Error(orderRes.error || "Failed to create order");
            }
        } catch (err: any) {
            console.error("Order creation error:", err);
            toast.error("Order Failed", {
                description: err.message || "Please try again."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center font-serif text-lg">Preparing checkout...</div>;

    const downloadPDFReceipt = () => {
        if (!generatedOrder?.orderId) return;
        window.location.href = `/api/orders/${generatedOrder.orderId}/receipt`;
    };

    const shareOrderOnWhatsApp = () => {
        if (!generatedOrder?.orderId) return;
        const trackingUrl = `${window.location.origin}/track-order?order=${encodeURIComponent(generatedOrder.id)}`;
        const message = `My Guna's Herbals order ${generatedOrder.id} is confirmed. Track it here: ${trackingUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    };

    if (cart.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen bg-earth-50 pt-32 text-center">
                <p className="mb-4">Your cart is empty.</p>
                <Link href="/shop" className="text-herbal-800 underline font-bold">Go Shopping</Link>
            </div>
        );
    }

    if (orderComplete && generatedOrder) {
        return (
            <div className="min-h-screen bg-earth-100 flex items-center justify-center pt-24 pb-12 px-4 font-serif">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border border-herbal-100 relative overflow-hidden animate-slide-up">
                    <div className={`absolute top-0 left-0 w-full h-2 ${generatedOrder.paymentMethod === 'COD' ? 'bg-orange-500' : 'bg-herbal-500'}`}></div>
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 relative ${generatedOrder.paymentMethod === 'COD' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                        <Icon name={generatedOrder.paymentMethod === 'COD' ? 'package' : 'shield'} size={44} />
                        <div className={`absolute -bottom-2 -right-2 text-white rounded-full p-1.5 border-2 border-white ${generatedOrder.paymentMethod === 'COD' ? 'bg-orange-500' : 'bg-green-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-600 mb-2">{generatedOrder.paymentMethod === 'COD' ? 'Pay upon delivery' : 'Payment Successful'}</p>
                    <p className="font-mono bg-gray-100 inline-block px-3 py-1 rounded text-sm text-gray-700 mb-8">{generatedOrder.id}</p>
                    <div className="space-y-4">
                        <button onClick={downloadPDFReceipt} className="w-full bg-herbal-800 hover:bg-herbal-900 text-white font-bold py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg">
                            <Icon name="scroll" size={17} /> Download Order Summary
                        </button>
                        <button onClick={() => router.push(`/track-order?order=${encodeURIComponent(generatedOrder.id)}`)} className="w-full bg-white border-2 border-herbal-100 text-herbal-800 font-bold py-3.5 rounded-lg hover:bg-herbal-50 transition-all">
                            Track This Order
                        </button>
                        <button onClick={shareOrderOnWhatsApp} className="w-full bg-[#128C7E] text-white font-bold py-3.5 rounded-lg hover:bg-[#075E54] transition-all">
                            Share Tracking on WhatsApp
                        </button>
                        <button onClick={() => router.push('/')} className="w-full text-gray-500 font-bold py-2 rounded-lg hover:text-gray-700 transition-all text-sm">
                            Return Home
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-gray-400">A confirmation email has been sent to {details.email}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-100 py-8 px-4 pt-24 md:pt-32 font-serif">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6 md:mb-8 text-sm text-gray-500 font-medium">
                    <button onClick={() => router.push('/cart')} className="hover:text-herbal-800 hover:underline">Cart</button>
                    <span className="text-gray-300">/</span>
                    <span className="font-bold text-gray-900">Checkout</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-herbal-900 mb-2">Secure Checkout</h1>
                            <p className="text-sm md:text-base text-gray-600">Please provide your delivery details.</p>
                        </div>

                        {/* Shipping Details Form */}
                        <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg md:text-xl mb-6 flex items-center gap-3 text-gray-800 border-b border-gray-100 pb-4">
                                <span className="bg-herbal-100 p-2 rounded-lg text-herbal-800"><Icon name="store" size={20} /></span> Delivery Address
                            </h3>

                            {/* Saved Addresses for Logged In Users */}
                            {addresses.length > 0 && (
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Saved Addresses</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr, idx) => {
                                            const normalizedAddr = {
                                                name: addr.name || '',
                                                phone: addr.phone || '',
                                                email: currentUser?.email || '',
                                                address: addr.addressLine1,
                                                city: addr.city,
                                                state: addr.state,
                                                zip: addr.postalCode
                                            };
                                            const isSelected = details.address === addr.addressLine1 && details.zip === addr.postalCode;
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => fillAddress(normalizedAddr)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${isSelected ? 'border-herbal-600 bg-herbal-50 shadow-md' : 'border-gray-200 hover:border-herbal-300 bg-white'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{addr.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{addr.addressLine1}, {addr.city} - {addr.postalCode}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-herbal-600' : 'border-gray-300'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-herbal-600 rounded-full"></div>}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-[10px] text-gray-400 font-mono">
                                                        {addr.phone}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button
                                            onClick={() => setDetails({ name: '', phone: '', email: '', address: '', city: '', state: '', zip: '' })}
                                            className="p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-bold flex flex-col items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors h-full min-h-[100px]"
                                        >
                                            <Icon name="plus" size={22} className="mb-1" />
                                            <span>Add New Address</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 md:space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                                        <input name="name" value={details.name} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none transition-all placeholder-gray-400 text-black text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">WhatsApp Number</label>
                                        <input name="phone" type="tel" value={details.phone} onChange={handleInputChange} placeholder="e.g. 98765 43210" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none transition-all placeholder-gray-400 text-black text-sm md:text-base" />
                                        <p className="text-[10px] text-gray-400 mt-1">For order tracking updates via WhatsApp.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address <span className="font-normal normal-case text-gray-400">(Optional)</span></label>
                                    <input name="email" type="email" value={details.email} onChange={handleInputChange} placeholder="name@example.com" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none transition-all placeholder-gray-400 text-black text-sm md:text-base" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                                    <textarea name="address" rows={2} value={details.address} onChange={handleInputChange} placeholder="House No, Building, Street Area..." className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none transition-all resize-none placeholder-gray-400 text-black text-sm md:text-base" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                                        <input name="city" value={details.city} onChange={handleInputChange} placeholder="City" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none text-black text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                                        <input name="state" value={details.state} onChange={handleInputChange} placeholder="State" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none text-black text-sm md:text-base" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                                        <input name="zip" value={details.zip} onChange={handleInputChange} placeholder="6 digits" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-herbal-500 outline-none text-black text-sm md:text-base" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-lg md:text-xl mb-6 flex items-center gap-3 text-gray-800 border-b border-gray-100 pb-4">
                                <span className="bg-herbal-100 p-2 rounded-lg text-herbal-800"><Icon name="credit-card" size={20} /></span> Payment Method
                            </h3>
                            <div className="space-y-4">

                                {/* Razorpay */}
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-herbal-600 bg-herbal-50' : 'border-gray-200 hover:border-herbal-200'}`}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} className="w-5 h-5 text-herbal-600 focus:ring-herbal-500" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800 text-sm md:text-base">Razorpay (Cards, UPI)</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">Trusted by millions. Instant confirmation.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-3 md:h-4" alt="UPI" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-3 md:h-4" alt="Razorpay" />
                                    </div>
                                </label>

                                {/* PayU */}
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'PayU' ? 'border-herbal-600 bg-herbal-50' : 'border-gray-200 hover:border-herbal-200'}`}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'PayU'} onChange={() => setPaymentMethod('PayU')} className="w-5 h-5 text-herbal-600 focus:ring-herbal-500" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800 text-sm md:text-base">PayU Money</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">Credit/Debit Cards, Wallets, UPI.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/PayU.svg" className="h-3 md:h-4" alt="PayU" />
                                    </div>
                                </label>

                                {/* COD */}
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-herbal-600 bg-herbal-50' : 'border-gray-200 hover:border-herbal-200'}`}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-herbal-600 focus:ring-herbal-500" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800 text-sm md:text-base">Cash on Delivery (COD)</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">Pay with cash when you receive the order.</p>
                                    </div>
                                    {SITE_CONFIG.payments.codExtraCharge > 0 && (
                                        <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                            +₹{SITE_CONFIG.payments.codExtraCharge} Fee
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xl">🔒</span>
                            <p>Your personal information is encrypted and secure.</p>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-herbal-100 sticky top-24 relative overflow-hidden">
                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                                    <div className="w-16 h-16 border-4 border-herbal-200 border-t-herbal-800 rounded-full animate-spin mb-4"></div>
                                    <h3 className="font-bold text-lg text-herbal-900">Processing Order</h3>
                                    <p className="text-sm text-gray-500">
                                        {paymentMethod === 'Razorpay' ? 'Connecting to Razorpay...' :
                                            paymentMethod === 'PayU' ? 'Redirecting to PayU...' :
                                                'Confirming your order...'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">Please do not close this window.</p>
                                </div>
                            )}
                            <h3 className="font-bold text-lg mb-4 pb-4 border-b border-gray-100 text-gray-800 flex justify-between items-center">
                                Order Summary
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
                            </h3>
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map(item => {
                                    const variant = item.variant;
                                    const product = variant?.product || item.product;
                                    const image = product?.images?.[0]?.imageUrl || '/placeholder.jpg';
                                    const price = item.priceAtTime ? parseFloat(item.priceAtTime.toString()) : (variant?.price ? parseFloat(variant.price.toString()) : 0);

                                    return (
                                        <div key={item.id} className="flex gap-3 text-sm">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <p className="font-bold text-gray-800 line-clamp-1 w-3/4">{product?.name || 'Unknown'}</p>
                                                    <span className="font-bold text-gray-900">₹{price * item.quantity}</span>
                                                </div>
                                                <p className="text-gray-500 text-xs">Qty: {item.quantity} x ₹{price}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-3 pt-4 border-t border-dashed border-gray-200 text-gray-600 text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                {codCharge > 0 && (
                                    <div className="flex justify-between text-orange-700">
                                        <span>COD Fee</span>
                                        <span>₹{codCharge}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 pb-2">
                                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold text-herbal-800">₹{finalTotal}</span>
                            </div>
                            <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-6 bg-herbal-800 hover:bg-herbal-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95 border-b-4 border-herbal-900 active:border-0 active:mt-7 text-sm md:text-base">
                                <span>{paymentMethod === 'COD' ? 'Place Order' : 'Pay Securely'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                            </button>
                            {paymentMethod !== 'COD' && (
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-gray-400 mb-2">Processed by {paymentMethod}</p>
                                    <div className="flex justify-center items-center gap-3 opacity-80 transition-all bg-gray-50 p-2 rounded-lg">
                                        {paymentMethod === 'Razorpay' ? (
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-5 object-contain" alt="Razorpay" />
                                        ) : (
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/PayU.svg" className="h-5 object-contain" alt="PayU" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
