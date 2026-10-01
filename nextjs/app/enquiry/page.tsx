'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants';
import { submitEnquiry, getCurrentUser } from '@/lib/api';

export default function EnquiryPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
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
                    <h2 className="text-3xl font-serif font-bold text-herbal-900 mb-4">Thank You!</h2>
                    <p className="text-gray-600 mb-8">
                        We've received your enquiry. Our team will get back to you within 24 hours.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-herbal-900 text-white px-8 py-3 rounded-full font-bold hover:bg-herbal-800 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-earth-50 to-herbal-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-herbal-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our products, workshops, or bulk orders? We're here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-herbal-900 mb-6">
                                Contact Information
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-herbal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-herbal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                                        <p className="text-gray-600">{CONTACT_INFO.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-herbal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-herbal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">{CONTACT_INFO.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-herbal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-herbal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                                        <p className="text-gray-600">{CONTACT_INFO.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-herbal-900 text-white p-8 rounded-2xl">
                            <h3 className="text-xl font-serif font-bold mb-4">Business Hours</h3>
                            <div className="space-y-2 text-gray-300">
                                <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-herbal-900 mb-6">
                            Send us a Message
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbal-500 focus:border-transparent outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbal-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="product">Product Enquiry</option>
                                    <option value="workshop">Workshop Information</option>
                                    <option value="bulk">Bulk Orders</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbal-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-herbal-900 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-herbal-800 hover:shadow-xl'}`}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
