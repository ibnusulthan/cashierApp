// src/types/shift.ts
import { User } from "./user";

export interface Shift {
  id: string;
  cashierId: string;
  cashStart: number;
  cashEnd: number | null;
  expectedCash: number | null;
  difference: number | null;
  isMismatch: boolean;
  totalTransactions: number | null;
  openedAt: string;
  closedAt: string | null;
  cashier: {
    id: string;
    name: string;
  };
}

export interface ShiftsResponse {
  shifts: {
    totalCount: number;
    shifts: Shift[];
  };
}