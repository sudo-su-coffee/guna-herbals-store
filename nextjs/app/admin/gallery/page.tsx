'use client';

import React, { useState, useRef } from 'react';

// Interfaces for Media Assets
interface MediaAsset {
    id: string;
    url: string;
    name: string;
    size: number; // in KB
    date: string;
    optimized: boolean;
}

const initialImages: MediaAsset[] = [
    { id: '1', url: 'https://www.gunasherbals.store/images/about.jpg', name: 'brand-logo.jpg', size: 145, date: '2024-05-01', optimized: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', name: 'hair-oil-hero.jpg', size: 280, date: '2024-05-10', optimized: true },
    { id: '3', url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80', name: 'shampoo-display.jpg', size: 310, date: '2024-05-12', optimized: true },
];

const MAX_STORAGE_MB = 100; // 100MB Limit

export default function GalleryPage() {
    const [assets, setAssets] = useState<MediaAsset[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate Storage Stats
    const totalUsageKB = assets.reduce((acc, curr) => acc + curr.size, 0);
    const totalUsageMB = totalUsageKB / 1024;
    const usagePercentage = Math.min((totalUsageMB / MAX_STORAGE_MB) * 100, 100);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const originalSizeKB = file.size / 1024;

            // Start Simulation
            setIsUploading(true);
            setUploadProgress(0);

            // Simulation Interval for Upload + Optimization
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const reader = new FileReader();
            reader.onload = (event) => {
                // Simulate "Processing/Compression" delay
                setTimeout(() => {
                    clearInterval(interval);
                    setUploadProgress(100);

                    // Simulate URL with optimization params
                    const baseUrl = event.target?.result as string;
                    // In a real app, this would be the URL returned from the CDN after upload
                    const optimizedUrl = baseUrl.startsWith('data:') ? baseUrl : `${baseUrl}?w=800&q=80&auto=format`;

                    const newAsset: MediaAsset = {
                        id: Date.now().toString(),
                        url: optimizedUrl,
                        name: file.name,
                        size: Math.round(originalSizeKB * 0.7), // Simulate 30% compression savings
                        date: new Date().toISOString().split('T')[0],
                        optimized: true
                    };

                    setAssets(prev => [newAsset, ...prev]);
                    setIsUploading(false);
                    setUploadProgress(0);
                }, 2000);
            };
            reader.readAsDataURL(file);
        }
    };

    const deleteAsset = (id: string) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header & Storage Manager */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex-grow w-full md:w-auto">
                    <h1 className="text-2xl font-bold font-serif text-gray-800 mb-1">Media Library</h1>
                    <p className="text-gray-500 text-sm mb-4">Manage store images for products and banners.</p>

                    {/* Storage Bar */}
                    <div className="max-w-md">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                            <span>Storage Used</span>
                            <span>{totalUsageMB.toFixed(1)} MB / {MAX_STORAGE_MB} MB</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-herbal-600'}`}
                                style={{ width: `${usagePercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                            * Images are automatically compressed and served via global CDN for faster loading.
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`bg-herbal-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-herbal-900 transition-all flex items-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                <span>Compressing...</span>
                            </>
                        ) : (
                            <>
                                <span>☁️</span> Upload New
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Processing State Overlay */}
            {isUploading && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-herbal-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-2xl">⚙️</span>
                        </div>
                        <h3 className="font-bold text-lg text-herbal-900 mb-2">Optimizing Media</h3>
                        <p className="text-sm text-gray-500 mb-4">Compressing image for web performance...</p>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-herbal-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-2">{uploadProgress}% Complete</p>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {assets.map((asset) => (
                    <div key={asset.id} className="group relative aspect-square bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                        <div className="w-full h-3/4 overflow-hidden rounded-lg bg-gray-50 relative">
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            {asset.optimized && (
                                <span className="absolute top-1 right-1 bg-green-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
                                    OPT
                                </span>
                            )}
                        </div>
                        <div className="p-2">
                            <p className="text-xs font-bold text-gray-700 truncate" title={asset.name}>{asset.name}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-400 font-mono">{asset.size} KB</span>
                                <span className="text-[10px] text-gray-400">{new Date(asset.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-herbal-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button
                                onClick={() => navigator.clipboard.writeText(asset.url)}
                                className="text-white text-xs font-bold border border-white/30 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white hover:text-herbal-900 transition-colors w-24"
                            >
                                Copy URL
                            </button>
                            <button
                                onClick={() => deleteAsset(asset.id)}
                                className="text-red-100 text-xs font-bold border border-red-500/50 bg-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-colors w-24"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
