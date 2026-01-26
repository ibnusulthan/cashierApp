'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useAdminDashboard'; 
import { Search, UserPlus, Edit, Trash2, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { EditCashierModal } from '@/components/common/EditCashierModal';
import { AddCashierModal } from '@/components/common/AddCashierModal';

export default function CashierManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State untuk Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State baru untuk Tambah
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [localSearch, setLocalSearch] = useState(currentSearch);

  const { data, isLoading, isFetching, refetch } = useUsers({
    page: currentPage,
    search: currentSearch,
    limit: 10
  });

  const users = data?.data || [];
  const meta = data?.meta;

  // Navigasi Halaman
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (localSearch) params.set('search', localSearch);
        else params.delete('search');
        params.set('page', '1'); // Reset ke hal 1 saat cari
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan kasir ${name}?`)) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Kasir berhasil dinonaktifkan');
        refetch();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal menghapus kasir');
      }
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Kasir</h1>
          <p className="text-slate-500">Daftar akun kasir yang aktif dalam sistem</p>
        </div>
        {/* AKTIFKAN TOMBOL TAMBAH DI SINI */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Tambah Kasir
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari kasir..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <button onClick={() => { setLocalSearch(''); router.push(pathname); }} className="p-2 text-slate-400 hover:text-blue-600">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Table Area */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-opacity ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Dibuat Pada</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? users.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{user.name}</td>
                <td className="px-6 py-4 text-slate-500">{user.username}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">Data kasir tidak ditemukan</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION UI */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t">
            <p className="text-sm text-slate-500">
              Menampilkan hal <span className="font-bold text-slate-700">{meta.page}</span> dari <span className="font-bold text-slate-700">{meta.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCashierModal onClose={() => setIsAddModalOpen(false)} />
      )}
      
      {isEditModalOpen && selectedUser && (
        <EditCashierModal 
          user={selectedUser} 
          onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }} 
        />
      )}
    </div>
  );
}