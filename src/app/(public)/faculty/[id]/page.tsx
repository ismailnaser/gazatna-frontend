import { TeacherCVClient } from "./TeacherCVClient";

export default async function TeacherCVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherCVClient id={id} />;
}
