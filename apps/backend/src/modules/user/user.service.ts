import prisma from "@/prisma";
import { hashPassword } from "@/utils/hash";
import { CreateUserRequest, UserResponse } from "./user.types";
import { UserRole } from "@prisma/client";

export const getActiveUsersService = async (params: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const whereCondition = {
    isActive: true,
    role: UserRole.CASHIER, // Fokus pada Manajemen Kasir sesuai dokumen
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { username: { contains: search, mode: 'insensitive' as any } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

export const updateUserService = async (id: string, data: Partial<CreateUserRequest>) => {
  const updateData: any = { ...data };
  
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });
};