import { redirect } from "next/navigation";

export default async function AdminStudentIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/students");
}
