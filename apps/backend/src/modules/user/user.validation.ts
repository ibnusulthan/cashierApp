import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
