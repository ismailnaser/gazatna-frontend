"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { exportHonorsCertificatePdf } from "@/lib/exportHonorsCertificatePdf";
import { exportStudentCertificatePdf } from "@/lib/exportStudentCertificatePdf";
import { cn } from "@/lib/utils";
import type { ParentCertificatesResponse } from "@/types/academic";
import { mapParentCertificatesResponse } from "@/types/academic";
import { mapFeeStatus } from "@/types/finance";
import { Award, Download, Lock, Medal } from "lucide-react";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

function formatPercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export default function ParentCertificatesPage() {
  const [data, setData] = useState<ParentCertificatesResponse | null>(null);
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [loading, setLoading] = useState(true);
  const [exportError, setExportError] = useState("");
  const [exportingRegular, setExportingRegular] = useState(false);
  const [exportingHonors, setExportingHonors] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = mapParentCertificatesResponse(
        (await api.getParentCertificates()) as Record<string, unknown>
      );
      setData(response);
    } catch {
      setData({
        published: false,
        message: "تعذر تحميل الشهادات.",
        config: null,
        certificate: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificates();
    api
      .getSiteSettings()
      .then((res) => {
        const hero = (res as { hero?: { schoolName?: string } }).hero;
        if (hero?.schoolName?.trim()) setSchoolName(hero.schoolName.trim());
      })
      .catch(() => {});
    api
      .getParentFees()
      .then((feeData) => {
        const status = mapFeeStatus(feeData.feeStatus as Record<string, unknown>);
        setBlocked(Boolean(status?.blocked));
        setBlockMessage(status?.message ?? "");
      })
      .catch(() => {
        setBlocked(false);
        setBlockMessage("");
      });
  }, [loadCertificates]);

  async function handleDownloadRegular() {
    if (!data?.published || !data.certificate || !data.config) return;
    setExportError("");
    setExportingRegular(true);
    try {
      await exportStudentCertificatePdf({
        certificate: data.certificate,
        config: data.config,
        schoolName,
      });
    } catch {
      setExportError("تعذر تحميل شهادة العلامات.");
    } finally {
      setExportingRegular(false);
    }
  }

  async function handleDownloadHonors() {
    if (!data?.published || !data.certificate || !data.config) return;
    if (!data.certificate.qualifiesHonors) return;
    setExportError("");
    setExportingHonors(true);
    try {
      await exportHonorsCertificatePdf({
        certificate: data.certificate,
        config: data.config,
        schoolName,
      });
    } catch {
      setExportError("تعذر تحميل شهادة التقدير.");
    } finally {
      setExportingHonors(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (blocked) {
    return (
      <div>
        <PageHeader title="الشهادات" description="الشهادات الرسمية الصادرة من الإدارة" />
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <p>{blockMessage || "عذراً، يرجى تسديد القسط المستحق لعرض الشهادات."}</p>
          </div>
        </Alert>
      </div>
    );
  }

  const certificate = data?.certificate;
  const config = data?.config;

  return (
    <div>
      <PageHeader
        title="الشهادات"
        description="الشهادات الرسمية الصادرة من الإدارة في نهاية الفصل أو السنة"
      />

      {exportError ? (
        <Alert variant="error" className="mb-4">
          {exportError}
        </Alert>
      ) : null}

      {!data?.published ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <Medal className="h-10 w-10 text-p-black/25" />
          <p className="text-neutral-600">{data?.message || "لم تصدر الإدارة الشهادات بعد."}</p>
          <p className="text-sm text-p-black/45">
            ستظهر الشهادة هنا بعد أن تقرر الإدارة إصدارها ونشرها.
          </p>
        </Card>
      ) : certificate && config ? (
        <div className="space-y-4">
          <Card className="overflow-hidden border-p-green/20 p-0">
            <div className="border-b border-neutral-100 bg-p-green/5 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-p-black">{config.certificateTitle}</h2>
                    <Badge variant="success">منشورة</Badge>
                  </div>
                  <p className="mt-1 text-sm text-p-black/55">{certificate.periodLabel}</p>
                </div>
                <Button onClick={handleDownloadRegular} disabled={exportingRegular}>
                  <Download className="h-4 w-4" />
                  {exportingRegular ? "جاري التحميل..." : "تحميل الشهادة"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-p-black/50">اسم الطالب</p>
                <p className="font-semibold text-p-black">{certificate.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-p-black/50">الصف</p>
                <p className="font-semibold text-p-black">
                  {certificate.gradeLevel} {certificate.section}
                </p>
              </div>
              <div>
                <p className="text-xs text-p-black/50">المعدل من 100%</p>
                <p className="text-xl font-bold text-p-green">{formatPercent(certificate.averagePercent)}</p>
              </div>
              <div>
                <p className="text-xs text-p-black/50">المواد المحتسبة</p>
                <p className="font-semibold text-p-black">
                  {certificate.gradedSubjectsCount}/{certificate.assignedSubjectsCount}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border-t border-neutral-100">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                    <th className="px-4 py-2.5 text-start font-semibold">المادة</th>
                    <th className="px-4 py-2.5 text-start font-semibold">العلامة</th>
                    <th className="px-4 py-2.5 text-start font-semibold">النسبة من 100%</th>
                  </tr>
                </thead>
                <tbody>
                  {certificate.subjects.map((subject) => (
                    <tr key={subject.subject} className="border-b border-neutral-50">
                      <td className="px-4 py-2.5 font-medium text-p-black">{subject.subject}</td>
                      <td className="px-4 py-2.5 text-p-black/70">
                        {subject.score == null || subject.maxScore == null
                          ? "—"
                          : `${subject.score}/${subject.maxScore}`}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 font-semibold",
                          subject.percent == null
                            ? "text-p-black/45"
                            : subject.percent >= 50
                              ? "text-p-green"
                              : "text-p-red"
                        )}
                      >
                        {formatPercent(subject.percent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {config.honorsEnabled && certificate.qualifiesHonors ? (
            <Card className="overflow-hidden border-amber-300/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-0">
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-200/70 p-2.5">
                    <Award className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">{config.honorsTitle}</h3>
                    <p className="mt-1 text-sm text-amber-900/70">
                      مبروك! معدلك {formatPercent(certificate.averagePercent)} يؤهّلك لشهادة التقدير
                      (الحد الأدنى {config.honorsMinAverage}%).
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-900/80">
                      {config.honorsMessage}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDownloadHonors}
                  disabled={exportingHonors}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Download className="h-4 w-4" />
                  {exportingHonors ? "جاري التحميل..." : "تحميل شهادة التقدير"}
                </Button>
              </div>
            </Card>
          ) : config.honorsEnabled ? (
            <Alert variant="info">
              شهادة التقدير متاحة للطلاب الذين يحققون معدلاً لا يقل عن {config.honorsMinAverage}%.
            </Alert>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
