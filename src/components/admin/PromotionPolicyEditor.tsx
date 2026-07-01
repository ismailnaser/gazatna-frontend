"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import { cn } from "@/lib/utils";
import type { PromotionPolicy } from "@/types/academic";
import { failureModeLabels, passRuleLabels, promotionModeLabels } from "@/types/academic";
import type { Subject } from "@/types/teacher";
import { Save } from "lucide-react";
import {
  maxRequiredSubjectsForPolicy,
  trimRequiredSubjects,
} from "@/components/admin/academic/academicAdminUtils";

type PromotionPolicyEditorProps = {
  title: string;
  description: string;
  policyDraft: PromotionPolicy;
  passMinimumCountInput: string;
  requiredSubjectPicker: string;
  subjects: Subject[];
  subjectPickerOptions: Array<{ value: string; label: string }>;
  saving: boolean;
  saved: boolean;
  saveLabel?: string;
  onUpdatePolicy: (patch: Partial<PromotionPolicy>) => void;
  onPassMinimumCountInputChange: (value: string) => void;
  onPassMinimumCountBlur: () => void;
  onRequiredSubjectPickerChange: (value: string) => void;
  onAddRequiredSubject: () => void;
  onRemoveRequiredSubject: (subjectName: string) => void;
  onSave: () => void;
};

export function PromotionPolicyEditor({
  title,
  description,
  policyDraft,
  passMinimumCountInput,
  requiredSubjectPicker,
  subjects,
  subjectPickerOptions,
  saving,
  saved,
  saveLabel = "حفظ السياسة",
  onUpdatePolicy,
  onPassMinimumCountInputChange,
  onPassMinimumCountBlur,
  onRequiredSubjectPickerChange,
  onAddRequiredSubject,
  onRemoveRequiredSubject,
  onSave,
}: PromotionPolicyEditorProps) {
  const maxRequiredSubjects = maxRequiredSubjectsForPolicy(policyDraft, passMinimumCountInput);
  const atRequiredSubjectLimit =
    maxRequiredSubjects != null && policyDraft.requiredSubjects.length >= maxRequiredSubjects;

  function applyPassMinimumCount(raw: string) {
    onPassMinimumCountInputChange(raw);
    if (raw === "") return;

    const count = Math.max(1, Number(raw) || 1);
    const trimmed = trimRequiredSubjects(policyDraft.requiredSubjects, count);
    onUpdatePolicy({
      passMinimumCount: count,
      ...(trimmed.length !== policyDraft.requiredSubjects.length
        ? { requiredSubjects: trimmed }
        : {}),
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-p-cream/30 p-4">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-p-black">{title}</h4>
        <p className="mt-1 text-xs text-p-black/55">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="شرط النجاح"
          value={policyDraft.passRule}
          options={Object.entries(passRuleLabels).map(([value, label]) => ({ value, label }))}
          onChange={(e) => {
            const passRule = e.target.value as PromotionPolicy["passRule"];
            if (passRule === "minimum_count") {
              const max = maxRequiredSubjectsForPolicy(
                { passRule, passMinimumCount: policyDraft.passMinimumCount },
                passMinimumCountInput
              );
              const trimmed = trimRequiredSubjects(policyDraft.requiredSubjects, max);
              onUpdatePolicy({
                passRule,
                ...(trimmed.length !== policyDraft.requiredSubjects.length
                  ? { requiredSubjects: trimmed }
                  : {}),
              });
              return;
            }
            onUpdatePolicy({ passRule });
          }}
        />

        <Input
          label="عدد المواد المطلوب النجاح فيها"
          type="text"
          inputMode="numeric"
          value={passMinimumCountInput}
          disabled={policyDraft.passRule !== "minimum_count"}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            applyPassMinimumCount(raw);
          }}
          onBlur={onPassMinimumCountBlur}
        />

        <Select
          label="ترفيع الناجحين"
          value={policyDraft.passPromotionMode}
          options={Object.entries(promotionModeLabels).map(([value, label]) => ({ value, label }))}
          onChange={(e) =>
            onUpdatePolicy({
              passPromotionMode: e.target.value as PromotionPolicy["passPromotionMode"],
            })
          }
        />

        <Select
          label="معالجة الراسبين"
          value={policyDraft.failHandlingMode}
          options={Object.entries(failureModeLabels).map(([value, label]) => ({ value, label }))}
          onChange={(e) =>
            onUpdatePolicy({
              failHandlingMode: e.target.value as PromotionPolicy["failHandlingMode"],
            })
          }
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium text-p-black">مواد إلزامية للنجاح</label>
          {maxRequiredSubjects != null ? (
            <span className="text-xs text-p-black/50">
              {policyDraft.requiredSubjects.length} / {maxRequiredSubjects}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {policyDraft.requiredSubjects.map((subject) => (
            <Badge key={subject} variant="default" className="gap-1">
              {subject}
              <button
                type="button"
                className="text-p-black/50 hover:text-p-red"
                onClick={() => onRemoveRequiredSubject(subject)}
                aria-label={`إزالة ${subject}`}
              >
                ×
              </button>
            </Badge>
          ))}
          {policyDraft.requiredSubjects.length === 0 ? (
            <span className="text-xs text-p-black/45">لم تُحدَّد مواد إلزامية</span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-[220px] flex-1">
            <label className="text-sm font-medium text-p-black/80">اختيار مادة</label>
            {subjects.length === 0 ? (
              <p className="mt-1.5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-p-black/45">
                لا توجد مواد مسجّلة
              </p>
            ) : (
              <div
                className="mt-1.5 max-h-44 overflow-y-auto overscroll-y-contain rounded-xl border border-neutral-200 bg-white"
                role="listbox"
                aria-label="اختيار مادة"
              >
                {subjectPickerOptions
                  .filter((option) => option.value)
                  .map((option) => {
                    const selected = requiredSubjectPicker === option.value;
                    const disabled = atRequiredSubjectLimit;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={disabled}
                        onClick={() => onRequiredSubjectPickerChange(option.value)}
                        className={cn(
                          "block w-full px-4 py-2.5 text-start text-sm transition",
                          disabled && "cursor-not-allowed opacity-50",
                          selected
                            ? "bg-brand-teal/10 font-semibold text-brand-teal"
                            : "text-p-black hover:bg-neutral-50",
                          disabled && !selected && "hover:bg-transparent"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                {subjectPickerOptions.filter((option) => option.value).length === 0 ? (
                  <p className="px-4 py-3 text-xs text-p-black/45">جميع المواد مضافة بالفعل</p>
                ) : null}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="sm:mt-7"
            disabled={!requiredSubjectPicker || subjects.length === 0 || atRequiredSubjectLimit}
            onClick={onAddRequiredSubject}
          >
            إضافة
          </Button>
        </div>
        {atRequiredSubjectLimit ? (
          <p className="mt-2 text-xs text-p-black/55">
            وصلت للحد الأقصى ({maxRequiredSubjects} مواد) حسب «عدد المواد المطلوب النجاح فيها».
          </p>
        ) : null}
        {subjects.length === 0 ? (
          <p className="mt-2 text-xs text-p-black/45">أضف المواد من صفحة «المواد الدراسية».</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : saveLabel}
        </Button>
        <SaveFeedback success={saved ? "تم حفظ سياسة الترفيع بنجاح." : null} />
      </div>
    </div>
  );
}
