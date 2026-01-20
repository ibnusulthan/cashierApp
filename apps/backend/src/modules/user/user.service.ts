import prisma from "@/prisma";
import { hashPassword } from "@/utils/hash";
import { CreateUserRequest, UserResponse } from "./user.types";
import { UserRole } from "@prisma/client";

export const getActiveUsersService = async (): Promise<UserResponse[]> => {
  return prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

export const createUserService = async (
  data: CreateUserRequest
): Promise<UserResponse> => {
  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      password: hashed,
      role: data.role ?? UserRole.CASHIER,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const deactivateUserService = async (id: string): Promise<void> => {
  await prisma.user.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
};
