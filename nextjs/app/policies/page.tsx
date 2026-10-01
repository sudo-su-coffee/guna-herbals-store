
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { POLICIES } from '@/lib/constants';
import { PolicyType } from '@/lib/types';

const MENU_ITEMS: { id: PolicyType; label: string; icon: string }[] = [
    { id: 'return', label: 'Returns & Refunds', icon: '↺' },
    { id: 'shipping', label: 'Shipping Policy', icon: '🚚' },
    { id: 'terms', label: 'Terms & Conditions', icon: '⚖️' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { id: 'disclaimer', label: 'Disclaimer', icon: '⚠️' },
];

export default function Policies() {
    const router = useRouter();
    const [activePolicy, setActivePolicy] = useState<PolicyType>('return');

    const currentPolicy = POLICIES[activePolicy];
    const policyTitle = currentPolicy.split('\n')[0];
    const policyContent = currentPolicy.substring(policyTitle.length + 1);

    return (
        <div className="min-h-screen bg-earth-50 pt-20 md:pt-24 pb-20">
            {/* Hero Header */}
            <div className="bg-herbal-950 text-white py-12 md:py-20 px-6 relative overflow-hidden mb-8 md:mb-16">
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-linen.png")' }}></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-herbal-900/50 to-transparent"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="text-gold-500 font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] block mb-2 md:mb-4 animate-fade-in">Legal & Trust</span>
                    <h1 className="text-3xl md:text-6xl font-serif font-bold animate-slide-up leading-tight">Company Policies</h1>
                    <p className="mt-4 md:mt-6 text-herbal-200 font-light max-w-2xl mx-auto text-sm md:text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Transparency is the foundation of trust. Review our operational guidelines and commitments to you.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* Navigation - Horizontal on Mobile, Sidebar on Desktop */}
                <aside className="lg:col-span-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-earth-200 lg:sticky lg:top-32 overflow-x-auto scrollbar-hide">
                        <nav className="flex lg:block space-x-2 lg:space-x-0 lg:space-y-1 min-w-max">
                            {MENU_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActivePolicy(item.id)}
                                    className={`flex-shrink-0 lg:w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 md:gap-4 transition-all duration-300 ${activePolicy === item.id
                                            ? 'bg-herbal-900 text-white shadow-md lg:transform lg:scale-105'
                                            : 'text-gray-600 hover:bg-earth-100 hover:text-herbal-900'
                                        }`}
                                >
                                    <span className={`text-base md:text-lg ${activePolicy === item.id ? 'text-gold-400' : 'text-gray-400'}`}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Policy Content - Premium Document Style */}
                <main className="lg:col-span-9">
                    <div className="bg-white p-6 md:p-16 rounded-2xl shadow-xl border border-earth-200 min-h-[60vh] relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-herbal-900 via-gold-500 to-herbal-900"></div>
                        <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden md:block">
                            <svg width="200" height="200" viewBox="0 0 200 200" fill="currentColor" className="text-herbal-900">
                                <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                            </svg>
                        </div>

                        <div className="mb-6 md:mb-10 pb-4 md:pb-6 border-b border-earth-200">
                            <h2 className="text-2xl md:text-4xl font-serif font-bold text-herbal-950 mb-2">
                                {policyTitle}
                            </h2>
                            <p className="text-[10px] md:text-sm text-gray-400 uppercase tracking-widest font-sans">
                                Last Updated: May 2024
                            </p>
                        </div>

                        <div className="prose prose-sm md:prose-lg max-w-none text-gray-700 font-light leading-loose whitespace-pre-wrap font-sans prose-headings:font-serif prose-headings:text-herbal-900 prose-strong:text-herbal-800 prose-a:text-gold-600">
                            {policyContent}
                        </div>

                        <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-earth-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                            <p className="text-center sm:text-left">Guna's Hand Made Herbal Products • Tenkasi, TN</p>
                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="hover:text-herbal-900 font-bold transition-colors hidden md:block">Print Policy</button>
                                <span className="hidden md:block">|</span>
                                <Link href="/contact" className="hover:text-herbal-900 font-bold transition-colors">Contact Support</Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
