'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/ShopContext';

export default function SecurityPage() {
    const { logs, customers, banUser } = useShop();
    const [searchTerm, setSearchTerm] = useState('');

    const highRiskUsers = customers.filter(c => c.riskScore > 50 || c.status === 'banned');

    return (
        <div className="space-y-8 animate-fade-in pb-12 w-full max-w-full">
            <div>
                <h1 className="text-3xl font-bold font-serif text-gray-800">Security Center</h1>
                <p className="text-gray-500">Monitor threats, audit logs, and manage user access control.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Threat Monitor */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden w-full">
                    <div className="p-6 border-b border-red-50 bg-red-50/30">
                        <h3 className="font-bold text-red-900 flex items-center gap-2">
                            <span>🛡️</span> High Risk Accounts
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {highRiskUsers.map(user => (
                            <div key={user.id} className="p-4 hover:bg-red-50/10 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.phone}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${user.status === 'banned' ? 'bg-red-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {user.status === 'banned' ? 'Banned' : `Risk: ${user.riskScore}`}
                                    </span>
                                    {user.status !== 'banned' && (
                                        <button onClick={() => { if (confirm('Ban user?')) banUser(user.id) }} className="block mt-2 text-xs text-red-600 hover:underline">Ban Now</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {highRiskUsers.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No high risk users detected.</div>}
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">System Audit Logs</h3>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="text-sm border rounded px-3 py-1 bg-white"
                        />
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Time</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Actor</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Action</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.filter(l => l.details.toLowerCase().includes(searchTerm.toLowerCase())).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-500 font-mono text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 font-bold text-gray-700 hidden md:table-cell">{log.user}</td>
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${log.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                                log.severity === 'warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-gray-600">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
