import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { UserRole } from "@prisma/client";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "./category.controller";

const router = Router();

router.get("/", authMiddleware, getCategories);

router.post(
  "/",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  createCategory
);

router.delete(
  "/:id",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  deleteCategory
);

export default router;
