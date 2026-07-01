"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import {
  GradeSchemeEditorForm,
  buildDefaultGradeSchemeComponents,
  gradeSchemeComponentsTotal,
  newGradeSchemeComponentId,
} from "@/components/grades/GradeSchemeEditorForm";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  GradeSchemeBundle,
  GradeSchemeComponent,
  GradeSchemeEntry,
} from "@/types/gradeSchemes";
import { groupClassesByGrade } from "@/lib/groupClassesByGrade";
import { BookOpen, Save, Search, Users } from "lucide-react";

function parseApiError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "تعذّر حفظ البيانات";
}

function GradeSubjectMultiSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  function toggleSubject(name: string) {
    if (disabled) return;
    onChange(value.includes(name) ? value.filter((item) => item !== name) : [...value, name]);
  }

  function selectAll() {
    if (disabled) return;
    onChange([...options]);
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
  }

  if (options.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        لا توجد مواد مرتبطة بالفصول المختارة.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-brand-teal/25 bg-white px-3 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-teal">الخطوة ٢</p>
        <p className="mt-0.5 text-sm font-semibold text-p-black">اختر المادة أو أكثر</p>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-3">
        {options.length > 1 ? (
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              disabled={disabled}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-brand-blue hover:bg-brand-blue/5 disabled:opacity-50"
            >
              تحديد كل المواد
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-p-black/50 hover:bg-neutral-50 disabled:opacity-50"
            >
              إلغاء التحديد
            </button>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((name) => {
            const checked = value.includes(name);
            return (
              <label
                key={name}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all sm:px-4 sm:py-3",
                  disabled && "cursor-not-allowed opacity-60",
                  !disabled && checked
                    ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                    : !disabled && "border-neutral-200 bg-white hover:border-brand-teal/25"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-p-black">{name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleSubject(name)}
                  className="h-4 w-4 shrink-0 accent-brand-teal disabled:cursor-not-allowed"
                />
              </label>
            );
          })}
        </div>
      </div>

      {value.length > 0 ? (
        <p className="rounded-lg bg-brand-teal/5 px-3 py-2 text-xs text-brand-teal">
          {value.length} {value.length === 1 ? "مادة محددة" : "مواد محددة"}: {value.join("، ")}
        </p>
      ) : (
        <p className="text-xs text-brand-orange">اختر مادة واحدة على الأقل</p>
      )}
    </div>
  );
}

