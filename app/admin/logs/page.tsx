'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/ShopContext';

type LogTab = 'system' | 'security';

export default function LogsPage() {
    const { logs, loginAttempts, clearLoginAttempts } = useShop();
    const [activeTab, setActiveTab] = useState<LogTab>('system');
    const [searchTerm, setSearchTerm] = useState('');

    const exportLogs = () => {
        const data = activeTab === 'system' ? logs : loginAttempts;
        if (data.length === 0) return alert('No logs to export.');

        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
        const csvContent = [header, ...rows].join('\n');

        const element = document.createElement("a");
        const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        element.href = URL.createObjectURL(file);
        element.download = `${activeTab}_logs_export.csv`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Activity Logs</h1>
                    <p className="text-gray-500">Comprehensive audit trail for system events and security access.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportLogs}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-herbal-800 border border-herbal-200 rounded-lg hover:bg-herbal-50 transition-colors bg-white shadow-sm"
                    >
                        Export CSV
                    </button>
                    {activeTab === 'security' && (
                        <button
                            onClick={clearLoginAttempts}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors bg-white shadow-sm"
                        >
                            Clear Logs
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => { setActiveTab('system'); setSearchTerm(''); }}
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'system' ? 'border-herbal-800 text-herbal-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    System Events
                </button>
                <button
                    onClick={() => { setActiveTab('security'); setSearchTerm(''); }}
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-herbal-800 text-herbal-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Login & Security
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px] w-full">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <div className="relative flex-grow max-w-sm">
                        <input
                            type="text"
                            placeholder={activeTab === 'system' ? "Search actions, details..." : "Search mobile number, status..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-herbal-500 bg-white shadow-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    {activeTab === 'system' ? (
                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 md:px-6 md:py-4 w-48">Timestamp</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 w-32 hidden md:table-cell">User</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 w-48">Action</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.filter(l => l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase())).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-500 font-mono text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 font-bold text-gray-700 hidden md:table-cell">{log.user}</td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <span className="bg-gray-100 text-gray-600 font-mono text-xs font-bold px-2 py-1 rounded border border-gray-200">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-800">{log.details}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No system logs available.</td></tr>}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 md:px-6 md:py-4 w-48">Timestamp</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Mobile Number</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loginAttempts.filter(a => a.mobile.includes(searchTerm) || a.status.toLowerCase().includes(searchTerm.toLowerCase())).map(attempt => (
                                    <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                                            {new Date(attempt.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 font-bold text-gray-800 font-mono">
                                            {attempt.mobile}
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${attempt.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                attempt.status === 'OTP Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {attempt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-400 font-mono text-xs hidden md:table-cell">
                                            {attempt.ip || '192.168.1.1'}
                                        </td>
                                    </tr>
                                ))}
                                {loginAttempts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No login attempts recorded.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
