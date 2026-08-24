export const BRAND_LOGO = "/images/logo.jpg";

export const ABOUT_TEXT = "Guna Herbals";

export const CONTACT_INFO = {
    address: "#11, Municipality Complex, Perumal Kovil Street, Opp. Canara Bank, Tenkasi, Tamil Nadu - 627811",
    phone: "+91 88701 89093",
    email: "contact@gunasherbals.store",
    whatsapp: "https://wa.me/918870189093",
    socials: {
        instagram: "https://instagram.com/gunasherbals",
        facebook: "https://facebook.com/gunasherbals",
        linkedin: "https://linkedin.com/company/gunasherbals"
    }
};

export const SITE_CONFIG = {
    name: "Guna Herbals",
    description: "Handcrafted herbal products from Tenkasi, Tamil Nadu using traditional Siddha formulations",
    url: "https://www.gunasherbals.store",
    popupOffer: {
        enabled: true,
        title: "Rooted in Nature",
        text: "Explore handcrafted herbal care from our home in Tenkasi.",
        image: "https://images.unsplash.com/photo-1540845511934-7721dd7adec3?auto=format&fit=crop&w=800&q=80"
    },
    shipping: {
        freeShippingThreshold: 500,
        standardRate: 50
    },
    payments: {
        codExtraCharge: 0
    }
};

export const BLOG_POSTS = [
    { id: 'herbal-hair-care', title: 'A gentler hair ritual', excerpt: 'Simple botanical habits for healthier-looking hair.', image: SITE_CONFIG.popupOffer.image, date: '2025-01-12', tags: ['Hair Care'], readTime: '4 min read', content: 'Small, consistent rituals make space for botanical care. Begin with a gentle cleanse, a considered oiling practice, and ingredients you can recognise.' },
    { id: 'siddha-at-home', title: 'The wisdom of Siddha care', excerpt: 'Why traditional ingredients still belong in modern routines.', image: SITE_CONFIG.popupOffer.image, date: '2025-02-08', tags: ['Herbal Wisdom'], readTime: '5 min read', content: 'Traditional Siddha-inspired care keeps the plant at the centre. At Guna Herbals, we respect that wisdom while making everyday use simple and approachable.' },
];

export const POLICIES = {
    return: 'Returns & Refunds\nPlease contact us within 7 days of delivery for support with damaged or incorrect items.',
    shipping: 'Shipping Policy\nOrders are carefully packed in Tenkasi and shipped across India. Free shipping is available on orders above ₹500.',
    privacy: 'Privacy Policy\nWe use your information only to process orders, provide support, and improve your experience.',
    terms: 'Terms of Service\nBy using this store, you agree to our product, payment, shipping, and support terms.',
    disclaimer: 'Disclaimer\nOur products are made for personal care and general wellness. Please consult a qualified professional for medical concerns.',
};
