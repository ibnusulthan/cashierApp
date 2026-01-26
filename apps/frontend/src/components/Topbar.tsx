'use client';

import { deleteCookie } from 'cookies-next';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Bell, User } from 'lucide-react';

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  // Logic title otomatis berdasarkan URL
  const getTitle = () => {
    if (pathname.includes('/products')) return 'Product Management';
    if (pathname.includes('/users')) return 'User Management';
    if (pathname.includes('/dailyitems')) return 'Daily Items Sale';
    if (pathname.includes('/shifts')) return 'Shift Reports';
    if (pathname.includes('/cashier')) return 'Cashier';

    return 'Male POS';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-8">
      <h2 className="font-semibold tracking-tight text-gray-800">
        {getTitle()}
      </h2>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
          <Bell size={20} />
        </button>
        <div className="mx-2 h-8 w-[1px] bg-gray-100" />
        <div className="mr-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-gray-700"></span>
        </div>
        <button
          onClick={handleLogout}
          className="hover:bg-red-250 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-red-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
