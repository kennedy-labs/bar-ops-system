-- CreateEnum
CREATE TYPE "MpesaAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "MpesaAccount" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "accountIdentifier" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "MpesaAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpesaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaAccount_businessId_accountIdentifier_key" ON "MpesaAccount"("businessId", "accountIdentifier");

-- AddForeignKey
ALTER TABLE "MpesaAccount" ADD CONSTRAINT "MpesaAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
