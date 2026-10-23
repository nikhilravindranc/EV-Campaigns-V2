import type { Metadata } from "next";
import { WorkflowRoute } from "@/components/workflows/workflows";

export const metadata: Metadata = { title: "Workflow" };

export default async function WorkflowPage({ params, searchParams }: PageProps<"/workflows/[workflowId]">) {
  const { workflowId } = await params;
  const { template } = await searchParams;
  return <WorkflowRoute id={decodeURIComponent(workflowId)} template={typeof template === "string" ? template : undefined} />;
}
