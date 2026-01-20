type Props = {
  totalSales: number;
  completedTransactions: number;
};

export default function ShiftMetrics({
  totalSales,
  completedTransactions,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <p className="text-sm text-gray-500">Total Sales</p>
        <p className="text-xl font-semibold mt-1">
          Rp {totalSales.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <p className="text-sm text-gray-500">Completed Transactions</p>
        <p className="text-xl font-semibold mt-1">
          {completedTransactions}
        </p>
      </div>
    </div>
  );
}
