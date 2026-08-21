"use client";

import Link from "next/link";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { isHomeworkMissed } from "@/components/parent/HomeworkWindowBanner";
import { SubjectCardShell, SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { downloadMediaFile, resolveMediaUrl } from "@/lib/media";
import { getQuizPhase } from "@/lib/quiz-timing";
import { quizAttemptLabel } from "@/lib/quizAttempts";
import type { ParentChild, ParentSubjectDetail, ParentSubjectItem } from "@/types";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FolderOpen,
  Megaphone,
  Paperclip,
  PenLine,
  Play,
} from "lucide-react";

const phaseLabels = {
  upcoming: { label: "لم يبدأ بعد", variant: "warning" as const },
  open: { label: "متاح الآن", variant: "success" as const },
  closed: { label: "منتهي", variant: "default" as const },
};

function formatCardDate(value: string) {
  return new Date(value).toLocaleDateString("ar-PS", {
    day: "numeric",
    month: "short",
  });
}

function SubjectItemRow({
  item,
  child,
  getHomeworkSubmission,
  getQuizSubmission,
}: {
  item: ParentSubjectItem;
  child: ParentChild;
  getHomeworkSubmission: ReturnType<typeof useAssignments>["getHomeworkSubmission"];
  getQuizSubmission: ReturnType<typeof useAssignments>["getQuizSubmission"];
}) {
  const dateLabel = formatCardDate(item.createdAt);

  if (item.kind === "homework") {
    const hw = item.homework;
    const submission = getHomeworkSubmission(hw.id, child.studentId);
    const missed = isHomeworkMissed(hw, submission);
    const endAt = hw.endAt || hw.dueDate;

    const statusBadge = submission ? (
      <Badge variant="success">
        <CheckCircle2 className="me-1 inline h-3 w-3" />
        مُسلّم
      </Badge>
    ) : missed ? (
      <Badge variant="danger">فائت</Badge>
    ) : hw.windowStatus === "active" ? (
      <Badge variant="success">نشط</Badge>
    ) : hw.windowStatus === "scheduled" ? (
      <Badge variant="warning">لم يبدأ</Badge>
    ) : (
      <Badge variant="default">منتهٍ</Badge>
    );

    return (
      <SubjectCardShell
        tone="homework"
        icon={PenLine}
        dateLabel={dateLabel}
        title={hw.title}
        description={hw.description}
        href={`/parent/homework/${hw.id}`}
        meta={
          <>
            {missed && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                فائت — انتهى الموعد دون تسليم
              </p>
            )}
            <SubjectMetaGrid
              items={[
                { label: "البداية", dateTime: hw.startAt ?? hw.dueDate },
                { label: "النهاية", dateTime: endAt },
              ]}
            />
          </>
        }
        footer={
          <>
            {statusBadge}
            <ChevronRight className="h-5 w-5 text-p-black/30" />
          </>
        }
      />
    );
  }

  if (item.kind === "announcement") {
    const ann = item.announcement;
    return (
      <SubjectCardShell
        tone="announcement"
        icon={Megaphone}
        dateLabel={dateLabel}
        title={ann.title}
        description={ann.body}
        footer={
          ann.teacherName ? (
            <p className="text-xs text-p-black/72">المعلم: {ann.teacherName}</p>
          ) : undefined
        }
      />
    );
  }

  if (item.kind === "material") {
    const mat = item.material;
    return (
      <SubjectCardShell
        tone="material"
        icon={FolderOpen}
        typeLabel={mat.categoryLabel ?? mat.category ?? "مرفق"}
        dateLabel={dateLabel}
        title={mat.title}
        description={mat.description}
        meta={
          (mat.attachments?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {mat.attachments!.map((att) => {
                const url = resolveMediaUrl(att.url);
                if (!url) return null;
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-brand-blue transition-colors hover:text-brand-blue/80"
                    >
                      <Paperclip className="h-4 w-4 shrink-0" />
                      <span className="truncate">{att.name}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => void downloadMediaFile(url, att.name)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-blue transition-colors hover:bg-brand-blue/10"
                      aria-label={`تحميل ${att.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : undefined
        }
        footer={
          mat.teacherName ? (
            <p className="text-xs text-p-black/72">المعلم: {mat.teacherName}</p>
          ) : undefined
        }
      />
    );
  }

  const quiz = item.kind === "quiz" ? item.quiz : null;
  if (!quiz) return null;

  const submission = getQuizSubmission(quiz.id, child.studentId);
  const phase = getQuizPhase(quiz);
  const canRetake = Boolean(quiz.canRetake);
  const displayPhase = submission && !canRetake ? "closed" : phase;
  const meta = phaseLabels[displayPhase];
  const canReview = Boolean(submission && quiz.reviewAllowed);
  const endAt = quiz.endAt || quiz.dueDate;
  const attemptInfo = quizAttemptLabel(quiz);
  const canStart = phase === "open" && (canRetake || !submission);

  let statusBadge: React.ReactNode;
  let action: React.ReactNode = null;

  if (submission) {
    if (canReview) {
      statusBadge = <Badge variant="info">اضغط لمراجعة الإجابات</Badge>;
    } else if (submission.fullyGraded && submission.score != null) {
      statusBadge = (
        <Badge variant="success">
          {submission.score}/{submission.maxScore}
        </Badge>
      );
    } else if (submission.needsManualGrading) {
      statusBadge = <Badge variant="warning">بانتظار تصحيح المعلم</Badge>;
    } else {
      statusBadge = (
        <Badge variant="success">
          <CheckCircle2 className="me-1 inline h-3 w-3" />
          مُسلّم
        </Badge>
      );
    }
    if (attemptInfo) {
      statusBadge = (
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge}
          <Badge variant="default">{attemptInfo}</Badge>
        </div>
      );
    }
  } else {
    statusBadge = <Badge variant={meta.variant}>{meta.label}</Badge>;
  }

  if (canStart) {
    action = (
      <Link href={`/parent/quizzes/${quiz.id}`}>
        <Button className="px-3 py-1.5 text-sm">
          <Play className="h-4 w-4" />
          {submission ? "محاولة مجدداً" : "ابدأ"}
        </Button>
      </Link>
    );
  }

  return (
    <SubjectCardShell
      tone="quiz"
      icon={ClipboardList}
      dateLabel={dateLabel}
      title={quiz.title}
      description={quiz.description}
      href={canReview ? `/parent/quizzes/${quiz.id}/review` : undefined}
      meta={
        <SubjectMetaGrid
          items={[
            { label: "البداية", dateTime: quiz.startAt },
            { label: "النهاية", dateTime: endAt },
          ]}
        />
      }
      footer={
        <>
          {statusBadge}
          {action}
        </>
      }
    />
  );
}

const KIND_CARDS = [
  { kind: "homework" as const, title: "مهام الواجب", description: "مهامك الصغيرة داخل المادة.", icon: PenLine, tone: "warning" as const },
  { kind: "quiz" as const, title: "تحديات الاختبار", description: "اختبر نفسك واجمع النقاط.", icon: ClipboardList, tone: "default" as const },
  { kind: "announcement" as const, title: "رسائل المعلم", description: "كلام المعلم لهالمادة.", icon: Megaphone, tone: "default" as const },
  { kind: "material" as const, title: "صندوق الكنوز", description: "كتب وشرائح ومصادر ملوّنة.", icon: FolderOpen, tone: "success" as const },
];

export default function ParentSubjectPage(props: { params: Promise<{ subject: string }> }) {
  return (
    <Suspense fallback={<WorkspacePage title="محتوى المادة" loading />}>
      <ParentSubjectAssignmentsPage {...props} />
    </Suspense>
  );
}

function ParentSubjectAssignmentsPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  const decodedSubject = decodeURIComponent(subject);
  const searchParams = useSearchParams();
  const kind = searchParams.get("kind");
  const { user } = useAuth();
  const [child, setChild] = useState<ParentChild | undefined>();
  const [detail, setDetail] = useState<ParentSubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { getHomeworkSubmission, getQuizSubmission } = useAssignments();

  useEffect(() => {
    if (user) {
      api.getParentChild().then((c) => setChild(c as ParentChild)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    api
      .getParentSubjectDetail(decodedSubject)
      .then((data) => setDetail(data as ParentSubjectDetail))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [decodedSubject]);

  const counts = useMemo(() => {
    const items = detail?.items ?? [];
    return {
      homework: items.filter((item) => item.kind === "homework").length,
      quiz: items.filter((item) => item.kind === "quiz").length,
      announcement: items.filter((item) => item.kind === "announcement").length,
      material: items.filter((item) => item.kind === "material").length,
    };
  }, [detail]);

  const filteredItems = useMemo(() => {
    if (!detail || !kind) return [];
    return detail.items.filter((item) => item.kind === kind);
  }, [detail, kind]);

  const kindLabel = KIND_CARDS.find((card) => card.kind === kind)?.title;
  const subjectPath = `/parent/homework/subject/${encodeURIComponent(decodedSubject)}`;

  if (!child && !loading) {
    return <p className="text-neutral-700">لم يتم ربط حسابك بملف طالب.</p>;
  }

  return (
    <WorkspacePage
      title={decodedSubject}
      description={
        detail?.teacherName
          ? `المعلم: ${detail.teacherName}`
          : `محتوى المادة — ${child?.name ?? ""}`
      }
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "مهام المغامرة", href: "/parent/homework" },
        { label: decodedSubject, href: kind ? subjectPath : undefined },
        ...(kindLabel ? [{ label: kindLabel }] : []),
      ]}
      loading={loading}
    >
      {!detail || detail.items.length === 0 ? (
        <EmptyState title="لا يوجد محتوى في هذه المادة بعد." />
      ) : !kind ? (
        <HubGrid>
          {KIND_CARDS.map((card) => (
            <HubCard
              key={card.kind}
              href={`${subjectPath}?kind=${card.kind}`}
              icon={card.icon}
              title={card.title}
              description={card.description}
              tone={card.tone}
              meta={`${counts[card.kind]} عنصر`}
            />
          ))}
        </HubGrid>
      ) : filteredItems.length === 0 ? (
        <EmptyState title="لا يوجد محتوى في هذا القسم بعد." />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <SubjectItemRow
              key={`${item.kind}-${
                item.kind === "homework"
                  ? item.homework.id
                  : item.kind === "quiz"
                    ? item.quiz.id
                    : item.kind === "announcement"
                      ? item.announcement.id
                      : item.material.id
              }`}
              item={item}
              child={child!}
              getHomeworkSubmission={getHomeworkSubmission}
              getQuizSubmission={getQuizSubmission}
            />
          ))}
        </div>
      )}
    </WorkspacePage>
  );
}
