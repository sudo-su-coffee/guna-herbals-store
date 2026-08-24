'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { db } from '@/lib/db';
import {
    users, userProfiles, addresses, categories, brands, products, productVariants,
    productImages, warehouses, inventory, inventoryReservations, stockMovements,
    batches, discounts, coupons, carts, cartItems, wishlists, wishlistItems,
    orders, orderItems, payments, paymentWebhooks, shipments, returns, refunds,
    reviews, banners, auditLogs, enquiries, userSessions,
} from '../drizzle/schema';
import {
    eq, and, desc, gte, sql, like, or, lte, ne, inArray,
    count, sum, avg, asc, between, ilike, isNull, not
} from 'drizzle-orm';
import {
    NewUser, NewUserProfile, NewAddress, NewCategory, NewBrand,
    NewProduct, NewProductVariant, NewProductImage, ProductWithDetails,
    NewWarehouse, NewBatch, NewStockMovement, NewInventoryReservation,
    NewOrder, NewOrderItem, NewPayment, NewShipment,
    NewReturn, NewRefund, NewReview, NewBanner,
    NewDiscount, NewCoupon, NewAuditLog, NewEnquiry, NewUserSession,
    ApiResponse, ProductFilterParams, OrderFilterParams, UserFilterParams,
    SessionUser, OrderWithDetails, CartItemWithDetails, WishlistItemWithDetails,
    DashboardStats, AnalyticsData, PaginationParams, Address,
    User, UserProfile, Category, Brand, Banner, Review
} from './types';

interface OrderItemCalculation {
    variantId: number;
    quantity: number;
    price: string;
    productName: string;
    sku: string;
    taxAmount: string;
    totalAmount: string;
}

import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { sendTransactionalEmail } from '@/lib/integrations';
import { auth } from '@/lib/better-auth';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-this-in-env');
const ALG = 'HS256';
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

async function enforceRateLimit(bucket: string, limit: number, windowMs: number) {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || 'unknown';
    const key = `${bucket}:${forwarded.split(',')[0].trim()}`;
    const now = Date.now();
    const current = rateLimitBuckets.get(key);
    if (!current || current.resetAt <= now) {
        rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }
    if (current.count >= limit) throw new AppError('Too many requests. Try again shortly.', 429, 'RATE_LIMITED');
    current.count += 1;
}

// ============================================================================
// ERROR HANDLING & UTILITIES
// ============================================================================

class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

async function handleServerAction<T>(
    action: () => Promise<T>,
    revalidatePaths?: string[],
    successMessage?: string
): Promise<ApiResponse<T>> {
    try {
        const result = await action();

        // Revalidate cache if needed
        if (revalidatePaths) {
            revalidatePaths.forEach(path => revalidatePath(path));
        }

        return {
            success: true,
            data: result,
            message: successMessage
        };
    } catch (error) {
        console.error('Server action error:', error);

        if (error instanceof AppError) {
            return {
                success: false,
                error: error.message,
                message: error.code
            };
        }

        return {
            success: false,
            error: 'An unexpected error occurred',
            message: 'SERVER_ERROR'
        };
    }
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// ============================================================================
// SESSION & AUTHENTICATION
// ============================================================================

export async function getCurrentUser(): Promise<ApiResponse<SessionUser>> {
    return handleServerAction(async () => {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('sessionToken')?.value;

        if (!sessionToken) {
            const betterAuthSession = await auth.api.getSession({ headers: await headers() });
            if (betterAuthSession?.user?.email) {
                const linkedUser = await db.query.users.findFirst({
                    where: eq(users.email, betterAuthSession.user.email),
                    with: { profile: true }
                });
                let commerceUser = linkedUser;
                if (!commerceUser) {
                    const [createdUser] = await db.insert(users).values({
                        name: betterAuthSession.user.name || 'Customer',
                        email: betterAuthSession.user.email,
                        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
                        role: 'customer',
                        status: 'active',
                        emailVerified: betterAuthSession.user.emailVerified,
                    }).returning();
                    commerceUser = { ...createdUser, profile: null };
                }
                if (commerceUser.status === 'blocked') throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
                return {
                    id: commerceUser.id,
                    name: commerceUser.name,
                    email: commerceUser.email,
                    role: commerceUser.role,
                    phone: commerceUser.phone || undefined,
                    profile: commerceUser.profile || undefined
                };
            }
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        try {
            // Verify JWT
            const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
            const userId = Number(payload.userId);

            // Optional: Check if session is still valid in DB (allows server-side revocation)
            const session = await db.query.userSessions.findFirst({
                where: and(
                    eq(userSessions.sessionToken, sessionToken),
                    eq(userSessions.isActive, true)
                ),
                with: {
                    user: {
                        with: {
                            profile: true
                        }
                    }
                }
            });

            if (!session) {
                throw new AppError('Session expired or revoked', 401, 'SESSION_EXPIRED');
            }

            const user = session.user as User & { profile: UserProfile | null };

            if (user.status === 'blocked') {
                throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || undefined,
                profile: user.profile || undefined
            };
        } catch (error) {
            console.error('JWT Verification failed:', error);
            throw new AppError('Invalid session', 401, 'INVALID_SESSION');
        }
    });
}

async function createSession(userId: number, role: string, email: string): Promise<string> {
    const h = await headers();
    const userAgent = h.get('user-agent') || 'unknown';
    const ipAddress = h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown';

    // Create JWT
    const sessionToken = await new SignJWT({ userId: userId.toString(), role, email })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store in DB for stateful management (e.g. "log out all devices")
    await db.insert(userSessions).values({
        userId,
        sessionToken,
        userAgent,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        expiresAt,
        isActive: true,
        createdAt: new Date()
    });

    const cookieStore = await cookies();
    cookieStore.set('sessionToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    return sessionToken;
}

export async function logout(): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('sessionToken')?.value;

        if (sessionToken) {
            await db.update(userSessions)
                .set({
                    isActive: false,
                    expiresAt: new Date()
                })
                .where(eq(userSessions.sessionToken, sessionToken));
        }

        cookieStore.delete('sessionToken');
        cookieStore.delete('userId');
        cookieStore.delete('adminId');

        return { message: 'Logged out successfully' };
    }, ['/']);
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function registerUser(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
}): Promise<ApiResponse<SessionUser>> {
    return handleServerAction(async () => {
        // Validate input
        if (!data.name.trim() || !data.email.trim() || !data.password) {
            throw new AppError('All fields are required', 400, 'VALIDATION_ERROR');
        }

        if (!validateEmail(data.email)) {
            throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        if (data.phone && !validatePhone(data.phone)) {
            throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');
        }

        if (data.password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400, 'WEAK_PASSWORD');
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: or(
                eq(users.email, data.email),
                ...(data.phone ? [eq(users.phone, data.phone)] : [])
            )
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
            }
            if (data.phone && existingUser.phone === data.phone) {
                throw new AppError('Phone number already registered', 409, 'PHONE_EXISTS');
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Create user in transaction
        const [user] = await db.transaction(async (tx) => {
            // Create user
            const [newUser] = await tx.insert(users).values({
                name: data.name,
                email: data.email,
                phone: data.phone,
                passwordHash,
                role: 'customer',
                status: 'active',
                createdAt: new Date()
            }).returning();

            // Create profile
            await tx.insert(userProfiles).values({
                userId: newUser.id,
                firstName: data.name.split(' ')[0],
                lastName: data.name.split(' ').slice(1).join(' ') || null
            });

            // Create cart
            await tx.insert(carts).values({
                userId: newUser.id
            });

            // Create wishlist
            await tx.insert(wishlists).values({
                userId: newUser.id
            });

            return [newUser];
        });

        // Create session
        await createSession(user.id, user.role, user.email);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'staff' | 'customer',
            phone: user.phone || undefined
        };
    }, ['/']);
}

export async function loginUser(data: {
    email: string;
    password: string;
}): Promise<ApiResponse<SessionUser>> {
    return handleServerAction(async () => {
        await enforceRateLimit('login', 10, 15 * 60_000);
        if (!data.email || !data.password) {
            throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, data.email),
            with: {
                profile: true
            }
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        if (user.status === 'blocked') {
            throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
        }

        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Create session
        await createSession(user.id, user.role, user.email);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'staff' | 'customer',
            phone: user.phone || undefined,
            profile: user.profile || undefined
        };
    }, ['/']);
}

export async function adminLogin(email: string, password: string): Promise<ApiResponse<SessionUser>> {
    return handleServerAction(async () => {
        await enforceRateLimit('admin-login', 6, 15 * 60_000);
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
                profile: true
            }
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        if (user.role !== 'admin') {
            throw new AppError('Unauthorized access', 403, 'UNAUTHORIZED');
        }

        if (user.status === 'blocked') {
            throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Create session
        await createSession(user.id, user.role, user.email);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'staff' | 'customer',
            phone: user.phone || undefined,
            profile: user.profile || undefined
        };
    }, ['/', '/admin/dashboard']);
}

