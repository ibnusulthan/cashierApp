"use client";

import { useState, useMemo, useEffect } from "react";
import { useAllShifts } from "@/hooks/useShifts";
import { useRouter } from "next/navigation";
import { GetAllShiftsOptions, ShiftSummary, Cashier } from "@/types/allShift";
import { getAllCashiers } from "@/lib/adminShift";

export default function AdminShiftPage() {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [cashierId, setCashierId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [isMismatch, setIsMismatch] = useState<string | undefined>();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);

  const router = useRouter();

  // Fetch all cashiers untuk dropdown
  useEffect(() => {
    getAllCashiers().then(setCashiers).catch(console.error);
  }, []);

  const { data: shiftsData, isLoading, error } = useAllShifts({
    page,
    pageSize,
    cashierId,
    startDate,
    endDate,
    isMismatch:
      isMismatch === "true" ? true : isMismatch === "false" ? false : undefined,
    sortBy: "openedAt",
    sortOrder: "desc",
  } as GetAllShiftsOptions);

  // Total transaksi halaman ini
  const totalPageTransactions = useMemo(() => {
    if (!shiftsData?.shifts) return 0;
    return shiftsData.shifts.reduce((sum, s) => sum + (s.totalTransactions ?? 0), 0);
  }, [shiftsData]);

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
      <h1 className="text-2xl font-bold mb-4">Admin Shift Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={cashierId ?? ""}
          onChange={(e) => setCashierId(e.target.value || undefined)}
          className="border px-2 py-1"
        >
          <option value="">All Cashiers</option>
          {cashiers.map((c) => (
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
        <select
          value={isMismatch ?? ""}
          onChange={(e) => setIsMismatch(e.target.value || undefined)}
          className="border px-2 py-1"
        >
          <option value="">All</option>
          <option value="true">Mismatch</option>
          <option value="false">No Mismatch</option>
        </select>
      </div>

      {/* Table wrapper with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="border-collapse border w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Cashier</th>
              <th className="border px-2 py-1">Opened</th>
              <th className="border px-2 py-1">Closed</th>
              <th className="border px-2 py-1">Cash Start</th>
              <th className="border px-2 py-1">Cash End</th>
              <th className="border px-2 py-1">Expected Cash</th>
              <th className="border px-2 py-1">Difference</th>
              <th className="border px-2 py-1">Total Trans</th>
              <th className="border px-2 py-1">Mismatch</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-red-600">
                  Error: {(error as any).message}
                </td>
              </tr>
            ) : shiftsData?.shifts?.length ? (
              shiftsData.shifts.map((shift: ShiftSummary) => {
                const diffColor =
                  shift.difference && shift.difference > 0
                    ? "text-green-600"
                    : shift.difference && shift.difference < 0
                    ? "text-red-600"
                    : "";

                return (
                  <tr
                    key={shift.id}
                    className={shift.isMismatch ? "bg-red-50" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/dashboard/admin/shift/${shift.id}`)}
                  >
                    <td className="border px-2 py-1">{shift.cashier.name}</td>
                    <td className="border px-2 py-1">
                      {new Date(shift.openedAt).toLocaleString()}
                    </td>
                    <td className="border px-2 py-1">
                      {shift.closedAt ? new Date(shift.closedAt).toLocaleString() : "-"}
                    </td>
                    <td className="border px-2 py-1">{formatRupiah(shift.cashStart)}</td>
                    <td className="border px-2 py-1">{formatRupiah(shift.cashEnd)}</td>
                    <td className="border px-2 py-1">{formatRupiah(shift.expectedCash)}</td>
                    <td className={`border px-2 py-1 font-bold ${diffColor}`}>
                      {formatRupiah(shift.difference)}
                    </td>
                    <td className="border px-2 py-1">{formatRupiah(shift.totalTransactions)}</td>
                    <td
                      className={`border px-2 py-1 font-bold ${
                        shift.isMismatch ? "text-red-600" : ""
                      }`}
                    >
                      {shift.isMismatch ? "Yes" : "No"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="border px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page}</span>
        <button
          disabled={page >= Math.ceil((shiftsData?.totalCount ?? 0) / pageSize)}
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
    </div>
  );
};