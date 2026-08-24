'use client';

import React, { useState } from 'react';
import { ProductWithDetails } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface QuickViewModalProps {
    product: ProductWithDetails | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const router = useRouter();
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const primaryVariant = product.variants?.[0];
    const price = primaryVariant?.price ? parseFloat(primaryVariant.price.toString()) : 0;
    const mrp = primaryVariant?.costPrice ? parseFloat(primaryVariant.costPrice.toString()) : 0;
    const image = product.images?.find(img => img.isPrimary)?.imageUrl || '/placeholder.jpg';

    const handleAddToCart = async () => {
        if (primaryVariant) {
            await addItem(product, quantity, primaryVariant.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-[#FAFAF5] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col md:flex-row max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/50 p-2 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Image Side */}
                <div className="w-full md:w-1/2 bg-white relative">
                    <img
                        src={image}
                        alt={product.product.name}
                        className="w-full h-full object-cover max-h-[400px] md:max-h-full"
                    />
                    {price > 0 && mrp > price && (
                        <div className="absolute top-4 left-4 bg-herbal-900 text-white text-xs font-bold px-3 py-1 rounded-br-lg uppercase tracking-widest">
                            {Math.round(((mrp - price) / mrp) * 100)}% OFF
                        </div>
                    )}
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-herbal-600 text-xs font-bold uppercase tracking-widest">{product.category?.name}</span>
                        <h2 className="text-3xl font-serif text-herbal-900 mt-2 mb-4 leading-tight">{product.product.name}</h2>
                        <div className="flex items-baseline gap-4 mb-4 pb-4 border-b border-herbal-100">
                            <span className="text-2xl font-serif text-herbal-900 font-bold">₹{price}</span>
                            {mrp > price && <span className="text-gray-400 line-through text-sm">₹{mrp}</span>}
                        </div>
                        <p className="text-gray-600 leading-relaxed font-serif text-sm md:text-base">
                            {product.product.description}
                        </p>
                    </div>

                    <div className="space-y-6 mt-auto">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Quantity</span>
                            <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600">-</button>
                                <span className="w-10 text-center font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50 text-gray-600">+</button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={price === 0}
                                className="flex-1 bg-herbal-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {price > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button
                                onClick={() => { onClose(); router.push(`/shop/${product.product.id}`); }}
                                className="px-6 border border-herbal-200 text-herbal-900 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-herbal-50 transition-all"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
