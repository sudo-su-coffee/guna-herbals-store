'use client';

import { useState, useRef } from 'react';
import { BRAND_LOGO } from '@/lib/constants';

export default function InstagramCarouselPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

    const slides = [
        {
            id: 1,
            title: "We're Live! 🌿",
            subtitle: "New Website Launch",
            description: "Experience our handcrafted herbal products in a whole new way",
            gradient: "from-herbal-900 via-herbal-700 to-herbal-600",
            icon: "✨"
        },
        {
            id: 2,
            title: "Shop Smarter",
            subtitle: "Enhanced Shopping Experience",
            description: "Browse our collection with improved navigation and product details",
            gradient: "from-earth-700 via-earth-600 to-earth-500",
            icon: "🛍️"
        },
        {
            id: 3,
            title: "Track Orders",
            subtitle: "Real-Time Updates",
            description: "Stay informed about your order status from dispatch to delivery",
            gradient: "from-herbal-800 via-herbal-600 to-gold-500",
            icon: "📦"
        },
        {
            id: 4,
            title: "Secure Checkout",
            subtitle: "Safe & Fast Payments",
            description: "Multiple payment options with bank-grade security",
            gradient: "from-gold-600 via-gold-500 to-gold-400",
            icon: "🔒"
        },
        {
            id: 5,
            title: "Visit Us Today",
            subtitle: "www.gunasherbals.store",
            description: "Pure • Potent • Tradition-Rich",
            gradient: "from-herbal-950 via-herbal-800 to-herbal-700",
            icon: "🌱",
            cta: true
        }
    ];

    const downloadSlide = async (index: number) => {
        const slide = slideRefs.current[index];
        if (!slide) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(slide, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                width: 1080,
                height: 1080,
            });

            const link = document.createElement('a');
            link.download = `gunas-herbals-slide-${index + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error downloading slide:', error);
            alert('Please install html2canvas: npm install html2canvas');
        }
    };

    const downloadAll = async () => {
        for (let i = 0; i < slides.length; i++) {
            await downloadSlide(i);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-herbal-50 via-earth-50 to-herbal-100 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-herbal-900 mb-4">
                        Instagram Carousel Generator
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        New Website Launch Announcement
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={downloadAll}
                            className="bg-herbal-900 text-white px-8 py-3 rounded-full font-bold hover:bg-herbal-800 transition-all shadow-lg hover:shadow-xl"
                        >
                            Download All Slides
                        </button>
                        <button
                            onClick={() => downloadSlide(currentSlide)}
                            className="bg-white text-herbal-900 px-8 py-3 rounded-full font-bold hover:bg-herbal-50 transition-all shadow-lg border-2 border-herbal-900"
                        >
                            Download Current Slide
                        </button>
                    </div>
                </div>

                {/* Preview Navigation */}
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${currentSlide === index
                                    ? 'bg-herbal-900 w-8'
                                    : 'bg-herbal-300 hover:bg-herbal-500'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Current Slide Preview */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <div className="aspect-square relative overflow-hidden rounded-2xl">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                >
                                    <SlideContent slide={slide} ref={(el) => (slideRefs.current[index] = el)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* All Slides Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-herbal-900 mb-6 text-center">
                        All Slides Preview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slides.map((slide, index) => (
                            <div key={slide.id} className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow">
                                <div className="aspect-square relative overflow-hidden rounded-xl mb-4">
                                    <SlideContent slide={slide} isPreview />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => downloadSlide(index)}
                                        className="flex-1 bg-herbal-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-herbal-800 transition-all"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => setCurrentSlide(index)}
                                        className="flex-1 bg-herbal-100 text-herbal-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-herbal-200 transition-all"
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-herbal-900 mb-4">📱 How to Use</h3>
                    <ol className="space-y-3 text-gray-700">
                        <li className="flex gap-3">
                            <span className="font-bold text-herbal-900">1.</span>
                            <span>Click "Download All Slides" to save all 5 carousel images</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-herbal-900">2.</span>
                            <span>Open Instagram and create a new post</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-herbal-900">3.</span>
                            <span>Select multiple images (all 5 slides in order)</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-herbal-900">4.</span>
                            <span>Add your caption and hashtags</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-herbal-900">5.</span>
                            <span>Post and share with your followers! 🎉</span>
                        </li>
                    </ol>

                    <div className="mt-6 p-4 bg-herbal-50 rounded-xl">
                        <h4 className="font-bold text-herbal-900 mb-2">Suggested Caption:</h4>
                        <p className="text-sm text-gray-700 italic">
                            "🌿 Exciting News! Our new website is LIVE! ✨<br /><br />
                            Swipe to discover what's new 👉<br /><br />
                            🛍️ Enhanced shopping experience<br />
                            📦 Real-time order tracking<br />
                            🔒 Secure checkout<br />
                            🌱 Same pure, handcrafted products you love<br /><br />
                            Visit us: www.gunasherbals.store<br /><br />
                            #GunasHerbals #NewWebsite #HerbalProducts #OrganicLiving #SiddhaWisdom #Tenkasi #TamilNadu #NaturalBeauty #HandcraftedWithLove"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SlideProps {
    slide: {
        title: string;
        subtitle: string;
        description: string;
        gradient: string;
        icon: string;
        cta?: boolean;
    };
    isPreview?: boolean;
}

const SlideContent = ({ slide, isPreview = false }: SlideProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div
            ref={ref}
            className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex flex-col items-center justify-center p-12 relative overflow-hidden`}
            style={{ width: '1080px', height: '1080px' }}
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8">
                {/* Icon */}
                <div className="text-8xl mb-4 animate-bounce">
                    {slide.icon}
                </div>

                {/* Title */}
                <h2 className="text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                    {slide.title}
                </h2>

                {/* Subtitle */}
                <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full">
                    <p className="text-2xl md:text-3xl font-semibold text-white/90">
                        {slide.subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {slide.description}
                </p>

                {/* CTA for last slide */}
                {slide.cta && (
                    <div className="mt-12 space-y-6">
                        <div className="bg-white rounded-2xl p-6 inline-block">
                            <img
                                src={BRAND_LOGO}
                                alt="Guna's Herbals"
                                className="h-24 w-24 object-contain mx-auto mb-4"
                            />
                            <p className="text-3xl font-bold text-herbal-900">
                                Guna's Herbal Products
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide Number */}
            <div className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white font-bold text-lg">
                    {slide.id}/5
                </p>
            </div>

            {/* Brand Watermark */}
            {!slide.cta && (
                <div className="absolute bottom-8 left-8">
                    <p className="text-white/60 text-sm font-semibold">
                        @gunasherbals
                    </p>
                </div>
            )}
        </div>
    );
};

