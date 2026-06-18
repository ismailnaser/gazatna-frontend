"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { TeacherClassPicker } from "@/components/admin/TeacherClassPicker";
import { cropTeacherImageFile, TeacherCropModal } from "@/components/admin/TeacherCropModal";
import { TeacherFormSection } from "@/components/admin/TeacherFormSection";
import { TeacherProfileImageField } from "@/components/admin/TeacherProfileImageField";
import { TeacherSubjectPicker } from "@/components/admin/TeacherSubjectPicker";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { teacherInitial } from "@/lib/adminTeachers";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { AccountCredentials } from "@/types";
import { BookMarked, KeyRound, Layers, Save, Shield, Trash2, UserRound } from "lucide-react";

export default function AdminTeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const teacherId = String(params.id);

  const { teachers, classes, subjects, assignments, setTeacherClasses, updateTeacher, removeTeacher } =
    useSchool();
  const current = teachers.find((teacher) => teacher.id === teacherId);

  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [draftClasses, setDraftClasses] = useState<string[]>([]);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [assignmentsSaved, setAssignmentsSaved] = useState(false);
  const [error, setError] = useState("");

  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("teacher.jpg");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setExperience(current.experience);
    setBio(current.bio);
    setDraftClasses(assignments[current.id] ?? []);
    setDraftSubjects(current.subjectIds ?? []);
    setImagePreview(current.imageUrl ?? null);
    setProfileSaved(false);
    setAssignmentsSaved(false);
    setResetCredentials(null);
    setError("");
  }, [current?.id, assignments, current]);

  function handleFileSelect(file: File | null) {
    if (!file || !current) return;
    const url = URL.createObjectURL(file);
    setCropFileName(file.name || "teacher.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropImageUrl(url);
    setCropOpen(true);
  }

  async function applyCropAndUpload() {
    if (!current?.id || !cropImageUrl || !cropPixels) return;
    setUploadingImage(true);
    setError("");
    try {
      const cropped = await cropTeacherImageFile(cropImageUrl, cropPixels, cropFileName);
      const updated = await updateTeacher(current.id, {}, cropped);
      setImagePreview(updated.imageUrl ?? null);
      setCropOpen(false);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    } catch {
      setError("فشل حفظ الصورة");
    } finally {
      setUploadingImage(false);
    }
  }

  function cancelCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    setCropOpen(false);
  }

  async function saveProfile() {
    if (!current) return;
    setSavingProfile(true);
    setError("");
    setProfileSaved(false);
    try {
      await updateTeacher(current.id, {
        name: name.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
      });
      setProfileSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ الملف الشخصي");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveAssignments() {
    if (!current || draftSubjects.length === 0) return;
    setSavingAssignments(true);
    setError("");
    setAssignmentsSaved(false);
    try {
      await Promise.all([
        setTeacherClasses(current.id, draftClasses),
        updateTeacher(current.id, { subjectIds: draftSubjects }),
      ]);
      setAssignmentsSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ الإسناد");
    } finally {
      setSavingAssignments(false);
    }
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
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="تعديل المعلم"
          description="المعلم غير موجود أو لم يتم تحميل البيانات بعد."
          className="mb-6"
        />
        <Card className="p-5">
          <p className="text-sm text-neutral-500">
            ارجع إلى{" "}
            <Link href="/admin/teachers" className="font-semibold text-brand-blue hover:underline">
              قائمة الكادر
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  const previewSrc = imagePreview?.startsWith("blob:")
    ? imagePreview
    : resolveMediaUrl(imagePreview ?? current.imageUrl);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="تعديل المعلم" description={current.name} className="mb-6" />

      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {resetCredentials ? (
        <Alert variant="success" className="mb-4">
          <p className="mb-2 font-semibold">تم إعادة تعيين كلمة مرور المعلم — احفظ بيانات الدخول:</p>
          <p>الاسم: {resetCredentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{resetCredentials.username}</span>
          </p>
          <p>
            كلمة المرور الجديدة: <span dir="ltr">{resetCredentials.password}</span>
          </p>
        </Alert>
      ) : null}

      <Card className="mb-5 overflow-hidden p-0">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-brand-blue/5 to-indigo-50 p-5 sm:flex-row sm:items-center sm:p-6">
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold text-white shadow-md",
              !previewSrc && `bg-gradient-to-br ${current.imageGradient}`
            )}
          >
            {previewSrc ? (
              <img src={previewSrc} alt={current.name} className="h-full w-full object-cover" />
            ) : (
              teacherInitial(current.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-p-black">{current.name}</h2>
            <p className="mt-1 text-sm text-p-black/55">{current.subject || "بدون مواد"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {current.username ? (
                <Badge variant="default" className="font-mono" dir="ltr">
                  {current.username}
                </Badge>
              ) : null}
              <Badge variant="info">{draftSubjects.length} مادة</Badge>
              <Badge variant="success">{draftClasses.length} فصل</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        <TeacherFormSection
          icon={UserRound}
          title="البيانات الشخصية"
          description="الاسم، الصورة، الخبرة، والسيرة الذاتية"
          tone="blue"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="اسم المعلم" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="الخبرة" value={experience} onChange={(e) => setExperience(e.target.value)} required />
            </div>
            <TeacherProfileImageField
              name={name}
              imageGradient={current.imageGradient}
              previewUrl={imagePreview}
              disabled={uploadingImage}
              onFileSelect={handleFileSelect}
            />
            <Textarea label="نبذة (السيرة الذاتية)" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
            <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
              <Button type="button" onClick={saveProfile} disabled={savingProfile}>
                <Save className="h-4 w-4" />
                {savingProfile ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
              </Button>
              {profileSaved ? <span className="text-sm text-p-green">تم الحفظ بنجاح</span> : null}
            </div>
          </div>
        </TeacherFormSection>

        <TeacherFormSection
          icon={BookMarked}
          title="المواد الدراسية"
          description="اختر مادة واحدة على الأقل"
          tone="violet"
        >
          <TeacherSubjectPicker subjects={subjects} value={draftSubjects} onChange={setDraftSubjects} />
        </TeacherFormSection>

        <TeacherFormSection
          icon={Layers}
          title="الفصول المسندة"
          description="الفصول التي يدرّسها المعلم"
          tone="green"
        >
          <TeacherClassPicker classes={classes} value={draftClasses} onChange={setDraftClasses} />
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
            <Button type="button" onClick={saveAssignments} disabled={savingAssignments || draftSubjects.length === 0}>
              <Save className="h-4 w-4" />
              {savingAssignments ? "جاري الحفظ..." : "حفظ الإسناد"}
            </Button>
            {assignmentsSaved ? <span className="text-sm text-p-green">تم الحفظ بنجاح</span> : null}
          </div>
        </TeacherFormSection>

        <TeacherFormSection
          icon={Shield}
          title="الحساب والإجراءات"
          description="كلمة المرور وحذف المعلم"
          tone="orange"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="outline" onClick={() => setConfirmReset(true)} disabled={resettingPassword}>
              <KeyRound className="h-4 w-4" />
              إعادة تعيين كلمة المرور
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              حذف المعلم
            </Button>
          </div>
        </TeacherFormSection>
      </div>

      {confirmReset ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmReset(false)}
        >
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-bold text-p-black">تأكيد تغيير كلمة المرور</p>
            <p className="mt-2 text-sm text-p-black/70">
              هل أنت متأكد من إعادة تعيين كلمة مرور المعلم{" "}
              <span className="font-semibold">{current.name}</span>؟
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setConfirmReset(false)}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setConfirmReset(false);
                  await resetTeacherPassword();
                }}
                disabled={resettingPassword}
              >
                {resettingPassword ? "جاري التغيير..." : "تأكيد"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmDelete(false)}
        >
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-bold text-p-black">تأكيد حذف المعلم</p>
            <p className="mt-2 text-sm text-p-black/70">
              هل أنت متأكد من حذف المعلم <span className="font-semibold">{current.name}</span>؟ سيتم حذف
              حسابه وإزالة جميع إسناداته.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteTeacher}
                disabled={deletingTeacher}
                className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
              >
                {deletingTeacher ? "جاري الحذف..." : "حذف"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <TeacherCropModal
        open={cropOpen}
        imageUrl={cropImageUrl}
        zoom={cropZoom}
        cropPos={cropPos}
        cropPixels={cropPixels}
        saving={uploadingImage}
        onZoomChange={setCropZoom}
        onCropChange={setCropPos}
        onCropComplete={setCropPixels}
        onCancel={cancelCrop}
        onConfirm={applyCropAndUpload}
      />
    </div>
  );
}
