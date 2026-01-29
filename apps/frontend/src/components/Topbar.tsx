'use client';

import { deleteCookie } from 'cookies-next';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/');
  };

  const getTitle = () => {
    if (pathname.includes('/products')) return 'Product Management';
    if (pathname.includes('/users')) return 'User Management';
    if (pathname.includes('/dailyitems')) return 'Daily Items Sale';
    if (pathname.includes('/shifts')) return 'Shift Reports';
    if (pathname.includes('/cashier')) return 'Cashier Dashboard';

    return 'Male POS';
  };

  return (
    // Tinggi dikurangi dari h-20 ke h-16, padding vertical dikurangi
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-8 shadow-sm">
      
      {/* Title Dashboard - Ukuran teks dikecilkan sedikit dan garis bawah ditipiskan */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase leading-none">
            {getTitle()}
          </h2>
          {/* Garis biru dibuat lebih tipis (h-0.5) dan jaraknya dikurangi (mt-0.5) */}
          <div className="h-0.5 w-6 bg-blue-600 rounded-full mt-0.5" />
        </div>
      </div>

      {/* Action Area - Ukuran tombol diperkecil sedikit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-50 hover:border-red-200 active:scale-95"
        >
          <LogOut size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}