SlideContent.displayName = 'SlideContent';

const SlideContentWithRef = ({ slide, isPreview = false }: SlideProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div
            ref={ref}
            className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex flex-col items-center justify-center ${isPreview ? 'p-4 text-xs' : 'p-12'
                } relative overflow-hidden`}
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 md:w-96 md:h-96 bg-black/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-4 md:space-y-8">
                {/* Icon */}
                <div className={`${isPreview ? 'text-4xl' : 'text-8xl'} mb-2 md:mb-4`}>
                    {slide.icon}
                </div>

                {/* Title */}
                <h2 className={`${isPreview ? 'text-2xl' : 'text-5xl md:text-7xl'} font-bold text-white leading-tight tracking-tight`}>
                    {slide.title}
                </h2>

                {/* Subtitle */}
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 md:px-8 py-2 md:py-3 rounded-full">
                    <p className={`${isPreview ? 'text-sm' : 'text-xl md:text-3xl'} font-semibold text-white/90`}>
                        {slide.subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className={`${isPreview ? 'text-xs' : 'text-lg md:text-2xl'} text-white/80 max-w-2xl mx-auto leading-relaxed px-4`}>
                    {slide.description}
                </p>

                {/* CTA for last slide */}
                {slide.cta && (
                    <div className="mt-6 md:mt-12 space-y-4 md:space-y-6">
                        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 inline-block">
                            <img
                                src={BRAND_LOGO}
                                alt="Guna's Herbals"
                                className={`${isPreview ? 'h-12 w-12' : 'h-16 md:h-24 w-16 md:w-24'} object-contain mx-auto mb-2 md:mb-4`}
                            />
                            <p className={`${isPreview ? 'text-lg' : 'text-2xl md:text-3xl'} font-bold text-herbal-900`}>
                                Guna's Herbal Products
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide Number */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1 md:py-2 rounded-full">
                <p className={`text-white font-bold ${isPreview ? 'text-xs' : 'text-lg'}`}>
                    {slide.id}/5
                </p>
            </div>

            {/* Brand Watermark */}
            {!slide.cta && (
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
                    <p className={`text-white/60 ${isPreview ? 'text-xs' : 'text-sm'} font-semibold`}>
                        @gunasherbals
                    </p>
                </div>
            )}
        </div>
    );
};

SlideContentWithRef.displayName = 'SlideContentWithRef';
