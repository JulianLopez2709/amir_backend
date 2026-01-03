/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserNotification" ADD COLUMN     "companyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_key" ON "Stock"("productId");
