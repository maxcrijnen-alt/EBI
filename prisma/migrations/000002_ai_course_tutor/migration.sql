ALTER TABLE "QuestionDraft"
ADD COLUMN "questionType" TEXT NOT NULL DEFAULT 'OPEN_ENDED',
ADD COLUMN "difficulty" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN "optionsJson" TEXT,
ADD COLUMN "wrongOptionExplanations" TEXT,
ADD COLUMN "formulaTags" TEXT,
ADD COLUMN "estimatedSteps" TEXT,
ADD COLUMN "sourceInspiration" TEXT,
ADD COLUMN "sourceChunkIds" TEXT,
ADD COLUMN "generationKey" TEXT,
ADD COLUMN "generationModel" TEXT,
ADD COLUMN "isOriginal" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "QuestionDraft_generationKey_key" ON "QuestionDraft"("generationKey");

CREATE TABLE "SourceChunk" (
  "id" TEXT NOT NULL,
  "sourceDocumentId" TEXT NOT NULL,
  "topicId" TEXT,
  "subtopicId" TEXT,
  "chunkIndex" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "normalizedHash" TEXT NOT NULL,
  "charCount" INTEGER NOT NULL,
  "metadataJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SourceChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TopicSummary" (
  "id" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "keyFormulas" TEXT,
  "commonTraps" TEXT,
  "sourceNotes" TEXT,
  "generatedFrom" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TopicSummary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIInteraction" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "purpose" TEXT NOT NULL,
  "model" TEXT,
  "status" TEXT NOT NULL,
  "fallbackReason" TEXT,
  "promptChars" INTEGER NOT NULL DEFAULT 0,
  "responseChars" INTEGER NOT NULL DEFAULT 0,
  "metadataJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceChunk_sourceDocumentId_chunkIndex_key" ON "SourceChunk"("sourceDocumentId", "chunkIndex");
CREATE INDEX "SourceChunk_topicId_idx" ON "SourceChunk"("topicId");
CREATE INDEX "SourceChunk_subtopicId_idx" ON "SourceChunk"("subtopicId");
CREATE INDEX "SourceChunk_normalizedHash_idx" ON "SourceChunk"("normalizedHash");
CREATE UNIQUE INDEX "TopicSummary_topicId_key" ON "TopicSummary"("topicId");
CREATE INDEX "AIInteraction_userId_createdAt_idx" ON "AIInteraction"("userId", "createdAt");
CREATE INDEX "AIInteraction_purpose_createdAt_idx" ON "AIInteraction"("purpose", "createdAt");

ALTER TABLE "SourceChunk"
ADD CONSTRAINT "SourceChunk_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SourceChunk"
ADD CONSTRAINT "SourceChunk_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SourceChunk"
ADD CONSTRAINT "SourceChunk_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TopicSummary"
ADD CONSTRAINT "TopicSummary_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AIInteraction"
ADD CONSTRAINT "AIInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SourceChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TopicSummary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIInteraction" ENABLE ROW LEVEL SECURITY;
