'use client';

import { useState, useMemo } from 'react';
import { useActiveShift, useCreateShift, useCloseShift, useShiftDetail } from '@/hooks/useCashier'; // Tambah useShiftDetail
import { Wallet, Play, Loader2, LogOut, Info, User } from 'lucide-react'; 
import { formatCurrency } from '@/lib/utils';
import POSContainer from '@/components/cashier/POSContainer';
import TransactionHistoryModal from '@/components/cashier/TransactionHistoryModal'; // Impor Modal
import { toast } from 'react-hot-toast';

export default function CashierDashboardPage() {
  const { data: shiftResponse, isLoading, refetch } = useActiveShift();
  const activeShift = shiftResponse?.shift;

  const createShiftMutation = useCreateShift();
  const closeShiftMutation = useCloseShift();
  
  const [cashStart, setCashStart] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State Modal History
  const [cashEnd, setCashEnd] = useState('');

  // Hook untuk mengambil detail transaksi di shift ini
  const { data: detailData, isLoading: isDetailLoading, refetch: refetchHistory } = useShiftDetail(activeShift?.id || null);

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    refetchHistory();
  }

  const shiftRevenue = useMemo(() => {
    if (!activeShift?.transactions) return 0;
    return activeShift.transactions
      .filter((tx: any) => tx.status === 'COMPLETED')
      .reduce((acc: number, tx: any) => acc + tx.totalAmount, 0);
  }, [activeShift]);

  const handleOpenShift = async () => {
    const amount = parseInt(cashStart);
    if (isNaN(amount) || amount < 0) return toast.error("Masukkan modal awal yang valid");
    try {
      await createShiftMutation.mutateAsync({ cashStart: amount });
      refetch();
    } catch (err) {}
  };

  const handleCloseShift = async () => {
    const amount = parseInt(cashEnd);
    if (isNaN(amount) || amount < 0) return toast.error("Masukkan jumlah kas akhir");
    try {
      await closeShiftMutation.mutateAsync({ cashEnd: amount });
      setShowCloseModal(false);
      setCashEnd('');
      refetch();
    } catch (err) {}
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!activeShift) {
    // ... UI Buka Shift tetap sama
    return (
        <div className="h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-10 text-white text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-lg shadow-blue-500/20">
                <Wallet size={40} className="-rotate-12" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">Buka Shift</h1>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modal Awal (Cash)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">Rp</span>
                  <input 
                    type="number"
                    value={cashStart}
                    onChange={(e) => setCashStart(e.target.value)}
                    placeholder="0"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={handleOpenShift}
                disabled={createShiftMutation.isPending}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
              >
                {createShiftMutation.isPending ? <Loader2 className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                Buka Sesi Kasir
              </button>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] overflow-hidden space-y-4">
      <div className="flex-none flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mx-1">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><User size={22}/></div>
          <div>
            <h2 className="font-black text-slate-800 tracking-tighter uppercase italic text-sm">
              {activeShift.cashier?.name || 'Kasir Aktif'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Mulai: {new Date(activeShift.openedAt).toLocaleTimeString('id-ID')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right border-r border-slate-100 pr-4 mr-1 hidden md:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue (Shift)</p>
            <p className="font-bold text-blue-600">{formatCurrency(shiftRevenue)}</p>
          </div>
          
          {/* TOMBOL INFO SEKARANG MEMBUKA MODAL */}
          <button 
            onClick={handleOpenHistory}
            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <Info size={20} />
          </button>

          <button 
            onClick={() => setShowCloseModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span>Tutup Shift</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <POSContainer shiftId={activeShift.id} />
      </div>

      {/* Modal Riwayat Transaksi */}
      <TransactionHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        transactions={detailData?.transactions || []}
        isLoading={isDetailLoading}
      />

      {/* MODAL TUTUP SHIFT TETAP SAMA */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-md rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 text-center border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Akhiri Shift</h3>
              <p className="text-sm text-slate-500">Masukkan total uang fisik (cash) yang ada di laci.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Uang Cash Akhir</label>
                <input 
                  type="number"
                  value={cashEnd}
                  onChange={(e) => setCashEnd(e.target.value)}
                  placeholder="0"
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCloseModal(false)} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
                <button 
                  onClick={handleCloseShift}
                  disabled={closeShiftMutation.isPending}
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  {closeShiftMutation.isPending ? <Loader2 className="animate-spin" /> : "Selesai"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}