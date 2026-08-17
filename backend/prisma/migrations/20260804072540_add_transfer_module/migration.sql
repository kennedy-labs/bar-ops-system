/*
  Warnings:

  - You are about to drop the column `createdById` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `discrepancyDetected` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `fromBranchId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `receivedQuantity` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `receiverConfirmedAt` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `receiverConfirmedByUserId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `senderConfirmedAt` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `senderConfirmedByUserId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `toBranchId` on the `Transfer` table. All the data in the column will be lost.
  - Added the required column `businessId` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverBranchId` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderBranchId` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUserId` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_fromBranchId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_productId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_receiverConfirmedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_senderConfirmedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_toBranchId_fkey";

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "createdById",
DROP COLUMN "discrepancyDetected",
DROP COLUMN "fromBranchId",
DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "receivedQuantity",
DROP COLUMN "receiverConfirmedAt",
DROP COLUMN "receiverConfirmedByUserId",
DROP COLUMN "senderConfirmedAt",
DROP COLUMN "senderConfirmedByUserId",
DROP COLUMN "sentAt",
DROP COLUMN "toBranchId",
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "dispatchedAt" TIMESTAMP(3),
ADD COLUMN     "receiverBranchId" TEXT NOT NULL,
ADD COLUMN     "receiverUserId" TEXT,
ADD COLUMN     "senderBranchId" TEXT NOT NULL,
ADD COLUMN     "senderUserId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "TransferItem" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productUnitId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_senderBranchId_fkey" FOREIGN KEY ("senderBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_receiverBranchId_fkey" FOREIGN KEY ("receiverBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferItem" ADD CONSTRAINT "TransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferItem" ADD CONSTRAINT "TransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferItem" ADD CONSTRAINT "TransferItem_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "ProductUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
