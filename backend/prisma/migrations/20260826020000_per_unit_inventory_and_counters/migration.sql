-- Branch: number of counters (1-4)
ALTER TABLE "Branch" ADD COLUMN "counterCount" INTEGER NOT NULL DEFAULT 1;

-- ProductUnit: selling price moves here; backfill from Product
ALTER TABLE "ProductUnit" ADD COLUMN "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE "ProductUnit" pu
SET "sellingPrice" = p."sellingPrice"
FROM "Product" p
WHERE pu."productId" = p."id";

-- Product: remove sell price (now owned by ProductUnit)
ALTER TABLE "Product" DROP COLUMN "sellingPrice";

-- InventoryItem: inventory is now per (product unit, stock location)
ALTER TABLE "InventoryItem" ADD COLUMN "productUnitId" TEXT;
DROP INDEX IF EXISTS "InventoryItem_branchId_productId_key";
CREATE UNIQUE INDEX "InventoryItem_branchId_productId_productUnitId_stockLocationId_key"
  ON "InventoryItem"("branchId", "productId", "productUnitId", "stockLocationId");
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_productUnitId_fkey"
  FOREIGN KEY ("productUnitId") REFERENCES "ProductUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ShiftStockItem: reference the product unit so price/stock lock onto a unit
ALTER TABLE "ShiftStockItem" ADD COLUMN "productUnitId" TEXT;
ALTER TABLE "ShiftStockItem" ADD CONSTRAINT "ShiftStockItem_productUnitId_fkey"
  FOREIGN KEY ("productUnitId") REFERENCES "ProductUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;