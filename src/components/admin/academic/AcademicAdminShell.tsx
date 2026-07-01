"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { CertificatePreviewDialog } from "@/components/admin/CertificatePreviewDialog";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { FormDialog } from "@/components/molecules/FormDialog";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  academicYearFormFromLabel,
  academicYearSelectOptions,
  isArchivedAcademicYear,
  isManageableAcademicYear,
} from "./academicAdminUtils";
import { useAcademicAdmin } from "./AcademicAdminContext";

export function AcademicAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isArchiveView =
    pathname === "/admin/academic-archive" || pathname.startsWith("/admin/academic-archive/");

  const {
    years,
    loading,
    error,
    selectedYearId,
    setSelectedYearId,
    selectedYear,
    creatingYear,
    createYearOpen,
    setCreateYearOpen,
    createYearForm,
    setCreateYearForm,
    deleteYearTarget,
    setDeleteYearTarget,
    deletingYearId,
    deleteYearError,
    setDeleteYearError,
    deleteTermTarget,
    setDeleteTermTarget,
    activatingYearId,
    openCreateYearDialog,
    handleCreateYearSubmit,
    handleDeleteYear,
    handleSetActive,
    handleRemoveTerm,
    certificateVisualPreview,
    certificatePreviewHtml,
    loadingCertificateVisualPreview,
    exportingCertificateStudentId,
    closeCertificateVisualPreview,
    handleDownloadPreviewCertificate,
  } = useAcademicAdmin();

  const sidebarYears = useMemo(
    () =>
      isArchiveView
        ? years.filter(isArchivedAcademicYear)
        : years.filter(isManageableAcademicYear),
    [years, isArchiveView]
  );

  const createYearOptions = useMemo(() => academicYearSelectOptions(years), [years]);

  useEffect(() => {
    if (loading) return;
    if (sidebarYears.length === 0) {
      if (selectedYearId) setSelectedYearId("");
      return;
    }
    if (!sidebarYears.some((year) => year.id === selectedYearId)) {
      setSelectedYearId(sidebarYears[0].id);
    }
  }, [loading, sidebarYears, selectedYearId, setSelectedYearId]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div>
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {!isArchiveView ? (
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={openCreateYearDialog} disabled={creatingYear}>
            <Plus className="h-4 w-4" />
            سنة دراسية جديدة
          </Button>
        </div>
      ) : null}

      {!isArchiveView ? (
      <FormDialog
        open={createYearOpen}
        title="إنشاء سنة دراسية جديدة"
        description="أدخل بيانات السنة الدراسية فقط. يمكنك إضافة الفصول الدراسية لاحقاً من قسم «الفصول الدراسية»."
        onClose={() => {
          if (!creatingYear) setCreateYearOpen(false);
        }}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {createYearOptions.length === 0 ? (
            <p className="text-sm text-neutral-500">
              جميع السنوات المتاحة في النطاق الحالي (السنة الدراسية الجارية + 10 سنوات) مُسجّلة
              مسبقاً.
            </p>
          ) : (
            <Select
              label="السنة الدراسية"
              value={createYearForm.name}
              options={createYearOptions}
              onChange={(event) => setCreateYearForm(academicYearFormFromLabel(event.target.value))}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-p-black">
                تاريخ البدء
              </label>
              <Input
                type="date"
                value={createYearForm.startDate}
                onChange={(event) =>
                  setCreateYearForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-p-black">
                تاريخ الانتهاء
              </label>
              <Input
                type="date"
                value={createYearForm.endDate}
                onChange={(event) =>
                  setCreateYearForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateYearOpen(false)}
              disabled={creatingYear}
            >
              إلغاء
            </Button>
            <Button type="button" onClick={handleCreateYearSubmit} disabled={creatingYear || createYearOptions.length === 0}>
              {creatingYear ? "جاري الإنشاء..." : "إنشاء السنة"}
            </Button>
          </div>
        </div>
      </FormDialog>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteYearTarget)}
        title={isArchiveView ? "تأكيد حذف السنة المؤرشفة" : "تأكيد حذف السنة الدراسية"}
        description={
          deleteYearTarget ? (
            <>
              هل أنت متأكد من حذف السنة «{deleteYearTarget.name}»؟
              <br />
              سيتم حذف فصولها وإعداداتها المرتبطة ولا يمكن التراجع.
              {isArchiveView || isArchivedAcademicYear(deleteYearTarget) ? (
                <>
                  <br />
                  <span className="font-semibold text-p-red">
                    تنبيه: هذه سنة مؤرشفة — سيُحذف سجلها من الأرشيف نهائياً.
                  </span>
                </>
              ) : null}
              {deleteYearTarget.isActive ? (
                <>
                  <br />
                  <span className="font-semibold text-p-red">
                    تنبيه: هذه السنة نشطة حالياً وسيتم إزالتها من المنصة.
                  </span>
                </>
              ) : null}
            </>
          ) : (
            ""
          )
        }
        confirmLabel="نعم، احذف السنة"
        loading={Boolean(deletingYearId)}
        loadingLabel="جاري الحذف..."
        error={deleteYearError}
        onConfirm={handleDeleteYear}
        onCancel={() => {
          if (!deletingYearId) {
            setDeleteYearTarget(null);
            setDeleteYearError("");
          }
        }}
      />

      {!isArchiveView ? (
      <ConfirmDialog
        open={Boolean(deleteTermTarget)}
        title="تأكيد حذف الفصل الدراسي"
        description={
          deleteTermTarget ? (
            <>
              هل أنت متأكد من حذف «{deleteTermTarget.name || "هذا الفصل"}»؟
              <br />
              لن يُحذف نهائياً من النظام إلا بعد حفظ الفصول.
              {deleteTermTarget.isCurrent ? (
                <>
                  <br />
                  <span className="font-semibold text-p-red">
                    تنبيه: هذا هو الفصل الحالي وسيُعيَّن الفصل الأول كفصل حالي بدلاً منه.
                  </span>
                </>
              ) : null}
            </>
          ) : (
            ""
          )
        }
        confirmLabel="نعم، احذف الفصل"
        onConfirm={() => {
          if (!deleteTermTarget) return;
          handleRemoveTerm(deleteTermTarget.id);
          setDeleteTermTarget(null);
        }}
        onCancel={() => setDeleteTermTarget(null)}
      />
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="space-y-3 p-4">
          <h2 className="font-bold text-p-black">
            {isArchiveView ? "السنوات المؤرشفة" : "السنوات الدراسية"}
          </h2>
          {sidebarYears.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {isArchiveView ? "لا توجد سنوات مؤرشفة بعد." : "لا توجد سنوات بعد."}
            </p>
          ) : (
            sidebarYears.map((year) => (
              <div
                key={year.id}
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3 py-3 transition",
                  selectedYearId === year.id
                    ? "border-p-green bg-p-green/5"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedYearId(year.id)}
                  className="min-w-0 flex-1 text-start"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-p-black">{year.name}</span>
                    {year.isActive ? (
                      <Badge variant="success">نشطة</Badge>
                    ) : isArchivedAcademicYear(year) ? (
                      <Badge variant="default">مؤرشفة</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-p-black/55">
                    {year.startDate} — {year.endDate}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteYearError("");
                    setDeleteYearTarget(year);
                  }}
                  className="rounded-lg p-2 text-p-red/70 transition hover:bg-p-red/5 hover:text-p-red"
                  aria-label={`حذف ${year.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </Card>

        <div className="min-w-0 space-y-4">
          {selectedYear ? (
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-p-black">{selectedYear.name}</h2>
                  <p className="mt-1 text-sm text-p-black/55">
                    {selectedYear.startDate} — {selectedYear.endDate}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isArchiveView ? (
                    <Badge variant="default">مؤرشفة</Badge>
                  ) : !selectedYear.isActive ? (
                    <Button
                      onClick={() => handleSetActive(selectedYear.id)}
                      disabled={activatingYearId === selectedYear.id}
                    >
                      {activatingYearId === selectedYear.id ? "جاري التفعيل..." : "تفعيل السنة"}
                    </Button>
                  ) : (
                    <Badge variant="success">السنة النشطة</Badge>
                  )}
                  <Button
                    variant="outline"
                    className="text-p-red hover:bg-p-red/5"
                    onClick={() => {
                      setDeleteYearError("");
                      setDeleteYearTarget(selectedYear);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isArchiveView ? "حذف من الأرشيف" : "حذف السنة"}
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {children}

          {!selectedYear ? (
            <Card className="flex min-h-48 items-center justify-center text-neutral-500">
              {isArchiveView
                ? "اختر سنة مؤرشفة من القائمة."
                : "اختر سنة دراسية من القائمة."}
            </Card>
          ) : null}
        </div>
      </div>

      <CertificatePreviewDialog
        open={certificateVisualPreview != null}
        title={certificateVisualPreview?.title ?? ""}
        html={certificatePreviewHtml}
        loading={loadingCertificateVisualPreview}
        downloading={
          certificateVisualPreview
            ? exportingCertificateStudentId ===
              `${certificateVisualPreview.studentId}-${certificateVisualPreview.kind}`
            : false
        }
        onClose={closeCertificateVisualPreview}
        onDownload={
          certificateVisualPreview
            ? () =>
                handleDownloadPreviewCertificate(
                  certificateVisualPreview.studentId,
                  certificateVisualPreview.kind
                )
            : undefined
        }
      />
    </div>
  );
}
