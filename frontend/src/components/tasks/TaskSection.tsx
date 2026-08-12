import { ChevronDown } from "lucide-react";
import type { Task } from "./types";
import { TaskTable } from "./TaskTable";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
}

export function TaskSection({ title, tasks }: TaskSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex h-8 items-center gap-1.5 rounded-md px-1 text-[13px] font-medium text-foreground">
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      <TaskTable tasks={tasks} />
    </section>
  );
}
