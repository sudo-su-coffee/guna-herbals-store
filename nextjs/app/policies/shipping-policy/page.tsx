import React from 'react';

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-4 md:px-8 font-serif text-gray-800">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-herbal-100">
                <h1 className="text-3xl md:text-5xl font-bold text-herbal-900 mb-8 border-b border-herbal-100 pb-6">Shipping Policy</h1>

                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-herbal-900">
                    <p className="lead text-xl text-gray-600 mb-8">
                        We strive to deliver your herbal products safely and quickly, directly from our facility in Tenkasi to your doorstep.
                    </p>

                    <h3>Processing Time</h3>
                    <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>

                    <h3>Shipping Rates & Delivery Estimates</h3>
                    <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
                    <div className="not-prose bg-gray-50 p-6 rounded-xl border border-gray-100 my-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="font-bold">Standard Shipping</div>
                            <div>5-7 Business Days</div>
                            <div className="font-bold">Express Shipping</div>
                            <div>2-3 Business Days</div>
                        </div>
                    </div>
                    <p>Free shipping is available for orders over ₹500.</p>

                    <h3>Shipment Confirmation & Order Tracking</h3>
                    <p>You will receive a Shipment Confirmation email containing your tracking number(s) once your order has shipped. The tracking number will be active within 24 hours.</p>

                    <h3>Damages</h3>
                    <p>Guna's Herbal Products is not liable for any products damaged or lost during shipping. However, if you received your order damaged, please contact us immediately so we can file a claim with the shipment carrier.</p>

                    <h3>International Shipping</h3>
                    <p>We currently ship only within India. We are working on expanding our reach to international customers soon.</p>
                </div>
            </div>
        </div>
    );
}
