import { UserRole } from '@prisma/client';

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

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: {
//       userId: string;
//       role: UserRole;
//     };
//   }
// }
