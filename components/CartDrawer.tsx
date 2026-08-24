'use client';

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartDrawer() {
    const { isCartOpen, closeCart, items, removeItem, updateQuantity, cartTotal } = useCart();
    const router = useRouter();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={closeCart}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-[#FAFAF5] h-full shadow-2xl flex flex-col animate-slide-left border-l border-herbal-100">
                <div className="p-6 border-b border-herbal-100 flex justify-between items-center bg-white/50 backdrop-blur">
                    <h2 className="text-2xl font-serif text-herbal-900 font-bold">Your Cart</h2>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-herbal-50 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                            <span className="text-6xl mb-4 opacity-50">🛒</span>
                            <p className="font-serif text-lg">Your cart is empty.</p>
                            <button
                                onClick={closeCart}
                                className="mt-4 text-herbal-800 font-bold uppercase tracking-widest text-xs hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                                <div className="w-20 h-24 bg-white rounded-lg border border-herbal-100 overflow-hidden flex-shrink-0 relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-serif font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-serif font-bold text-herbal-900">₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 bg-white border-t border-herbal-100 space-y-4">
                        <div className="flex justify-between items-center text-lg font-serif font-bold text-herbal-900">
                            <span>Subtotal</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <p className="text-xs text-gray-400 text-center">Shipping & taxes calculated at checkout</p>
                        <button
                            onClick={() => { closeCart(); router.push('/checkout'); }}
                            className="w-full bg-herbal-900 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            Checkout
                        </button>
                        <button
                            onClick={() => { closeCart(); router.push('/cart'); }}
                            className="w-full text-center text-xs font-bold uppercase tracking-widest text-herbal-800 hover:underline"
                        >
                            View Cart Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
