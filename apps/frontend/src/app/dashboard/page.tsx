"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-500">Active Shift</p>
          <p className="text-xl font-semibold mt-1">—</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-500">Today Transactions</p>
          <p className="text-xl font-semibold mt-1">—</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-xl font-semibold mt-1">—</p>
        </div>
      </div>
    </div>
  );
}
