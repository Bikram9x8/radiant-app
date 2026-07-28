-- AlterTable
ALTER TABLE "AccessCode" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockReason" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3);
