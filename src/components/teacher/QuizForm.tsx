"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { ClassSelect, getSelectedClassIds } from "@/components/teacher/ClassSelect";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { validateFinalNumber } from "@/lib/numberInput";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import { toDatetimeLocalValue } from "@/lib/quiz-timing";
import type { MatchingPair, QuestionType, Quiz, QuizQuestion } from "@/types";
import type { SchoolClass } from "@/types/teacher";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "choice", label: "اختيار من متعدد" },
  { value: "true_false", label: "صح أو خطأ" },
  { value: "essay", label: "مقالي" },
  { value: "term", label: "مصطلح علمي" },
  { value: "matching", label: "توصيل" },
];

export type QuizFormData = {
  classIds?: string[];
  subject: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  maxAttempts: number;
  gradesVisible: boolean;
  reviewAllowed: boolean;
  status: Quiz["status"];
  questions: QuizQuestion[];
};

function newQuestionId() {
  return `qq${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyQuestion(type: QuestionType = "choice"): QuizQuestion {
  const base = {
    id: newQuestionId(),
    prompt: "",
    questionType: type,
    points: 1,
  };
  if (type === "true_false") {
    return { ...base, options: ["صح", "خطأ"], correctIndex: 0 };
  }
  if (type === "choice") {
    return { ...base, options: ["", "", "", ""], correctIndex: 0 };
  }
  if (type === "term") {
    return { ...base, options: [], correctText: "", correctIndex: null };
  }
  if (type === "essay") {
    return { ...base, options: [], correctIndex: null };
  }
  return {
    ...base,
    options: [],
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
    correctIndex: null,
  };
}

export function buildQuizPayload(
  data: QuizFormData,
  options?: { applyToGroup?: boolean; syncClasses?: boolean }
) {
  const maxScore = quizTotalPoints(data.questions);
  const payload: Record<string, unknown> = {
    subject: data.subject,
    title: data.title,
    description: data.description,
    dueDate: data.endAt.slice(0, 10),
    startAt: new Date(data.startAt).toISOString(),
    endAt: new Date(data.endAt).toISOString(),
    durationMinutes: data.durationMinutes,
    maxAttempts: data.maxAttempts,
    gradesVisible: data.gradesVisible,
    reviewAllowed: data.reviewAllowed,
    status: data.status,
    maxScore,
    questions: data.questions.map((q) => ({
      prompt: q.prompt,
      questionType: q.questionType,
      points: q.points,
      options: q.options,
      correctIndex: q.correctIndex,
      correctText: q.correctText ?? "",
      pairs: q.pairs ?? [],
    })),
  };
  if (data.classIds?.length) {
    payload.classIds = data.classIds;
    if (options?.syncClasses) payload.syncClasses = true;
  }
  if (options?.applyToGroup) payload.applyToGroup = true;
  return payload;
}

function validateQuestion(q: QuizQuestion): string | null {
  if (!q.prompt.trim()) return "نص السؤال مطلوب";
  if ((q.points ?? 0) <= 0) return "درجة السؤال يجب أن تكون أكبر من صفر";

  if (q.questionType === "choice") {
    if (!q.options.length || q.options.some((o) => !o.trim())) {
      return "أكمل جميع خيارات السؤال";
    }
    if (q.correctIndex == null) return "حدد الإجابة الصحيحة";
  }
  if (q.questionType === "true_false" && q.correctIndex == null) {
    return "حدد الإجابة الصحيحة";
  }
  if (q.questionType === "term" && !q.correctText?.trim()) {
    return "أدخل المصطلح الصحيح";
  }
  if (q.questionType === "matching") {
    const pairs = q.pairs ?? [];
    if (pairs.length < 2) return "أضف زوجين توصيل على الأقل";
    if (pairs.some((p) => !p.left.trim() || !p.right.trim())) {
      return "أكمل جميع أزواج التوصيل";
    }
  }
  return null;
}

function toInputDatetime(value?: string | null) {
  if (!value) return "";
  return toDatetimeLocalValue(value);
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-bold text-p-black">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-p-black/50">{description}</p>}
      </header>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">{children}</div>
    </section>
  );
}

export function QuizForm({
  initial,
  classes,
  subjects = [],
  showClassSelect = false,
  defaultSelected,
  embedded = false,
  onSubmit,
  onCancel,
}: {
  initial?: Quiz & { targets?: { classId: string }[] };
  classes?: SchoolClass[];
  subjects?: string[];
  showClassSelect?: boolean;
  defaultSelected?: string[];
  embedded?: boolean;
  onSubmit: (data: QuizFormData) => void;
  onCancel: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (initial?.questions?.length) {
      return initial.questions.map((q) => ({
        ...emptyQuestion(q.questionType ?? "choice"),
        ...q,
        questionType: q.questionType ?? "choice",
        points: q.points ?? 1,
        options: q.options ?? [],
        pairs: q.pairs ?? [],
      }));
    }
    return [emptyQuestion()];
  });
  const [durationMinutes, setDurationMinutes] = useState(
    String(initial?.durationMinutes ?? 15)
  );
  const [maxAttempts, setMaxAttempts] = useState(String(initial?.maxAttempts ?? 1));
  const [pointsByQuestion, setPointsByQuestion] = useState<Record<string, string>>({});

  const totalPoints = useMemo(() => quizTotalPoints(questions), [questions]);

  const pointsFieldConfig = {
    min: 0.5,
    max: 500,
    allowDecimal: true,
    maxDecimalPlaces: 1,
  } as const;

  function commitQuestionPoints(id: string, draft: string) {
    const err = validateFinalNumber(draft, pointsFieldConfig);
    const final = err ? "1" : draft;
    setPointsByQuestion((prev) => ({ ...prev, [id]: final }));
    updateQuestion(id, { points: Number(final) });
  }

  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function changeQuestionType(id: string, type: QuestionType) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...emptyQuestion(type), id: q.id, prompt: q.prompt } : q))
    );
    setPointsByQuestion((prev) => ({ ...prev, [id]: "1" }));
  }

  function updateOption(qId: string, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIndex ? value : o)) }
          : q
      )
    );
  }

  function updatePair(qId: string, pairIndex: number, patch: Partial<MatchingPair>) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const pairs = [...(q.pairs ?? [])];
        pairs[pairIndex] = { ...pairs[pairIndex], ...patch };
        return { ...q, pairs };
      })
    );
  }

  function addPair(qId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, pairs: [...(q.pairs ?? []), { left: "", right: "" }] } : q
      )
    );
  }

  function removePair(qId: string, pairIndex: number) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const pairs = (q.pairs ?? []).filter((_, i) => i !== pairIndex);
        return { ...q, pairs: pairs.length ? pairs : [{ left: "", right: "" }] };
      })
    );
  }

  function addQuestion() {
    const q = emptyQuestion();
    setQuestions((prev) => [...prev, q]);
    setPointsByQuestion((prev) => ({ ...prev, [q.id]: "1" }));
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => (prev.length <= 1 ? prev : prev.filter((q) => q.id !== id)));
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const normalizedQuestions = questions.map((q) => {
      const draft = pointsByQuestion[q.id] ?? String(q.points);
      const parsed = Number(draft);
      return {
        ...q,
        points: draft === "" || draft === "." || !Number.isFinite(parsed) ? 0 : parsed,
      };
    });
    for (const q of normalizedQuestions) {
      const err = validateQuestion(q);
      if (err) {
        alert(err);
        return;
      }
    }
    const startAtRaw = form.get("startAt") as string;
    const endAtRaw = form.get("endAt") as string;
    if (new Date(endAtRaw) <= new Date(startAtRaw)) {
      alert("موعد نهاية الاختبار يجب أن يكون بعد موعد البداية.");
      return;
    }
    const classIds = showClassSelect ? getSelectedClassIds(form) : undefined;
    if (showClassSelect && (!classIds || classIds.length === 0)) {
      alert("اختر فصلاً واحداً على الأقل.");
      return;
    }
    onSubmit({
      classIds,
      subject: String(form.get("subject") ?? ""),
      title: form.get("title") as string,
      description: form.get("description") as string,
      startAt: new Date(startAtRaw).toISOString(),
      endAt: new Date(endAtRaw).toISOString(),
      durationMinutes: Number(durationMinutes),
      maxAttempts: Number(maxAttempts),
      gradesVisible: form.get("gradesVisible") === "on",
      reviewAllowed: form.get("reviewAllowed") === "on",
      status: form.get("status") as Quiz["status"],
      questions: normalizedQuestions,
    });
  }

  const defaultStart = initial?.startAt
    ? toInputDatetime(initial.startAt)
    : toInputDatetime(new Date().toISOString());
  const defaultEnd = initial?.endAt
    ? toInputDatetime(initial.endAt)
    : toInputDatetime(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());

  const selectedClassIds =
    defaultSelected ?? initial?.targets?.map((t) => t.classId) ?? (initial?.classId ? [initial.classId] : undefined);

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showClassSelect && classes && classes.length > 0 && (
        <FormSection
          title="الفصول المستهدفة"
          description={
            initial
              ? "يمكنك إضافة أو إزالة الفصول. لا يمكن إزالة فصل فيه تسليمات."
              : "يُنشأ نسخة من الاختبار لكل فصل تحدده."
          }
        >
          <ClassSelect
            classes={classes}
            multiple
            defaultSelected={selectedClassIds}
            defaultValue={!selectedClassIds?.length ? initial?.classId : undefined}
          />
        </FormSection>
      )}

      <FormSection title="المادة والمحتوى" description="معلومات الاختبار الأساسية للطلاب.">
        <Select
          label="المادة"
          name="subject"
          required
          defaultValue={initial?.subject ?? subjects[0] ?? "عام"}
          options={
            subjects.length
              ? subjects.map((s) => ({ value: s, label: s }))
              : [{ value: "عام", label: "عام" }]
          }
        />
        <Input label="عنوان الاختبار" name="title" required defaultValue={initial?.title} />
        <Textarea
          label="وصف مختصر"
          name="description"
          defaultValue={initial?.description}
          placeholder="تعليمات أو ملاحظات للطلاب قبل بدء الاختبار..."
        />
      </FormSection>

      <FormSection
        title="مواعيد الاختبار"
        description="يفتح الاختبار عند البداية ويُغلق عند النهاية. مدة المحاولة لكل طالب منفصلة."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="يبدأ في"
            name="startAt"
            type="datetime-local"
            required
            defaultValue={defaultStart}
          />
          <Input
            label="ينتهي في"
            name="endAt"
            type="datetime-local"
            required
            defaultValue={defaultEnd}
          />
          <NumberFieldWithKeypad
            fieldId="durationMinutes"
            label="مدة المحاولة (بالدقائق)"
            name="durationMinutes"
            value={durationMinutes}
            onChange={setDurationMinutes}
            min={1}
            max={180}
            required
          />
          <NumberFieldWithKeypad
            fieldId="maxAttempts"
            label="عدد المحاولات المسموحة"
            name="maxAttempts"
            value={maxAttempts}
            onChange={setMaxAttempts}
            min={1}
            max={20}
            required
          />
        </div>
      </FormSection>

      <FormSection title="الإعدادات والظهور">
        <Select
          label="الحالة"
          name="status"
          defaultValue={initial?.status ?? "active"}
          options={[
            { value: "active", label: "نشط (حسب الموعد)" },
            { value: "closed", label: "مغلق يدوياً" },
          ]}
        />
        <label className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3 text-sm text-p-black/80">
          <input
            type="checkbox"
            name="gradesVisible"
            defaultChecked={initial?.gradesVisible}
            className="mt-0.5 rounded text-brand-blue"
          />
          <span>إظهار العلامة للطالب في صفحة التقييمات</span>
        </label>
        <label className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3 text-sm text-p-black/80">
          <input
            type="checkbox"
            name="reviewAllowed"
            defaultChecked={initial?.reviewAllowed}
            className="mt-0.5 rounded text-brand-blue"
          />
          <span>السماح للطالب بمراجعة الإجابات والأخطاء بعد التسليم</span>
        </label>
      </FormSection>

      <FormSection
        title="أسئلة الاختبار"
        description={`مجموع درجات الاختبار: ${totalPoints}`}
      >
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div
              key={q.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/50"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2.5">
                <span className="text-xs font-bold text-brand-blue">السؤال {qi + 1}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1"
                    disabled={qi === 0}
                    onClick={() => moveQuestion(q.id, -1)}
                    aria-label="تحريك لأعلى"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1"
                    disabled={qi === questions.length - 1}
                    onClick={() => moveQuestion(q.id, 1)}
                    aria-label="تحريك لأسفل"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="px-2 py-1"
                    disabled={questions.length <= 1}
                    onClick={() => removeQuestion(q.id)}
                    aria-label="حذف السؤال"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <div className="space-y-3 p-3 sm:p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="نوع السؤال"
                    value={q.questionType}
                    onChange={(e) => changeQuestionType(q.id, e.target.value as QuestionType)}
                    options={QUESTION_TYPE_OPTIONS}
                  />
                  <NumberFieldWithKeypad
                    fieldId={`points-${q.id}`}
                    label="درجة السؤال"
                    value={pointsByQuestion[q.id] ?? String(q.points)}
                    onChange={(next) => {
                      setPointsByQuestion((prev) => ({ ...prev, [q.id]: next }));
                      if (next !== "" && next !== ".") {
                        const n = Number(next);
                        if (Number.isFinite(n)) updateQuestion(q.id, { points: n });
                      }
                    }}
                    onDeactivate={(draft) => commitQuestionPoints(q.id, draft)}
                    min={0}
                    max={500}
                    allowDecimal
                    maxDecimalPlaces={1}
                    required
                  />
                </div>

                <Textarea
                  label="نص السؤال"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                  className="min-h-[80px]"
                  required
                />

                {(q.questionType === "choice" || q.questionType === "true_false") && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestion(q.id, { correctIndex: oi })}
                          className="text-brand-blue"
                          title="الإجابة الصحيحة"
                        />
                        {q.questionType === "choice" ? (
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            placeholder={`الخيار ${oi + 1}`}
                            required
                            className="flex-1 py-2"
                          />
                        ) : (
                          <span className="text-sm font-medium text-neutral-800">{opt}</span>
                        )}
                      </div>
                    ))}
                    {q.questionType === "choice" && (
                      <p className="mt-2 text-xs text-neutral-500 sm:col-span-2">
                        حدّد الإجابة الصحيحة بالضغط على الدائرة بجانب الخيار.
                      </p>
                    )}
                  </div>
                )}

                {q.questionType === "term" && (
                  <>
                    <Input
                      label="الإجابة المرجعية (للمعلم عند التصحيح اليدوي)"
                      value={q.correctText ?? ""}
                      onChange={(e) => updateQuestion(q.id, { correctText: e.target.value })}
                      required
                    />
                    <p className="text-xs text-amber-700">
                      سؤال المصطلح يُصحَّح يدوياً من المعلم ولا يُحتسب تلقائياً.
                    </p>
                  </>
                )}

                {q.questionType === "essay" && (
                  <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    السؤال المقالي يُصحَّح يدوياً من المعلم ولا يُحتسب تلقائياً عند التسليم.
                  </p>
                )}

                {q.questionType === "matching" && (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-500">أدخل عناصر التوصيل (يسار → يمين)</p>
                    {(q.pairs ?? []).map((pair, pi) => (
                      <div key={pi} className="flex flex-wrap items-end gap-2">
                        <Input
                          label={pi === 0 ? "يسار" : undefined}
                          value={pair.left}
                          onChange={(e) => updatePair(q.id, pi, { left: e.target.value })}
                          className="min-w-[120px] flex-1"
                          required
                        />
                        <Input
                          label={pi === 0 ? "يمين" : undefined}
                          value={pair.right}
                          onChange={(e) => updatePair(q.id, pi, { right: e.target.value })}
                          className="min-w-[120px] flex-1"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-2"
                          disabled={(q.pairs?.length ?? 0) <= 2}
                          onClick={() => removePair(q.id, pi)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs"
                      onClick={() => addPair(q.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      إضافة زوج
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-1.5 sm:w-auto"
          onClick={addQuestion}
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة سؤال
        </Button>
      </FormSection>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          {initial ? "حفظ التعديلات" : "إنشاء الاختبار"}
        </Button>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );

  if (embedded) return form;
  return <Card className="mb-6 border-brand-blue/20 p-4 sm:p-5">{form}</Card>;
}
