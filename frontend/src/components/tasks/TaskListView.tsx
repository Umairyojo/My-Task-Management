import { mockTasks, taskSections } from "./mock-tasks";
import { TaskSection } from "./TaskSection";
import { TaskToolbar } from "./TaskToolbar";

export function TaskListView() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5">
      <TaskToolbar />

      <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
        <div className="flex w-full min-w-[760px] flex-col gap-3">
          {taskSections.map((section) => (
            <TaskSection key={section.key} title={section.title} tasks={mockTasks} />
          ))}
        </div>
      </div>
    </div>
  );
}