export async function updateProfile(userId: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    profile?: Partial<NewUserProfile>;
}): Promise<ApiResponse> {
    return handleServerAction(async () => {
        // Validate email if provided
        if (data.email && !validateEmail(data.email)) {
            throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        // Validate phone if provided
        if (data.phone && !validatePhone(data.phone)) {
            throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');
        }

        // Check if email is already in use
        if (data.email) {
            const existingUser = await db.query.users.findFirst({
                where: and(
                    eq(users.email, data.email),
                    ne(users.id, userId)
                )
            });

            if (existingUser) {
                throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
            }
        }

        // Update user
        if (data.name || data.email || data.phone) {
            await db.update(users)
                .set({
                    ...(data.name && { name: data.name }),
                    ...(data.email && { email: data.email }),
                    ...(data.phone && { phone: data.phone })
                })
                .where(eq(users.id, userId));
        }

        // Update profile if provided
        if (data.profile) {
            await db.update(userProfiles)
                .set(data.profile)
                .where(eq(userProfiles.userId, userId));
        }

        return { message: 'Profile updated successfully' };
    }, ['/profile']);
}

export async function changePassword(userId: number, data: {
    currentPassword: string;
    newPassword: string;
}): Promise<ApiResponse> {
    return handleServerAction(async () => {
        if (!data.currentPassword || !data.newPassword) {
            throw new AppError('Both passwords are required', 400, 'VALIDATION_ERROR');
        }

        if (data.newPassword.length < 6) {
            throw new AppError('New password must be at least 6 characters', 400, 'WEAK_PASSWORD');
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError('Current password is incorrect', 401, 'INCORRECT_PASSWORD');
        }

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

        await db.update(users)
            .set({ passwordHash: newPasswordHash })
            .where(eq(users.id, userId));

        return { message: 'Password changed successfully' };
    }, ['/profile']);
}

export async function deactivateAccount(userId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await db.transaction(async (tx) => {
            // Deactivate user
            await tx.update(users)
                .set({
                    status: 'blocked',
                    email: `deactivated_${userId}_${Date.now()}` // Anonymize email properly
                })
                .where(eq(users.id, userId));

            // Terminate all sessions
            await tx.update(userSessions)
                .set({
                    isActive: false,
                    expiresAt: new Date()
                })
                .where(eq(userSessions.userId, userId));
        });

        // Logout
        const cookieStore = await cookies();
        cookieStore.delete('sessionToken');

        return { message: 'Account deactivated successfully' };
    }, ['/']);
}

// ============================================================================
// ADDRESS MANAGEMENT
// ============================================================================

export async function getUserAddresses(userId: number): Promise<ApiResponse<Address[]>> {
    return handleServerAction(async () => {
        const addressesList = await db.select()
            .from(addresses)
            .where(eq(addresses.userId, userId))
            .orderBy(desc(addresses.isDefault), desc(addresses.id));

        return addressesList;
    });
}

export async function createAddress(userId: number, data: NewAddress): Promise<ApiResponse<Address>> {
    return handleServerAction(async () => {
        // Validate required fields
        if (!data.type || !data.addressLine1 || !data.city || !data.state || !data.postalCode) {
            throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
        }

        // If setting as default, update existing defaults
        if (data.isDefault) {
            await db.update(addresses)
                .set({ isDefault: false })
                .where(and(
                    eq(addresses.userId, userId),
                    eq(addresses.type, data.type)
                ));
        }

        const [newAddress] = await db.insert(addresses)
            .values({
                ...data,
                userId,
                createdAt: new Date()
            })
            .returning();

        return newAddress;
    }, ['/profile/addresses']);
}

export async function updateAddress(addressId: number, userId: number, data: Partial<NewAddress>): Promise<ApiResponse<Address>> {
    return handleServerAction(async () => {
        // Verify address belongs to user
        const address = await db.query.addresses.findFirst({
            where: and(
                eq(addresses.id, addressId),
                eq(addresses.userId, userId)
            )
        });

        if (!address) {
            throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
        }

        // If setting as default, update existing defaults
        if (data.isDefault && data.type) {
            await db.update(addresses)
                .set({ isDefault: false })
                .where(and(
                    eq(addresses.userId, userId),
                    eq(addresses.type, data.type),
                    ne(addresses.id, addressId)
                ));
        }

        const [updatedAddress] = await db.update(addresses)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(addresses.id, addressId))
            .returning();

        return updatedAddress;
    }, ['/profile/addresses']);
}

export async function deleteAddress(addressId: number, userId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        // Verify address belongs to user
        const address = await db.query.addresses.findFirst({
            where: and(
                eq(addresses.id, addressId),
                eq(addresses.userId, userId)
            )
        });

        if (!address) {
            throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
        }

        // Don't allow deletion if it's the only address
        const userAddresses = await db.select()
            .from(addresses)
            .where(eq(addresses.userId, userId));

        if (userAddresses.length <= 1) {
            throw new AppError('Cannot delete the only address', 400, 'LAST_ADDRESS');
        }

        // If deleting default address, set another as default
        if (address.isDefault) {
            const anotherAddress = userAddresses.find(addr => addr.id !== addressId);
            if (anotherAddress) {
                await db.update(addresses)
                    .set({ isDefault: true })
                    .where(eq(addresses.id, anotherAddress.id));
            }
        }

        await db.delete(addresses)
            .where(eq(addresses.id, addressId));

        return { message: 'Address deleted successfully' };
    }, ['/profile/addresses']);
}

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

export async function getAllProducts(params?: ProductFilterParams): Promise<ApiResponse<ProductWithDetails[]>> {
    return handleServerAction(async () => {
        const {
            page = 1,
            limit = 20,
            categoryId,
            brandId,
            minPrice,
            maxPrice,
            search,
            inStock,
            sortOption = 'featured'
        } = params || {};

        const offset = (page - 1) * limit;

        // Build where conditions
        const conditions = [eq(products.isActive, true)];

        if (categoryId) {
            conditions.push(eq(products.categoryId, categoryId));
        }

        if (brandId) {
            conditions.push(eq(products.brandId, brandId));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(products.name, `%${search}%`),
                    ilike(products.description, `%${search}%`)
                )
            );
        }

        // Get products with variants for price filtering
        let query = db
            .select({
                product: products,
                brand: brands,
                category: categories,
                image: productImages,
                variants: productVariants,
                inventory: inventory
            })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(productImages, and(
                eq(productImages.productId, products.id),
                eq(productImages.isPrimary, true)
            ))
            .leftJoin(productVariants, eq(productVariants.productId, products.id))
            .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
            .where(and(...conditions));

        // Apply sorting
        switch (sortOption) {
            case 'price-low-high':
                query = (query as any).orderBy(asc(productVariants.price));
                break;
            case 'price-high-low':
                query = (query as any).orderBy(desc(productVariants.price));
                break;
            case 'name-a-z':
                query = (query as any).orderBy(asc(products.name));
                break;
            case 'featured':
            default:
                query = (query as any).orderBy(desc(products.createdAt));
                break;
        }

        // Fetch joined rows first; pagination is applied after grouping so multiple variants do not hide products.
        const results = await query;

        // Group products and their variants
        const productMap = new Map<number, ProductWithDetails>();

        for (const row of results) {
            if (!productMap.has(row.product.id)) {
                productMap.set(row.product.id, {
                    product: row.product,
                    brand: row.brand,
                    category: row.category,
                    image: row.image,
                    variants: [],
                    images: row.image ? [row.image] : [],
                    reviews: []
                });
            }

            const productData = productMap.get(row.product.id)!;
            if (row.variants && !productData.variants?.some(v => v.id === row.variants!.id)) {
                productData.variants!.push({
                    ...row.variants,
                    inventory: row.inventory ? [row.inventory] : [],
                } as any);
            }
        }

        const productsList = Array.from(productMap.values());

        // Apply price filtering after grouping
        let filteredProducts = productsList;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filteredProducts = productsList.filter(product => {
                const prices = product.variants?.map(v => parseFloat(v.price || '0')) || [];
                const minVariantPrice = Math.min(...prices);
                const maxVariantPrice = Math.max(...prices);

                if (minPrice !== undefined && maxVariantPrice < minPrice) return false;
                if (maxPrice !== undefined && minVariantPrice > maxPrice) return false;
                return true;
            });
        }

        // Apply stock filtering
        if (inStock) {
            filteredProducts = await Promise.all(
                filteredProducts.map(async (product) => {
                    const stockData = await db.select({
                        stockQty: sum(inventory.stockQty)
                    })
                        .from(inventory)
                        .leftJoin(productVariants, eq(inventory.variantId, productVariants.id))
                        .where(eq(productVariants.productId, product.product.id))
                        .groupBy(productVariants.productId);

                    const totalStock = stockData[0]?.stockQty || 0;
                    return { product, totalStock };
                })
            ).then(results =>
                results
                    .filter(({ totalStock }) => totalStock > 0)
                    .map(({ product }) => product)
            );
        }

        // Get total count for pagination
        const countResult = await db.select({ count: count() })
            .from(products)
            .where(and(...conditions));
        const total = countResult[0]?.count || 0;

        return filteredProducts.slice(offset, offset + limit);
    });
}

export async function getFeaturedProducts(limit: number = 4): Promise<ApiResponse<ProductWithDetails[]>> {
    return handleServerAction(async () => {
        const prodList = await db.query.products.findMany({
            where: eq(products.isFeatured, true),
            limit: limit,
            with: {
                brand: true,
                category: true,
                images: true,
                variants: true
            }
        });

        return prodList.map(p => ({
            product: p,
            brand: p.brand,
            category: p.category,
            images: p.images,
            variants: p.variants
        })) as unknown as ProductWithDetails[];
    });
}

