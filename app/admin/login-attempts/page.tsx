'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/ShopContext';

export default function LoginAttemptsPage() {
    const { loginAttempts, clearLoginAttempts } = useShop();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAttempts = loginAttempts.filter(a =>
        a.mobile.includes(searchTerm) ||
        a.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-800">Security Logs</h1>
                    <p className="text-gray-500">Monitor customer login attempts and access status.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearLoginAttempts}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Clear Logs
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <div className="relative flex-grow max-w-sm">
                        <input
                            type="text"
                            placeholder="Search mobile number or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-herbal-500 bg-white"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        Showing {filteredAttempts.length} of {loginAttempts.length} events
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Mobile Number</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttempts.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                                        {new Date(attempt.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800 font-mono">
                                        {attempt.mobile}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${attempt.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' :
                                            attempt.status === 'OTP Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                attempt.status === 'User Not Found' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${attempt.status === 'Success' ? 'bg-green-500' :
                                                attempt.status === 'OTP Sent' ? 'bg-blue-500' :
                                                    attempt.status === 'User Not Found' ? 'bg-orange-500' :
                                                        'bg-red-500'
                                                }`}></span>
                                            {attempt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        {attempt.ip || '192.168.1.1'}
                                    </td>
                                </tr>
                            ))}
                            {filteredAttempts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-serif bg-gray-50/50">
                                        {searchTerm ? 'No logs match your search.' : 'No login activity recorded yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
