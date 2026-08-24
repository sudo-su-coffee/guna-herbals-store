
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND_LOGO } from '@/lib/constants';

import { adminLogin } from '@/lib/api';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await adminLogin(email, password);
            if (result.success) {
                window.location.href = '/admin/dashboard';
            } else {
                setError(result.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = () => {
        setEmail('admin@gunasherbals.store');
        setPassword('admin123');
    };

    return (
        <div className="min-h-screen bg-herbal-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Texture & Decor similar to Customer Login for consistency */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-herbal-800 rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-gold-600 rounded-full blur-[100px] opacity-20"></div>

            <div className="bg-[#FAFAF5] p-8 md:p-14 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-gold-400/30 animate-fade-in-up">

                <div className="text-center mb-8 md:mb-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full p-1 border-2 border-gold-400 shadow-md mb-4 md:mb-6 relative group">
                        <img src={BRAND_LOGO} alt="Logo" className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-herbal-950 mb-2 tracking-tight">Admin Portal</h2>
                    <p className="text-gray-600 font-serif italic text-base md:text-lg">Secure Access Only</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-900 text-sm p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3 font-bold shadow-sm" role="alert">
                        <span className="text-xl">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em] mb-2 ml-1" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-herbal-100 focus:border-herbal-800 outline-none transition-all bg-white text-herbal-950 font-medium text-base md:text-lg placeholder-gray-400"
                            placeholder="name@gunasherbals.store"
                            aria-label="Email Address"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em] mb-2 ml-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-herbal-100 focus:border-herbal-800 outline-none transition-all bg-white text-herbal-950 font-medium text-base md:text-lg placeholder-gray-400"
                            placeholder="••••••••"
                            aria-label="Password"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={fillCredentials}
                        className="text-xs text-herbal-600 hover:text-herbal-900 font-bold underline w-full text-right py-2 focus:outline-none focus:text-herbal-900"
                        aria-label="Auto-fill demo credentials"
                    >
                        Use Demo Credentials
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-herbal-900 text-white font-bold py-3 md:py-4 rounded-full hover:bg-black hover:scale-[1.02] focus:scale-[1.02] transition-all shadow-lg uppercase text-xs tracking-[0.2em] mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-8 md:mt-10 pt-6 border-t border-gray-100 text-center">
                    <Link
                        href="/"
                        className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-herbal-800 transition-colors flex items-center justify-center gap-2 mx-auto group"
                    >
                        <span>←</span>
                        <span className="group-hover:underline">Return to Store</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
