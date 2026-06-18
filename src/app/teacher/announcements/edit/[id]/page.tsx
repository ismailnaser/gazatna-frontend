import { TeacherAnnouncementEditor } from "@/components/teacher/TeacherAnnouncementEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeacherAnnouncementEditPage({ params }: Props) {
  const { id } = await params;
  return <TeacherAnnouncementEditor mode="edit" announcementId={id} />;
}
