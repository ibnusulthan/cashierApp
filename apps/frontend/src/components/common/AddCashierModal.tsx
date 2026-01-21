'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export function AddCashierModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'CASHIER' // Default sesuai kebutuhan
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/users', formData);
      toast.success('Akun kasir berhasil dibuat!');
      
      // Memberitahu TanStack Query bahwa data user sudah basi, tolong ambil yang baru
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
      // Handle error duplikat username atau validasi zod
      toast.error(errorData?.message || 'Gagal membuat akun');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Tambah Kasir Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nama Lengkap</label>
            <input
              required
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama kasir..."
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Username</label>
            <input
              required
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username untuk login..."
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Password</label>
            <input
              required
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 6 karakter..."
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Buat Akun Kasir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}