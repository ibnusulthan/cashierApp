'use client';

import { useState, useEffect } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useAdminDashboard';
import { Plus, Trash2, Loader2, Tag, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newCategory, setNewCategory] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim().length < 2) return toast.error("Minimal 2 karakter");
    try {
      await createMutation.mutateAsync(newCategory);
      setNewCategory('');
      toast.success("Kategori ditambahkan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menambah kategori");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Kategori dihapus");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Kelola Kategori</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Form Input */}
          <form onSubmit={handleCreate} className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah Kategori Baru</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nama kategori..."
                className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white px-5 rounded-2xl font-black hover:bg-blue-700 disabled:bg-slate-200 transition-all"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </form>

          {/* List Kategori */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Kategori Aktif</label>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : categories?.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm italic font-medium">Belum ada kategori.</p>
              ) : (
                categories?.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <span className="font-bold text-slate-700 uppercase text-xs tracking-tight">{cat.name}</span>
                    <button 
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 font-bold leading-tight">
              Kategori yang masih digunakan oleh produk tidak dapat dihapus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}