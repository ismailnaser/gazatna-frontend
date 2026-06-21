"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import type { PromotionPolicy } from "@/types/academic";
import { failureModeLabels, passRuleLabels, promotionModeLabels } from "@/types/academic";
import type { Subject } from "@/types/teacher";
import { Save } from "lucide-react";

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
          onChange={(e) =>
            onUpdatePolicy({ passRule: e.target.value as PromotionPolicy["passRule"] })
          }
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
            onPassMinimumCountInputChange(raw);
            if (raw !== "") {
              onUpdatePolicy({ passMinimumCount: Number(raw) });
            }
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
        <label className="mb-2 block text-sm font-medium text-p-black">مواد إلزامية للنجاح</label>
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
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="min-w-[220px] flex-1">
            <Select
              label="اختيار مادة"
              value={requiredSubjectPicker}
              options={subjectPickerOptions}
              disabled={subjects.length === 0}
              onChange={(e) => onRequiredSubjectPickerChange(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="self-end"
            disabled={!requiredSubjectPicker || subjects.length === 0}
            onClick={onAddRequiredSubject}
          >
            إضافة
          </Button>
        </div>
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
