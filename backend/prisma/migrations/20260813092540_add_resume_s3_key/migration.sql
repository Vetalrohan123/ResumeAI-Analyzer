/*
  Warnings:

  - You are about to drop the column `s3Key` on the `Resume` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Resume_s3Key_key";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "s3Key";
