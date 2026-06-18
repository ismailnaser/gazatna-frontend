"use client";

import { use } from "react";
import { TeacherHomeworkEditor } from "@/components/teacher/TeacherHomeworkEditor";

export default function TeacherHomeworkEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TeacherHomeworkEditor mode="edit" homeworkId={id} />;
}
