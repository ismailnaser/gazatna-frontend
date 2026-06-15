import type { ClassTab } from "@/components/teacher/ClassDetailTabs";
import { ClassDetailClient } from "./ClassDetailClient";

function parseTab(value: string | undefined): ClassTab {
  if (value === "homework" || value === "quizzes") return value;
  return "grades";
}

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  return <ClassDetailClient classId={id} activeTab={parseTab(tab)} />;
}
