
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Bulk Herbal Raw Materials - B2B Supplier",
    description: "Sourcing premium organic ingredients for artisans and businesses. Cold pressed oils, herbal powders, and natural bases from Tamil Nadu.",
};

export default function RawMaterials() {
    const materials = [
        { name: "Cold Pressed Coconut Oil", unit: "1 Liter", price: "₹350", desc: "Pure, sulphur-free oil from Tenkasi farms." },
        { name: "Raw Shea Butter", unit: "500g", price: "₹850", desc: "Unrefined, Grade A imported butter." },
        { name: "Hibiscus Flower Powder", unit: "1 Kg", price: "₹600", desc: "Sun-dried and finely milled." },
        { name: "Aloe Vera Gel Base", unit: "1 Kg", price: "₹400", desc: "99% pure gel for cosmetic formulation." },
        { name: "Soap Base (Goat Milk)", unit: "1 Kg", price: "₹380", desc: "Melt and pour base, SLS free." },
        { name: "Essential Oil (Lavender)", unit: "100ml", price: "₹1200", desc: "Steam distilled therapeutic grade." },
    ];

    return (
        <div className="w-full min-h-screen bg-earth-100 pt-20 md:pt-24 pb-20">
            <div className="bg-herbal-900 text-white py-12 md:py-16 px-4 md:px-6 relative overflow-hidden mb-8 md:mb-12">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="text-gold-400 font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 md:mb-4 block">B2B & Wholesale</span>
                    <h1 className="text-3xl md:text-6xl font-serif font-bold mb-4">Raw Materials</h1>
                    <p className="text-white/80 max-w-2xl mx-auto font-light text-sm md:text-lg">
                        Premium quality ingredients for artisans, soap makers, and small businesses. Sourced directly from nature.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-earth-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-earth-200 text-herbal-900 font-serif text-base md:text-lg">
                                <tr>
                                    <th className="px-6 py-4 md:px-8 md:py-6 font-bold">Material Name</th>
                                    <th className="px-6 py-4 md:px-8 md:py-6 font-bold">Description</th>
                                    <th className="px-6 py-4 md:px-8 md:py-6 font-bold">Unit Size</th>
                                    <th className="px-6 py-4 md:px-8 md:py-6 font-bold">Est. Price</th>
                                    <th className="px-6 py-4 md:px-8 md:py-6 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-100 text-sm md:text-base">
                                {materials.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-earth-50 transition-colors group">
                                        <td className="px-6 py-4 md:px-8 md:py-6 font-bold text-herbal-900">{item.name}</td>
                                        <td className="px-6 py-4 md:px-8 md:py-6 text-gray-600 font-light">{item.desc}</td>
                                        <td className="px-6 py-4 md:px-8 md:py-6 text-gray-800 font-mono text-xs md:text-sm">{item.unit}</td>
                                        <td className="px-6 py-4 md:px-8 md:py-6 text-gray-800 font-bold">{item.price}</td>
                                        <td className="px-6 py-4 md:px-8 md:py-6">
                                            <Link
                                                href={`/contact?type=enquiry&product=${encodeURIComponent(item.name)}`}
                                                className="bg-herbal-800 text-white px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md whitespace-nowrap inline-block text-center"
                                            >
                                                Enquire
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 md:p-8 bg-earth-50 border-t border-earth-200 text-center">
                        <p className="text-gray-600 mb-4 font-serif italic text-sm md:text-base">Looking for something specific? We can source rare herbs upon request.</p>
                        <Link
                            href="/contact?type=procurement"
                            className="text-herbal-800 font-bold underline hover:text-black text-sm md:text-base"
                        >
                            Contact Procurement Team
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
