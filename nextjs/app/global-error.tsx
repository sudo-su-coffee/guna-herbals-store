'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="bg-earth-50 text-center flex flex-col items-center justify-center min-h-screen font-serif">
                <h2 className="text-2xl font-bold text-herbal-900 mb-4">Something went wrong!</h2>
                <p className="text-gray-600 mb-6">Our herbalists are looking into it.</p>
                <button
                    onClick={() => reset()}
                    className="bg-herbal-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
