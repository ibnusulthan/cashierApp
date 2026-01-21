import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { UserRole } from "@prisma/client";
import { createTransaction, completeTransaction, cancelTransaction, getTransactionsByActiveShift, getAllTransactions, getDailyItemReport, getDashboardSummary } from "./transaction.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  createTransaction
);

router.post(
  "/:id/complete",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  completeTransaction
);

router.delete(
  "/:id",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  cancelTransaction
);

router.get(
  "/shift/active",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  getTransactionsByActiveShift
);

router.get(
  "/admin/all",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  getAllTransactions
);

router.get(
  "/reports/daily", 
  authMiddleware, 
  authorize([UserRole.ADMIN]), 
  getDailyItemReport);

router.get(
  "/reports/summary", 
  authMiddleware, 
  authorize([UserRole.ADMIN]), 
  getDashboardSummary);

export default router;
