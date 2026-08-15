/*
  Warnings:

  - A unique constraint covering the columns `[s3Key]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "s3Key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_s3Key_key" ON "Resume"("s3Key");
