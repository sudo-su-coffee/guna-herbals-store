'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/constants';

export default function PromotionalPopup() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show popup once per session after 3 seconds
        if (SITE_CONFIG.popupOffer?.enabled && !sessionStorage.getItem('popupShown')) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem('popupShown', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsVisible(false)}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-center p-8 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close popup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {SITE_CONFIG.popupOffer?.image && (
                    <img
                        src={SITE_CONFIG.popupOffer.image}
                        alt="Offer"
                        className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-herbal-100"
                    />
                )}

                <h2 className="text-3xl font-serif font-bold text-herbal-900 mb-2">
                    {SITE_CONFIG.popupOffer?.title}
                </h2>

                <p className="text-gray-600 mb-6 font-serif">
                    {SITE_CONFIG.popupOffer?.text}
                </p>

                <button
                    onClick={() => {
                        router.push('/shop');
                        setIsVisible(false);
                    }}
                    className="w-full bg-herbal-800 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-herbal-900 transition-colors shadow-lg"
                >
                    Shop Now
                </button>
            </div>
        </div>
    );
}
