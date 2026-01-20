export type TransactionAdmin = {
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
  shift: {
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
  cashier: {
    id: string;
    name: string;
  };
  items: {
    id: string;
    transactionId: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
    };
  }[];
};
