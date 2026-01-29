'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useShifts, useUsers } from '@/hooks/useAdminDashboard';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Import Komponen Baru
import { ShiftFilters } from '@/components/common/ShiftFilters';
import { ShiftTable } from '@/components/common/ShiftTable';
import { ShiftDetailModal } from '@/components/common/ShiftDetailModal';

const formatDateNative = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateString));
  } catch { return '-'; }
};

function ShiftReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State & Params
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  // Data Fetching
  const { data: usersData } = useUsers({ limit: 100 });
  const { data, isLoading, isFetching } = useShifts({
    page: currentPage,
    limit: 10,
    cashierId: searchParams.get('cashierId') || undefined,
    isMismatch: searchParams.get('isMismatch') === 'true' ? true : searchParams.get('isMismatch') === 'false' ? false : undefined,
    sortBy: searchParams.get('sortBy') || 'openedAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value); else params.delete(key);
    });
    if (!updates.page) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const stats = useMemo(() => {
    if (!selectedShift?.transactions) return { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 };
    return selectedShift.transactions.reduce((acc: any, tx: any) => {
      if (tx.status === 'COMPLETED') {
        if (tx.paymentType === 'CASH') { acc.cashTotal += tx.totalAmount; acc.cashCount += 1; }
        else if (tx.paymentType === 'DEBIT') { acc.debitTotal += tx.totalAmount; acc.debitCount += 1; }
      }
      return acc;
    }, { cashTotal: 0, debitTotal: 0, cashCount: 0, debitCount: 0 });
  }, [selectedShift]);

  // Efek scroll lock saat modal buka
  useEffect(() => {
    document.body.style.overflow = (selectedShift || isModalLoading) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedShift, isModalLoading]);

  if (isLoading && !data) return (
    <div className="flex h-96 items-center justify-center flex-col gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 italic tracking-tighter uppercase">Loading Data...</p>
    </div>
  );

  // Helper untuk mendapatkan array shifts dan totalCount secara aman
const shiftList = (data as any)?.shifts?.shifts || (data as any)?.shifts || [];
const totalDataCount = (data as any)?.shifts?.totalCount || (data as any)?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Laporan Shift & Kas</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoring selisih uang dan aktivitas kasir.</p>
      </div>

      <ShiftFilters 
        currentCashier={searchParams.get('cashierId') || ''}
        currentMismatch={searchParams.get('isMismatch') || 'all'}
        currentSortBy={searchParams.get('sortBy') || 'openedAt'}
        currentSortOrder={(searchParams.get('sortOrder') as any) || 'desc'}
        usersData={usersData?.data || []}
        onUpdate={updateFilters}
      />

      <ShiftTable 
        shifts={shiftList}
        isFetching={isFetching}
        currentPage={currentPage}
        totalPages={Math.ceil(totalDataCount / 10)}
        onRowClick={async (id) => {
            setIsModalLoading(true);
            try {
              const res = await api.get(`/shifts/${id}`);
              setSelectedShift(res.data);
            } catch { 
              toast.error("Gagal memuat detail shift"); 
            } finally { 
              setIsModalLoading(false); 
            }
        }}
        onPageChange={(p) => updateFilters({ page: String(p) })}
        formatDate={formatDateNative}
      />

      <ShiftDetailModal 
        isOpen={!!selectedShift || isModalLoading}
        isLoading={isModalLoading}
        shiftData={selectedShift}
        stats={stats}
        onClose={() => setSelectedShift(null)}
        formatDate={formatDateNative}
      />
    </div>
  );
}

export default function ShiftReportsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <ShiftReportsContent />
    </Suspense>
  );
}