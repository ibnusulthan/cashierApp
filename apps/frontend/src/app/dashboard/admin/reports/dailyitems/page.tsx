'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDailyItemSales } from '@/hooks/useAdminDashboard';
import { formatCurrency } from '@/lib/utils';
import { 
  Calendar, Package, Search, TrendingUp, ArrowLeft, Loader2, 
  ChevronLeft, ChevronRight, ArrowUpDown 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DailyItemSalesReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- SYNC STATE WITH URL ---
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const pageParam = Number(searchParams.get('page')) || 1;
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'revenue-desc';

  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [sortConfig, setSortConfig] = useState(sortParam);

  // 1. Tambahkan state lokal untuk input (instan)
  const [localSearch, setLocalSearch] = useState(searchParam);
  // 2. State searchTerm yang sebenarnya (ter-debounce)
  const [searchTerm, setSearchTerm] = useState(searchParam);

  const { data: dailyRes, isLoading } = useDailyItemSales(selectedDate);
  const items = dailyRes?.data || [];

  // --- LOGIC DEBOUNCE SEARCH ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearch);
      setCurrentPage(1); // Reset ke halaman 1 saat pencarian berubah
    }, 500); // Tunggu 0.5 detik

    return () => clearTimeout(handler);
  }, [localSearch]);

  // Sync localSearch jika URL berubah secara manual atau reset
  useEffect(() => {
    setLocalSearch(searchParam);
  }, [searchParam]);

  // --- UPDATE URL WHEN FILTERS CHANGE ---
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate);
    params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    params.set('sort', sortConfig);
    
    // Gunakan replace agar history browser tidak penuh dengan setiap ketikan
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, currentPage, searchTerm, sortConfig, router]);

  // --- CLIENT SIDE PROCESSING ---
  const processedItems = useMemo(() => {
    let result = [...items]; // Clone agar tidak mutasi data asli

    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const [field, order] = sortConfig.split('-');
    result.sort((a: any, b: any) => {
      if (field === 'name') {
        return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (field === 'sold') {
        return order === 'asc' ? a.totalSold - b.totalSold : b.totalSold - a.totalSold;
      }
      if (field === 'revenue') {
        return order === 'asc' ? a.totalRevenue - b.totalRevenue : b.totalRevenue - a.totalRevenue;
      }
      return 0;
    });

    return result;
  }, [items, searchTerm, sortConfig]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRevenue = processedItems.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalQty = processedItems.reduce((acc, curr) => acc + curr.totalSold, 0);

  const toggleSort = (field: string) => {
    setSortConfig(prev => {
      const [prevField, prevOrder] = prev.split('-');
      if (prevField === field) {
        return `${field}-${prevOrder === 'asc' ? 'desc' : 'asc'}`;
      }
      return `${field}-desc`;
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-widest mb-2">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Daily Item Sales</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Detail performa produk harian</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }} 
              className="pl-10 pr-4 py-2 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none shadow-sm focus:border-blue-500 transition-all" 
            />
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Revenue ({selectedDate})</p>
            <h2 className="text-4xl font-black italic">{formatCurrency(totalRevenue)}</h2>
          </div>
          <TrendingUp size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-white" />
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Items Sold</p>
            <h2 className="text-4xl font-black text-slate-800 italic">{totalQty} <span className="text-sm font-normal text-slate-300 not-italic uppercase tracking-widest">Pcs</span></h2>
          </div>
          <Package size={80} className="absolute -right-4 -bottom-4 text-slate-50 opacity-50" />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={localSearch} // Gunakan localSearch di input
              onChange={(e) => setLocalSearch(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-10 py-5 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Produk <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-10 py-5 text-center cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('sold')}>
                  <div className="flex items-center justify-center gap-2">Terjual <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-10 py-5 text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('revenue')}>
                  <div className="flex items-center justify-end gap-2">Revenue <ArrowUpDown size={12}/></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing Data...</p>
                  </td>
                </tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.productId} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SKU-{item.productId.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-600 border border-slate-200 shadow-inner group-hover:bg-white transition-all">
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
                    <div className="max-w-xs mx-auto space-y-2 opacity-30">
                       <Search size={48} className="mx-auto text-slate-300" />
                       <p className="text-xs font-black uppercase italic tracking-widest text-slate-400">Item tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Showing {paginatedItems.length} of {processedItems.length} items
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center px-6 text-xs font-black text-slate-700 uppercase tracking-widest bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                Page {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}