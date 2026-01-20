import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { UserRole } from "@prisma/client";
import { createUser, deleteUser, getUsers } from "./user.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  getUsers
);

router.post(
  "/",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  createUser
);

router.delete(
  "/:id",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  deleteUser
);

export default router;
