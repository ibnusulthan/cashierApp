'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useProducts, useCategories } from '@/hooks/useAdminDashboard';
import { Plus, Tag, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AddProductModal } from '@/components/common/AddProductModal';
import { EditProductModal } from '@/components/common/EditProductModal';
import CategoryManagementModal from '@/components/common/CategoryManagementModal';
import { Products } from '@/types/interface';
import { useQueryClient } from '@tanstack/react-query';
import { ProductFilters } from '@/components/common/ProductFilters';
import { ProductTable } from '@/components/common/ProductTable';

function ProductManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const queryParams = {
    page: currentPage,
    search: currentSearch,
    category: currentCategory,
    sort: currentSort,
    limit: 10,
  };
  const { data, isLoading, isFetching, refetch } = useProducts(queryParams);
  const { data: categories } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentSearch)
        updateFilters({ search: localSearch || null });
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

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
    queryClient.setQueryData(['products', queryParams], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((p: Products) =>
          p.id === id ? { ...p, stock: validatedStock } : p
        ),
      };
    });
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        await api.patch(`/products/${id}`, { stock: validatedStock });
      } catch {
        toast.error('Gagal update stok');
        refetch();
      }
    }, 500);
  };

  if (isLoading && !data)
    return (
      <div className="flex flex-col items-center gap-4 p-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase italic">
            Product Management
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Total {data?.meta?.total || 0} produk tersedia
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Tag size={18} className="text-slate-400" /> Kategori
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus size={18} /> Produk Baru
          </button>
        </div>
      </div>

      <ProductFilters
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        currentCategory={currentCategory}
        categories={categories || []}
        currentSort={currentSort}
        updateFilters={updateFilters}
        isFetching={isFetching}
        onReset={() => router.push(pathname)}
      />

      <ProductTable
        products={data?.data || []}
        isFetching={isFetching}
        meta={data?.meta}
        currentPage={currentPage}
        handleUpdateStock={handleUpdateStock}
        setEditingProduct={setEditingProduct}
        updateFilters={updateFilters}
        onDelete={(p) =>
          confirm(`Hapus ${p.name}?`) &&
          api.delete(`/products/${p.id}`).then(() => refetch())
        }
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      {isModalOpen && (
        <AddProductModal
          onClose={() => setIsModalOpen(false)}
          onRefresh={refetch}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}

export default function ProductManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600" />
        </div>
      }
    >
      <ProductManagementContent />
    </Suspense>
  );
}
