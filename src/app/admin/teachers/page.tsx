"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherCard } from "@/components/molecules/TeacherCard";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { cropImageToFile } from "@/lib/imageCrop";
import { cn } from "@/lib/utils";
import type { AccountCredentials } from "@/types";
import { KeyRound, Plus, Save, Trash2, ImagePlus } from "lucide-react";
import Cropper from "react-easy-crop";

const gradients = [
  "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
  "from-[#1a1a1a] to-[#404040]",
];

export default function AdminTeachersPage() {
  const router = useRouter();
  const {
    teachers,
    classes,
    subjects,
    assignments,
    setTeacherClasses,
    addTeacher,
    updateTeacher,
    removeTeacher,
  } = useSchool();

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [search, setSearch] = useState("");
  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [draftClasses, setDraftClasses] = useState<string[]>([]);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [addSubjectIds, setAddSubjectIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [confirmDeleteTeacherId, setConfirmDeleteTeacherId] = useState<string>("");
  const [deletingTeacher, setDeletingTeacher] = useState(false);
  const [confirmResetTeacherId, setConfirmResetTeacherId] = useState<string>("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>("teacher.jpg");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropTarget, setCropTarget] = useState<"add" | "edit">("edit");

  function selectTeacher(id: string) {
    router.push(`/admin/teachers/${id}`);
  }

  function toggleClass(classId: string) {
    setDraftClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
    setSaved(false);
  }

  function toggleSubject(subjectId: string) {
    setDraftSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
    setSaved(false);
  }

  function toggleAddSubject(subjectId: string) {
    setAddSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  }

  async function handleSave() {
    if (!selectedTeacher || draftSubjects.length === 0) return;
    await Promise.all([
      setTeacherClasses(selectedTeacher, draftClasses),
      updateTeacher(selectedTeacher, { subjectIds: draftSubjects }),
    ]);
    setSaved(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setAddImageFile(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setCropTarget("add");
    setCropImageUrl(url);
    setCropFileName(file.name || "teacher.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropOpen(true);
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedTeacher) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCropTarget("edit");
    setCropImageUrl(url);
    setCropFileName(file.name || "teacher.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropOpen(true);
    e.target.value = "";
  }

  async function handleAddTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (addSubjectIds.length === 0) return;

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const subjectNames = subjects
      .filter((s) => addSubjectIds.includes(s.id))
      .map((s) => s.name)
      .join("، ");
    const imageFile = addImageFile ?? undefined;

    const created = await addTeacher({
      name: form.get("name") as string,
      subjectIds: addSubjectIds,
      subject: subjectNames,
      experience: form.get("experience") as string,
      bio: form.get("bio") as string,
      imageGradient: gradients[teachers.length % gradients.length],
    }, imageFile);
    if (created.username && created.generatedPassword) {
      setCredentials({
        name: created.name,
        username: created.username,
        password: created.generatedPassword,
        role: "teacher",
      });
    }
    setShowForm(false);
    setAddSubjectIds([]);
    setAddImageFile(null);
    setImagePreview(null);
    formEl.reset();
  }

  const current = teachers.find((t) => t.id === selectedTeacher);

  const hasActiveFilters = Boolean(
    search.trim() || subjectFilters.length > 0 || classFilters.length > 0
  );

  const filteredTeachers = teachers.filter((t) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = [t.name, t.username, t.subject].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (subjectFilters.length > 0) {
      const teacherSubjects = t.subjectIds ?? [];
      if (!subjectFilters.some((id) => teacherSubjects.includes(id))) return false;
    }
    if (classFilters.length > 0) {
      const teacherClasses = assignments[t.id] ?? [];
      if (!classFilters.some((id) => teacherClasses.includes(id))) return false;
    }
    return true;
  });

  function clearFilters() {
    setSearch("");
    setSubjectFilters([]);
    setClassFilters([]);
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
        setResetCredentials({
          name: current.name,
          username,
          password,
          role: "teacher",
        });
      }
    } finally {
      setResettingPassword(false);
    }
  }

  function openResetTeacherConfirm() {
    if (!current?.id) return;
    setConfirmResetTeacherId(current.id);
  }

  function closeResetTeacherConfirm() {
    setConfirmResetTeacherId("");
  }

  async function confirmResetTeacherPassword() {
    if (!confirmResetTeacherId) return;
    closeResetTeacherConfirm();
    await resetTeacherPassword();
  }

  async function applyCropAndUpload() {
    if (!cropImageUrl || !cropPixels) return;
    if (cropTarget === "edit" && !selectedTeacher) return;
    setUploadingImage(true);
    try {
      const cropped = await cropImageToFile(cropImageUrl, cropPixels, cropFileName);
      if (cropTarget === "edit") {
        const updated = await updateTeacher(selectedTeacher, {}, cropped);
        setEditImagePreview(updated.imageUrl ?? null);
      } else {
        setAddImageFile(cropped);
        setImagePreview(URL.createObjectURL(cropped));
      }
      setCropOpen(false);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    } catch {
      if (cropTarget === "edit") {
        const teacher = teachers.find((t) => t.id === selectedTeacher);
        setEditImagePreview(teacher?.imageUrl ?? null);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  function cancelCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    setCropOpen(false);
  }

  function openDeleteTeacherConfirm() {
    if (!current?.id) return;
    setConfirmDeleteTeacherId(current.id);
  }

  function closeDeleteTeacherConfirm() {
    setConfirmDeleteTeacherId("");
  }

  async function confirmDeleteTeacher() {
    if (!confirmDeleteTeacherId) return;
    setDeletingTeacher(true);
    try {
      await removeTeacher(confirmDeleteTeacherId);
      setSelectedTeacher("");
      setDraftClasses([]);
      setDraftSubjects([]);
      setConfirmDeleteTeacherId("");
    } finally {
      setDeletingTeacher(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="الكادر التعليمي"
          description="إدارة المعلمين وإسناد المواد والفصول لهم"
        />
        <Button onClick={() => { setShowForm(!showForm); setCredentials(null); setImagePreview(null); }}>
          <Plus className="h-4 w-4" />
          إضافة معلم
        </Button>
      </div>

      {credentials && (
        <Alert variant="success" className="mb-6">
          <p className="mb-2 font-semibold">تم إنشاء حساب المعلم تلقائياً — احفظ بيانات الدخول:</p>
          <p>الاسم: {credentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{credentials.username}</span>
          </p>
          <p>
            كلمة المرور: <span dir="ltr">{credentials.password}</span>
          </p>
          <p className="mt-2 text-xs opacity-80">
            يُستخدم اسم المستخدم وكلمة المرور لتسجيل الدخول من بوابة المعلم.
          </p>
        </Alert>
      )}

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

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAddTeacher} className="grid gap-4 sm:grid-cols-2">
            <Input label="اسم المعلم" name="name" required />
            <Input label="الخبرة" name="experience" required />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-p-black/80">
                صورة المعلم (اختياري)
              </label>
              <div className="flex flex-wrap items-start gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]">
                  <ImagePlus className="h-5 w-5" />
                  اختيار صورة
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="معاينة صورة المعلم"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="mb-3 text-sm font-medium text-[#1a1a1a]/80">
                المواد الدراسية (يمكن اختيار أكثر من مادة):
              </p>
              {subjects.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-4 text-sm text-neutral-500">
                  لا توجد مواد مسجّلة.{" "}
                  <Link href="/admin/subjects" className="text-brand-blue hover:underline">
                    أضف المواد أولاً
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => {
                    const checked = addSubjectIds.includes(s.id);
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
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddSubject(s.id)}
                          className="accent-[var(--brand-teal)]"
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <Textarea label="نبذة (السيرة الذاتية)" name="bio" required className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={subjects.length === 0 || addSubjectIds.length === 0}>
                إضافة للكادر
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <h3 className="mb-4 font-bold text-[#1a1a1a]">المعلمون</h3>
          <div className="mb-4 space-y-3">
            <Input
              label="بحث"
              placeholder="ابحث باسم المعلم أو اسم المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={clearFilters}
                >
                  إزالة الفلاتر
                </Button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MultiSelect
                label="فلترة حسب المادة"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                value={subjectFilters}
                onChange={setSubjectFilters}
                placeholder="كل المواد"
                countLabel="مواد"
              />
              <MultiSelect
                label="فلترة حسب الفصل"
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
                value={classFilters}
                onChange={setClassFilters}
                placeholder="كل الفصول"
              />
            </div>
          </div>
          {teachers.length === 0 ? (
            <p className="text-sm text-neutral-500">لا يوجد معلمون بعد.</p>
          ) : filteredTeachers.length === 0 ? (
            <p className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
              لا يوجد معلم مطابق للبحث أو الفلاتر.
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredTeachers.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => selectTeacher(t.id)}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-start transition-colors",
                      selectedTeacher === t.id
                        ? "bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]"
                        : "hover:bg-neutral-50"
                    )}
                  >
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-[#1a1a1a]/50">{t.subject || "بدون مواد"}</p>
                    <p className="mt-1 text-xs text-[var(--brand-teal)]">
                      {(t.subjectIds ?? []).length} مادة · {(assignments[t.id] ?? []).length} فصل
                    </p>
                    {t.username && (
                      <p className="mt-1 text-xs text-[#1a1a1a]/50" dir="ltr">
                        ({t.username})
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {confirmDeleteTeacherId && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeDeleteTeacherConfirm}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف المعلم</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من حذف المعلم <span className="font-semibold">{current.name}</span>؟
                سيتم حذف حسابه إن وجد وإزالة جميع إسناداته للفصول والمواد.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDeleteTeacherConfirm}>
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
        </div>
      )}

      {confirmResetTeacherId && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeResetTeacherConfirm}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد تغيير كلمة المرور</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من إعادة تعيين كلمة مرور المعلم{" "}
                <span className="font-semibold">{current.name}</span>؟ سيتم إنشاء كلمة مرور جديدة وسيتم عرضها لك مرة واحدة.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeResetTeacherConfirm}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmResetTeacherPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "جاري التغيير..." : "تأكيد"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {cropOpen && cropImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={cancelCrop}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-neutral-100 px-5 py-4">
              <p className="text-base font-bold text-p-black">قص صورة المعلم</p>
              <p className="mt-1 text-sm text-neutral-500">
                حرّك الصورة وحدد الإطار قبل الحفظ.
              </p>
            </div>

            <div className="relative h-[360px] bg-black">
              <Cropper
                image={cropImageUrl}
                crop={cropPos}
                zoom={cropZoom}
                aspect={1}
                onCropChange={setCropPos}
                onZoomChange={setCropZoom}
                onCropComplete={(_, pixels) => setCropPixels(pixels)}
              />
            </div>

            <div className="px-5 py-4">
              <label className="mb-2 block text-sm font-medium text-p-black/80">
                التكبير
              </label>
              <input
                aria-label="التكبير"
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="w-full"
              />

              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={cancelCrop}>
                  إلغاء
                </Button>
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
