"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { cn } from "@/lib/utils";
import type { AccountCredentials } from "@/types";
import { Plus, Save, Trash2, ImagePlus } from "lucide-react";

const gradients = [
  "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
  "from-[#1a1a1a] to-[#404040]",
];

export default function AdminTeachersPage() {
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
  const [draftClasses, setDraftClasses] = useState<string[]>([]);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [addSubjectIds, setAddSubjectIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  function selectTeacher(id: string) {
    if (selectedTeacher === id) {
      setSelectedTeacher("");
      setDraftClasses([]);
      setDraftSubjects([]);
      setSaved(false);
      setEditImagePreview(null);
      return;
    }
    const teacher = teachers.find((t) => t.id === id);
    setSelectedTeacher(id);
    setDraftClasses(assignments[id] ?? []);
    setDraftSubjects(teacher?.subjectIds ?? []);
    setEditImagePreview(teacher?.imageUrl ?? null);
    setSaved(false);
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
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedTeacher) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setEditImagePreview(URL.createObjectURL(file));
    try {
      const updated = await updateTeacher(selectedTeacher, {}, file);
      setEditImagePreview(updated.imageUrl ?? null);
    } catch {
      const teacher = teachers.find((t) => t.id === selectedTeacher);
      setEditImagePreview(teacher?.imageUrl ?? null);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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
    const image = form.get("image");
    const imageFile = image instanceof File && image.size > 0 ? image : undefined;

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
    setImagePreview(null);
    formEl.reset();
  }

  const current = teachers.find((t) => t.id === selectedTeacher);

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-4 font-bold text-[#1a1a1a]">المعلمون</h3>
          {teachers.length === 0 ? (
            <p className="text-sm text-neutral-500">لا يوجد معلمون بعد.</p>
          ) : (
            <ul className="space-y-2">
              {teachers.map((t) => (
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {current ? (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">
                    إسناد المواد والفصول — {current.name}
                  </h3>
                  <p className="text-sm text-[#1a1a1a]/50">{current.subject}</p>
                  {current.userId && (
                    <Badge variant="info" className="mt-2">
                      مربوط بحساب نظام
                    </Badge>
                  )}
                </div>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={async () => {
                    await removeTeacher(current.id);
                    setSelectedTeacher("");
                    setDraftClasses([]);
                    setDraftSubjects([]);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </Button>
              </div>

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
                        <img
                          src={editImagePreview}
                          alt={current.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        current.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0)
                      )}
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]">
                      <ImagePlus className="h-5 w-5" />
                      {uploadingImage ? "جاري الرفع..." : "تغيير الصورة"}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={handleEditImageChange}
                      />
                    </label>
                  </div>
                </div>

                <Input
                  label="الخبرة"
                  value={current.experience}
                  onChange={(e) =>
                    updateTeacher(current.id, { experience: e.target.value })
                  }
                />
                <Textarea
                  label="نبذة"
                  value={current.bio}
                  onChange={(e) => updateTeacher(current.id, { bio: e.target.value })}
                />
              </div>

              <p className="mb-4 text-sm font-medium text-[#1a1a1a]/70">
                المواد الدراسية المسندة:
              </p>

              {subjects.length === 0 ? (
                <p className="mb-6 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                  لا توجد مواد مسجّلة.{" "}
                  <Link href="/admin/subjects" className="text-brand-blue hover:underline">
                    أضف المواد من صفحة إدارة المواد
                  </Link>
                </p>
              ) : (
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
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSubject(s.id)}
                          className="accent-[var(--brand-teal)]"
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              )}

              <p className="mb-4 text-sm font-medium text-[#1a1a1a]/70">
                الفصول المسندة:
              </p>

              {classes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
                  لا توجد فصول مسجّلة.{" "}
                  <Link href="/admin/classes" className="text-brand-blue hover:underline">
                    أضف الفصول من صفحة إدارة الفصول
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls) => {
                    const checked = draftClasses.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                          checked
                            ? "border-[var(--brand-teal)] bg-[var(--brand-teal)]/5"
                            : "border-neutral-200 hover:border-[var(--brand-teal)]/30"
                        )}
                      >
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{cls.name}</p>
                          <p className="text-xs text-[#1a1a1a]/50">
                            {cls.studentCount} طالب
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClass(cls.id)}
                          className="h-5 w-5 rounded accent-[var(--brand-teal)]"
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <Button
                  onClick={handleSave}
                  disabled={subjects.length === 0 || draftSubjects.length === 0}
                >
                  <Save className="h-4 w-4" />
                  حفظ الإسناد
                </Button>
                {saved && (
                  <span className="text-sm text-[var(--brand-teal)]">تم الحفظ بنجاح</span>
                )}
              </div>
            </>
          ) : teachers.length === 0 ? (
            <p className="text-[#1a1a1a]/50">لا يوجد معلمون. أضف معلماً للبدء.</p>
          ) : (
            <p className="rounded-xl bg-neutral-50 px-4 py-12 text-center text-sm text-neutral-500">
              اختر معلماً من القائمة لإسناد المواد والفصول وتعديل السيرة الذاتية.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
