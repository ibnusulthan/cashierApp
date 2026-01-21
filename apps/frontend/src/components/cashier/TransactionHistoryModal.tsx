'use client';

import { X, Receipt, Package, Loader2 } from 'lucide-react';
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
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <Receipt size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
              Riwayat Transaksi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="animate-pulse text-xs font-bold text-slate-400">
                MEMUAT DATA TERBARU...
              </p>
            </div>
          ) : transactions?.length === 0 ? (
            <div className="py-20 text-center font-bold text-slate-400 italic">
              Belum ada transaksi di shift ini.
            </div>
          ) : (
            transactions?.map((tx) => (
              <div
                key={tx.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      ID Transaksi
                    </p>
                    <p className="text-xs font-bold text-blue-600">
                      #{tx.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        tx.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Items Detail */}
                <div className="space-y-2 border-t border-dashed pt-3">
                  {tx.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-300" />
                        <span className="font-bold text-slate-700">
                          {item.quantity}x
                        </span>
                        <span className="text-slate-600">
                          {item.product?.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <p className="text-xs font-bold text-slate-400 italic">
                    Metode: {tx.paymentType}
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {formatCurrency(tx.totalAmount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
