import { Request, Response } from 'express';
import {
  findActiveShiftByCashier,
  createShift,
  closeShiftService,
  getActiveShiftByCashier,
  getAllShiftsService,
  getShiftDetailService,
} from './shift.service';
import { GetAllShiftsOptions } from '@/types/allShift';

export const openShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const cashierId = req.user!.userId;
    const { cashStart } = req.body;

    const activeShift = await findActiveShiftByCashier(cashierId);

    if (activeShift) {
      res.status(400).json({
        message: 'You already have an active shift',
      });
      return;
    }

    const shift = await createShift(cashierId, cashStart);

    res.status(201).json({
      message: 'Shift opened successfully',
      shift,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const closeShift = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { cashEnd } = req.body;

    const activeShift = await findActiveShiftByCashier(cashierId);

    if (!activeShift) {
      res.status(400).json({
        message: 'No active shift found',
      });
      return;
    }

    const pendingTx = activeShift.transactions.filter(
      (tx) => tx.status === 'PENDING'
    );

    if (pendingTx.length > 0) {
      res.status(400).json({
        message: 'Cannot close shift: there are still pending transactions',
        pendingTransactions: pendingTx.length,
      });
      return;
    }

    const closedShift = await closeShiftService(activeShift.id, cashEnd);

    res.json({
      message: 'Shift closed successfully',
      shift: closedShift,
    });
  } catch (error: any) {
    if (error.message === 'HAS_PENDING_TRANSACTIONS') {
      res.status(400).json({
        message: 'Cannot close shift: there are still pending transactions',
      });
      return;
    }

    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getActiveShift = async (req: Request, res: Response) => {
  try {
    const cashierId = req.user?.userId;
    if (!cashierId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const activeShift = await getActiveShiftByCashier(cashierId);

    if (!activeShift) {
      res.json({
        message: activeShift ? 'Active shift found' : 'No active shift',
        shift: activeShift,
      });
      return;
    }

    res.json({
      message: 'Active shift found',
      shift: activeShift,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllShiftsAdmin = async (req: Request, res: Response) => {
  try {
    const qPage = req.query.page as string;
    const qLimit = req.query.limit as string;
    const qPageSize = req.query.pageSize as string;
    const qCashierId = req.query.cashierId as string;
    const qStartDate = req.query.startDate as string;
    const qEndDate = req.query.endDate as string;
    const qIsMismatch = req.query.isMismatch as string;
    const qSortBy = req.query.sortBy as string;
    const qSortOrder = req.query.sortOrder as string;

    const options: GetAllShiftsOptions = {
      page: qPage ? parseInt(qPage) : 1,
      pageSize: qLimit ? parseInt(qLimit) : (qPageSize ? parseInt(qPageSize) : 10),
      cashierId: qCashierId,
      startDate: qStartDate,
      endDate: qEndDate,
      isMismatch: qIsMismatch ? qIsMismatch === 'true' : undefined,
      sortBy: qSortBy as 'totalTransactions' | 'openedAt' | 'closedAt',
      sortOrder: qSortOrder as 'asc' | 'desc',
    };

    const result = await getAllShiftsService(options);
    res.json(result); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getShiftDetail = async (req: Request, res: Response) => {
  try {
    const shiftId = req.params.id;
    if (!shiftId) return res.status(400).json({ message: 'Shift ID is required' });

    // Gunakan casting eksplisit 'as string'
    const qPage = req.query.page as string;
    const qPageSize = req.query.pageSize as string;
    const statusQuery = req.query.status as string;
    const paymentQuery = req.query.paymentType as string;

    const page = parseInt(qPage) || 1;
    const pageSize = parseInt(qPageSize) || 10;

    let statusFilter: 'PENDING' | 'COMPLETED' | 'CANCELED' | undefined;
    if (['PENDING', 'COMPLETED', 'CANCELED'].includes(statusQuery)) {
      statusFilter = statusQuery as 'PENDING' | 'COMPLETED' | 'CANCELED';
    }

    let paymentFilter: 'CASH' | 'DEBIT' | undefined;
    if (['CASH', 'DEBIT'].includes(paymentQuery)) {
      paymentFilter = paymentQuery as 'CASH' | 'DEBIT';
    }

    const shiftDetail = await getShiftDetailService({
      shiftId,
      page,
      pageSize,
      statusFilter,
      paymentFilter,
    });

    if (!shiftDetail) return res.status(404).json({ message: 'Shift not found' });

    res.json(shiftDetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
