import { api } from "./axios";
import { ActiveShiftResponse } from "@/types/cashierShift";

export const getActiveShift = async (): Promise<ActiveShiftResponse> => {
  const res = await api.get<ActiveShiftResponse>(
    "/transactions/shift/active"
  );
  return res.data;
};

export const openShift = async (cashStart: number) => {
  return api.post("/shifts/open", { cashStart });
};

export const closeShift = async (cashEnd: number) => {
  return api.post("/shifts/close", { cashEnd });
};
