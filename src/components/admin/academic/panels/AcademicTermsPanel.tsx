"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import { Plus, Save, Trash2 } from "lucide-react";
import { useAcademicAdmin } from "../AcademicAdminContext";

export function AcademicTermsPanel() {
  const {
    selectedYear,
    termsDraft,
    settingTermId,
    savingTerms,
    termsSaved,
    updateTermDraft,
    handleSetCurrentTerm,
    setDeleteTermTarget,
    handleAddTerm,
    handleSaveTerms,
  } = useAcademicAdmin();

  if (!selectedYear) return null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-neutral-100 px-4 py-3">
        <h3 className="font-bold text-p-black">الفصول الدراسية</h3>
        <p className="text-xs text-p-black/55">
          حدّد عدد الفصول وأسماءها وتواريخها. الفصل الحالي هو ما يراه المعلمون وأولياء الأمور في
          العلامات.
        </p>
      </div>
      <div className="space-y-4 px-4 py-4">
        {termsDraft.map((term, index) => (
          <div
            key={term.id}
            className="rounded-xl border border-neutral-200 bg-p-cream/30 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-p-black">فصل {index + 1}</p>
              <div className="flex flex-wrap items-center gap-2">
                {term.isClosed ? (
                  <Badge variant="default">مُغلق</Badge>
                ) : term.isCurrent ? (
                  <Badge variant="success">الفصل الحالي</Badge>
                ) : selectedYear.isActive && !term.id.startsWith("new-") ? (
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={settingTermId === term.id}
                    onClick={() => handleSetCurrentTerm(selectedYear.id, term.id)}
                  >
                    {settingTermId === term.id ? "..." : "تعيين كفصل حالي"}
                  </Button>
                ) : term.id.startsWith("new-") ? (
                  <span className="text-xs text-p-black/45">احفظ الفصول أولاً</span>
                ) : null}
                {!term.isClosed ? (
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs text-p-red hover:bg-p-red/5"
                  disabled={termsDraft.length <= 1}
                  onClick={() => setDeleteTermTarget(term)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="اسم الفصل"
                value={term.name}
                onChange={(e) => updateTermDraft(term.id, { name: e.target.value })}
              />
              <Input
                label="تاريخ البداية"
                type="date"
                value={term.startDate}
                onChange={(e) => updateTermDraft(term.id, { startDate: e.target.value })}
              />
              <Input
                label="تاريخ النهاية"
                type="date"
                value={term.endDate}
                onChange={(e) => updateTermDraft(term.id, { endDate: e.target.value })}
              />
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleAddTerm}>
            <Plus className="h-4 w-4" />
            إضافة فصل
          </Button>
          <Button onClick={handleSaveTerms} disabled={savingTerms}>
            <Save className="h-4 w-4" />
            {savingTerms ? "جاري الحفظ..." : "حفظ الفصول"}
          </Button>
          <SaveFeedback success={termsSaved ? "تم حفظ الفصول الدراسية بنجاح." : null} />
        </div>
      </div>
    </Card>
  );
}
