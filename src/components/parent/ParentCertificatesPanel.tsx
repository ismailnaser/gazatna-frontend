"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { exportHonorsCertificatePdf } from "@/lib/exportHonorsCertificatePdf";
import { exportStudentCertificatePdf } from "@/lib/exportStudentCertificatePdf";
import { cn } from "@/lib/utils";
import type {
  CertificateConfig,
  ParentCertificatesResponse,
  PublishedCertificate,
  StudentCertificate,
} from "@/types/academic";
import { Download, Medal, Trophy } from "lucide-react";

function formatPercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function CertificateCard({
  title,
  certificate,
  config,
  honorsTitle,
  schoolName,
  visibleUntil,
  archiveAfterGrace,
}: {
  title: string;
  certificate: StudentCertificate;
  config: CertificateConfig;
  honorsTitle?: string;
  schoolName: string;
  visibleUntil?: string;
  archiveAfterGrace?: boolean;
}) {
  const resolvedHonorsTitle = honorsTitle?.trim() || config.honorsTitle;
  const [exportError, setExportError] = useState("");
  const [exportingRegular, setExportingRegular] = useState(false);
  const [exportingHonors, setExportingHonors] = useState(false);

  async function handleDownloadRegular() {
    setExportError("");
    setExportingRegular(true);
    try {
      await exportStudentCertificatePdf({ certificate, config, schoolName });
    } catch {
      setExportError("تعذر تحميل شهادة العلامات.");
    } finally {
      setExportingRegular(false);
    }
  }

  async function handleDownloadHonors() {
    if (!certificate.qualifiesHonors) return;
    setExportError("");
    setExportingHonors(true);
    try {
      await exportHonorsCertificatePdf({ certificate, config, schoolName, honorsTitle: resolvedHonorsTitle });
    } catch {
      setExportError("تعذر تحميل شهادة التقدير.");
    } finally {
      setExportingHonors(false);
    }
  }

  return (
    <div className="space-y-4">
      {exportError ? <Alert variant="error">{exportError}</Alert> : null}

      {config.honorsEnabled && certificate.qualifiesHonors ? (
        <Card className="overflow-hidden border-[3px] border-brand-yellow bg-[#fff8ec] p-0 shadow-[-6px_7px_0_0_rgba(249,180,40,0.4)]">
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-yellow shadow-[-3px_3px_0_0_rgba(234,102,34,0.4)]">
                <Trophy className="h-7 w-7 text-p-black" />
              </span>
              <div>
                <p className="font-display text-xs font-extrabold text-brand-orange">نجمة الفصل</p>
                <h3 className="font-display text-2xl font-extrabold text-p-black">{resolvedHonorsTitle}</h3>
                <p className="mt-1 text-sm font-semibold text-p-black/75">
                  مبروك {certificate.studentName}! معدلك {formatPercent(certificate.averagePercent)} يستحق الاحتفال.
                </p>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-p-black/70">
                  {config.honorsMessage}
                </p>
              </div>
            </div>
            <Button onClick={handleDownloadHonors} disabled={exportingHonors} variant="accent">
              <Download className="h-4 w-4" />
              {exportingHonors ? "جاري التحميل..." : "تحميل شهادة التقدير"}
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="border-b-2 border-brand-yellow/50 bg-[#fff8ec] px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-extrabold text-p-black">{title}</h2>
                <Badge variant="success">منشورة</Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-p-black/70">{certificate.periodLabel}</p>
              {archiveAfterGrace && visibleUntil ? (
                <p className="mt-1 text-xs font-bold text-brand-blue">
                  تبقى في قسم الشهادات حتى {visibleUntil} ثم تنتقل إلى أرشيف الشهادات
                </p>
              ) : null}
            </div>
            <Button onClick={handleDownloadRegular} disabled={exportingRegular}>
              <Download className="h-4 w-4" />
              {exportingRegular ? "جاري التحميل..." : "تحميل الشهادة"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold text-p-black/50">اسم الطالب</p>
            <p className="font-display font-extrabold text-p-black">{certificate.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-p-black/50">الصف</p>
            <p className="font-semibold text-p-black">
              {certificate.gradeLevel} {certificate.section}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-p-black/50">المعدل من 100%</p>
            <p className="font-display text-2xl font-extrabold text-brand-blue">{formatPercent(certificate.averagePercent)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-p-black/50">المواد المحتسبة</p>
            <p className="font-semibold text-p-black">
              {certificate.gradedSubjectsCount}/{certificate.assignedSubjectsCount}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-neutral-100">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-brand-blue text-white">
                <th className="px-4 py-2.5 text-start text-xs font-extrabold">المادة</th>
                <th className="px-4 py-2.5 text-start text-xs font-extrabold">العلامة</th>
                <th className="px-4 py-2.5 text-start text-xs font-extrabold">النسبة من 100%</th>
              </tr>
            </thead>
            <tbody>
              {certificate.subjects.map((subject) => (
                <tr key={`${title}-${subject.subject}`} className="border-b border-neutral-50">
                  <td className="px-4 py-2.5 font-extrabold text-p-black">{subject.subject}</td>
                  <td className="px-4 py-2.5 font-semibold text-p-black/70">
                    {subject.score == null || subject.maxScore == null
                      ? "—"
                      : `${subject.score}/${subject.maxScore}`}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 font-extrabold",
                      subject.percent == null
                        ? "text-p-black/70"
                        : subject.percent >= 90
                          ? "text-brand-orange"
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

      {config.honorsEnabled && !certificate.qualifiesHonors ? (
        <Alert variant="info">
          شهادة التقدير تظهر للطلاب الذين يحققون معدلاً لا يقل عن {config.honorsMinAverage}٪ — كمّل المشوار، أنت قريب.
        </Alert>
      ) : null}
    </div>
  );
}

export function resolvePublishedCertificates(data: ParentCertificatesResponse): PublishedCertificate[] {
  if (data.certificates.length > 0) return data.certificates;
  if (data.certificate && data.config) {
    return [
      {
        scope: data.config.issuanceScope,
        scopeLabel: data.config.certificateTitle,
        certificate: data.certificate,
      },
    ];
  }
  return [];
}

export function ParentCertificatesPanel({
  data,
  schoolName,
  emptyTitle = "لم تصدر الإدارة الشهادات بعد.",
  emptyDescription = "ستظهر الشهادة هنا بعد أن تقرر الإدارة إصدارها ونشرها.",
}: {
  data: ParentCertificatesResponse | null;
  schoolName: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const config = data?.config;
  const publishedCertificates = data ? resolvePublishedCertificates(data) : [];

  if (!data?.published || !config || publishedCertificates.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow">
          <Medal className="h-7 w-7 text-p-black" />
        </span>
        <p className="font-display text-lg font-extrabold text-p-black">{data?.message || emptyTitle}</p>
        <p className="text-sm font-semibold text-p-black/70">{emptyDescription}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {publishedCertificates.map((entry) => (
        <CertificateCard
          key={`${entry.academicYearId ?? "year"}-${entry.scope}`}
          title={entry.scopeLabel || entry.config?.certificateTitle || config.certificateTitle}
          certificate={entry.certificate}
          config={entry.config ?? config}
          honorsTitle={entry.honorsTitle}
          schoolName={schoolName}
          visibleUntil={entry.visibleUntil}
          archiveAfterGrace={entry.archiveAfterGrace}
        />
      ))}
    </div>
  );
}
