import { Search, Loader2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DailySalesTableProps {
  items: any[];
  isLoading: boolean;
  localSearch: string;
  setLocalSearch: (val: string) => void;
  toggleSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: any) => void;
  totalVisible: number;
  totalProcessed: number;
}

export function DailySalesTable({
  items, isLoading, localSearch, setLocalSearch, toggleSort,
  currentPage, totalPages, setCurrentPage, totalVisible, totalProcessed
}: DailySalesTableProps) {
  return (
    <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-sm">
      {/* Search Header */}
      <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30 p-8 md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 pr-4 pl-12 text-sm font-bold outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-slate-50/50 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            <tr>
              <th className="cursor-pointer px-10 py-5 hover:text-blue-600 transition-colors" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-2">Produk <ArrowUpDown size={12} /></div>
              </th>
              <th className="cursor-pointer px-10 py-5 text-center hover:text-blue-600 transition-colors" onClick={() => toggleSort('sold')}>
                <div className="flex items-center justify-center gap-2">Terjual <ArrowUpDown size={12} /></div>
              </th>
              <th className="cursor-pointer px-10 py-5 text-right hover:text-blue-600 transition-colors" onClick={() => toggleSort('revenue')}>
                <div className="flex items-center justify-end gap-2">Revenue <ArrowUpDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-8 py-24 text-center">
                  <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing Data...</p>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.productId} className="group transition-all hover:bg-blue-50/30">
                  <td className="px-10 py-6">
                    <p className="font-black tracking-tighter text-slate-700 uppercase italic group-hover:text-blue-600 transition-colors">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">SKU-{item.productId.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-black text-slate-600 shadow-inner group-hover:bg-white transition-all">
                      {item.totalSold}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className="font-black text-slate-800 italic">{formatCurrency(item.totalRevenue)}</p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-8 py-24 text-center">
                  <div className="mx-auto max-w-xs space-y-2 opacity-30">
                    <Search size={48} className="mx-auto text-slate-300" />
                    <p className="text-xs font-black tracking-widest text-slate-400 uppercase italic">Item tidak ditemukan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 p-8">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Showing {totalVisible} of {totalProcessed} items
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p: any) => p - 1)} className="rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm hover:bg-slate-50 disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center rounded-2xl border-2 border-slate-100 bg-white px-6 text-xs font-black tracking-widest text-slate-700 uppercase">
              Page {currentPage} / {totalPages}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p: any) => p + 1)} className="rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm hover:bg-slate-50 disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}