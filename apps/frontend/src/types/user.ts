export type UserRole = "ADMIN" | "CASHIER"

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO Date string dari backend
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface UserPagination {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserPayload {
  name: string;
  username: string;
  password?: string; // Opsional saat update
  role?: UserRole;
}