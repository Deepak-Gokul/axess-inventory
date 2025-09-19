/*
  Warnings:

  - You are about to drop the column `assetId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemAssetId` on the `Log` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Log" DROP CONSTRAINT "Log_itemAssetId_fkey";

-- DropIndex
DROP INDEX "public"."Item_assetId_key";

-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "assetId",
ADD COLUMN     "serialNo" TEXT;

-- AlterTable
ALTER TABLE "public"."Log" DROP COLUMN "itemAssetId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
