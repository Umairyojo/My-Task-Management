import type { Task, TaskSectionModel } from "./types";

export const taskSections: TaskSectionModel[] = [
  { key: "todo", title: "To Do" },
  { key: "doing", title: "Doing" },
  { key: "completed", title: "Completed" },
];

export const mockTasks: Task[] = [
  {
    id: "design-homepage",
    title: "Design Homepage",
    status: "todo",
    priority: "high",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "12 Sep 2026",
  },
  {
    id: "develop-login-feature",
    title: "Develop Login Feature",
    status: "doing",
    priority: "low",
    member: {
      kind: "initials",
      initials: "CN",
    },
    dueDate: "15 Sep 2026",
  },
  {
    id: "test-payment-gateway",
    title: "Test Payment Gateway",
    status: "completed",
    priority: "medium",
    member: {
      kind: "add",
    },
    dueDate: "18 Sep 2026",
  },
];
