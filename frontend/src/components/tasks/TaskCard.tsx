"use client";

import { type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, GripVertical, Tag } from "lucide-react";
import type { Task } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { PriorityIndicator } from "./PriorityIndicator";
import { MemberAvatar } from "./MemberAvatar";
import { formatTaskDate } from "./task-date";
import { TaskActionsMenu } from "./TaskActionsMenu";

interface TaskCardProps {
  task: Task;
  statusLabel: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (task: Task) => void;
  onDragEnd?: (task: Task) => void;
}

export function TaskCard({
  task,
  statusLabel,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const dueDate = formatTaskDate(task.dueDate);
  const router = useRouter();
  const detailHref = `/tasks/${task.id}`;

  const handleOpenDetail = () => {
    router.push(detailHref);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleOpenDetail();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      draggable={draggable}
      aria-grabbed={isDragging}
      onClick={handleOpenDetail}
      onKeyDown={handleKeyDown}
      onDragStart={
        onDragStart
          ? (event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", task.id);
              onDragStart(task);
            }
          : undefined
      }
      onDragEnd={onDragEnd ? () => onDragEnd(task) : undefined}
      className={[
        "cursor-pointer rounded-[8px] border border-border bg-background px-3 py-2.5 outline-none transition-colors hover:border-foreground/20 hover:bg-surface/40 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        draggable ? "cursor-grab active:cursor-grabbing" : "",
        isDragging ? "opacity-60 shadow-[0_8px_20px_rgba(0,0,0,0.08)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          <GripVertical className="mt-[-1px] h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          <h3 className="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground">
            {task.title}
          </h3>
        </div>

        <div onClick={(event) => event.stopPropagation()}>
          <TaskActionsMenu
            taskTitle={task.title}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
          />
        </div>
      </div>

      {fieldVisibility.priority || fieldVisibility.status ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {fieldVisibility.priority ? (
            <PriorityIndicator priority={task.priority} />
          ) : null}
          {fieldVisibility.status ? (
            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
              {statusLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {fieldVisibility.members || fieldVisibility.dueDate ? (
        <div
          className={[
            "mt-2.5 flex items-center gap-3",
            fieldVisibility.members && fieldVisibility.dueDate
              ? "justify-between"
              : "justify-start",
          ].join(" ")}
        >
          {fieldVisibility.members ? (
            <MemberAvatar
              assigneeName={task.assigneeName}
              assigneeInitials={task.assigneeInitials}
              showName
            />
          ) : null}

          {fieldVisibility.dueDate ? (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {dueDate ?? "-"}
            </span>
          ) : null}
        </div>
      ) : null}

      {fieldVisibility.labels && task.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span
              key={`${task.id}-${label}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium leading-4 text-muted"
            >
              <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
