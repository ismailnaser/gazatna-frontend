"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import { CertificatePreviewDialog } from "@/components/admin/CertificatePreviewDialog";
import { exportPromotionPreviewPdf } from "@/lib/exportPromotionPreviewPdf";
import { buildHonorsCertificateHtml, buildStudentCertificateHtml } from "@/lib/certificateHtml";
import { exportHonorsCertificatePdf } from "@/lib/exportHonorsCertificatePdf";
import { exportStudentCertificatePdf } from "@/lib/exportStudentCertificatePdf";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AcademicTermStatus,
  AcademicYear,
  CertificateConfig,
  CertificatePreview,
  PromotionPolicy,
  PromotionPreview,
  PromotionStudentAction,
} from "@/types/academic";
import { PromotionPolicyEditor } from "@/components/admin/PromotionPolicyEditor";
import { mapGrade, mapGrades } from "@/lib/mapSchoolClass";
import type { Grade, Subject } from "@/types/teacher";
import {
  certificateScopeLabels,
  mapAcademicYear,
  mapCertificateConfig,
  mapCertificatePreview,
  mapPromotionPreview,
  promotionActionLabels,
} from "@/types/academic";
import { ChevronDown, ChevronUp, Download, Eye, Medal, Play, Plus, Save, Trash2 } from "lucide-react";

function formatCertificatePercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

const TERM_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];

function defaultTermName(sortOrder: number) {
  const ordinal = TERM_ORDINALS[sortOrder - 1] ?? String(sortOrder);
  return `الفصل ${ordinal}`;
}

function cloneTerms(terms: AcademicTermStatus[]): AcademicTermStatus[] {
  return terms.map((term) => ({ ...term }));
}

function suggestedTermDates(year: AcademicYear, terms: AcademicTermStatus[]) {
  const last = terms[terms.length - 1];
  if (last) {
    const start = new Date(last.endDate);
    start.setDate(start.getDate() + 1);
    const startDate = start.toISOString().slice(0, 10);
    return { startDate, endDate: year.endDate };
  }
  return { startDate: year.startDate, endDate: year.endDate };
}

function reindexTerms(terms: AcademicTermStatus[]): AcademicTermStatus[] {
  return terms.map((term, index) => ({
    ...term,
    sortOrder: index + 1,
  }));
}

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

const defaultPolicy = (): PromotionPolicy => ({
  evaluationScope: "single_term",
  yearCalculationMethod: "term_average",
  evaluationTermId: null,
  passRule: "minimum_count",
  passMinimumCount: 1,
  requiredSubjects: [],
  passScoreRatio: 0.5,
  passPromotionMode: "automatic",
  failHandlingMode: "manual_review",
});

function buildPolicyDraftsFromGrades(gradeRows: Grade[]): Record<string, PromotionPolicy> {
  const drafts: Record<string, PromotionPolicy> = {};
  for (const grade of gradeRows) {
    drafts[grade.id] = grade.promotionPolicy ? { ...grade.promotionPolicy } : defaultPolicy();
  }
  return drafts;
}

function buildPassMinimumCountInputs(drafts: Record<string, PromotionPolicy>): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const [termId, policy] of Object.entries(drafts)) {
    inputs[termId] = String(policy.passMinimumCount);
  }
  return inputs;
}

const defaultCertificateConfig = (): CertificateConfig => ({
  academicYearId: "",
  issuanceScope: "term",
  isPublished: false,
  publishedAt: null,
  publishedTermId: null,
  honorsEnabled: true,
  honorsMinAverage: 95,
  honorsTitle: "شهادة تقدير",
  honorsMessage:
    "تقديراً للتميز والاجتهاد، تُمنح هذه الشهادة اعترافاً بالمعدل العالي والأداء المتميز طوال الفترة الدراسية.",
  certificateTitle: "شهادة علامات",
  updatedAt: null,
});

function nextYearName(years: AcademicYear[]) {
  const now = new Date();
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  let candidate = `${start}-${start + 1}`;
  const existing = new Set(years.map((year) => year.name));
  while (existing.has(candidate)) {
    const base = Number(candidate.split("-")[0]) + 1;
    candidate = `${base}-${base + 1}`;
  }
  return candidate;
}

function resolveStudentDecision(
  row: PromotionPreview["students"][number],
  decisions: Record<string, PromotionStudentAction>
): PromotionStudentAction {
  const override = decisions[row.studentId];
  if (override && override !== "pending") return override;
  if (row.finalAction !== "pending") return row.finalAction;
  return row.yearPassed ? "promote" : "repeat";
}

