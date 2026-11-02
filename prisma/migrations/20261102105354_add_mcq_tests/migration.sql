-- CreateEnum
CREATE TYPE "McqOption" AS ENUM ('A', 'B', 'C', 'D');

-- CreateTable
CREATE TABLE "McqQuestion" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctOption" "McqOption" NOT NULL,
    "explanation" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "chapterId" TEXT NOT NULL,
    "timeLimitMin" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McqTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqTestQuestion" (
    "testId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "McqTestQuestion_pkey" PRIMARY KEY ("testId","questionId")
);

-- CreateTable
CREATE TABLE "McqAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "timeTakenSec" INTEGER NOT NULL,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McqAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqAnswer" (
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" "McqOption",
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "McqAnswer_pkey" PRIMARY KEY ("attemptId","questionId")
);

-- CreateIndex
CREATE INDEX "McqQuestion_chapterId_isActive_idx" ON "McqQuestion"("chapterId", "isActive");

-- CreateIndex
CREATE INDEX "McqTest_chapterId_isPublished_idx" ON "McqTest"("chapterId", "isPublished");

-- CreateIndex
CREATE INDEX "McqTestQuestion_testId_position_idx" ON "McqTestQuestion"("testId", "position");

-- CreateIndex
CREATE INDEX "McqAttempt_studentId_submittedAt_idx" ON "McqAttempt"("studentId", "submittedAt");

-- CreateIndex
CREATE INDEX "McqAttempt_testId_idx" ON "McqAttempt"("testId");

-- AddForeignKey
ALTER TABLE "McqQuestion" ADD CONSTRAINT "McqQuestion_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "CourseNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqTest" ADD CONSTRAINT "McqTest_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "CourseNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqTestQuestion" ADD CONSTRAINT "McqTestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "McqTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqTestQuestion" ADD CONSTRAINT "McqTestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "McqQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqAttempt" ADD CONSTRAINT "McqAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqAttempt" ADD CONSTRAINT "McqAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "McqTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqAnswer" ADD CONSTRAINT "McqAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "McqAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqAnswer" ADD CONSTRAINT "McqAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "McqQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
