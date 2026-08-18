import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return <ProjectDetailView projectId={params.id} />;
}
