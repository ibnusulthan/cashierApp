import { X, Banknote, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PaymentModal({ 
  total, paymentType, setPaymentType, paidAmount, setPaidAmount, 
  changeAmount, debitCardNo, setDebitCardNo, onCancel, onFinalize, 
  isPending, isCancelPending 
}: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[48px] bg-white shadow-2xl duration-200">
        <div className="flex items-start justify-between bg-slate-900 p-8 text-white">
          <div>
            <p className="mb-1 text-[10px] font-black tracking-[0.3em] text-blue-400 uppercase">Total Amount</p>
            <h2 className="text-4xl font-black tracking-tighter italic">{formatCurrency(total)}</h2>
          </div>
          <button onClick={onCancel} disabled={isCancelPending} className="rounded-full p-2 transition-colors hover:bg-white/10"><X /></button>
        </div>

        <div className="space-y-6 overflow-y-auto p-8">
          <div className="flex rounded-[22px] bg-slate-100 p-1.5">
            <button onClick={() => setPaymentType('CASH')} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[10px] font-black tracking-widest uppercase transition-all ${paymentType === 'CASH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><Banknote size={16} /> Cash</button>
            <button onClick={() => setPaymentType('DEBIT')} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[10px] font-black tracking-widest uppercase transition-all ${paymentType === 'DEBIT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><CreditCard size={16} /> Debit</button>
          </div>

          {paymentType === 'CASH' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Uang Masuk</label>
                <input type="number" autoFocus className="w-full rounded-3xl border-none bg-slate-50 p-6 text-3xl font-black italic outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
              </div>
              <div className={`flex items-center justify-between rounded-[32px] p-6 ${changeAmount >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                <span className="text-[10px] font-black tracking-widest uppercase">{changeAmount >= 0 ? 'Kembalian' : 'Kekurangan'}</span>
                <span className="text-2xl font-black italic">{formatCurrency(Math.abs(changeAmount))}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">Last 8 Digits Card <span className={debitCardNo.length === 8 ? 'text-blue-600' : ''}>{debitCardNo.length}/8</span></label>
              <input type="text" className="w-full rounded-3xl border-none bg-slate-50 p-6 text-2xl font-black outline-none focus:ring-2 focus:ring-blue-500" placeholder="12345678" value={debitCardNo} onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && val.length <= 8) setDebitCardNo(val);
              }} />
            </div>
          )}

          <button onClick={onFinalize} disabled={isPending || (paymentType === 'CASH' && (parseInt(paidAmount) < total || !paidAmount)) || (paymentType === 'DEBIT' && debitCardNo.length !== 8)} className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-slate-900 py-5 text-[10px] font-black tracking-[0.2em] text-white uppercase transition-all hover:bg-blue-600 disabled:opacity-20">
            {isPending ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Selesaikan & Print</>}
          </button>
        </div>
      </div>
    </div>
  );
}