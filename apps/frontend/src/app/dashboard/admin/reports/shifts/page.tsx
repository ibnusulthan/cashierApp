'use client';

import { useState, useMemo, useEffect } from 'react';
import { useShifts, useUsers } from '@/hooks/useAdminDashboard';
import { 
  AlertTriangle, CheckCircle2, User, Loader2, TrendingDown, TrendingUp,
  ChevronLeft, ChevronRight, SortAsc, SortDesc, Eye, X, Clock, Receipt, UserCircle, Wallet, CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const formatDateNative = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return '-';
  }
};

export default function ShiftReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL States (Ambil dari URL jika ada, jika tidak pakai default)
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentCashier = searchParams.get('cashierId') || '';
  const currentMismatch = searchParams.get('isMismatch') || 'all';
  const currentSortBy = (searchParams.get('sortBy') as any) || 'openedAt';
  const currentSortOrder = (searchParams.get('sortOrder') as any) || 'desc';

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  // FIX: Ambil semua kasir (Limit 100 agar tidak terpotong pagination)
  const { data: usersData } = useUsers({ limit: 100 });

  const { data, isLoading, isFetching } = useShifts({
    page: currentPage,
    cashierId: currentCashier || undefined,
    isMismatch: currentMismatch === 'true' ? true : currentMismatch === 'false' ? false : undefined,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
  });

  // Fungsi sinkronisasi URL
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    // Reset ke page 1 jika filter berubah kecuali page itu sendiri
    if (!updates.page) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRowClick = async (id: string) => {
    setIsModalLoading(true);
    try {
      const res = await api.get(`/shifts/${id}`);
      setSelectedShift(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail shift");
    } finally {
      setIsModalLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!selectedShift?.transactions) return { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 };
    return selectedShift.transactions.reduce((acc: any, tx: any) => {
      if (tx.status === 'COMPLETED') {
        if (tx.paymentType === 'CASH') { acc.cashTotal += tx.totalAmount; acc.cashCount += 1; }
        else if (tx.paymentType === 'DEBIT') { acc.debitTotal += tx.totalAmount; acc.debitCount += 1; }
      }
      return acc;
    }, { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 });
  }, [selectedShift]);

  const shifts = data?.shifts?.shifts || [];
  const totalCount = data?.shifts?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 20);

  if (isLoading && !data) return (
    <div className="flex h-96 items-center justify-center flex-col gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black uppercase italic text-slate-400 tracking-tighter">Loading Shift Data...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Laporan Shift & Kas</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monitoring selisih uang dan aktivitas kasir.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pilih Kasir</label>
          <select 
            className="block w-48 p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
            value={currentCashier} 
            onChange={(e) => updateFilters({ cashierId: e.target.value })}
          >
            <option value="">Semua Kasir</option>
            {usersData?.data?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status Selisih</label>
          <select 
            className="block w-40 p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
            value={currentMismatch} 
            onChange={(e) => updateFilters({ isMismatch: e.target.value })}
          >
            <option value="all">Semua Status</option>
            <option value="true">Mismatch</option>
            <option value="false">Match</option>
          </select>
        </div>

        <div className="space-y-2 ml-auto">
          <div className="flex gap-2">
            <select 
              className="p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
              value={currentSortBy} 
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="openedAt">Waktu Buka</option>
              <option value="totalTransactions">Jml Transaksi</option>
            </select>
            <button 
              onClick={() => updateFilters({ sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' })} 
              className="p-3 border-2 border-slate-50 rounded-2xl bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              {currentSortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={`bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden transition-all ${isFetching ? 'opacity-60' : ''}`}>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-6">Kasir & Waktu Buka</th>
              <th className="px-8 py-6 text-right">Omzet (Gross)</th>
              <th className="px-8 py-6 text-right">Target Sistem</th>
              <th className="px-8 py-6 text-right">Uang Fisik</th>
              <th className="px-8 py-6 text-right">Selisih</th>
              <th className="px-8 py-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shifts.map((shift: any) => {
              const totalRevenue = shift.transactions?.reduce((acc: number, tx: any) => tx.status === 'COMPLETED' ? acc + tx.totalAmount : acc, 0) || 0;
              return (
                <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => handleRowClick(shift.id)}>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase italic tracking-tighter">{shift.cashier.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{formatDateNative(shift.openedAt)}</p>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-black text-blue-600 italic">{formatCurrency(totalRevenue)}</td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-slate-600">{formatCurrency(shift.expectedCash)}</td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-slate-600">{formatCurrency(shift.cashEnd)}</td>
                  <td className="px-8 py-5 text-right font-black text-sm">
                    {shift.difference !== null ? (
                        <span className={shift.difference < 0 ? 'text-red-600' : shift.difference > 0 ? 'text-amber-600' : 'text-green-600'}>
                          {formatCurrency(shift.difference)}
                        </span>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl inline-block group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Eye size={18} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINATION (PENTING!) */}
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {(selectedShift || isModalLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {isModalLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-bold text-slate-500 italic">Menganalisa data shift...</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center"><UserCircle size={30} className="text-blue-400" /></div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedShift.shift.cashier.name}</h3>
                      <p className="text-slate-400 text-[10px] font-mono uppercase italic tracking-widest">Sesi: {selectedShift.shift.id.slice(0,13)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedShift(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X/></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                  {/* Waktu Operasional */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1"><Clock size={12}/><p className="text-[10px] font-bold uppercase">Buka Shift</p></div>
                      <p className="text-sm font-bold text-slate-700">{formatDateNative(selectedShift.shift.openedAt)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1"><Clock size={12}/><p className="text-[10px] font-bold uppercase">Tutup Shift</p></div>
                      <p className="text-sm font-bold text-slate-700">{formatDateNative(selectedShift.shift.closedAt)}</p>
                    </div>
                  </div>

                  {/* Statistik Terpisah (Cash & Debit) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/50">
                       <div className="flex items-center gap-2 text-orange-600 mb-2 font-black text-[10px] uppercase"><Wallet size={14}/> Transaksi Cash</div>
                       <div className="flex justify-between items-end">
                         <div><p className="text-lg font-black text-slate-800">{formatCurrency(stats.cashTotal)}</p><p className="text-[10px] text-slate-500">{stats.cashCount} Transaksi</p></div>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                       <div className="flex items-center gap-2 text-blue-600 mb-2 font-black text-[10px] uppercase"><CreditCard size={14}/> Transaksi Debit</div>
                       <div className="flex justify-between items-end">
                         <div><p className="text-lg font-black text-slate-800">{formatCurrency(stats.debitTotal)}</p><p className="text-[10px] text-slate-500">{stats.debitCount} Transaksi</p></div>
                       </div>
                    </div>
                  </div>

                  {/* Summary Keuangan */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Modal Awal Kasir</span><span className="font-bold">{formatCurrency(selectedShift.shift.cashStart)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold text-slate-700">Uang Fisik di Laci (Tutup Shift)</span><span className="font-black text-slate-900">{formatCurrency(selectedShift.shift.cashEnd)}</span></div>
                    <div className="flex justify-between items-center text-sm py-2 border-t border-dashed border-slate-100">
                      <span className="text-slate-500 italic">Total Omzet Keseluruhan (Cash + Debit)</span>
                      <span className="font-bold text-slate-800">{formatCurrency(stats.cashTotal + stats.debitTotal)}</span>
                    </div>
                  </div>

                  {/* Highlight Selisih */}
                  <div className={`p-5 rounded-2xl flex justify-between items-center ${selectedShift.shift.difference < 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    <div><p className="text-[10px] font-bold uppercase opacity-60">Status Selisih Kasir</p><p className="text-2xl font-black">{formatCurrency(selectedShift.shift.difference)}</p></div>
                    {selectedShift.shift.difference < 0 ? <TrendingDown size={32}/> : <TrendingUp size={32}/>}
                  </div>

                  {/* Riwayat Transaksi */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1"><Receipt size={16} className="text-slate-400" /><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daftar Transaksi Per Sesi</h4></div>
                    <div className="grid gap-2">
                      {selectedShift.transactions?.length > 0 ? (
                        selectedShift.transactions.map((tx: any) => (
                          <div key={tx.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-md transition-all">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-700">#{tx.id.slice(-6).toUpperCase()}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${tx.paymentType === 'CASH' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{tx.paymentType}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{formatDateNative(tx.createdAt).split(',')[1]}</span>
                              </div>
                            </div>
                            <div className="text-right"><p className="text-sm font-black text-slate-800">{formatCurrency(tx.totalAmount)}</p><p className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">{tx.status}</p></div>
                          </div>
                        ))
                      ) : (<div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-xs text-slate-400">Belum ada transaksi di shift ini.</p></div>)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}