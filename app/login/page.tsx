'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestLoginOtp, verifyLoginOtp } from '@/lib/api';
import { toast } from 'sonner';
import { BRAND_LOGO } from '@/lib/constants';

export default function CustomerLogin() {
    const router = useRouter();
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mobile.length < 10) {
            setError('Please enter a valid mobile number.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await requestLoginOtp(mobile);
            setLoading(false);

            if (res.success) {
                setStep('otp');
                toast.success("OTP sent to your mobile!", {
                    description: "Use 1234 as the demo OTP."
                });
            } else {
                setError(res.error || "Failed to send OTP");
                toast.error(res.error || "Failed to send OTP");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An error occurred. Please try again.");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) {
            setError('Please enter a 4-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            const result = await verifyLoginOtp(mobile, otp);
            setLoading(false);

            if (result.success) {
                toast.success("Login Successful!", {
                    description: "Welcome back to Guna's Herbal."
                });
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 1000);
            } else {
                setError(result.error || "Invalid OTP");
                toast.error(result.error || "Invalid OTP");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("Verification failed.");
        }
    };

    return (
        <div className="min-h-screen bg-herbal-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-herbal-800 rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gold-600 rounded-full blur-[100px] opacity-20"></div>

            <div className="bg-[#FAFAF5] p-8 md:p-14 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-gold-400/30 animate-fade-in-up">

                <div className="text-center mb-8 md:mb-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full p-1 border-2 border-gold-400 shadow-md mb-4 md:mb-6 relative group">
                        <img src={BRAND_LOGO} alt="Guna's" className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-herbal-950 mb-2 tracking-tight">Welcome</h2>
                    <p className="text-gray-500 font-serif italic text-sm md:text-base">The Gateway to Wellness</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl mb-6 md:mb-8 border border-red-100 text-center font-medium leading-relaxed">
                        {error}
                        {error.includes('place an order') && (
                            <button onClick={() => router.push('/shop')} className="block mt-2 text-red-900 font-bold underline w-full text-center hover:text-black">
                                Browse Shop
                            </button>
                        )}
                    </div>
                )}

                {step === 'mobile' ? (
                    <form onSubmit={handleSendOtp} className="space-y-6 md:space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em] mb-2 md:mb-3 ml-1">Mobile Number</label>
                            <div className="flex border-b-2 border-gray-200 focus-within:border-herbal-800 transition-colors">
                                <span className="inline-flex items-center px-2 text-gray-400 font-serif text-lg py-3 select-none">+91</span>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="flex-1 p-3 outline-none bg-transparent text-herbal-950 font-serif text-xl tracking-widest placeholder-gray-300"
                                    placeholder="98765 43210"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-herbal-900 text-white font-bold py-3 md:py-4 rounded-full hover:bg-black transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase text-xs tracking-[0.2em] hover:scale-[1.02] duration-300"
                        >
                            {loading ? 'Verifying...' : 'Continue Securely'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 md:space-y-8 animate-fade-in">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-xs font-bold text-herbal-800 uppercase tracking-[0.2em]">One-Time Password</label>
                                <button type="button" onClick={() => { setStep('mobile'); setError(''); }} className="text-[10px] text-gray-400 hover:text-herbal-800 font-bold uppercase tracking-widest transition-colors">Edit Number</button>
                            </div>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full p-4 border-b-2 border-gray-200 focus:border-herbal-800 outline-none bg-transparent text-herbal-950 font-serif font-bold text-center tracking-[1em] text-3xl placeholder-gray-200 transition-colors"
                                placeholder="••••"
                                autoFocus
                            />
                            <p className="text-center text-xs text-gray-400 mt-4 font-serif">Sent to +91 {mobile}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-herbal-900 text-white font-bold py-3 md:py-4 rounded-full hover:bg-black transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase text-xs tracking-[0.2em] hover:scale-[1.02] duration-300"
                        >
                            {loading ? 'Accessing...' : 'Enter Portal'}
                        </button>
                    </form>
                )}

                <div className="mt-10 md:mt-12 text-center">
                    <button onClick={() => router.push('/')} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-herbal-800 transition-colors">Return Home</button>
                </div>
            </div>
        </div>
    );
}
