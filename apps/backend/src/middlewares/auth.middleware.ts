import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized - No token" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    //Pastikan tipe decoded sesuai yang kita harapkan
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      !("role" in decoded)
    ) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = {
      userId: decoded.userId as string,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
