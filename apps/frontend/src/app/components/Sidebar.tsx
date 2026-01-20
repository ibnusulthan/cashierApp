"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Box, 
  Users, 
  Receipt 
} from "lucide-react";
type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const menu = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/", icon: Box },
  { label: "Users", href: "/dashboard/", icon: Users },
  { label: "Transactions", href: "/dashboard/cashier", icon: Receipt },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="h-full flex flex-col p-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-tight">
              Male POS
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* MENU */}
        <nav className="space-y-1 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-gray-100 font-medium text-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Icon size={20} className="min-w-[24px]" />

                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        {!collapsed && (
          <div className="text-xs text-gray-400 mt-4">v1.0.0</div>
        )}
      </div>
    </aside>
  );
}
