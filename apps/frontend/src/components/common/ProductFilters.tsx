import { Search, Loader2, RotateCcw } from 'lucide-react';

interface ProductFiltersProps {
  localSearch: string;
  setLocalSearch: (val: string) => void;
  currentCategory: string;
  categories: any[];
  currentSort: string;
  updateFilters: (updates: any) => void;
  isFetching: boolean;
  onReset: () => void;
}

export function ProductFilters({
  localSearch, setLocalSearch, currentCategory, categories,
  currentSort, updateFilters, isFetching, onReset
}: ProductFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-slate-300" size={18} />
        <input 
          type="text" placeholder="Cari produk..."
          className="w-full pl-10 pr-10 py-2 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {isFetching && <Loader2 className="absolute right-3 top-2.5 animate-spin text-blue-400" size={16} />}
      </div>
      
      <select 
        className="bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer appearance-none"
        value={currentCategory}
        onChange={(e) => updateFilters({ category: e.target.value })}
      >
        <option value="">Semua Kategori</option>
        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select 
        className="bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer appearance-none"
        value={currentSort}
        onChange={(e) => updateFilters({ sort: e.target.value })}
      >
        <option value="newest">Terbaru</option>
        <option value="price_asc">Harga Terendah</option>
        <option value="price_desc">Harga Tertinggi</option>
      </select>

      <button onClick={onReset} className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">
        <RotateCcw size={16} /> Reset Filter
      </button>
    </div>
  );
}