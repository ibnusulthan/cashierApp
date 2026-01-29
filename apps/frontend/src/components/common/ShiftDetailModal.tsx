import {
  X,
  UserCircle,
  Clock,
  Wallet,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Receipt,
  Loader2,
  Package,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ShiftDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  shiftData: any;
  stats: any;
  onClose: () => void;
  formatDate: (date: string) => string;
}

export function ShiftDetailModal({
  isOpen,
  isLoading,
  shiftData,
  stats,
  onClose,
  formatDate,
}: ShiftDetailModalProps) {
  if (!isOpen) return null;

  const shift = shiftData?.shift;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {isLoading || !shift ? (
          <div className="flex flex-col items-center justify-center gap-4 p-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-sm font-bold text-slate-500 italic">
              Menganalisa data shift...
            </p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex flex-shrink-0 items-center justify-between bg-slate-900 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <UserCircle size={30} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{shift.cashier?.name}</h3>
                  <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase italic">
                    Sesi: {shift.id?.slice(0, 13)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-6 overflow-y-auto bg-slate-50/30 p-6">
              {/* WAKTU SHIFT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <p className="text-[10px] font-bold tracking-tighter uppercase">
                      Buka Shift
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {formatDate(shift.openedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <p className="text-[10px] font-bold tracking-tighter uppercase">
                      Tutup Shift
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {formatDate(shift.closedAt)}
                  </p>
                </div>
              </div>

              {/* STATISTIK PEMBAYARAN */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-600 uppercase">
                    <Wallet size={14} /> Transaksi Cash
                  </div>
                  <p className="text-lg font-black text-slate-800">
                    {formatCurrency(stats.cashTotal)}
                  </p>
                  <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
                    {stats.cashCount} Transaksi
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-600 uppercase">
                    <CreditCard size={14} /> Transaksi Debit
                  </div>
                  <p className="text-lg font-black text-slate-800">
                    {formatCurrency(stats.debitTotal)}
                  </p>
                  <p className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
                    {stats.debitCount} Transaksi
                  </p>
                </div>
              </div>

              {/* REKAPITULASI KAS */}
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">
                    Modal Awal Kasir
                  </span>
                  <span className="font-bold text-slate-700">
                    {formatCurrency(shift.cashStart)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500">
                    Uang Fisik di Laci
                  </span>
                  <span className="font-black text-slate-900">
                    {formatCurrency(shift.cashEnd)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-slate-200 py-2 text-sm">
                  <span className="text-slate-500 italic">
                    Total Omzet Keseluruhan
                  </span>
                  <span className="font-black text-blue-700">
                    {formatCurrency(stats.cashTotal + stats.debitTotal)}
                  </span>
                </div>
              </div>

              {/* STATUS SELISIH */}
              <div
                className={`flex items-center justify-between rounded-2xl p-5 shadow-sm ${shift.difference < 0 ? 'border border-red-100 bg-red-50 text-red-700' : 'border border-green-100 bg-green-50 text-green-700'}`}
              >
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase opacity-60">
                    Status Selisih Kasir
                  </p>
                  <p className="text-2xl font-black tracking-tighter italic">
                    {formatCurrency(shift.difference)}
                  </p>
                </div>
                {shift.difference < 0 ? (
                  <TrendingDown size={32} />
                ) : (
                  <TrendingUp size={32} />
                )}
              </div>

              {/* DAFTAR TRANSAKSI & ITEM */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Receipt size={16} className="text-slate-400" />
                  <h4 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                    Daftar Transaksi Per Sesi
                  </h4>
                </div>

                <div className="grid gap-3">
                  {shiftData.transactions?.length > 0 ? (
                    shiftData.transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
                      >
                        {/* Row Header Transaksi */}
                        <div className="flex items-center justify-between border-b border-slate-50 p-4">
                          <div className="space-y-1">
                            <p className="text-xs font-black tracking-tighter text-slate-800">
                              #{tx.id.slice(-6).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[9px] font-black ${tx.paymentType === 'CASH' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}
                              >
                                {tx.paymentType}
                              </span>
                              <span className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
                                {formatDate(tx.createdAt).split(',')[1] ||
                                  formatDate(tx.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900 italic">
                              {formatCurrency(tx.totalAmount)}
                            </p>
                            <p className="text-[9px] font-bold tracking-tighter text-green-600 uppercase italic">
                              {tx.status}
                            </p>
                          </div>
                        </div>

                        {/* LIST ITEM DI DALAM TRANSAKSI */}
                        <div className="space-y-2 bg-slate-50/50 p-3">
                          {tx.items && tx.items.length > 0 ? (
                            tx.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between border-b border-white pb-1 text-[11px] last:border-0"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-blue-50 px-1.5 font-black text-blue-600">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-bold tracking-tighter text-slate-600 uppercase">
                                    {item.product?.name || 'Item'}
                                  </span>
                                </div>
                                <span className="font-mono text-slate-400">
                                  {formatCurrency(
                                    (item.priceAtTime ||
                                      item.price ||
                                      item.subtotal ||
                                      0) * (item.quantity || 1)
                                  )}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-1 px-2 text-[10px] text-slate-400 italic">
                              <Package size={10} />
                              <span>Tidak ada detail item</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase italic">
                        Belum ada transaksi di shift ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
