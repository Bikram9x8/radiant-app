-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "contentType" TEXT,
ADD COLUMN     "courseNodeId" TEXT;

-- CreateIndex
CREATE INDEX "Opportunity_courseNodeId_idx" ON "Opportunity"("courseNodeId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_courseNodeId_fkey" FOREIGN KEY ("courseNodeId") REFERENCES "CourseNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
