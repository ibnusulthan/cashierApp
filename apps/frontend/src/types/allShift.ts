export type ShiftTransaction = {
  id: string;
  totalAmount: number;
  paymentType: "CASH" | "DEBIT";
  status: "PENDING" | "COMPLETED" | "CANCELED";
  createdAt: string;
};

export type ShiftSummary = {
  id: string;
  cashier: {
    id: string;
    name: string;
  };
  cashStart: number;
  cashEnd: number | null;
  expectedCash: number | null;
  difference: number | null;
  isMismatch: boolean;
  totalTransactions: number | null;
  openedAt: string;
  closedAt: string | null;
  transactions: ShiftTransaction[];
};

export type GetAllShiftsOptions = {
  cashierId?: string;
  startDate?: string;
  endDate?: string;
  isMismatch?: boolean;
  sortBy?: "totalTransactions" | "openedAt" | "closedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type GetAllShiftsResponse = {
  totalCount: number;
  shifts: ShiftSummary[];
};

export type Cashier = {
  id: string;
  name: string;
}