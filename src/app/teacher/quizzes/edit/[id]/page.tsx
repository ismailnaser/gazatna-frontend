import { TeacherQuizEditor } from "@/components/teacher/TeacherQuizEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeacherQuizEditPage({ params }: Props) {
  const { id } = await params;
  return <TeacherQuizEditor mode="edit" quizId={id} />;
}
