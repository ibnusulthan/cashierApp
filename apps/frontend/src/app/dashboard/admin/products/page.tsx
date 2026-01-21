'use client';

import { useState, useRef, useEffect } from 'react';
import { useProducts, useCategories } from '@/hooks/useAdminDashboard.ts';
import { Plus, Minus, Trash2, Edit, Search, RotateCcw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AddProductModal } from '@/components/common/Modal';
import { EditProductModal } from '@/components/common/EditProductModal';
import { Products } from '@/types/interface';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // URL States
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // 1. LOCAL STATE UNTUK SEARCH (Agar mengetik terasa instan)
  const [localSearch, setLocalSearch] = useState(currentSearch);

  const queryParams = {
    page: currentPage,
    search: currentSearch,
    category: currentCategory,
    sort: currentSort,
    limit: 10
  };

  const { data, isLoading, isFetching, refetch } = useProducts(queryParams);
  const products = data?.data || [];
  const meta = data?.meta;

  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // 2. DEBOUNCE SEARCH LOGIC
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentSearch) {
        updateFilters({ search: localSearch || null });
      }
    }, 500); // Tunggu 0.5 detik setelah berhenti mengetik
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Sync local search jika URL di-reset (tombol reset)
  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.page) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    const validatedStock = Math.max(0, newStock);

    // Optimistic Update
    queryClient.setQueryData(['products', queryParams], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((p: Products) => p.id === id ? { ...p, stock: validatedStock } : p)
      };
    });

    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        await api.patch(`/products/${id}`, { stock: validatedStock });
      } catch (error) {
        toast.error('Gagal update stok');
        refetch();
      }
    }, 500);
  };

  // UI Loading awal saja (saat data benar-benar kosong)
  if (isLoading && !data) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      <p className="text-slate-500 font-medium">Memuat data produk...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Stock Management</h1>
          <p className="text-sm text-slate-500">Total {meta?.total || 0} produk tersedia</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 font-semibold"
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Cari produk..."
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-2.5 animate-spin text-blue-400" size={16} />
          )}
        </div>
        
        <select 
          className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          value={currentCategory}
          onChange={(e) => updateFilters({ category: e.target.value })}
        >
          <option value="">Semua Kategori</option>
          {categories?.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          value={currentSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
        >
          <option value="newest">Terbaru</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
        </select>

        <button 
          onClick={() => router.push(pathname, { scroll: false })}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} /> Reset Filter
        </button>
      </div>

      {/* TABLE */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-600 font-semibold text-left">
                <th className="px-6 py-4">Info Produk</th>
                <th className="px-6 py-4 text-center">Update Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length > 0 ? products.map((product: Products) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl || '/placeholder.png'} className="h-12 w-12 object-cover rounded-xl border border-slate-100" />
                      <div>
                        <h4 className="font-bold text-slate-700">{product.name}</h4>
                        <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-md mt-1">
                          Rp {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200 shadow-inner">
                      <button onClick={() => handleUpdateStock(product.id, product.stock - 1)} className="p-1.5 bg-white rounded-xl shadow-sm hover:text-red-500 active:scale-90 transition-all">
                        <Minus size={16}/>
                      </button>
                      <input 
                        type="number"
                        className="w-16 bg-transparent text-center font-black text-slate-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                      />
                      <button onClick={() => handleUpdateStock(product.id, product.stock + 1)} className="p-1.5 bg-white rounded-xl shadow-sm hover:text-green-500 active:scale-90 transition-all">
                        <Plus size={16}/>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit size={18}/>
                      </button>
                      <button 
                        onClick={() => { if(confirm("Hapus produk?")) api.delete(`/products/${product.id}`).then(() => refetch()); }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-medium">
                    Tidak ada produk yang sesuai dengan kriteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Hal. {meta?.page} / {meta?.totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || isFetching}
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
              className="p-2 border bg-white border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {[...Array(meta?.totalPages || 0)].map((_, i) => (
                <button
                  key={i}
                  disabled={isFetching}
                  onClick={() => updateFilters({ page: String(i + 1) })}
                  className={`w-9 h-9 text-xs font-bold rounded-lg transition-all ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= (meta?.totalPages || 1) || isFetching}
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
              className="p-2 border bg-white border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <AddProductModal onClose={() => setIsModalOpen(false)} onRefresh={refetch} />}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onRefresh={refetch} />
      )}
    </div>
  );
}