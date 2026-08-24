'use client';

import React, { useState } from 'react';

const FAQS = [
    {
        question: "Are your products 100% natural?",
        answer: "Yes, absolutely. All our products are crafted using traditional Siddha formulations with 100% natural herbs, oils, and minerals. We do not use harsh sulphates, parabens, or artificial fragrances."
    },
    {
        question: "Where are your products made?",
        answer: "Our products are handcrafted in small batches at our facility in Tenkasi, Tamil Nadu, situated near the foothills of the Western Ghats, an area known for its rich medicinal flora."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within India. We are working on regulatory compliances to start international shipping soon."
    },
    {
        question: "Are your products safe for babies?",
        answer: "Our 'Bala' range is specifically formulated for infants and children, being extra gentle. However, we always recommend doing a patch test on the forearm before full use, as even natural ingredients can irritate sensitive skin."
    },
    {
        question: "What is the shelf life of your products?",
        answer: "Since we use natural preservatives, our products typically have a shelf life of 12-18 months from the date of manufacture. Please check the bottom of the bottle/box for the exact expiry date."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive an SMS and Email with a tracking link. You can also visit the 'Track Order' page on our website and enter your Order ID."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-herbal-900 mb-6">Frequently Asked Questions</h1>
                    <p className="text-gray-600 font-serif italic">Your questions about our herbal legacy, answered.</p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-herbal-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full text-left p-6 md:p-8 flex justify-between items-center gap-4"
                            >
                                <span className="font-serif font-bold text-lg md:text-xl text-herbal-900">{faq.question}</span>
                                <span className={`transform transition-transform duration-300 text-herbal-500 ${openIndex === idx ? 'rotate-180' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="px-6 pb-6 md:px-8 md:pb-8 text-gray-600 leading-relaxed font-sans">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-[#FAFAF5] p-8 rounded-2xl border border-dashed border-herbal-200">
                    <h3 className="font-serif font-bold text-xl text-herbal-900 mb-2">Still have questions?</h3>
                    <p className="text-gray-500 mb-6">We're here to help you on your wellness journey.</p>
                    <a href="/contact" className="inline-block bg-herbal-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