export async function getProductById(id: number): Promise<ApiResponse<ProductWithDetails>> {
    return handleServerAction(async () => {
        const product = await db.query.products.findFirst({
            where: and(
                eq(products.id, id),
                eq(products.isActive, true)
            ),
            with: {
                brand: true,
                category: true,
                images: true,
                variants: {
                    with: {
                        inventory: true
                    }
                },
                reviews: {
                    with: {
                        user: {
                            with: {
                                profile: true
                            }
                        }
                    },
                    orderBy: desc(reviews.createdAt)
                }
            }
        });

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        // Calculate average rating
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
            : 0;

        return {
            product: product,
            brand: product.brand,
            category: product.category,
            image: product.images.find(img => img.isPrimary),
            variants: product.variants,
            images: product.images,
            reviews: product.reviews
        } as unknown as ProductWithDetails;
    });
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<ProductWithDetails>> {
    return handleServerAction(async () => {
        const product = await db.query.products.findFirst({
            where: and(
                eq(products.slug, slug),
                eq(products.isActive, true)
            ),
            with: {
                brand: true,
                category: true,
                images: true,
                variants: {
                    with: {
                        inventory: true
                    }
                },
                reviews: {
                    with: {
                        user: {
                            with: {
                                profile: true
                            }
                        }
                    },
                    orderBy: desc(reviews.createdAt)
                }
            }
        });

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        return {
            product: product,
            brand: product.brand,
            category: product.category,
            image: product.images.find(img => img.isPrimary),
            variants: product.variants,
            images: product.images,
            reviews: product.reviews
        } as unknown as ProductWithDetails;
    });
}

export async function getRelatedProducts(productId: number, limit: number = 4): Promise<ApiResponse<ProductWithDetails[]>> {
    return handleServerAction(async () => {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                category: true
            }
        });

        if (!product) {
            return [];
        }

        const relatedProducts = await db.query.products.findMany({
            where: and(
                eq(products.categoryId, product.categoryId!),
                ne(products.id, productId),
                eq(products.isActive, true)
            ),
            with: {
                brand: true,
                category: true,
                images: {
                    where: eq(productImages.isPrimary, true)
                },
                variants: true
            },
            limit: limit
        });

        return relatedProducts.map(p => ({
            product: p,
            brand: p.brand,
            category: p.category,
            image: p.images[0],
            variants: p.variants,
            images: p.images
        }));
    });
}

// ============================================================================
// CART MANAGEMENT
// ============================================================================

export async function getCart(): Promise<ApiResponse<CartItemWithDetails[]>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        const cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: {
                                    with: {
                                        images: {
                                            where: eq(productImages.isPrimary, true)
                                        }
                                    }
                                },
                                inventory: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart) {
            return [];
        }

        const cartItemsWithDetails = cart.items.map(item => {
            const product = item.variant.product;
            const primaryImage = product.images[0];
            const totalStock = item.variant.inventory?.reduce((sum: number, inv: any) => sum + inv.stockQty, 0) || 0;

            return {
                ...item,
                productName: product.name,
                productSlug: product.slug || '',
                productImage: primaryImage?.imageUrl,
                price: parseFloat(item.priceAtTime || item.variant.price || '0'),
                stockAvailable: totalStock
            };
        }) as unknown as CartItemWithDetails[];

        return cartItemsWithDetails;
    });
}

export async function addToCart(variantId: number, quantity: number = 1): Promise<ApiResponse> {
    return handleServerAction(async () => {
        if (quantity <= 0 || quantity > 100) {
            throw new AppError('Invalid quantity', 400, 'INVALID_QUANTITY');
        }

        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        // Get or create cart
        let cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userId)
        });

        if (!cart) {
            const [newCart] = await db.insert(carts)
                .values({ userId })
                .returning();
            cart = newCart;
        }

        // Check variant and stock
        const variant = await db.query.productVariants.findFirst({
            where: and(
                eq(productVariants.id, variantId),
                eq(productVariants.isActive, true)
            ),
            with: {
                product: {
                    with: {
                        images: {
                            where: eq(productImages.isPrimary, true)
                        }
                    }
                },
                inventory: true
            }
        });

        if (!variant) {
            throw new AppError('Product variant not found', 404, 'VARIANT_NOT_FOUND');
        }

        if (!variant.product.isActive) {
            throw new AppError('Product is not available', 400, 'PRODUCT_INACTIVE');
        }

        const totalStock = variant.inventory?.reduce((sum, inv) => sum + inv.stockQty, 0) || 0;
        if (totalStock < quantity) {
            throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
        }

        // Check if item already in cart
        const existingItem = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.cartId, cart.id),
                eq(cartItems.variantId, variantId)
            )
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > totalStock) {
                throw new AppError('Not enough stock available', 400, 'INSUFFICIENT_STOCK');
            }

            await db.update(cartItems)
                .set({
                    quantity: newQuantity,
                    priceAtTime: variant.price // Update price in case it changed
                })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            await db.insert(cartItems)
                .values({
                    cartId: cart.id,
                    variantId,
                    quantity,
                    priceAtTime: variant.price
                });
        }

        return { message: 'Item added to cart' };
    }, ['/cart']);
}

export async function updateCartItem(cartItemId: number, quantity: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return removeFromCart(cartItemId);
        }

        if (quantity > 100) {
            throw new AppError('Maximum quantity per item is 100', 400, 'MAX_QUANTITY_EXCEEDED');
        }

        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        // Verify cart item belongs to user
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, cartItemId),
            with: {
                cart: true,
                variant: {
                    with: {
                        inventory: true
                    }
                }
            }
        });

        if (!cartItem) {
            throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
        }

        if (cartItem.cart.userId !== userResponse.data.id) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        // Check stock
        const totalStock = cartItem.variant.inventory?.reduce((sum: number, inv: any) => sum + inv.stockQty, 0) || 0;
        if (totalStock < quantity) {
            throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
        }

        await db.update(cartItems)
            .set({ quantity })
            .where(eq(cartItems.id, cartItemId));

        return { message: 'Cart updated' };
    }, ['/cart']);
}

export async function removeFromCart(cartItemId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        // Verify cart item belongs to user
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, cartItemId),
            with: {
                cart: true
            }
        });

        if (!cartItem) {
            throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
        }

        if (cartItem.cart.userId !== userResponse.data.id) {
            throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
        }

        await db.delete(cartItems)
            .where(eq(cartItems.id, cartItemId));

        return { message: 'Item removed from cart' };
    }, ['/cart']);
}

export async function clearCart(): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userResponse.data.id)
        });

        if (cart) {
            await db.delete(cartItems)
                .where(eq(cartItems.cartId, cart.id));
        }

        return { message: 'Cart cleared' };
    }, ['/cart']);
}

// ============================================================================
// WISHLIST MANAGEMENT
// ============================================================================

export async function getWishlist(): Promise<ApiResponse<WishlistItemWithDetails[]>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        const wishlist = await db.query.wishlists.findFirst({
            where: eq(wishlists.userId, userId),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                brand: true,
                                category: true,
                                images: {
                                    where: eq(productImages.isPrimary, true)
                                },
                                variants: {
                                    where: eq(productVariants.isActive, true),
                                    orderBy: asc(productVariants.price)
                                }
                            }
                        }
                    },
                    orderBy: desc(wishlistItems.addedAt)
                }
            }
        });

        if (!wishlist) {
            return [];
        }

        return wishlist.items.map(item => ({
            wishlistId: item.wishlistId,
            productId: item.productId,
            product: item.product,
            addedAt: item.addedAt
        }));
    });
}

export async function toggleWishlist(productId: number): Promise<ApiResponse<{ action: 'added' | 'removed' }>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        // Check if product exists and is active
        const product = await db.query.products.findFirst({
            where: and(
                eq(products.id, productId),
                eq(products.isActive, true)
            )
        });

        if (!product) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }

        // Get or create wishlist
        let wishlist = await db.query.wishlists.findFirst({
            where: eq(wishlists.userId, userId)
        });

        if (!wishlist) {
            const [newWishlist] = await db.insert(wishlists)
                .values({ userId })
                .returning();
            wishlist = newWishlist;
        }

        // Check if already in wishlist
        const existingItem = await db.query.wishlistItems.findFirst({
            where: and(
                eq(wishlistItems.wishlistId, wishlist.id),
                eq(wishlistItems.productId, productId)
            )
        });

        if (existingItem) {
            // Remove from wishlist
            await db.delete(wishlistItems)
                .where(eq(wishlistItems.productId, productId));

            return { action: 'removed' };
        } else {
            // Add to wishlist
            await db.insert(wishlistItems)
                .values({
                    wishlistId: wishlist.id,
                    productId,
                    addedAt: new Date()
                });

            return { action: 'added' };
        }
    }, ['/wishlist', '/products/[slug]']);
}

export async function removeFromWishlist(productId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        const wishlist = await db.query.wishlists.findFirst({
            where: eq(wishlists.userId, userId)
        });

        if (!wishlist) {
            throw new AppError('Wishlist not found', 404, 'WISHLIST_NOT_FOUND');
        }

        const deleted = await db.delete(wishlistItems)
            .where(and(
                eq(wishlistItems.wishlistId, wishlist.id),
                eq(wishlistItems.productId, productId)
            ))
            .returning();

        if (deleted.length === 0) {
            throw new AppError('Item not found in wishlist', 404, 'ITEM_NOT_FOUND');
        }

        return { message: 'Removed from wishlist' };
    }, ['/wishlist']);
}

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

