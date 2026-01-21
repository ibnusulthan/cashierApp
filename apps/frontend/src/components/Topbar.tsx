"use client";

import { deleteCookie } from "cookies-next";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Bell, User } from "lucide-react";

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/login");
  };

  // Logic title otomatis berdasarkan URL
  const getTitle = () => {
    if (pathname.includes('/products')) return 'Product Management';
    if (pathname.includes('/users')) return 'User Management';
    if (pathname.includes('/shifts')) return 'Shift Reports';
    return 'Admin Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex justify-between items-center sticky top-0 z-10">
      <h2 className="font-semibold text-gray-800 tracking-tight">{getTitle()}</h2>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-[1px] bg-gray-100 mx-2" />
        <div className="flex items-center gap-3 mr-4">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-gray-700">Administrator</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}