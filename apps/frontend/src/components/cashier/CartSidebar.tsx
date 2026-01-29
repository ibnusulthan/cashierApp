import { ShoppingCart, Trash2, Minus, Plus, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartSidebar({ cart, updateQty, setCart, total, onCheckout, isPending }: any) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-50 p-6">
        <h3 className="flex items-center gap-2 text-sm font-black tracking-tighter uppercase italic">
          <ShoppingCart size={18} className="text-blue-600" /> My Order
        </h3>
        <button onClick={() => setCart([])} className="text-slate-300 transition-colors hover:text-red-500">
          <Trash2 size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {cart.map((item: any) => (
          <div key={item.id} className="group flex items-center justify-between rounded-[22px] bg-slate-50 p-4 transition-all">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-slate-800 uppercase italic">{item.name}</p>
              <p className="text-[10px] font-bold text-blue-600">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-100 bg-white p-1">
                <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={12} /></button>
                <span className="w-8 text-center text-[10px] font-black text-slate-800">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-blue-600"><Plus size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-t-[40px] bg-slate-900 p-6 text-white">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Total Bill</span>
          <span className="text-3xl font-black tracking-tighter italic">{formatCurrency(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || isPending}
          className="w-full rounded-2xl bg-blue-600 py-5 text-xs font-black tracking-widest uppercase shadow-xl shadow-blue-900/50 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="mx-auto animate-spin" /> : 'Process Payment'}
        </button>
      </div>
    </div>
  );
}