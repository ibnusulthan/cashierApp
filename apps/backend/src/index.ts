import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.route";
import productRoutes from "./modules/product/product.route";
import categoryRoutes from "./modules/category/category.route";
import shiftRoutes from "./modules/shift/shift.route";
import userRoutes from "@/modules/user/user.route";
import transactionRouter from "@/modules/transaction/transaction.route"

const app = express();

// ===== SECURITY + PERFORMANCE MIDDLEWARE =====
app.use(helmet());
app.use(compression());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});