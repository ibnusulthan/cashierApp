export type TransactionItem = {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
};

export type TransactionAdmin = {
  id: string;
  shiftId: string;
  cashierId: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number | null;
  paymentType: 'CASH' | 'DEBIT';
  debitCardNo?: string | null;
  status: 'COMPLETED' | 'CANCELED' | 'PENDING';
  createdAt: string;
  shift: {
    id: string;
    cashStart: number;
    cashEnd: number;
    expectedCash: number;
    difference: number;
    isMismatch: boolean;
    totalTransactions: number | null;
    openedAt: string;
    closedAt: string;
    createdAt: string;
  };
  cashier: {
    id: string;
    name: string;
  };
  items: TransactionItem[];
};
