import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductKatalog({ 
  products, categories, searchTerm, setSearchTerm, 
  selectedCategory, setSelectedCategory, addToCart, isLoading 
}: any) {
  return (
    <div className="flex min-h-0 flex-col space-y-3 lg:col-span-2">
      {/* Search & Category - Dibuat lebih rapat */}
      <div className="flex-none space-y-3 px-1"> 
        <div className="relative group">
          <Search 
            className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" 
            size={16} 
          />
          <input
            type="text"
            placeholder="CARI MENU..."
            className="w-full rounded-xl border-none bg-white px-10 py-3 text-xs font-bold uppercase italic shadow-sm outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`rounded-lg px-4 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all ${selectedCategory === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            Semua
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-4 py-1.5 text-[9px] font-black tracking-widest whitespace-nowrap uppercase transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk - Lebih Padat */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 gap-3 pb-10 md:grid-cols-4 xl:grid-cols-5">
          {isLoading ? (
            <div className="col-span-full py-10 flex justify-center">
               <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-300 italic uppercase text-[10px]">Menu tidak ditemukan</div>
          ) : (
            products.map((p: any) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className={`flex h-fit flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white text-left shadow-sm transition-all hover:shadow-md active:scale-95 ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
              >
                {/* Gambar dikecilkan h-24 */}
                <div className="relative flex h-24 w-full items-center justify-center bg-slate-50">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="h-full w-full object-cover" alt={p.name} />
                  ) : (
                    <ImageIcon className="text-slate-200" size={24} />
                  )}
                </div>
                
                {/* Padding dikurangi p-3 */}
                <div className="p-3">
                  <p className="mb-0.5 text-[8px] font-black tracking-widest text-blue-600 uppercase italic truncate">
                    {p.category?.name || 'Menu'}
                  </p>
                  <p className="line-clamp-1 text-[10px] font-black text-slate-800 uppercase italic leading-tight">
                    {p.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-900">
                      {formatCurrency(p.price).replace('Rp', '').trim()}
                    </p>
                    <span className="text-[8px] font-bold text-slate-400 italic">S:{p.stock}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}