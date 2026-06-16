"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherCard } from "@/components/molecules/TeacherCard";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { cropImageToFile } from "@/lib/imageCrop";
import { cn } from "@/lib/utils";
import type { AccountCredentials } from "@/types";
import Cropper from "react-easy-crop";
import { ImagePlus, KeyRound, Save, Trash2 } from "lucide-react";

export default function AdminTeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const teacherId = String(params.id);

  const { teachers, classes, subjects, assignments, setTeacherClasses, updateTeacher, removeTeacher } = useSchool();
  const current = teachers.find((t) => t.id === teacherId);

  const [draftClasses, setDraftClasses] = useState<string[]>([]);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>("teacher.jpg");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!current) return;
    setDraftClasses(assignments[current.id] ?? []);
    setDraftSubjects(current.subjectIds ?? []);
    setEditImagePreview(current.imageUrl ?? null);
    setSaved(false);
    setResetCredentials(null);
  }, [current?.id]);

  const classNameMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes]
  );

  function toggleClass(classId: string) {
    setDraftClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
    setSaved(false);
  }

  function toggleSubject(subjectId: string) {
    setDraftSubjects((prev) => (prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]));
    setSaved(false);
  }

  async function handleSave() {
    if (!current || draftSubjects.length === 0) return;
    await Promise.all([
      setTeacherClasses(current.id, draftClasses),
      updateTeacher(current.id, { subjectIds: draftSubjects }),
    ]);
    setSaved(true);
  }

  async function resetTeacherPassword() {
    if (!current?.id) return;
    setResettingPassword(true);
    setResetCredentials(null);
    try {
      const data = (await api.resetAdminTeacherPassword(current.id)) as Record<string, unknown>;
      const username = String(data.username ?? current.username ?? "");
      const password = String(data.password ?? "");
      if (username && password) {
        setResetCredentials({ name: current.name, username, password, role: "teacher" });
      }
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageUrl(url);
    setCropFileName(file.name || "teacher.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropOpen(true);
    e.target.value = "";
  }

  async function applyCropAndUpload() {
    if (!current?.id || !cropImageUrl || !cropPixels) return;
    setUploadingImage(true);
    try {
      const cropped = await cropImageToFile(cropImageUrl, cropPixels, cropFileName);
      const updated = await updateTeacher(current.id, {}, cropped);
      setEditImagePreview(updated.imageUrl ?? null);
      setCropOpen(false);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  }

  function cancelCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    setCropOpen(false);
  }

  async function confirmDeleteTeacher() {
    if (!current?.id) return;
    setDeletingTeacher(true);
    try {
      await removeTeacher(current.id);
      router.push("/admin/teachers");
    } finally {
      setDeletingTeacher(false);
    }
  }

  if (!current) {
    return (
      <div>
        <PageHeader title="تفاصيل المعلم" description="المعلم غير موجود أو لم يتم تحميل البيانات بعد." className="mb-6" />
        <Card>
          <p className="text-sm text-neutral-500">
            ارجع إلى{" "}
            <Link href="/admin/teachers" className="text-brand-blue hover:underline">
              قائمة المعلمين
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={`تفاصيل المعلم — ${current.name}`} description={current.subject} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/teachers")}>
            رجوع
          </Button>
          <Button variant="outline" onClick={() => setConfirmReset(true)} disabled={resettingPassword}>
            <KeyRound className="h-4 w-4" />
            إعادة تعيين كلمة المرور
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            حذف المعلم
          </Button>
        </div>
      </div>

      {resetCredentials && (
        <Alert variant="success" className="mb-6">
          <p className="mb-2 font-semibold">تم إعادة تعيين كلمة مرور المعلم — احفظ بيانات الدخول:</p>
          <p>الاسم: {resetCredentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{resetCredentials.username}</span>
          </p>
          <p>
            كلمة المرور الجديدة: <span dir="ltr">{resetCredentials.password}</span>
          </p>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-3 text-sm font-semibold text-[#1a1a1a]">معاينة عامة</p>
          <TeacherCard teacher={{ ...current, imageUrl: editImagePreview ?? current.imageUrl }} />
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-6 space-y-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-[#1a1a1a]">السيرة الذاتية</p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-p-black/80">
                صورة المعلم (اختياري)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={cn(
                    "flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-2xl font-bold text-white",
                    !editImagePreview && current.imageGradient
                  )}
                >
                  {editImagePreview ? (
                    <img src={editImagePreview} alt={current.name} className="h-full w-full object-cover" />
                  ) : (
                    current.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0)
                  )}
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
                  <ImagePlus className="h-5 w-5" />
                  تغيير الصورة
                  <input type="file" accept="image/*" className="sr-only" disabled={uploadingImage} onChange={handleEditImageChange} />
                </label>
              </div>
            </div>

            <Input
              label="الخبرة"
              value={current.experience}
              onChange={(e) => updateTeacher(current.id, { experience: e.target.value })}
            />
            <Textarea
              label="نبذة"
              value={current.bio}
              onChange={(e) => updateTeacher(current.id, { bio: e.target.value })}
            />
          </div>

          <p className="mb-4 text-sm font-medium text-[#1a1a1a]/70">المواد الدراسية المسندة:</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {subjects.map((s) => {
              const checked = draftSubjects.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    checked
                      ? "border-[var(--brand-teal)] bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]"
                      : "border-neutral-200 hover:border-[var(--brand-teal)]/30"
                  )}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleSubject(s.id)} className="accent-[var(--brand-teal)]" />
                  {s.name}
                </label>
              );
            })}
          </div>

          <p className="mb-4 text-sm font-medium text-[#1a1a1a]/70">الفصول المسندة:</p>
          <div className="space-y-2">
            {classes.map((cls) => {
              const checked = draftClasses.includes(cls.id);
              return (
                <label
                  key={cls.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors",
                    checked ? "border-[var(--brand-teal)] bg-[var(--brand-teal)]/5" : "border-neutral-200 hover:border-[var(--brand-teal)]/30"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{classNameMap[cls.id] ?? cls.name}</p>
                    <p className="text-[11px] text-[#1a1a1a]/50">{cls.studentCount} طالب</p>
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggleClass(cls.id)} className="h-4 w-4 rounded accent-[var(--brand-teal)]" />
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button onClick={handleSave} disabled={draftSubjects.length === 0}>
              <Save className="h-4 w-4" />
              حفظ الإسناد
            </Button>
            {saved && <span className="text-sm text-[var(--brand-teal)]">تم الحفظ بنجاح</span>}
          </div>
        </Card>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setConfirmReset(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد تغيير كلمة المرور</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من إعادة تعيين كلمة مرور المعلم <span className="font-semibold">{current.name}</span>؟
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setConfirmReset(false)}>
                  إلغاء
                </Button>
                <Button type="button" onClick={async () => { setConfirmReset(false); await resetTeacherPassword(); }} disabled={resettingPassword}>
                  {resettingPassword ? "جاري التغيير..." : "تأكيد"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف المعلم</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من حذف المعلم <span className="font-semibold">{current.name}</span>؟
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                  إلغاء
                </Button>
                <Button type="button" onClick={confirmDeleteTeacher} disabled={deletingTeacher} className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red">
                  {deletingTeacher ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {cropOpen && cropImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={cancelCrop}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-neutral-100 px-5 py-4">
              <p className="text-base font-bold text-p-black">قص صورة المعلم</p>
            </div>
            <div className="relative h-[360px] bg-black">
              <Cropper image={cropImageUrl} crop={cropPos} zoom={cropZoom} aspect={1} onCropChange={setCropPos} onZoomChange={setCropZoom} onCropComplete={(_, px) => setCropPixels(px)} />
            </div>
            <div className="px-5 py-4">
              <label className="mb-2 block text-sm font-medium text-p-black/80">التكبير</label>
              <input aria-label="التكبير" type="range" min={1} max={3} step={0.05} value={cropZoom} onChange={(e) => setCropZoom(Number(e.target.value))} className="w-full" />
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={cancelCrop}>إلغاء</Button>
                <Button type="button" onClick={applyCropAndUpload} disabled={uploadingImage || !cropPixels}>
                  {uploadingImage ? "جاري الحفظ..." : "حفظ الصورة"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

