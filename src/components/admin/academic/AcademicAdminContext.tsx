"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, formatClientFetchError } from "@/lib/api";
import { mapGrade, mapGrades } from "@/lib/mapSchoolClass";
import { buildHonorsCertificateHtml, buildStudentCertificateHtml } from "@/lib/certificateHtml";
import { exportHonorsCertificatePdf } from "@/lib/exportHonorsCertificatePdf";
import { exportPromotionPreviewPdf } from "@/lib/exportPromotionPreviewPdf";
import { exportStudentCertificatePdf } from "@/lib/exportStudentCertificatePdf";
import type {
  AcademicTermStatus,
  AcademicYear,
  CertificateConfig,
  CertificatePreview,
  PromotionPolicy,
  PromotionPreview,
  PromotionStudentAction,
} from "@/types/academic";
import {
  mapAcademicYear,
  mapCertificateConfig,
  mapCertificatePreview,
  mapPromotionPreview,
} from "@/types/academic";
import type { Grade, Subject } from "@/types/teacher";
import {
  DEFAULT_SCHOOL_NAME,
  buildPassMinimumCountInputs,
  buildPolicyDraftsFromGrades,
  cloneTerms,
  defaultCertificateConfig,
  getActiveCertificateTerm,
  getTermDisplayName,
  resolveTermLabelFromYear,
  defaultPolicy,
  maxRequiredSubjectsForPolicy,
  trimRequiredSubjects,
  defaultTermName,
  isArchivedAcademicYear,
  reindexTerms,
  suggestNewYearForm,
  suggestedTermDates,
  validateAcademicTerms,
} from "./academicAdminUtils";

