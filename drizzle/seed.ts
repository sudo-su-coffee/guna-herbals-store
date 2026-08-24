import 'dotenv/config';
import { db } from '../lib/db';
import bcrypt from 'bcryptjs';
import {
    users,
    userProfiles,
    categories,
    brands,
    products,
    productVariants,
    productImages,
    warehouses,
    inventory,
    coupons,
    banners,
    discounts,
} from './schema';

async function seed() {
    console.log('🌱 Seeding Gunas Herbals database...');

    try {
        // Hash password for admin
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // 1. Seed Admin User
        console.log('👤 Seeding admin user...');
        const adminUser = await db
            .insert(users)
            .values({
                name: 'Admin User',
                email: 'admin@gunasherbals.store',
                phone: '9876543210',
                passwordHash: hashedPassword,
                role: 'admin',
                status: 'active',
                emailVerified: true,
                phoneVerified: true,
            })
            .onConflictDoNothing()
            .returning();

        if (adminUser.length > 0) {
            await db
                .insert(userProfiles)
                .values({
                    userId: adminUser[0].id,
                    firstName: 'Admin',
                    lastName: 'User',
                })
                .onConflictDoNothing();
        }
        console.log('✅ Seeded admin user');

        // 2. Seed Test Customer
        console.log('👤 Seeding test customer...');
        const customerPassword = await bcrypt.hash('password123', 10);
        const testCustomer = await db
            .insert(users)
            .values({
                name: 'Test Customer',
                email: 'customer@gunasherbals.com',
                phone: '9876543211',
                passwordHash: customerPassword,
                role: 'customer',
                status: 'active',
                emailVerified: true,
            })
            .onConflictDoNothing()
            .returning();

        if (testCustomer.length > 0) {
            await db
                .insert(userProfiles)
                .values({
                    userId: testCustomer[0].id,
                    firstName: 'Test',
                    lastName: 'Customer',
                })
                .onConflictDoNothing();
        }
        console.log('✅ Seeded test customer');

        // 3. Seed Categories
        console.log('📂 Seeding categories...');
        const categoriesData = [
            {
                name: 'Herbal Oils',
                slug: 'herbal-oils',
                description: 'Pure herbal oils for hair and skin care',
                imageUrl: '/images/categories/oils.jpg',
                displayOrder: 1,
            },
            {
                name: 'Herbal Shampoos',
                slug: 'herbal-shampoos',
                description: 'Natural shampoos for healthy hair',
                imageUrl: '/images/categories/shampoos.jpg',
                displayOrder: 2,
            },
            {
                name: 'Herbal Soaps',
                slug: 'herbal-soaps',
                description: 'Ayurvedic soaps for glowing skin',
                imageUrl: '/images/categories/soaps.jpg',
                displayOrder: 3,
            },
            {
                name: 'Herbal Creams',
                slug: 'herbal-creams',
                description: 'Natural creams for skin care',
                imageUrl: '/images/categories/creams.jpg',
                displayOrder: 4,
            },
            {
                name: 'Hair Care',
                slug: 'hair-care',
                description: 'Complete hair care solutions',
                imageUrl: '/images/categories/hair-care.jpg',
                displayOrder: 5,
            },
            {
                name: 'Skin Care',
                slug: 'skin-care',
                description: 'Natural skin care products',
                imageUrl: '/images/categories/skin-care.jpg',
                displayOrder: 6,
            },
            {
                name: 'Wellness',
                slug: 'wellness',
                description: 'Health and wellness products',
                imageUrl: '/images/categories/wellness.jpg',
                displayOrder: 7,
            },
        ];

        const insertedCategories = await db
            .insert(categories)
            .values(categoriesData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedCategories.length} categories`);

        // 4. Seed Brands
        console.log('🏷️ Seeding brands...');
        const brandsData = [
            {
                name: 'Gunas Herbals',
                slug: 'gunas-herbals',
                description: 'Pure herbal products from the heart of nature',
                logoUrl: '/images/brands/gunas-herbals.png',
                isActive: true,
            },
            {
                name: 'Ayurveda Heritage',
                slug: 'ayurveda-heritage',
                description: 'Traditional Ayurvedic formulations',
                logoUrl: '/images/brands/ayurveda-heritage.png',
                isActive: true,
            },
            {
                name: 'Nature Pure',
                slug: 'nature-pure',
                description: '100% natural and organic products',
                logoUrl: '/images/brands/nature-pure.png',
                isActive: true,
            },
            {
                name: 'Herbal Bliss',
                slug: 'herbal-bliss',
                description: 'Blissful herbal solutions',
                logoUrl: '/images/brands/herbal-bliss.png',
                isActive: true,
            },
        ];

        const insertedBrands = await db
            .insert(brands)
            .values(brandsData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedBrands.length} brands`);

        // Get category IDs for reference
        const oilsCategory = insertedCategories.find(c => c.slug === 'herbal-oils');
        const shampoosCategory = insertedCategories.find(c => c.slug === 'herbal-shampoos');
        const soapsCategory = insertedCategories.find(c => c.slug === 'herbal-soaps');
        const creamsCategory = insertedCategories.find(c => c.slug === 'herbal-creams');
        const hairCareCategory = insertedCategories.find(c => c.slug === 'hair-care');
        const skinCareCategory = insertedCategories.find(c => c.slug === 'skin-care');

        // Get brand IDs for reference
        const gunasBrand = insertedBrands.find(b => b.slug === 'gunas-herbals');
        const ayurvedaBrand = insertedBrands.find(b => b.slug === 'ayurveda-heritage');
        const natureBrand = insertedBrands.find(b => b.slug === 'nature-pure');
        const herbalBlissBrand = insertedBrands.find(b => b.slug === 'herbal-bliss');

        // 5. Seed Products
        console.log('📦 Seeding products...');
        const productsData = [
            // Hair Oils
            {
                name: 'Gunas Amla Hair Oil',
                slug: 'gunas-amla-hair-oil',
                description: 'Enriched with pure Amla extract, this hair oil promotes hair growth, prevents premature greying, and strengthens hair roots. Suitable for all hair types.',
                shortDescription: 'Amla enriched hair oil for growth and strength',
                brandId: gunasBrand?.id,
                categoryId: oilsCategory?.id,
                isActive: true,
                isFeatured: true,
                metaTitle: 'Gunas Amla Hair Oil - Best Hair Growth Oil',
                metaDescription: 'Buy Gunas Amla Hair Oil for natural hair growth, strength, and shine. 100% herbal formulation.',
                metaKeywords: 'amla hair oil, hair growth oil, herbal hair oil, gunas herbals',
            },
            {
                name: 'Bhringraj Hair Oil',
                slug: 'bhringraj-hair-oil',
                description: 'Made with authentic Bhringraj herb, this oil helps reduce hair fall, promotes new hair growth, and improves scalp health. Contains natural herbs for complete hair care.',
                shortDescription: 'Bhringraj oil for hair fall control and growth',
                brandId: ayurvedaBrand?.id,
                categoryId: oilsCategory?.id,
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Coconut Hair Oil',
                slug: 'coconut-hair-oil',
                description: 'Pure coconut oil infused with hibiscus and curry leaves for deep conditioning, shine, and hair strength. Prevents split ends and breakage.',
                shortDescription: 'Coconut oil with hibiscus for shiny hair',
                brandId: natureBrand?.id,
                categoryId: oilsCategory?.id,
                isActive: true,
            },
            // Shampoos
            {
                name: 'Amla & Shikakai Shampoo',
                slug: 'amla-shikakai-shampoo',
                description: 'Chemical-free shampoo with Amla and Shikakai. Cleanses hair naturally, promotes growth, and maintains natural oil balance. No SLS, Parabens, or Silicones.',
                shortDescription: 'Natural shampoo with amla and shikakai',
                brandId: gunasBrand?.id,
                categoryId: shampoosCategory?.id,
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Neem & Tulsi Anti-Dandruff Shampoo',
                slug: 'neem-tulsi-anti-dandruff-shampoo',
                description: 'Fights dandruff and scalp infections with Neem and Tulsi. Soothes itchy scalp and prevents flakiness. Gentle formula suitable for daily use.',
                shortDescription: 'Neem tulsi shampoo for dandruff control',
                brandId: ayurvedaBrand?.id,
                categoryId: shampoosCategory?.id,
                isActive: true,
            },
            {
                name: 'Aloe Vera & Hibiscus Shampoo',
                slug: 'aloe-vera-hibiscus-shampoo',
                description: 'Aloe Vera moisturizes while Hibiscus adds shine. Perfect for dry and frizzy hair. Makes hair soft, manageable, and voluminous.',
                shortDescription: 'Aloe vera shampoo for dry and frizzy hair',
                brandId: herbalBlissBrand?.id,
                categoryId: shampoosCategory?.id,
                isActive: true,
            },
            // Soaps
            {
                name: 'Neem & Turmeric Soap',
                slug: 'neem-turmeric-soap',
                description: 'Antibacterial soap with Neem and Turmeric. Clears acne, reduces inflammation, and brightens skin. Suitable for oily and acne-prone skin.',
                shortDescription: 'Neem turmeric soap for acne and pimples',
                brandId: gunasBrand?.id,
                categoryId: soapsCategory?.id,
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Sandalwood & Rose Soap',
                slug: 'sandalwood-rose-soap',
                description: 'Luxurious soap with Sandalwood and Rose extracts. Nourishes skin, improves complexion, and provides a refreshing fragrance.',
                shortDescription: 'Sandalwood soap for glowing skin',
                brandId: ayurvedaBrand?.id,
                categoryId: soapsCategory?.id,
                isActive: true,
            },
            {
                name: 'Aloe Vera & Cucumber Soap',
                slug: 'aloe-vera-cucumber-soap',
                description: 'Cooling soap with Aloe Vera and Cucumber. Hydrates skin, soothes sunburn, and maintains skin pH balance. Perfect for summer.',
                shortDescription: 'Aloe vera soap for hydration and cooling',
                brandId: natureBrand?.id,
                categoryId: soapsCategory?.id,
                isActive: true,
            },
            // Creams
            {
                name: 'Aloe Vera Gel',
                slug: 'aloe-vera-gel',
                description: 'Pure Aloe Vera gel for skin hydration, sunburn relief, and acne treatment. Can be used as moisturizer, hair mask, or after-sun care.',
                shortDescription: 'Pure aloe vera gel for skin and hair',
                brandId: gunasBrand?.id,
                categoryId: creamsCategory?.id,
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Turmeric Face Cream',
                slug: 'turmeric-face-cream',
                description: 'Brightening cream with Turmeric and Saffron. Reduces pigmentation, evens skin tone, and provides anti-aging benefits.',
                shortDescription: 'Turmeric cream for bright and even skin',
                brandId: ayurvedaBrand?.id,
                categoryId: creamsCategory?.id,
                isActive: true,
            },
            // Hair Care
            {
                name: 'Herbal Hair Mask',
                slug: 'herbal-hair-mask',
                description: 'Deep conditioning mask with Amla, Reetha, and Shikakai. Repairs damaged hair, adds shine, and prevents breakage.',
                shortDescription: 'Herbal hair mask for deep conditioning',
                brandId: gunasBrand?.id,
                categoryId: hairCareCategory?.id,
                isActive: true,
            },
            // Skin Care
            {
                name: 'Rose Water Toner',
                slug: 'rose-water-toner',
                description: 'Pure Rose Water toner for refreshing and tightening pores. Balances skin pH and prepares skin for moisturizer.',
                shortDescription: 'Rose water toner for fresh skin',
                brandId: natureBrand?.id,
                categoryId: skinCareCategory?.id,
                isActive: true,
            },
        ];

        const insertedProducts = await db
            .insert(products)
            .values(productsData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedProducts.length} products`);

        // 6. Seed Product Variants
        console.log('📦 Seeding product variants...');
        const variantsData = [];

        for (const product of insertedProducts) {
            const basePrice = Math.floor(Math.random() * 500) + 100; // 100-600
            const comparePrice = basePrice + Math.floor(Math.random() * 100) + 50; // 50-150 more
            
            // Create 1-3 variants per product
            const variantCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < variantCount; i++) {
                const size = ['50ml', '100ml', '200ml', '500ml'][i] || '100ml';
                const weight = size === '50ml' ? '0.05' : size === '100ml' ? '0.10' : size === '200ml' ? '0.20' : '0.50';
                
                variantsData.push({
                    productId: product.id,
                    sku: `GH${product.id.toString().padStart(4, '0')}V${i + 1}`,
                    variantName: size,
                    price: basePrice.toString(),
                    compareAtPrice: comparePrice.toString(),
                    costPrice: (basePrice * 0.4).toString(), // 40% of selling price
                    weight,
                    isActive: true,
                });
            }
        }

        const insertedVariants = await db
            .insert(productVariants)
            .values(variantsData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedVariants.length} product variants`);

        // 7. Seed Product Images
        console.log('🖼️ Seeding product images...');
        const imagesData = [];

        // Sample images for different categories
        const productImagesMap = {
            'hair-oil': [
                '/images/products/hair-oil-1.jpg',
                '/images/products/hair-oil-2.jpg',
                '/images/products/hair-oil-3.jpg',
            ],
            'shampoo': [
                '/images/products/shampoo-1.jpg',
                '/images/products/shampoo-2.jpg',
                '/images/products/shampoo-3.jpg',
            ],
            'soap': [
                '/images/products/soap-1.jpg',
                '/images/products/soap-2.jpg',
                '/images/products/soap-3.jpg',
            ],
            'cream': [
                '/images/products/cream-1.jpg',
                '/images/products/cream-2.jpg',
            ],
            'default': [
                '/images/products/default-1.jpg',
                '/images/products/default-2.jpg',
            ],
        };

        for (const product of insertedProducts) {
            let imageCategory = 'default';
            
            if (product.slug.includes('oil')) imageCategory = 'hair-oil';
            else if (product.slug.includes('shampoo')) imageCategory = 'shampoo';
            else if (product.slug.includes('soap')) imageCategory = 'soap';
            else if (product.slug.includes('cream') || product.slug.includes('gel')) imageCategory = 'cream';

            const images = productImagesMap[imageCategory as keyof typeof productImagesMap] || productImagesMap.default;
            
            // Add 1-3 images per product
            const imageCount = Math.min(images.length, Math.floor(Math.random() * 3) + 1);
            
            for (let i = 0; i < imageCount; i++) {
                imagesData.push({
                    productId: product.id,
                    imageUrl: images[i],
                    altText: `${product.name} - Image ${i + 1}`,
                    isPrimary: i === 0,
                    displayOrder: i,
                });
            }
        }

        const insertedImages = await db
            .insert(productImages)
            .values(imagesData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedImages.length} product images`);

        // 8. Seed Warehouses
        console.log('🏢 Seeding warehouses...');
        const warehousesData = [
            {
                name: 'Main Warehouse',
                code: 'WH-MAIN',
                location: 'Delhi',
                address: 'Plot No. 123, Industrial Area, Delhi',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                postalCode: '110001',
                contactPerson: 'Warehouse Manager',
                contactPhone: '9876543201',
                isActive: true,
            },
            {
                name: 'South Warehouse',
                code: 'WH-SOUTH',
                location: 'Chennai',
                address: 'No. 456, GST Road, Chennai',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                postalCode: '600001',
                contactPerson: 'Regional Manager',
                contactPhone: '9876543202',
                isActive: true,
            },
            {
                name: 'West Warehouse',
                code: 'WH-WEST',
                location: 'Mumbai',
                address: 'Shop No. 789, Andheri East, Mumbai',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                postalCode: '400001',
                contactPerson: 'Store Incharge',
                contactPhone: '9876543203',
                isActive: true,
            },
        ];

        const insertedWarehouses = await db
            .insert(warehouses)
            .values(warehousesData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedWarehouses.length} warehouses`);

        // 9. Seed Inventory
        console.log('📊 Seeding inventory...');
        const inventoryData = [];

        for (const variant of insertedVariants) {
            // Distribute inventory across warehouses
            for (const warehouse of insertedWarehouses) {
                const stockQty = Math.floor(Math.random() * 100) + 10; // 10-110 units
                const reservedQty = Math.floor(Math.random() * 20); // 0-20 units
                
                inventoryData.push({
                    variantId: variant.id,
                    warehouseId: warehouse.id,
                    stockQty,
                    reservedQty,
                    reorderLevel: 20,
                    reorderQty: 50,
                });
            }
        }

        const insertedInventory = await db
            .insert(inventory)
            .values(inventoryData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedInventory.length} inventory records`);

        // 10. Seed Coupons
        console.log('🎫 Seeding coupons...');
        const couponsData = [
            {
                code: 'WELCOME10',
                discountType: 'percentage',
                discountValue: '10',
                minOrderAmount: '500',
                maxDiscountAmount: '200',
                usageLimit: 100,
                usageCount: 0,
                perUserLimit: 1,
                startDate: new Date('2024-01-01'),
                expiryDate: new Date('2024-12-31'),
                isActive: true,
            },
            {
                code: 'FIRSTORDER',
                discountType: 'flat',
                discountValue: '150',
                minOrderAmount: '1000',
                maxDiscountAmount: '150',
                usageLimit: 200,
                usageCount: 0,
                perUserLimit: 1,
                startDate: new Date('2024-01-01'),
                expiryDate: new Date('2024-12-31'),
                isActive: true,
            },
            {
                code: 'HERBAL20',
                discountType: 'percentage',
                discountValue: '20',
                minOrderAmount: '2000',
                maxDiscountAmount: '500',
                usageLimit: 50,
                usageCount: 0,
                perUserLimit: 2,
                startDate: new Date('2024-01-01'),
                expiryDate: new Date('2024-12-31'),
                isActive: true,
            },
            {
                code: 'FREESHIP',
                discountType: 'flat',
                discountValue: '50',
                minOrderAmount: '0',
                maxDiscountAmount: '50',
                usageLimit: 1000,
                usageCount: 0,
                perUserLimit: 3,
                startDate: new Date('2024-01-01'),
                expiryDate: new Date('2024-12-31'),
                isActive: true,
            },
        ];

        const insertedCoupons = await db
            .insert(coupons)
            .values(couponsData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedCoupons.length} coupons`);

        // 11. Seed Discounts
        console.log('💰 Seeding discounts...');
        const discountsData = [
            {
                name: 'Festival Sale',
                discountType: 'percentage',
                value: '15',
                minOrderAmount: '1000',
                maxDiscountAmount: '300',
                startDate: new Date('2024-10-01'),
                endDate: new Date('2024-10-31'),
                isActive: true,
                usageLimit: 1000,
                usageCount: 0,
            },
            {
                name: 'Clearance Sale',
                discountType: 'flat',
                value: '100',
                minOrderAmount: '1500',
                maxDiscountAmount: '100',
                startDate: new Date('2024-12-01'),
                endDate: new Date('2024-12-31'),
                isActive: true,
                usageLimit: 500,
                usageCount: 0,
            },
            {
                name: 'Seasonal Offer',
                discountType: 'percentage',
                value: '25',
                minOrderAmount: '2500',
                maxDiscountAmount: '750',
                startDate: new Date('2024-07-01'),
                endDate: new Date('2024-07-31'),
                isActive: true,
                usageLimit: 300,
                usageCount: 0,
            },
        ];

        const insertedDiscounts = await db
            .insert(discounts)
            .values(discountsData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedDiscounts.length} discounts`);

        // 12. Seed Banners
        console.log('🎨 Seeding banners...');
        const bannersData = [
            {
                title: 'Pure Herbal Products',
                subtitle: 'Nature\'s Best for Your Health',
                imageUrl: '/images/banners/banner-1.jpg',
                mobileImageUrl: '/images/banners/banner-1-mobile.jpg',
                link: '/products?category=herbal-oils',
                buttonText: 'Shop Now',
                displayOrder: 1,
                isActive: true,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            },
            {
                title: 'Summer Sale',
                subtitle: 'Up to 30% Off on All Products',
                imageUrl: '/images/banners/banner-2.jpg',
                mobileImageUrl: '/images/banners/banner-2-mobile.jpg',
                link: '/sale',
                buttonText: 'Grab Deal',
                displayOrder: 2,
                isActive: true,
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-08-31'),
            },
            {
                title: 'New Arrivals',
                subtitle: 'Check Out Our Latest Herbal Range',
                imageUrl: '/images/banners/banner-3.jpg',
                mobileImageUrl: '/images/banners/banner-3-mobile.jpg',
                link: '/products?sort=featured',
                buttonText: 'Explore',
                displayOrder: 3,
                isActive: true,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            },
            {
                title: 'Free Shipping',
                subtitle: 'On Orders Above ₹500',
                imageUrl: '/images/banners/banner-4.jpg',
                mobileImageUrl: '/images/banners/banner-4-mobile.jpg',
                link: '/shipping-policy',
                buttonText: 'Learn More',
                displayOrder: 4,
                isActive: true,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            },
        ];

        const insertedBanners = await db
            .insert(banners)
            .values(bannersData)
            .onConflictDoNothing()
            .returning();

        console.log(`✅ Seeded ${insertedBanners.length} banners`);

        console.log('🎉 Database seeded successfully!');
        console.log('📊 Summary:');
        console.log(`   👥 Users: 2 (Admin + Customer)`);
        console.log(`   📂 Categories: ${insertedCategories.length}`);
        console.log(`   🏷️ Brands: ${insertedBrands.length}`);
        console.log(`   📦 Products: ${insertedProducts.length}`);
        console.log(`   🔄 Variants: ${insertedVariants.length}`);
        console.log(`   🖼️ Images: ${insertedImages.length}`);
        console.log(`   🏢 Warehouses: ${insertedWarehouses.length}`);
        console.log(`   📊 Inventory Records: ${insertedInventory.length}`);
        console.log(`   🎫 Coupons: ${insertedCoupons.length}`);
        console.log(`   💰 Discounts: ${insertedDiscounts.length}`);
        console.log(`   🎨 Banners: ${insertedBanners.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seed
seed()
    .then(() => {
        console.log('✅ Seed completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    });