"use client";

import { Card } from "@/components/atoms/Card";
import { PromotionPolicyEditor } from "@/components/admin/PromotionPolicyEditor";
import { defaultPolicy } from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

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
    addRequiredSubject,
    removeRequiredSubject,
    handleSaveGradePolicy,
  } = useAcademicAdmin();

  if (!selectedYear) return null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-neutral-100 px-4 py-3">
        <h3 className="font-bold text-p-black">سياسات الترفيع والنجاح حسب الصف</h3>
        <p className="text-xs text-p-black/55">
          كل صف له سياسة تُطبَّق في كل فصل. يُقيَّم الطالب في نهاية كل فصل على حدة، وفي نهاية
          السنة يجب النجاح في جميع الفصول لإتمام العام.
        </p>
      </div>
      <div className="space-y-4 px-4 py-4">
        {loadingGrades ? (
          <p className="text-sm text-neutral-500">جاري تحميل الصفوف...</p>
        ) : grades.length === 0 ? (
          <p className="text-sm text-neutral-500">
            لا توجد صفوف دراسية. أضف الصفوف من صفحة «الفصول والشعب» أولاً.
          </p>
        ) : (
          grades.map((grade) => (
            <PromotionPolicyEditor
              key={grade.id}
              title={grade.name}
              description="تُستخدم هذه السياسة لطلاب هذا الصف في كل فصول السنة الدراسية."
              policyDraft={policyDraftsByGradeId[grade.id] ?? defaultPolicy()}
              passMinimumCountInput={passMinimumCountInputs[grade.id] ?? "1"}
              requiredSubjectPicker={requiredSubjectPickers[grade.id] ?? ""}
              subjects={subjects}
              subjectPickerOptions={subjectPickerOptions(grade.id)}
              saving={savingPolicyGradeId === grade.id}
              saved={savedPolicyGradeId === grade.id}
              saveLabel="حفظ سياسة الصف"
              onUpdatePolicy={(patch) => updateGradePolicyDraft(grade.id, patch)}
              onPassMinimumCountInputChange={(value) =>
                setPassMinimumCountInputs((prev) => ({ ...prev, [grade.id]: value }))
              }
              onPassMinimumCountBlur={() => {
                const normalized = Math.max(1, Number(passMinimumCountInputs[grade.id]) || 1);
                setPassMinimumCountInputs((prev) => ({
                  ...prev,
                  [grade.id]: String(normalized),
                }));
                updateGradePolicyDraft(grade.id, { passMinimumCount: normalized });
              }}
              onRequiredSubjectPickerChange={(value) =>
                setRequiredSubjectPickers((prev) => ({ ...prev, [grade.id]: value }))
              }
              onAddRequiredSubject={() => addRequiredSubject(grade.id)}
              onRemoveRequiredSubject={(subjectName) =>
                removeRequiredSubject(grade.id, subjectName)
              }
              onSave={() => handleSaveGradePolicy(grade.id)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