export function TeacherGradesPanel() {
  const { classes, currentTeacher, loading: schoolLoading, refresh } = useSchool();

  function showSuccessMessage(message: string, scroll = true) {
    setError("");
    setSuccess(message);
    setScrollFeedback(scroll);
  }

  function clearFeedback() {
    setError("");
    setSuccess("");
    setScrollFeedback(false);
  }

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const teachableClassIdSet = useMemo(() => {
    if (currentTeacher?.teachableClassIds?.length) {
      return new Set(currentTeacher.teachableClassIds);
    }
    const subjectClassMap = currentTeacher?.subjectClassIds;
    if (subjectClassMap && Object.keys(subjectClassMap).length > 0) {
      return new Set(Object.values(subjectClassMap).flat());
    }
    return new Set<string>();
  }, [currentTeacher?.teachableClassIds, currentTeacher?.subjectClassIds]);
  const teacherClasses = useMemo(() => {
    return classes.filter((cls) => teachableClassIdSet.has(cls.id));
  }, [classes, teachableClassIdSet]);

  const derivedGrades = useMemo(() => groupClassesByGrade(teacherClasses), [teacherClasses]);

  const [classId, setClassId] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [activeSubject, setActiveSubject] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [maxScore, setMaxScore] = useState("100");
  const [components, setComponents] = useState<GradeSchemeComponent[]>(buildDefaultGradeSchemeComponents);
  const [entries, setEntries] = useState<GradeSchemeEntry[]>([]);
  const [schemeSaved, setSchemeSaved] = useState(false);
  const [gradesSaved, setGradesSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingBundle, setLoadingBundle] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);
  const [error, setError] = useState("");
  const [academicTermLabel, setAcademicTermLabel] = useState("");
  const [success, setSuccess] = useState("");
  const [scrollFeedback, setScrollFeedback] = useState(false);

  const selectedClassIds = classId;
  const hasMultipleClasses = selectedClassIds.length > 1;
  const hasMultipleSubjects = subjects.length > 1;

  const filteredSubjects = useMemo(() => {
    const selectedSet = new Set(selectedClassIds);
    const subjectClassMap = currentTeacher?.subjectClassIds ?? {};

    const fromProfile = Object.entries(subjectClassMap)
      .filter(([, classIds]) => classIds.some((id) => selectedSet.has(id)))
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b, "ar"));

    if (fromProfile.length > 0) return fromProfile;

    const fromApi = availableSubjects.filter(Boolean);
    if (fromApi.length > 0) return fromApi;

    if (selectedClassIds.length === 0) return [];
    return (currentTeacher?.subjects ?? []).slice().sort((a, b) => a.localeCompare(b, "ar"));
  }, [selectedClassIds, currentTeacher?.subjectClassIds, currentTeacher?.subjects, availableSubjects]);

  useEffect(() => {
    setClassId((prev) => {
      const next = prev.filter((id) => teachableClassIdSet.has(id));
      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [teachableClassIdSet]);

  useEffect(() => {
    setSubjects((prev) => {
      const next = prev.filter((name) => filteredSubjects.includes(name));
      if (next.length === prev.length && next.every((name, index) => name === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [filteredSubjects]);

  useEffect(() => {
    if (subjects.length === 0) {
      setActiveSubject("");
      return;
    }
    if (!activeSubject || !subjects.includes(activeSubject)) {
      setActiveSubject(subjects[0]);
    }
  }, [subjects, activeSubject]);

  const componentTotal = gradeSchemeComponentsTotal(components);
  const maxScoreNumber = Number(maxScore) || 0;
  const splitValid = componentTotal === maxScoreNumber && maxScoreNumber > 0;

  const loadBundle = useCallback(async (nextClassIds: string[], nextSubject?: string) => {
    if (nextClassIds.length === 0) {
      setAvailableSubjects([]);
      setEntries([]);
      return;
    }
    setLoadingBundle(true);
    setError("");
    try {
      const data = (await api.getTeacherGradeScheme(
        nextClassIds,
        nextSubject || undefined
      )) as GradeSchemeBundle;
      const yearName = data.academicContext?.academicYear?.name;
      const termName = data.academicContext?.currentTerm?.name;
      setAcademicTermLabel(yearName && termName ? `${yearName} — ${termName}` : termName ?? "");
      setAvailableSubjects(data.availableSubjects ?? []);
      if (data.scheme) {
        setMaxScore(String(data.scheme.maxScore));
        setComponents(
          (data.scheme.components ?? []).map((item) => ({
            id: item.id || newGradeSchemeComponentId(),
            name: item.name,
            maxScore: Number(item.maxScore),
          }))
        );
        setSchemeSaved(true);
      } else if (!nextSubject) {
        setMaxScore("100");
        setComponents(buildDefaultGradeSchemeComponents());
        setSchemeSaved(false);
      }
      setEntries(data.entries ?? []);
      setGradesSaved(false);
    } catch {
      setError("تعذّر تحميل بيانات العلامات");
      setEntries([]);
    } finally {
      setLoadingBundle(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassIds.length === 0) {
      setAvailableSubjects([]);
      setEntries([]);
      return;
    }
    if (!activeSubject) {
      void loadBundle(selectedClassIds);
      return;
    }
    void loadBundle(selectedClassIds, activeSubject);
  }, [selectedClassIds, activeSubject, loadBundle]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        (entry.studentNumber ?? "").toLowerCase().includes(q) ||
        (entry.nationalId ?? "").toLowerCase().includes(q) ||
        (entry.className ?? "").toLowerCase().includes(q)
    );
  }, [entries, search]);

  function updateEntryScore(studentId: string, componentId: string, value: string) {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.studentId !== studentId) return entry;
        const scores = { ...entry.scores, [componentId]: value === "" ? "" : value };
        const total = components.reduce((sum, component) => {
          const raw = scores[component.id];
          const num = raw === "" || raw == null ? 0 : Number(raw);
          return sum + (Number.isFinite(num) ? num : 0);
        }, 0);
        return { ...entry, scores, total };
      })
    );
    setGradesSaved(false);
    clearFeedback();
  }

  async function handleSaveGrades() {
    if (selectedClassIds.length === 0 || subjects.length === 0) {
      setError("اختر الفصول والمواد أولاً");
      return;
    }
    if (!schemeSaved) {
      setError("لم تُعرّف تقسيمة العلامات الموحّدة بعد. تواصل مع الإدارة.");
      return;
    }

    setSavingGrades(true);
    setError("");
    try {
      const result = (await api.saveTeacherGradeSchemeEntries({
        classIds: selectedClassIds,
        subjects: [activeSubject],
        activeSubject,
        entries: entries.map((entry) => ({
          studentId: entry.studentId,
          scores: entry.scores,
        })),
      })) as GradeSchemeBundle;
      setEntries(result.entries ?? []);
      setGradesSaved(true);
      showSuccessMessage(
        hasMultipleSubjects
          ? `تم حفظ علامات ${activeSubject} بنجاح${hasMultipleClasses ? ` في ${selectedClassIds.length} شعب` : ""}`
          : hasMultipleClasses
            ? `تم حفظ علامات الطلاب بنجاح في ${selectedClassIds.length} شعب`
            : "تم حفظ علامات الطلاب بنجاح"
      );
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSavingGrades(false);
    }
  }

  if (schoolLoading) {
    return (
      <DashboardLoadingState compact message="جاري التحميل..." hint="نجهّز بيانات الفصول والمواد" />
    );
  }

  if (teacherClasses.length === 0) {
    return (
      <Card className="px-6 py-14 text-center">
        <p className="font-semibold text-p-black">لا توجد فصول تدرّس فيها مواد مسندة إليك</p>
        <p className="mt-2 text-sm text-p-black/55">
          تظهر هنا فقط الفصول والشعب المرتبطة بموادك الدراسية.
        </p>
      </Card>
    );
  }

  const subjectPickerDisabled = selectedClassIds.length === 0 || loadingBundle;

  return (
    <div className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      {academicTermLabel ? (
        <Alert variant="info">العلامات المعروضة والمحفوظة للفصل الحالي: {academicTermLabel}</Alert>
      ) : null}
      <SaveFeedback success={success} />

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-sm font-bold text-p-black">اختيار المادة والفصول</h2>
          <p className="mt-1 text-xs text-p-black/50">
            اختر الفصول والمواد لإدخال علامات الطلاب حسب التقسيمة المعتمدة من الإدارة.
          </p>
        </div>

        <GradeSectionClassPicker
          classes={teacherClasses}
          grades={derivedGrades.map((group) => ({
            id: group.grade,
            name: group.grade,
            sectionsCount: group.sections.length,
          }))}
          mode="multiple"
          value={classId}
          onChange={(value) => {
            setClassId(value);
            setSubjects([]);
            setActiveSubject("");
            setSchemeSaved(false);
            clearFeedback();
          }}
          label="الفصول والشعب"
          required
          showBulkActions
          variant="dropdown"
        />

        <div>
          <p className="mb-3 text-sm font-medium text-p-black/80">
            المواد
            <span className="text-brand-orange"> *</span>
          </p>
          <GradeSubjectMultiSelect
            options={filteredSubjects}
            value={subjects}
            onChange={(value) => {
              setSubjects(value);
              setSchemeSaved(false);
              clearFeedback();
            }}
            disabled={subjectPickerDisabled}
          />
        </div>
      </Card>

      {selectedClassIds.length > 0 && subjects.length > 0 ? (
        <>
          {!schemeSaved && !loadingBundle ? (
            <Alert variant="warning">
              لم تُعرّف تقسيمة العلامات الموحّدة بعد للفصل الدراسي الحالي. تواصل مع الإدارة لإعدادها
              قبل إدخال العلامات.
            </Alert>
          ) : null}

          {schemeSaved ? (
            <Card className="space-y-3 p-4 sm:p-5">
              <div>
                <h2 className="text-sm font-bold text-p-black">التقسيمة المعتمدة</h2>
                <p className="mt-1 text-xs text-p-black/50">
                  تقسيمة موحّدة من الإدارة
                  {academicTermLabel ? ` — ${academicTermLabel}` : ""}
                </p>
              </div>
              <GradeSchemeEditorForm
                maxScore={maxScore}
                components={components}
                componentTotal={componentTotal}
                splitValid={splitValid}
                readOnly
                onMaxScoreChange={() => undefined}
                onComponentChange={() => undefined}
                onAddComponent={() => undefined}
                onRemoveComponent={() => undefined}
                onMoveComponent={() => undefined}
              />
            </Card>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-p-black">علامات الطلاب</h2>
                  <p className="mt-0.5 text-xs text-p-black/50">
                    {hasMultipleSubjects
                      ? "اختر المادة لإدخال علاماتها. تُطبَّق نفس التقسيمة على كل المواد المختارة."
                      : `علامات مادة ${subjects[0]} — ${selectedClassIds.length} ${selectedClassIds.length === 1 ? "شعبة" : "شعب"}.`}
                  </p>
                </div>
                {hasMultipleSubjects ? (
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((name) => {
                      const active = name === activeSubject;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setActiveSubject(name);
                            setGradesSaved(false);
                          }}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                            active
                              ? "bg-brand-teal text-white shadow-sm"
                              : "border border-neutral-200 bg-white text-p-black/60 hover:border-brand-teal/30"
                          )}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </header>

            <div className="space-y-3 p-3 sm:p-4">
              {loadingBundle ? (
                <DashboardLoadingState compact message="جاري تحميل الطلاب..." />
              ) : entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-10 text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-p-black/35">
                    <Users className="h-6 w-6" />
                  </span>
                  <p className="font-semibold text-p-black/70">لا يوجد طلاب في الشعب المختارة</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
                      <input
                        type="text"
                        placeholder="بحث بالاسم أو رقم الطالب أو رقم الهوية..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
                      />
                    </div>
                    <Button
                      onClick={handleSaveGrades}
                      disabled={savingGrades || !schemeSaved}
                      className={cn("w-full shrink-0 sm:w-auto", !gradesSaved && schemeSaved && "ring-2 ring-p-green/20")}
                    >
                      <Save className="h-4 w-4" />
                      {savingGrades ? "جاري الحفظ..." : "حفظ العلامات"}
                    </Button>
                  </div>
                  <SaveFeedback
                    success={success}
                    scrollIntoView={scrollFeedback}
                    className="mt-2"
                  />

                  <div className="-mx-3 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
                          <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">رقم الطالب</th>
                          <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">اسم الطالب</th>
                          {hasMultipleClasses ? (
                            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">الشعبة</th>
                          ) : null}
                          {components.map((component) => (
                            <th
                              key={component.id}
                              className="px-2 py-2.5 text-center text-xs font-bold sm:px-3"
                            >
                              <span className="block">{component.name || "—"}</span>
                              <span className="mt-0.5 block text-[10px] font-normal text-p-black/45">
                                / {component.maxScore}
                              </span>
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center text-xs font-bold sm:px-4">
                            المجموع
                            <span className="mt-0.5 block text-[10px] font-normal text-p-black/45">
                              / {maxScoreNumber}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map((entry, index) => (
                          <tr
                            key={entry.studentId}
                            className={cn(
                              "border-b border-neutral-50 last:border-0",
                              index % 2 === 1 && "bg-neutral-50/40"
                            )}
                          >
                            <td className="px-3 py-2.5 text-sm text-p-black/70 sm:px-4">
                              {entry.studentNumber || "—"}
                            </td>
                            <td className="px-3 py-2.5 sm:px-4">
                              <p className="font-semibold text-p-black">{entry.name}</p>
                              {entry.nationalId ? (
                                <p className="text-[11px] text-p-black/45">هوية: {entry.nationalId}</p>
                              ) : null}
                            </td>
                            {hasMultipleClasses ? (
                              <td className="px-3 py-2.5 text-xs text-p-black/55 sm:px-4">
                                {entry.className || "—"}
                              </td>
                            ) : null}
                            {components.map((component) => (
                              <td key={component.id} className="px-2 py-2.5 text-center sm:px-3">
                                <NumberFieldWithKeypad
                                  compact
                                  fieldId={`score-${entry.studentId}-${component.id}`}
                                  label={`${component.name} — ${entry.name}`}
                                  value={
                                    entry.scores[component.id] === "" ||
                                    entry.scores[component.id] == null
                                      ? ""
                                      : String(entry.scores[component.id])
                                  }
                                  onChange={(value) =>
                                    updateEntryScore(entry.studentId, component.id, value)
                                  }
                                  min={0}
                                  max={component.maxScore}
                                  allowDecimal
                                  maxDecimalPlaces={2}
                                  inputClassName="mx-auto w-20 py-1.5"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-center font-bold text-p-green sm:px-4">
                              {entry.total === "" ? "—" : entry.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
