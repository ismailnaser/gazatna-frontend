import { TeacherMaterialEditor } from "@/components/teacher/TeacherMaterialEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeacherMaterialEditPage({ params }: Props) {
  const { id } = await params;
  return <TeacherMaterialEditor mode="edit" materialId={id} />;
}
