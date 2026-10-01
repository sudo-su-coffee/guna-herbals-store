'use client';

import type { Metadata } from "next";
import "./globals.css";
import { getAllProducts, getCart, getWishlist, getCurrentUser } from "@/lib/api";
import { Product, CartItemWithDetails, User, WishlistItem } from "@/lib/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { BRAND_LOGO, CONTACT_INFO } from "@/lib/constants";
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { SupportWidget } from '@/components/SupportWidget';
import { CartProvider, useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

function LayoutContent({ children }: { children: React.ReactNode }) {
  // Use Global Cart
  const { itemCount, openCart } = useCart();

  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Keep Wishlist/User fetching for now (could be moved to context later)
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const promotionText = "";

  // Data Fetching Effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User
        const userRes = await getCurrentUser();
        const user = userRes.data;
        setCurrentUser(user);

        // Fetch Products
        const prodsRes = await getAllProducts();
        const prodsData = prodsRes.success ? prodsRes.data || [] : [];

        // Optimize for Suggestions (only need name and category basically)
        const formattedProducts = prodsData.map((p: any) => ({
          ...p.product,
          price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price.toString()) : 0,
          image: p.images?.[0]?.imageUrl || '',
          category: p.category?.name || 'Other',
        }));
        setProducts(formattedProducts);

        // Fetch Wishlist if user is logged in
        if (userRes.success && user?.id) {
          const wishlistRes = await getWishlist();
          if (wishlistRes.success) setWishlist(wishlistRes.data || []);
        }
      } catch (error) {
        console.error("Layout data fetch error:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const defaultSuggestions = products?.slice(0, 3) || [];
  const filteredSuggestions = searchQuery.trim()
    ? (products || []).filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6)
    : defaultSuggestions;

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleProductClick = (productId: string) => {
    router.push(`/shop/${productId}`);
    handleSearchClose();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* HEADER */}
      {promotionText && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-herbal-900 text-white text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] py-2.5 px-4 font-sans">
          {promotionText}
        </div>
      )}
      <header className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${promotionText ? 'pt-10' : ''}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center transition-all duration-500 bg-[#FAFAF5]/90 backdrop-blur-md border-b border-herbal-100/50 md:rounded-full md:border md:shadow-sm md:mx-auto md:max-w-[95%] md:mt-2 md:px-8">

          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="rounded-full overflow-hidden border border-herbal-100 transition-all duration-500 w-9 h-9">
              <img src={BRAND_LOGO} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-herbal-900 tracking-tight leading-none transition-all duration-500 text-lg">
                Guna's
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Shop All', href: '/shop' },
              { label: 'Our Story', href: '/about' },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 relative group ${isActive(link.href) ? 'text-herbal-900' : 'text-gray-500 hover:text-herbal-900'
                  }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-full h-px bg-herbal-900 transform origin-left transition-transform duration-300 ${isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group relative flex items-center justify-center text-herbal-900 hover:text-herbal-700 transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </button>

            <Link
              href="/wishlist"
              className="group relative flex items-center justify-center text-herbal-900 hover:text-herbal-700 transition-colors hidden sm:flex"
              title="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={(wishlist?.length || 0) > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${(wishlist?.length || 0) > 0 ? 'text-red-600' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>

            <Link
              href={currentUser ? "/profile" : "/login"}
              className="group relative flex items-center justify-center text-herbal-900 hover:text-herbal-700 transition-colors"
              title={currentUser ? "My Profile" : "Sign In"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {currentUser && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
            </Link>

            <button
              onClick={openCart}
              className="group relative cursor-pointer text-herbal-900 hover:text-herbal-700 transition-colors"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-herbal-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-fade-in">{itemCount}</span>
              )}
            </button>

            <button
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 gap-1.5"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <span className="w-full h-0.5 bg-herbal-900 rounded-full"></span>
              <span className="w-full h-0.5 bg-herbal-900 rounded-full"></span>
              <span className="w-2/3 h-0.5 bg-herbal-900 rounded-full self-end"></span>
            </button>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-[#FAFAF5]/95 backdrop-blur-xl animate-fade-in">
          <div className="max-w-5xl mx-auto px-6 pt-24 md:pt-32">
            <div className="relative">
              <input ref={searchInputRef} type="text" placeholder="Search for products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { router.push(`/search${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''}`); handleSearchClose(); } }} className="w-full bg-transparent border-b-2 border-gray-200 text-3xl md:text-5xl font-serif text-herbal-900 placeholder-gray-300 py-6 outline-none focus:border-herbal-800 transition-colors" />
              <button onClick={handleSearchClose} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-herbal-900 transition-colors p-2"><span className="text-sm font-bold uppercase tracking-widest mr-2 hidden md:inline">Close</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 inline"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="mt-12">
              {!searchQuery && (
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">Trending Now</h3>
              )}
              {filteredSuggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                  {filteredSuggestions.map(product => (
                    <button key={product.id} onClick={() => handleProductClick(product.id)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-herbal-50 transition-colors group border border-transparent hover:border-herbal-100 text-left">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100"><img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                      <div>
                        <h4 className="font-serif font-bold text-gray-900 group-hover:text-herbal-800 transition-colors">{product.name}</h4>
                        <p className="font-medium text-herbal-900">₹{product.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-10 text-center">
                <button onClick={() => { router.push(`/search${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''}`); handleSearchClose(); }} className="border-b border-herbal-900 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-herbal-900">View all results {searchQuery ? `for “${searchQuery}”` : ''}</button>
              </div>
              {searchQuery && filteredSuggestions.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No products found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[100] bg-herbal-950 text-white transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute top-6 right-6">
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Close Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
          {[
            { label: 'Home', href: '/' },
            { label: 'Shop All', href: '/shop' },
            { label: 'Our Story', href: '/about' },
            { label: 'Wishlist', href: '/wishlist' },
            { label: 'My Account', href: currentUser ? '/profile' : '/login' },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl md:text-4xl font-serif font-light hover:text-gold-400 transition-colors tracking-wide animate-slide-up"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="min-h-screen pt-20">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#051F1A] text-white pt-24 pb-10 font-sans border-t-[6px] border-gold-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-soft-light" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-linen.png")' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-herbal-800 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20 border-b border-white/10 pb-12">

            {/* Brand */}
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-3xl text-white tracking-wide">Guna's</h3>
                <p className="text-gold-500 text-xs uppercase tracking-[0.3em] font-medium mt-1">Herbal Legacy</p>
              </div>
              <p className="text-gray-400 text-sm leading-7 font-light">
                Reviving the lost art of Siddha formulations. Pure, potent, and handcrafted in Tenkasi for the conscious modern home.
              </p>

              <div className="flex gap-4 pt-2">
                <SocialIcon href={CONTACT_INFO.socials.instagram} icon="instagram" />
                <SocialIcon href={CONTACT_INFO.socials.facebook} icon="facebook" />
                <SocialIcon href={CONTACT_INFO.socials.linkedin} icon="linkedin" />
                <SocialIcon href={CONTACT_INFO.whatsapp} icon="whatsapp" />
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-serif text-lg text-white mb-6 relative inline-block">
                Resources
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gold-600"></span>
              </h4>
              <ul className="space-y-4 text-sm text-gray-400 font-light">
                <li><Link href="/journal" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> The Journal (Blog)</Link></li>
                <li><Link href="/training" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> The Academy</Link></li>
                <li><Link href="/raw-materials" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Raw Materials (B2B)</Link></li>
                <li><Link href="/about" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Our Heritage</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="font-serif text-lg text-white mb-6 relative inline-block">
                Client Care
                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gold-600"></span>
              </h4>
              <ul className="space-y-4 text-sm text-gray-400 font-light">
                <li><Link href={currentUser ? "/profile" : "/login"} className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> My Account</Link></li>
                <li><Link href="/track-order" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Track Order</Link></li>
                <li><Link href="/policies" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Shipping Policy</Link></li>
                <li><Link href="/policies" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Returns & Refunds</Link></li>
                <li><Link href="/policies" className="hover:text-gold-400 transition-all flex items-center gap-2 group"><span className="w-1 h-1 bg-gold-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span> Privacy & Terms</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-8">
              <div>
                <h4 className="font-serif text-lg text-white mb-6 relative inline-block">
                  Get in Touch
                  <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gold-600"></span>
                </h4>
                <p className="text-gray-400 text-sm mb-2">{CONTACT_INFO.address}</p>
                <p className="text-white font-mono text-sm tracking-wide">{CONTACT_INFO.phone}</p>
                <p className="text-gold-500 text-sm mt-1">{CONTACT_INFO.email}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs uppercase tracking-widest text-gray-300 mb-3 font-bold">Join the Circle</p>
                <div className="flex">
                  <input type="email" placeholder="Email Address" className="w-full bg-transparent border-b border-gray-500 text-white text-sm py-2 focus:outline-none focus:border-gold-500 transition-colors placeholder-gray-600" />
                  <button className="text-gold-500 hover:text-white font-serif text-sm px-2 uppercase tracking-wide transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
            <p>© 2025 Guna's Herbal Products. All Rights Reserved.</p>

            <div className="flex items-center gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 grayscale opacity-50 hover:opacity-100 transition-opacity" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 grayscale opacity-50 hover:opacity-100 transition-opacity" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-5 grayscale opacity-50 hover:opacity-100 transition-opacity" alt="Apple Pay" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/PayU.svg" className="h-4 grayscale opacity-50 hover:opacity-100 transition-opacity" alt="PayU" />

              <div className="w-px h-4 bg-gray-700"></div>

              <Link href="/admin/login" className="hover:text-gold-500 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Promotional Popup */}
      <CartDrawer />
    </>
  );
}

function SocialIcon({ href, icon }: { href: string, icon: 'instagram' | 'facebook' | 'linkedin' | 'whatsapp' }) {
  const paths = {
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    whatsapp: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-gold-500 hover:bg-white/10 transition-all duration-300">
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d={paths[icon]} /></svg>
    </a>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />

        {/* SEO Meta Tags */}
        <meta name="description" content="Shop authentic, handcrafted herbal products from Tenkasi, Tamil Nadu. Organic Shampoos, Soaps, and Oils made with traditional Siddha wisdom." />
        <meta name="keywords" content="Herbal Products, Organic Soap, Natural Shampoo, Tenkasi, Siddha Medicine, Hair Growth Oil, Guna Herbals, Handmade, Tamil Nadu" />
        <meta name="author" content="Guna's Herbal Products" />
        <meta name="robots" content="index, follow" />

        {/* Geo Tags for Local SEO (Tenkasi, Tamil Nadu) */}
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Tenkasi" />
        <meta name="geo.position" content="8.9594;77.3161" />
        <meta name="ICBM" content="8.9594, 77.3161" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gunasherbals.store/" />
        <meta property="og:title" content="Guna's Handmade Herbal Products" />
        <meta property="og:description" content="Pure, Potent, and Tradition-Rich. Handcrafted herbal remedies from the foothills of Pothigai." />
        <meta property="og:image" content="https://www.gunasherbals.store/images/og-image.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Guna's Handmade Herbal Products" />
        <meta name="twitter:description" content="Pure, Potent, and Tradition-Rich. Handcrafted herbal remedies from Tenkasi." />
        <meta name="twitter:image" content="https://www.gunasherbals.store/images/og-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.gunasherbals.store/" />

        {/* Humans.txt */}
        <link rel="author" href="/humans.txt" />

        {/* Google Analytics 4 (GA4) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Guna's Herbal Products",
              "url": "https://www.gunasherbals.store",
              "logo": "https://www.gunasherbals.store/logo.png",
              "description": "Handcrafted herbal products from Tenkasi, Tamil Nadu using traditional Siddha formulations",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1163, VAIYAPURIPATTI, Kayampatti",
                "addressLocality": "Sivaganga",
                "addressRegion": "Tamil Nadu",
                "postalCode": "630501",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "8.9594",
                "longitude": "77.3161"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "contact@gunasherbals.store"
              }
            }),
          }}
        />
      </head>
      <body style={{ fontFamily: "'Playfair Display', serif" }}>

        <AnalyticsProvider>
          <SupportWidget />
          <CartProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </AnalyticsProvider>
      </body>
    </html >
  );
}
