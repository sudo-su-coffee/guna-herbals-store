'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrdersByUser, getWishlistWithItems, logout, updateProfile, getCurrentUser, deactivateAccount, getSessionsByUser, revokeSession } from '@/lib/api';
import { toast } from 'sonner';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings' | 'security'>('orders');
    const [viewOrder, setViewOrder] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const loadData = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);

            if (userData) {
                const userOrders = await getOrdersByUser(userData.id);
                setOrders(userOrders);

                const { items: wishlistItems } = await getWishlistWithItems(userData.id);
                setWishlistProducts(wishlistItems.map((i: any) => i.product).filter(Boolean));

                const userSessions = await getSessionsByUser(userData.id);
                setSessions(userSessions);

                setName(userData.name || '');
                setEmail(userData.email || '');
            }
        } catch (err) {
            console.error("Profile load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <div className="min-h-screen pt-32 text-center font-serif text-lg">Loading profile...</div>;

    if (!user) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <p className="mb-4">Please log in to view profile.</p>
                <Link href="/login" className="text-herbal-800 underline font-bold">Go to Login</Link>
            </div>
        );
    }

    const myOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const mySessions = []; // Mock session management for now

    const handleLogoutClick = async () => {
        await logout();
        window.location.href = '/';
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(user.id, { name, email });
            toast.success("Profile Updated", { description: "Your personal details have been saved." });
        } catch (err) {
            toast.error("Update Failed", { description: "Could not save changes. Please try again." });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // Skip password update for now as it's OTP based login
        toast.info("Not Available", { description: "Password updates are not supported for OTP-based logins." });
    };

    const handleDeactivate = () => {
        if (confirm("Are you sure you want to deactivate your account? This action cannot be undone immediately and you will be logged out.")) {
            deactivateAccount(user.id);
            router.push('/');
        }
    };

    const terminateSession = async (sessionId: number) => {
        if (confirm("Are you sure you want to terminate this session?")) {
            await revokeSession(sessionId);
            // Refresh sessions
            const userSessions = await getSessionsByUser(user.id);
            setSessions(userSessions);
        }
    };

    // Detailed Order View Component
    if (viewOrder) {
        return (
            <div className="min-h-screen bg-earth-50 pt-28 pb-20 px-4 md:px-8 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => setViewOrder(null)} className="flex items-center gap-2 text-gray-500 hover:text-herbal-800 font-bold mb-6 transition-colors">
                        <span>←</span> Back to Orders
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-earth-200">
                        <div className="bg-herbal-900 text-white p-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-serif font-bold mb-1">Order Details</h2>
                                <p className="text-herbal-200 font-mono text-sm">#{viewOrder.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Order Placed</p>
                                <p className="font-bold">{new Date(viewOrder.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Order Status Tracker */}
                        <div className="p-8 border-b border-gray-100 bg-gray-50">
                            <div className="relative">
                                <div className="h-1 bg-gray-200 rounded-full absolute top-1/2 left-0 w-full -translate-y-1/2"></div>
                                <div
                                    className={`h-1 bg-green-500 rounded-full absolute top-1/2 left-0 -translate-y-1/2 transition-all duration-1000`}
                                    style={{ width: viewOrder.status === 'Delivered' ? '100%' : viewOrder.status === 'Out for Delivery' ? '75%' : viewOrder.status === 'Shipped' ? '50%' : '15%' }}
                                ></div>
                                <div className="flex justify-between relative z-10 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <div className="bg-white px-2">Processing</div>
                                    <div className="bg-white px-2">Shipped</div>
                                    <div className="bg-white px-2">Out</div>
                                    <div className="bg-white px-2">Delivered</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${viewOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    Current Status: {viewOrder.status}
                                </span>
                            </div>
                            {viewOrder.trackingLink && (
                                <div className="mt-4 text-center">
                                    <a href={viewOrder.trackingLink} target="_blank" rel="noopener noreferrer" className="text-herbal-700 hover:text-herbal-900 font-bold underline text-sm">
                                        Track Package ({viewOrder.shipmentDetails?.courier || 'Courier'})
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">Items</h3>
                            <div className="space-y-4 mb-8">
                                {viewOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.product.price}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-900">₹{item.product.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                                <div className="bg-herbal-50 p-4 rounded-xl border border-herbal-100">
                                    <h3 className="font-bold text-sm text-herbal-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span>📍</span> Shipping Address
                                    </h3>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                        <p className="font-bold">{viewOrder.shipping.name}</p>
                                        <p>{viewOrder.shipping.address}</p>
                                        <p>{viewOrder.shipping.city} - {viewOrder.shipping.zip}</p>
                                        <p>{viewOrder.shipping.state}</p>
                                        <p className="mt-2 text-gray-500">Phone: {viewOrder.shipping.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-widest mb-3">Payment Info</h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Method</span>
                                        <span className="font-bold">{viewOrder.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Status</span>
                                        <span className={`font-bold ${viewOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{viewOrder.paymentStatus}</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-300 my-2 pt-2 flex justify-between text-lg font-bold text-herbal-900">
                                        <span>Total Amount</span>
                                        <span>₹{viewOrder.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-50 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 animate-slide-down">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-herbal-900 rounded-full flex items-center justify-center text-2xl text-white font-serif font-bold shadow-lg">
                            {user.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-herbal-900 mb-1">My Account</h1>
                            <p className="text-gray-600 text-sm">Welcome back, {user.name || 'Guest'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogoutClick} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-white rounded-2xl shadow-sm border border-earth-200 overflow-hidden sticky top-28">
                            <nav className="flex flex-col">
                                <button onClick={() => setActiveTab('orders')} className={`text-left px-6 py-4 font-bold text-sm border-l-4 transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'border-herbal-800 bg-herbal-50 text-herbal-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                    <span>📦</span> My Orders
                                </button>
                                <button onClick={() => setActiveTab('wishlist')} className={`text-left px-6 py-4 font-bold text-sm border-l-4 transition-all flex items-center gap-3 ${activeTab === 'wishlist' ? 'border-herbal-800 bg-herbal-50 text-herbal-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                    <span>♥</span> My Wishlist
                                </button>
                                <button onClick={() => setActiveTab('addresses')} className={`text-left px-6 py-4 font-bold text-sm border-l-4 transition-all flex items-center gap-3 ${activeTab === 'addresses' ? 'border-herbal-800 bg-herbal-50 text-herbal-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                    <span>📍</span> Saved Addresses
                                </button>
                                <button onClick={() => setActiveTab('settings')} className={`text-left px-6 py-4 font-bold text-sm border-l-4 transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'border-herbal-800 bg-herbal-50 text-herbal-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                    <span>⚙️</span> Profile Settings
                                </button>
                                <button onClick={() => setActiveTab('security')} className={`text-left px-6 py-4 font-bold text-sm border-l-4 transition-all flex items-center gap-3 ${activeTab === 'security' ? 'border-herbal-800 bg-herbal-50 text-herbal-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                                    <span>🔒</span> Security & Sessions
                                </button>
                            </nav>
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Need Help?</p>
                                <p className="text-sm text-gray-600 mb-2">Contact our support team.</p>
                                <Link href="/enquiry" className="text-herbal-700 text-xs font-bold underline">Submit Enquiry</Link>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold font-serif text-gray-800 mb-4">Order History</h2>
                                {myOrders.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
                                        <div className="text-4xl mb-4">🛒</div>
                                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                                        <Link href="/shop" className="bg-herbal-800 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-herbal-900 transition-all inline-block">Start Shopping</Link>
                                    </div>
                                ) : (
                                    myOrders.map(order => (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Placed On</p>
                                                    <p className="text-sm font-bold text-gray-800">{new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</p>
                                                    <p className="text-sm font-bold text-gray-900">₹{order.total}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Order #</p>
                                                    <p className="text-sm font-mono text-gray-600">{order.id}</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <button onClick={() => setViewOrder(order)} className="text-white bg-herbal-800 font-bold text-xs px-4 py-2 rounded-lg hover:bg-herbal-900 transition-colors shadow-sm">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="flex-grow space-y-3 w-full">
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="flex gap-4 items-center">
                                                            <img src={item.product.image} className="w-12 h-12 rounded-md object-cover border border-gray-100" alt="" />
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-800">{item.product.name}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && <p className="text-xs text-gray-400 italic">+ {order.items.length - 2} more items</p>}
                                                </div>
                                                <div className="w-full md:w-auto flex-shrink-0">
                                                    <div className={`px-4 py-2 rounded-lg border text-center ${order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                                                        order.status === 'Processing' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                            order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                                                        }`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">Status</p>
                                                        <p className="font-bold text-sm">{order.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold font-serif text-gray-800 mb-4">My Wishlist ({wishlistProducts.length})</h2>
                                {wishlistProducts.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
                                        <div className="text-4xl mb-4">♥</div>
                                        <p className="text-gray-500 mb-6">Your wishlist is empty.</p>
                                        <Link href="/shop" className="bg-herbal-800 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-herbal-900 transition-all inline-block">Explore Shop</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlistProducts.map(product => (
                                            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                                                    <button
                                                        onClick={() => toggleWishlist(user.id, product.id)}
                                                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                                                    <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-herbal-900">₹{product.price}</span>
                                                        <button
                                                            onClick={() => addToCart(user.id, product.id)}
                                                            className="text-xs bg-herbal-100 text-herbal-800 font-bold px-3 py-1.5 rounded hover:bg-herbal-200 transition-colors"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold font-serif text-gray-800">Saved Addresses</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user.addresses && user.addresses.map((addr, idx) => {
                                        const usedCount = myOrders.filter(o => o.shipping.address === addr.address && o.shipping.zip === addr.zip).length;
                                        return (
                                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group hover:border-herbal-300 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 bg-herbal-50 rounded-full flex items-center justify-center text-herbal-600">
                                                        📍
                                                    </div>
                                                    <button
                                                        onClick={() => { if (confirm('Are you sure you want to delete this address?')) deleteCustomerAddress(addr.id); }}
                                                        className="text-red-300 hover:text-red-500 transition-colors p-1"
                                                        title="Delete Address"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="font-bold text-gray-900 mb-2">{addr.name}</p>
                                                <p className="text-sm text-gray-600 mb-1">{addr.address}</p>
                                                <p className="text-sm text-gray-600 mb-4">{addr.city}, {addr.state} - {addr.zip}</p>

                                                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                                    <div className="inline-block text-xs font-mono text-gray-500">
                                                        📞 {addr.phone}
                                                    </div>
                                                    {usedCount > 0 && (
                                                        <span className="text-[10px] bg-herbal-100 text-herbal-800 px-2 py-1 rounded-full font-bold">
                                                            Used in {usedCount} orders
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!user.addresses || user.addresses.length === 0) && (
                                        <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                                            No addresses saved yet. They will be saved automatically when you place an order.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold font-serif text-gray-800 mb-4">Profile Settings</h2>

                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black" />
                                        </div>
                                        <div className="text-right">
                                            <button type="submit" className="bg-herbal-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-herbal-900 transition-colors">Update Profile</button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-black" placeholder="Enter new password" />
                                        </div>
                                        <div className="text-right">
                                            <button type="submit" className="bg-herbal-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-herbal-900 transition-colors">Update Password</button>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
                                    <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
                                    <p className="text-sm text-red-600 mb-6">Deactivating your account will disable your access and remove your data from public view.</p>
                                    <button onClick={handleDeactivate} className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors w-full sm:w-auto">
                                        Deactivate Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold font-serif text-gray-800 mb-4">Security & Sessions</h2>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                                        <h3 className="font-bold text-gray-800">Active Sessions</h3>
                                        <p className="text-xs text-gray-500">Devices logged into your account.</p>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {sessions.map((session) => (
                                            <div key={session.id} className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${session.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {session.userAgent?.includes('Mobi') ? '📱' : '💻'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800 line-clamp-1 max-w-[200px]" title={session.userAgent || 'Unknown Device'}>
                                                            {session.userAgent || 'Unknown Device'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            IP: {session.ipAddress || 'Unknown'} • {new Date(session.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {session.isActive ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                                                            <button
                                                                onClick={() => terminateSession(session.id)}
                                                                className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                                                            >
                                                                Revoke
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Terminated / Expired</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {sessions.length === 0 && (
                                            <div className="p-8 text-center text-gray-500 italic">No session history found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
