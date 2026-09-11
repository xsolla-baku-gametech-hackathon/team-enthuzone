import { WorkspaceDashboard } from "@/components/workspace-dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceDashboard section="issues" issueId={id} />;
}