export default function AdminAcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [policyDraftsByGradeId, setPolicyDraftsByGradeId] = useState<Record<string, PromotionPolicy>>({});
  const [passMinimumCountInputs, setPassMinimumCountInputs] = useState<Record<string, string>>({});
  const [requiredSubjectPickers, setRequiredSubjectPickers] = useState<Record<string, string>>({});
  const [savingPolicyGradeId, setSavingPolicyGradeId] = useState("");
  const [savedPolicyGradeId, setSavedPolicyGradeId] = useState("");
  const [creatingYear, setCreatingYear] = useState(false);
  const [activatingYearId, setActivatingYearId] = useState("");
  const [settingTermId, setSettingTermId] = useState("");
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [decisions, setDecisions] = useState<Record<string, PromotionStudentAction>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executingRollover, setExecutingRollover] = useState(false);
  const [rolloverSuccess, setRolloverSuccess] = useState("");
  const [newYearName, setNewYearName] = useState("");
  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig | null>(null);
  const [certificateDraft, setCertificateDraft] = useState<CertificateConfig>(defaultCertificateConfig());
  const [publishTermId, setPublishTermId] = useState("");
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [certificateSaved, setCertificateSaved] = useState(false);
  const [publishingCertificates, setPublishingCertificates] = useState(false);
  const [unpublishingCertificates, setUnpublishingCertificates] = useState(false);
  const [certificatePreview, setCertificatePreview] = useState<CertificatePreview | null>(null);
  const [loadingCertificatePreview, setLoadingCertificatePreview] = useState(false);
  const [expandedCertificateStudentIds, setExpandedCertificateStudentIds] = useState<
    Record<string, boolean>
  >({});
  const [exportingCertificateStudentId, setExportingCertificateStudentId] = useState("");
  const [certificateVisualPreview, setCertificateVisualPreview] = useState<{
    studentId: string;
    kind: "regular" | "honors";
    title: string;
  } | null>(null);
  const [certificatePreviewHtml, setCertificatePreviewHtml] = useState<string | null>(null);
  const [loadingCertificateVisualPreview, setLoadingCertificateVisualPreview] = useState(false);
  const [termsDraft, setTermsDraft] = useState<AcademicTermStatus[]>([]);
  const [savingTerms, setSavingTerms] = useState(false);
  const [termsSaved, setTermsSaved] = useState(false);

  const selectedYear = useMemo(
    () => years.find((year) => year.id === selectedYearId) ?? null,
    [years, selectedYearId]
  );

  const termSelectOptions = useMemo(
    () => [
      { value: "", label: "اختر الفصل" },
      ...(termsDraft.length > 0
        ? termsDraft.map((term) => ({ value: term.id, label: term.name }))
        : (selectedYear?.terms.map((term) => ({ value: term.id, label: term.name })) ?? [])),
    ],
    [selectedYear, termsDraft]
  );

  const promotionDecisionOptions = useMemo(
    () => [
      { value: "promote", label: "ترفيع" },
      { value: "repeat", label: "إعادة الصف" },
      { value: "graduate", label: "تخرّج" },
    ],
    []
  );

  const reloadGrades = useCallback(async () => {
    setLoadingGrades(true);
    try {
      const data = await api.getAdminGrades();
      const mapped = mapGrades(data as unknown[]).sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      setGrades(mapped);
      const drafts = buildPolicyDraftsFromGrades(mapped);
      setPolicyDraftsByGradeId(drafts);
      setPassMinimumCountInputs(buildPassMinimumCountInputs(drafts));
    } catch {
      setGrades([]);
      setPolicyDraftsByGradeId({});
      setPassMinimumCountInputs({});
    } finally {
      setLoadingGrades(false);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminAcademicYears();
      const mapped = (data as Array<Record<string, unknown>>).map(mapAcademicYear);
      setYears(mapped);
      setSelectedYearId((current) => current || mapped.find((year) => year.isActive)?.id || mapped[0]?.id || "");
    } catch {
      setError("تعذر تحميل السنوات الدراسية");
      setYears([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    void reloadGrades();
    api
      .getSiteSettings()
      .then((res) => {
        const name = (res as { hero?: { schoolName?: string } }).hero?.schoolName?.trim();
        if (name) setSchoolName(name);
      })
      .catch(() => {});
    api
      .getAdminSubjects()
      .then((rows) => {
        setSubjects(
          (rows as Array<Record<string, unknown>>).map((row) => ({
            id: String(row.id),
            name: String(row.name),
            teacherCount: Number(row.teacherCount ?? 0),
          }))
        );
      })
      .catch(() => setSubjects([]));
  }, [reload, reloadGrades]);

  useEffect(() => {
    if (selectedYear) {
      setTermsDraft(cloneTerms(selectedYear.terms));
      setRequiredSubjectPickers({});
      setSavedPolicyGradeId("");
      const parts = selectedYear.name.split("-");
      if (parts.length === 2 && parts[1]) {
        setNewYearName(`${parts[1]}-${Number(parts[1]) + 1}`);
      } else {
        setNewYearName(nextYearName(years));
      }
    } else {
      setTermsDraft([]);
    }
    setPreview(null);
    setDecisions({});
    setExpandedStudentIds({});
    setRolloverSuccess("");
    setCertificateConfig(null);
    setCertificateDraft(defaultCertificateConfig());
    setPublishTermId("");
    setCertificateSaved(false);
    setCertificatePreview(null);
    setExpandedCertificateStudentIds({});
    setTermsSaved(false);
  }, [selectedYear, years]);

  useEffect(() => {
    if (!selectedYear) return;
    setLoadingCertificate(true);
    api
      .getAdminCertificateConfig(selectedYear.id)
      .then((raw) => {
        const mapped = mapCertificateConfig(raw as Record<string, unknown>);
        setCertificateConfig(mapped);
        setCertificateDraft(mapped);
        setPublishTermId(
          mapped.publishedTermId ||
            selectedYear.currentTermId ||
            selectedYear.terms[0]?.id ||
            ""
        );
      })
      .catch(() => {
        setCertificateConfig(null);
        setCertificateDraft(defaultCertificateConfig());
      })
      .finally(() => setLoadingCertificate(false));
  }, [selectedYear]);

  async function handleSaveCertificateConfig() {
    if (!selectedYear) return;
    setSavingCertificate(true);
    setCertificateSaved(false);
    setError("");
    try {
      const updated = mapCertificateConfig(
        (await api.updateAdminCertificateConfig(selectedYear.id, {
          issuanceScope: certificateDraft.issuanceScope,
          certificateTitle: certificateDraft.certificateTitle,
          honorsEnabled: certificateDraft.honorsEnabled,
          honorsMinAverage: certificateDraft.honorsMinAverage,
          honorsTitle: certificateDraft.honorsTitle,
          honorsMessage: certificateDraft.honorsMessage,
        })) as Record<string, unknown>
      );
      setCertificateConfig(updated);
      setCertificateDraft(updated);
      setCertificateSaved(true);
    } catch {
      setError("تعذر حفظ إعدادات الشهادات");
    } finally {
      setSavingCertificate(false);
    }
  }

  async function handlePublishCertificates() {
    if (!selectedYear) return;
    if (
      certificateDraft.issuanceScope === "term" &&
      !publishTermId &&
      !selectedYear.currentTermId
    ) {
      setError("حدد الفصل الدراسي قبل إصدار الشهادات");
      return;
    }
    if (
      !window.confirm(
        "سيتم نشر الشهادات للطلاب وأولياء الأمور. هل تريد المتابعة؟"
      )
    ) {
      return;
    }

    setPublishingCertificates(true);
    setError("");
    try {
      const updated = mapCertificateConfig(
        (await api.publishAdminCertificates(
          selectedYear.id,
          certificateDraft.issuanceScope === "term"
            ? { termId: publishTermId || selectedYear.currentTermId || undefined }
            : undefined
        )) as Record<string, unknown>
      );
      setCertificateConfig(updated);
      setCertificateDraft(updated);
    } catch {
      setError("تعذر إصدار الشهادات");
    } finally {
      setPublishingCertificates(false);
    }
  }

  async function handleUnpublishCertificates() {
    if (!selectedYear) return;
    if (!window.confirm("سيتم إخفاء الشهادات عن الطلاب. هل أنت متأكد؟")) return;

    setUnpublishingCertificates(true);
    setError("");
    try {
      const updated = mapCertificateConfig(
        (await api.unpublishAdminCertificates(selectedYear.id)) as Record<string, unknown>
      );
      setCertificateConfig(updated);
      setCertificateDraft(updated);
    } catch {
      setError("تعذر إلغاء نشر الشهادات");
    } finally {
      setUnpublishingCertificates(false);
    }
  }

  function buildCertificatePreviewPayload() {
    return {
      issuanceScope: certificateDraft.issuanceScope,
      certificateTitle: certificateDraft.certificateTitle,
      honorsEnabled: certificateDraft.honorsEnabled,
      honorsMinAverage: certificateDraft.honorsMinAverage,
      honorsTitle: certificateDraft.honorsTitle,
      honorsMessage: certificateDraft.honorsMessage,
      ...(certificateDraft.issuanceScope === "term"
        ? { termId: publishTermId || selectedYear?.currentTermId || undefined }
        : {}),
    };
  }

  async function handleLoadCertificatePreview() {
    if (!selectedYear) return;
    if (
      certificateDraft.issuanceScope === "term" &&
      !publishTermId &&
      !selectedYear.currentTermId
    ) {
      setError("حدد الفصل الدراسي قبل معاينة الشهادات");
      return;
    }

    setLoadingCertificatePreview(true);
    setError("");
    try {
      const mapped = mapCertificatePreview(
        (await api.getAdminCertificatePreview(
          selectedYear.id,
          buildCertificatePreviewPayload()
        )) as Record<string, unknown>
      );
      setCertificatePreview(mapped);
      setExpandedCertificateStudentIds({});
    } catch {
      setError("تعذر تحميل معاينة الشهادات");
    } finally {
      setLoadingCertificatePreview(false);
    }
  }

  function toggleCertificateStudentExpanded(studentId: string) {
    setExpandedCertificateStudentIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  async function handlePreviewCertificate(studentId: string, kind: "regular" | "honors") {
    if (!certificatePreview) return;
    const certificate = certificatePreview.students.find((row) => row.studentId === studentId);
    if (!certificate) return;
    if (kind === "regular" && certificate.averagePercent == null) return;
    if (kind === "honors" && !certificate.qualifiesHonors) return;

    const title =
      kind === "honors"
        ? `${certificatePreview.config.honorsTitle} — ${certificate.studentName}`
        : `${certificatePreview.config.certificateTitle} — ${certificate.studentName}`;

    setCertificateVisualPreview({ studentId, kind, title });
    setCertificatePreviewHtml(null);
    setLoadingCertificateVisualPreview(true);
    setError("");

    try {
      const input = {
        certificate,
        config: certificatePreview.config,
        schoolName,
      };
      const html =
        kind === "honors"
          ? await buildHonorsCertificateHtml(input)
          : await buildStudentCertificateHtml(input);
      setCertificatePreviewHtml(html);
    } catch {
      setError(kind === "honors" ? "تعذر معاينة شهادة التقدير" : "تعذر معاينة شهادة العلامات");
      setCertificateVisualPreview(null);
    } finally {
      setLoadingCertificateVisualPreview(false);
    }
  }

  function closeCertificateVisualPreview() {
    setCertificateVisualPreview(null);
    setCertificatePreviewHtml(null);
    setLoadingCertificateVisualPreview(false);
  }

  async function handleDownloadPreviewCertificate(
    studentId: string,
    kind: "regular" | "honors"
  ) {
    if (!certificatePreview) return;
    const certificate = certificatePreview.students.find((row) => row.studentId === studentId);
    if (!certificate) return;
    if (kind === "honors" && !certificate.qualifiesHonors) return;

    setExportingCertificateStudentId(`${studentId}-${kind}`);
    setError("");
    try {
      if (kind === "honors") {
        await exportHonorsCertificatePdf({
          certificate,
          config: certificatePreview.config,
          schoolName,
        });
      } else {
        await exportStudentCertificatePdf({
          certificate,
          config: certificatePreview.config,
          schoolName,
        });
      }
    } catch {
      setError(kind === "honors" ? "تعذر تحميل شهادة التقدير" : "تعذر تحميل شهادة العلامات");
    } finally {
      setExportingCertificateStudentId("");
    }
  }

  async function handleCreateYear() {
    setCreatingYear(true);
    setError("");
    try {
      const name = nextYearName(years);
      const startYear = Number(name.split("-")[0]);
      const created = await api.createAdminAcademicYear({
        name,
        startDate: `${startYear}-09-01`,
        endDate: `${startYear + 1}-06-30`,
        status: "draft",
        isActive: false,
      });
      const mapped = mapAcademicYear(created as Record<string, unknown>);
      setYears((prev) => [mapped, ...prev]);
      setSelectedYearId(mapped.id);
    } catch {
      setError("تعذر إنشاء سنة دراسية جديدة");
    } finally {
      setCreatingYear(false);
    }
  }

  async function handleSetActive(yearId: string) {
    setActivatingYearId(yearId);
    setError("");
    try {
      const updated = mapAcademicYear(
        (await api.setAdminAcademicYearActive(yearId)) as Record<string, unknown>
      );
      setYears((prev) =>
        prev.map((year) =>
          year.id === updated.id ? updated : { ...year, isActive: false, status: "archived" }
        )
      );
      setSelectedYearId(updated.id);
    } catch {
      setError("تعذر تفعيل السنة الدراسية");
    } finally {
      setActivatingYearId("");
    }
  }

  async function handleSetCurrentTerm(yearId: string, termId: string) {
    setSettingTermId(termId);
    setError("");
    try {
      const updated = mapAcademicYear(
        (await api.setAdminAcademicCurrentTerm(yearId, termId)) as Record<string, unknown>
      );
      setYears((prev) => prev.map((year) => (year.id === updated.id ? updated : year)));
      setTermsDraft(cloneTerms(updated.terms));
    } catch {
      setError("تعذر تعيين الفصل الحالي");
    } finally {
      setSettingTermId("");
    }
  }

  function updateTermDraft(termId: string, patch: Partial<AcademicTermStatus>) {
    setTermsDraft((prev) =>
      prev.map((term) => (term.id === termId ? { ...term, ...patch } : term))
    );
    setTermsSaved(false);
  }

  function handleAddTerm() {
    if (!selectedYear) return;
    const newId = `new-${Date.now()}`;
    setTermsDraft((prev) => {
      const sortOrder = prev.length + 1;
      const { startDate, endDate } = suggestedTermDates(selectedYear, prev);
      return [
        ...prev,
        {
          id: newId,
          academicYearId: selectedYear.id,
          name: defaultTermName(sortOrder),
          sortOrder,
          startDate,
          endDate,
          isCurrent: prev.length === 0,
        },
      ];
    });
    setTermsSaved(false);
  }

  function handleRemoveTerm(termId: string) {
    setTermsDraft((prev) => {
      if (prev.length <= 1) return prev;
      const removed = prev.find((term) => term.id === termId);
      const next = reindexTerms(prev.filter((term) => term.id !== termId));
      if (removed?.isCurrent && next.length > 0) {
        next[0] = { ...next[0], isCurrent: true };
      }
      return next;
    });
    setTermsSaved(false);
  }

  function updateGradePolicyDraft(gradeId: string, patch: Partial<PromotionPolicy>) {
    setPolicyDraftsByGradeId((prev) => ({
      ...prev,
      [gradeId]: { ...(prev[gradeId] ?? defaultPolicy()), ...patch },
    }));
    setSavedPolicyGradeId("");
  }

  function addRequiredSubject(gradeId: string) {
    const value = (requiredSubjectPickers[gradeId] ?? "").trim();
    const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
    if (!value || draft.requiredSubjects.includes(value)) return;
    updateGradePolicyDraft(gradeId, {
      requiredSubjects: [...draft.requiredSubjects, value],
    });
    setRequiredSubjectPickers((prev) => ({ ...prev, [gradeId]: "" }));
  }

  function removeRequiredSubject(gradeId: string, subjectName: string) {
    const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
    updateGradePolicyDraft(gradeId, {
      requiredSubjects: draft.requiredSubjects.filter((item) => item !== subjectName),
    });
  }

  async function handleSaveTerms() {
    if (!selectedYear) return;
    if (termsDraft.length === 0) {
      setError("يجب تحديد فصل دراسي واحد على الأقل");
      return;
    }
    for (const term of termsDraft) {
      if (!term.name.trim()) {
        setError("أدخل اسم كل فصل دراسي");
        return;
      }
      if (term.endDate < term.startDate) {
        setError(`تاريخ نهاية «${term.name}» يجب أن يكون بعد البداية`);
        return;
      }
    }

    setSavingTerms(true);
    setTermsSaved(false);
    setError("");
    try {
      const updated = mapAcademicYear(
        (await api.updateAdminAcademicYear(selectedYear.id, {
          terms: reindexTerms(termsDraft).map((term) => ({
            id: term.id.startsWith("new-") ? "" : term.id,
            name: term.name.trim(),
            sortOrder: term.sortOrder,
            startDate: term.startDate,
            endDate: term.endDate,
            isCurrent: term.isCurrent,
          })),
        })) as Record<string, unknown>
      );
      setYears((prev) => prev.map((year) => (year.id === updated.id ? updated : year)));
      setTermsDraft(cloneTerms(updated.terms));
      setPublishTermId(
        updated.currentTermId || updated.terms.find((term) => term.isCurrent)?.id || ""
      );
      setTermsSaved(true);
    } catch {
      setError("تعذر حفظ الفصول الدراسية");
    } finally {
      setSavingTerms(false);
    }
  }

  async function handleSaveGradePolicy(gradeId: string) {
    const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
    const normalizedMinimumCount = Math.max(1, Number(passMinimumCountInputs[gradeId]) || 1);
    setPassMinimumCountInputs((prev) => ({ ...prev, [gradeId]: String(normalizedMinimumCount) }));
    const payload = { ...draft, passMinimumCount: normalizedMinimumCount, evaluationScope: "single_term" };
    updateGradePolicyDraft(gradeId, payload);
    setSavingPolicyGradeId(gradeId);
    setSavedPolicyGradeId("");
    setError("");
    try {
      const updated = mapGrade(
        (await api.updateAdminGradePromotionPolicy(gradeId, payload)) as Record<string, unknown>
      );
      setGrades((prev) => prev.map((grade) => (grade.id === updated.id ? updated : grade)));
      setPolicyDraftsByGradeId((prev) => ({
        ...prev,
        [gradeId]: updated.promotionPolicy ? { ...updated.promotionPolicy } : payload,
      }));
      setPassMinimumCountInputs((prev) => ({ ...prev, [gradeId]: String(normalizedMinimumCount) }));
      setSavedPolicyGradeId(gradeId);
    } catch {
      setError("تعذر حفظ سياسة الترفيع");
    } finally {
      setSavingPolicyGradeId("");
    }
  }

  function subjectPickerOptions(gradeId: string) {
    const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
    return [
      { value: "", label: subjects.length ? "اختر مادة" : "لا توجد مواد مسجّلة" },
      ...subjects
        .filter((subject) => !draft.requiredSubjects.includes(subject.name))
        .map((subject) => ({ value: subject.name, label: subject.name })),
    ];
  }

  function toggleStudentExpanded(studentId: string) {
    setExpandedStudentIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  async function handleExportPdf() {
    if (!preview) return;
    setExportingPdf(true);
    setError("");
    try {
      await exportPromotionPreviewPdf({
        preview,
        decisions,
        schoolName,
      });
    } catch {
      setError("تعذر تصدير ملف PDF");
    } finally {
      setExportingPdf(false);
    }
  }

  function buildDecisionsPayload() {
    return Object.entries(decisions)
      .filter(([, action]) => action && action !== "pending")
      .map(([studentId, action]) => ({ studentId, action }));
  }

  async function handleLoadPreview() {
    if (!selectedYear) return;
    setLoadingPreview(true);
    setError("");
    setRolloverSuccess("");
    try {
      const payload = buildDecisionsPayload();
      const data = await api.getAdminPromotionPreview(
        selectedYear.id,
        payload.length ? payload : undefined
      );
      const mapped = mapPromotionPreview(data as Record<string, unknown>);
      const autoDecisions: Record<string, PromotionStudentAction> = {};
      for (const row of mapped.students) {
        if (row.needsReview) {
          autoDecisions[row.studentId] = row.yearPassed ? "promote" : "repeat";
        }
      }
      setDecisions(autoDecisions);

      if (Object.keys(autoDecisions).length > 0) {
        const refreshed = mapPromotionPreview(
          (await api.getAdminPromotionPreview(
            selectedYear.id,
            Object.entries(autoDecisions).map(([studentId, action]) => ({ studentId, action }))
          )) as Record<string, unknown>
        );
        setPreview(refreshed);
      } else {
        setPreview(mapped);
      }
    } catch {
      setError("تعذر تحميل معاينة الترفيع");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleExecuteRollover() {
    if (!selectedYear || !preview) return;
    if (
      !window.confirm(
        "سيتم أرشفة السنة الحالية، ترفيع/إعادة الطلاب، وفتح سنة جديدة. هل أنت متأكد؟"
      )
    ) {
      return;
    }

    setExecutingRollover(true);
    setError("");
    setRolloverSuccess("");
    try {
      const payload = buildDecisionsPayload();
      const result = (await api.executeAdminYearRollover(selectedYear.id, {
        decisions: payload,
        newYearName: newYearName.trim() || undefined,
      })) as Record<string, unknown>;
      const newYear = result.newYear as Record<string, unknown> | undefined;
      setRolloverSuccess(
        newYear?.name
          ? `تم تنفيذ نهاية السنة بنجاح. السنة الجديدة: ${newYear.name}`
          : "تم تنفيذ نهاية السنة بنجاح."
      );
      setPreview(null);
      setDecisions({});
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تنفيذ نهاية السنة";
      setError(message);
    } finally {
      setExecutingRollover(false);
    }
  }

  function setStudentDecision(studentId: string, action: PromotionStudentAction) {
    setDecisions((prev) => ({ ...prev, [studentId]: action }));
  }

  function actionBadgeVariant(action: PromotionStudentAction) {
    if (action === "promote") return "success" as const;
    if (action === "graduate") return "info" as const;
    if (action === "repeat") return "warning" as const;
    return "danger" as const;
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div>
      <PageHeader
        title="السنوات والفصول الدراسية"
        description="إدارة السنة النشطة، الفصول الدراسية، وسياسات الترفيع حسب الصف"
      />

      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={handleCreateYear} disabled={creatingYear}>
          <Plus className="h-4 w-4" />
          {creatingYear ? "جاري الإنشاء..." : "سنة دراسية جديدة"}
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="space-y-3 p-4">
          <h2 className="font-bold text-p-black">السنوات الدراسية</h2>
          {years.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد سنوات بعد.</p>
          ) : (
            years.map((year) => (
              <button
                key={year.id}
                type="button"
                onClick={() => setSelectedYearId(year.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-start transition",
                  selectedYearId === year.id
                    ? "border-p-green bg-p-green/5"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-p-black">{year.name}</span>
                  {year.isActive ? <Badge variant="success">نشطة</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-p-black/55">
                  {year.startDate} — {year.endDate}
                </p>
              </button>
            ))
          )}
        </Card>

        {selectedYear ? (
          <div className="min-w-0 space-y-4">
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-p-black">{selectedYear.name}</h2>
                  <p className="mt-1 text-sm text-p-black/55">
                    {selectedYear.startDate} — {selectedYear.endDate}
                  </p>
                </div>
                {!selectedYear.isActive ? (
                  <Button
                    onClick={() => handleSetActive(selectedYear.id)}
                    disabled={activatingYearId === selectedYear.id}
                  >
                    {activatingYearId === selectedYear.id ? "جاري التفعيل..." : "تفعيل السنة"}
                  </Button>
                ) : (
                  <Badge variant="success">السنة النشطة</Badge>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="border-b border-neutral-100 px-4 py-3">
                <h3 className="font-bold text-p-black">الفصول الدراسية</h3>
                <p className="text-xs text-p-black/55">
                  حدّد عدد الفصول وأسماءها وتواريخها. الفصل الحالي هو ما يراه المعلمون وأولياء الأمور في العلامات.
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
                        {term.isCurrent ? (
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
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs text-p-red hover:bg-p-red/5"
                          disabled={termsDraft.length <= 1}
                          onClick={() => handleRemoveTerm(term.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </Button>
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

            <Card className="overflow-hidden p-0">
              <div className="border-b border-neutral-100 px-4 py-3">
                <h3 className="font-bold text-p-black">سياسات الترفيع والنجاح حسب الصف</h3>
                <p className="text-xs text-p-black/55">
                  كل صف دراسي له سياسة واحدة تُطبَّق على جميع الفصول الدراسية (الأول، الثاني...). يُقيَّم الطالب
                  في كل فصل بنفس سياسة صفه، ويجب النجاح في كل الفصول لإتمام السنة.
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
                        const normalized = Math.max(
                          1,
                          Number(passMinimumCountInputs[grade.id]) || 1
                        );
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
                        <div className="mt-3 max-w-sm">
                          <Select
                            label="الفصل المراد إصدار شهاداته"
                            value={publishTermId}
                            options={termSelectOptions}
                            onChange={(e) => setPublishTermId(e.target.value)}
                          />
                        </div>
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
                                                      <th className="px-3 py-2 text-start font-semibold">المادة</th>
                                                      <th className="px-3 py-2 text-start font-semibold">العلامة</th>
                                                      <th className="px-3 py-2 text-start font-semibold">من 100%</th>
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

            {selectedYear.isActive ? (
              <Card className="min-w-0 max-w-full space-y-4 overflow-hidden p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-p-black">معاينة وتنفيذ نهاية السنة</h3>
                    <p className="text-xs text-p-black/55">
                      راجع نتائج الطلاب، حدّد القرارات اليدوية، ثم نفّذ الترفيع وفتح سنة جديدة.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleLoadPreview} disabled={loadingPreview}>
                      <Eye className="h-4 w-4" />
                      {loadingPreview ? "جاري المعاينة..." : "معاينة النتائج"}
                    </Button>
                    {preview ? (
                      <Button variant="outline" onClick={handleExportPdf} disabled={exportingPdf}>
                        <Download className="h-4 w-4" />
                        {exportingPdf ? "جاري التصدير..." : "تصدير PDF"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {rolloverSuccess ? <Alert variant="success">{rolloverSuccess}</Alert> : null}

                {preview ? (
                  <div className="min-w-0 max-w-full space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        { label: "ناجح", value: preview.summary.passed },
                        { label: "راسب", value: preview.summary.failed },
                        { label: "ترفيع", value: preview.summary.promote },
                        { label: "إعادة", value: preview.summary.repeat },
                        { label: "تخرّج", value: preview.summary.graduate },
                        { label: "بانتظار قرار", value: preview.summary.pending },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-p-cream px-3 py-2 text-center">
                          <p className="text-lg font-bold text-p-black">{item.value}</p>
                          <p className="text-xs text-p-black/55">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-white">
                      <table className="w-full min-w-[880px] text-sm">
                        <thead>
                          <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                            <th className="w-10 px-2 py-2" aria-label="تفاصيل" />
                            <th className="px-3 py-2 text-start font-semibold">الطالب</th>
                            <th className="px-3 py-2 text-start font-semibold">الصف</th>
                            <th className="px-3 py-2 text-start font-semibold">المواد</th>
                            <th className="px-3 py-2 text-start font-semibold">الحالة</th>
                            <th className="px-3 py-2 text-start font-semibold">القرار</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.students.map((row) => {
                            const decision =
                              decisions[row.studentId] ??
                              (row.finalAction === "pending"
                                ? "pending"
                                : (row.finalAction as PromotionStudentAction));
                            const expanded = Boolean(expandedStudentIds[row.studentId]);
                            const resolvedAction = resolveStudentDecision(row, decisions);

                            return (
                              <Fragment key={row.studentId}>
                                <tr className="border-b border-neutral-50">
                                  <td className="px-2 py-2.5">
                                    <button
                                      type="button"
                                      onClick={() => toggleStudentExpanded(row.studentId)}
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
                                    <p className="font-medium text-p-black">{row.name}</p>
                                    <p className="text-xs text-p-black/45">{row.studentNumber || "—"}</p>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {row.currentGrade} {row.currentSection}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {row.passedSubjectsCount}/{row.totalSubjectsCount}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <Badge variant={row.yearPassed ? "success" : "danger"}>
                                      {row.yearPassed ? "ناجح" : "راسب"}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {row.needsReview || row.finalAction === "pending" ? (
                                      <Select
                                        value={decision === "pending" ? "repeat" : decision}
                                        options={promotionDecisionOptions}
                                        onChange={(e) =>
                                          setStudentDecision(
                                            row.studentId,
                                            e.target.value as PromotionStudentAction
                                          )
                                        }
                                      />
                                    ) : (
                                      <Badge variant={actionBadgeVariant(resolvedAction)}>
                                        {promotionActionLabels[
                                          resolvedAction as keyof typeof promotionActionLabels
                                        ] ?? resolvedAction}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                                {expanded ? (
                                  <tr className="border-b border-neutral-100 bg-neutral-50/70">
                                    <td colSpan={6} className="px-4 py-3">
                                      {row.subjects.length === 0 ? (
                                        <p className="text-sm text-p-black/50">لا توجد علامات مسجّلة لهذا الطالب.</p>
                                      ) : (
                                        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
                                          <table className="w-full min-w-[520px] text-sm">
                                            <thead>
                                              <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                                                <th className="px-3 py-2 text-start font-semibold">المادة</th>
                                                <th className="px-3 py-2 text-start font-semibold">العلامة</th>
                                                <th className="px-3 py-2 text-start font-semibold">علامة النجاح</th>
                                                <th className="px-3 py-2 text-start font-semibold">الحالة</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {row.subjects.map((subject) => (
                                                <tr key={`${row.studentId}-${subject.subject}`} className="border-b border-neutral-50">
                                                  <td className="px-3 py-2 font-medium text-p-black">{subject.subject}</td>
                                                  <td
                                                    className={cn(
                                                      "px-3 py-2 font-semibold",
                                                      subject.passed ? "text-p-green" : "text-p-red"
                                                    )}
                                                  >
                                                    {subject.score}/{subject.maxScore}
                                                  </td>
                                                  <td className="px-3 py-2 text-p-black/55">{subject.passScore}</td>
                                                  <td className="px-3 py-2">
                                                    <Badge variant={subject.passed ? "success" : "danger"}>
                                                      {subject.passed ? "ناجح" : "راسب"}
                                                    </Badge>
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

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <Input
                        label="اسم السنة الجديدة"
                        value={newYearName}
                        onChange={(e) => setNewYearName(e.target.value)}
                        placeholder="2026-2027"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleLoadPreview} disabled={loadingPreview}>
                          تحديث المعاينة
                        </Button>
                        <Button
                          onClick={handleExecuteRollover}
                          disabled={executingRollover}
                        >
                          <Play className="h-4 w-4" />
                          {executingRollover ? "جاري التنفيذ..." : "تنفيذ نهاية السنة"}
                        </Button>
                      </div>
                    </div>

                    {preview.summary.pending > 0 ? (
                      <Alert variant="warning">
                        يوجد {preview.summary.pending} طالب يحتاج قراراً يدوياً. حدّد قراراً لكل منهم ثم اضغط «تحديث
                        المعاينة».
                      </Alert>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>
        ) : (
          <Card className="flex min-h-48 items-center justify-center text-neutral-500">
            اختر سنة دراسية من القائمة.
          </Card>
        )}
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
