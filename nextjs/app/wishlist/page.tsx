'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getWishlist, removeFromWishlist, addToCart as apiAddToCart, getCurrentUser } from '@/lib/api';
import { ProductWithDetails } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function Wishlist() {
    const router = useRouter();
    const [wishlistItems, setWishlistItems] = useState<ProductWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    const loadWishlist = async () => {
        try {
            const userRes = await getCurrentUser();
            if (!userRes.success || !userRes.data) {
                setLoading(false);
                return;
            }
            setUserId(userRes.data.id);

            const wishlistRes = await getWishlist();
            if (wishlistRes.success && wishlistRes.data) {
                const products = wishlistRes.data.map((item: any) => {
                    const product = item.product;
                    if (!product) return null;
                    return {
                        product: product,
                        brand: product.brand,
                        category: product.category,
                        images: product.images,
                        variants: product.variants,
                        // Compatibility fields if needed by ProductCard
                        price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price.toString()) : 0,
                        image: product.images?.[0]?.imageUrl || '',
                    };
                }).filter(Boolean) as any[];
                setWishlistItems(products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, []);

    const handleRemove = async (productId: number | string) => {
        const res = await removeFromWishlist(Number(productId));
        if (res.success) {
            setWishlistItems(prev => prev.filter(p => (p.product?.id || p.id) !== Number(productId)));
        } else {
            alert(res.error || "Failed to remove from wishlist");
        }
    };

    const handleAddToCart = async (productWithDetails: any) => {
        if (!userId) {
            router.push('/login');
            return;
        }
        const variants = productWithDetails.product?.variants || productWithDetails.variants || [];
        const variantId = variants[0]?.id;
        if (variantId) {
            const res = await apiAddToCart(variantId, 1);
            if (res.success) alert("Added to cart");
            else alert(res.error || "Failed to add to cart");
        } else {
            alert("Product currently unavailable");
        }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center">Loading Wishlist...</div>;

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-earth-50 pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6 text-4xl text-pink-500">
                    ❤️
                </div>
                <h2 className="text-3xl font-serif font-bold text-herbal-900 mb-4">Your Wishlist is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-md font-light">Save your favorite herbal treasures here to purchase later.</p>
                <Link href="/shop" className="bg-herbal-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg hover:shadow-xl">
                    Explore Products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-50 pt-20 md:pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-5xl font-serif text-herbal-950 mb-4">My Wishlist</h1>
                    <p className="text-gray-500 font-sans tracking-wide">{wishlistItems.length} Items Saved</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {wishlistItems.map(product => {
                        return (
                            <div key={product.id} className="relative group">
                                <ProductCard
                                    product={product}
                                    onAddToCart={() => handleAddToCart(product)}
                                />
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full shadow-sm hover:bg-red-50 transition-all z-20 group-hover:opacity-100 opacity-0 md:opacity-0"
                                    title="Remove from Wishlist"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