export async function createOrder(data: {
    shippingAddressId: number;
    billingAddressId: number;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
}): Promise<ApiResponse<{ orderId: number; payment?: any }>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        // Get cart items with current prices and stock
        const cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: true,
                                inventory: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError('Cart is empty', 400, 'EMPTY_CART');
        }

        // Verify addresses belong to user
        const [shippingAddress, billingAddress] = await Promise.all([
            db.query.addresses.findFirst({
                where: and(
                    eq(addresses.id, data.shippingAddressId),
                    eq(addresses.userId, userId),
                    eq(addresses.type, 'shipping')
                )
            }),
            db.query.addresses.findFirst({
                where: and(
                    eq(addresses.id, data.billingAddressId),
                    eq(addresses.userId, userId),
                    eq(addresses.type, 'billing')
                )
            })
        ]);

        if (!shippingAddress) {
            throw new AppError('Invalid shipping address', 400, 'INVALID_SHIPPING_ADDRESS');
        }

        if (!billingAddress) {
            throw new AppError('Invalid billing address', 400, 'INVALID_BILLING_ADDRESS');
        }

        // Calculate totals and validate stock
        let subtotal = 0;
        const orderItemsList: OrderItemCalculation[] = []; // Rename to avoid conflict with imported schema

        for (const cartItem of cart.items) {
            const variant = cartItem.variant;
            const product = variant.product;
            const totalStock = variant.inventory?.reduce((sum: number, inv: any) => sum + inv.stockQty, 0) || 0;

            if (!product.isActive) {
                throw new AppError(`Product "${product.name}" is no longer available`, 400, 'PRODUCT_INACTIVE');
            }

            if (totalStock < cartItem.quantity) {
                throw new AppError(`Insufficient stock for "${product.name}"`, 400, 'INSUFFICIENT_STOCK');
            }

            const price = parseFloat(variant.price || '0');
            const itemTotal = price * cartItem.quantity;
            subtotal += itemTotal;

            orderItemsList.push({
                variantId: variant.id,
                quantity: cartItem.quantity,
                price: price.toString(),
                productName: product.name,
                sku: variant.sku,
                taxAmount: '0', // Calculate tax if needed
                totalAmount: itemTotal.toString()
            });
        }

        // Calculate shipping (simplified)
        const shippingCharge = subtotal > 500 ? 0 : 50; // Free shipping above ₹500

        // Handle Coupon
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (data.couponCode) {
            const validation = await validateCoupon(data.couponCode, subtotal);
            if (validation.isValid && validation.discount) {
                discountAmount = validation.discount;
                appliedCouponCode = data.couponCode;
            } else {
                // Should we throw error or just ignore invalid coupon? 
                // Better to throw so user knows their coupon didn't work
                throw new AppError(validation.message || 'Invalid coupon', 400, 'INVALID_COUPON');
            }
        }

        const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST on discounted price (Example)
        const totalAmount = subtotal + shippingCharge + taxAmount - discountAmount;

        // Create order in transaction
        const result = await db.transaction(async (tx) => {
            // Create order
            const [order] = await tx.insert(orders).values({
                userId,
                orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Create a proper order number
                orderStatus: 'pending',
                paymentStatus: 'pending',
                paymentMethod: data.paymentMethod as any,
                subtotal: subtotal.toString(),
                discountAmount: discountAmount.toString(),
                taxAmount: taxAmount.toString(),
                shippingCharge: shippingCharge.toString(),
                totalAmount: totalAmount.toString(),
                couponCode: appliedCouponCode,
                shippingAddress: shippingAddress as any,
                billingAddress: billingAddress as any,
                customerNotes: data.notes,
                createdAt: new Date()
            }).returning();

            // Create order items and update inventory
            for (const item of orderItemsList) {
                await tx.insert(orderItems).values({
                    orderId: order.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.productName,
                    sku: item.sku,
                    taxAmount: item.taxAmount,
                    totalAmount: item.totalAmount
                });

                // Update inventory (simplified - deduct from first warehouse)
                const invItem = await tx.query.inventory.findFirst({
                    where: eq(inventory.variantId, item.variantId),
                    orderBy: desc(inventory.stockQty)
                });

                if (invItem) {
                    await tx.update(inventory)
                        .set({
                            stockQty: invItem.stockQty - item.quantity
                        })
                        .where(eq(inventory.id, invItem.id));

                    // Record stock movement
                    await tx.insert(stockMovements).values({
                        variantId: item.variantId,
                        warehouseId: invItem.warehouseId,
                        movementType: 'out',
                        quantity: item.quantity,
                        referenceType: 'order',
                        referenceId: order.id,
                        notes: `Order #${order.orderNumber}`,
                        createdAt: new Date()
                    });
                }
            }

            // Clear cart
            await tx.delete(cartItems)
                .where(eq(cartItems.cartId, cart.id));

            // Update coupon usage if used
            if (appliedCouponCode) {
                await tx.execute(sql`
                    UPDATE ${coupons} 
                    SET usage_count = usage_count + 1 
                    WHERE code = ${appliedCouponCode}
                `);
            }

            return { order };
        });

        // Create payment if not COD
        let paymentInfo = null;
        if (data.paymentMethod !== 'cod') {
            paymentInfo = await createPaymentOrder(result.order.id, parseFloat(result.order.totalAmount));
        }

        return {
            orderId: result.order.id,
            payment: paymentInfo
        };
    }, ['/cart', '/orders']);
}

export async function getOrders(params?: OrderFilterParams): Promise<ApiResponse<OrderWithDetails[]>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;
        const { page = 1, limit = 10, orderStatus, paymentStatus, startDate, endDate } = params || {};
        const offset = (page - 1) * limit;

        const conditions = [eq(orders.userId, userId)];

        if (orderStatus) {
            conditions.push(eq(orders.orderStatus, orderStatus));
        }

        if (paymentStatus) {
            conditions.push(eq(orders.paymentStatus, paymentStatus));
        }

        if (startDate && endDate) {
            conditions.push(between(orders.createdAt, startDate, endDate));
        }

        const ordersList = await db.query.orders.findMany({
            where: and(...conditions),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: {
                                    with: {
                                        images: {
                                            where: eq(productImages.isPrimary, true)
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                payment: true,
                shipments: true
            },
            orderBy: desc(orders.createdAt),
            limit,
            offset
        });

        // Parse address JSON not needed for jsonb, just cast
        const ordersWithDetails = ordersList.map(order => ({
            ...order,
            items: (order as any).items, // Explicitly include items with cast
            billingAddress: order.billingAddress as Address,
            shippingAddress: order.shippingAddress as Address,
            user: userResponse.data,
            shipment: (order as any).shipments?.[0] || null // Map array to single object
        }));

        return ordersWithDetails;
    });
}

export async function getOrderById(orderId: number): Promise<ApiResponse<OrderWithDetails>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        const order = await db.query.orders.findFirst({
            where: and(
                eq(orders.id, orderId),
                eq(orders.userId, userId)
            ),
            with: {
                items: {
                    with: {
                        variant: {
                            with: {
                                product: {
                                    with: {
                                        images: {
                                            where: eq(productImages.isPrimary, true)
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                payment: true,
                shipments: true
            }
        });

        if (!order) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        return {
            ...order,
            items: (order as any).items,
            billingAddress: order.billingAddress as Address,
            shippingAddress: order.shippingAddress as Address,
            user: userResponse.data,
            shipment: (order as any).shipments?.[0] || null
        };
    });
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function createReview(data: {
    productId: number;
    orderItemId: number;
    rating: number;
    comment: string;
}): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
            throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
        }

        const userId = userResponse.data.id;

        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            throw new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING');
        }

        // Verify user purchased this product
        const orderItem = await db.query.orderItems.findFirst({
            where: eq(orderItems.id, data.orderItemId),
            with: {
                order: true,
                variant: {
                    with: {
                        product: true
                    }
                }
            }
        });

        if (!orderItem) {
            throw new AppError('Order item not found', 404, 'ORDER_ITEM_NOT_FOUND');
        }

        if (orderItem.order.userId !== userId) {
            throw new AppError('You can only review products you purchased', 403, 'UNAUTHORIZED');
        }

        if (orderItem.variant.product.id !== data.productId) {
            throw new AppError('Product mismatch', 400, 'PRODUCT_MISMATCH');
        }

        // Check if already reviewed
        const existingReview = await db.query.reviews.findFirst({
            where: and(
                eq(reviews.userId, userId),
                eq(reviews.productId, data.productId),
                eq(reviews.orderItemId, data.orderItemId)
            )
        });

        if (existingReview) {
            throw new AppError('You have already reviewed this product', 400, 'ALREADY_REVIEWED');
        }

        await db.insert(reviews).values({
            productId: data.productId,
            userId,
            orderItemId: data.orderItemId,
            rating: data.rating,
            comment: data.comment,
            isVerified: true, // Verified purchase
            createdAt: new Date()
        });

        return { message: 'Review submitted successfully' };
    }, ['/products/[slug]', '/orders']);
}

export async function getReviewsByProduct(productId: number): Promise<ApiResponse<Review[]>> {
    return handleServerAction(async () => {
        const productReviews = await db.query.reviews.findMany({
            where: and(
                eq(reviews.productId, productId),
                eq(reviews.isApproved, true)
            ),
            with: {
                user: {
                    with: {
                        profile: true
                    }
                }
            },
            orderBy: desc(reviews.createdAt)
        });

        return productReviews;
    });
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data || userResponse.data.role !== 'admin') {
            throw new AppError('Admin access required', 403, 'ADMIN_REQUIRED');
        }

        // Get stats in parallel
        const [
            revenueResult,
            ordersCount,
            usersCount,
            productsCount,
            pendingOrders,
            recentOrders,
            topSelling
        ] = await Promise.all([
            // Total revenue
            db.select({
                total: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
            })
                .from(orders)
                .where(eq(orders.paymentStatus, 'paid')),

            // Total orders
            db.select({ count: count() }).from(orders),

            // Total users
            db.select({ count: count() }).from(users),

            // Total active products
            db.select({ count: count() })
                .from(products)
                .where(eq(products.isActive, true)),

            // Pending orders
            db.select({ count: count() })
                .from(orders)
                .where(eq(orders.orderStatus, 'pending')),

            // Recent orders
            db.query.orders.findMany({
                with: {
                    user: true,
                    items: {
                        with: {
                            variant: {
                                with: {
                                    product: true
                                }
                            }
                        },
                        limit: 1
                    }
                },
                orderBy: desc(orders.createdAt),
                limit: 10
            }),

            // Top selling products
            db.select({
                product: products,
                totalSold: sql<number>`SUM(${orderItems.quantity})`,
                revenue: sql<number>`SUM(CAST(${orderItems.price} AS DECIMAL) * ${orderItems.quantity})`
            })
                .from(orderItems)
                .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
                .leftJoin(products, eq(productVariants.productId, products.id))
                .groupBy(products.id)
                .orderBy(desc(sql`SUM(${orderItems.quantity})`))
                .limit(5)
        ]);

        // Low stock products
        const lowStockResult = await db.select({ count: count() })
            .from(inventory)
            .where(lte(inventory.stockQty, inventory.reorderLevel));

        return {
            totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
            totalOrders: ordersCount[0]?.count || 0,
            totalUsers: usersCount[0]?.count || 0,
            totalProducts: productsCount[0]?.count || 0,
            pendingOrders: pendingOrders[0]?.count || 0,
            lowStockProducts: lowStockResult[0]?.count || 0,
            recentOrders: recentOrders,
            topSellingProducts: topSelling
                .filter(item => item.product !== null)
                .map(item => ({
                    product: item.product!,
                    totalSold: Number(item.totalSold) || 0,
                    revenue: parseFloat(item.revenue?.toString() || '0')
                }))
        };
    });
}

