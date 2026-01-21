'use client';

import { useState } from 'react';
import { X, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { UserResponse } from '@/types/user';

interface EditCashierModalProps {
  user: UserResponse;
  onClose: () => void;
}

export function EditCashierModal({ user, onClose }: EditCashierModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk form
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    password: '', // Kosongkan secara default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter data: Hanya kirim password jika diisi
    const updatePayload: any = {
      name: formData.name,
      username: formData.username,
    };
    
    if (formData.password.trim() !== '') {
      if (formData.password.length < 6) {
        toast.error("Password baru minimal 6 karakter");
        setIsSubmitting(false);
        return;
      }
      updatePayload.password = formData.password;
    }

    try {
      await api.patch(`/users/${user.id}`, updatePayload);
      toast.success('Data kasir berhasil diperbarui!');
      
      // Invalidate agar tabel di page utama update
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal memperbarui data';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Edit Profil Kasir</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nama Lengkap</label>
            <input
              required
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Username</label>
            <input
              required
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-amber-600">
              <ShieldAlert size={16} />
              <label className="text-xs font-bold uppercase">Reset Password (Opsional)</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="Isi hanya jika ingin ganti password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 italic">
              *Kosongkan kolom password jika tidak ingin mengubah password kasir.
            </p>
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
              className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}