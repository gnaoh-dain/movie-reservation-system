/*
  Warnings:

  - Added the required column `type` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SEAT_TYPE" AS ENUM ('REGULAR', 'VIP');

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "type" "SEAT_TYPE" NOT NULL;
