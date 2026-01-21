import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  // Gunakan z.coerce agar Zod mengubah string "15000" menjadi angka 15000
  price: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});