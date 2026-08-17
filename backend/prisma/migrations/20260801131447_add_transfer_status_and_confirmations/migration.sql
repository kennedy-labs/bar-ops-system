-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'SENDER_CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_shiftId_fkey";

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "transferId" TEXT,
ALTER COLUMN "shiftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "discrepancyDetected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receivedQuantity" INTEGER DEFAULT 0,
ADD COLUMN     "receiverConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "receiverConfirmedByUserId" TEXT,
ADD COLUMN     "senderConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "senderConfirmedByUserId" TEXT,
ADD COLUMN     "status" "TransferStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_senderConfirmedByUserId_fkey" FOREIGN KEY ("senderConfirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_receiverConfirmedByUserId_fkey" FOREIGN KEY ("receiverConfirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
