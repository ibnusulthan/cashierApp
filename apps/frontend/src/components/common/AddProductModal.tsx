import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { getCategories } from '@/lib/api/admin';
import { useCategories } from '@/hooks/useAdminDashboard';

export function AddProductModal({
  onClose,
  onRefresh,
}: {
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { data: categories, isLoading: catLoading } = useCategories();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    stock: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // --- VALIDASI SESUAI SPEK ---
    const allowedExtensions = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedExtensions.includes(selectedFile.type)) {
      alert('Hanya file JPG, PNG, atau WEBP yang diperbolehkan!');
      return;
    }

    if (selectedFile.size > maxSize) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Validasi manual sebelum kirim
    if (!formData.categoryId) {
      alert('Silakan pilih kategori terlebih dahulu!');
      return;
    }

    // Sesuai spek: Gunakan FormData untuk upload file
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('categoryId', formData.categoryId);
    if (file) data.append('image', file);

    // DEBUG: Cek isi formData di console sebelum dikirim
    console.log('Data yang dikirim:');
    for (let pair of data.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      await api.post('/products', data);
      toast.success('Produk ditambahkan!');
      onRefresh();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menambahkan produk';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tambah Produk Baru</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* INPUT KATEGORI - WAJIB ADA AGAR TIDAK 400 BAD REQUEST */}
          <div>
            <label className="mb-1 block text-sm font-medium">Kategori</label>
            <select
              required
              className="w-full rounded-lg border bg-white p-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">-- Pilih Kategori --</option>
              {catLoading ? (
                <option disabled>Loading categories...</option>
              ) : (
                Array.isArray(categories) &&
                categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nama Produk
            </label>
            <input
              required
              type="text"
              className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Harga (Rp)
              </label>
              <input
                required
                type="number"
                className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Stok Awal
              </label>
              <input
                required
                type="number"
                className="w-full rounded-lg border p-2"
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Foto Produk (Max 2MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold text-white"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  );
}
