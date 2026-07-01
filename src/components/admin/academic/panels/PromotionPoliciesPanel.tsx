"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PromotionPolicyEditor } from "@/components/admin/PromotionPolicyEditor";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { PromotionPolicy } from "@/types/academic";
import type { Grade } from "@/types/teacher";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  defaultPolicy,
  isGradePolicyConfigured,
  maxRequiredSubjectsForPolicy,
  summarizePromotionPolicy,
  trimRequiredSubjects,
} from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

type FormMode = "idle" | "create" | "edit";

export function PromotionPoliciesPanel() {
  const {
    selectedYear,
    loadingGrades,
    grades,
    policyDraftsByGradeId,
    passMinimumCountInputs,
    requiredSubjectPickers,
    savingPolicyGradeId,
    savedPolicyGradeId,
    subjects,
    subjectPickerOptions,
    updateGradePolicyDraft,
    setPassMinimumCountInputs,
    setRequiredSubjectPickers,
    removeRequiredSubject,
    handleSaveGradePolicies,
    handleResetGradePolicy,
  } = useAcademicAdmin();

  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
  const prevSelectedRef = useRef<string[]>([]);

  const sortedGrades = useMemo(
    () =>
      [...grades].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "ar")
      ),
    [grades]
  );

  const configuredGrades = useMemo(
    () => sortedGrades.filter((grade) => isGradePolicyConfigured(grade)),
    [sortedGrades]
  );

  const availableGrades = useMemo(
    () => sortedGrades.filter((grade) => !isGradePolicyConfigured(grade)),
    [sortedGrades]
  );

  const pickerGrades = formMode === "create" ? availableGrades : [];
  const primaryGradeId = selectedGradeIds[0] ?? editingGradeId ?? "";
  const selectedSet = useMemo(() => new Set(selectedGradeIds), [selectedGradeIds]);
  const allPickerSelected =
    pickerGrades.length > 0 && pickerGrades.every((grade) => selectedSet.has(grade.id));
  const somePickerSelected = pickerGrades.some((grade) => selectedSet.has(grade.id));
  const isSaving = savingPolicyGradeId === "__batch__" || savingPolicyGradeId === editingGradeId;
  const isSaved =
    savedPolicyGradeId === "__batch__" ||
    (editingGradeId != null && savedPolicyGradeId === editingGradeId);

  useEffect(() => {
    setSelectedGradeIds((current) =>
      current.filter((gradeId) => grades.some((grade) => grade.id === gradeId))
    );
    if (editingGradeId && !grades.some((grade) => grade.id === editingGradeId)) {
      setEditingGradeId(null);
      setFormMode("idle");
    }
  }, [grades, editingGradeId]);

  useEffect(() => {
    if (formMode !== "create") return;

    const primary = selectedGradeIds[0];
    if (!primary) {
      prevSelectedRef.current = selectedGradeIds;
      return;
    }

    const previous = new Set(prevSelectedRef.current);
    const masterDraft = policyDraftsByGradeId[primary] ?? defaultPolicy();
    const masterCount = passMinimumCountInputs[primary] ?? "1";

    for (const gradeId of selectedGradeIds) {
      if (!previous.has(gradeId) && gradeId !== primary) {
        updateGradePolicyDraft(gradeId, masterDraft);
        setPassMinimumCountInputs((prev) => ({ ...prev, [gradeId]: masterCount }));
        setRequiredSubjectPickers((prev) => ({ ...prev, [gradeId]: "" }));
      }
    }

    prevSelectedRef.current = selectedGradeIds;
  }, [
    formMode,
    selectedGradeIds,
    policyDraftsByGradeId,
    passMinimumCountInputs,
    updateGradePolicyDraft,
    setPassMinimumCountInputs,
    setRequiredSubjectPickers,
  ]);

  if (!selectedYear) return null;

  function startCreate() {
    setFormMode("create");
    setEditingGradeId(null);
    setSelectedGradeIds([]);
    prevSelectedRef.current = [];
  }

  function startEdit(gradeId: string) {
    setFormMode("edit");
    setEditingGradeId(gradeId);
    setSelectedGradeIds([gradeId]);
    prevSelectedRef.current = [gradeId];
  }

  function cancelForm() {
    setFormMode("idle");
    setEditingGradeId(null);
    setSelectedGradeIds([]);
    prevSelectedRef.current = [];
  }

  function toggleGrade(gradeId: string, enabled: boolean) {
    setSelectedGradeIds((prev) => {
      if (!enabled) return prev.filter((id) => id !== gradeId);
      if (prev.includes(gradeId)) return prev;
      return [...prev, gradeId];
    });
  }

  function toggleAll(enabled: boolean) {
    setSelectedGradeIds(enabled ? pickerGrades.map((grade) => grade.id) : []);
  }

  function updateSelectedPolicy(patch: Partial<PromotionPolicy>) {
    for (const gradeId of selectedGradeIds) {
      updateGradePolicyDraft(gradeId, patch);
    }
  }

  function updateSelectedPassMinimumCountInput(value: string) {
    setPassMinimumCountInputs((prev) => {
      const next = { ...prev };
      for (const gradeId of selectedGradeIds) {
        next[gradeId] = value;
      }
      return next;
    });
  }

  function normalizeSelectedPassMinimumCount() {
    const draft = policyDraftsByGradeId[primaryGradeId] ?? defaultPolicy();
    const normalized = Math.max(1, Number(passMinimumCountInputs[primaryGradeId]) || 1);
    const maxRequired = maxRequiredSubjectsForPolicy(draft, String(normalized));
    setPassMinimumCountInputs((prev) => {
      const next = { ...prev };
      for (const gradeId of selectedGradeIds) {
        next[gradeId] = String(normalized);
      }
      return next;
    });
    for (const gradeId of selectedGradeIds) {
      const gradeDraft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
      updateGradePolicyDraft(gradeId, {
        passMinimumCount: normalized,
        requiredSubjects: trimRequiredSubjects(gradeDraft.requiredSubjects, maxRequired),
      });
    }
  }

  function addSelectedRequiredSubject() {
    const value = (requiredSubjectPickers[primaryGradeId] ?? "").trim();
    if (!value) return;

    const primaryDraft = policyDraftsByGradeId[primaryGradeId] ?? defaultPolicy();
    const maxRequired = maxRequiredSubjectsForPolicy(
      primaryDraft,
      passMinimumCountInputs[primaryGradeId]
    );
    if (maxRequired != null && primaryDraft.requiredSubjects.length >= maxRequired) return;

    for (const gradeId of selectedGradeIds) {
      const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
      if (draft.requiredSubjects.includes(value)) continue;
      if (maxRequired != null && draft.requiredSubjects.length >= maxRequired) continue;
      updateGradePolicyDraft(gradeId, {
        requiredSubjects: [...draft.requiredSubjects, value],
      });
    }

    setRequiredSubjectPickers((prev) => {
      const next = { ...prev };
      for (const gradeId of selectedGradeIds) {
        next[gradeId] = "";
      }
      return next;
    });
  }

  function removeSelectedRequiredSubject(subjectName: string) {
    for (const gradeId of selectedGradeIds) {
      removeRequiredSubject(gradeId, subjectName);
    }
  }

  async function handleSaveForm() {
    const gradeIds = formMode === "edit" && editingGradeId ? [editingGradeId] : selectedGradeIds;
    if (gradeIds.length === 0) return;
    await handleSaveGradePolicies(gradeIds);
    cancelForm();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await handleResetGradePolicy(deleteTarget.id);
    if (editingGradeId === deleteTarget.id) {
      cancelForm();
    }
    setDeleteTarget(null);
  }

  const selectedGradeNames = sortedGrades
    .filter((grade) => selectedSet.has(grade.id))
    .map((grade) => grade.name);

  const editingGrade = editingGradeId
    ? sortedGrades.find((grade) => grade.id === editingGradeId)
    : null;

  return (
    <Card className="p-0">
      <div className="border-b border-neutral-100 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-p-black">سياسات الترفيع والنجاح</h3>
            <p className="text-xs text-p-black/55">
              أضف سياسة لكل مرحلة مرة واحدة، ثم عدّلها أو احذفها من القائمة أدناه.
            </p>
          </div>
          {formMode === "idle" && sortedGrades.length > 0 ? (
            <Button type="button" onClick={startCreate} disabled={availableGrades.length === 0}>
              <Plus className="h-4 w-4" />
              إضافة سياسة
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {loadingGrades ? (
          <p className="text-sm text-neutral-500">جاري تحميل المراحل الدراسية...</p>
        ) : sortedGrades.length === 0 ? (
          <p className="text-sm text-neutral-500">
            لا توجد مراحل دراسية. أضف الصفوف من صفحة «الفصول والشعب» أولاً.
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3">
              <p className="text-sm font-bold text-p-black">
                عدد السياسات المضافة: {configuredGrades.length}
              </p>
              <p className="mt-1 text-xs text-p-black/55">
                {availableGrades.length > 0
                  ? `${availableGrades.length} مرحلة بدون سياسة بعد`
                  : "جميع المراحل لديها سياسات محفوظة"}
              </p>
            </div>

            {configuredGrades.length > 0 ? (
              <div className="space-y-2">
                {configuredGrades.map((grade) => {
                  const policy =
                    policyDraftsByGradeId[grade.id] ?? grade.promotionPolicy ?? defaultPolicy();
                  const deleting = savingPolicyGradeId === grade.id;

                  return (
                    <div
                      key={grade.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-p-black">{grade.name}</p>
                        <p className="mt-1 text-xs text-p-black/55">
                          {summarizePromotionPolicy(policy)}
                          {policy.requiredSubjects.length > 0
                            ? ` · ${policy.requiredSubjects.length} مواد إلزامية`
                            : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 py-2 text-xs"
                          onClick={() => startEdit(grade.id)}
                          disabled={formMode !== "idle" || deleting}
                        >
                          <Pencil className="h-4 w-4" />
                          تعديل
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 py-2 text-xs text-p-red hover:bg-p-red/5"
                          onClick={() => setDeleteTarget(grade)}
                          disabled={formMode !== "idle" || deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting ? "جاري الحذف..." : "حذف"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-center text-sm text-p-black/55">
                لم تُضف أي سياسة بعد. اضغط «إضافة سياسة» لبدء الإعداد.
              </p>
            )}

            {formMode !== "idle" ? (
              <div className="space-y-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-p-black">
                    {formMode === "edit" ? `تعديل سياسة: ${editingGrade?.name ?? ""}` : "إضافة سياسة جديدة"}
                  </p>
                  <Button type="button" variant="outline" className="px-3 py-2 text-xs" onClick={cancelForm}>
                    إلغاء
                  </Button>
                </div>

                {formMode === "create" ? (
                  <div className="rounded-xl border border-neutral-100 bg-white p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-p-black">اختر المراحل</p>
                      {pickerGrades.length > 0 ? (
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-p-black/65">
                          <input
                            type="checkbox"
                            checked={allPickerSelected}
                            ref={(node) => {
                              if (node) node.indeterminate = !allPickerSelected && somePickerSelected;
                            }}
                            onChange={(event) => toggleAll(event.target.checked)}
                            className="h-4 w-4 accent-brand-teal"
                          />
                          تحديد الكل
                        </label>
                      ) : null}
                    </div>

                    {pickerGrades.length === 0 ? (
                      <p className="text-sm text-p-black/55">
                        جميع المراحل لديها سياسات — لا يمكن إضافة سياسة مكررة لنفس الصف.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {pickerGrades.map((grade) => {
                          const enabled = selectedSet.has(grade.id);
                          return (
                            <label
                              key={grade.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
                                enabled
                                  ? "border-brand-teal/30 bg-brand-teal/5"
                                  : "border-neutral-200 bg-neutral-50/50"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(event) => toggleGrade(grade.id, event.target.checked)}
                                className="h-4 w-4 shrink-0 accent-brand-teal"
                              />
                              <span className="font-semibold text-p-black">{grade.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {formMode === "edit" || selectedGradeIds.length > 0 ? (
                  <PromotionPolicyEditor
                    title={
                      formMode === "edit"
                        ? (editingGrade?.name ?? "")
                        : selectedGradeIds.length === 1
                          ? selectedGradeNames[0]
                          : `${selectedGradeIds.length} مراحل محددة`
                    }
                    description={
                      formMode === "edit"
                        ? "عدّل إعدادات السياسة ثم احفظ التغييرات."
                        : selectedGradeIds.length === 1
                          ? "ستُطبَّق هذه السياسة على المرحلة المحددة."
                          : `ستُطبَّق نفس السياسة على: ${selectedGradeNames.join("، ")}`
                    }
                    policyDraft={policyDraftsByGradeId[primaryGradeId] ?? defaultPolicy()}
                    passMinimumCountInput={passMinimumCountInputs[primaryGradeId] ?? "1"}
                    requiredSubjectPicker={requiredSubjectPickers[primaryGradeId] ?? ""}
                    subjects={subjects}
                    subjectPickerOptions={subjectPickerOptions(primaryGradeId)}
                    saving={isSaving}
                    saved={isSaved}
                    saveLabel={
                      formMode === "edit"
                        ? "حفظ التعديلات"
                        : selectedGradeIds.length === 1
                          ? "حفظ السياسة"
                          : `حفظ السياسة لـ ${selectedGradeIds.length} مراحل`
                    }
                    onUpdatePolicy={updateSelectedPolicy}
                    onPassMinimumCountInputChange={updateSelectedPassMinimumCountInput}
                    onPassMinimumCountBlur={normalizeSelectedPassMinimumCount}
                    onRequiredSubjectPickerChange={(value) =>
                      setRequiredSubjectPickers((prev) => {
                        const next = { ...prev };
                        for (const gradeId of selectedGradeIds) {
                          next[gradeId] = value;
                        }
                        return next;
                      })
                    }
                    onAddRequiredSubject={addSelectedRequiredSubject}
                    onRemoveRequiredSubject={removeSelectedRequiredSubject}
                    onSave={handleSaveForm}
                  />
                ) : formMode === "create" ? (
                  <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-5 text-center text-sm text-p-black/55">
                    اختر مرحلة دراسية واحدة على الأقل لعرض نموذج السياسات.
                  </p>
                ) : null}

                {formMode === "create" && selectedGradeIds.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedGradeNames.map((name) => (
                      <Badge key={name} variant="info">
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="تأكيد حذف السياسة"
        description={
          deleteTarget ? (
            <>
              هل أنت متأكد من حذف سياسة الترفيع لـ «{deleteTarget.name}»؟
              <br />
              سيتم إعادة الإعدادات الافتراضية ويمكنك إضافة سياسة جديدة لاحقاً.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="نعم، احذف السياسة"
        loading={Boolean(deleteTarget && savingPolicyGradeId === deleteTarget.id)}
        loadingLabel="جاري الحذف..."
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteTarget || savingPolicyGradeId !== deleteTarget.id) {
            setDeleteTarget(null);
          }
        }}
      />
    </Card>
  );
}
