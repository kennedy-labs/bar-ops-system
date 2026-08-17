/*
  Warnings:

  - The `status` column on the `MpesaTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[mpesaAccountId,externalTransactionId]` on the table `MpesaTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MpesaTransactionStatus" AS ENUM ('RECEIVED', 'RECONCILED', 'DISPUTED');

-- DropIndex
DROP INDEX "MpesaTransaction_externalTransactionId_key";

-- AlterTable
ALTER TABLE "MpesaTransaction" DROP COLUMN "status",
ADD COLUMN     "status" "MpesaTransactionStatus" NOT NULL DEFAULT 'RECEIVED';

-- CreateIndex
CREATE UNIQUE INDEX "MpesaTransaction_mpesaAccountId_externalTransactionId_key" ON "MpesaTransaction"("mpesaAccountId", "externalTransactionId");
