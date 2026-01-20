import { z } from 'zod';
import { PaymentType } from '@prisma/client';

export const createTransactionSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'At least one item is required'),
});

export const completeTransactionSchema = z
  .object({
    paymentType: z.nativeEnum(PaymentType),

    paidAmount: z.number().int().nonnegative().optional(),

    debitCardNo: z.string().min(4).optional(),
  })
  .refine(
    (data) =>
      (data.paymentType === 'CASH' && typeof data.paidAmount === 'number') ||
      (data.paymentType === 'DEBIT' && !!data.debitCardNo),
    {
      message: 'Invalid payment details',
    }
  );
