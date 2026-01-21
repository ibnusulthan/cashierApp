'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDailyItemSales } from '@/hooks/useAdminDashboard.ts';
import { formatCurrency } from '@/lib/utils';
import { 
  Calendar, Package, Search, TrendingUp, ArrowLeft, Loader2, 
  FileText, ChevronLeft, ChevronRight, ArrowUpDown 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DailyItemSalesReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- SYNC STATE WITH URL (Agar tidak hilang saat refresh) ---
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const pageParam = Number(searchParams.get('page')) || 1;
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'revenue-desc';

  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [sortConfig, setSortConfig] = useState(sortParam);

  const { data: dailyRes, isLoading } = useDailyItemSales(selectedDate);
  const items = dailyRes?.data || [];

  // --- UPDATE URL WHEN FILTERS CHANGE ---
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate);
    params.set('page', currentPage.toString());
    params.set('search', searchTerm);
    params.set('sort', sortConfig);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, currentPage, searchTerm, sortConfig, router]);

  // --- CLIENT SIDE PROCESSING (Search, Sort, Pagination) ---
  const processedItems = useMemo(() => {
    let result = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm mb-2">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Penjualan Per Item</h1>
          <p className="text-slate-500 text-sm">Detail performa setiap produk per hari.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }} className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Omzet</p>
            <h2 className="text-3xl font-black">{formatCurrency(totalRevenue)}</h2>
          </div>
          <TrendingUp size={40} className="opacity-20" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Terjual</p>
            <h2 className="text-3xl font-black text-slate-800">{totalQty} <span className="text-sm font-normal text-slate-400">Items</span></h2>
          </div>
          <Package size={40} className="text-slate-100" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama produk..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Nama Produk <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-8 py-4 text-center cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('sold')}>
                  <div className="flex items-center justify-center gap-2">Qty Terjual <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-8 py-4 text-right cursor-pointer hover:text-blue-600 transition-colors" onClick={() => toggleSort('revenue')}>
                  <div className="flex items-center justify-end gap-2">Total Pendapatan <ArrowUpDown size={12}/></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={3} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} /><p className="text-sm text-slate-400">Memuat data...</p></td></tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4"><p className="font-bold text-slate-800">{item.name}</p><p className="text-[10px] text-slate-400 font-mono italic">ID: {item.productId.slice(-6)}</p></td>
                    <td className="px-8 py-4 text-center"><span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{item.totalSold}</span></td>
                    <td className="px-8 py-4 text-right"><p className="font-black text-slate-700">{formatCurrency(item.totalRevenue)}</p></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic text-sm">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">Menampilkan {paginatedItems.length} dari {processedItems.length} produk</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={18}/></button>
              <div className="flex items-center px-4 text-sm font-bold text-slate-700">Halaman {currentPage} dari {totalPages}</div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}