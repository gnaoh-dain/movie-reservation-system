-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Movie_deletedAt_idx" ON "Movie"("deletedAt");
