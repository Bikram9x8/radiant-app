-- CreateTable
CREATE TABLE "CourseNode" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "chapterNo" INTEGER,
    "bookName" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contentTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseNode_parentId_idx" ON "CourseNode"("parentId");

-- CreateIndex
CREATE INDEX "CourseNode_kind_idx" ON "CourseNode"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "CourseNode_parentId_slug_key" ON "CourseNode"("parentId", "slug");

-- AddForeignKey
ALTER TABLE "CourseNode" ADD CONSTRAINT "CourseNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CourseNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
