-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('DRAFT', 'VERIFIED');

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "type" TEXT,
    "establishedYear" INTEGER,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "fullAddress" TEXT,
    "officialWebsite" TEXT,
    "basicInfoSourceUrl" TEXT,
    "basicInfoCheckedAt" DATE,
    "approvedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approvalSourceUrl" TEXT,
    "approvalCheckedAt" DATE,
    "naacGrade" TEXT,
    "naacValidUntil" DATE,
    "naacSourceUrl" TEXT,
    "naacCheckedAt" DATE,
    "nirfRank" TEXT,
    "nirfCategory" TEXT,
    "nirfYear" INTEGER,
    "nirfSourceUrl" TEXT,
    "nirfCheckedAt" DATE,
    "hostel" TEXT,
    "campusAreaAcres" DECIMAL(8,2),
    "facilitiesSourceUrl" TEXT,
    "facilitiesCheckedAt" DATE,
    "admissionPhone" TEXT,
    "admissionEmail" TEXT,
    "contactSourceUrl" TEXT,
    "contactCheckedAt" DATE,
    "imagePermission" TEXT,
    "logoPermission" TEXT,
    "internalNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "level" TEXT,
    "stream" TEXT,
    "specialization" TEXT,
    "durationYears" DECIMAL(3,1),
    "mode" TEXT,
    "seats" INTEGER,
    "courseSourceUrl" TEXT,
    "courseCheckedAt" DATE,
    "feePerYearInr" INTEGER,
    "feePerSemesterInr" INTEGER,
    "totalFeeInr" INTEGER,
    "feeYear" TEXT,
    "feeSourceUrl" TEXT,
    "feeCheckedAt" DATE,
    "eligibility" TEXT,
    "eligibilitySourceUrl" TEXT,
    "entranceExams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examSourceUrl" TEXT,
    "internalNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_status_idx" ON "College"("status");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_stream_level_idx" ON "Course"("stream", "level");

-- CreateIndex
CREATE UNIQUE INDEX "Course_collegeId_courseId_key" ON "Course"("collegeId", "courseId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

