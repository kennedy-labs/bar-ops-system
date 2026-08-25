-- CreateTable Enum
CREATE TYPE "StockLocationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "StockLocation" ADD COLUMN "businessId" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "status" "StockLocationStatus" NOT NULL DEFAULT 'ACTIVE';

-- Backfill businessId from the owning Branch
UPDATE "StockLocation" sl
SET "businessId" = b."businessId"
FROM "Branch" b
WHERE sl."branchId" = b."id";

-- Enforce non-null now that data is backfilled
ALTER TABLE "StockLocation" ALTER COLUMN "businessId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;