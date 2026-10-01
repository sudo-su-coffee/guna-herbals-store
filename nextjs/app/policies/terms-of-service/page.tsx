import React from 'react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-earth-50 pt-32 pb-20 px-4 md:px-8 font-serif text-gray-800">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-herbal-100">
                <h1 className="text-3xl md:text-5xl font-bold text-herbal-900 mb-8 border-b border-herbal-100 pb-6">Terms of Service</h1>

                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-herbal-900">
                    <p className="lead text-xl text-gray-600 mb-8">
                        Please read these Terms of Service carefully before accessing or using our website.
                    </p>

                    <h3>1. Overview</h3>
                    <p>This website is operated by Guna's Herbal Products. Throughout the site, the terms "we", "us" and "our" refer to Guna's Herbal Products. We offer this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>

                    <h3>2. Online Store Terms</h3>
                    <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose.</p>

                    <h3>3. Accuracy of Information</h3>
                    <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.</p>

                    <h3>4. Modifications to the Service and Prices</h3>
                    <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>

                    <h3>5. Products or Services</h3>
                    <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products.</p>

                    <h3>6. Medical Disclaimer</h3>
                    <p className="bg-orange-50 p-4 border-l-4 border-orange-400 text-orange-800">
                        The products and claims made about specific products on this site have not been evaluated by the FDA or similar health authorities. These products are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a healthcare professional before starting any new herbal regimen.
                    </p>

                    <h3>7. Contact Information</h3>
                    <p>Questions about the Terms of Service should be sent to us at contact@gunasherbals.store.</p>
                </div>
            </div>
        </div>
    );
}
