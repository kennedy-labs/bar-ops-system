/*
  Warnings:

  - You are about to drop the column `amount` on the `Discrepancy` table. All the data in the column will be lost.
  - You are about to drop the column `resolved` on the `Discrepancy` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `Discrepancy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceReference]` on the table `Discrepancy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actualValue` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedValue` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceReference` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variance` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Discrepancy` table without a default value. This is not possible if the table is not empty.
  - Made the column `branchId` on table `Discrepancy` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DiscrepancyType" AS ENUM ('STOCK_SHORTAGE', 'CASH_SHORTAGE', 'MPESA_MISMATCH', 'TRANSFER_MISMATCH', 'UNCONFIRMED_ADDITION');

-- CreateEnum
CREATE TYPE "DiscrepancyStatus" AS ENUM ('OPEN', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "Discrepancy" DROP CONSTRAINT "Discrepancy_branchId_fkey";

-- AlterTable
ALTER TABLE "Discrepancy" DROP COLUMN "amount",
DROP COLUMN "resolved",
DROP COLUMN "resolvedAt",
ADD COLUMN     "actualValue" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "expectedValue" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "sourceReference" TEXT NOT NULL,
ADD COLUMN     "status" "DiscrepancyStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "variance" DECIMAL(65,30) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "DiscrepancyType" NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Discrepancy_businessId_status_idx" ON "Discrepancy"("businessId", "status");

-- CreateIndex
CREATE INDEX "Discrepancy_branchId_createdAt_idx" ON "Discrepancy"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "Discrepancy_shiftId_idx" ON "Discrepancy"("shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "Discrepancy_sourceReference_key" ON "Discrepancy"("sourceReference");

-- AddForeignKey
ALTER TABLE "Discrepancy" ADD CONSTRAINT "Discrepancy_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discrepancy" ADD CONSTRAINT "Discrepancy_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
