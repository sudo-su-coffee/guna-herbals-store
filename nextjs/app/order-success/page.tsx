
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import canvasConfetti from 'canvas-confetti';

export default function OrderSuccess() {

    useEffect(() => {
        // Fire confetti on mount
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            canvasConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            canvasConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center pt-20 px-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-herbal-100 rounded-full blur-[120px] opacity-40 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-100 rounded-full blur-[100px] opacity-30 -ml-32 -mb-32"></div>

            <div className="bg-white p-10 md:p-16 rounded-[2rem] shadow-2xl text-center max-w-xl w-full relative z-10 border border-white/50 animate-scale-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
                    ✓
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-herbal-950 mb-4">Order Placed!</h1>
                <p className="text-gray-500 font-sans text-lg mb-8 font-light">
                    Thank you for choosing nature's best. Your order has been successfully placed.
                </p>

                <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
                    <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Estimated Delivery</p>
                    <p className="text-xl font-bold text-herbal-900 font-serif">3 - 5 Business Days</p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/track-order"
                        className="w-full bg-herbal-900 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                        Track Order
                    </Link>
                    <Link
                        href="/shop"
                        className="w-full bg-white text-herbal-900 border border-gray-200 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gray-50 transition-all hover:border-herbal-300"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
