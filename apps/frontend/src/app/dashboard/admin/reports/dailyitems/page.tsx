'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useDailyItemSales } from '@/hooks/useAdminDashboard';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DailySalesStats } from '@/components/common/DailySalesStats';
import { DailySalesTable } from '@/components/common/DailySalesTable';

function DailyItemSalesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getLocalDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getLocalDate());
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [sortConfig, setSortConfig] = useState(searchParams.get('sort') || 'revenue-desc');
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const { data: dailyRes, isLoading } = useDailyItemSales(selectedDate);
  const items = dailyRes?.data || [];

  // Sync Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => { setSearchTerm(localSearch); setCurrentPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate);
    params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    params.set('sort', sortConfig);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, currentPage, searchTerm, sortConfig, router]);

  const processedItems = useMemo(() => {
    let result = [...items];
    if (searchTerm) result = result.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const [field, order] = sortConfig.split('-');
    result.sort((a: any, b: any) => {
      if (field === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (field === 'sold') return order === 'asc' ? a.totalSold - b.totalSold : b.totalSold - a.totalSold;
      if (field === 'revenue') return order === 'asc' ? a.totalRevenue - b.totalRevenue : b.totalRevenue - a.totalRevenue;
      return 0;
    });
    return result;
  }, [items, searchTerm, sortConfig]);

  const totalRevenue = useMemo(() => processedItems.reduce((acc, curr) => acc + curr.totalRevenue, 0), [processedItems]);
  const totalQty = useMemo(() => processedItems.reduce((acc, curr) => acc + curr.totalSold, 0), [processedItems]);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: string) => {
    setSortConfig(prev => {
      const [f, o] = prev.split('-');
      return f === field ? `${field}-${o === 'asc' ? 'desc' : 'asc'}` : `${field}-desc`;
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase transition-colors hover:text-slate-800">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800 uppercase italic">Daily Item Sales</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Detail performa produk harian</p>
        </div>
        <div className="relative">
          <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="date" value={selectedDate} 
            onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border-2 border-slate-100 bg-white py-2 pr-4 pl-10 text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-all" 
          />
        </div>
      </div>

      <DailySalesStats totalRevenue={totalRevenue} totalQty={totalQty} selectedDate={selectedDate} />

      <DailySalesTable 
        items={paginatedItems}
        isLoading={isLoading}
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        toggleSort={toggleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalVisible={paginatedItems.length}
        totalProcessed={processedItems.length}
      />
    </div>
  );
}

export default function DailyItemSalesReportPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <DailyItemSalesContent />
    </Suspense>
  );
}