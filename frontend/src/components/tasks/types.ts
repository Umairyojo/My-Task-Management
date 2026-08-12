export type TaskStatus = "todo" | "doing" | "completed";

export type TaskPriority = "high" | "medium" | "low";

export type TaskMember =
  | {
      kind: "person";
      name: string;
      initials: string;
    }
  | {
      kind: "initials";
      initials: string;
    }
  | {
      kind: "add";
    };

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  member: TaskMember;
  dueDate: string;
}

export interface TaskSectionModel {
  key: TaskStatus;
  title: string;
}
