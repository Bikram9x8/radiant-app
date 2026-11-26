-- CreateTable
CREATE TABLE "LatestUpdate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "forWho" TEXT,
    "location" TEXT,
    "mode" TEXT,
    "dates" TEXT,
    "deadline" DATE,
    "oneLine" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "checkedAt" DATE,
    "internalNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LatestUpdate_slug_key" ON "LatestUpdate"("slug");

-- CreateIndex
CREATE INDEX "LatestUpdate_status_idx" ON "LatestUpdate"("status");

-- CreateIndex
CREATE INDEX "LatestUpdate_deadline_idx" ON "LatestUpdate"("deadline");

