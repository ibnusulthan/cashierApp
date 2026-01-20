import prisma from '@/prisma';
import { GetAllShiftsOptions } from '@/types/allShift';

export const findActiveShiftByCashier = async (cashierId: string) => {
  return prisma.shift.findFirst({
    where: {
      cashierId,
      closedAt: null,
    },
    include: {
      transactions: true,
    },
  });
};

export const createShift = async (cashierId: string, cashStart: number) => {
  return prisma.shift.create({
    data: {
      cashierId,
      cashStart,
    },
  });
};

export const closeShiftService = async (shiftId: string, cashEnd: number) => {
  return prisma.$transaction(async (tx) => {
    const pendingTx = await tx.transaction.findFirst({
      where: {
        shiftId,
        status: 'PENDING',
      },
    });

    if (pendingTx) {
      throw new Error('HAS_PENDING_TRANSACTIONS');
    }

    // Ambil shift + semua transaksi terkait (PAKAI tx, bukan prisma)
    const shift = await tx.shift.findUnique({
      where: { id: shiftId },
      include: {
        transactions: true,
      },
    });

    if (!shift?.transactions.length) {
        console.warn(`Closing shift ${shiftId} with no transactions`)
    }

    if (!shift) {
      throw new Error('Shift not found');
    }

    // Hitung total semua transaksi
    const totalTransactions = shift.transactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    // Hitung expected cash
    const totalCashFromTransactions = shift.transactions
      .filter((t) => t.paymentType === 'CASH' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.paidAmount - (t.changeAmount || 0), 0);

    const expectedCash = shift.cashStart + totalCashFromTransactions;

    // Hitung difference
    const difference = cashEnd - expectedCash;

    // Tentukan mismatch
    const isMismatch = difference !== 0;

    // Tutup shift
    const closedShift = await tx.shift.update({
      where: { id: shiftId },
      data: {
        cashEnd,
        expectedCash,
        difference,
        isMismatch,
        totalTransactions,
        closedAt: new Date(),
      },
    });

    return closedShift;
  });
};

export const getActiveShiftByCashier = async (cashierId: string) => {
  return prisma.shift.findFirst({
    where: {
      cashierId,
      closedAt: null,
    },
    include: {
      transactions: {
        select: {
          id: true,
          totalAmount: true,
          paymentType: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });
};

export const getAllShiftsService = async (options: GetAllShiftsOptions = {}) => {
  const { cashierId, startDate, endDate, isMismatch, sortBy, sortOrder, page = 1, pageSize = 20 } = options;

  const where: any = {};

  if (cashierId) where.cashierId = cashierId;
  if (typeof isMismatch === "boolean") where.isMismatch = isMismatch;
  if (startDate || endDate) {
    where.openedAt = {};
    if (startDate) where.openedAt.gte = new Date(startDate);
    if (endDate) where.openedAt.lte = new Date(endDate);
  }

  const orderBy: any = {};
  if (sortBy) orderBy[sortBy] = sortOrder || "asc";
  else orderBy.openedAt = "desc";

  const skips = (page - 1) * pageSize;

  const [totalCount, shifts] = await prisma.$transaction([
    prisma.shift.count({ where }),
    prisma.shift.findMany({
      where,
      orderBy,
      skip: skips,
      take: pageSize,
      include: {
        cashier: { select: { id: true, name: true } },
        transactions: {
          select: {
            id: true,
            totalAmount: true,
            paymentType: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  return { totalCount, shifts };
};


interface GetShiftDetailOptions {
  shiftId: string;
  page?: number;
  pageSize?: number;
  statusFilter?: "PENDING" | "COMPLETED" | "CANCELED";
  paymentFilter?: "CASH" | "DEBIT";
}
export const getShiftDetailService = async (options: GetShiftDetailOptions) => {
  const { shiftId, page = 1, pageSize = 10, statusFilter, paymentFilter } = options;
  const skip = (page - 1) * pageSize;

  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      cashier: { select: { id: true, name: true } },
    },
  });

  if (!shift) return null;

  // Build filter
  const where: any = { shiftId };
  if (statusFilter) where.status = statusFilter;
  if (paymentFilter) where.paymentType = paymentFilter;

  const [totalCount, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return { shift, transactions, totalCount };
};