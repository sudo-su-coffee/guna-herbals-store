import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Guna's Herbal Products - Handcrafted Organic Wellness",
        short_name: "Guna's Herbals",
        description: "Shop authentic, handcrafted herbal products from Tenkasi, Tamil Nadu. Organic Shampoos, Soaps, and Oils made with traditional Siddha wisdom.",
        start_url: '/',
        display: 'standalone',
        background_color: '#F2EFE9',
        theme_color: '#1A332D',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
