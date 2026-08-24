
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BRAND_LOGO, ABOUT_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
    title: "Our Story - Guna's Herbal Legacy",
    description: "Discover the ancient Siddha traditions behind Guna's Hand Made Herbal Products. Rooted in Tenkasi, we craft authentic, chemical-free remedies.",
};

export default function About() {
    return (
        <div className="w-full bg-earth-50 pb-20 md:pb-32 pt-10 min-h-screen">
            {/* Editorial Header */}
            <div className="max-w-5xl mx-auto px-6 text-center mb-16 md:mb-24 relative">
                <span className="text-gold-600 uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold mb-4 md:mb-6 block font-sans animate-fade-in">Since 2018 • Tenkasi, India</span>
                <h1 className="text-4xl md:text-8xl font-serif text-herbal-900 mb-6 md:mb-8 leading-none animate-slide-up">
                    Guardians of <br /> <span className="italic font-light text-herbal-600">Ancient Wisdom</span>
                </h1>
                <div className="w-px h-16 md:h-24 bg-gradient-to-b from-herbal-900 to-transparent mx-auto opacity-20"></div>
            </div>

            {/* Our Story - Editorial Layout */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-20 md:mb-32">
                <div className="md:col-span-5 relative flex justify-center md:justify-center">
                    <div className="relative">
                        {/* Reduced size to w-40/h-40 on mobile */}
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden relative z-10 shadow-2xl border-4 border-earth-100">
                            <img src={BRAND_LOGO} alt="Founder" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                        {/* Decorative Border */}
                        <div className="absolute top-0 left-0 w-full h-full border border-gold-400/50 rounded-full z-0 transform translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4"></div>
                    </div>
                </div>
                <div className="md:col-span-1 hidden md:block"></div>
                <div className="md:col-span-6">
                    <h2 className="text-3xl md:text-5xl font-serif text-herbal-900 mb-6 md:mb-8 leading-tight text-center md:text-left">
                        Crafting Purity with <br /> <span className="italic text-gold-600">Vedic Traditions</span>
                    </h2>
                    <p className="text-lg md:text-xl text-herbal-800 font-serif leading-relaxed italic mb-6 md:mb-8 border-l-2 border-gold-400 pl-6">
                        "We don't just make products; we preserve a legacy. Every drop of oil and grain of powder carries the wisdom of our ancestors."
                    </p>
                    <div className="prose prose-lg text-gray-600 font-sans font-light leading-loose text-sm md:text-base text-justify md:text-left">
                        {ABOUT_TEXT.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                    <div className="mt-8 flex gap-6 items-center justify-center md:justify-start">
                        <div className="flex flex-col items-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" className="h-10 md:h-12 opacity-40 grayscale hover:grayscale-0 transition-all mb-2" title="Government Recognized" />
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Govt. Recog.</span>
                        </div>
                        <div className="h-10 md:h-12 w-px bg-earth-200"></div>
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-herbal-200 flex items-center justify-center text-[10px] md:text-xs text-herbal-800 font-serif text-center leading-none p-1 bg-white">100%<br />Natural</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ayurveda & Heritage Section */}
            <div className="bg-herbal-950 text-earth-50 py-16 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
                    {/* Abstract Pattern Overlay */}
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#smallGrid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12 md:mb-20">
                        <span className="text-gold-400 font-sans text-xs uppercase tracking-[0.25em] mb-4 block">Our Foundation</span>
                        <h2 className="text-3xl md:text-6xl font-serif text-white mb-4 md:mb-6">Rooted in Ayurveda</h2>
                        <p className="max-w-2xl mx-auto text-herbal-200 font-light text-sm md:text-lg leading-relaxed">
                            Our formulations are not invented; they are rediscovered. We adhere strictly to the preparation methods described in ancient Siddha and Ayurvedic texts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="text-center p-8 md:p-10 border border-herbal-800 rounded-2xl hover:bg-herbal-900 transition-colors group cursor-default">
                            <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 opacity-80">🧘</div>
                            <h3 className="text-xl md:text-2xl font-serif text-gold-400 mb-3 md:mb-4">Siddha Tradition</h3>
                            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                                Hailing from Tenkasi, the land of Pothigai Hills and Sage Agasthiyar, our products carry the essence of authentic Siddha medicine.
                            </p>
                        </div>
                        <div className="text-center p-8 md:p-10 border border-herbal-800 rounded-2xl hover:bg-herbal-900 transition-colors group cursor-default">
                            <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 opacity-80">🏛️</div>
                            <h3 className="text-xl md:text-2xl font-serif text-gold-400 mb-3 md:mb-4">Govt. Recognized</h3>
                            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                                Registered with the MSME and recognized by the Government of India for promoting sustainable, village-based industries.
                            </p>
                        </div>
                        <div className="text-center p-8 md:p-10 border border-herbal-800 rounded-2xl hover:bg-herbal-900 transition-colors group cursor-default">
                            <div className="text-4xl md:text-5xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 opacity-80">🍃</div>
                            <h3 className="text-xl md:text-2xl font-serif text-gold-400 mb-3 md:mb-4">Farm to Bottle</h3>
                            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                                We directly partner with organic farmers in Tamil Nadu to source the freshest hibiscus, aloe vera, and coconuts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moved from the homepage: brand story and proof points */}
            <section className="bg-[#e8e2d5] px-6 py-20 md:px-12 md:py-28">
                <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-20">
                    <div className="relative min-h-[390px] overflow-hidden bg-[#19372f]">
                        <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85" alt="Raw herbal ingredients" className="absolute inset-0 h-full w-full object-cover opacity-65" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#19372f] to-transparent" />
                        <div className="relative flex min-h-[390px] flex-col justify-end p-8 text-[#f8f5ed] md:p-12">
                            <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#d6b875]">From our home to yours</p>
                            <h2 className="mt-4 max-w-md text-4xl md:text-5xl">Beauty that remembers.</h2>
                        </div>
                    </div>
                    <div>
                        <p className="mb-4 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Our everyday philosophy</p>
                        <h2 className="text-4xl leading-tight md:text-6xl">Rooted in care,<br /><em className="font-normal text-[#a4864d]">made for today.</em></h2>
                        <p className="mt-7 max-w-md text-base leading-7 text-[#54635c]">Our formulas are inspired by recipes shared across generations in Tamil homes. We keep the ingredients close to their natural form, the batches considered, and the experience distinctly human.</p>
                        <div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-[#cfc6b4] pt-6">{[['55+', 'Herbal essentials'], ['2018', 'Since our first batch'], ['100%', 'Made with care'], ['Tenkasi', 'Our home']].map(([value, label]) => <div key={label}><p className="text-2xl text-[#19372f]">{value}</p><p className="mt-1 text-[10px] font-sans uppercase tracking-[0.16em] text-[#8a877d]">{label}</p></div>)}</div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
                <div className="mb-10 text-center"><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Why Guna</p><h2 className="text-4xl md:text-6xl">A better kind of<br /><em className="font-normal text-[#a4864d]">everyday care.</em></h2></div>
                <div className="grid gap-5 md:grid-cols-3">{[['Made in small batches', 'Fresh formulas, thoughtful preparation, and no unnecessary fuss.'], ['Ingredients with a story', 'Traditional botanicals selected for familiar, useful rituals.'], ['Care that feels personal', 'From our Tenkasi shelves to your home, packed with warmth.']].map(([title, text], index) => <div key={title} className="border-t border-[#cfc6b4] pt-5"><span className="font-sans text-xs text-[#a4864d]">0{index + 1}</span><h3 className="mt-8 text-2xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#68756d]">{text}</p></div>)}</div>
            </section>

            {/* EXTENDED SECTIONS */}
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-16 md:space-y-24">

                {/* The Academy Section */}
                <div className="bg-earth-200 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                        <img src="https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-90" />
                        <div className="absolute inset-0 bg-herbal-900/40 mix-blend-multiply"></div>
                    </div>
                    <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center text-center md:text-left">
                        <span className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-herbal-900 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 inline-block shadow-sm self-center md:self-start">The Guna Academy</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-herbal-900 mb-4 md:mb-6">Pass on the Legacy</h2>
                        <p className="text-gray-700 text-base md:text-lg font-serif italic mb-6 md:mb-8 leading-relaxed">
                            "Knowledge increases by sharing. Join our hands-on workshops to learn the art of herbal soap making and oil extraction."
                        </p>
                        <ul className="text-left space-y-3 mb-8 md:mb-10 text-gray-700 text-xs md:text-sm font-sans mx-auto md:mx-0">
                            <li className="flex items-center gap-3">✓ Handmade Soap Making Workshop</li>
                            <li className="flex items-center gap-3">✓ Herbal Oil Formulation</li>
                            <li className="flex items-center gap-3">✓ Traditional Shampoo Preparation</li>
                        </ul>
                        <Link
                            href="/training"
                            className="bg-herbal-900 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-sans text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 self-center md:self-start inline-block text-center"
                        >
                            View Workshops
                        </Link>
                    </div>
                </div>

                {/* Wholesale Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-earth-200 flex flex-col md:flex-row-reverse">
                    <div className="md:w-1/2 relative h-64 md:h-auto bg-earth-100">
                        <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-5xl font-serif text-herbal-900 mb-4 md:mb-6">Wholesale & B2B</h2>
                        <p className="text-gray-600 font-light text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                            Are you an artisan or a small business? We supply premium, raw materials sourced directly from the foothills.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8 md:mb-10 text-xs md:text-sm font-bold text-herbal-800">
                            <div className="border-b border-herbal-100 pb-2">Cold Pressed Oils</div>
                            <div className="border-b border-herbal-100 pb-2">Herbal Powders</div>
                            <div className="border-b border-herbal-100 pb-2">Soap Bases</div>
                            <div className="border-b border-herbal-100 pb-2">Dried Flowers</div>
                        </div>
                        <Link
                            href="/raw-materials"
                            className="border border-herbal-900 text-herbal-900 px-8 md:px-10 py-3 md:py-4 rounded-full font-sans text-xs uppercase tracking-widest hover:bg-herbal-900 hover:text-white transition-colors self-start inline-block text-center"
                        >
                            Browse Raw Materials
                        </Link>
                    </div>
                </div>

            </div>

        </div>
    );
}
