import prisma from '@/prisma';
import { PaymentType } from '@prisma/client';
import { GetAllTransactionsInput } from '@/types/allTransactions';

type CreateTransactionInput = {
  items: { productId: string; quantity: number }[];
};

export const createTransactionService = async (
  cashierId: string,
  data: CreateTransactionInput
) => {
  return prisma.$transaction(async (tx) => {
    //Cek shift aktif kasir
    const activeShift = await tx.shift.findFirst({
      where: {
        cashierId,
        closedAt: null,
      },
      include: {
        transactions: true,
      },
    });

    if (!activeShift) {
      throw new Error('NO_ACTIVE_SHIFT');
    }

    const pendingTx = await tx.transaction.findFirst({
      where: {
        shiftId: activeShift.id,
        status: 'PENDING',
      },
    });

    if (pendingTx) {
      throw new Error('HAS_PENDING_TRANSACTION');
    }

    //Ambil semua product dari DB (biar harga valid)
    const productIds = data.items.map((i) => i.productId);

    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null, //soft delete guard
      },
    });

    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(`INVALID_PRODUCT: ${missingIds.join(', ')}`);
    }

    //Cek stok + hitung total
    let totalAmount = 0;

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`INVALID_PRODUCT: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK: ${item.productId}`);
      }

      totalAmount += product.price * item.quantity;
    }

    //Kurangi stok + catat StockHistory
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
          stockHistories: {
            create: {
              change: -item.quantity,
              reason: 'Transaction created (PENDING)',
            },
          },
        },
      });
    }

    //Buat Transaction (PENDING)
    const transaction = await tx.transaction.create({
      data: {
        shiftId: activeShift.id,
        cashierId,
        totalAmount,
        paidAmount: 0, // akan diisi saat COMPLETE
        paymentType: 'CASH',
        status: 'PENDING',
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    return transaction;
  });
};

type CompleteTransactionInput = {
  paymentType: PaymentType;
  paidAmount?: number;
  debitCardNo?: string;
};

export const completeTransactionService = async (
  cashierId: string,
  transactionId: string,
  data: CompleteTransactionInput
) => {
  return prisma.$transaction(async (tx) => {
    //Cek shift aktif kasir
    const activeShift = await tx.shift.findFirst({
      where: {
        cashierId,
        closedAt: null,
      },
    });

    if (!activeShift) {
      throw new Error('NO_ACTIVE_SHIFT');
    }

    //Ambil transaksi
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      throw new Error('NOT_FOUND');
    }

    //Harus masih PENDING
    if (transaction.status !== 'PENDING') {
      throw new Error('NOT_PENDING');
    }

    //Harus milik shift yang aktif
    if (transaction.shiftId !== activeShift.id) {
      throw new Error('WRONG_SHIFT');
    }

    if (transaction.items.length === 0) {
      throw new Error('EMPTY_TRANSACTION');
    }

    let paidAmount = 0;
    let changeAmount: number | null = null;
    let debitCardNo: string | null = null;

    if (data.paymentType === 'CASH') {
      //CASH = wajib paidAmount
      if (typeof data.paidAmount !== 'number') {
        throw new Error('INSUFFICIENT_PAYMENT');
      }

      paidAmount = data.paidAmount;

      if (paidAmount < transaction.totalAmount) {
        throw new Error('INSUFFICIENT_PAYMENT');
      }

      changeAmount = paidAmount - transaction.totalAmount;
    }

    if (data.paymentType === 'DEBIT') {
      // DEBIT = otomatis lunas
      paidAmount = transaction.totalAmount;

      if (!data.debitCardNo) {
        throw new Error('INVALID_DEBIT_CARD');
      }

      debitCardNo = data.debitCardNo;
      changeAmount = null; // tidak ada kembalian
    }

    //Update transaksi → COMPLETED
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        paidAmount,
        changeAmount,
        paymentType: data.paymentType,
        debitCardNo,
        status: 'COMPLETED',
      },
      include: {
        items: true,
      },
    });

    return updated;
  });
};

export const cancelTransactionService = async (
  cashierId: string,
  transactionId: string
) => {
  return prisma.$transaction(async (tx) => {
    // Cek shift aktif
    const activeShift = await tx.shift.findFirst({
      where: {
        cashierId,
        closedAt: null,
      },
    });

    if (!activeShift) {
      throw new Error('NO_ACTIVE_SHIFT');
    }

    // Ambil transaksi + items
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      throw new Error('NOT_FOUND');
    }

    // Harus masih PENDING
    if (transaction.status !== 'PENDING') {
      throw new Error('NOT_PENDING');
    }

    // Harus milik shift aktif
    if (transaction.shiftId !== activeShift.id) {
      throw new Error('WRONG_SHIFT');
    }

    // Rollback stock + catat StockHistory
    for (const item of transaction.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
          stockHistories: {
            create: {
              change: item.quantity,
              reason: 'Transaction cancelled (PENDING)',
            },
          },
        },
      });
    }

    // Update status saja
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CANCELED',
      },
      include: { items: true },
    });

    return updated;
  });
};

export const getTransactionsByActiveShift = async (cashierId: string) => {
  const activeShift = await prisma.shift.findFirst({
    where: {
      cashierId,
      closedAt: null,
    },
  });

  if (!activeShift) {
    throw new Error('NO_ACTIVE_SHIFT');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      shiftId: activeShift.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    shift: activeShift,
    transactions,
  };
};

export const getAllTransactionsService = async (filters: GetAllTransactionsInput) => {
  const {
    cashierId,
    paymentType,
    startDate,
    endDate,
    isMismatch,
    sortBy,
    sortOrder,
  } = filters;

  return prisma.transaction.findMany({
    where: {
      ...(cashierId && { cashierId }),
      ...(paymentType && { paymentType }),
      ...(startDate || endDate
        ? {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          }
        : {}),
      ...(isMismatch !== undefined
        ? { shift: { isMismatch } }
        : {}),
    },
    orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
    include: {
      shift: true,
      cashier: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true } },
        },
      },
    },
  });
};
