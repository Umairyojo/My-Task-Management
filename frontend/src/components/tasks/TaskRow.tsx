import { MoreHorizontal } from "lucide-react";
import type { Task } from "./types";
import { MemberAvatar } from "./MemberAvatar";
import { PriorityIndicator } from "./PriorityIndicator";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  return (
    <tr className="border-t border-border first:border-t-0 hover:bg-surface/40">
      <td className="px-4 py-2.5 align-middle">
        <span className="block truncate text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </span>
      </td>
      <td className="px-4 py-2.5 align-middle">
        <PriorityIndicator priority={task.priority} />
      </td>
      <td className="px-4 py-2.5 align-middle">
        <MemberAvatar member={task.member} />
      </td>
      <td className="px-4 py-2.5 align-middle">
        <span className="text-[12px] leading-4 text-muted">{task.dueDate}</span>
      </td>
      <td className="px-4 py-2.5 align-middle text-right">
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Task actions</span>
        </button>
      </td>
    </tr>
  );
}
