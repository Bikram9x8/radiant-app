-- AlterTable
ALTER TABLE "McqAnswer" ADD COLUMN     "optionOrder" TEXT,
ADD COLUMN     "position" INTEGER;

-- AlterTable
ALTER TABLE "McqQuestion" ADD COLUMN     "keepOptionOrder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "McqTest" ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false;
