"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { StaffProfileFieldsForm } from "@/components/admin/StaffProfileFieldsForm";
import { TeacherClassPicker } from "@/components/admin/TeacherClassPicker";
import { cropTeacherImageFile, TeacherCropModal } from "@/components/admin/TeacherCropModal";
import { TeacherFormSection } from "@/components/admin/TeacherFormSection";
import { TeacherProfileImageField } from "@/components/admin/TeacherProfileImageField";
import { TeacherSubjectPicker } from "@/components/admin/TeacherSubjectPicker";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { pickTeacherGradient } from "@/lib/adminTeachers";
import { buildOccupiedPairs, findAssignmentConflicts } from "@/lib/adminTeacherAssignments";
import { emptyStaffProfileFields, validateNationalId, type StaffProfileFields } from "@/lib/staffProfile";
import type { AccountCredentials } from "@/types";
import type { StaffType, TeacherProfile } from "@/types/teacher";
import { BookMarked, Layers, Save, UserRound } from "lucide-react";

type AdminTeacherAddFormProps = {
  staffTypes: StaffType[];
  onCancel: () => void;
  onCreated: (teacher: TeacherProfile, credentials: AccountCredentials | null) => void;
};

function mapStaffType(raw: Record<string, unknown>): StaffType {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    isTeacher: Boolean(raw.isTeacher),
    sortOrder: Number(raw.sortOrder ?? 0),
  };
}

export function AdminTeacherAddForm({ staffTypes, onCancel, onCreated }: AdminTeacherAddFormProps) {
  const { teachers, classes, grades, subjects, addTeacher } = useSchool();
  const [profileFields, setProfileFields] = useState<StaffProfileFields>(emptyStaffProfileFields);
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [nationalIdError, setNationalIdError] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("staff.jpg");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [cropping, setCropping] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);
  const personalSectionRef = useRef<HTMLDivElement>(null);
  const subjectsSectionRef = useRef<HTMLDivElement>(null);

  const gradient = pickTeacherGradient(teachers.length);
  const occupiedPairs = useMemo(() => buildOccupiedPairs(teachers), [teachers]);
  const selectedType = staffTypes.find((type) => type.id === profileFields.staffTypeId);
  const isTeacherType = selectedType?.isTeacher === true;

  useEffect(() => {
    if (!profileFields.staffTypeId && staffTypes.length > 0) {
      setProfileFields((prev) => ({ ...prev, staffTypeId: staffTypes[0].id }));
    }
  }, [staffTypes, profileFields.staffTypeId]);

  function handleFileSelect(file: File | null) {
    if (!file) {
      setAddImageFile(null);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setCropFileName(file.name || "staff.jpg");
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

  function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nationalError = validateNationalId(profileFields.nationalId);
    setNationalIdError(nationalError ?? "");

    if (!profileFields.staffTypeId) {
      setError("يرجى اختيار التخصص / الوظيفة");
      scrollToSection(personalSectionRef);
      return;
    }
    if (!profileFields.name.trim()) {
      setError("يرجى إدخال الاسم بالعربي");
      scrollToSection(personalSectionRef);
      return;
    }
    if (nationalError) {
      setError(nationalError);
      scrollToSection(personalSectionRef);
      return;
    }

    if (isTeacherType && subjectIds.length === 0) {
      setError("يرجى اختيار مادة واحدة على الأقل للمعلم");
      scrollToSection(subjectsSectionRef);
      return;
    }

    if (isTeacherType) {
      const conflicts = findAssignmentConflicts(teachers, subjects, classes, subjectIds, classIds);
      if (conflicts.length > 0) {
        setError(conflicts[0]);
        scrollToSection(subjectsSectionRef);
        return;
      }
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
          staffTypeId: profileFields.staffTypeId,
          name: profileFields.name.trim(),
          nameEn: profileFields.nameEn.trim(),
          nationalId: profileFields.nationalId.trim(),
          dateOfBirth: profileFields.dateOfBirth || null,
          gender: profileFields.gender,
          maritalStatus: profileFields.maritalStatus,
          mobile: profileFields.mobile.trim(),
          altMobile: profileFields.altMobile.trim(),
          address: profileFields.address.trim(),
          joinDate: profileFields.joinDate || null,
          notes: profileFields.notes.trim(),
          subjectIds: isTeacherType ? subjectIds : [],
          subject: subjectNames,
          experience: experience.trim(),
          bio: bio.trim(),
          imageGradient: gradient,
          classIds: isTeacherType ? classIds : [],
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
      setError(err instanceof Error ? err.message : "فشل إضافة عضو الكادر");
      scrollToSection(formTopRef);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div ref={formTopRef} className="scroll-mt-24 space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <div ref={personalSectionRef} className="scroll-mt-24">
            <TeacherFormSection
              icon={UserRound}
              title="بيانات عضو الكادر"
              description="البيانات الأساسية لأي شخص يعمل في المدرسة"
              tone="blue"
            >
              <div className="space-y-4">
                <StaffProfileFieldsForm
                  fields={profileFields}
                  staffTypes={staffTypes}
                  onChange={setProfileFields}
                  nationalIdError={nationalIdError}
                />
                <TeacherProfileImageField
                  name={profileFields.name}
                  imageGradient={gradient}
                  previewUrl={imagePreview}
                  onFileSelect={handleFileSelect}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="الخبرة (اختياري)"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="مثال: 10 سنوات في الإدارة المدرسية"
                  />
                </div>
                <Textarea
                  label="نبذة / سيرة ذاتية (اختياري)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </TeacherFormSection>
          </div>
        </div>

        {isTeacherType ? (
          <>
            <div ref={subjectsSectionRef} className="scroll-mt-24">
              <TeacherFormSection
                icon={BookMarked}
                title="المواد الدراسية"
                description="اختر مادة واحدة على الأقل"
                tone="violet"
              >
                <TeacherSubjectPicker
                  subjects={subjects}
                  value={subjectIds}
                  onChange={setSubjectIds}
                  classIds={classIds}
                  occupiedPairs={occupiedPairs}
                />
              </TeacherFormSection>
            </div>

            <TeacherFormSection
              icon={Layers}
              title="الفصول المسندة"
              description="تظهر فقط الفصول والشعب المسندة للمواد التي اخترتها"
              tone="green"
            >
              <TeacherClassPicker
                classes={classes}
                grades={grades}
                subjects={subjects}
                value={classIds}
                onChange={setClassIds}
                subjectIds={subjectIds}
                occupiedPairs={occupiedPairs}
              />
            </TeacherFormSection>
          </>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={
              submitting ||
              !profileFields.name.trim() ||
              !profileFields.staffTypeId ||
              (isTeacherType && subjectIds.length === 0)
            }
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

export function useAdminStaffTypes() {
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminStaffTypes()
      .then((rows) =>
        setStaffTypes(
          rows
            .map((row) => mapStaffType(row as Record<string, unknown>))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        )
      )
      .catch(() => setStaffTypes([]))
      .finally(() => setLoading(false));
  }, []);

  return { staffTypes, setStaffTypes, loading };
}
