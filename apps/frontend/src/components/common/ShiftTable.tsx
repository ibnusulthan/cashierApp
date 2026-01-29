import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ShiftTableProps {
  shifts: any[];
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  onRowClick: (id: string) => void;
  onPageChange: (page: number) => void;
  formatDate: (date: string) => string;
}

export function ShiftTable({ 
  shifts, isFetching, currentPage, totalPages, onRowClick, onPageChange, formatDate 
}: ShiftTableProps) {
  return (
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
              <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => onRowClick(shift.id)}>
                <td className="px-8 py-5">
                  <p className="font-black text-slate-800 uppercase italic tracking-tighter">{shift.cashier.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{formatDate(shift.openedAt)}</p>
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

      <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
        <div className="flex gap-2">
          <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}