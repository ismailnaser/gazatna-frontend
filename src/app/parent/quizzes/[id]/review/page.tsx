import { ParentQuizReviewClient } from "./ParentQuizReviewClient";

export default async function ParentQuizReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ParentQuizReviewClient quizId={id} />;
}
