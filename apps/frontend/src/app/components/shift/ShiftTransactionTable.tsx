import dayjs from "dayjs";
import { Transaction } from "@/types/cashierShift";

type Props = {
  transactions: Transaction[];
};

export default function ShiftTransactionsTable({ transactions }: Props) {
  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="font-semibold mb-3">Shift Transactions</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Time</th>
              <th className="pb-2">Transaction ID</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Payment</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-b last:border-none">
                <td className="py-2">
                  {dayjs(trx.createdAt).format("HH:mm")}
                </td>
                <td className="font-mono text-xs">{trx.id.slice(0, 8)}...</td>
                <td>Rp {trx.totalAmount.toLocaleString("id-ID")}</td>
                <td>{trx.paymentType}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      trx.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {trx.status}
                  </span>
                </td>
              </tr>
            ))}

            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
