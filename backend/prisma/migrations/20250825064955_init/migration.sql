-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "subCategory" TEXT,
    "description" TEXT,
    "model" TEXT,
    "hsCode" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "calibrationType" TEXT,
    "calibrationStart" TIMESTAMP(3),
    "calibrationExpiry" TIMESTAMP(3),
    "assignedProject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN',
    "certificate" TEXT,
    "qrCode" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "project" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_assetId_key" ON "public"."Item"("assetId");

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
