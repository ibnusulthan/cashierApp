import { api } from "../axios";
import { User } from "@/types/user";
import { Product, StockHistory } from "@/types/product";
import { ShiftsResponse, Shift } from "@/types/shift";
import { TransactionAdmin } from "@/types/transaction";
import { AdminDashboardSummary, DailyItemSales } from "@/types/report";

export const getUsers = async (params?: any) => {
  const res = await api.get("/users", { params: params });
  return res.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get<Product[]>("/products");
  return res.data;
};

export const getShifts = async (params?: any): Promise<ShiftsResponse> => {
  const res = await api.get<ShiftsResponse>("/shifts/allShifts", { params });
  return res.data;
};

export const getTransactions = async (): Promise<{ transactions: TransactionAdmin[] }> => {
  const res = await api.get<{ transactions: TransactionAdmin[] }>("/transactions/admin/all");
  return res.data;
};

export const getDashboardSummary = async (): Promise<{ data: AdminDashboardSummary }> => {
  const res = await api.get("/transactions/reports/summary");
  return res.data;
};

export const getDailyItemSales = async (date: string): Promise<{ data: DailyItemSales[] }> => {
  const res = await api.get(`/transactions/reports/daily?date=${date}`);
  return res.data;
};

export const getStockLogs = async (): Promise<{ data: StockHistory[] }> => {
  const res = await api.get("/products/logs/stock");
  return res.data;
};

// Tambahkan interface jika belum ada
export interface Category {
  id: string;
  name: string;
}

export interface CategoryResponse {
  message: string;
  data: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");
  console.log("Data dikirim ke Hook", res.data)
  return res.data; // Sesuaikan dengan struktur response backend-mu
};