import { Plus } from "lucide-react";
import type { Task } from "./types";
import { TaskRow } from "./TaskRow";

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-background">
      <table className="min-w-full border-collapse">
        <thead className="bg-surface">
          <tr className="text-left text-[12px] font-medium text-muted">
            <th className="w-[46%] px-4 py-2.5 font-medium">Task</th>
            <th className="w-[16%] px-4 py-2.5 font-medium">Priority</th>
            <th className="w-[18%] px-4 py-2.5 font-medium">Members</th>
            <th className="w-[14%] px-4 py-2.5 font-medium">Due Date</th>
            <th className="w-[6%] px-4 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border">
            <td colSpan={5} className="px-4 py-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Task
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
