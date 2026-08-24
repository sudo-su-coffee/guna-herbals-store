'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStat } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTable, Column } from '@/components/admin/AdminTable';

const ITEMS_PER_PAGE = 20;

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAdminStat();
            setCustomers(data.customers || []);
        } catch (err) {
            console.error("Load customers error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        return (customers || []).filter(c =>
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;

    const columns: Column<any>[] = [
        {
            header: "User",
            accessor: (c) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-herbal-100 text-herbal-800 flex items-center justify-center font-bold">
                        {(c.name || c.phone || 'U').charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 truncate">{c.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 truncate">{c.email || c.phone}</p>
                    </div>
                </div>
            ),
            sortKey: 'name'
        },
        {
            header: "Role",
            accessor: (c) => (
                <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${c.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                    {c.role}
                </span>
            ),
            className: "hidden md:table-cell",
            sortKey: 'role'
        },
        {
            header: "Status",
            accessor: (c) => (
                <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${c.status === 'active' || !c.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status || 'active'}
                </span>
            ),
            sortKey: 'status'
        }
    ];

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading Users...</div>;

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-full">
            <AdminPageHeader
                title="User Management"
                description="Manage customers, staff, and security access."
            // primaryAction={{ label: "Add User", onClick: () => {}, icon: <span>+</span> }}
            />

            <AdminTable
                data={customers}
                columns={columns}
                keyField="id"
                searchKeys={['name', 'email', 'phone']}
                actions={(c) => (
                    <button onClick={() => router.push(`/admin/customers/${c.id}`)} className="text-herbal-700 hover:text-herbal-900 font-bold text-xs bg-herbal-50 px-3 py-1 rounded border border-herbal-200">Manage</button>
                )}
            />
        </div>
    );
};
