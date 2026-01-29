import { SortAsc, SortDesc } from 'lucide-react';

interface ShiftFiltersProps {
  currentCashier: string;
  currentMismatch: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  usersData: any[];
  onUpdate: (updates: Record<string, string | null>) => void;
}

export function ShiftFilters({ 
  currentCashier, currentMismatch, currentSortBy, currentSortOrder, usersData, onUpdate 
}: ShiftFiltersProps) {
  return (
    <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pilih Kasir</label>
        <select 
          className="block w-48 p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
          value={currentCashier} 
          onChange={(e) => onUpdate({ cashierId: e.target.value })}
        >
          <option value="">Semua Kasir</option>
          {usersData?.map((u: any) => (<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status Selisih</label>
        <select 
          className="block w-40 p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
          value={currentMismatch} 
          onChange={(e) => onUpdate({ isMismatch: e.target.value })}
        >
          <option value="all">Semua Status</option>
          <option value="true">Mismatch</option>
          <option value="false">Match</option>
        </select>
      </div>
      <div className="space-y-2 ml-auto flex gap-2">
        <select 
          className="p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
          value={currentSortBy} 
          onChange={(e) => onUpdate({ sortBy: e.target.value })}
        >
          <option value="openedAt">Waktu Buka</option>
          <option value="totalTransactions">Jml Transaksi</option>
        </select>
        <button 
          onClick={() => onUpdate({ sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' })} 
          className="p-3 border-2 border-slate-50 rounded-2xl bg-white hover:bg-slate-50 transition-all shadow-sm"
        >
          {currentSortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
        </button>
      </div>
    </div>
  );
}