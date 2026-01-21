'use client';

import { useState, useMemo } from 'react';
import { useShifts, useUsers } from '@/hooks/useAdminDashboard.ts';
import { 
  AlertTriangle, CheckCircle2, User, Loader2, TrendingDown, TrendingUp,
  ChevronLeft, ChevronRight, SortAsc, SortDesc, Eye, X, Clock, Receipt, UserCircle, Wallet, CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';

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
  const [page, setPage] = useState(1);
  const [cashierId, setCashierId] = useState('');
  const [isMismatch, setIsMismatch] = useState<string>('all');
  const [sortBy, setBy] = useState<'openedAt' | 'totalTransactions'>('openedAt');
  const [sortOrder, setOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const { data: usersData } = useUsers();
  const { data, isLoading, isFetching } = useShifts({
    page,
    cashierId: cashierId || undefined,
    isMismatch: isMismatch === 'true' ? true : isMismatch === 'false' ? false : undefined,
    sortBy,
    sortOrder,
  });

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

  // Optimasi Kalkulasi Statistik di Modal
  const stats = useMemo(() => {
    if (!selectedShift?.transactions) return { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 };
    
    return selectedShift.transactions.reduce((acc: any, tx: any) => {
      if (tx.status === 'COMPLETED') {
        if (tx.paymentType === 'CASH') {
          acc.cashTotal += tx.totalAmount;
          acc.cashCount += 1;
        } else if (tx.paymentType === 'DEBIT') {
          acc.debitTotal += tx.totalAmount;
          acc.debitCount += 1;
        }
      }
      return acc;
    }, { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 });
  }, [selectedShift]);

  const shifts = data?.shifts?.shifts || [];
  const totalCount = data?.shifts?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 20);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Shift & Kas</h1>
          <p className="text-slate-500">Monitoring selisih uang dan aktivitas kasir.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400">Pilih Kasir</label>
          <select className="block w-48 p-2 bg-slate-50 border rounded-lg text-sm outline-none" value={cashierId} onChange={(e) => setCashierId(e.target.value)}>
            <option value="">Semua Kasir</option>
            {usersData?.data?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400">Status Selisih</label>
          <select className="block w-40 p-2 bg-slate-50 border rounded-lg text-sm outline-none" value={isMismatch} onChange={(e) => setIsMismatch(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="true">Mismatch</option>
            <option value="false">Match</option>
          </select>
        </div>
        <div className="space-y-1 ml-auto">
          <div className="flex gap-2">
            <select className="p-2 bg-slate-50 border rounded-lg text-sm outline-none" value={sortBy} onChange={(e) => setBy(e.target.value as any)}>
              <option value="openedAt">Waktu Buka</option>
              <option value="totalTransactions">Jml Transaksi</option>
            </select>
            <button onClick={() => setOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 border rounded-lg bg-white">
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${isFetching ? 'opacity-50' : ''}`}>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs font-bold text-slate-500 uppercase">
              <th className="px-6 py-4">Kasir & Waktu Buka</th>
              <th className="px-6 py-4 text-right">Omzet (Gross)</th>
              <th className="px-6 py-4 text-right">Target Sistem</th>
              <th className="px-6 py-4 text-right">Uang Fisik</th>
              <th className="px-6 py-4 text-right">Selisih</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shifts.map((shift: any) => {
              // Hitung Omzet di Tabel (Cash + Debit)
              const totalRevenue = shift.transactions?.reduce((acc: number, tx: any) => tx.status === 'COMPLETED' ? acc + tx.totalAmount : acc, 0) || 0;
              
              return (
                <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => handleRowClick(shift.id)}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{shift.cashier.name}</p>
                    <p className="text-[10px] text-slate-400">{formatDateNative(shift.openedAt)}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">{formatCurrency(totalRevenue)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">{formatCurrency(shift.expectedCash)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">{formatCurrency(shift.cashEnd)}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm">
                    {shift.difference !== null ? (
                        <span className={shift.difference < 0 ? 'text-red-600' : shift.difference > 0 ? 'text-amber-600' : 'text-green-600'}>
                          {formatCurrency(shift.difference)}
                        </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Eye size={18} className="mx-auto text-slate-400 group-hover:text-blue-600" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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