export default function Loading() {
    return (
        <div className="min-h-screen bg-earth-50 flex items-center justify-center z-50 fixed inset-0">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-herbal-200 border-t-herbal-900 rounded-full animate-spin"></div>
                <p className="text-herbal-900 font-serif font-medium tracking-widest animate-pulse">BREWING...</p>
            </div>
        </div>
    );
}
