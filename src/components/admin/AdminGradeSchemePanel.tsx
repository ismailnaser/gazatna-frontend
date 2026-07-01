"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Card } from "@/components/atoms/Card";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import {
  GradeSchemeEditorForm,
  buildDefaultGradeSchemeComponents,
  gradeSchemeComponentsTotal,
  newGradeSchemeComponentId,
} from "@/components/grades/GradeSchemeEditorForm";
import { api } from "@/lib/api";
import type { GradeSchemeBundle, GradeSchemeComponent } from "@/types/gradeSchemes";

function parseApiError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "تعذّر حفظ التقسيمة";
}

export function AdminGradeSchemePanel() {
  const [maxScore, setMaxScore] = useState("100");
  const [components, setComponents] = useState<GradeSchemeComponent[]>(buildDefaultGradeSchemeComponents);
  const [academicTermLabel, setAcademicTermLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasSavedScheme, setHasSavedScheme] = useState(false);

  const componentTotal = gradeSchemeComponentsTotal(components);
  const maxScoreNumber = Number(maxScore) || 0;
  const splitValid = componentTotal === maxScoreNumber && maxScoreNumber > 0;

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = (await api.getAdminGradeSchemeTemplate()) as GradeSchemeBundle;
      const yearName = data.academicContext?.academicYear?.name;
      const termName = data.academicContext?.currentTerm?.name;
      setAcademicTermLabel(yearName && termName ? `${yearName} — ${termName}` : termName ?? "");

      if (data.scheme) {
        setMaxScore(String(data.scheme.maxScore));
        setComponents(
          (data.scheme.components ?? []).map((item) => ({
            id: item.id || newGradeSchemeComponentId(),
            name: item.name,
            maxScore: Number(item.maxScore),
          }))
        );
        setHasSavedScheme(true);
      } else {
        setMaxScore("100");
        setComponents(buildDefaultGradeSchemeComponents());
        setHasSavedScheme(false);
      }
    } catch {
      setError("تعذّر تحميل تقسيمة العلامات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  function updateComponent(index: number, field: "name" | "maxScore", value: string) {
    setComponents((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "maxScore" ? Number(value) || 0 : value,
            }
          : item
      )
    );
    setSuccess("");
  }

  function addComponent() {
    setComponents((prev) => [...prev, { id: newGradeSchemeComponentId(), name: "", maxScore: 0 }]);
    setSuccess("");
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
    setSuccess("");
  }

  function moveComponent(index: number, direction: -1 | 1) {
    setComponents((prev) => {
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setSuccess("");
  }

  async function handleSave() {
    if (!splitValid) {
      setError(`مجموع التقسيمة (${componentTotal}) يجب أن يساوي العلامة الكاملة (${maxScoreNumber})`);
      return;
    }
    if (components.some((item) => !item.name.trim())) {
      setError("أدخل اسم كل عنصر في التقسيمة");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.saveAdminGradeSchemeTemplate({
        maxScore: maxScoreNumber,
        components,
      });
      setHasSavedScheme(true);
      setSuccess(
        hasSavedScheme
          ? "تم تحديث التقسيمة الموحّدة — ستظهر للمعلمين عند إدخال العلامات"
          : "تم حفظ التقسيمة الموحّدة — ستظهر للمعلمين عند إدخال العلامات"
      );
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل التقسيمة...</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="text-sm font-bold text-p-black">التقسيمة الموحّدة للعلامات</h2>
          <p className="mt-1 text-xs text-p-black/50">
            تُطبَّق على كل المراحل الدراسية والشعب والمواد في الفصل الدراسي الحالي
            {academicTermLabel ? ` (${academicTermLabel})` : ""}. المعلمون يرونها فقط عند إدخال
            علامات الطلاب.
          </p>
        </div>

        <GradeSchemeEditorForm
          maxScore={maxScore}
          components={components}
          componentTotal={componentTotal}
          splitValid={splitValid}
          saving={saving}
          saveLabel={hasSavedScheme ? "تحديث التقسيمة الموحّدة" : "حفظ التقسيمة الموحّدة"}
          onMaxScoreChange={(value) => {
            setMaxScore(value);
            setSuccess("");
          }}
          onComponentChange={updateComponent}
          onAddComponent={addComponent}
          onRemoveComponent={removeComponent}
          onMoveComponent={moveComponent}
          onSave={handleSave}
        />

        <SaveFeedback success={success} className="mt-2" />
      </Card>
    </div>
  );
}