export type AcademicAdminContextValue = {
  years: AcademicYear[];
  loading: boolean;
  error: string;
  setError: (error: string) => void;
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  selectedYear: AcademicYear | null;
  subjects: Subject[];
  grades: Grade[];
  loadingGrades: boolean;
  policyDraftsByGradeId: Record<string, PromotionPolicy>;
  passMinimumCountInputs: Record<string, string>;
  requiredSubjectPickers: Record<string, string>;
  savingPolicyGradeId: string;
  savedPolicyGradeId: string;
  creatingYear: boolean;
  createYearOpen: boolean;
  setCreateYearOpen: (open: boolean) => void;
  createYearForm: { name: string; startDate: string; endDate: string };
  setCreateYearForm: React.Dispatch<
    React.SetStateAction<{ name: string; startDate: string; endDate: string }>
  >;
  deleteYearTarget: AcademicYear | null;
  setDeleteYearTarget: (year: AcademicYear | null) => void;
  deletingYearId: string;
  deleteYearError: string;
  setDeleteYearError: (error: string) => void;
  deleteTermTarget: AcademicTermStatus | null;
  setDeleteTermTarget: (term: AcademicTermStatus | null) => void;
  activatingYearId: string;
  settingTermId: string;
  preview: PromotionPreview | null;
  decisions: Record<string, PromotionStudentAction>;
  loadingPreview: boolean;
  executingRollover: boolean;
  rolloverSuccess: string;
  expandedStudentIds: Record<string, boolean>;
  schoolName: string;
  exportingPdf: boolean;
  termPreview: PromotionPreview | null;
  loadingTermPreview: boolean;
  executingTermEnd: boolean;
  termEndSuccess: string;
  expandedTermStudentIds: Record<string, boolean>;
  exportingTermPdf: boolean;
  certificateConfig: CertificateConfig | null;
  certificateDraft: CertificateConfig;
  setCertificateDraft: React.Dispatch<React.SetStateAction<CertificateConfig>>;
  activeCertificateTerm: AcademicTermStatus | null;
  loadingCertificate: boolean;
  savingCertificate: boolean;
  certificateSaved: boolean;
  certificatePublishSuccess: string;
  publishingCertificates: boolean;
  unpublishingCertificates: boolean;
  certificatePreview: CertificatePreview | null;
  loadingCertificatePreview: boolean;
  expandedCertificateStudentIds: Record<string, boolean>;
  exportingCertificateStudentId: string;
  certificateVisualPreview: {
    studentId: string;
    kind: "regular" | "honors";
    title: string;
  } | null;
  certificatePreviewHtml: string | null;
  loadingCertificateVisualPreview: boolean;
  termsDraft: AcademicTermStatus[];
  savingTerms: boolean;
  termsSaved: boolean;
  termSelectOptions: { value: string; label: string }[];
  promotionDecisionOptions: { value: string; label: string }[];
  openCreateYearDialog: () => void;
  handleCreateYearSubmit: () => Promise<void>;
  handleDeleteYear: () => Promise<void>;
  handleSetActive: (yearId: string) => Promise<void>;
  handleSetCurrentTerm: (yearId: string, termId: string) => Promise<void>;
  updateTermDraft: (termId: string, patch: Partial<AcademicTermStatus>) => void;
  handleAddTerm: () => void;
  handleRemoveTerm: (termId: string) => void;
  updateGradePolicyDraft: (gradeId: string, patch: Partial<PromotionPolicy>) => void;
  addRequiredSubject: (gradeId: string) => void;
  removeRequiredSubject: (gradeId: string, subjectName: string) => void;
  handleSaveTerms: () => Promise<void>;
  handleSaveGradePolicy: (gradeId: string) => Promise<void>;
  handleSaveGradePolicies: (gradeIds: string[]) => Promise<void>;
  handleResetGradePolicy: (gradeId: string) => Promise<void>;
  subjectPickerOptions: (gradeId: string) => { value: string; label: string }[];
  toggleStudentExpanded: (studentId: string) => void;
  handleExportPdf: () => Promise<void>;
  handleLoadPreview: () => Promise<void>;
  handleExecuteRollover: () => Promise<void>;
  handleLoadTermPreview: () => Promise<void>;
  handleExecuteTermEnd: () => Promise<void>;
  handleExportTermPdf: () => Promise<void>;
  toggleTermStudentExpanded: (studentId: string) => void;
  setStudentDecision: (studentId: string, action: PromotionStudentAction) => void;
  actionBadgeVariant: (
    action: PromotionStudentAction
  ) => "success" | "info" | "warning" | "danger";
  handleSaveCertificateConfig: () => Promise<void>;
  handlePublishCertificates: () => Promise<void>;
  handleUnpublishCertificates: () => Promise<void>;
  handleLoadCertificatePreview: () => Promise<void>;
  toggleCertificateStudentExpanded: (studentId: string) => void;
  handlePreviewCertificate: (studentId: string, kind: "regular" | "honors") => Promise<void>;
  closeCertificateVisualPreview: () => void;
  handleDownloadPreviewCertificate: (
    studentId: string,
    kind: "regular" | "honors"
  ) => Promise<void>;
  setPassMinimumCountInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setRequiredSubjectPickers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

const AcademicAdminContext = createContext<AcademicAdminContextValue | null>(null);

export function useAcademicAdmin() {
  const ctx = useContext(AcademicAdminContext);
  if (!ctx) {
    throw new Error("useAcademicAdmin must be used within AcademicAdminProvider");
  }
  return ctx;
}

export function AcademicAdminProvider({ children }: { children: ReactNode }) {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [policyDraftsByGradeId, setPolicyDraftsByGradeId] = useState<
    Record<string, PromotionPolicy>
  >({});
  const [passMinimumCountInputs, setPassMinimumCountInputs] = useState<Record<string, string>>({});
  const [requiredSubjectPickers, setRequiredSubjectPickers] = useState<Record<string, string>>({});
  const [savingPolicyGradeId, setSavingPolicyGradeId] = useState("");
  const [savedPolicyGradeId, setSavedPolicyGradeId] = useState("");
  const [creatingYear, setCreatingYear] = useState(false);
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const [createYearForm, setCreateYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [deleteYearTarget, setDeleteYearTarget] = useState<AcademicYear | null>(null);
  const [deletingYearId, setDeletingYearId] = useState("");
  const [deleteYearError, setDeleteYearError] = useState("");
  const [deleteTermTarget, setDeleteTermTarget] = useState<AcademicTermStatus | null>(null);
  const [activatingYearId, setActivatingYearId] = useState("");
  const [settingTermId, setSettingTermId] = useState("");
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [decisions, setDecisions] = useState<Record<string, PromotionStudentAction>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executingRollover, setExecutingRollover] = useState(false);
  const [rolloverSuccess, setRolloverSuccess] = useState("");
  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [termPreview, setTermPreview] = useState<PromotionPreview | null>(null);
  const [loadingTermPreview, setLoadingTermPreview] = useState(false);
  const [executingTermEnd, setExecutingTermEnd] = useState(false);
  const [termEndSuccess, setTermEndSuccess] = useState("");
  const [expandedTermStudentIds, setExpandedTermStudentIds] = useState<Record<string, boolean>>({});
  const [exportingTermPdf, setExportingTermPdf] = useState(false);
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig | null>(null);
  const [certificateDraft, setCertificateDraft] = useState<CertificateConfig>(
    defaultCertificateConfig()
  );
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [certificateSaved, setCertificateSaved] = useState(false);
  const [certificatePublishSuccess, setCertificatePublishSuccess] = useState("");
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
  const termsDraftYearRef = useRef("");

  const selectedYear = useMemo(
    () => years.find((year) => year.id === selectedYearId) ?? null,
    [years, selectedYearId]
  );

  const activeCertificateTerm = useMemo(
    () => getActiveCertificateTerm(selectedYear),
    [selectedYear]
  );

  const termSelectOptions = useMemo(
    () => [
      { value: "", label: "اختر الفصل" },
      ...(termsDraft.length > 0
        ? termsDraft.map((term) => ({ value: term.id, label: getTermDisplayName(term) }))
        : (selectedYear?.terms.map((term) => ({ value: term.id, label: getTermDisplayName(term) })) ?? [])),
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
      setSelectedYearId(
        (current) => current || mapped.find((year) => year.isActive)?.id || mapped[0]?.id || ""
      );
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
    const year = years.find((item) => item.id === selectedYearId) ?? null;
    const yearChanged = termsDraftYearRef.current !== selectedYearId;

    if (year) {
      if (yearChanged) {
        setTermsDraft(cloneTerms(year.terms));
        termsDraftYearRef.current = selectedYearId;
        setTermsSaved(false);
      }
      setRequiredSubjectPickers({});
      setSavedPolicyGradeId("");
    } else if (!selectedYearId) {
      setTermsDraft([]);
      termsDraftYearRef.current = "";
    }

    if (!yearChanged) return;

    setPreview(null);
    setDecisions({});
    setExpandedStudentIds({});
    setRolloverSuccess("");
    setCertificateConfig(null);
    setCertificateDraft(defaultCertificateConfig());
    setCertificateSaved(false);
    setCertificatePublishSuccess("");
    setCertificatePreview(null);
    setExpandedCertificateStudentIds({});
  }, [selectedYearId, years]);

  useEffect(() => {
    if (!selectedYear) return;
    setLoadingCertificate(true);
    api
      .getAdminCertificateConfig(selectedYear.id)
      .then((raw) => {
        const mapped = mapCertificateConfig(raw as Record<string, unknown>);
        setCertificateConfig(mapped);
        setCertificateDraft(mapped);
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
    if (certificateDraft.issuanceScope === "term" && !activeCertificateTerm) {
      setError("لا يوجد فصل دراسي نشط حالياً. عيّن الفصل الحالي من إعدادات الفصول الدراسية أولاً.");
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
    setCertificatePublishSuccess("");
    try {
      const updated = mapCertificateConfig(
        (await api.publishAdminCertificates(
          selectedYear.id,
          certificateDraft.issuanceScope === "term"
            ? { termId: activeCertificateTerm?.id }
            : undefined
        )) as Record<string, unknown>
      );
      setCertificateConfig(updated);
      setCertificateDraft(updated);
      setCertificatePublishSuccess(
        certificateDraft.issuanceScope === "term" && activeCertificateTerm
          ? `تم إصدار ونشر شهادات ${getTermDisplayName(activeCertificateTerm)} بنجاح. يمكن لأولياء الأمور الاطلاع عليها من صفحة «الشهادات».`
          : "تم إصدار ونشر شهادات السنة الدراسية بنجاح. يمكن لأولياء الأمور الاطلاع عليها من صفحة «الشهادات»."
      );
    } catch {
      setError("تعذر إصدار الشهادات");
      setCertificatePublishSuccess("");
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
        ? { termId: activeCertificateTerm?.id }
        : {}),
    };
  }

  async function handleLoadCertificatePreview() {
    if (!selectedYear) return;
    if (certificateDraft.issuanceScope === "term" && !activeCertificateTerm) {
      setError("لا يوجد فصل دراسي نشط حالياً. عيّن الفصل الحالي من إعدادات الفصول الدراسية أولاً.");
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

  function openCreateYearDialog() {
    setCreateYearForm(suggestNewYearForm(years));
    setError("");
    setCreateYearOpen(true);
  }

  async function handleCreateYearSubmit() {
    const name = createYearForm.name.trim();
    if (!name) {
      setError("أدخل اسم السنة الدراسية");
      return;
    }
    if (!createYearForm.startDate) {
      setError("أدخل تاريخ بداية السنة الدراسية");
      return;
    }
    if (!createYearForm.endDate) {
      setError("أدخل تاريخ نهاية السنة الدراسية");
      return;
    }
    if (createYearForm.endDate < createYearForm.startDate) {
      setError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    setCreatingYear(true);
    setError("");
    try {
      const created = await api.createAdminAcademicYear({
        name,
        startDate: createYearForm.startDate,
        endDate: createYearForm.endDate,
        status: "draft",
        isActive: false,
      });
      const mapped = mapAcademicYear(created as Record<string, unknown>);
      setYears((prev) => [mapped, ...prev]);
      setSelectedYearId(mapped.id);
      setCreateYearOpen(false);
    } catch {
      setError("تعذر إنشاء سنة دراسية جديدة");
    } finally {
      setCreatingYear(false);
    }
  }

  async function handleDeleteYear() {
    if (!deleteYearTarget) return;

    setDeletingYearId(deleteYearTarget.id);
    setDeleteYearError("");
    try {
      await api.deleteAdminAcademicYear(deleteYearTarget.id);
      const remaining = years.filter((year) => year.id !== deleteYearTarget.id);
      setYears(remaining);
      if (selectedYearId === deleteYearTarget.id) {
        const wasArchived = isArchivedAcademicYear(deleteYearTarget);
        const pool = wasArchived
          ? remaining.filter(isArchivedAcademicYear)
          : remaining.filter((year) => !isArchivedAcademicYear(year));
        setSelectedYearId(pool[0]?.id ?? "");
      }
      setDeleteYearTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر حذف السنة الدراسية";
      setDeleteYearError(message);
    } finally {
      setDeletingYearId("");
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
          isClosed: false,
          closedAt: null,
        },
      ];
    });
    setTermsSaved(false);
  }

  function handleRemoveTerm(termId: string) {
    setTermsDraft((prev) => {
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
    const maxRequired = maxRequiredSubjectsForPolicy(draft, passMinimumCountInputs[gradeId]);
    if (!value || draft.requiredSubjects.includes(value)) return;
    if (maxRequired != null && draft.requiredSubjects.length >= maxRequired) return;
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
    if (!selectedYear || savingTerms) return;

    const validationError = validateAcademicTerms(selectedYear, reindexTerms(termsDraft));
    if (validationError) {
      setError(validationError);
      return;
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
      termsDraftYearRef.current = updated.id;
      setTermsSaved(true);
    } catch (err) {
      setError(formatClientFetchError(err, "تعذر حفظ الفصول الدراسية"));
    } finally {
      setSavingTerms(false);
    }
  }

  async function handleSaveGradePolicies(gradeIds: string[]) {
    if (gradeIds.length === 0) return;

    setSavingPolicyGradeId("__batch__");
    setSavedPolicyGradeId("");
    setError("");

    try {
      const results = await Promise.all(
        gradeIds.map(async (gradeId) => {
          const draft = policyDraftsByGradeId[gradeId] ?? defaultPolicy();
          const normalizedMinimumCount = Math.max(1, Number(passMinimumCountInputs[gradeId]) || 1);
          const maxRequired = maxRequiredSubjectsForPolicy(
            { ...draft, passMinimumCount: normalizedMinimumCount },
            String(normalizedMinimumCount)
          );
          const payload: PromotionPolicy = {
            ...draft,
            passMinimumCount: normalizedMinimumCount,
            requiredSubjects: trimRequiredSubjects(draft.requiredSubjects, maxRequired),
            evaluationScope: "single_term",
          };
          updateGradePolicyDraft(gradeId, payload);
          return mapGrade(
            (await api.updateAdminGradePromotionPolicy(gradeId, payload)) as Record<string, unknown>
          );
        })
      );

      const byId = new Map(results.map((grade) => [grade.id, grade]));
      setGrades((prev) => prev.map((grade) => byId.get(grade.id) ?? grade));
      setPolicyDraftsByGradeId((prev) => {
        const next = { ...prev };
        for (const updated of results) {
          next[updated.id] = updated.promotionPolicy
            ? { ...updated.promotionPolicy }
            : next[updated.id];
        }
        return next;
      });
      setPassMinimumCountInputs((prev) => {
        const next = { ...prev };
        for (const updated of results) {
          next[updated.id] = String(updated.promotionPolicy?.passMinimumCount ?? 1);
        }
        return next;
      });
      setSavedPolicyGradeId("__batch__");
    } catch {
      setError("تعذر حفظ سياسات الترفيع");
    } finally {
      setSavingPolicyGradeId("");
    }
  }

  async function handleSaveGradePolicy(gradeId: string) {
    await handleSaveGradePolicies([gradeId]);
  }

  async function handleResetGradePolicy(gradeId: string) {
    setSavingPolicyGradeId(gradeId);
    setSavedPolicyGradeId("");
    setError("");

    try {
      const updated = mapGrade(
        (await api.resetAdminGradePromotionPolicy(gradeId)) as Record<string, unknown>
      );
      setGrades((prev) => prev.map((grade) => (grade.id === updated.id ? updated : grade)));
      const resetDraft = updated.promotionPolicy
        ? { ...updated.promotionPolicy }
        : defaultPolicy();
      setPolicyDraftsByGradeId((prev) => ({ ...prev, [gradeId]: resetDraft }));
      setPassMinimumCountInputs((prev) => ({
        ...prev,
        [gradeId]: String(resetDraft.passMinimumCount),
      }));
      setRequiredSubjectPickers((prev) => ({ ...prev, [gradeId]: "" }));
    } catch {
      setError("تعذر حذف سياسة الترفيع");
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

  async function handleExportTermPdf() {
    if (!termPreview) return;
    const closingLabel = resolveTermLabelFromYear(
      selectedYear,
      termPreview.termId,
      termPreview.termName
    );
    setExportingTermPdf(true);
    setError("");
    try {
      await exportPromotionPreviewPdf({
        preview: termPreview,
        schoolName,
        title: `معاينة نهاية ${closingLabel}`,
        passedLabel: "ناجح في الفصل",
        failedLabel: "راسب في الفصل",
        hideDecisionColumns: true,
      });
    } catch {
      setError("تعذر تصدير ملف PDF");
    } finally {
      setExportingTermPdf(false);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تحميل معاينة الترفيع";
      setError(message);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleLoadTermPreview() {
    if (!selectedYear) return;
    setLoadingTermPreview(true);
    setError("");
    setTermEndSuccess("");
    try {
      const data = await api.getAdminTermEndPreview(selectedYear.id);
      setTermPreview(mapPromotionPreview(data as Record<string, unknown>));
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تحميل معاينة نهاية الفصل";
      setError(message);
    } finally {
      setLoadingTermPreview(false);
    }
  }

  async function handleExecuteTermEnd() {
    if (!selectedYear || !termPreview) return;
    const closingLabel = resolveTermLabelFromYear(
      selectedYear,
      termPreview.termId,
      termPreview.termName
    );
    const nextTermLabel = termPreview.nextTermName
      ? resolveTermLabelFromYear(selectedYear, termPreview.nextTermId, termPreview.nextTermName)
      : "";
    const activationNote = termPreview.nextTermActivatesImmediately
      ? nextTermLabel
        ? ` وتفعيل «${nextTermLabel}» فوراً`
        : ""
      : nextTermLabel && termPreview.nextTermStartDate
        ? `. «${nextTermLabel}» يُفعَّل تلقائياً بتاريخ ${termPreview.nextTermStartDate}`
        : "";
    if (
      !window.confirm(
        `سيتم إغلاق «${closingLabel}» ونشر شهادات الفصل${activationNote}. هل أنت متأكد؟`
      )
    ) {
      return;
    }

    setExecutingTermEnd(true);
    setError("");
    setTermEndSuccess("");
    try {
      const result = (await api.executeAdminTermEnd(selectedYear.id, {
        termId: termPreview.termId ?? undefined,
        publishCertificates: true,
      })) as Record<string, unknown>;
      const updatedYear = result.academicYear as Record<string, unknown> | undefined;
      if (updatedYear) {
        const mapped = mapAcademicYear(updatedYear);
        setYears((prev) => prev.map((year) => (year.id === mapped.id ? mapped : year)));
        setTermsDraft(cloneTerms(mapped.terms));
      }
      const nextTerm = result.nextTerm as
        | { activated?: boolean; startDate?: string; name?: string }
        | undefined;
      const nextActivated = Boolean(nextTerm?.activated ?? termPreview.nextTermActivatesImmediately);
      if (termPreview.nextTermName) {
        const nextLabel = resolveTermLabelFromYear(
          selectedYear,
          termPreview.nextTermId,
          termPreview.nextTermName
        );
        setTermEndSuccess(
          nextActivated
            ? `تم إغلاق «${closingLabel}» بنجاح. الفصل الحالي الآن: ${nextLabel}`
            : `تم إغلاق «${closingLabel}» بنجاح. سيبدأ «${nextLabel}» تلقائياً في ${
                nextTerm?.startDate ?? termPreview.nextTermStartDate ?? "تاريخ بدايته"
              }.`
        );
      } else {
        setTermEndSuccess(`تم إغلاق «${closingLabel}» بنجاح.`);
      }
      setTermPreview(null);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تنفيذ نهاية الفصل";
      setError(message);
    } finally {
      setExecutingTermEnd(false);
    }
  }

  function toggleTermStudentExpanded(studentId: string) {
    setExpandedTermStudentIds((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  async function handleExecuteRollover() {
    if (!selectedYear || !preview) return;
    if (
      !window.confirm(
        "سيتم أرشفة السنة الحالية وترفيع/إعادة الطلاب دون إنشاء سنة جديدة. أنشئ السنة التالية يدوياً من السنوات الدراسية. هل أنت متأكد؟"
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
        publishCertificates: true,
      })) as Record<string, unknown>;
      setRolloverSuccess(
        "تم تنفيذ نهاية السنة بنجاح: شهادة نهاية السنة (معدل جميع الفصول) وشهادة التقدير للمؤهلين. أُرشفت السنة — أنشئ السنة الدراسية الجديدة من قسم السنوات الدراسية."
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

  const value: AcademicAdminContextValue = {
    years,
    loading,
    error,
    setError,
    selectedYearId,
    setSelectedYearId,
    selectedYear,
    subjects,
    grades,
    loadingGrades,
    policyDraftsByGradeId,
    passMinimumCountInputs,
    requiredSubjectPickers,
    savingPolicyGradeId,
    savedPolicyGradeId,
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
    settingTermId,
    preview,
    decisions,
    loadingPreview,
    executingRollover,
    rolloverSuccess,
    expandedStudentIds,
    schoolName,
    exportingPdf,
    termPreview,
    loadingTermPreview,
    executingTermEnd,
    termEndSuccess,
    expandedTermStudentIds,
    exportingTermPdf,
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
    certificateVisualPreview,
    certificatePreviewHtml,
    loadingCertificateVisualPreview,
    termsDraft,
    savingTerms,
    termsSaved,
    termSelectOptions,
    promotionDecisionOptions,
    openCreateYearDialog,
    handleCreateYearSubmit,
    handleDeleteYear,
    handleSetActive,
    handleSetCurrentTerm,
    updateTermDraft,
    handleAddTerm,
    handleRemoveTerm,
    updateGradePolicyDraft,
    addRequiredSubject,
    removeRequiredSubject,
    handleSaveTerms,
    handleSaveGradePolicy,
    handleSaveGradePolicies,
    handleResetGradePolicy,
    subjectPickerOptions,
    toggleStudentExpanded,
    handleExportPdf,
    handleLoadPreview,
    handleExecuteRollover,
    handleLoadTermPreview,
    handleExecuteTermEnd,
    handleExportTermPdf,
    toggleTermStudentExpanded,
    setStudentDecision,
    actionBadgeVariant,
    handleSaveCertificateConfig,
    handlePublishCertificates,
    handleUnpublishCertificates,
    handleLoadCertificatePreview,
    toggleCertificateStudentExpanded,
    handlePreviewCertificate,
    closeCertificateVisualPreview,
    handleDownloadPreviewCertificate,
    setPassMinimumCountInputs,
    setRequiredSubjectPickers,
  };

  return (
    <AcademicAdminContext.Provider value={value}>{children}</AcademicAdminContext.Provider>
  );
}
