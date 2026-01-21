import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';

export const useActiveShift = () => {
  return useQuery({
    queryKey: ['active-shift'],
    queryFn: async () => {
      const res = await api.get('/shifts/active');
      return res.data; 
    },
    retry: false,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cashStart: number }) => {
      const res = await api.post('/shifts/open', data);
      return res.data;
    },
    onSuccess: () => {
      // Perbaikan: gunakan object property queryKey
      queryClient.invalidateQueries({ queryKey: ['active-shift'] });
      toast.success('Shift berhasil dibuka!');
    },
    onError: () => {
      toast.error('Gagal membuka shift. Coba lagi.');
    }
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/transactions', data);
      return res.data;
    },
    onSuccess: () => {
      // Perbaikan: gunakan object property queryKey
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Transaksi Berhasil!');
    }
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { items: { productId: string; quantity: number }[] }) => {
      const res = await api.post('/transactions', data);
      return res.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useCompleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.post(`/transactions/${id}/complete`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Transaksi Berhasil Diselesaikan!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-shift'] });
    }
  });
};

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/transactions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.error('Transaksi Dibatalkan & Stok Dikembalikan');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useCloseShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cashEnd: number; notes?: string }) => {
      const res = await api.post('/shifts/close', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-shift'] });
      toast.success('Shift berhasil ditutup. Sampai jumpa!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menutup shift');
    }
  });
};

export const useShiftDetail = (shiftId: string, params?: {
  page?: number;
  pageSize?: number;
  statusFilter?: string;
}) => {
  return useQuery({
    queryKey: ['shift-detail', shiftId, params],
    queryFn: async () => {

      const res = await api.get(`/shifts/${shiftId}`, { params });
      return res.data;
    },
    enabled: !!shiftId,
  });
};