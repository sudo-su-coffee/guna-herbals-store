'use client';

import React, { useState, useMemo } from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
    sortKey?: keyof T; // If accessor is a function, this is needed for sorting
}

interface AdminTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    searchable?: boolean;
    searchKeys?: (keyof T)[];
    onRowClick?: (item: T) => void;
    itemsPerPage?: number;
    emptyMessage?: string;
    actions?: (item: T) => React.ReactNode;
}

export function AdminTable<T>({
    data,
    columns,
    keyField,
    searchable = true,
    searchKeys = [],
    onRowClick,
    itemsPerPage = 10,
    emptyMessage = "No items found.",
    actions
}: AdminTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    // Filter
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerTerm = searchTerm.toLowerCase();
        return data.filter(item =>
            searchKeys.some(key => {
                const val = item[key];
                return String(val).toLowerCase().includes(lowerTerm);
            })
        );
    }, [data, searchTerm, searchKeys]);

    // Sort
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key!] as any;
            const bVal = b[sortConfig.key!] as any;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;

    const handleSort = (key: keyof T) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {searchable && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-sm">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-herbal-500 bg-gray-50 text-gray-800"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-herbal-50/50 text-herbal-900 uppercase text-[10px] font-bold tracking-widest border-b border-herbal-100">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-4 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-herbal-100 transition-colors ${col.className || ''}`}
                                        onClick={() => (col.sortable || typeof col.accessor === 'string' || col.sortKey) && handleSort((col.sortKey || col.accessor) as keyof T)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            {(col.sortKey || (typeof col.accessor === 'string' && col.sortable !== false)) && (
                                                <span className="text-[8px] opacity-50">
                                                    {sortConfig.key === (col.sortKey || col.accessor) ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="px-4 py-3 md:px-6 md:py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIdx) => (
                                    <tr
                                        key={String(item[keyField])}
                                        onClick={() => onRowClick && onRowClick(item)}
                                        className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-4 py-3 md:px-6 md:py-4 ${col.className || ''}`}>
                                                {typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : (item[col.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-3 md:px-6 md:py-4 text-right" onClick={e => e.stopPropagation()}>
                                                {actions(item)}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                    >
                        ‹
                    </button>
                    <span className="text-xs font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 text-gray-600"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}