// ============================================================================
// ENQUIRIES
// ============================================================================

export async function submitEnquiry(data: NewEnquiry): Promise<ApiResponse> {
    return handleServerAction(async () => {
        // Validate required fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            throw new AppError('All fields are required', 400, 'VALIDATION_ERROR');
        }

        if (!validateEmail(data.email)) {
            throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        if (data.phone && !validatePhone(data.phone)) {
            throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');
        }

        // If user is logged in, attach user ID
        let userId = null;
        try {
            const userResponse = await getCurrentUser();
            if (userResponse.success && userResponse.data) {
                userId = userResponse.data.id;
            }
        } catch {
            // User not logged in, that's fine
        }

        const [enquiry] = await db.insert(enquiries).values({
            ...data,
            userId,
            status: 'pending',
            createdAt: new Date()
        }).returning();

        return {
            message: 'Enquiry submitted successfully',
            data: enquiry
        };
    });
}

// ============================================================================
// CATEGORIES & BRANDS
// ============================================================================

export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
    return handleServerAction(async () => {
        const categoryList: Category[] = await db.select()
            .from(categories)
            .orderBy(asc(categories.name));

        return categoryList;
    });
}

export async function getAllBrands(): Promise<ApiResponse<Brand[]>> {
    return handleServerAction(async () => {
        const brandList: Brand[] = await db.select()
            .from(brands)
            .orderBy(asc(brands.name));

        return brandList;
    });
}

// ============================================================================
// MISCELLANEOUS
// ============================================================================

export async function getActiveBanners(): Promise<ApiResponse<Banner[]>> {
    return handleServerAction(async () => {
        const bannerList: Banner[] = await db.select()
            .from(banners)
            .where(eq(banners.isActive, true))
            .orderBy(desc(banners.id));

        return bannerList;
    });
}

export async function checkStock(variantId: number): Promise<ApiResponse<{ available: number }>> {
    return handleServerAction(async () => {
        const inventoryList = await db.select()
            .from(inventory)
            .where(eq(inventory.variantId, variantId));

        const totalStock = inventoryList.reduce((sum: number, inv: any) => sum + inv.stockQty, 0);

        return { available: totalStock };
    });
}

// ============================================================================
// OTP AUTHENTICATION
// ============================================================================

export async function requestLoginOtp(phone: string): Promise<ApiResponse<{ otp?: string }>> {
    return handleServerAction(async () => {
        if (!validatePhone(phone)) {
            throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');
        }

        // In production, integrate with SMS gateway like Twilio, Msg91, etc.
        // For development, generate a test OTP
        const otp = '1234'; // In production: Math.floor(1000 + Math.random() * 9000).toString();

        // Store OTP in database with expiry (you'll need an otp_codes table)
        // For now, we'll just log it
        console.log(`OTP for ${phone}: ${otp}`);

        return {
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
    });
}

export async function verifyLoginOtp(phone: string, otp: string): Promise<ApiResponse<SessionUser>> {
    return handleServerAction(async () => {
        if (!validatePhone(phone)) {
            throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');
        }

        // In production, verify OTP from database
        // For development, use static OTP
        const validOtp = '1234';

        if (otp !== validOtp) {
            throw new AppError('Invalid OTP', 401, 'INVALID_OTP');
        }

        // Find or create user
        let user = await db.query.users.findFirst({
            where: eq(users.phone, phone),
            with: {
                profile: true
            }
        });

        if (!user) {
            // Create new user
            const [newUser] = await db.transaction(async (tx) => {
                const [user] = await tx.insert(users).values({
                    phone,
                    email: `${phone}@temp.gunasherbals.com`,
                    name: `User ${phone}`,
                    passwordHash: await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10),
                    role: 'customer',
                    status: 'active',
                    createdAt: new Date()
                }).returning();

                await tx.insert(userProfiles).values({
                    userId: user.id
                });

                await tx.insert(carts).values({
                    userId: user.id
                });

                await tx.insert(wishlists).values({
                    userId: user.id
                });

                return [user];
            });

            user = newUser;
        }

        // Create session
        await createSession(user.id, user.role, user.email);

        return {
            id: user.id,
            name: user.name,
            email: user?.email || '',
            role: (user?.role || 'customer') as 'admin' | 'staff' | 'customer',
            phone: user?.phone || undefined,
            profile: user?.profile || undefined
        };
    }, ['/']);
}

// ============================================================================
// COUPONS & INVETORY HELPER
// ============================================================================

