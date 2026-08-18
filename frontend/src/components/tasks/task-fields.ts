export type TaskFieldKey = "priority" | "members" | "dueDate" | "labels" | "status";

export interface TaskFieldVisibility {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
}

export const defaultTaskFieldVisibility: TaskFieldVisibility = {
  priority: true,
  members: true,
  dueDate: true,
  labels: true,
  status: true,
};

export const taskFieldOptions: Array<{ key: TaskFieldKey; label: string }> = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
];
