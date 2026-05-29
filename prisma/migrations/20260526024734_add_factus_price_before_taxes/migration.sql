-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "factusClientId" TEXT,
ADD COLUMN     "factusClientSecret" TEXT,
ADD COLUMN     "factusNumberingRangeId" INTEGER,
ADD COLUMN     "factusPassword" TEXT,
ADD COLUMN     "factusPrefix" TEXT,
ADD COLUMN     "factusUsername" TEXT,
ADD COLUMN     "hasBilling" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "number" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "icui_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inc_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "iva_percent" DOUBLE PRECISION NOT NULL DEFAULT 19,
ADD COLUMN     "price_before_tax" DOUBLE PRECISION;
