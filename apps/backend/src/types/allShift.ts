export type GetAllShiftsOptions = {
  cashierId?: string;
  startDate?: string; 
  endDate?: string;   
  isMismatch?: boolean;
  sortBy?: "totalTransactions" | "openedAt" | "closedAt";
  sortOrder?: "asc" | "desc";
  page?: number; // halaman
  pageSize?: number; // jumlah per halaman
};