/*
  Warnings:

  - Made the column `serialNo` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "received" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "serialNo" SET NOT NULL;
