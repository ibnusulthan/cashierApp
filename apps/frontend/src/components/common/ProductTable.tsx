import { Plus, Minus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Products } from '@/types/interface';

interface ProductTableProps {
  products: Products[];
  isFetching: boolean;
  meta: any;
  currentPage: number;
  handleUpdateStock: (id: string, newStock: number) => void;
  setEditingProduct: (p: Products) => void;
  onDelete: (p: Products) => void;
  updateFilters: (updates: any) => void;
}

export function ProductTable({
  products, isFetching, meta, currentPage, handleUpdateStock, 
  setEditingProduct, onDelete, updateFilters
}: ProductTableProps) {
  return (
    <div className={`bg-white rounded-[32px] shadow-sm overflow-hidden transition-all ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Info Produk</th>
              <th className="px-8 py-5 text-center">Stok</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id} className="hover:bg-blue-50/30 group transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl || 'https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg'} className="h-14 w-14 object-cover rounded-2xl bg-slate-100" />
                    <div>
                      <h4 className="font-black text-slate-700 uppercase italic tracking-tighter">{product.name}</h4>
                      <p className="text-xs text-blue-600 font-black italic">Rp {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="inline-flex items-center bg-slate-50 p-1 rounded-xl gap-2">
                    <button onClick={() => handleUpdateStock(product.id, product.stock - 1)} className="p-2 bg-white rounded-lg shadow-sm hover:text-red-500 active:scale-90 transition-all"><Minus size={14}/></button>
                    <span className="w-10 text-center font-black text-slate-800">{product.stock}</span>
                    <button onClick={() => handleUpdateStock(product.id, product.stock + 1)} className="p-2 bg-white rounded-lg shadow-sm hover:text-green-500 active:scale-90 transition-all"><Plus size={14}/></button>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                    <button onClick={() => setEditingProduct(product)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => onDelete(product)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">Kosong</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-8 py-5 bg-slate-50/30">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Halaman {meta?.page} dari {meta?.totalPages || 1}</p>
        <div className="flex gap-2">
          <button disabled={currentPage <= 1} onClick={() => updateFilters({ page: String(currentPage - 1) })} className="p-2 bg-white rounded-xl shadow-sm disabled:opacity-30"><ChevronLeft size={18} /></button>
          <button disabled={currentPage >= (meta?.totalPages || 1)} onClick={() => updateFilters({ page: String(currentPage + 1) })} className="p-2 bg-white rounded-xl shadow-sm disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}