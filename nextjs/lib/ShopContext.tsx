'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type SessionRecord = { id: number; isActive?: boolean; deviceType?: string; os?: string; browser?: string; ip?: string; location?: string; startTime?: string | Date; lastActive?: string | Date };
type LoginRecord = { id: number; timestamp: string | Date; success?: boolean; status?: string; ip?: string };
type CustomerRecord = { id: number; email?: string | null; phone?: string | null; sessions?: SessionRecord[]; loginHistory?: LoginRecord[]; addresses: any[]; name: string; status: string; riskScore: number; totalSpend: number; totalOrders: number; registeredAt: string | Date; [key: string]: any };
type ShopState = { customers: CustomerRecord[]; orders: any[]; loginAttempts: any[]; logs: any[]; storeSettings: Record<string, any>; banUser: (...args: any[]) => Promise<void>; unbanUser: (...args: any[]) => Promise<void>; forceLogoutUser: (...args: any[]) => Promise<void>; terminateSession: (...args: any[]) => Promise<void>; linkShipmentToOrder: (...args: any[]) => Promise<void>; updateStoreSettings: (settings: Record<string, any>) => Promise<void>; clearLoginAttempts: (...args: any[]) => Promise<void>; createOrder: (...args: any[]) => Promise<void>; updateOrderStatus: (...args: any[]) => Promise<void> };

const DEFAULT_STORE_SETTINGS = {
    integrations: {
        smtp: { enabled: false, host: '', port: 587, user: '', pass: '', from: '', templates: { processing: '', shipped: '', delivered: '' } },
        whatsapp: { enabled: false, apiKey: '', phoneNumber: '', templates: { processing: '', shipped: '', outForDelivery: '' } },
        googleAnalyticsId: '',
    },
    freeShippingThreshold: 500,
    shippingFee: 50,
};

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
    const [storeSettings, setStoreSettings] = useState<Record<string, any>>(DEFAULT_STORE_SETTINGS);
    const value = useMemo<ShopState>(() => ({ customers: [], orders: [], loginAttempts: [], logs: [], storeSettings, banUser: async () => undefined, unbanUser: async () => undefined, forceLogoutUser: async () => undefined, terminateSession: async () => undefined, linkShipmentToOrder: async () => undefined, updateStoreSettings: async (settings) => setStoreSettings(settings), clearLoginAttempts: async () => undefined, createOrder: async () => undefined, updateOrderStatus: async () => undefined }), [storeSettings]);
    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
    const context = useContext(ShopContext);
    if (context) return context;
    return { customers: [], orders: [], loginAttempts: [], logs: [], storeSettings: DEFAULT_STORE_SETTINGS, banUser: async () => undefined, unbanUser: async () => undefined, forceLogoutUser: async () => undefined, terminateSession: async () => undefined, linkShipmentToOrder: async () => undefined, updateStoreSettings: async () => undefined, clearLoginAttempts: async () => undefined, createOrder: async () => undefined, updateOrderStatus: async () => undefined };
}
