import { TaskDetailPageClient } from "@/components/tasks/TaskDetailPageClient";

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  return <TaskDetailPageClient taskId={id} />;
}
