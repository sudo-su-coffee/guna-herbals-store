import React from 'react';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, description, primaryAction, secondaryAction }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-serif text-herbal-900">{title}</h1>
                {description && <p className="text-gray-500 mt-1 text-sm">{description}</p>}
            </div>
            <div className="flex gap-2">
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="bg-white border border-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2"
                    >
                        {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
                        {secondaryAction.label}
                    </button>
                )}
                {primaryAction && (
                    <button
                        onClick={primaryAction.onClick}
                        className="bg-herbal-800 text-white font-bold px-4 py-2.5 rounded-lg shadow-md hover:bg-herbal-900 transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2"
                    >
                        {primaryAction.icon && <span>{primaryAction.icon}</span>}
                        {primaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
};
