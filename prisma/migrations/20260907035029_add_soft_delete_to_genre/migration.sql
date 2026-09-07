-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Genre_deletedAt_idx" ON "Genre"("deletedAt");
