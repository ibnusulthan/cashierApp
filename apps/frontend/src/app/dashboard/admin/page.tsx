"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "@/lib/transaction";
import { useCashiers } from "@/hooks/useCashiers";
import { TransactionAdmin } from "@/types/admin";

export default function AdminDashboardPage() {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [cashierId, setCashierId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  // Ambil daftar cashier
  const { data: cashiers } = useCashiers();

  // Fetch transactions
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery<TransactionAdmin[]>({
    queryKey: ["allTransactions", { cashierId, startDate, endDate, page, pageSize }],
    queryFn: () =>
      getAllTransactions({
        cashierId,
        startDate,
        endDate,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    staleTime: 60 * 1000, // 1 menit cache
    refetchOnWindowFocus: false,
  });

  // Total transaksi hari ini
  const todayTotal = useMemo(() => {
    if (!transactions) return 0;
    const today = new Date().toISOString().split("T")[0];
    return transactions
      .filter((tx) => tx.createdAt.startsWith(today))
      .reduce((sum, tx) => sum + tx.totalAmount, 0);
  }, [transactions]);

  // Total transaksi keseluruhan
  const overallTotal = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  }, [transactions]);

  const formatRupiah = (value?: number | null) => {
    if (!value) return "Rp.0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("Rp", "Rp.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Summary */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          Total Transactions Today: {formatRupiah(todayTotal)}
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          Overall Transactions: {formatRupiah(overallTotal)}
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          Registered Users: {cashiers?.length ?? 0}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <select
          value={cashierId ?? ""}
          onChange={(e) => setCashierId(e.target.value || undefined)}
          className="border px-2 py-1"
        >
          <option value="">All Cashiers</option>
          {cashiers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate ?? ""}
          onChange={(e) => setStartDate(e.target.value || undefined)}
          className="border px-2 py-1"
        />
        <input
          type="date"
          value={endDate ?? ""}
          onChange={(e) => setEndDate(e.target.value || undefined)}
          className="border px-2 py-1"
        />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Cashier</th>
              <th className="border px-2 py-1">Total</th>
              <th className="border px-2 py-1">Paid</th>
              <th className="border px-2 py-1">Change</th>
              <th className="border px-2 py-1">Payment</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Shift Opened</th>
              <th className="border px-2 py-1">Created At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="py-4 text-center text-red-600">
                  Error: {(error as any).message}
                </td>
              </tr>
            ) : transactions?.length ? (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="border px-2 py-1">{tx.id}</td>
                  <td className="border px-2 py-1">{tx.cashier.name}</td>
                  <td className="border px-2 py-1">{formatRupiah(tx.totalAmount)}</td>
                  <td className="border px-2 py-1">{formatRupiah(tx.paidAmount)}</td>
                  <td className="border px-2 py-1">{formatRupiah(tx.changeAmount)}</td>
                  <td className="border px-2 py-1">{tx.paymentType}</td>
                  <td className="border px-2 py-1">{tx.status}</td>
                  <td className="border px-2 py-1">
                    {new Date(tx.shift.openedAt).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-4 text-center">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="border px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page}</span>
        <button
          disabled={transactions && transactions.length < pageSize}
          onClick={() => setPage((p) => p + 1)}
          className="border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
