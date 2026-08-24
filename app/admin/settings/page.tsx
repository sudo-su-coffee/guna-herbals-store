'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/ShopContext';
import { StoreSettings } from '@/lib/types';
import { Icon, type IconName } from '@/components/Icon';

type SettingsTab = 'storefront' | 'payments' | 'shipping' | 'integrations' | 'backup';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('storefront');
    const { storeSettings, updateStoreSettings } = useShop();

    const handleSave = (updatedSettings: Partial<StoreSettings>) => {
        // Logic to update settings
        const newSettings = { ...storeSettings, ...updatedSettings };
        updateStoreSettings(newSettings);
        alert('Settings saved successfully!');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'storefront':
                return <StorefrontSettings settings={storeSettings} onSave={handleSave} />;
            case 'payments':
                return <PaymentSettings settings={storeSettings} onSave={handleSave} />;
            case 'shipping':
                return <ShippingSettings settings={storeSettings} onSave={handleSave} />;
            case 'integrations':
                return <IntegrationSettings settings={storeSettings} onSave={handleSave} />;
            case 'backup':
                return <BackupSettings settings={storeSettings} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12 w-full max-w-full">
            <div>
                <h1 className="text-3xl font-bold font-serif text-gray-800">Store Settings</h1>
                <p className="text-gray-500">Configure your store, payments, and shipping.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 font-bold text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
                            Configuration
                        </div>
                        <nav className="flex flex-col p-2 space-y-1">
                            <TabButton id="storefront" label="Store Details" icon="store" active={activeTab === 'storefront'} onClick={() => setActiveTab('storefront')} />
                            <TabButton id="payments" label="Payments" icon="credit-card" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                            <TabButton id="shipping" label="Shipping" icon="truck" active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
                            <TabButton id="integrations" label="Integrations" icon="settings" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                            <TabButton id="backup" label="Backup & Data" icon="scroll" active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, onClick }: { id: string, label: string, icon: IconName, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${active ? 'bg-herbal-800 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <Icon name={icon} size={18} />
        {label}
    </button>
);

const Section = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-slide-up">
        <div className="mb-8 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-bold font-serif text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-200 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-herbal-500 transition-shadow"
        />
    </div>
);

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
        <span className="font-bold text-gray-700 text-sm">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

// --- Sub-components (Simplified for brevity, assuming they accept correct props) ---

const StorefrontSettings = ({ settings, onSave }: any) => {
    const [name, setName] = useState(settings.storeName);
    const [contact, setContact] = useState(settings.supportEmail);

    return (
        <Section title="Store Details" description="Manage your store identity and support contact info.">
            <InputField label="Store Name" value={name} onChange={setName} />
            <InputField label="Support Email" value={contact} onChange={setContact} />
            <div className="pt-4 flex justify-end">
                <button onClick={() => onSave({ storeName: name, supportEmail: contact })} className="bg-herbal-800 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-herbal-900">Save Changes</button>
            </div>
        </Section>
    )
}

const PaymentSettings = ({ settings, onSave }: any) => {
    const [razorpayId, setRazorpayId] = useState(settings.razorpayKeyId);
    return (
        <Section title="Payment Gateways" description="Configure how you accept payments.">
            <InputField label="Razorpay Key ID" value={razorpayId} onChange={setRazorpayId} placeholder="rzp_live_..." />
            <div className="pt-4 flex justify-end">
                <button onClick={() => onSave({ razorpayKeyId: razorpayId })} className="bg-herbal-800 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-herbal-900">Update Keys</button>
            </div>
        </Section>
    )
}

const ShippingSettings = ({ settings, onSave }: any) => {
    const [threshold, setThreshold] = useState(settings.freeShippingThreshold.toString());
    const [fee, setFee] = useState(settings.shippingFee.toString());

    return (
        <Section title="Shipping Rules" description="Set delivery fees and free shipping limits.">
            <div className="grid grid-cols-2 gap-6">
                <InputField label="Standard Shipping Fee (₹)" value={fee} onChange={setFee} />
                <InputField label="Free Shipping Threshold (₹)" value={threshold} onChange={setThreshold} />
            </div>
            <div className="pt-4 flex justify-end">
                <button onClick={() => onSave({ shippingFee: Number(fee), freeShippingThreshold: Number(threshold) })} className="bg-herbal-800 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-herbal-900">Save Rules</button>
            </div>
        </Section>
    )
}

const IntegrationSettings = ({ settings, onSave }: any) => (
    <Section title="Integrations" description="Manage third-party connections.">
        <div className="text-center p-8 text-gray-500">
            Please use the dedicated <a href="/admin/integrations" className="text-herbal-700 font-bold underline">Integrations Page</a> for advanced configuration.
        </div>
    </Section>
);

const BackupSettings = ({ settings }: any) => (
    <Section title="Data Management" description="Download backups and manage system data.">
        <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800">Export All Data</p>
                    <p className="text-xs text-gray-500">Download a JSON backup of products, orders, and customers.</p>
                </div>
                <button className="text-herbal-700 border border-herbal-200 px-4 py-2 rounded font-bold text-sm hover:bg-herbal-50">Download JSON</button>
            </div>
        </div>
    </Section>
);
