-- Add task-detail metadata without changing existing task identifiers or rows.
ALTER TYPE "task_priority" ADD VALUE IF NOT EXISTS 'urgent';
ALTER TYPE "task_priority" ADD VALUE IF NOT EXISTS 'no-priority';
ALTER TYPE "task_status" ADD VALUE IF NOT EXISTS 'backlog';

ALTER TABLE "Task"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "reporterAvatar" TEXT,
  ADD COLUMN "reporterName" TEXT,
  ADD COLUMN "resources" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "startDate" TIMESTAMP(3),
  ADD COLUMN "teams" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "priority" SET DEFAULT 'no-priority';

CREATE TABLE "Subtask" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "priority" "task_priority" NOT NULL DEFAULT 'no-priority',
  "assigneeName" TEXT,
  "assigneeInitials" TEXT,
  "dueDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskComment" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "parentId" UUID,
  "authorName" TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "authorAvatar" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskActivity" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "actorName" TEXT NOT NULL,
  "actorAvatar" TEXT,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Subtask_taskId_idx" ON "Subtask"("taskId");
CREATE INDEX "TaskComment_taskId_createdAt_idx" ON "TaskComment"("taskId", "createdAt");
CREATE INDEX "TaskComment_parentId_idx" ON "TaskComment"("parentId");
CREATE INDEX "TaskActivity_taskId_createdAt_idx" ON "TaskActivity"("taskId", "createdAt");

ALTER TABLE "Subtask"
  ADD CONSTRAINT "Subtask_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskComment"
  ADD CONSTRAINT "TaskComment_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskComment"
  ADD CONSTRAINT "TaskComment_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "TaskComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskActivity"
  ADD CONSTRAINT "TaskActivity_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
