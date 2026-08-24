'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllProducts } from '@/lib/api';
import { ProductWithDetails, SortOption } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const SEARCH_FALLBACK: ProductWithDetails[] = [
  { id: 1, product: { id: 1, name: "Guna's Hair Growth Oil", description: 'A botanical infusion for a nourished scalp and stronger-looking hair.' }, category: { name: 'Oil', slug: 'oil' }, variants: [{ id: 1, price: '220', costPrice: '300', variantName: '200ml', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1611073769451-3f5d9b2a3a7d?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
  { id: 2, product: { id: 2, name: "Guna's Onion Hibiscus Shampoo", description: 'A gentle cleansing ritual with traditional plant extracts.' }, category: { name: 'Shampoo', slug: 'shampoo' }, variants: [{ id: 2, price: '180', costPrice: '230', variantName: '200ml', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
  { id: 3, product: { id: 3, name: "Guna's Nalangu Maavu Soap", description: 'A soft, earthy cleansing bar inspired by South Indian beauty rituals.' }, category: { name: 'Soap', slug: 'soap' }, variants: [{ id: 3, price: '100', costPrice: '160', variantName: '80g', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
  { id: 4, product: { id: 4, name: "Guna's Natural Honey", description: 'Golden, naturally collected honey for a sweeter daily ritual.' }, category: { name: 'Honey', slug: 'honey' }, variants: [{ id: 4, price: '240', costPrice: '300', variantName: '100g', stockQty: 25 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=85', isPrimary: true }] } as unknown as ProductWithDetails,
];
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState<SortOption>('featured');

  useEffect(() => {
    getAllProducts({ limit: 1000 }).then((response) => {
      setProducts(response.success && response.data?.length ? response.data : SEARCH_FALLBACK);
    }).catch(() => setProducts(SEARCH_FALLBACK)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    const nextCategory = searchParams.get('category') || 'All';
    setQuery(nextQuery);
    setCategory(nextCategory);
  }, [searchParams]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean) as string[]))], [products]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = products.filter((p) => category === 'All' || p.category?.name === category || p.category?.slug === category);
    if (normalized) list = list.filter((p) => `${p.product.name} ${p.product.description || ''} ${p.category?.name || ''}`.toLowerCase().includes(normalized));
    return [...list].sort((a, b) => {
      const priceA = Number(a.variants?.[0]?.price || 0); const priceB = Number(b.variants?.[0]?.price || 0);
      if (sort === 'price-low-high') return priceA - priceB;
      if (sort === 'price-high-low') return priceB - priceA;
      if (sort === 'name-a-z') return a.product.name.localeCompare(b.product.name);
      return 0;
    });
  }, [products, query, category, sort]);

  const updateUrl = (nextQuery: string, nextCategory: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextCategory !== 'All') params.set('category', nextCategory);
    router.replace(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleAdd = async (product: ProductWithDetails) => {
    const variant = product.variants?.[0];
    if (variant) { await addItem(product, 1, variant.id); toast.success('Added to your cart'); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f3ed] text-sm uppercase tracking-[0.2em] text-[#19372f]">Loading collection</div>;

  return <main className="min-h-screen bg-[#f6f3ed] px-5 pb-24 pt-28 text-[#19372f] md:px-12 md:pt-36">
    <div className="mx-auto max-w-7xl">
      <div className="border-b border-[#cfc6b4] pb-10"><p className="mb-4 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Search Guna Herbals</p><h1 className="max-w-3xl text-5xl leading-none md:text-8xl">Find your<br /><em className="font-normal text-[#a4864d]">next ritual.</em></h1><div className="mt-10 flex max-w-3xl items-center border-b-2 border-[#19372f] pb-3"><svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg><input autoFocus value={query} onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value, category); }} placeholder="Search shampoos, soaps, oils, skincare..." className="min-w-0 flex-1 bg-transparent font-serif text-xl outline-none placeholder:text-[#9a9a91] md:text-3xl" /></div></div>
      <div className="flex flex-col gap-5 border-b border-[#d8d1c3] py-6 md:flex-row md:items-center md:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => { setCategory(item); updateUrl(query, item); }} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.16em] transition ${category === item ? 'border-[#19372f] bg-[#19372f] text-white' : 'border-[#cfc6b4] hover:border-[#19372f]'}`}>{item}</button>)}</div><div className="flex items-center justify-between gap-4"><span className="text-xs text-[#777c74]">{results.length} products</span><select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="rounded-full border border-[#cfc6b4] bg-transparent px-4 py-2 text-xs outline-none"><option value="featured">Featured</option><option value="price-low-high">Price: Low to High</option><option value="price-high-low">Price: High to Low</option><option value="name-a-z">Name: A to Z</option></select></div></div>
      {results.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-10 pt-10 md:grid-cols-3 md:gap-7 lg:grid-cols-4">{results.map((product) => <ProductCard key={product.product.id} product={product} isWishlisted={false} onAddToCart={handleAdd} onViewDetails={(item) => router.push(`/shop/${item.product.id}`)} onQuickView={(item) => router.push(`/shop/${item.product.id}`)} onToggleWishlist={() => toast.info('Sign in to save favourites')} />)}</div> : <div className="py-28 text-center"><p className="text-2xl">No rituals found.</p><button onClick={() => { setQuery(''); setCategory('All'); updateUrl('', 'All'); }} className="mt-5 border-b border-[#19372f] pb-1 text-xs font-sans font-bold uppercase tracking-[0.16em]">Clear search</button></div>}
    </div>
  </main>;
}

export default function SearchPage() { return <Suspense fallback={<div className="min-h-screen bg-[#f6f3ed]" />}><SearchContent /></Suspense>; }
