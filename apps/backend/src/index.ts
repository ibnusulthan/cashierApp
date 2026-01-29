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
const allowedOrigins = [
  "http://localhost:3000",                  
  process.env.FRONTEND_URL,                // URL Vercel (nanti diisi di .env backend)
  /\.vercel\.app$/                         // Mengizinkan semua subdomain vercel.app (opsional tapi berguna)
].filter(Boolean) as (string | RegExp)[];

// ===== SECURITY + PERFORMANCE MIDDLEWARE =====
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti mobile apps atau curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // WAJIB true karena cookie-parser
}));
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