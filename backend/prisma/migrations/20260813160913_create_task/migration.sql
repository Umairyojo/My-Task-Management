-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('todo', 'doing', 'completed', 'on-hold');

-- CreateEnum
CREATE TYPE "task_priority" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'todo',
    "priority" "task_priority" NOT NULL,
    "assigneeName" TEXT,
    "assigneeInitials" TEXT,
    "dueDate" TIMESTAMP(3),
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
