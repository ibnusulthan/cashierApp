import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getProducts,
  getShifts,
  getTransactions,
  getDashboardSummary, 
  getDailyItemSales, 
  getStockLogs, 
  getCategories
} from '@/lib/api/admin';
import { User } from '@/types/user';
import { Product } from '@/types/product';
import { ShiftsResponse } from '@/types/shift';
import { TransactionAdmin } from '@/types/transaction';
import { api } from '@/lib/axios';
import { PaginatedResponse, Products } from '@/types/interface';

export const useUsers = (params?: {
  page?: number;
  search?: string;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useProducts = (params?: { 
  page?: number; 
  search?: string; 
  category?: string; 
  sort?: string; 
  limit?: number 
}) =>
  useQuery<PaginatedResponse<Product>, Error>({
    // QueryKey harus menyertakan params agar otomatis fetch saat URL berubah
    queryKey: ['products', params], 
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useShifts = (params?: {
  page?: number;
  cashierId?: string;
  isMismatch?: boolean;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}) =>
  useQuery<ShiftsResponse, Error>({
    queryKey: ['shifts', params], // Penting: masukkan params ke queryKey
    queryFn: () => getShifts(params), // Kirim params ke fungsi API
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useTransactions = () =>
  useQuery<{ transactions: TransactionAdmin[] }, Error>({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    staleTime: Infinity,
  });

export const useDailyItemSales = (date: string) =>
  useQuery({
    queryKey: ['daily-sales', date],
    queryFn: () => getDailyItemSales(date),
    enabled: !!date, // Hanya fetch jika date ada
  });
export const useStockLogs = () =>
  useQuery({
    queryKey: ['stock-logs'],
    queryFn: getStockLogs,
});

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (data) => {
      console.log("Data di dalam Hook", data);
      return data;
    },
    staleTime: Infinity,
  });

  export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/categories', { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};