export async function validateCoupon(code: string, cartTotal: number): Promise<{ isValid: boolean; discount?: number; message?: string }> {
    if (!code) return { isValid: false, message: 'Code required' };

    const coupon = await db.query.coupons.findFirst({
        where: and(
            eq(coupons.code, code),
            eq(coupons.isActive, true),
            gte(coupons.expiryDate, new Date().toISOString()) // Check expiry
        )
    });

    if (!coupon) {
        return { isValid: false, message: 'Invalid or expired coupon' };
    }

    if (coupon.minOrderAmount && cartTotal < parseFloat(coupon.minOrderAmount)) {
        return { isValid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` };
    }

    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return { isValid: false, message: 'Coupon usage limit reached' };
    }

    // Calculate discount
    let discount = 0;
    const value = parseFloat(coupon.discountValue);

    if (coupon.discountType === 'percentage') {
        discount = (cartTotal * value) / 100;
        if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, parseFloat(coupon.maxDiscountAmount));
        }
    } else {
        discount = value;
    }

    return { isValid: true, discount };
}


// ============================================================================
// ORDER MANAGEMENT (ADMIN)
// ============================================================================

export async function updateOrderStatus(orderId: number, status: string): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await enforceRateLimit('admin-order-status', 30, 60_000);
        if (!Number.isInteger(Number(orderId)) || Number(orderId) <= 0) throw new AppError('Invalid order ID', 400, 'VALIDATION_ERROR');
        const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
        if (!allowedStatuses.includes(status)) throw new AppError('Invalid order status', 400, 'VALIDATION_ERROR');
        const userResponse = await getCurrentUser();
        // Check admin role
        if (!userResponse.data || userResponse.data.role !== 'admin') {
            throw new AppError('Unauthorized', 403, 'ADMIN_REQUIRED');
        }

                const [updated] = await db.update(orders)
            .set({ orderStatus: status as any, updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning({ id: orders.id, orderStatus: orders.orderStatus });
        if (!updated) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        await db.insert(auditLogs).values({ userId: userResponse.data.id, userEmail: userResponse.data.email, action: 'update_order_status', entity: 'order', entityId: orderId, newValues: { status } });
        return { message: `Order status updated to ${status}` };
    }, ['/admin/orders', `/admin/orders/${orderId}`]);
}

export async function cancelOrder(orderId: number, reason: string): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.data) throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: { items: true }
        });

        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        // Only allow cancellation if pending or confirmed
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            // Admin might force cancel, but regular user logic here
            if (userResponse.data.role !== 'admin') {
                throw new AppError('Cannot cancel order at this stage', 400, 'INVALID_STATUS');
            }
        }

        // Transaction: Update status + Restore inventory
        await db.transaction(async (tx) => {
            await tx.update(orders).set({
                orderStatus: 'cancelled',
                internalNotes: `Cancelled by ${userResponse.data?.name}: ${reason}`,
                updatedAt: new Date()
            }).where(eq(orders.id, orderId));

            // Restore stock
            for (const item of order.items) {
                const invItem = await tx.query.inventory.findFirst({
                    where: eq(inventory.variantId, item.variantId)
                });

                if (invItem) {
                    await tx.update(inventory)
                        .set({ stockQty: invItem.stockQty + item.quantity })
                        .where(eq(inventory.id, invItem.id));

                    await tx.insert(stockMovements).values({
                        variantId: item.variantId,
                        warehouseId: invItem.warehouseId,
                        movementType: 'in', // Returned/Cancelled
                        quantity: item.quantity,
                        referenceType: 'order_cancel',
                        referenceId: orderId,
                        createdAt: new Date()
                    });
                }
            }
        });

        return { message: 'Order cancelled successfully' };
    }, ['/orders', '/admin/orders']);
}

// ============================================================================
// RETURNS & REFUNDS
// ============================================================================

export async function requestReturn(data: {
    orderId: number;
    orderItemId: number;
    reason: string;
    quantity: number;
}): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (!userResponse.data) throw new AppError('Not authenticated', 401);

        const orderItem = await db.query.orderItems.findFirst({
            where: eq(orderItems.id, data.orderItemId),
            with: { order: true }
        });

        if (!orderItem) throw new AppError('Item not found', 404);
        if (orderItem.order.id !== data.orderId) throw new AppError('Mismatch', 400);
        if (orderItem.order.userId !== userResponse.data.id && userResponse.data.role !== 'admin') {
            throw new AppError('Unauthorized', 403);
        }

        if (data.quantity > orderItem.quantity) {
            throw new AppError('Invalid return quantity', 400);
        }

        await db.insert(returns).values({
            orderId: data.orderId,
            orderItemId: data.orderItemId,
            returnNumber: `RET-${Date.now()}`,
            reason: data.reason,
            quantity: data.quantity,
            status: 'requested',
            requestedAt: new Date()
        });

        return { message: 'Return requested successfully' };
    }, ['/orders']);
}

export async function processReturn(returnId: number, action: 'approve' | 'reject', notes?: string): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const userResponse = await getCurrentUser();
        if (userResponse.data?.role !== 'admin') throw new AppError('Unauthorized', 403);

        const ret = await db.query.returns.findFirst({ where: eq(returns.id, returnId) });
        if (!ret) throw new AppError('Return not found', 404);

        if (action === 'reject') {
            await db.update(returns).set({
                status: 'rejected',
                rejectedAt: new Date(),
                adminNotes: notes
            }).where(eq(returns.id, returnId));
        } else {
            await db.update(returns).set({
                status: 'approved',
                approvedAt: new Date(),
                adminNotes: notes
            }).where(eq(returns.id, returnId));

            // Optionally trigger refund logic here or let admin do it manually via createRefund
        }

        return { message: `Return ${action}d` };
    }, ['/admin/returns']);
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPaymentOrder(orderId: number, amount: number): Promise<{ id: string; currency: string; amount: number; key: string }> {
    return handleServerAction(async () => {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new AppError('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503, 'RAZORPAY_NOT_CONFIGURED');
        }

        const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        const existingPayment = await db.query.payments.findFirst({
            where: and(eq(payments.orderId, orderId), eq(payments.status, 'pending')),
            orderBy: desc(payments.createdAt)
        });
        if (existingPayment?.gatewayOrderId) {
            return { id: existingPayment.gatewayOrderId, currency: 'INR', amount: Math.round(amount * 100), key: keyId };
        }

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: order.orderNumber,
                notes: { orderId: String(order.id) }
            }),
            cache: 'no-store'
        });
        const gatewayOrder = await response.json();
        if (!response.ok || !gatewayOrder.id) {
            console.error('Razorpay order creation failed', { status: response.status, gatewayOrder });
            throw new AppError('Unable to create Razorpay payment order', 502, 'RAZORPAY_ORDER_FAILED');
        }

        await db.insert(payments).values({
            orderId,
            paymentMethod: 'razorpay',
            paymentGateway: 'razorpay',
            amount: amount.toFixed(2),
            currency: 'INR',
            status: 'pending',
            gatewayOrderId: gatewayOrder.id,
            initiatedAt: new Date(),
            createdAt: new Date()
        });

        return { id: gatewayOrder.id, currency: gatewayOrder.currency || 'INR', amount: gatewayOrder.amount, key: keyId };
    });
}

export async function verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new AppError('Razorpay is not configured', 503, 'RAZORPAY_NOT_CONFIGURED');

        const payment = await db.query.payments.findFirst({ where: eq(payments.gatewayOrderId, data.razorpay_order_id) });
        if (!payment) throw new AppError('Payment order not found', 404, 'PAYMENT_NOT_FOUND');
        if (payment.status === 'paid' && payment.gatewayPaymentId === data.razorpay_payment_id) {
            return { message: 'Payment already verified' };
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
            .digest('hex');
        const signaturesMatch = expectedSignature.length === data.razorpay_signature.length && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(data.razorpay_signature));
        if (!signaturesMatch) throw new AppError('Payment verification failed', 400, 'INVALID_PAYMENT_SIGNATURE');

        await db.transaction(async (tx) => {
            await tx.update(payments)
                .set({ status: 'paid', gatewayPaymentId: data.razorpay_payment_id, gatewaySignature: data.razorpay_signature, paidAt: new Date(), updatedAt: new Date() })
                .where(eq(payments.id, payment.id));
            await tx.update(orders)
                .set({ paymentStatus: 'paid', orderStatus: 'confirmed', updatedAt: new Date() })
                .where(eq(orders.id, payment.orderId));
        });

        const orderForEmail = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId), with: { user: true } });
        if (orderForEmail?.user?.email) {
            void sendTransactionalEmail({
                to: orderForEmail.user.email,
                subject: `Order confirmed — ${orderForEmail.orderNumber}`,
                text: `Thank you for your order. Your payment for ${orderForEmail.orderNumber} was confirmed. Total: INR ${orderForEmail.totalAmount}.`,
                html: `<p>Thank you for your order.</p><p>Your payment for <strong>${orderForEmail.orderNumber}</strong> was confirmed.</p><p>Total: INR ${orderForEmail.totalAmount}</p>`
            }).catch((error) => console.error('Order confirmation email failed', error));
        }

        return { message: 'Payment verified successfully' };
    });
}


// Compatibility wrappers for legacy screens included in the original archive.
// These wrappers now use the real Neon-backed tables and enforce admin access for mutations.
async function requireAdminUser() {
    const response = await getCurrentUser();
    if (!response.success || !response.data || !['admin', 'staff'].includes(response.data.role)) {
        throw new AppError('Admin access required', 403, 'ADMIN_REQUIRED');
    }
    return response.data;
}

export async function createAdminManualOrder(data: {
    items: Array<{ variantId: number; quantity: number }>;
    shippingAddress: { name: string; phone: string; email?: string; address: string; city?: string; state?: string; zip?: string };
    notes?: string;
}): Promise<ApiResponse<{ orderId: number; orderNumber: string }>> {
    return handleServerAction(async () => {
        const admin = await requireAdminUser();
        if (!data.items?.length) throw new AppError('Add at least one item', 400, 'EMPTY_ORDER');
        if (!data.shippingAddress?.name || !data.shippingAddress?.phone || !data.shippingAddress?.address) {
            throw new AppError('Customer name, phone, and address are required', 400, 'INVALID_ADDRESS');
        }
        if (!validatePhone(data.shippingAddress.phone.replace(/\\D/g, ''))) throw new AppError('Enter a valid 10-digit phone number', 400, 'INVALID_PHONE');

        const result = await db.transaction(async (tx) => {
            const calculatedItems: any[] = [];
            let subtotal = 0;
            for (const requested of data.items) {
                const quantity = Number(requested.quantity);
                if (!Number.isInteger(quantity) || quantity < 1) throw new AppError('Invalid item quantity', 400, 'INVALID_QUANTITY');
                const rows = await tx.select({ variant: productVariants, product: products, inventory: inventory })
                    .from(productVariants)
                    .innerJoin(products, eq(products.id, productVariants.productId))
                    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
                    .where(and(eq(productVariants.id, Number(requested.variantId)), eq(productVariants.isActive, true), eq(products.isActive, true)));
                if (!rows.length) throw new AppError('Product variant is unavailable', 400, 'VARIANT_UNAVAILABLE');
                const variant = rows[0].variant;
                const available = rows.reduce((sum: number, row: any) => sum + Math.max(0, (row.inventory?.stockQty ?? 0) - (row.inventory?.reservedQty ?? 0)), 0);
                if (available < quantity) throw new AppError(`Insufficient stock for ${rows[0].product.name}`, 400, 'INSUFFICIENT_STOCK');
                const price = Number(variant.price);
                const lineTotal = price * quantity;
                subtotal += lineTotal;
                calculatedItems.push({ variantId: variant.id, quantity, price: price.toFixed(2), productName: rows[0].product.name, variantName: variant.variantName, sku: variant.sku, totalAmount: lineTotal.toFixed(2) });
            }
            const shippingCharge = subtotal >= 500 ? 0 : 50;
            const totalAmount = subtotal + shippingCharge;
            const orderNumber = `GUN-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
            const address = { ...data.shippingAddress, country: 'India' };
            const [order] = await tx.insert(orders).values({ orderNumber, userId: null, orderStatus: 'processing', paymentStatus: 'pending', paymentMethod: 'cod', subtotal: subtotal.toFixed(2), discountAmount: '0', taxAmount: '0', shippingCharge: shippingCharge.toFixed(2), totalAmount: totalAmount.toFixed(2), shippingAddress: address, billingAddress: address, internalNotes: data.notes || 'Manual order created by admin' }).returning({ id: orders.id, orderNumber: orders.orderNumber });
            await tx.insert(payments).values({ orderId: order.id, paymentMethod: 'cod', paymentGateway: 'manual', amount: totalAmount.toFixed(2), currency: 'INR', status: 'pending' });
            for (const item of calculatedItems) {
                await tx.insert(orderItems).values({ orderId: order.id, variantId: item.variantId, productName: item.productName, variantName: item.variantName, sku: item.sku, quantity: item.quantity, price: item.price, taxAmount: '0', discountAmount: '0', totalAmount: item.totalAmount });
                const stockRows = await tx.select({ id: inventory.id, warehouseId: inventory.warehouseId, stockQty: inventory.stockQty, reservedQty: inventory.reservedQty }).from(inventory).where(eq(inventory.variantId, item.variantId));
                let remaining = item.quantity;
                for (const stock of stockRows) {
                    if (remaining <= 0) break;
                    const decrement = Math.min(remaining, Math.max(0, stock.stockQty - stock.reservedQty));
                    if (decrement > 0) {
                        await tx.update(inventory).set({ stockQty: sql`${inventory.stockQty} - ${decrement}`, updatedAt: new Date() }).where(eq(inventory.id, stock.id));
                        await tx.insert(stockMovements).values({ variantId: item.variantId, warehouseId: stock.warehouseId, movementType: 'out', quantity: decrement, referenceType: 'manual_order', referenceId: order.id, createdBy: admin.id, notes: order.orderNumber });
                        remaining -= decrement;
                    }
                }
            }
            await tx.insert(auditLogs).values({ userId: admin.id, userEmail: admin.email, action: 'create_manual_order', entity: 'order', entityId: order.id, newValues: { orderNumber, totalAmount, itemCount: calculatedItems.length } });
            return order;
        });
        return result;
    }, ['/admin/orders', '/admin/dashboard', '/admin/products']);
}

