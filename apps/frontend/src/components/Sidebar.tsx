"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Box, 
  Users, 
  History,
  Store
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const menu = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/admin/products", icon: Box },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Shift Reports", href: "/dashboard/admin/reports/shifts", icon: History },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64"}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Store size={18} />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">Male POS</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={22} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
              {!collapsed && <span className="font-medium text-sm tracking-wide">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest">
        {!collapsed ? "v1.0.0 Production" : "v1.0"}
      </div>
    </aside>
  );
}