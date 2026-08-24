'use client';

import React from 'react';
import { ProductWithDetails } from '@/lib/types';

export interface ProductCardProps {
    product: ProductWithDetails;
    isWishlisted?: boolean;
    onAddToCart?: (product: ProductWithDetails) => void;
    onViewDetails?: (product: ProductWithDetails) => void;
    onQuickView?: (product: ProductWithDetails) => void;
    onToggleWishlist?: (product: ProductWithDetails) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isWishlisted = false,
    onAddToCart = () => { },
    onViewDetails = () => { },
    onQuickView = () => { },
    onToggleWishlist = () => { }
}) => {

    const primaryVariant = product.variants?.[0];
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

    // Parse price safely (it's a string/numeric in DB)
    const price = primaryVariant?.price ? parseFloat(primaryVariant.price.toString()) : 0;
    const mrp = primaryVariant?.costPrice ? parseFloat(primaryVariant.costPrice.toString()) : 0;

    const discount = (price > 0 && mrp > price)
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0;

    const hasPrice = price > 0;
    const imageUrl = primaryImage?.imageUrl || '/placeholder.jpg';
    const categoryName = product.category?.name || 'Veda';

    return (
        <div
            className="group cursor-pointer flex flex-col h-full bg-[#FAFAF5] transition-all duration-500 hover:shadow-xl border border-earth-100 hover:border-herbal-200 rounded-xl md:rounded-2xl overflow-hidden relative"
        >
            {/* Image Container */}
            <div
                onClick={() => onViewDetails(product)}
                className="relative aspect-[3/4] overflow-hidden bg-earth-100 w-full mb-0"
            >
                <img
                    src={imageUrl}
                    alt={product.product.name}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110 opacity-95 group-hover:opacity-100"
                    loading="lazy"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-0 left-0 bg-herbal-900 text-white text-[9px] md:text-[10px] font-sans font-medium px-2 py-1 md:px-3 md:py-1 uppercase tracking-widest z-10 rounded-br-lg">
                        {discount}% OFF
                    </div>
                )}

                {/* Buttons Overlay */}
                <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 z-20">
                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                        className={`p-2 rounded-full transition-all shadow-md transform hover:scale-110 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                        title="Add to Wishlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>

                    {/* Quick View Button - Desktop Only */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                        className="bg-white/90 backdrop-blur-sm text-black p-2.5 rounded-full hover:bg-herbal-900 hover:text-white transition-all shadow-md hidden md:block opacity-0 group-hover:opacity-100 transform translate-x-10 group-hover:translate-x-0 duration-300 delay-75"
                        title="Quick View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Action Overlay (Desktop Only) */}
                <div className="hidden md:flex absolute inset-0 bg-herbal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); if (hasPrice) onAddToCart(product); }}
                        disabled={!hasPrice}
                        className={`w-full text-xs uppercase tracking-widest font-bold py-3 rounded-xl transition-colors ${hasPrice ? 'bg-white text-herbal-900 hover:bg-herbal-900 hover:text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {hasPrice ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow text-center px-3 py-4 md:px-4 md:py-6" onClick={() => onViewDetails(product)}>
                <p className="text-[9px] md:text-[10px] text-herbal-600 uppercase tracking-widest mb-1 font-medium truncate">
                    {categoryName}
                </p>

                <h3 className="text-sm md:text-lg font-serif text-gray-900 mb-1 group-hover:text-herbal-700 transition-colors line-clamp-2 min-h-[2.5em] leading-tight">
                    {product.product.name}
                </h3>

                <p className="text-[10px] md:text-xs text-gray-500 mb-2">{primaryVariant?.variantName || 'Standard'}</p>

                <div className="mt-auto">
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
                        {hasPrice ? (
                            <>
                                <span className="text-sm md:text-base font-serif font-medium text-herbal-900">₹{price}</span>
                                {discount > 0 && (
                                    <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{mrp}</span>
                                )}
                            </>
                        ) : (
                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gray-400">Coming Soon</span>
                        )}
                    </div>

                    {/* Mobile Only Add to Cart Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); if (hasPrice) onAddToCart(product); }}
                        disabled={!hasPrice}
                        className={`md:hidden w-full text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg transition-colors border border-herbal-200 ${hasPrice ? 'bg-herbal-100 text-herbal-900 active:bg-herbal-900 active:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {hasPrice ? 'Add + ' : 'No Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};
