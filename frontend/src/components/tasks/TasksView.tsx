"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  defaultTaskFilters,
  getTaskFilterOptions,
  hasActiveTaskFilters,
  taskMatchesTaskFilters,
  type TaskFilters,
} from "./task-filters";
import {
  defaultTaskFieldVisibility,
  type TaskFieldVisibility,
} from "./task-fields";
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
  TasksNoMatchState,
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

function toTaskWriteInputFromTask(
  task: Task,
  nextStatus: TaskStatus = task.status,
): TaskWriteInput {
  return {
    title: task.title,
    status: nextStatus,
    priority: task.priority,
    assigneeName: task.assigneeName ?? "",
    assigneeInitials: task.assigneeInitials ?? "",
    dueDate: task.dueDate ?? "",
    labels: task.labels,
  };
}

export function TasksView() {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters);
  const [fieldVisibility, setFieldVisibility] = useState<TaskFieldVisibility>(
    defaultTaskFieldVisibility,
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [taskFormState, setTaskFormState] = useState<TaskFormState | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const filterOptions = useMemo(() => getTaskFilterOptions(tasks), [tasks]);
  const normalizedSearchQuery = normalizeTaskSearchQuery(searchQuery);
  const hasSearchQuery = normalizedSearchQuery.length > 0;
  const hasActiveFilters = hasActiveTaskFilters(filters);
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          taskMatchesSearch(task, normalizedSearchQuery) &&
          taskMatchesTaskFilters(task, filters),
      ),
    [filters, normalizedSearchQuery, tasks],
  );
  const isCriteriaActive = hasSearchQuery || hasActiveFilters;

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

  const handleClearFilters = useCallback(() => {
    setFilters(defaultTaskFilters);
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

  const handleDragStartTask = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleDragEndTask = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  const handleMoveTask = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      const currentTask = tasks.find((task) => task.id === taskId);

      if (!currentTask || currentTask.status === nextStatus) {
        setDraggedTaskId(null);
        return;
      }

      const previousTask = currentTask;
      const optimisticTask: Task = {
        ...currentTask,
        status: nextStatus,
      };

      setTasks((current) =>
        current.map((task) => (task.id === taskId ? optimisticTask : task)),
      );
      setDraggedTaskId(null);

      try {
        const updatedTask = await updateTask(
          taskId,
          toTaskWriteInputFromTask(currentTask, nextStatus),
        );

        setTasks((current) =>
          current.map((task) => (task.id === taskId ? updatedTask : task)),
        );
      } catch (error) {
        console.error(error);
        setTasks((current) =>
          current.map((task) => (task.id === taskId ? previousTask : task)),
        );
      }
    },
    [tasks],
  );

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
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        fieldVisibility={fieldVisibility}
        onFieldVisibilityChange={setFieldVisibility}
      />

      {status === "loading" ? (
        <TasksLoadingState viewMode={viewMode} />
      ) : status === "error" ? (
        <TasksErrorState onRetry={() => void loadTasks()} />
      ) : isCriteriaActive && visibleTasks.length === 0 ? (
        <TasksNoMatchState
          message={
            hasSearchQuery && hasActiveFilters
              ? "No tasks match your search and filters."
              : hasSearchQuery
                ? "No tasks match your search."
                : "No tasks match your current filters."
          }
          actions={[
            ...(hasSearchQuery
              ? [{ label: "Clear search", onAction: handleClearSearch }]
              : []),
            ...(hasActiveFilters
              ? [{ label: "Clear filters", onAction: handleClearFilters }]
              : []),
          ]}
        />
      ) : tasks.length === 0 ? (
        <TasksEmptyState />
      ) : viewMode === "list" ? (
        <TaskListView
          tasks={visibleTasks}
          onAddTask={openCreateTask}
          onEditTask={openEditTask}
          onDeleteTask={openDeleteTask}
          hideEmptySections={isCriteriaActive}
          fieldVisibility={fieldVisibility}
        />
      ) : (
          <TaskBoardView
            tasks={visibleTasks}
            onAddTask={openCreateTask}
            onEditTask={openEditTask}
            onDeleteTask={openDeleteTask}
            draggedTaskId={draggedTaskId}
            hideEmptySections={isCriteriaActive}
            fieldVisibility={fieldVisibility}
            onDragStartTask={handleDragStartTask}
            onDragEndTask={handleDragEndTask}
            onMoveTask={(taskId, nextStatus) => {
              void handleMoveTask(taskId, nextStatus);
            }}
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
