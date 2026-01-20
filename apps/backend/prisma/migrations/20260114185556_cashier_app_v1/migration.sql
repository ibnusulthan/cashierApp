/*
  Warnings:

  - You are about to drop the column `cashPaid` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `debitCardNumber` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `paidAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CASHIER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "cashPaid",
DROP COLUMN "debitCardNumber",
ADD COLUMN     "changeAmount" INTEGER,
ADD COLUMN     "debitCardNo" TEXT,
ADD COLUMN     "paidAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "Role";
