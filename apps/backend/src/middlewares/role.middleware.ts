import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const authorize = (allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized - Please login" });
      return;
    }

    if (!req.user.role) {
      res.status(401).json({ message: "Unauthorized - Role missing" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden - Access denied" });
      return;
    }

    next();
  };
};
