
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CONTACT_INFO } from '@/lib/constants';
import { submitEnquiry, getCurrentUser } from '@/lib/api';

export default function Contact() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General Enquiry',
        message: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUser();
            if (user) {
                setCurrentUser(user);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || ''
                }));
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await submitEnquiry({
            ...formData,
            userId: currentUser?.id || null,
        });

        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error || 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-earth-200 animate-fade-in">
                    <div className="w-20 h-20 bg-herbal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        ✨
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-herbal-900 mb-4">Thank You</h2>
                    <p className="text-gray-600 mb-8 font-light">
                        We have received your message. Our team will get back to you within 24 hours.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-herbal-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-50 pt-24 md:pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16 animate-fade-in">
                    <span className="text-herbal-500 font-sans text-xs uppercase tracking-[0.25em] mb-3 md:mb-4 block">Get in Touch</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-herbal-900 mb-4 md:mb-6">Contact Us</h1>
                    <p className="max-w-2xl mx-auto text-gray-600 font-light text-base md:text-lg">
                        Whether you are interested in our herbal workshops, bulk raw materials, or simply have a question about our products, we are here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-24 animate-slide-up">
                    {/* Contact Info */}
                    <div className="bg-herbal-900 text-white p-8 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10 space-y-10 md:space-y-12">
                            <div>
                                <h3 className="text-2xl font-serif text-gold-400 mb-4 md:mb-6">Contact Information</h3>
                                <p className="text-white/80 font-light leading-relaxed text-sm md:text-base">
                                    Reach out to us directly or visit our center in Tenkasi to experience the herbal magic firsthand.
                                </p>
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="text-2xl mt-1">📍</div>
                                    <div>
                                        <p className="font-bold text-gold-400 text-sm uppercase tracking-wider mb-2">Visit Us</p>
                                        <p className="text-white/90 font-light text-sm md:text-base">{CONTACT_INFO.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="text-2xl mt-1">📞</div>
                                    <div>
                                        <p className="font-bold text-gold-400 text-sm uppercase tracking-wider mb-2">Call Us</p>
                                        <p className="text-white/90 font-light text-base md:text-lg">{CONTACT_INFO.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="text-2xl mt-1">✉️</div>
                                    <div>
                                        <p className="font-bold text-gold-400 text-sm uppercase tracking-wider mb-2">Email</p>
                                        <p className="text-white/90 font-light text-sm md:text-base">{CONTACT_INFO.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-earth-100">
                        <h3 className="text-2xl font-serif text-gray-900 mb-6 md:mb-8">Send a Message</h3>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-herbal-500 outline-none transition-all text-black"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-herbal-500 outline-none transition-all text-black"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-herbal-500 outline-none transition-all text-black"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-herbal-500 outline-none transition-all cursor-pointer text-black"
                                >
                                    <option>General Enquiry</option>
                                    <option>Herbal Training Workshops</option>
                                    <option>Bulk Raw Materials</option>
                                    <option>Product Support</option>
                                    <option>Order Issues</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    required
                                    name="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-herbal-500 outline-none transition-all text-black resize-none"
                                    placeholder="How can we help you today?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-herbal-800 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs md:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-herbal-900 hover:shadow-xl'}`}
                            >
                                {loading ? 'Submitting...' : 'Submit Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
