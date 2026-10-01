import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-4 md:px-8 font-serif text-gray-800">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-herbal-100">
                <h1 className="text-3xl md:text-5xl font-bold text-herbal-900 mb-8 border-b border-herbal-100 pb-6">Privacy Policy</h1>

                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-herbal-900 prose-a:text-herbal-700 hover:prose-a:text-herbal-900">
                    <p className="lead text-xl text-gray-600 mb-8">
                        At Guna's Herbal Products, we are committed to respecting and protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter. This may include your name, email address, phone number, shipping address, and payment information.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Process and fulfill your orders.</li>
                        <li>Communicate with you about your account and orders.</li>
                        <li>Send you marketing communications (if you have opted in).</li>
                        <li>Improve our website and customer service.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>

                    <h3>3. Sharing of Information</h3>
                    <p>We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our website, conducting our business, or serving our users, such as payment processors (Razorpay, PayU) and shipping partners.</p>

                    <h3>4. Data Security</h3>
                    <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights.</p>

                    <h3>5. Cookies</h3>
                    <p>We use cookies to enhance your experience, gather general visitor information, and track visits to our website. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies.</p>

                    <h3>6. Your Rights</h3>
                    <p>You have the right to access, correct, or delete your personal information. You can update your account information directly through your profile settings.</p>

                    <h3>7. Changes to this Policy</h3>
                    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

                    <p className="border-t border-gray-100 pt-6 mt-8 text-sm text-gray-500">
                        Last Updated: January 2026<br />
                        Contact: contact@gunasherbals.store
                    </p>
                </div>
            </div>
        </div>
    );
}
