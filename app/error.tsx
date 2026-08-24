'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-herbal-50 to-earth-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 animate-fade-in">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-400 blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white p-6 rounded-full shadow-xl border-4 border-red-100">
                            <svg
                                className="w-20 h-20 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Error Content */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-herbal-900">
                        Oops! Something went wrong
                    </h1>
                    <p className="text-lg text-gray-600 font-light max-w-md mx-auto">
                        We encountered an unexpected error. Our team has been notified and we're working on it.
                    </p>

                    {/* Error Details (Dev Mode) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-6 text-left bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                            <summary className="cursor-pointer font-bold text-red-800 mb-2">
                                Error Details (Development Only)
                            </summary>
                            <pre className="text-xs text-red-700 overflow-auto max-h-40 bg-white p-2 rounded">
                                {error.message}
                            </pre>
                            {error.digest && (
                                <p className="mt-2 text-red-600 font-mono text-xs">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </details>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto bg-herbal-900 text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-herbal-800 transition-all shadow-md hover:shadow-lg"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="w-full sm:w-auto bg-white text-herbal-900 border-2 border-herbal-900 px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-herbal-50 transition-all text-center"
                    >
                        Go Home
                    </a>
                </div>

                {/* Support Link */}
                <div className="text-center pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Need help?{' '}
                        <a
                            href="/contact"
                            className="text-herbal-700 hover:text-herbal-900 font-medium underline"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
