-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Item_id_seq";
