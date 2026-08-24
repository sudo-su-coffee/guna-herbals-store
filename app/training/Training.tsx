
import React, { useEffect } from 'react';
import { ViewState } from '../../types';
import { updateMetaTags } from '../../utils/seoHelper';

interface TrainingProps {
  setView: (view: ViewState) => void;
}

const Training: React.FC<TrainingProps> = ({ setView }) => {
  useEffect(() => {
      updateMetaTags(
          "Herbal Formulation Workshops & Training", 
          "Join the Guna Academy in Tenkasi to learn the art of making organic soaps, herbal oils, and shampoos from expert artisans."
      );
  }, []);

  return (
    <div className="w-full min-h-screen bg-white pt-20">
        {/* Hero */}
        <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-herbal-950 text-white">
            <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80" 
                className="absolute inset-0 w-full h-full object-cover opacity-30" 
            />
            <div className="relative z-10 text-center px-4 md:px-6 mt-8">
                <div className="inline-block border border-white/30 px-3 py-1 md:px-4 md:py-1 rounded-full mb-4 md:mb-6 backdrop-blur-sm">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">Est. 2020</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4 md:mb-6">The Guna Academy</h1>
                <p className="text-lg md:text-2xl font-light text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Master the art of traditional herbal formulation. <br className="hidden md:block"/>
                    Workshops designed for hobbyists and entrepreneurs.
                </p>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">
                <div className="order-2 md:order-1">
                    <h2 className="text-3xl md:text-4xl font-serif text-herbal-900 mb-4 md:mb-6">Handmade Soap Making Workshop</h2>
                    <p className="text-gray-600 leading-loose mb-6 md:mb-8 text-base md:text-lg">
                        Learn the cold-process method of soap making using organic oils and natural botanicals. 
                        Our master artisans will guide you through safety, formulation, and design techniques.
                        Perfect for beginners who want to start their own natural skincare line.
                    </p>
                    <ul className="space-y-3 md:space-y-4 mb-8 text-gray-700 text-sm md:text-base">
                        <li className="flex items-center gap-3"><span className="text-herbal-600">✓</span> Understanding Oil Properties</li>
                        <li className="flex items-center gap-3"><span className="text-herbal-600">✓</span> Lye Safety & Calculation</li>
                        <li className="flex items-center gap-3"><span className="text-herbal-600">✓</span> Natural Colorants & Fragrances</li>
                        <li className="flex items-center gap-3"><span className="text-herbal-600">✓</span> Swirl Techniques</li>
                    </ul>
                    <button onClick={() => setView(ViewState.ENQUIRY)} className="bg-herbal-800 text-white px-8 py-3 md:py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-herbal-900 shadow-lg text-xs md:text-sm w-full md:w-auto">
                        Request Syllabus
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 order-1 md:order-2">
                    <img src="https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=600&q=80" className="rounded-2xl shadow-lg mt-8 w-full object-cover aspect-[3/4]" />
                    <img src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=600&q=80" className="rounded-2xl shadow-lg w-full object-cover aspect-[3/4]" />
                </div>
            </div>

            <div className="bg-earth-100 rounded-3xl p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-herbal-900 mb-2 md:mb-4">Upcoming Schedule</h2>
                <p className="text-gray-600 mb-8 text-sm md:text-base">Join us at our Tenkasi Center.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
                    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">June 15</span>
                        <h3 className="font-bold text-base md:text-lg mt-2 mb-1">Soap Making 101</h3>
                        <p className="text-xs md:text-sm text-gray-500">1 Day Intensive • ₹2,500</p>
                    </div>
                    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">June 22</span>
                        <h3 className="font-bold text-base md:text-lg mt-2 mb-1">Advanced Herbal Oils</h3>
                        <p className="text-xs md:text-sm text-gray-500">2 Day Workshop • ₹4,500</p>
                    </div>
                    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">July 05</span>
                        <h3 className="font-bold text-base md:text-lg mt-2 mb-1">Shampoo Formulation</h3>
                        <p className="text-xs md:text-sm text-gray-500">1 Day Intensive • ₹3,000</p>
                    </div>
                </div>
                
                <div className="mt-8 md:mt-12">
                    <button onClick={() => setView(ViewState.ENQUIRY)} className="text-herbal-800 font-bold underline hover:text-black text-sm md:text-base">Register Interest for Next Batch</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Training;
