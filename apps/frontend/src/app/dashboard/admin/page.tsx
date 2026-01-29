'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useTransactions,
  useDashboardSummary,
  useDailyItemSales,
} from '@/hooks/useAdminDashboard';
import { TransactionAdmin } from '@/types/transaction';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Receipt, 
  RefreshCcw, 
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATES ---
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || new Date().toLocaleDateString('en-CA'));
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [cashierInput, setCashierInput] = useState(searchParams.get('cashier') || '');
  const [debouncedCashier, setDebouncedCashier] = useState(searchParams.get('cashier') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 5;

  // --- DATA FETCHING ---
  const { data: summaryRes, isLoading: summaryLoading } = useDashboardSummary();
  const { data: dailyRes, isLoading: dailyLoading } = useDailyItemSales(filterDate);
  const { data: txData, isLoading: txLoading } = useTransactions();
  
  const summary = summaryRes?.data;
  const topItems = dailyRes?.data || [];
  const transactions: TransactionAdmin[] = txData?.transactions ?? [];

  // --- LOGIC: HELPER TIMEZONE ---
  const getLocalDateString = (dateInput: string | Date) => {
    return new Date(dateInput).toLocaleDateString('en-CA'); // Hasil: YYYY-MM-DD (Local Time)
  };

  // --- LOGIC: DEBOUNCE CASHIER ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCashier(cashierInput), 500);
    return () => clearTimeout(handler);
  }, [cashierInput]);

  // --- LOGIC: SYNC URL ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterDate) params.set('date', filterDate);
    if (debouncedCashier) params.set('cashier', debouncedCashier);
    if (filterStatus) params.set('status', filterStatus);
    if (currentPage !== 1) params.set('page', String(currentPage));
    router.replace(`/dashboard/admin?${params.toString()}`, { scroll: false });
  }, [filterDate, debouncedCashier, filterStatus, currentPage, router]);

  // --- LOGIC: FILTER & PAGINATION ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCashier = t.cashier.name.toLowerCase().includes(debouncedCashier.toLowerCase());
      
      // Menggunakan konversi lokal agar UTC 21:00 (Tgl 29) jadi 04:00 (Tgl 30)
      let matchDate = true;
      if (filterDate) {
        matchDate = getLocalDateString(t.createdAt) === filterDate;
      }

      const matchStatus = filterStatus ? t.status === filterStatus : true;
      return matchCashier && matchDate && matchStatus;
    });
  }, [transactions, debouncedCashier, filterDate, filterStatus]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;

  // --- RENDER LOADING ---
  if (summaryLoading || txLoading) {
    return (
        <div className="flex h-96 flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">Loading Dashboard...</p>
        </div>
    );
  }

  const hasLowStock = (summary?.lowStockProductsCount ?? 0) > 0;

  return (
    <div className="space-y-8 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Admin Dashboard</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pemantauan Transaksi Real-time</p>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 group transition-all hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><TrendingUp size={22}/></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
          </div>
          <p className="text-2xl font-black text-slate-800 italic tracking-tight">Rp {summary?.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Receipt size={22}/></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</p>
          </div>
          <p className="text-2xl font-black text-slate-800 italic tracking-tight">{summary?.totalCompletedTransactions}</p>
        </div>

        <div className={`rounded-[24px] p-6 shadow-sm border transition-all duration-300 ${hasLowStock ? 'bg-red-50 border-red-100 shadow-red-50' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${hasLowStock ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
              <Package size={22}/>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${hasLowStock ? 'text-red-600' : 'text-slate-400'}`}>Low Stock</p>
          </div>
          <p className={`text-2xl font-black italic tracking-tight ${hasLowStock ? 'text-red-700' : 'text-slate-800'}`}>
            {summary?.lowStockProductsCount} <span className="text-xs font-bold not-italic uppercase">Items</span>
          </p>
        </div>

        <div className="rounded-[24px] bg-amber-400 p-6 shadow-xl shadow-amber-100 cursor-pointer hover:bg-amber-500 transition-all group" onClick={() => router.push('/dashboard/admin/reports/shifts')}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl text-amber-900"><AlertTriangle size={22}/></div>
            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Audit Status</p>
          </div>
          <p className="text-lg font-black text-amber-950 italic tracking-tight uppercase leading-tight">Cek Selisih Uang</p>
          <div className="mt-2 flex items-center gap-2 text-amber-800 text-[9px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Audit Detail <ArrowRight size={10}/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TOP SELLING ITEMS */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-800 mb-8">Top Products</h2>
          <div className="space-y-6">
            {topItems.length > 0 ? [...topItems].sort((a,b) => b.totalSold - a.totalSold).slice(0, 5).map((item) => (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-black text-slate-700 uppercase italic tracking-tighter text-sm truncate">{item.name}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.totalSold} Terjual</p>
                </div>
                <p className="font-black text-slate-800 text-sm italic">Rp {item.totalRevenue.toLocaleString()}</p>
              </div>
            )) : <p className="text-center text-[10px] font-black text-slate-300 uppercase py-10">No Data Today</p>}
          </div>
        </div>

        {/* TABLE TRANSAKSI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex flex-wrap gap-3">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="rounded-xl border-none bg-slate-50 p-3 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
            <input type="text" placeholder="Cari kasir..." value={cashierInput} onChange={(e) => { setCashierInput(e.target.value); setCurrentPage(1); }} className="rounded-xl border-none bg-slate-50 p-3 text-xs font-bold flex-1 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
            <button onClick={() => { setFilterDate(new Date().toLocaleDateString('en-CA')); setCashierInput(''); setFilterStatus(''); setCurrentPage(1); }} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition"><RefreshCcw size={18}/></button>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 text-left">Waktu</th>
                  <th className="px-6 py-5 text-left">Kasir</th>
                  <th className="px-6 py-5 text-left">Total</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTransactions.length > 0 ? paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-4 text-slate-500 font-bold text-xs">
                        {new Date(t.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700 uppercase italic tracking-tighter">{t.cashier.name}</td>
                    <td className="px-6 py-4 font-black text-slate-800 italic">Rp {t.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                        t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center font-black text-slate-200 uppercase italic tracking-widest">Data Transaksi Kosong</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* PAGINATION CONTROL */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-50 px-6 py-4 bg-slate-50/30">
                <p className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronLeft size={16}/></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronRight size={16}/></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}