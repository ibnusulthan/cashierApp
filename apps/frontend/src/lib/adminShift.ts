import { api } from "./axios";
import { GetAllShiftsOptions, GetAllShiftsResponse, Cashier } from "@/types/allShift";
import { ShiftDetailResponse } from "@/types/shiftDetail";

export const getAllShifts = async (options: GetAllShiftsOptions): Promise<GetAllShiftsResponse> => {
  const params = new URLSearchParams();

  if (options.page) params.append("page", options.page.toString());
  if (options.pageSize) params.append("pageSize", options.pageSize.toString());
  if (options.cashierId) params.append("cashierId", options.cashierId);
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);
  if (typeof options.isMismatch === "boolean") params.append("isMismatch", options.isMismatch.toString());
  if (options.sortBy) params.append("sortBy", options.sortBy);
  if (options.sortOrder) params.append("sortOrder", options.sortOrder);

  const res = await api.get(`/shifts/allShifts?${params.toString()}`);
  // Response backendmu sesuai postman: { shifts: { totalCount, shifts: [] } }
  return res.data.shifts;
};

// Fetch all cashiers
export const getAllCashiers = async (): Promise<Cashier[]> => {
  const res = await api.get("/users");
  // filter hanya role CASHIER
  return res.data.filter((u: any) => u.role === "CASHIER");
};

export const getShiftDetail = async (
  shiftId: string,
  page?: number,
  pageSize?: number,
  status?: string,
  paymentType?: string
): Promise<ShiftDetailResponse> => {
  const params: any = { page, pageSize };
  if (status) params.statusFilter = status;
  if (paymentType) params.paymentFilter = paymentType;

  const res = await api.get<ShiftDetailResponse>(`/shifts/${shiftId}`, { params });
  return res.data;
};