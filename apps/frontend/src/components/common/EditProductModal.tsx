"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useCategories } from "@/hooks/useAdminDashboard.ts";
import { Products } from "@/types/interface";

interface EditProductModalProps {
  product: Products;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditProductModal({
  product,
  onClose,
  onRefresh,
}: EditProductModalProps) {
  const { data: categories, isLoading: catLoading } = useCategories();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inisialisasi form dengan data produk yang sudah ada
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    categoryId: product.categoryId,
    stock: product.stock.toString(),
  });

  // Handle perubahan file & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validasi sederhana sisi klien (sesuai spesifikasi)
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar (Maksimal 2MB)");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("categoryId", formData.categoryId);
    
    // Backend mencari field 'image' (single upload)
    if (file) {
      data.append("image", file);
    }

    try {
      // Sesuai route: router.patch("/:id", ...)
      const response = await api.patch(`/products/${product.id}`, data);
      
      toast.success(response.data.message || "Produk berhasil diperbarui!");
      onRefresh();
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
      // Menampilkan pesan error dari Zod atau manual message
      toast.error(errorData?.message || "Gagal memperbarui produk");
      console.error("Update Error:", errorData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Edit Produk</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preview & Upload Gambar */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-200">
            <div className="relative h-24 w-24 mb-3">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  className="h-full w-full object-cover rounded-lg shadow-sm" 
                  alt="Preview" 
                />
              ) : (
                <div className="h-full w-full bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  <Upload size={24} />
                </div>
              )}
            </div>
            <input 
              type="file" 
              id="edit-file" 
              accept="image/*" 
              hidden 
              onChange={handleFileChange} 
            />
            <label 
              htmlFor="edit-file" 
              className="text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-700"
            >
              Ganti Foto Produk
            </label>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Maks 2MB (JPG/PNG/WEBP)</p>
          </div>

          <div className="space-y-4">
            {/* Kategori */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Kategori</label>
              <select
                required
                className="w-full rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Pilih Kategori</option>
                {Array.isArray(categories) && categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Nama Produk */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nama Produk</label>
              <input
                required
                type="text"
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Harga (Rp)</label>
                <input
                  required
                  type="number"
                  className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Stok</label>
                <input
                  required
                  type="number"
                  className="w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}