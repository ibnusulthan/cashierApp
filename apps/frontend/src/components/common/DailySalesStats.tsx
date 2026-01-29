import { TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DailySalesStatsProps {
  totalRevenue: number;
  totalQty: number;
  selectedDate: string;
}

export function DailySalesStats({ totalRevenue, totalQty, selectedDate }: DailySalesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative flex items-center justify-between overflow-hidden rounded-[32px] bg-blue-600 p-8 text-white shadow-xl shadow-blue-100">
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-blue-200 uppercase">
            Total Revenue ({selectedDate})
          </p>
          <h2 className="text-4xl font-black italic">{formatCurrency(totalRevenue)}</h2>
        </div>
        <TrendingUp size={80} className="absolute -right-4 -bottom-4 rotate-12 text-white opacity-10" />
      </div>
      
      <div className="relative flex items-center justify-between overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Total Items Sold
          </p>
          <h2 className="text-4xl font-black text-slate-800 italic">
            {totalQty}{' '}
            <span className="text-sm font-normal tracking-widest text-slate-300 uppercase not-italic">Pcs</span>
          </h2>
        </div>
        <Package size={80} className="absolute -right-4 -bottom-4 text-slate-50 opacity-50" />
      </div>
    </div>
  );
}