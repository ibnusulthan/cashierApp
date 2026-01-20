import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});