export async function getAllOrders(): Promise<any[]> {
    const response = await getAdminOrders();
    return response.success && response.data ? response.data : [];
}

export async function getAllUsers(): Promise<any[]> {
    const admin = await requireAdminUser();
    void admin;
    return db.query.users.findMany({
        with: { profile: true },
        orderBy: desc(users.createdAt)
    });
}

export async function getAdminStat(): Promise<any> {
    const stats = await getDashboardStats();
    return stats.success && stats.data ? {
        ...stats.data,
        customers: await getAllUsers(),
        orders: await getAllOrders()
    } : {};
}

export async function getOrdersByUser(userId: number): Promise<any[]> {
    const response = await getOrders();
    return response.success && response.data ? response.data.filter((order: any) => order.userId === userId || order.user?.id === userId) : [];
}

export async function getWishlistWithItems(userId: number): Promise<{ items: any[] }> {
    const rows = await db.query.wishlistItems.findMany({
        with: { product: { with: { images: true, variants: true } } },
        where: eq(wishlistItems.wishlistId, userId)
    });
    return { items: rows };
}

export async function getSessionsByUser(userId: number): Promise<any[]> {
    await requireAdminUser();
    return db.select().from(userSessions).where(eq(userSessions.userId, userId)).orderBy(desc(userSessions.createdAt));
}

export async function revokeSession(sessionId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await requireAdminUser();
        await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.id, sessionId));
        return { message: 'Session revoked' };
    }, ['/admin/security']);
}

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function addProduct(data: any): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await requireAdminUser();
        if (!data?.name || !data?.categoryId) throw new AppError('Product name and category are required', 400, 'VALIDATION_ERROR');
        const baseSlug = slugify(data.slug || data.name);
        const [product] = await db.insert(products).values({
            name: data.name,
            slug: baseSlug,
            description: data.description || null,
            shortDescription: data.shortDescription || null,
            categoryId: Number(data.categoryId),
            brandId: data.brandId ? Number(data.brandId) : null,
            isActive: data.isActive !== false,
            isFeatured: Boolean(data.isFeatured)
        }).returning();
        const variant = data.variants?.[0] || {};
        if (variant.price) {
            const [createdVariant] = await db.insert(productVariants).values({
                productId: product.id,
                sku: variant.sku || `GUNA-${product.id}`,
                variantName: variant.variantName || 'Standard',
                price: String(variant.price),
                compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : null,
                weight: variant.weight ? String(variant.weight) : null,
                isActive: true
            }).returning();
            const warehouse = await db.query.warehouses.findFirst({ where: eq(warehouses.isActive, true) });
            if (warehouse) await db.insert(inventory).values({ variantId: createdVariant.id, warehouseId: warehouse.id, stockQty: Number(variant.stock || 0), reorderLevel: 10 });
        }
        return product;
    }, ['/admin/products']);
}

export async function updateProduct(id: number, data: any): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const [product] = await db.update(products).set({
            name: data.name,
            slug: data.slug || slugify(data.name),
            description: data.description || null,
            shortDescription: data.shortDescription || null,
            categoryId: data.categoryId ? Number(data.categoryId) : undefined,
            brandId: data.brandId ? Number(data.brandId) : null,
            isActive: data.isActive !== false,
            isFeatured: Boolean(data.isFeatured),
            updatedAt: new Date()
        }).where(eq(products.id, id)).returning();
        const variant = data.variants?.[0];
        if (variant) {
            const existing = await db.query.productVariants.findFirst({ where: eq(productVariants.productId, id) });
            if (existing) await db.update(productVariants).set({ price: String(variant.price || existing.price), sku: variant.sku || existing.sku, updatedAt: new Date() }).where(eq(productVariants.id, existing.id));
        }
        return product;
    }, ['/admin/products', `/shop/${id}`]);
}

export async function deleteProduct(id: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await requireAdminUser();
        await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
        return { message: 'Product archived' };
    }, ['/admin/products', '/shop']);
}

export async function getAdminNotifications(): Promise<ApiResponse<any[]>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const [pendingOrders, unreadEnquiries] = await Promise.all([
            db.query.orders.findMany({ where: eq(orders.orderStatus, 'pending'), orderBy: desc(orders.createdAt), limit: 20 }),
            db.query.enquiries.findMany({ where: eq(enquiries.status, 'pending'), orderBy: desc(enquiries.createdAt), limit: 20 })
        ]);
        return [
            ...pendingOrders.map((order: any) => ({ id: `order-${order.id}`, type: 'order', title: `New order #${order.orderNumber || order.id}`, body: `₹${order.totalAmount || 0} awaiting confirmation`, status: 'unread', createdAt: order.createdAt, href: `/admin/orders/${order.id}` })),
            ...unreadEnquiries.map((enquiry: any) => ({ id: `enquiry-${enquiry.id}`, type: 'enquiry', title: enquiry.subject || 'New customer enquiry', body: `${enquiry.name} · ${enquiry.email}`, status: 'unread', createdAt: enquiry.createdAt, href: '/admin/customers' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
}

export async function markEnquiryRead(enquiryId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        await requireAdminUser();
        await db.update(enquiries).set({ status: 'read', updatedAt: new Date() }).where(eq(enquiries.id, enquiryId));
        return { message: 'Enquiry marked as read' };
    }, ['/admin/notifications', '/admin/logs']);
}


// ============================================================================
// ADMIN FULFILLMENT — MANUAL COURIER WORKFLOW
// ============================================================================

export async function getAdminOrders(): Promise<ApiResponse<any[]>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        return db.query.orders.findMany({
            with: { shipments: true },
            orderBy: desc(orders.createdAt),
            limit: 100,
        });
    }, ['/admin/delivery', '/admin/orders']);
}

export async function getAdminShipments(): Promise<ApiResponse<any[]>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        return db.query.shipments.findMany({
            with: { order: true },
            orderBy: desc(shipments.createdAt),
            limit: 100,
        });
    }, ['/admin/delivery']);
}

export async function createManualShipment(data: {
    orderId: number;
    courierName: string;
    shipmentNumber?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: string;
    estimatedDelivery?: string;
}): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const courierName = data.courierName?.trim();
        if (!data.orderId || !courierName) throw new AppError('Order and courier are required', 400, 'VALIDATION_ERROR');

        const order = await db.query.orders.findFirst({ where: eq(orders.id, data.orderId) });
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        const existing = await db.query.shipments.findFirst({ where: eq(shipments.orderId, data.orderId) });
        if (existing) throw new AppError('This order already has a shipment', 409, 'SHIPMENT_EXISTS');

        const status = data.status || 'label_created';
        const shipmentNumber = data.shipmentNumber?.trim() || `GUNA-SHP-${Date.now()}`;
        const [shipment] = await db.insert(shipments).values({
            orderId: data.orderId,
            shipmentNumber,
            courierName,
            trackingNumber: data.trackingNumber?.trim() || null,
            trackingUrl: data.trackingUrl?.trim() || null,
            shippingAddress: order.shippingAddress as any,
            status,
            shippedAt: ['shipped', 'in_transit', 'delivered'].includes(status) ? new Date() : null,
            estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
        }).returning();

        const orderStatus = ['shipped', 'in_transit'].includes(status) ? 'shipped' : status === 'delivered' ? 'delivered' : 'processing';
        await db.update(orders).set({ orderStatus: orderStatus as any, updatedAt: new Date() }).where(eq(orders.id, data.orderId));
        return shipment;
    }, ['/admin/delivery', '/admin/orders']);
}

export async function updateManualShipment(id: number, data: {
    courierName?: string;
    shipmentNumber?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: string;
    estimatedDelivery?: string | null;
    deliveryProof?: string | null;
}): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const existing = await db.query.shipments.findFirst({ where: eq(shipments.id, id) });
        if (!existing) throw new AppError('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');

        const status = data.status || existing.status || 'pending';
        const [shipment] = await db.update(shipments).set({
            courierName: data.courierName?.trim() || existing.courierName,
            shipmentNumber: data.shipmentNumber?.trim() || existing.shipmentNumber,
            trackingNumber: data.trackingNumber?.trim() || null,
            trackingUrl: data.trackingUrl?.trim() || null,
            status,
            estimatedDelivery: data.estimatedDelivery === null ? null : data.estimatedDelivery ? new Date(data.estimatedDelivery) : existing.estimatedDelivery,
            shippedAt: ['shipped', 'in_transit', 'delivered'].includes(status) ? (existing.shippedAt || new Date()) : existing.shippedAt,
            deliveredAt: status === 'delivered' ? (existing.deliveredAt || new Date()) : null,
            deliveryProof: data.deliveryProof ?? existing.deliveryProof,
            updatedAt: new Date(),
        }).where(eq(shipments.id, id)).returning();

        const orderStatus = ['shipped', 'in_transit'].includes(status) ? 'shipped' : status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : 'processing';
        await db.update(orders).set({ orderStatus: orderStatus as any, updatedAt: new Date() }).where(eq(orders.id, existing.orderId));
        return shipment;
    }, ['/admin/delivery', '/admin/orders']);
}


