"use client";

import { Fragment } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import { certificateScopeLabels } from "@/types/academic";
import type { CertificateConfig } from "@/types/academic";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, Medal, Save } from "lucide-react";
import { formatCertificatePercent, getTermDisplayName } from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

export function CertificateSettingsPanel() {
  const {
    selectedYear,
    certificateConfig,
    certificateDraft,
    setCertificateDraft,
    activeCertificateTerm,
    loadingCertificate,
    savingCertificate,
    certificateSaved,
    certificatePublishSuccess,
    publishingCertificates,
    unpublishingCertificates,
    certificatePreview,
    loadingCertificatePreview,
    expandedCertificateStudentIds,
    exportingCertificateStudentId,
    handleSaveCertificateConfig,
    handlePublishCertificates,
    handleUnpublishCertificates,
    handleLoadCertificatePreview,
    toggleCertificateStudentExpanded,
    handlePreviewCertificate,
    handleDownloadPreviewCertificate,
  } = useAcademicAdmin();

  if (!selectedYear) return null;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Medal className="h-5 w-5 text-p-green" />
            <h3 className="font-bold text-p-black">إعدادات الشهادات</h3>
            {certificateConfig?.isPublished ? (
              <Badge variant="success">منشورة للطلاب</Badge>
            ) : (
              <Badge variant="default">غير منشورة</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-p-black/55">
            تحديد دورة إصدار الشهادات، المعدل من 100%، وشهادة التقدير للمعدلات العالية.
          </p>
          {certificateConfig?.publishedAt ? (
            <p className="mt-1 text-xs text-p-black/45">
              آخر نشر: {new Date(certificateConfig.publishedAt).toLocaleString("ar")}
            </p>
          ) : null}
        </div>
      </div>

      {loadingCertificate ? (
        <p className="text-sm text-neutral-500">جاري تحميل إعدادات الشهادات...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="دورة إصدار الشهادات"
              value={certificateDraft.issuanceScope}
              options={Object.entries(certificateScopeLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(e) =>
                setCertificateDraft((prev) => ({
                  ...prev,
                  issuanceScope: e.target.value as CertificateConfig["issuanceScope"],
                }))
              }
            />

            <Input
              label="عنوان الشهادة الرسمية"
              value={certificateDraft.certificateTitle}
              onChange={(e) =>
                setCertificateDraft((prev) => ({
                  ...prev,
                  certificateTitle: e.target.value,
                }))
              }
            />

            <label className="flex items-center gap-2 text-sm text-p-black md:col-span-2">
              <input
                type="checkbox"
                checked={certificateDraft.honorsEnabled}
                onChange={(e) =>
                  setCertificateDraft((prev) => ({
                    ...prev,
                    honorsEnabled: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              تفعيل شهادة التقدير للمعدلات العالية
            </label>

            <Input
              label="أقل معدل لشهادة التقدير (%)"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={certificateDraft.honorsMinAverage}
              onChange={(e) =>
                setCertificateDraft((prev) => ({
                  ...prev,
                  honorsMinAverage: Number(e.target.value),
                }))
              }
              disabled={!certificateDraft.honorsEnabled}
            />

            <Input
              label="عنوان شهادة التقدير"
              value={certificateDraft.honorsTitle}
              onChange={(e) =>
                setCertificateDraft((prev) => ({
                  ...prev,
                  honorsTitle: e.target.value,
                }))
              }
              disabled={!certificateDraft.honorsEnabled}
            />

            <Textarea
              label="نص تقديري لشهادة التقدير"
              value={certificateDraft.honorsMessage}
              onChange={(e) =>
                setCertificateDraft((prev) => ({
                  ...prev,
                  honorsMessage: e.target.value,
                }))
              }
              disabled={!certificateDraft.honorsEnabled}
              className="md:col-span-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSaveCertificateConfig} disabled={savingCertificate}>
              <Save className="h-4 w-4" />
              {savingCertificate ? "جاري الحفظ..." : "حفظ إعدادات الشهادات"}
            </Button>
            <SaveFeedback
              success={certificateSaved ? "تم حفظ إعدادات الشهادات بنجاح." : null}
            />
          </div>

          {selectedYear.isActive ? (
            <div className="rounded-xl border border-neutral-200 bg-p-cream/40 p-4">
              <h4 className="font-semibold text-p-black">إصدار الشهادات للطلاب</h4>
              <p className="mt-1 text-xs text-p-black/55">
                بعد النشر، تظهر الشهادات في صفحة «الشهادات» لأولياء الأمور مع إمكانية التحميل.
              </p>

              {certificateDraft.issuanceScope === "term" ? (
                <p className="mt-3 text-sm text-p-black/70">
                  {activeCertificateTerm ? (
                    <>
                      سيتم إصدار الشهادات للفصل النشط حالياً:{" "}
                      <span className="font-semibold text-p-black">
                        {getTermDisplayName(activeCertificateTerm)}
                      </span>
                    </>
                  ) : (
                    <span className="text-p-red">
                      لا يوجد فصل دراسي نشط. عيّن الفصل الحالي من إعدادات الفصول الدراسية.
                    </span>
                  )}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleLoadCertificatePreview}
                  disabled={loadingCertificatePreview}
                >
                  <Eye className="h-4 w-4" />
                  {loadingCertificatePreview ? "جاري المعاينة..." : "معاينة الشهادات"}
                </Button>
                <Button
                  onClick={handlePublishCertificates}
                  disabled={publishingCertificates || certificateConfig?.isPublished}
                >
                  {publishingCertificates ? "جاري الإصدار..." : "إصدار ونشر الشهادات"}
                </Button>
                {certificateConfig?.isPublished ? (
                  <Button
                    variant="outline"
                    onClick={handleUnpublishCertificates}
                    disabled={unpublishingCertificates}
                  >
                    {unpublishingCertificates ? "جاري الإلغاء..." : "إلغاء النشر"}
                  </Button>
                ) : null}
              </div>

              <SaveFeedback success={certificatePublishSuccess || null} className="mt-3" />

              {certificatePreview ? (
                <div className="mt-6 space-y-4 border-t border-neutral-200 pt-4">
                  <div>
                    <h5 className="font-semibold text-p-black">نتائج المعاينة</h5>
                    <p className="mt-1 text-xs text-p-black/55">{certificatePreview.periodLabel}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "إجمالي الطلاب", value: certificatePreview.summary.total },
                      { label: "لديهم معدل", value: certificatePreview.summary.withAverage },
                      { label: "بدون معدل", value: certificatePreview.summary.withoutAverage },
                      { label: "شهادة تقدير", value: certificatePreview.summary.honors },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-white px-3 py-2 text-center">
                        <p className="text-lg font-bold text-p-black">{item.value}</p>
                        <p className="text-xs text-p-black/55">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
                    <table className="w-full min-w-[980px] text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                          <th className="w-10 px-2 py-2" aria-label="تفاصيل" />
                          <th className="px-3 py-2 text-start font-semibold">الطالب</th>
                          <th className="px-3 py-2 text-start font-semibold">الصف</th>
                          <th className="px-3 py-2 text-start font-semibold">المواد</th>
                          <th className="px-3 py-2 text-start font-semibold">المعدل</th>
                          <th className="px-3 py-2 text-start font-semibold">التقدير</th>
                          <th className="px-3 py-2 text-start font-semibold">معاينة الشهادة</th>
                          <th className="px-3 py-2 text-start font-semibold">تحميل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificatePreview.students.map((row) => {
                          const expanded = Boolean(expandedCertificateStudentIds[row.studentId]);
                          const exportingRegular =
                            exportingCertificateStudentId === `${row.studentId}-regular`;
                          const exportingHonors =
                            exportingCertificateStudentId === `${row.studentId}-honors`;

                          return (
                            <Fragment key={row.studentId}>
                              <tr className="border-b border-neutral-50">
                                <td className="px-2 py-2.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCertificateStudentExpanded(row.studentId)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-p-black/55 hover:bg-neutral-100"
                                    aria-label={expanded ? "إخفاء التفاصيل" : "عرض تفاصيل المواد"}
                                  >
                                    {expanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-2.5">
                                  <p className="font-medium text-p-black">{row.studentName}</p>
                                  <p className="text-xs text-p-black/45">{row.studentNumber || "—"}</p>
                                </td>
                                <td className="px-3 py-2.5">
                                  {row.gradeLevel} {row.section}
                                </td>
                                <td className="px-3 py-2.5">
                                  {row.gradedSubjectsCount}/{row.assignedSubjectsCount}
                                </td>
                                <td className="px-3 py-2.5 font-semibold text-p-green">
                                  {formatCertificatePercent(row.averagePercent)}
                                </td>
                                <td className="px-3 py-2.5">
                                  {row.qualifiesHonors ? (
                                    <Badge variant="success">مستحق</Badge>
                                  ) : (
                                    <Badge variant="default">—</Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    <Button
                                      variant="outline"
                                      className="h-8 px-2 text-xs"
                                      disabled={row.averagePercent == null}
                                      onClick={() =>
                                        handlePreviewCertificate(row.studentId, "regular")
                                      }
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      شهادة
                                    </Button>
                                    {certificatePreview.config.honorsEnabled &&
                                    row.qualifiesHonors ? (
                                      <Button
                                        variant="outline"
                                        className="h-8 border-amber-300 px-2 text-xs text-amber-800 hover:bg-amber-50"
                                        onClick={() =>
                                          handlePreviewCertificate(row.studentId, "honors")
                                        }
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                        تقدير
                                      </Button>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    <Button
                                      variant="outline"
                                      className="h-8 px-2 text-xs"
                                      disabled={exportingRegular || row.averagePercent == null}
                                      onClick={() =>
                                        handleDownloadPreviewCertificate(row.studentId, "regular")
                                      }
                                    >
                                      {exportingRegular ? "..." : "شهادة"}
                                    </Button>
                                    {certificatePreview.config.honorsEnabled &&
                                    row.qualifiesHonors ? (
                                      <Button
                                        className="h-8 bg-amber-600 px-2 text-xs hover:bg-amber-700"
                                        disabled={exportingHonors}
                                        onClick={() =>
                                          handleDownloadPreviewCertificate(row.studentId, "honors")
                                        }
                                      >
                                        {exportingHonors ? "..." : "تقدير"}
                                      </Button>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                              {expanded ? (
                                <tr className="border-b border-neutral-100 bg-neutral-50/70">
                                  <td colSpan={8} className="px-4 py-3">
                                    {row.subjects.length === 0 ? (
                                      <p className="text-sm text-p-black/50">
                                        لا توجد مواد مسندة لهذا الطالب.
                                      </p>
                                    ) : (
                                      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
                                        <table className="w-full min-w-[520px] text-sm">
                                          <thead>
                                            <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                                              <th className="px-3 py-2 text-start font-semibold">
                                                المادة
                                              </th>
                                              <th className="px-3 py-2 text-start font-semibold">
                                                العلامة
                                              </th>
                                              <th className="px-3 py-2 text-start font-semibold">
                                                من 100%
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {row.subjects.map((subject) => (
                                              <tr
                                                key={`${row.studentId}-${subject.subject}`}
                                                className="border-b border-neutral-50"
                                              >
                                                <td className="px-3 py-2 font-medium text-p-black">
                                                  {subject.subject}
                                                </td>
                                                <td className="px-3 py-2 text-p-black/70">
                                                  {subject.score == null || subject.maxScore == null
                                                    ? "—"
                                                    : `${subject.score}/${subject.maxScore}`}
                                                </td>
                                                <td
                                                  className={cn(
                                                    "px-3 py-2 font-semibold",
                                                    subject.percent == null
                                                      ? "text-p-black/45"
                                                      : subject.percent >= 50
                                                        ? "text-p-green"
                                                        : "text-p-red"
                                                  )}
                                                >
                                                  {formatCertificatePercent(subject.percent)}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleLoadCertificatePreview}
                      disabled={loadingCertificatePreview}
                    >
                      تحديث المعاينة
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Alert variant="info">
              يمكن إصدار الشهادات للطلاب في السنة الدراسية النشطة فقط.
            </Alert>
          )}
        </>
      )}
    </Card>
  );
}
