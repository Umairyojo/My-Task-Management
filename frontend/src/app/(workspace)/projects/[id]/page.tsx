import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
