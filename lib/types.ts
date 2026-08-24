import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

// ==========================================
// ENUMS & TYPES
// ==========================================

export type ProductCategory = 'Oil' | 'Shampoo' | 'Soap' | 'Skincare' | 'Haircare' | 'Other';
export const ProductCategory = {
    Oil: 'Oil',
    Shampoo: 'Shampoo',
    Soap: 'Soap',
    Skincare: 'Skincare',
    Haircare: 'Haircare',
    Other: 'Other'
} as const;

export type SortOption = 'featured' | 'price-low-high' | 'price-high-low' | 'name-a-z';
export type ViewState = 'grid' | 'list';

// User roles and statuses
export type UserRole = 'admin' | 'staff' | 'customer';
export type UserStatus = 'active' | 'blocked';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod' | 'card' | 'upi';
export type AddressType = 'billing' | 'shipping';
export type StockMovementType = 'in' | 'out' | 'adjustment';
export type InventoryReservationStatus = 'active' | 'released' | 'converted';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'completed';
export type EnquiryStatus = 'pending' | 'read' | 'responded';
export type DiscountType = 'percentage' | 'flat';

// ==========================================
// DATABASE ENTITIES
// ==========================================

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type UserProfile = InferSelectModel<typeof schema.userProfiles>;
export type NewUserProfile = InferInsertModel<typeof schema.userProfiles>;

export type Address = InferSelectModel<typeof schema.addresses>;
export type NewAddress = InferInsertModel<typeof schema.addresses>;

export type Category = InferSelectModel<typeof schema.categories>;
export type NewCategory = InferInsertModel<typeof schema.categories>;

export type Brand = InferSelectModel<typeof schema.brands>;
export type NewBrand = InferInsertModel<typeof schema.brands>;

export type Product = InferSelectModel<typeof schema.products>;
export type NewProduct = InferInsertModel<typeof schema.products>;

export type ProductVariant = InferSelectModel<typeof schema.productVariants>;
export type NewProductVariant = InferInsertModel<typeof schema.productVariants>;

export type ProductImage = InferSelectModel<typeof schema.productImages>;
export type NewProductImage = InferInsertModel<typeof schema.productImages>;

export type Warehouse = InferSelectModel<typeof schema.warehouses>;
export type NewWarehouse = InferInsertModel<typeof schema.warehouses>;

export type Inventory = InferSelectModel<typeof schema.inventory>;
export type NewInventory = InferInsertModel<typeof schema.inventory>;

export type InventoryReservation = InferSelectModel<typeof schema.inventoryReservations>;
export type NewInventoryReservation = InferInsertModel<typeof schema.inventoryReservations>;

export type StockMovement = InferSelectModel<typeof schema.stockMovements>;
export type NewStockMovement = InferInsertModel<typeof schema.stockMovements>;

export type Batch = InferSelectModel<typeof schema.batches>;
export type NewBatch = InferInsertModel<typeof schema.batches>;

export type Discount = InferSelectModel<typeof schema.discounts>;
export type NewDiscount = InferInsertModel<typeof schema.discounts>;

export type Coupon = InferSelectModel<typeof schema.coupons>;
export type NewCoupon = InferInsertModel<typeof schema.coupons>;

export type Cart = InferSelectModel<typeof schema.carts>;
export type NewCart = InferInsertModel<typeof schema.carts>;

export type CartItem = InferSelectModel<typeof schema.cartItems>;
export type NewCartItem = InferInsertModel<typeof schema.cartItems>;

export type Wishlist = InferSelectModel<typeof schema.wishlists>;
export type WishlistItem = InferSelectModel<typeof schema.wishlistItems>;
export type NewWishlist = InferInsertModel<typeof schema.wishlists>;
export type NewWishlistItem = InferInsertModel<typeof schema.wishlistItems>;

export type Order = InferSelectModel<typeof schema.orders>;
export type NewOrder = InferInsertModel<typeof schema.orders>;

export type OrderItem = InferSelectModel<typeof schema.orderItems>;
export type NewOrderItem = InferInsertModel<typeof schema.orderItems>;

export type Payment = InferSelectModel<typeof schema.payments>;
export type NewPayment = InferInsertModel<typeof schema.payments>;

export type PaymentWebhook = InferSelectModel<typeof schema.paymentWebhooks>;
export type NewPaymentWebhook = InferInsertModel<typeof schema.paymentWebhooks>;

