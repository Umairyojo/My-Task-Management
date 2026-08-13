import type { Task, TaskSectionModel } from "./types";

export const taskListSections: TaskSectionModel[] = [
  { key: "todo", title: "To Do" },
  { key: "doing", title: "Doing" },
  { key: "completed", title: "Completed" },
];

export const taskBoardSections: TaskSectionModel[] = [
  { key: "todo", title: "To Do" },
  { key: "doing", title: "Doing" },
  { key: "completed", title: "Completed" },
  { key: "on-hold", title: "On Hold" },
];

export const mockTasks: Task[] = [
  {
    id: "write-api-documentation",
    title: "Write API Documentation",
    status: "todo",
    priority: "high",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "12 Sep 2026",
    labels: ["API", "Docs"],
  },
  {
    id: "implement-search-function",
    title: "Implement Search Function",
    status: "todo",
    priority: "medium",
    member: {
      kind: "initials",
      initials: "CN",
    },
    dueDate: "13 Sep 2026",
    labels: ["Search", "UX"],
  },
  {
    id: "deploy-to-production",
    title: "Deploy to Production",
    status: "todo",
    priority: "low",
    member: {
      kind: "add",
    },
    dueDate: "14 Sep 2026",
    labels: ["Release"],
  },
  {
    id: "code-review-completed",
    title: "Code Review Completed",
    status: "doing",
    priority: "medium",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "15 Sep 2026",
    labels: ["Code Review"],
  },
  {
    id: "design-mockups-finalized",
    title: "Design Mockups Finalized",
    status: "doing",
    priority: "high",
    member: {
      kind: "initials",
      initials: "CN",
    },
    dueDate: "16 Sep 2026",
    labels: ["Design", "UI"],
  },
  {
    id: "feature-testing-passed",
    title: "Feature Testing Passed",
    status: "completed",
    priority: "low",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "17 Sep 2026",
    labels: ["Testing"],
  },
  {
    id: "ui-design-updated",
    title: "UI Design Updated",
    status: "completed",
    priority: "medium",
    member: {
      kind: "initials",
      initials: "CN",
    },
    dueDate: "18 Sep 2026",
    labels: ["UI"],
  },
  {
    id: "security-audit-scheduled",
    title: "Security Audit Scheduled",
    status: "completed",
    priority: "high",
    member: {
      kind: "add",
    },
    dueDate: "19 Sep 2026",
    labels: ["Security"],
  },
  {
    id: "ui-review",
    title: "UI Review",
    status: "on-hold",
    priority: "low",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "20 Sep 2026",
    labels: ["Review"],
  },
  {
    id: "backend-integration",
    title: "Backend Integration",
    status: "on-hold",
    priority: "medium",
    member: {
      kind: "initials",
      initials: "CN",
    },
    dueDate: "21 Sep 2026",
    labels: ["Backend"],
  },
  {
    id: "user-feedback",
    title: "User Feedback",
    status: "on-hold",
    priority: "low",
    member: {
      kind: "add",
    },
    dueDate: "22 Sep 2026",
    labels: ["Research"],
  },
  {
    id: "performance-tuning",
    title: "Performance Tuning",
    status: "on-hold",
    priority: "medium",
    member: {
      kind: "person",
      name: "Dexter",
      initials: "D",
    },
    dueDate: "23 Sep 2026",
    labels: ["Performance"],
  },
];
