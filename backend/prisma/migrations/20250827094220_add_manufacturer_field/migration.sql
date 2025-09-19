/*
  Warnings:

  - You are about to drop the column `itemId` on the `Log` table. All the data in the column will be lost.
  - Added the required column `itemAssetId` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Log" DROP CONSTRAINT "Log_itemId_fkey";

-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "manufacturer" TEXT;

-- AlterTable
ALTER TABLE "public"."Log" DROP COLUMN "itemId",
ADD COLUMN     "itemAssetId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_itemAssetId_fkey" FOREIGN KEY ("itemAssetId") REFERENCES "public"."Item"("assetId") ON DELETE RESTRICT ON UPDATE CASCADE;
