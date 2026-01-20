"use client";

import { useEffect, useState } from "react";
import { getActiveShift, openShift, closeShift } from "@/lib/shift";
import { ActiveShiftResponse, Transaction } from "@/types/cashierShift";
import ShiftHeader from "@/app/components/shift/ShiftHeader";
import ShiftMetrics from "@/app/components/shift/ShiftMetrics";
import ShiftTransactionsTable from "@/app/components/shift/ShiftTransactionTable";
import OpenShiftModal from "@/app/components/shift/OpenShiftModal";
import CloseShiftModal from "@/app/components/shift/CloseShiftModal";

export default function CashierDashboardPage() {
  const [activeShift, setActiveShift] = useState<ActiveShiftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  const fetchShift = async () => {
    setLoading(true);
    try {
      const data = await getActiveShift();
      setActiveShift(data);
    } catch (err) {
      console.error(err);
      setActiveShift(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleOpenShift = async (cashStart: number) => {
    await openShift(cashStart);
    fetchShift();
  };

  const handleCloseShift = async (cashEnd: number) => {
    await closeShift(cashEnd);
    fetchShift();
  };

  const totalSales = activeShift?.data.transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.totalAmount, 0) ?? 0;

  const completedTransactions = activeShift?.data.transactions
    .filter((t) => t.status === "COMPLETED").length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cashier Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : activeShift?.data.shift ? (
        <>
          <ShiftHeader
            cashierName="Cashier One" // nanti bisa ambil dari user context
            openedAt={activeShift.data.shift.openedAt}
          />

          <ShiftMetrics totalSales={totalSales} completedTransactions={completedTransactions} />

          <ShiftTransactionsTable transactions={activeShift.data.transactions as Transaction[]} />

          {!activeShift.data.shift.closedAt && (
            <button
              onClick={() => setCloseModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg mt-4"
            >
              Close Shift
            </button>
          )}
        </>
      ) : (
        <div>
          <p>No active shift. Please open a shift first.</p>
          <button
            onClick={() => setOpenModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg mt-4"
          >
            Open Shift
          </button>
        </div>
      )}

      <OpenShiftModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleOpenShift}
      />

      <CloseShiftModal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        onSubmit={handleCloseShift}
      />
    </div>
  );
}