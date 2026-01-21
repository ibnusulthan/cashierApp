'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useProducts,
  useTransactions,
  useDashboardSummary,
  useDailyItemSales,
} from '@/hooks/useAdminDashboard.ts';
import { TransactionAdmin } from '@/types/transaction';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Receipt, 
  RefreshCcw, 
  ArrowRight 
} from 'lucide-react';

type SortField = 'date' | 'amount' | '';
type SortOrder = 'asc' | 'desc' | '';

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- FILTER & SORT STATE (URL SYNC) ---
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [cashierInput, setCashierInput] = useState(searchParams.get('cashier') || '');
  const [debouncedCashier, setDebouncedCashier] = useState(searchParams.get('cashier') || '');
  const [sortField, setSortField] = useState<SortField>((searchParams.get('sortField') as SortField) || '');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sortOrder') as SortOrder) || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 5;

  // --- DATA FETCHING (React Query) ---
  const { data: summaryRes, isLoading: summaryLoading } = useDashboardSummary();
  const { data: dailyRes, isLoading: dailyLoading } = useDailyItemSales(filterDate);
  const { data: txData, isLoading: txLoading } = useTransactions();
  
  const summary = summaryRes?.data;
  const topItems = dailyRes?.data || [];
  const transactions: TransactionAdmin[] = txData?.transactions ?? [];

  // --- DEBOUNCE LOGIC ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCashier(cashierInput), 500);
    return () => clearTimeout(handler);
  }, [cashierInput]);

  // --- URL SYNC EFFECT ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterDate) params.set('date', filterDate);
    if (debouncedCashier) params.set('cashier', debouncedCashier);
    if (filterStatus) params.set('status', filterStatus);
    if (sortField) params.set('sortField', sortField);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (currentPage !== 1) params.set('page', String(currentPage));
    router.replace(`/dashboard/admin?${params.toString()}`, { scroll: false });
  }, [filterDate, debouncedCashier, filterStatus, sortField, sortOrder, currentPage, router]);

  // --- TABLE LOGIC (Filter, Sort, Pagination) ---
  let processedTransactions = transactions.filter((t) => {
    const matchCashier = t.cashier.name.toLowerCase().includes(debouncedCashier.toLowerCase());
    const matchDate = filterDate ? t.createdAt.startsWith(filterDate) : true;
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchCashier && matchDate && matchStatus;
  });

  if (sortField && sortOrder) {
    processedTransactions = [...processedTransactions].sort((a, b) => {
      const compare = sortField === 'date' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : a.totalAmount - b.totalAmount;
      return sortOrder === 'asc' ? compare : -compare;
    });
  }

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (summaryLoading || txLoading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium">Data updated: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      {/* SECTION 1: OVERVIEW CARDS (Spec: Akumulasi Laporan) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp size={20}/></div>
            <p className="text-sm text-gray-500 font-medium">Total Pendapatan</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">Rp {summary?.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Receipt size={20}/></div>
            <p className="text-sm text-gray-500 font-medium">Transaksi Berhasil</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.totalCompletedTransactions}</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><Package size={20}/></div>
            <p className="text-sm text-gray-500 font-medium">Produk Stok Rendah</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary?.lowStockProductsCount} <span className="text-sm font-normal text-gray-400">Items</span></p>
        </div>

        <div className="rounded-xl bg-orange-50 p-5 shadow-sm border border-orange-100 cursor-pointer hover:bg-orange-100 transition" onClick={() => router.push('/dashboard/admin/reports/shifts')}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-200 rounded-lg text-orange-700"><AlertTriangle size={20}/></div>
            <p className="text-sm text-orange-700 font-medium">Audit Mismatch</p>
          </div>
          <p className="text-lg font-bold text-orange-800">Cek Selisih Uang</p>
          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">Lihat detail shift <ArrowRight size={12}/></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 2: TOP SELLING ITEMS (Spec: Penjualan per item harian) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Top Products <span className="text-xs font-normal text-gray-400">({filterDate})</span>
          </h2>
          {dailyLoading ? <p className="text-sm text-gray-400">Loading items...</p> : (
            <div className="space-y-4">
              {topItems.length > 0 ? topItems.slice(0, 5).map((item) => (
                <div key={item.productId} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                  <div className="max-w-[150px]">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.totalSold} Qty terjual</p>
                  </div>
                  <p className="font-semibold text-sm text-gray-700">Rp {item.totalRevenue.toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">No data for this date</p>}
            </div>
          )}
        </div>

        {/* SECTION 3: QUICK FILTERS & TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Search cashier..." value={cashierInput} onChange={(e) => setCashierInput(e.target.value)} className="rounded-lg border border-gray-200 p-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-gray-200 p-2 text-sm outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <button onClick={() => { setFilterDate(''); setCashierInput(''); setFilterStatus(''); setSortField(''); setSortOrder(''); setCurrentPage(1); }} className="p-2 text-gray-400 hover:text-gray-600 transition"><RefreshCcw size={20}/></button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Cashier</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{t.cashier.name}</td>
                    <td className="px-4 py-3 font-semibold">Rp {t.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* PAGINATION SIMPLE */}
            <div className="p-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30">Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}