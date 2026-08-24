import React from 'react';

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-4 md:px-8 font-serif text-gray-800">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-herbal-100">
                <h1 className="text-3xl md:text-5xl font-bold text-herbal-900 mb-8 border-b border-herbal-100 pb-6">Refund Policy</h1>

                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-herbal-900">
                    <p className="lead text-xl text-gray-600 mb-8">
                        We want you to be completely satisfied with your purchase. If you're not, we're here to help.
                    </p>

                    <h3>Returns</h3>
                    <p>You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>

                    <h3>Refunds</h3>
                    <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment).</p>

                    <h3>Non-Returnable Items</h3>
                    <p>Certain types of items cannot be returned, liable to deteriorate or expire rapidly, such as perishable goods, personal care items (like soaps and shampoos if opened), and gift cards.</p>

                    <h3>Shipping</h3>
                    <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>

                    <h3>Contact Us</h3>
                    <p>If you have any questions on how to return your item to us, contact us at contact@gunasherbals.store.</p>
                </div>
            </div>
        </div>
    );
}
