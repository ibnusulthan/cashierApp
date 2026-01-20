import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { UserRole } from "@prisma/client";
import { openShift, closeShift, getActiveShift, getAllShiftsAdmin, getShiftDetail } from "./shift.controller";

const router = Router();

router.get(
    "/active",
    authMiddleware,
    authorize([UserRole.CASHIER]),
    getActiveShift  
);

router.post(
  "/open",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  openShift
);

router.post(
  "/close",
  authMiddleware,
  authorize([UserRole.CASHIER]),
  closeShift
);

router.get(
  "/allShifts", 
  authMiddleware, 
  authorize([UserRole.ADMIN]), 
  getAllShiftsAdmin
);

router.get(
  "/:id",
  authMiddleware,
  authorize([UserRole.ADMIN, UserRole.CASHIER]),
  (req, res, next) => {
    getShiftDetail(req, res).catch(next);
  }
);

export default router;