export type Shipment = InferSelectModel<typeof schema.shipments>;
export type NewShipment = InferInsertModel<typeof schema.shipments>;

export type Return = InferSelectModel<typeof schema.returns>;
export type NewReturn = InferInsertModel<typeof schema.returns>;

export type Refund = InferSelectModel<typeof schema.refunds>;
export type NewRefund = InferInsertModel<typeof schema.refunds>;

export type Review = InferSelectModel<typeof schema.reviews>;
export type NewReview = InferInsertModel<typeof schema.reviews>;

export type Banner = InferSelectModel<typeof schema.banners>;
export type NewBanner = InferInsertModel<typeof schema.banners>;

export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof schema.auditLogs>;

export type Enquiry = InferSelectModel<typeof schema.enquiries>;
export type NewEnquiry = InferInsertModel<typeof schema.enquiries>;

export type UserSession = InferSelectModel<typeof schema.userSessions>;
export type NewUserSession = InferInsertModel<typeof schema.userSessions>;

// ==========================================
// COMPOSITE / UI TYPES
// ==========================================

export interface ProductWithDetails {
    product: Product;
    brand: Brand | null;
    category: Category | null;
    image?: ProductImage | null;
    variants?: ProductVariant[];
    images?: ProductImage[];
    reviews?: Review[];
    inventory?: Inventory[];
}

export interface UIProduct extends Product {
    price: number;
    imageUrl?: string;
    categoryName?: string;
    brandName?: string;
    stock?: number;
    rating?: number;
    reviewCount?: number;
}

export interface CartItemWithDetails extends CartItem {
    variant: ProductVariant & {
        product: Product & {
            images?: ProductImage[];
        };
    };
    productName: string;
    productSlug: string;
    productImage?: string;
    price: number;
    stockAvailable: number;
}

export interface WishlistItemWithDetails {
    wishlistId: number;
    productId: number;
    product: Product & {
        brand?: Brand | null;
        category?: Category | null;
        images?: ProductImage[];
        variants?: ProductVariant[];
    };
    addedAt?: Date;
}

export interface OrderWithDetails extends Order {
    items: (OrderItem & {
        variant?: ProductVariant & {
            product?: Product;
        };
    })[];
    payment?: Payment | null;
    shipment?: Shipment | null;
    user?: User | SessionUser | null;
    billingAddress: Address | unknown;
    shippingAddress: Address | unknown;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    pendingOrders: number;
    lowStockProducts: number;
    recentOrders: Order[];
    topSellingProducts: Array<{
        product: Product;
        totalSold: number;
        revenue: number;
    }>;
}

export interface AnalyticsData {
    revenueByDate: Array<{ date: string; revenue: number }>;
    ordersByDate: Array<{ date: string; count: number }>;
    topCategories: Array<{ category: Category; count: number; revenue: number }>;
    userRegistrations: Array<{ date: string; count: number }>;
}

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        pages?: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductFilterParams extends PaginationParams {
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    sortOption?: SortOption;
}

export interface OrderFilterParams extends PaginationParams {
    userId?: number;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface UserFilterParams extends PaginationParams {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}

// ==========================================
// FORM TYPES
// ==========================================

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
}

export interface OTPLoginFormData {
    phone: string;
    otp: string;
}

export interface AddressFormData {
    type: AddressType;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
    isDefault?: boolean;
}

export interface CheckoutFormData {
    billingAddress: AddressFormData;
    shippingAddress: AddressFormData;
    paymentMethod: PaymentMethod;
    useShippingAsBilling?: boolean;
    notes?: string;
}

export interface ReviewFormData {
    productId: number;
    rating: number;
    comment: string;
}

export interface EnquiryFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type ApiFunction<T = any, P = any> = (params: P) => Promise<ApiResponse<T>>;
export type ServerAction<T = any, P = any> = (params: P) => Promise<ApiResponse<T>>;

export interface SessionUser {
    id: number;
    name: string | null;
    email: string;
    role: UserRole;
    phone?: string | null;
    profile?: UserProfile | null | any;
}


// Legacy aliases retained for the archived admin screens.
export type Customer = User;
export type Session = UserSession;

export type DelhiveryShipment = Shipment;

export type StoreSettings = Record<string, any>;

export type ShippingDetails = { name: string; phone: string; email: string; address: string; city: string; state: string; zip: string };
export type BlogPost = { id: string; title: string; excerpt: string; image: string; date: string };
export type PolicyType = keyof typeof import('./constants').POLICIES;
