'use client';

import { X, Receipt, Package, Loader2, CreditCard, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TransactionHistoryModal({
  isOpen,
  onClose,
  transactions,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {/* Container Modal */}
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-500/20 rotate-3">
              <Receipt size={24} className="-rotate-3" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                Riwayat Transaksi
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Data Sesi Shift Aktif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-white/10"
          >
            <X size={28} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-8 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                Sinkronisasi Data...
              </p>
            </div>
          ) : transactions?.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mb-4 flex justify-center opacity-10">
                <Receipt size={64} />
              </div>
              <p className="text-sm font-black text-slate-300 uppercase italic">
                Belum ada transaksi di shift ini.
              </p>
            </div>
          ) : (
            transactions?.map((tx) => (
              <div
                key={tx.id}
                className="group rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md mb-4 last:mb-0"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      ID Transaksi
                    </p>
                    <p className="font-mono text-sm font-black text-blue-600">
                      #{tx.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase italic">
                      {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                </div>

                {/* Items Detail */}
                <div className="space-y-3 border-y border-dashed border-slate-100 py-4">
                  {tx.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 font-black text-slate-400">
                          {item.quantity}x
                        </div>
                        <span className="font-bold text-slate-700 uppercase italic">
                          {item.product?.name}
                        </span>
                      </div>
                      <span className="font-black text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Transaksi */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                    {tx.paymentType === 'CASH' ? <Banknote size={14} className="text-slate-400"/> : <CreditCard size={14} className="text-slate-400"/>}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {tx.paymentType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                    <p className="text-xl font-black italic tracking-tighter text-slate-900">
                      {formatCurrency(tx.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}