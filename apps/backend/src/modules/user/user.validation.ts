import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(),
});

// Tambahkan schema untuk update
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(), // Boleh kosong, tapi kalau diisi minimal 6
  role: z.nativeEnum(UserRole).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
