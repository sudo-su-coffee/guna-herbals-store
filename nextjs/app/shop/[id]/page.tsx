'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductWithDetails } from '@/lib/types';
import { getProductById, getReviewsByProduct, addToCart as apiAddToCart, getCurrentUser } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: idString } = use(params);
    const productId = parseInt(idString, 10);

    const [product, setProduct] = useState<ProductWithDetails | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        async function loadProduct() {
            if (isNaN(productId)) return;
            try {
                const userRes = await getCurrentUser();
                if (userRes.success && userRes.data) setUserId(userRes.data.id);

                const pRes = await getProductById(productId);
                if (pRes.success && pRes.data) {
                    setProduct(pRes.data);
                    const rRes = await getReviewsByProduct(productId);
                    if (rRes.success) setReviews(rRes.data || []);
                }
            } catch (error) {
                console.error("Error loading product", error);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [productId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [product]);

    if (loading) {
        return <div className="min-h-screen pt-32 text-center">Loading...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-32 pb-20 text-center">
                <h2 className="text-2xl font-serif">Product Not Found</h2>
                <Link href="/shop" className="text-herbal-800 underline mt-4 block">Return to Shop</Link>
            </div>
        )
    }

    // Extract Display Data from Relations
    const variants = product.variants || [];
    const images = product.images || [];
    const primaryVariant = variants[0];

    // Price Logic
    const price = primaryVariant?.price ? parseFloat(primaryVariant.price.toString()) : 0;
    const mrp = primaryVariant?.costPrice ? parseFloat(primaryVariant.costPrice.toString()) : 0;
    const hasPrice = price > 0;

    // Image Logic
    // If no images, use placeholder
    const galleryImages = images.length > 0 ? images.map(img => img.imageUrl || '') : ['/placeholder.jpg'];
    const displayCategory = product.category?.name || 'Veda';

    const handleAddToCart = async () => {
        if (!userId) {
            router.push('/login');
            return;
        }
        if (primaryVariant?.id) {
            const res = await apiAddToCart(primaryVariant.id, 1 ,1);
            if (res.success) alert("Added to Cart!");
            else alert(res.error || "Failed to add to cart");
        }
    };

    return (
        <div className="w-full min-h-screen bg-herbal-50 pt-20 md:pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                <div className="flex text-[10px] md:text-xs text-gray-500 font-sans uppercase tracking-widest mb-6 md:mb-12 flex-wrap">
                    <Link href="/shop" className="hover:text-herbal-900 transition-colors">Shop</Link>
                    <span className="mx-2 md:mx-3">/</span>
                    <Link href={`/shop?category=${encodeURIComponent(displayCategory)}`} className="hover:text-herbal-900 transition-colors">{displayCategory}</Link>
                    <span className="mx-2 md:mx-3">/</span>
                    <span className="text-gray-900 truncate max-w-[150px] md:max-w-none">{product.product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-16 md:mb-24">
                    <div className="flex flex-col gap-4 md:gap-6">
                        <div className="aspect-[3/4] bg-[#FAFAF5] w-full overflow-hidden shadow-sm rounded-xl">
                            <img
                                src={galleryImages[activeImageIndex]}
                                alt={product.product.name}
                                className="w-full h-full object-cover transition-all duration-700 hover:scale-105 cursor-zoom-in"
                            />
                        </div>
                        {galleryImages.length > 1 && (
                            <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative flex-shrink-0 w-16 md:w-20 aspect-square overflow-hidden transition-all bg-[#FAFAF5] border rounded-lg ${activeImageIndex === idx
                                            ? 'opacity-100 ring-1 ring-herbal-900 border-herbal-900'
                                            : 'opacity-60 hover:opacity-100 border-herbal-200'
                                            }`}
                                    >
                                        <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col py-2 md:py-4">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-herbal-950 mb-4 md:mb-6 leading-tight">
                            {product.product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                            <div className="flex text-herbal-600 text-sm">★★★★★</div>
                            <span className="text-xs text-gray-400 font-sans uppercase tracking-widest">{reviews.length} Reviews</span>
                        </div>
                        <div className="flex items-baseline gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-herbal-200">
                            {hasPrice ? (
                                <>
                                    <span className="text-2xl md:text-3xl font-serif text-herbal-900">₹{price}</span>
                                    {mrp > price && (
                                        <span className="text-base md:text-lg text-gray-400 line-through decoration-1">₹{mrp}</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-lg md:text-xl font-sans text-gray-400 uppercase tracking-widest">Coming Soon</span>
                            )}
                        </div>

                        <div className="text-gray-700 font-serif mb-8 md:mb-10 text-base md:text-lg leading-relaxed max-w-md">
                            {product.product.description}
                        </div>

                        <div className="flex flex-col gap-6 mt-auto">
                            {primaryVariant?.weight && (
                                <div className="flex items-center justify-between py-4 border-t border-herbal-200 max-w-md">
                                    <span className="text-gray-500 font-sans text-xs uppercase tracking-widest">Weight</span>
                                    <span className="text-gray-900 font-serif">{primaryVariant.weight}g</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-3 max-w-md sticky bottom-0 bg-herbal-50 py-4 md:static md:py-0 z-30">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!hasPrice}
                                    className={`w-full py-3 md:py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border border-herbal-900 rounded-lg md:rounded-none shadow-lg md:shadow-none ${hasPrice ? 'bg-herbal-50 text-herbal-900 hover:bg-herbal-900 hover:text-white' : 'bg-herbal-100 text-gray-400 border-herbal-200 cursor-not-allowed'}`}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={async () => {
                                        if (hasPrice) {
                                            await handleAddToCart();
                                            router.push('/checkout');
                                        }
                                    }}
                                    disabled={!hasPrice}
                                    className={`w-full py-3 md:py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg md:rounded-none ${hasPrice ? 'bg-herbal-900 text-white hover:bg-black' : 'hidden'}`}
                                >
                                    Buy Now
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-2 md:mt-4 text-[10px] text-gray-500 uppercase tracking-widest">
                                <span>Ships in 2-3 Days</span>
                                <span>•</span>
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mb-20 md:mb-32 bg-[#FAFAF5]/80 p-6 md:p-12 rounded-2xl border border-herbal-100">
                    <div className="text-center font-serif text-gray-500">
                        {/* 
                          We can add extended details here using similar Tabs logic if field exists.
                          For now, using description as main content.
                        */}
                        <h3 className="text-lg font-bold mb-4">Product Details</h3>
                        <p>{product.product.description}</p>
                    </div>
                </div>

                <div className="border-t border-herbal-200 pt-12 md:pt-20 max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-serif text-herbal-900 mb-8 md:mb-12 text-center">Reviews</h2>
                    <div className="space-y-8 md:space-y-12">
                        {reviews.length === 0 ? (
                            <p className="text-center text-gray-500 font-serif">No reviews yet.</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className="flex gap-4 md:gap-6 pb-8 md:pb-12 border-b border-herbal-100 last:border-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-herbal-200 flex items-center justify-center text-herbal-900 font-serif text-lg flex-shrink-0">
                                        {(review.userId || 'A').toString().charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-serif text-base md:text-lg text-gray-900">User {review.userId}</p>
                                            <span className="text-[10px] md:text-xs text-gray-400 font-sans">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex text-herbal-600 text-xs mb-2 md:mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                        <p className="text-gray-600 font-serif leading-relaxed italic text-sm md:text-base">"{review.comment}"</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
