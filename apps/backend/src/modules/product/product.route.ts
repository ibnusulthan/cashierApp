import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { UserRole } from "@prisma/client";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from "./product.controller";
import { uploadProductImage } from "@/middlewares/upload.middleware";

const router = Router();

router.get("/", authMiddleware, getProducts);

router.post(
  "/",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  uploadProductImage.single("image"),
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  uploadProductImage.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  authorize([UserRole.ADMIN]),
  deleteProduct
);

export default router;
