import { UserRole } from "@prisma/client";

export type CreateUserRequest = {
  name: string;
  username: string;
  password: string;
  role?: UserRole;
};

export type UserResponse = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: Date;
};
