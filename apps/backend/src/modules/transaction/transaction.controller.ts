import { Request, Response } from 'express';
import {
  createTransactionSchema,
  completeTransactionSchema,
} from './transaction.validation';
import {
  createTransactionService,
  completeTransactionService,
  cancelTransactionService,
  getTransactionsByActiveShift as getTransactionsByActiveShiftService,
  getAllTransactionsService,
  getDailyItemSalesService,
  getAdminDashboardSummaryService
} from './transaction.service';


export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid input',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await createTransactionService(cashierId, parsed.data);

    res.status(201).json({
      message: 'Transaction created (PENDING)',
      transaction: result,
    });
  } catch (error: any) {
    console.error("ERROR ASLI DI BACKEND:", error)
    if (error.message === 'NO_ACTIVE_SHIFT') {
      res.status(400).json({ message: 'No active shift found' });
      return;
    }

    if (error.message === 'HAS_PENDING_TRANSACTION') {
      res.status(400).json({
        message: 'You must complete your previous transaction first',
      });
      return;
    }

    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    if (error.message.startsWith('INVALID_PRODUCT')) {
      res
        .status(400)
        .json({ message: 'One or more products are invalid or deleted' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const transactionId = req.params.id;

    const parsed = completeTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid input',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await completeTransactionService(
      cashierId,
      transactionId,
      parsed.data
    );

    res.json({
      message: 'Transaction completed',
      transaction: result,
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    if (error.message === 'NOT_PENDING') {
      res.status(400).json({ message: 'Transaction already completed' });
      return;
    }

    if (error.message === 'EMPTY_TRANSACTION') {
      res.status(400).json({ message: 'Cannot complete empty transaction' });
      return;
    }

    if (error.message === 'NO_ACTIVE_SHIFT') {
      res.status(400).json({ message: 'No active shift found' });
      return;
    }

    if (error.message === 'WRONG_SHIFT') {
      res.status(403).json({
        message: 'This transaction does not belong to your active shift',
      });
      return;
    }

    if (error.message === 'INSUFFICIENT_PAYMENT') {
      res.status(400).json({
        message: 'Paid amount is less than total amount',
      });
      return;
    }

    if (error.message === 'INVALID_DEBIT_CARD') {
      res.status(400).json({
        message: 'Debit card number is required',
      });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const transactionId = req.params.id;

    const result = await cancelTransactionService(cashierId, transactionId);

    res.json({
      message: 'Transaction cancelled',
      transaction: result,
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    if (error.message === 'NOT_PENDING') {
      res
        .status(400)
        .json({ message: 'Only pending transactions can be cancelled' });
      return;
    }

    if (error.message === 'NO_ACTIVE_SHIFT') {
      res.status(400).json({ message: 'No active shift found' });
      return;
    }

    if (error.message === 'WRONG_SHIFT') {
      res.status(403).json({
        message: 'This transaction does not belong to your active shift',
      });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransactionsByActiveShift = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cashierId = req.user?.userId;

    console.log("LOG DIAGNOSIS KASIR ID", cashierId);

    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await getTransactionsByActiveShiftService(cashierId);

    res.json({
      data: {
        shift: result.shift,
        transactions: result.transactions,
      },
    });
  } catch (error: any) {
    if (error.message === 'NO_ACTIVE_SHIFT') {
      res.status(400).json({ message: 'No active shift found' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const {
      cashierId,
      paymentType,
      startDate,
      endDate,
      isMismatch,
      sortBy,
      sortOrder,
    } = req.query;

    const transactions = await getAllTransactionsService({
      cashierId: cashierId as string | undefined,
      paymentType: paymentType as 'CASH' | 'DEBIT' | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      isMismatch: isMismatch !== undefined ? isMismatch === 'true' : undefined,
      sortBy: sortBy as 'totalAmount' | 'createdAt' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Endpoint: GET /api/transactions/reports/daily?date=2023-10-27
 */
export const getDailyItemReport = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ message: "Date parameter is required (YYYY-MM-DD)" });
      return;
    }

    const report = await getDailyItemSalesService(date as string);
    res.json({
      message: `Daily report for ${date}`,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to generate daily report" });
  }
};

/**
 * Endpoint: GET /api/transactions/reports/summary
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const summary = await getAdminDashboardSummaryService();
    res.json({
      message: "Admin dashboard summary",
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};
