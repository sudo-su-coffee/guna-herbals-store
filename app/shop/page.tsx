'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductWithDetails, SortOption } from '@/lib/types';
import { getAllProducts, getCurrentUser } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import QuickViewModal from '@/components/QuickViewModal';
import { toast } from 'sonner';

const FALLBACK_PRODUCTS: ProductWithDetails[] = [
    { id: 1, product: { id: 1, name: "Guna's Hair Growth Oil", description: 'A botanical infusion for a nourished scalp and stronger-looking hair.' }, category: { name: 'Oil', slug: 'oil' }, variants: [{ id: 1, price: '220', costPrice: '300', variantName: '200ml', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1611073769451-3f5d9b2a3a7d?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
    { id: 2, product: { id: 2, name: "Guna's Onion Hibiscus Shampoo", description: 'A gentle cleansing ritual with traditional plant extracts.' }, category: { name: 'Shampoo', slug: 'shampoo' }, variants: [{ id: 2, price: '180', costPrice: '230', variantName: '200ml', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
    { id: 3, product: { id: 3, name: "Guna's Nalangu Maavu Soap", description: 'A soft, earthy cleansing bar inspired by South Indian beauty rituals.' }, category: { name: 'Soap', slug: 'soap' }, variants: [{ id: 3, price: '100', costPrice: '160', variantName: '80g', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
    { id: 4, product: { id: 4, name: "Guna's Natural Honey", description: 'Golden, naturally collected honey for a sweeter daily ritual.' }, category: { name: 'Honey', slug: 'honey' }, variants: [{ id: 4, price: '240', costPrice: '300', variantName: '100g', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
];

// Helper to extract price for sorting
const getPrice = (p: ProductWithDetails): number => {
    const v = p.variants?.[0];
    return v?.price ? parseFloat(v.price.toString()) : 0;
};

// --- Main Shop Page Component ---

function ShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useCart(); // Use Global Cart Context

    // Local state logic
    const [products, setProducts] = useState<ProductWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<unknown>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('featured');
    const [selectedCategory, setSelectedCategory] = useState('All'); // Now a local state

    // Quick View State
    const [quickViewProduct, setQuickViewProduct] = useState<ProductWithDetails | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const loadData = async () => {
        try {
            const response = await getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data); // Set user object
            }

            const productsResponse = await getAllProducts();
            if (productsResponse.success && productsResponse.data?.length) {
                setProducts(productsResponse.data);
            } else {
                setProducts(FALLBACK_PRODUCTS);
            }
        } catch (err) {
            console.error(err);
            setProducts(FALLBACK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        // Initialize selectedCategory from URL on mount
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, []);

    // Update URL when selectedCategory changes
    useEffect(() => {
        const currentCategory = searchParams.get('category') || 'All';
        if (currentCategory !== selectedCategory) {
            const target = selectedCategory === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(selectedCategory)}`;
            router.replace(target);
        }
    }, [selectedCategory, searchParams, router]);


    const openProductDetails = (product: ProductWithDetails) => {
        router.push(`/shop/${product.product.id}`);
    };

    const openQuickView = (product: ProductWithDetails) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    const handleAddToCart = async (product: ProductWithDetails) => {
        const variant = product.variants?.[0];
        if (variant) {
            await addItem(product, 1, variant.id);
        }
    };

    const handleToggleWishlist = (product: ProductWithDetails) => {
        toast.info("Wishlist feature coming soon!");
    };

    const filteredProducts = useMemo(() => {
        let result = selectedCategory === 'All'
            ? [...products]
            : products.filter(p => p.category?.name === selectedCategory || p.category?.slug === selectedCategory);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.product.name.toLowerCase().includes(q) ||
                (p.product.description && p.product.description.toLowerCase().includes(q))
            );
        }

        switch (sortOption) {
            case 'price-low-high':
                return result.sort((a, b) => getPrice(a) - getPrice(b));
            case 'price-high-low':
                return result.sort((a, b) => getPrice(b) - getPrice(a));
            case 'name-a-z':
                return result.sort((a, b) => a.product.name.localeCompare(b.product.name));
            default:
                return result;
        }
    }, [products, selectedCategory, sortOption, searchQuery]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Shop...</div>;

    // Assuming categories are fetched or hardcoded elsewhere if ProductCategory enum is removed
    // For now, using a placeholder list. You might want to fetch these dynamically.
    const categoriesList = ['All', 'Shampoo', 'Soap', 'Oil', 'Cream', 'Lip Balm', 'Powders', 'Spice', 'Honey'];

    return (
        <div className="w-full min-h-screen bg-earth-50 pt-20">
            {/* Category Bar & Controls */}
            <div className="w-full bg-earth-50 border-b border-earth-200 shadow-sm relative z-30 transition-all">
                <div className="w-full px-4 md:px-16 lg:px-32 py-4">
                    {/* Breadcrumbs for Shop */}
                    <div className="mb-4 px-1 flex text-xs md:text-sm text-gray-500 font-serif">
                        <button onClick={() => router.push('/')} className="hover:text-herbal-800 transition-colors">Home</button>
                        <span className="mx-2">/</span>
                        <button onClick={() => setSelectedCategory('All')} className="hover:text-herbal-800 transition-colors">Shop</button>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search for herbal shampoos, soaps, oils..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-earth-200 bg-white focus:bg-white focus:ring-1 focus:ring-herbal-500 focus:outline-none transition-all shadow-inner text-gray-700 font-serif text-sm md:text-base"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-4 top-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Categories - Horizontal Scroll on Mobile */}
                        <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0 scrollbar-hide flex-grow -mx-4 px-4 md:mx-0 md:px-0">
                            {categoriesList.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`whitespace-nowrap px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 border font-serif tracking-wide flex-shrink-0 ${selectedCategory === cat
                                        ? 'bg-herbal-900 text-white border-herbal-900 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-herbal-300 hover:bg-earth-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Sorting & Filters */}
                        <div className="flex items-center gap-3 flex-shrink-0 justify-end">
                            <span className="text-sm font-medium text-gray-500 hidden md:block font-serif italic">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs md:text-sm rounded-full pl-4 md:pl-6 pr-8 md:pr-10 py-2 md:py-3 focus:ring-herbal-500 focus:border-herbal-500 block w-full outline-none cursor-pointer hover:border-herbal-300 font-serif shadow-sm transition-all"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low-high">Price: Low to High</option>
                                    <option value="price-high-low">Price: High to Low</option>
                                    <option value="name-a-z">Name: A to Z</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4 absolute right-3 top-3 md:top-3.5 text-gray-400 pointer-events-none">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="w-full px-4 md:px-16 lg:px-32 py-8 md:py-12 pb-32">
                <div className="flex justify-between items-end mb-6 md:mb-8 px-1">
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-herbal-900">
                        {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
                    </h2>
                    <span className="text-xs md:text-sm text-gray-500 font-medium bg-white px-3 py-1 md:px-4 md:py-2 rounded-full border border-gray-200 shadow-sm font-serif">
                        {filteredProducts.length} items
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8 lg:gap-10">
                    {filteredProducts.map(p => (
                        <div key={p.product.id?.toString()} className="h-full">
                            <ProductCard
                                product={p}
                                isWishlisted={false} // TODO: Connect to hook
                                onAddToCart={handleAddToCart}
                                onViewDetails={(prod) => router.push(`/shop/${prod.product.id}`)}
                                onQuickView={openQuickView}
                                onToggleWishlist={() => toast.info("Wishlist feature coming soon!")}
                            />
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-500 bg-white rounded-3xl border border-dashed border-earth-200 mx-auto max-w-2xl mt-12">
                        <div className="bg-earth-100 p-6 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-herbal-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p className="text-xl font-medium text-gray-800 font-serif">No products found</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-6 text-herbal-600 font-bold hover:underline">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
