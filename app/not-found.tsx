import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-earth-50 flex flex-col items-center justify-center text-center px-4 font-serif">
            <div className="w-24 h-24 bg-herbal-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🍃</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-herbal-900 mb-4">404</h2>
            <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
            <p className="text-gray-500 mb-8 max-w-md">
                The herbal remedy you are looking for seems to have been misplaced in our garden.
            </p>
            <Link href="/" className="bg-herbal-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors">
                Return Home
            </Link>
        </div>
    );
}
