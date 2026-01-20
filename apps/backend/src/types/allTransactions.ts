export type GetAllTransactionsInput = {
  cashierId?: string;
  paymentType?: 'CASH' | 'DEBIT';
  startDate?: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd
  isMismatch?: boolean;
  sortBy?: 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};
