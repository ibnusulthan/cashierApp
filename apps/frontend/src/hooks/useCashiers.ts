import { useQuery } from '@tanstack/react-query';
import { getAllCashiers } from '@/lib/adminShift';
import { Cashier } from '@/types/allShift';

export const useCashiers = () => {
  return useQuery<Cashier[], Error>({
    queryKey: ['cashiers'],
    queryFn: getAllCashiers,
    staleTime: Infinity, // 1 menit cache
    refetchOnWindowFocus: false, // tidak auto refetch saat tab fokus
    refetchInterval: 5 * 60 * 1000, // opsional, refetch tiap 5 menit
  });
};
