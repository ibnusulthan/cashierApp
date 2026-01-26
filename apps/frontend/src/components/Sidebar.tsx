"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "cookies-next";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Box, 
  Users, 
  History,
  Store,
  BarChart3 
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const menu = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/admin/products", icon: Box },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Daily Items Sale", href: "/dashboard/admin/reports/dailyitems", icon: BarChart3 }, 
  { label: "Shift Reports", href: "/dashboard/admin/reports/shifts", icon: History },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setCollapsed(savedState === "true");
    }

    const token = getCookie("token") as string;
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setIsAdmin(decoded.role === "ADMIN");
      } catch (err) {
        setIsAdmin(false);
      }
    }
  }, [setCollapsed]);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  if (!mounted || !isAdmin) return null;

  return (
    <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col h-screen sticky top-0 z-50 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in fade-in duration-500">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Store size={18} />
            </div>
            <span className="font-black text-white tracking-tighter text-lg italic uppercase">Male POS</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={`p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <item.icon size={22} className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} transition-colors`} />
              {!collapsed && (
                <span className={`text-sm tracking-wide ${isActive ? "font-black italic uppercase" : "font-bold text-slate-400"}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-[9px] font-black text-slate-700 text-center uppercase tracking-[0.3em]">
        {!collapsed ? "v1.0.0 Production" : "v1.0"}
      </div>
    </aside>
  );
}