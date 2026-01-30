import { UserRole } from '@prisma/client';
import { Request } from 'express'; // Tambahkan import express eksplisit

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {}; // Tambahkan ini untuk memastikan file dianggap sebagai module