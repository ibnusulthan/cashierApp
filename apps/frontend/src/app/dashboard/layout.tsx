"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // queryClient harus di state supaya tidak re-create tiap render
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}