import { ParentQuizTakeClient } from "./ParentQuizTakeClient";

export default async function ParentQuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ParentQuizTakeClient quizId={id} />;
}
