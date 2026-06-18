"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { TeacherClassPicker } from "@/components/admin/TeacherClassPicker";
import { cropTeacherImageFile, TeacherCropModal } from "@/components/admin/TeacherCropModal";
import { TeacherFormSection } from "@/components/admin/TeacherFormSection";
import { TeacherProfileImageField } from "@/components/admin/TeacherProfileImageField";
import { TeacherSubjectPicker } from "@/components/admin/TeacherSubjectPicker";
import { useSchool } from "@/context/SchoolContext";
import { pickTeacherGradient } from "@/lib/adminTeachers";
import type { AccountCredentials } from "@/types";
import type { TeacherProfile } from "@/types/teacher";
import { BookMarked, Layers, Save, UserRound } from "lucide-react";

type AdminTeacherAddFormProps = {
  onCancel: () => void;
  onCreated: (teacher: TeacherProfile, credentials: AccountCredentials | null) => void;
};

export function AdminTeacherAddForm({ onCancel, onCreated }: AdminTeacherAddFormProps) {
  const { teachers, classes, subjects, addTeacher } = useSchool();
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
  const [cropping, setCropping] = useState(false);

  const gradient = pickTeacherGradient(teachers.length);

  function handleFileSelect(file: File | null) {
    if (!file) {
      setAddImageFile(null);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setCropFileName(file.name || "teacher.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropImageUrl(url);
    setCropOpen(true);
  }

  async function applyCrop() {
    if (!cropImageUrl || !cropPixels) return;
    setCropping(true);
    try {
      const cropped = await cropTeacherImageFile(cropImageUrl, cropPixels, cropFileName);
      setAddImageFile(cropped);
      setImagePreview(URL.createObjectURL(cropped));
      setCropOpen(false);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    } catch {
      setError("فشل قص الصورة");
    } finally {
      setCropping(false);
    }
  }

  function cancelCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    setCropOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !experience.trim() || !bio.trim() || subjectIds.length === 0) {
      setError("يرجى تعبئة جميع الحقول المطلوبة واختيار مادة واحدة على الأقل");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const subjectNames = subjects
        .filter((subject) => subjectIds.includes(subject.id))
        .map((subject) => subject.name)
        .join("، ");

      const created = await addTeacher(
        {
          name: name.trim(),
          subjectIds,
          subject: subjectNames,
          experience: experience.trim(),
          bio: bio.trim(),
          imageGradient: gradient,
          classIds,
        },
        addImageFile ?? undefined
      );

      const credentials =
        created.username && created.generatedPassword
          ? {
              name: created.name,
              username: created.username,
              password: created.generatedPassword,
              role: "teacher" as const,
            }
          : null;

      onCreated(created, credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة المعلم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <TeacherFormSection
          icon={UserRound}
          title="البيانات الشخصية"
          description="الاسم، الصورة، الخبرة، والسيرة الذاتية"
          tone="blue"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="اسم المعلم" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input
                label="الخبرة"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="مثال: 10 سنوات في تدريس الرياضيات"
                required
              />
            </div>
            <TeacherProfileImageField
              name={name}
              imageGradient={gradient}
              previewUrl={imagePreview}
              onFileSelect={handleFileSelect}
            />
            <Textarea
              label="نبذة (السيرة الذاتية)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              required
            />
          </div>
        </TeacherFormSection>

        <TeacherFormSection
          icon={BookMarked}
          title="المواد الدراسية"
          description="اختر مادة واحدة على الأقل"
          tone="violet"
        >
          <TeacherSubjectPicker subjects={subjects} value={subjectIds} onChange={setSubjectIds} />
        </TeacherFormSection>

        <TeacherFormSection
          icon={Layers}
          title="الفصول المسندة"
          description="اختياري — يمكن تعيين الفصول لاحقاً"
          tone="green"
        >
          <TeacherClassPicker classes={classes} value={classIds} onChange={setClassIds} />
        </TeacherFormSection>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={submitting || subjects.length === 0 || subjectIds.length === 0}
            className="sm:min-w-[160px]"
          >
            <Save className="h-4 w-4" />
            {submitting ? "جاري الإضافة..." : "إضافة للكادر"}
          </Button>
        </div>
      </form>

      <TeacherCropModal
        open={cropOpen}
        imageUrl={cropImageUrl}
        zoom={cropZoom}
        cropPos={cropPos}
        cropPixels={cropPixels}
        saving={cropping}
        onZoomChange={setCropZoom}
        onCropChange={setCropPos}
        onCropComplete={setCropPixels}
        onCancel={cancelCrop}
        onConfirm={applyCrop}
      />
    </>
  );
}
