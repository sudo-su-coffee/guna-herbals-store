'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Product, ProductCategory } from '@/lib/types';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await getAllProducts();
            setProducts(response.success && response.data ? response.data : []);
        } catch (err) {
            console.error("Load products error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.id.toString().includes(q) ||
                (p.sku && p.sku.toLowerCase().includes(q))
            );
        }
        return filtered;
    }, [products, searchQuery]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

    const handleEdit = (product: any) => {
        setEditingProduct({ ...product });
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingProduct({
            name: '',
            description: '',
            price: 0,
            categoryId: 1, // Default category
            variants: [{ sku: '', price: '0', weight: null, stock: 0 }],
            images: [],
        });
    };

    const handleSave = async (productData: any) => {
        try {
            if (isAddingNew) {
                await addProduct(productData);
            } else {
                await updateProduct(productData.id, productData);
            }
            toast.success("Saved Successfully");
            await loadProducts();
            setEditingProduct(null);
            setIsAddingNew(false);
        } catch (err) {
            toast.error("Save Failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            await loadProducts();
        }
    }

    const exportToCsv = () => {
        if (products.length === 0) return;
        const header = "ID,Name,Category,Price,Stock,SKU";
        const rows = products.map(p =>
            `${p.id},"${p.name}",${p.category},${p.price},${p.stock || 0},${p.sku || ''}`
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns: Column<any>[] = [
        {
            header: "Product",
            accessor: (p) => {
                const imageUrl = p.images?.[0]?.imageUrl || p.image || '/placeholder.jpg';
                return (
                    <div className="flex items-center gap-3 md:gap-4 min-w-[200px]">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs md:text-sm">{p.name}</p>
                            <p className="text-[9px] md:text-[10px] text-gray-400 font-mono uppercase">#{p.id}</p>
                        </div>
                    </div>
                );
            },
            sortKey: 'name'
        },
        {
            header: "Category",
            accessor: (p) => <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{p.category?.name || 'Veda'}</span>,
            className: "hidden md:table-cell",
            sortKey: 'categoryId'
        },
        {
            header: "Price",
            accessor: (p) => {
                const variant = p.variants?.[0];
                return <span className="font-bold text-gray-900">₹{parseFloat(variant?.price || '0')}</span>;
            },
            sortable: false
        },
        {
            header: "Stock",
            accessor: (p) => {
                const variant = p.variants?.[0];
                const stock = variant?.stock || 0;
                const isLow = stock < 10;
                const isMedium = stock >= 10 && stock < 20;
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : isMedium ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className={`text-[10px] md:text-xs font-bold ${isLow ? 'text-red-600' : isMedium ? 'text-yellow-700' : 'text-green-700'}`}>
                            {stock} Units {isLow && '(Low)'}
                        </span>
                    </div>
                );
            },
            sortable: false
        }
    ];

    if (loading) return <div className="p-12 text-center font-serif text-lg">Loading Products...</div>;

    if (editingProduct) {
        return <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setEditingProduct(null)} isNew={isAddingNew} />;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12 w-full max-w-full">
            <AdminPageHeader
                title="Inventory"
                description="Manage catalog, pricing, and stock levels."
                primaryAction={{ label: "Add Product", onClick: handleAddNew, icon: <span>+</span> }}
                secondaryAction={{ label: "Export CSV", onClick: exportToCsv, icon: <span>⬇</span> }}
            />

            <AdminTable
                data={products}
                columns={columns}
                keyField="id"
                searchKeys={['name', 'id']}
                actions={(p) => (
                    <>
                        <button onClick={() => handleEdit(p)} className="text-herbal-700 hover:bg-herbal-50 px-2 py-1 rounded text-xs font-bold transition-colors mr-2">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 px-2 py-1 rounded text-xs font-bold transition-colors">Delete</button>
                    </>
                )}
            />
        </div>
    );
};

const ProductForm: React.FC<{ product: any, onSave: (p: any) => void, onCancel: () => void, isNew?: boolean }> = ({ product, onSave, onCancel, isNew }) => {
    const [formState, setFormState] = useState(product);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'stock' || name === 'sku') {
            const newVariants = [...(formState.variants || [])];
            if (newVariants.length === 0) newVariants.push({ price: '0', stock: 0, sku: '' });
            if (name === 'price') newVariants[0].price = value;
            if (name === 'stock') newVariants[0].stock = Number(value);
            if (name === 'sku') newVariants[0].sku = value;
            setFormState((prev: any) => ({ ...prev, variants: newVariants }));
        } else {
            setFormState((prev: any) => ({ ...prev, [name]: value }));
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // In a real app, upload to S3/Cloudinary. Here we'll just mock it.
            const fakeUrl = URL.createObjectURL(e.target.files[0]);
            setFormState((prev: any) => ({
                ...prev,
                images: [...(prev.images || []), { imageUrl: fakeUrl, isPrimary: prev.images?.length === 0 }]
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    }

    const firstVariant = formState.variants?.[0] || { price: '0', stock: 0, sku: '' };
    const primaryImage = formState.images?.find((img: any) => img.isPrimary)?.imageUrl || formState.image || '';

    const InputWrapper: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up pb-12 w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-2xl font-bold font-serif text-herbal-900">{!isNew ? `Edit ${formState.name}` : 'New Product Entry'}</h2>
                    <p className="text-sm text-gray-500">Fill in the details below to update your catalog.</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="bg-herbal-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-herbal-900">Save Changes</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputWrapper label="Product Name">
                            <input name="name" value={formState.name} onChange={handleChange} placeholder="e.g. Saffron Soap" className="p-3 border border-gray-200 rounded-lg w-full bg-white text-black focus:ring-2 focus:ring-herbal-500 outline-none" required />
                        </InputWrapper>
                        <InputWrapper label="Category (ID)">
                            <input name="categoryId" type="number" value={formState.categoryId} onChange={handleChange} className="p-3 border border-gray-200 rounded-lg w-full bg-white text-black" required />
                        </InputWrapper>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <InputWrapper label="Price (₹)">
                            <input name="price" type="text" value={firstVariant.price} onChange={handleChange} className="p-3 border border-gray-200 rounded-lg w-full bg-white text-black font-bold" required />
                        </InputWrapper>
                    </div>

                    <div className="bg-herbal-50/50 p-6 rounded-lg border border-herbal-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputWrapper label="SKU (Stock Keeping Unit)">
                            <input name="sku" value={firstVariant.sku} onChange={handleChange} placeholder="GUNA-001" className="p-3 border border-gray-200 rounded-lg w-full bg-white text-black font-mono text-sm" />
                        </InputWrapper>
                        <InputWrapper label="Stock Quantity">
                            <input name="stock" type="number" value={firstVariant.stock} onChange={handleChange} className="p-3 border border-gray-200 rounded-lg w-full bg-white text-black font-bold" />
                        </InputWrapper>
                    </div>

                    <InputWrapper label="Description">
                        <textarea name="description" value={formState.description || ''} onChange={handleChange} placeholder="Brief summary of the product..." className="p-3 border border-gray-200 rounded-lg w-full h-24 bg-white text-black resize-none"></textarea>
                    </InputWrapper>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                        <h3 className="font-bold text-gray-800 font-serif">Product Image</h3>
                        <div className="relative group aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-herbal-500 transition-colors" onClick={() => fileInputRef.current?.click()}>
                            {primaryImage ? (
                                <img src={primaryImage} alt="Product" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <span className="text-3xl block mb-2">+</span>
                                    <span className="text-xs font-bold uppercase">Upload</span>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </div>
            </div>
        </form>
    );
};
