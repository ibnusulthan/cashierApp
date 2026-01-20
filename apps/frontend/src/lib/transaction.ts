import { api } from "./axios";
import { TransactionAdmin } from "@/types/admin";

type GetAllTransactionsParams = {
  cashierId?: string;
  paymentType?: "CASH" | "DEBIT";
  startDate?: string;
  endDate?: string;
  isMismatch?: boolean;
  sortBy?: "totalAmount" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export const getAllTransactions = async (params: GetAllTransactionsParams = {}): Promise<TransactionAdmin[]> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const res = await api.get<{ transactions: TransactionAdmin[] }>(`/transactions/admin/all`);
  return res.data.transactions;
};
