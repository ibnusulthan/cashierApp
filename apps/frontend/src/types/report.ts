export interface DailyItemSales {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface AdminDashboardSummary {
  totalRevenue: number;
  totalCompletedTransactions: number;
  lowStockProductsCount: number;
}

// Wrapper untuk response Axios jika backend kamu mengembalikan object { data: ... }
export interface DashboardSummaryResponse {
  message: string;
  data: AdminDashboardSummary;
}

export interface DailyItemSalesResponse {
  message: string;
  data: DailyItemSales[];
}