// ============================================================================
// ADMIN INVENTORY, RETURNS & REFUNDS
// ============================================================================

export async function adjustInventory(data: {
    variantId: number;
    warehouseId: number;
    quantity: number;
    movementType: 'in' | 'out' | 'adjustment';
    notes?: string;
}): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        const admin = await requireAdminUser();
        const quantity = Number(data.quantity);
        if (!data.variantId || !data.warehouseId || !Number.isInteger(quantity) || quantity === 0) {
            throw new AppError('Variant, warehouse, and non-zero integer quantity are required', 400, 'VALIDATION_ERROR');
        }

        return db.transaction(async (tx) => {
            const current = await tx.query.inventory.findFirst({
                where: and(eq(inventory.variantId, data.variantId), eq(inventory.warehouseId, data.warehouseId))
            });
            const previousQty = Number(current?.stockQty || 0);
            const newQty = data.movementType === 'adjustment' ? quantity : previousQty + (data.movementType === 'in' ? quantity : -quantity);
            if (newQty < 0) throw new AppError('Inventory cannot become negative', 400, 'INSUFFICIENT_STOCK');

            let inventoryRow;
            if (current) {
                [inventoryRow] = await tx.update(inventory).set({ stockQty: newQty, updatedAt: new Date(), lastRestocked: data.movementType === 'in' ? new Date() : current.lastRestocked }).where(eq(inventory.id, current.id)).returning();
            } else {
                if (data.movementType !== 'in' && data.movementType !== 'adjustment') throw new AppError('Inventory row does not exist', 404, 'INVENTORY_NOT_FOUND');
                [inventoryRow] = await tx.insert(inventory).values({ variantId: data.variantId, warehouseId: data.warehouseId, stockQty: newQty, reorderLevel: 10 }).returning();
            }
            await tx.insert(stockMovements).values({
                variantId: data.variantId,
                warehouseId: data.warehouseId,
                movementType: data.movementType,
                quantity: Math.abs(quantity),
                previousQty,
                newQty,
                referenceType: 'admin_adjustment',
                notes: data.notes || null,
                createdBy: admin.id,
                createdAt: new Date(),
            });
            return inventoryRow;
        });
    }, ['/admin/products', '/admin/inventory']);
}

export async function createRefund(data: { returnId: number; amount: number; refundMethod?: string; notes?: string }): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const amount = Number(data.amount);
        if (!data.returnId || !Number.isFinite(amount) || amount <= 0) throw new AppError('Return and positive refund amount are required', 400, 'VALIDATION_ERROR');
        const ret = await db.query.returns.findFirst({ where: eq(returns.id, data.returnId), with: { order: true } });
        if (!ret) throw new AppError('Return not found', 404, 'RETURN_NOT_FOUND');
        if (ret.status !== 'approved') throw new AppError('Return must be approved before refunding', 409, 'RETURN_NOT_APPROVED');
        const duplicate = await db.query.refunds.findFirst({ where: and(eq(refunds.returnId, data.returnId), inArray(refunds.status, ['pending', 'processed'])) });
        if (duplicate) throw new AppError('A refund already exists for this return', 409, 'REFUND_EXISTS');

        return db.transaction(async (tx) => {
            const [refund] = await tx.insert(refunds).values({
                returnId: data.returnId,
                refundNumber: `REF-${Date.now()}`,
                amount: amount.toFixed(2),
                refundMethod: data.refundMethod || 'manual',
                status: 'processed',
                processedAt: new Date(),
                notes: data.notes || null,
            }).returning();
            await tx.update(returns).set({ status: 'completed', refundAmount: amount.toFixed(2), completedAt: new Date(), updatedAt: new Date() }).where(eq(returns.id, data.returnId));
            if (ret.order) {
                await tx.update(orders).set({ paymentStatus: 'refunded', updatedAt: new Date() }).where(eq(orders.id, ret.order.id));
                await tx.update(payments).set({ status: 'refunded', updatedAt: new Date() }).where(eq(payments.orderId, ret.order.id));
            }
            return refund;
        });
    }, ['/admin/orders', '/admin/returns', '/admin/payments']);
}


export async function getAdminOrderById(orderId: number): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                items: { with: { variant: { with: { product: true } } } },
                payment: true,
                shipments: true,
            },
        });
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        return order;
    }, [`/admin/orders/${orderId}`]);
}

export async function updateAdminPaymentStatus(orderId: number, status: 'pending' | 'paid' | 'failed' | 'refunded', failureReason?: string): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const admin = await requireAdminUser();
        if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) throw new AppError('Invalid payment status', 400, 'VALIDATION_ERROR');
        const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        await db.transaction(async (tx) => {
            await tx.update(orders).set({ paymentStatus: status, updatedAt: new Date() }).where(eq(orders.id, orderId));
            await tx.update(payments).set({ status, failureReason: failureReason || null, paidAt: status === 'paid' ? new Date() : null, updatedAt: new Date() }).where(eq(payments.orderId, orderId));
            await tx.insert(auditLogs).values({ userId: admin.id, userEmail: admin.email, action: 'update_payment_status', entity: 'order', entityId: orderId, newValues: { status, failureReason: failureReason || null } });
        });
        return { message: `Payment status updated to ${status}` };
    }, [`/admin/orders/${orderId}`, '/admin/payments']);
}


export async function getAdminPayments(): Promise<ApiResponse<any[]>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        return db.query.payments.findMany({
            with: { order: true },
            orderBy: desc(payments.createdAt),
            limit: 200,
        });
    }, ['/admin/payments']);
}


export async function getAdminPaymentById(paymentId: number): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const payment = await db.query.payments.findFirst({
            where: eq(payments.id, paymentId),
            with: { order: true, webhooks: { orderBy: desc(paymentWebhooks.receivedAt), limit: 100 } },
        });
        if (!payment) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
        return payment;
    }, [`/admin/payments/${paymentId}`]);
}

export async function getAdminAuditLogs(): Promise<ApiResponse<any[]>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        return db.query.auditLogs.findMany({ orderBy: desc(auditLogs.createdAt), limit: 300 });
    }, ['/admin/logs']);
}


export async function getAdminCustomerById(userId: number): Promise<ApiResponse<any>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: { profile: true, addresses: true, orders: { orderBy: desc(orders.createdAt) }, sessions: true, auditLogs: { orderBy: desc(auditLogs.createdAt), limit: 50 } },
        });
        if (!user) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
        const [cart, wishlist, paymentRows, customerEnquiries] = await Promise.all([
            db.query.carts.findFirst({
                where: eq(carts.userId, userId),
                with: { items: { with: { variant: { with: { product: true } } } } },
            }),
            db.query.wishlists.findFirst({
                where: and(eq(wishlists.userId, userId), eq(wishlists.isDefault, true)),
                with: { items: { with: { product: true } } },
            }),
            db.select({ payment: payments, order: orders }).from(payments).innerJoin(orders, eq(orders.id, payments.orderId)).where(eq(orders.userId, userId)).orderBy(desc(payments.createdAt)).limit(100),
            db.query.enquiries.findMany({ where: eq(enquiries.userId, userId), orderBy: desc(enquiries.createdAt), limit: 100 }),
        ]);
        return {
            ...user,
            cart: cart || null,
            wishlist: wishlist || null,
            payments: paymentRows.map(({ payment, order }) => ({ ...payment, order: { orderNumber: order.orderNumber } })),
            enquiries: customerEnquiries,
        };
    }, [`/admin/customers/${userId}`]);
}

export async function updateAdminCustomerStatus(userId: number, status: 'active' | 'blocked'): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const admin = await requireAdminUser();
        const [user] = await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId)).returning({ id: users.id, status: users.status });
        if (!user) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
        await db.insert(auditLogs).values({ userId: admin.id, userEmail: admin.email, action: 'update_customer_status', entity: 'user', entityId: userId, newValues: { status } });
        return user;
    }, [`/admin/customers/${userId}`, '/admin/customers']);
}

export async function revokeAllCustomerSessions(userId: number): Promise<ApiResponse> {
    return handleServerAction(async () => {
        const admin = await requireAdminUser();
        await db.update(userSessions).set({ isActive: false, expiresAt: new Date() }).where(eq(userSessions.userId, userId));
        await db.insert(auditLogs).values({ userId: admin.id, userEmail: admin.email, action: 'revoke_customer_sessions', entity: 'user', entityId: userId, newValues: { revokedAt: new Date().toISOString() } });
        return { message: 'All customer sessions revoked' };
    }, [`/admin/customers/${userId}`, '/admin/security']);
}


export async function getAdminIntegrationHealth(): Promise<ApiResponse<Record<string, { provider: string; configured: boolean }>>> {
    return handleServerAction(async () => {
        await requireAdminUser();
        return {
            media: { provider: process.env.MEDIA_PROVIDER || 'cloudinary', configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME) },
            support: { provider: process.env.SUPPORT_PROVIDER || 'chatwoot', configured: Boolean(process.env.SUPPORT_BASE_URL && process.env.SUPPORT_WEBSITE_TOKEN) },
            analytics: { provider: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'posthog' : 'disabled', configured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) },
            notifications: { provider: process.env.NOTIFICATIONS_PROVIDER || 'sendgrid', configured: Boolean(process.env.SENDGRID_API_KEY && (process.env.SENDGRID_FROM_EMAIL || process.env.NOTIFICATIONS_FROM_EMAIL)) },
            payments: { provider: process.env.PAYMENTS_PROVIDER || 'razorpay', configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) },
            auth: { provider: process.env.AUTH_PROVIDER || 'better-auth', configured: Boolean(process.env.BETTER_AUTH_SECRET) },
        };
    }, ['/admin/integrations']);
}
