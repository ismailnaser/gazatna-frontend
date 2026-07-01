"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { cn } from "@/lib/utils";
import type { GradeSchemeComponent } from "@/types/gradeSchemes";
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from "lucide-react";

type GradeSchemeEditorFormProps = {
  maxScore: string;
  components: GradeSchemeComponent[];
  componentTotal: number;
  splitValid: boolean;
  readOnly?: boolean;
  saving?: boolean;
  saveLabel?: string;
  onMaxScoreChange: (value: string) => void;
  onComponentChange: (index: number, field: "name" | "maxScore", value: string) => void;
  onAddComponent: () => void;
  onRemoveComponent: (index: number) => void;
  onMoveComponent: (index: number, direction: -1 | 1) => void;
  onSave?: () => void;
};

export function GradeSchemeEditorForm({
  maxScore,
  components,
  componentTotal,
  splitValid,
  readOnly = false,
  saving = false,
  saveLabel = "حفظ التقسيمة",
  onMaxScoreChange,
  onComponentChange,
  onAddComponent,
  onRemoveComponent,
  onMoveComponent,
  onSave,
}: GradeSchemeEditorFormProps) {
  const maxScoreNumber = Number(maxScore) || 0;

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-xs text-p-black/50">
            حدّد العلامة الكاملة ثم قسّمها. تُطبَّق التقسيمة الموحّدة على كل المراحل والشعب والمواد.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onAddComponent}>
            <Plus className="h-4 w-4" />
            إضافة عنصر
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-end">
        {readOnly ? (
          <div>
            <p className="mb-1 text-xs font-medium text-p-black/55">العلامة الكاملة</p>
            <p className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm font-bold text-p-black">
              {maxScoreNumber || "—"}
            </p>
          </div>
        ) : (
          <NumberFieldWithKeypad
            fieldId="grade-scheme-max"
            label="العلامة الكاملة"
            value={maxScore}
            onChange={onMaxScoreChange}
            min={1}
            max={1000}
            allowDecimal
            maxDecimalPlaces={2}
            placeholder="100"
          />
        )}
        <p
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold",
            splitValid ? "bg-p-green/10 text-p-green" : "bg-brand-orange/10 text-brand-orange"
          )}
        >
          مجموع التقسيمة: {componentTotal} / {maxScoreNumber || "—"}
        </p>
      </div>

      <div className="space-y-2">
        {components.map((component, index) => (
          <div
            key={component.id}
            className={cn(
              "grid gap-2 rounded-xl border border-neutral-100 p-3",
              readOnly ? "bg-white" : "bg-neutral-50/60 sm:grid-cols-[1fr_120px_auto]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-p-black/45 ring-1 ring-neutral-200">
                {index + 1}
              </span>
              {readOnly ? (
                <span className="font-semibold text-p-black">{component.name || "—"}</span>
              ) : (
                <Input
                  className="min-w-0 flex-1"
                  value={component.name}
                  onChange={(e) => onComponentChange(index, "name", e.target.value)}
                  placeholder="اسم العنصر (مثال: النشاط)"
                />
              )}
            </div>
            {readOnly ? (
              <p className="text-sm text-p-black/60 sm:text-end">
                {component.maxScore} علامة
              </p>
            ) : (
              <>
                <NumberFieldWithKeypad
                  compact
                  fieldId={`component-max-${component.id}`}
                  label="علامة العنصر"
                  value={String(component.maxScore || "")}
                  onChange={(value) => onComponentChange(index, "maxScore", value)}
                  min={0}
                  allowDecimal
                  maxDecimalPlaces={2}
                />
                <div className="flex items-end justify-end gap-0.5 self-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    disabled={index === 0}
                    onClick={() => onMoveComponent(index, -1)}
                    aria-label="تحريك لأعلى"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    disabled={index === components.length - 1}
                    onClick={() => onMoveComponent(index, 1)}
                    aria-label="تحريك لأسفل"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2 text-p-red hover:bg-p-red/5"
                    onClick={() => onRemoveComponent(index)}
                    disabled={components.length <= 1}
                    aria-label="حذف العنصر"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!readOnly && onSave ? (
        <Button onClick={onSave} disabled={saving || !splitValid}>
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : saveLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function newGradeSchemeComponentId() {
  return `cmp-${Math.random().toString(36).slice(2, 10)}`;
}

export const DEFAULT_GRADE_SCHEME_COMPONENTS: Array<{ name: string; maxScore: number }> = [
  { name: "النشاط", maxScore: 10 },
  { name: "الشهري", maxScore: 10 },
  { name: "النصفي", maxScore: 30 },
  { name: "النهائي", maxScore: 50 },
];

export function buildDefaultGradeSchemeComponents(): GradeSchemeComponent[] {
  return DEFAULT_GRADE_SCHEME_COMPONENTS.map((item) => ({
    id: newGradeSchemeComponentId(),
    name: item.name,
    maxScore: item.maxScore,
  }));
}

export function gradeSchemeComponentsTotal(components: GradeSchemeComponent[]) {
  return components.reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
}
