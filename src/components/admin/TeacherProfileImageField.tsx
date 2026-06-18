"use client";

import { FileUploadField } from "@/components/molecules/FileUploadField";
import { teacherInitial } from "@/lib/adminTeachers";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type TeacherProfileImageFieldProps = {
  name: string;
  imageGradient: string;
  previewUrl?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
};

export function TeacherProfileImageField({
  name,
  imageGradient,
  previewUrl,
  disabled = false,
  onFileSelect,
}: TeacherProfileImageFieldProps) {
  const imageSrc = previewUrl?.startsWith("blob:") ? previewUrl : resolveMediaUrl(previewUrl);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className={cn(
          "flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white text-3xl font-bold text-white shadow-md",
          !imageSrc && `bg-gradient-to-br ${imageGradient}`
        )}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
        ) : (
          teacherInitial(name || "م")
        )}
      </div>
      <div className="min-w-0 flex-1">
        <FileUploadField
          label="صورة المعلم"
          preset="image"
          buttonText="اضغط لاختيار أو تغيير الصورة"
          disabled={disabled}
          selectedFileName={imageSrc ? "تم اختيار صورة" : null}
          onChange={(files) => onFileSelect(files?.[0] ?? null)}
        />
        <p className="mt-2 text-xs text-p-black/45">اختياري — صورة مربعة تظهر في صفحة الكادر والملف الشخصي.</p>
      </div>
    </div>
  );
}
