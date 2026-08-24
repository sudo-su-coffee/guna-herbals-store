'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/ShopContext';
import { StoreSettings } from '../../../lib/types';

export default function IntegrationsPage() {
    const { storeSettings, updateStoreSettings } = useShop();
    const [integrations, setIntegrations] = useState(storeSettings.integrations);

    const handleSave = () => {
        const newSettings: StoreSettings = {
            ...storeSettings,
            integrations: {
                ...storeSettings.integrations,
                ...integrations,
            }
        };
        updateStoreSettings(newSettings);
        alert('Integrations saved!');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-serif text-gray-800">Integrations</h1>
                <p className="text-gray-500">Connect third-party services for notifications and analytics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SmtpSettings integrations={integrations} setIntegrations={setIntegrations} />
                <WhatsappSettings integrations={integrations} setIntegrations={setIntegrations} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <GoogleAnalyticsSettings integrations={integrations} setIntegrations={setIntegrations} />
            </div>

            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="bg-herbal-800 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-herbal-900 transition-all">
                    Save All Changes
                </button>
            </div>
        </div>
    );
};

const SettingsCard: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border h-full">
        <h3 className="text-xl font-bold font-serif text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="space-y-4 border-t pt-6">{children}</div>
    </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, placeholder }: { label: string, name: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => (
    <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 border rounded bg-white text-black" />
    </div>
);

const TextAreaField = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => (
    <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
        <textarea name={name} value={value} onChange={onChange} rows={4} className="w-full p-2 border rounded bg-white text-black text-xs" />
    </div>
);

const SmtpSettings = ({ integrations, setIntegrations }: any) => {
    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setIntegrations((prev: any) => ({ ...prev, smtp: { ...prev.smtp, [name]: type === 'checkbox' ? checked : value } }));
    };
    const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIntegrations((prev: any) => ({ ...prev, smtp: { ...prev.smtp, templates: { ...prev.smtp.templates, [name]: value } } }));
    };

    return (
        <SettingsCard title="📧 SMTP Email" description="Send transactional emails to customers.">
            <label className="flex items-center gap-2"><input type="checkbox" name="enabled" checked={integrations.smtp.enabled} onChange={handleSmtpChange} /> Enable Email Notifications</label>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Host" name="host" value={integrations.smtp.host} onChange={handleSmtpChange} placeholder="smtp.example.com" />
                <InputField label="Port" name="port" type="number" value={integrations.smtp.port} onChange={handleSmtpChange} placeholder="587" />
            </div>
            <InputField label="Username" name="user" value={integrations.smtp.user} onChange={handleSmtpChange} placeholder="your@email.com" />
            <InputField label="Password" name="pass" type="password" value={integrations.smtp.pass} onChange={handleSmtpChange} placeholder="••••••••" />
            <InputField label="From Email" name="from" value={integrations.smtp.from} onChange={handleSmtpChange} placeholder="no-reply@yourstore.com" />

            <h5 className="font-bold pt-4 border-t mt-4">Email Templates</h5>
            <TextAreaField label="Processing" name="processing" value={integrations.smtp.templates.processing} onChange={handleTemplateChange} />
            <TextAreaField label="Shipped" name="shipped" value={integrations.smtp.templates.shipped} onChange={handleTemplateChange} />
            <TextAreaField label="Delivered" name="delivered" value={integrations.smtp.templates.delivered} onChange={handleTemplateChange} />
            <button className="text-sm font-bold text-herbal-700 w-full text-right">Send Test Email</button>
        </SettingsCard>
    );
};

const WhatsappSettings = ({ integrations, setIntegrations }: any) => {
    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setIntegrations((prev: any) => ({ ...prev, whatsapp: { ...prev.whatsapp, [name]: type === 'checkbox' ? checked : value } }));
    };
    const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIntegrations((prev: any) => ({ ...prev, whatsapp: { ...prev.whatsapp, templates: { ...prev.whatsapp.templates, [name]: value } } }));
    };
    return (
        <SettingsCard title="💬 WhatsApp API" description="Send order updates via WhatsApp Business API.">
            <label className="flex items-center gap-2"><input type="checkbox" name="enabled" checked={integrations.whatsapp.enabled} onChange={handleWhatsappChange} /> Enable WhatsApp Notifications</label>
            <InputField label="API Key" name="apiKey" type="password" value={integrations.whatsapp.apiKey} onChange={handleWhatsappChange} placeholder="Enter your WhatsApp API Key" />
            <InputField label="Phone Number ID" name="phoneNumber" value={integrations.whatsapp.phoneNumber} onChange={handleWhatsappChange} placeholder="Enter your WhatsApp Phone Number ID" />

            <h5 className="font-bold pt-4 border-t mt-4">Message Templates</h5>
            <p className="text-xs text-gray-500 mb-2">{`Use placeholders like '{{customer_name}}', '{{order_id}}', '{{tracking_link}}'.`}</p>
            <TextAreaField label="Processing" name="processing" value={integrations.whatsapp.templates.processing} onChange={handleTemplateChange} />
            <TextAreaField label="Shipped" name="shipped" value={integrations.whatsapp.templates.shipped} onChange={handleTemplateChange} />
            <TextAreaField label="Out for Delivery" name="outForDelivery" value={integrations.whatsapp.templates.outForDelivery} onChange={handleTemplateChange} />
        </SettingsCard>
    );
};

const GoogleAnalyticsSettings = ({ integrations, setIntegrations }: any) => {
    return (
        <div>
            <h3 className="text-xl font-bold font-serif text-gray-800">📈 Google Analytics</h3>
            <p className="text-sm text-gray-500 mb-6">Track website traffic and user behavior.</p>
            <div className="border-t pt-6">
                <InputField label="Tracking ID" name="googleAnalyticsId" value={integrations.googleAnalyticsId} onChange={e => setIntegrations((i: any) => ({ ...i, googleAnalyticsId: e.target.value }))} placeholder="e.g., G-XXXXXXXXXX" />
            </div>
        </div>
    );
};
