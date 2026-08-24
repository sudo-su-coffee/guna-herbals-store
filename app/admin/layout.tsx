'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND_LOGO } from '@/lib/constants';
import { logout } from '@/lib/api';

interface AdminLayoutProps {
    children: ReactNode;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
    { id: 'orders', label: 'Orders', icon: '📦', href: '/admin/orders' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', href: '/admin/notifications' },
    { id: 'delivery', label: 'Logistics', icon: '🚚', href: '/admin/delivery' },
    { id: 'products', label: 'Products', icon: '🌿', href: '/admin/products' },
    { id: 'customers', label: 'Users & Roles', icon: '👥', href: '/admin/customers' },
    { id: 'security', label: 'Security Center', icon: '🛡️', href: '/admin/security' },
    { id: 'payments', label: 'Payments', icon: '💳', href: '/admin/payments' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️', href: '/admin/gallery' },
    { id: 'logs', label: 'Audit Logs', icon: '📜', href: '/admin/logs' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const currentViewLabel = navItems.find(item => pathname?.includes(item.id))?.label || 'Dashboard';

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-herbal-50/50 flex font-sans overflow-hidden">
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-herbal-900 text-white flex-shrink-0 flex flex-col shadow-2xl h-screen fixed lg:sticky top-0 transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 border-b border-herbal-800 flex-shrink-0 flex items-center justify-start gap-3">
                    <img src={BRAND_LOGO} alt="Guna's Logo" className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" />
                    <div>
                        <h2 className="text-lg font-serif font-bold leading-tight">Guna's</h2>
                        <p className="text-[10px] text-herbal-300 uppercase tracking-widest font-sans">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`w-full text-left px-4 py-3 rounded-lg capitalize transition-colors flex items-center gap-3 font-medium ${isActive
                                    ? 'bg-herbal-700 text-white shadow-inner'
                                    : 'text-gray-300 hover:bg-herbal-800 hover:text-white'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-herbal-800 space-y-2 flex-shrink-0">
                    <Link href="/" className="text-sm w-full px-2 py-2 rounded hover:bg-herbal-800 transition-colors flex items-center gap-2 text-herbal-200 block">
                        <span>🛍️</span> Back to Store
                    </Link>
                    <button onClick={handleLogout} className="text-sm w-full px-2 py-2 rounded hover:bg-red-900/50 transition-colors flex items-center gap-2 text-red-300">
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0 w-full h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 bg-[#FAFAF5]/90 backdrop-blur-md shadow-sm z-20 flex items-center justify-between p-4 border-b border-herbal-100 flex-shrink-0">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-herbal-900">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <img src={BRAND_LOGO} alt="Logo" className="w-8 h-8 rounded-full" />
                        <h2 className="font-bold text-lg text-herbal-900">{currentViewLabel}</h2>
                    </div>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
