import dayjs from "dayjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export const getGreeting = () => {
  const hour = dayjs().hour();

  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

// Helper untuk gabung class Tailwind (opsional tapi berguna)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};