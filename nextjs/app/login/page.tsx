'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { BRAND_LOGO } from '@/lib/constants';

export default function CustomerLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const redirect = searchParams.get('redirect') || '/profile';

    const finishLogin = () => {
        toast.success(mode === 'sign-in' ? 'Welcome back' : 'Account created');
        router.push(redirect);
        router.refresh();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = mode === 'sign-in'
                ? await authClient.signIn.email({ email, password, rememberMe: true })
                : await authClient.signUp.email({ name: 'Customer', email, password });

            if (result.error) throw new Error(result.error.message || 'Authentication failed');
            finishLogin();
        } catch (err: any) {
            const message = err?.message || 'Unable to complete authentication';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await authClient.signIn.social({ provider: 'google', callbackURL: redirect });
            if (result.error) throw new Error(result.error.message || 'Google sign-in failed');
        } catch (err: any) {
            const message = err?.message || 'Google sign-in is not configured yet';
            setError(message);
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-herbal-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-herbal-800 rounded-full blur-[100px] opacity-30" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gold-600 rounded-full blur-[100px] opacity-20" />

            <div className="bg-[#FAFAF5] p-8 md:p-14 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-gold-400/30 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-full p-1 border-2 border-gold-400 shadow-md mb-5">
                        <img src={BRAND_LOGO} alt="Guna's" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-herbal-950 mb-2">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2>
                    <p className="text-gray-500 font-serif italic">Simple, secure access to your orders.</p>
                </div>

                {error && <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl mb-6 border border-red-100 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em] mb-2">Email address</span>
                        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full p-4 border-b-2 border-gray-200 focus:border-herbal-800 outline-none bg-transparent text-herbal-950" autoComplete="email" />
                    </label>
                    <label className="block">
                        <span className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em] mb-2">Password</span>
                        <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full p-4 border-b-2 border-gray-200 focus:border-herbal-800 outline-none bg-transparent text-herbal-950" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} />
                    </label>
                    <button type="submit" disabled={loading} className="w-full bg-herbal-900 text-white font-bold py-4 rounded-full hover:bg-black transition-all shadow-lg disabled:opacity-70 uppercase text-xs tracking-[0.2em]">
                        {loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign in securely' : 'Create account'}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6 text-[10px] uppercase tracking-widest text-gray-400"><span className="h-px bg-gray-200 flex-1" />or<span className="h-px bg-gray-200 flex-1" /></div>
                <button type="button" onClick={handleGoogle} disabled={loading} className="w-full border border-gray-200 text-herbal-950 font-bold py-4 rounded-full hover:border-herbal-900 transition-colors uppercase text-xs tracking-[0.15em] disabled:opacity-70">Continue with Google</button>

                {mode === 'sign-in' && <button type="button" onClick={() => router.push('/reset-password')} className="w-full mt-4 text-xs font-bold text-herbal-700 hover:text-herbal-950 transition-colors">Forgot your password?</button>}
                <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }} className="w-full mt-6 text-xs text-gray-500 hover:text-herbal-900 transition-colors">
                    {mode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}
                </button>
                <button type="button" onClick={() => router.push('/')} className="w-full mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-herbal-800 transition-colors">Return Home</button>
            </div>
        </div>
    );
}
