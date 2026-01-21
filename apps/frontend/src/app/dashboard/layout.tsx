'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { Toaster } from 'react-hot-toast'; // Sudah benar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* TARUH TOASTER DI SINI agar muncul di atas semua elemen */}
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          // Default style untuk semua toast
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          // Warna spesifik untuk Sukses
          success: {
            style: {
              background: '#ecfdf5', // Hijau muda (emerald-50)
              color: '#065f46', // Hijau tua (emerald-800)
              border: '1px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          // Warna spesifik untuk Error
          error: {
            style: {
              background: '#fef2f2', // Merah muda (red-50)
              color: '#991b1b', // Merah tua (red-800)
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
