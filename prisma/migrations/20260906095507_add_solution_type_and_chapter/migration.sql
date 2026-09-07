-- AlterEnum
ALTER TYPE "OpportunityType" ADD VALUE 'SOLUTION';

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "chapter" INTEGER;
