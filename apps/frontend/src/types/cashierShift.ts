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
  items: {
    id: string;
    transactionId: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
};

export type Shift = {
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
};

export type ActiveShiftResponse = {
  data: {
    shift: Shift;
    transactions: Transaction[];
  };
};