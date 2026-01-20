"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useShiftDetail } from "@/hooks/useShifts";
import { Transaction } from "@/types/shiftDetail";

export default function ShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params.id as string; // hilangkan TS error

  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "COMPLETED" | "CANCELED" | ""
  >("");
  const [paymentFilter, setPaymentFilter] = useState<"CASH" | "DEBIT" | "">(
    ""
  );

  const { data, isLoading, error } = useShiftDetail(shiftId, {
    page,
    pageSize,
    status: statusFilter || undefined,
    paymentType: paymentFilter || undefined,
  });

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

  const totalPageTransactions = useMemo(() => {
    if (!data?.transactions) return 0;
    return data.transactions.reduce(
      (sum, tx) => sum + (tx.totalAmount ?? 0),
      0
    );
  }, [data]);

  return (
    <div className="p-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/admin/shift")}
        className="mb-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
      >
        &larr; Back
      </button>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{(error as any).message}</p>
      ) : data ? (
        <>
          {/* Shift Info */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">
              Shift Detail - {data.shift.cashier.name}
            </h1>
            <p>Cash Start: {formatRupiah(data.shift.cashStart)}</p>
            <p>Cash End: {formatRupiah(data.shift.cashEnd)}</p>
            <p>Expected Cash: {formatRupiah(data.shift.expectedCash)}</p>
            <p>
              Difference:{" "}
              <span
                className={
                  data.shift.difference && data.shift.difference < 0
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {formatRupiah(data.shift.difference)}
              </span>
            </p>
            <p>Mismatch: {data.shift.isMismatch ? "Yes" : "No"}</p>
          </div>

          {/* Filters */}
          <div className="mb-4 flex gap-4 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "PENDING" | "COMPLETED" | "CANCELED" | ""
                )
              }
              className="border px-2 py-1"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as "CASH" | "DEBIT" | "")
              }
              className="border px-2 py-1"
            >
              <option value="">All Payment</option>
              <option value="CASH">Cash</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Total</th>
                  <th className="border px-2 py-1">Paid</th>
                  <th className="border px-2 py-1">Change</th>
                  <th className="border px-2 py-1">Payment</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Created At</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.length ? (
                  data.transactions.map((tx: Transaction) => (
                    <tr key={tx.id}>
                      <td className="border px-2 py-1">{tx.id}</td>
                      <td className="border px-2 py-1">
                        {formatRupiah(tx.totalAmount)}
                      </td>
                      <td className="border px-2 py-1">
                        {formatRupiah(tx.paidAmount)}
                      </td>
                      <td className="border px-2 py-1">
                        {formatRupiah(tx.changeAmount)}
                      </td>
                      <td className="border px-2 py-1">{tx.paymentType}</td>
                      <td className="border px-2 py-1">{tx.status}</td>
                      <td className="border px-2 py-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center">
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
              disabled={
                page >=
                (data.totalCount ? Math.ceil(data.totalCount / pageSize) : 1)
              }
              onClick={() => setPage((p) => p + 1)}
              className="border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Total transaksi halaman ini */}
          <div className="mt-4 font-bold">
            Total Transactions (this page): {formatRupiah(totalPageTransactions)}
          </div>
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};