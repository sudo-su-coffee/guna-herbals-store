'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItem as apiUpdateCartItem, getCurrentUser, clearCart as apiClearCart } from '@/lib/api';
import { ProductWithDetails, Product } from '@/lib/types';

// Define the shape of a cart item for the UI
// We act mainly as a wrapper around the API data, but with local optimistic updates
export interface CartItem {
    id: number; // For local items, this might be a temp ID or we verify with API
    productId: number;
    variantId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    maxStock: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: ProductWithDetails, quantity?: number, variantId?: number) => Promise<void>;
    removeItem: (cartItemId: number) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    itemCount: number;
    cartTotal: number;
    isLoading: boolean;
    openCart: () => void;
    closeCart: () => void;
    isCartOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Initial Load
    useEffect(() => {
        const initializeCart = async () => {
            setIsLoading(true);
            try {
                // Check if user is logged in
                const userRes = await getCurrentUser();
                if (userRes.success && userRes.data) {
                    setIsLoggedIn(true);
                    // Fetch API Cart
                    const cartRes = await getCart();
                    if (cartRes.success && cartRes.data) {
                        setItems(apiCartToUiCart(cartRes.data));
                    }
                } else {
                    // Guest: Load from LocalStorage
                    const storedCart = localStorage.getItem('guest_cart');
                    if (storedCart) {
                        setItems(JSON.parse(storedCart));
                    }
                }
            } catch (error) {
                console.error("Cart Init Error", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCart();
    }, []);

    // Persist to LocalStorage for guests whenever items change
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            localStorage.setItem('guest_cart', JSON.stringify(items));
        }
    }, [items, isLoggedIn, isLoading]);

    const addItem = useCallback(async (product: ProductWithDetails, quantity = 1, variantId?: number) => {
        const selectedVariant = variantId
            ? product.variants?.find(v => v.id === variantId)
            : product.variants?.[0];

        if (!selectedVariant) {
            toast.error("Product variant not available");
            return;
        }

        const price = selectedVariant.price ? parseFloat(selectedVariant.price.toString()) : 0;
        const image = product.images?.find(img => img.isPrimary)?.imageUrl || '/placeholder.jpg';

        // Optimistic Update
        const tempId = Date.now();
        const newItem: CartItem = {
            id: tempId, // Temporary ID, will be replaced by API if logged in
            productId: typeof product.id === 'number' ? product.id : parseInt(product.id as string),
            variantId: selectedVariant.id,
            name: product.product.name,
            price: price,
            quantity: quantity,
            image: image,
            category: product.category?.name || 'Veda',
            maxStock: selectedVariant.stockQty || 100
        };

        if (isLoggedIn) {
            // API Call
            try {
                const res = await apiAddToCart(selectedVariant.id, quantity, 1); // 1 is default warehouse
                if (res.success) {
                    toast.success(`Added ${product.product.name} to cart`);
                    // Refresh cart to get real IDs
                    const cartRes = await getCart();
                    if (cartRes.success) setItems(apiCartToUiCart(cartRes.data));
                } else {
                    toast.error(res.error || "Failed to add to cart");
                }
            } catch (e) {
                toast.error("Network error adding to cart");
            }
        } else {
            // Local State Logic
            setItems(prev => {
                const existing = prev.find(i => i.variantId === selectedVariant.id);
                if (existing) {
                    toast.success(`Updated quantity for ${product.product.name}`);
                    return prev.map(i => i.variantId === selectedVariant.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                    );
                }
                toast.success(`Added ${product.product.name} to cart`);
                return [...prev, newItem];
            });
        }

        setIsCartOpen(true); // Open drawer on add
    }, [isLoggedIn]);

    const removeItem = useCallback(async (cartItemId: number) => {
        if (isLoggedIn) {
            try {
                const res = await apiRemoveFromCart(cartItemId);
                if (res.success) {
                    setItems(prev => prev.filter(i => i.id !== cartItemId));
                    toast.success("Item removed");
                } else {
                    toast.error("Failed to remove item");
                }
            } catch (e) {
                toast.error("Network error");
            }
        } else {
            setItems(prev => prev.filter(i => i.id !== cartItemId));
            toast.success("Item removed");
        }
    }, [isLoggedIn]);

    const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
        if (quantity < 1) return;

        if (isLoggedIn) {
            try {
                const res = await apiUpdateCartItem(cartItemId, quantity);
                if (res.success) {
                    // Update local state to reflect change immediately or refetch?
                    // Refetch is safer for totals but slower. Let's update local first.
                    setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
                } else {
                    toast.error("Failed to update quantity");
                }
            } catch (e) {
                toast.error("Network error");
            }
        } else {
            setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
        }
    }, [isLoggedIn]);

    const clearCart = useCallback(async () => {
        if (isLoggedIn) {
            await apiClearCart();
        }
        setItems([]);
        localStorage.removeItem('guest_cart');
    }, [isLoggedIn]);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            itemCount,
            cartTotal,
            isLoading,
            openCart: () => setIsCartOpen(true),
            closeCart: () => setIsCartOpen(false),
            isCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

// Helper to transform API cart response to UI model
function apiCartToUiCart(apiItems: any[]): CartItem[] {
    return apiItems.map(item => {
        const variant = item.variant;
        const product = variant?.product || item.product;
        const image = product?.images?.find((img: any) => img.isPrimary)?.imageUrl || '/placeholder.jpg';
        const price = item.priceAtTime ? parseFloat(item.priceAtTime.toString()) : (variant?.price ? parseFloat(variant.price.toString()) : 0);

        return {
            id: item.id,
            productId: product.id,
            variantId: variant?.id,
            name: product.name,
            price: price,
            quantity: item.quantity,
            image: image,
            category: product.category?.name || 'Veda',
            maxStock: variant?.stockQty || 100
        };
    });
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
