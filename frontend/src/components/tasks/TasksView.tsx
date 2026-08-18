"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Task, TaskStatus, TaskViewMode } from "./types";
import { TaskBoardView } from "./TaskBoardView";
import { TaskDeleteDialog } from "./TaskDeleteDialog";
import { TaskFormDialog, type TaskFormValues } from "./TaskFormDialog";
import { TaskListView } from "./TaskListView";
import { TaskToolbar } from "./TaskToolbar";
import {
  normalizeTaskSearchQuery,
  taskMatchesSearch,
} from "./task-search";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type TaskWriteInput,
} from "@/services/tasks-api";
import {
  TasksEmptyState,
  TasksErrorState,
  TasksLoadingState,
} from "./TasksStates";

type TaskFormState =
  | { mode: "create"; status: TaskStatus }
  | { mode: "edit"; task: Task };

function parseLabels(labels: string): string[] {
  return labels
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

function toTaskWriteInput(values: TaskFormValues): TaskWriteInput {
  return {
    title: values.title,
    status: values.status,
    priority: values.priority,
    assigneeName: values.assigneeName,
    assigneeInitials: values.assigneeInitials,
    dueDate: values.dueDate,
    labels: parseLabels(values.labels),
  };
}

export function TasksView() {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [taskFormState, setTaskFormState] = useState<TaskFormState | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const requestIdRef = useRef(0);

  const normalizedSearchQuery = normalizeTaskSearchQuery(searchQuery);
  const hasSearchQuery = normalizedSearchQuery.length > 0;
  const filteredTasks = hasSearchQuery
    ? tasks.filter((task) => taskMatchesSearch(task, normalizedSearchQuery))
    : tasks;

  const loadTasks = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus("loading");

    try {
      const nextTasks = await getTasks();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setTasks(nextTasks);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(error);
      setStatus("error");
    }
  }, []);

  const openCreateTask = useCallback((taskStatus: TaskStatus = "todo") => {
    setTaskFormState({ mode: "create", status: taskStatus });
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setTaskFormState({ mode: "edit", task });
  }, []);

  const openDeleteTask = useCallback((task: Task) => {
    setDeleteTaskTarget(task);
  }, []);

  const closeTaskForm = useCallback(() => {
    setTaskFormState(null);
  }, []);

  const closeDeleteTask = useCallback(() => {
    setDeleteTaskTarget(null);
  }, []);

  const handleSearchOpenChange = useCallback((open: boolean) => {
    setIsSearchOpen(open);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchOpen(false);
  }, []);

  const handleTaskFormSubmit = useCallback(
    async (values: TaskFormValues) => {
      const input = toTaskWriteInput(values);

      if (taskFormState?.mode === "edit") {
        const updatedTask = await updateTask(taskFormState.task.id, input);

        setTasks((current) =>
          current.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        );
      } else {
        const createdTask = await createTask(input);

        setTasks((current) => [...current, createdTask]);
      }

      setStatus("ready");
    },
    [taskFormState],
  );

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskTarget) {
      return;
    }

    await deleteTask(deleteTaskTarget.id);

    setTasks((current) =>
      current.filter((task) => task.id !== deleteTaskTarget.id),
    );
    setStatus("ready");
  }, [deleteTaskTarget]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const isSearchInput = target.closest("[data-task-search-input='true']");
      const isEditableField = target.closest(
        "input, textarea, select, [contenteditable='true']",
      );

      if (isEditableField && !isSearchInput) {
        return;
      }

      event.preventDefault();
      setIsSearchOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5">
      <TaskToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddTask={() => openCreateTask()}
        searchQuery={searchQuery}
        isSearchOpen={isSearchOpen || hasSearchQuery}
        onSearchOpenChange={handleSearchOpenChange}
        onSearchQueryChange={handleSearchQueryChange}
        onClearSearch={handleClearSearch}
      />

      {status === "loading" ? (
        <TasksLoadingState viewMode={viewMode} />
      ) : status === "error" ? (
        <TasksErrorState onRetry={() => void loadTasks()} />
      ) : tasks.length === 0 ? (
        <TasksEmptyState />
      ) : hasSearchQuery && filteredTasks.length === 0 ? (
        <TasksEmptyState
          message="No tasks match your search."
          actionLabel="Clear Search"
          onAction={handleClearSearch}
        />
      ) : viewMode === "list" ? (
        <TaskListView
          tasks={filteredTasks}
          onAddTask={openCreateTask}
          onEditTask={openEditTask}
          onDeleteTask={openDeleteTask}
          hideEmptySections={hasSearchQuery}
        />
      ) : (
        <TaskBoardView
          tasks={filteredTasks}
          onAddTask={openCreateTask}
          onEditTask={openEditTask}
          onDeleteTask={openDeleteTask}
        />
      )}

      <TaskFormDialog
        key={
          taskFormState
            ? `${taskFormState.mode}-${
                taskFormState.mode === "edit"
                  ? taskFormState.task.id
                  : taskFormState.status
              }`
            : "task-form-closed"
        }
        open={taskFormState !== null}
        mode={taskFormState?.mode ?? "create"}
        defaultStatus={
          taskFormState?.mode === "create" ? taskFormState.status : "todo"
        }
        task={taskFormState?.mode === "edit" ? taskFormState.task : undefined}
        onClose={closeTaskForm}
        onSubmit={handleTaskFormSubmit}
      />

      <TaskDeleteDialog
        key={deleteTaskTarget?.id ?? "task-delete-closed"}
        open={deleteTaskTarget !== null}
        taskTitle={deleteTaskTarget?.title ?? ""}
        onClose={closeDeleteTask}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
