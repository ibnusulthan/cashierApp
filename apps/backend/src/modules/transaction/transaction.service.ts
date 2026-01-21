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
  // Tambahkan opsi timeout menjadi 15-20 detik agar lebih aman
  return prisma.$transaction(async (tx) => {
    // 1. Cek shift aktif
    const activeShift = await tx.shift.findFirst({
      where: { cashierId, closedAt: null },
    });

    if (!activeShift) throw new Error('NO_ACTIVE_SHIFT');

    // 2. Cek apakah ada transaksi pending (Guard)
    const pendingTx = await tx.transaction.findFirst({
      where: { shiftId: activeShift.id, status: 'PENDING' },
    });
    if (pendingTx) throw new Error('HAS_PENDING_TRANSACTION');

    // 3. Ambil semua produk sekaligus
    const productIds = data.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
    });

    // 4. Validasi Stok & Hitung Total (Di memori, jangan di DB)
    let totalAmount = 0;
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`INVALID_PRODUCT: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK: ${product.name}`);
      totalAmount += product.price * item.quantity;
    }

    // 5. Update stok menggunakan Promise.all (Jauh lebih cepat daripada for-await)
    await Promise.all(
      data.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            stockHistories: {
              create: {
                change: -item.quantity,
                reason: 'Transaction PENDING',
              },
            },
          },
        })
      )
    );

    // 6. Buat Transaction
    return await tx.transaction.create({
      data: {
        shiftId: activeShift.id,
        cashierId,
        totalAmount,
        paidAmount: 0,
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
      include: { items: true },
    });
  }, {
    timeout: 20000 // Berikan waktu 20 detik (PENTING)
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
    // 1. Cek shift aktif kasir
    const activeShift = await tx.shift.findFirst({
      where: { cashierId, closedAt: null },
    });

    if (!activeShift) throw new Error('NO_ACTIVE_SHIFT');

    // 2. Ambil transaksi
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    if (!transaction) throw new Error('NOT_FOUND');
    if (transaction.status !== 'PENDING') throw new Error('NOT_PENDING');
    if (transaction.shiftId !== activeShift.id) throw new Error('WRONG_SHIFT');
    if (transaction.items.length === 0) throw new Error('EMPTY_TRANSACTION');

    let paidAmount = 0;
    let changeAmount: number | null = null;
    let debitCardNo: string | null = null;

    if (data.paymentType === 'CASH') {
      if (typeof data.paidAmount !== 'number') throw new Error('INSUFFICIENT_PAYMENT');
      paidAmount = data.paidAmount;
      if (paidAmount < transaction.totalAmount) throw new Error('INSUFFICIENT_PAYMENT');
      changeAmount = paidAmount - transaction.totalAmount;
    }

    if (data.paymentType === 'DEBIT') {
      paidAmount = transaction.totalAmount;
      if (!data.debitCardNo) throw new Error('INVALID_DEBIT_CARD');
      debitCardNo = data.debitCardNo;
      changeAmount = null;
    }

    // 3. Update status jadi COMPLETED
    return await tx.transaction.update({
      where: { id: transactionId },
      data: {
        paidAmount,
        changeAmount,
        paymentType: data.paymentType,
        debitCardNo,
        status: 'COMPLETED',
      },
      include: { items: true },
    });
  }, {
    timeout: 20000 // Konsisten dengan yang lain (20 detik)
  });
};

export const cancelTransactionService = async (
  cashierId: string,
  transactionId: string
) => {
  // Tambahkan timeout 20 detik untuk menghindari error P2028
  return prisma.$transaction(async (tx) => {
    // 1. Cek apakah kasir memiliki shift aktif
    const activeShift = await tx.shift.findFirst({
      where: {
        cashierId,
        closedAt: null,
      },
    });

    if (!activeShift) {
      throw new Error('NO_ACTIVE_SHIFT');
    }

    // 2. Ambil data transaksi beserta item-nya
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      throw new Error('NOT_FOUND');
    }

    // 3. Validasi status: Hanya status PENDING yang bisa dibatalkan
    if (transaction.status !== 'PENDING') {
      throw new Error('NOT_PENDING');
    }

    // 4. Validasi kepemilikan: Transaksi harus milik shift yang sedang aktif
    if (transaction.shiftId !== activeShift.id) {
      throw new Error('WRONG_SHIFT');
    }

    // 5. Rollback Stok menggunakan Promise.all (Jauh lebih cepat)
    // Ini mengembalikan stok ke jumlah semula karena transaksi batal
    await Promise.all(
      transaction.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
            stockHistories: {
              create: {
                change: item.quantity,
                reason: `Transaction cancelled (ID: ${transactionId})`,
              },
            },
          },
        })
      )
    );

    // 6. Update status transaksi menjadi CANCELED
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CANCELED',
      },
      include: { items: true },
    });

    return updated;
  }, {
    timeout: 20000 // Berikan waktu maksimal 20 detik
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

export const getDailyItemSalesService = async (date: string) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Agregasi jumlah item terjual
  const salesItems = await prisma.transactionItem.groupBy({
    by: ['productId'],
    where: {
      transaction: {
        status: 'COMPLETED',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    },
    _sum: {
      quantity: true,
      price: true, // total revenue per item (qty * price saat itu)
    },
  });

  // Ambil nama produk agar data mudah dibaca
  const productInfo = await prisma.product.findMany({
    where: { id: { in: salesItems.map((item) => item.productId) } },
    select: { id: true, name: true },
  });

  return salesItems.map((item) => ({
    productId: item.productId,
    name: productInfo.find((p) => p.id === item.productId)?.name || 'Unknown',
    totalSold: item._sum.quantity,
    totalRevenue: item._sum.price,
  }));
};

export const getAdminDashboardSummaryService = async () => {
  const [revenue, txCount, lowStock] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.count({
      where: { status: 'COMPLETED' },
    }),
    prisma.product.count({
      where: { stock: { lt: 10 }, deletedAt: null },
    }),
  ]);

  return {
    totalRevenue: revenue._sum.totalAmount || 0,
    totalCompletedTransactions: txCount,
    lowStockProductsCount: lowStock,
  };
};