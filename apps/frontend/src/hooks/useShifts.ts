import { useQuery } from "@tanstack/react-query";
import { getAllShifts, getShiftDetail } from "@/lib/adminShift";
import { GetAllShiftsOptions, GetAllShiftsResponse } from "@/types/allShift";
import { ShiftDetailResponse, ShiftDetail } from "@/types/shiftDetail";

export const useAllShifts = (options: GetAllShiftsOptions = {}) => {
  return useQuery({
    queryKey: ["allShifts", options],
    queryFn: () => getAllShifts(options),
    staleTime: 1000 * 60, // 1 menit cache
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // refetch tiap 5 menit
  });
};

interface UseShiftDetailOptions {
  page?: number;
  pageSize?: number;
  status?: "PENDING" | "COMPLETED" | "CANCELED";
  paymentType?: "CASH" | "DEBIT";
}

export const useShiftDetail = (shiftId: string, options: UseShiftDetailOptions = {}) => {
  return useQuery<ShiftDetailResponse>({
    queryKey: ["shiftDetail", shiftId, options],

    queryFn: () =>
      getShiftDetail(
        shiftId,
        options.page,
        options.pageSize,
        options.status,
        options.paymentType
      ),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};