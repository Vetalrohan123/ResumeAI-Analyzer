-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "achievements" JSONB,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "Resume_uploadedById_idx" ON "Resume"("uploadedById");

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "Resume"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_status_idx" ON "Resume"("status");
