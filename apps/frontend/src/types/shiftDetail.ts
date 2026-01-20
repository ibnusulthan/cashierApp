export type TransactionItem = {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  price: number;
  product: { name: string };
};

export type Transaction = {
  id: string;
  shiftId: string;
  cashierId: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number | null;
  paymentType: "CASH" | "DEBIT";
  debitCardNo: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  createdAt: string;
  items: TransactionItem[];
};

export type ShiftDetail = {
  id: string;
  cashierId: string;
  cashStart: number;
  cashEnd: number | null;
  expectedCash: number | null;
  difference: number | null;
  isMismatch: boolean;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  cashier: { id: string; name: string };
};

export type ShiftDetailResponse = {
  shift: ShiftDetail;
  transactions: Transaction[];
  totalCount: number;
};
