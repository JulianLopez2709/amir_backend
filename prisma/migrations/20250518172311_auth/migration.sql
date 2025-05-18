/*
  Warnings:

  - You are about to drop the column `avalable` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `telefon` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `UserCompany` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserCompany` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCompany" DROP CONSTRAINT "UserCompany_productId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "avalable",
ADD COLUMN     "avaliable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "avaliable" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telefon",
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserCompany" DROP COLUMN "productId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
