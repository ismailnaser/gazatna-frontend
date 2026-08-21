"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ProfileField, ProfileSection, formatProfileDate } from "@/components/dashboard/ProfileFields";
import { useSchool } from "@/context/SchoolContext";
import { genderOptions, maritalStatusOptions } from "@/lib/staffProfile";
import { resolveMediaUrl } from "@/lib/media";
import { teacherInitial } from "@/lib/adminTeachers";
import { cn } from "@/lib/utils";
import { Layers, Pencil } from "lucide-react";

function optionLabel(
  options: Array<{ value: string; label: string }>,
  value?: string | null
) {
  if (!value) return "";
  return options.find((item) => item.value === value)?.label ?? value;
}

export default function AdminStaffViewPage() {
  const params = useParams<{ id: string }>();
  const teacherId = String(params.id ?? "");
  const { teachers, classes, assignments, loading } = useSchool();
  const current = teachers.find((teacher) => teacher.id === teacherId);
  const classNames = (assignments[teacherId] ?? [])
    .map((classId) => classes.find((row) => row.id === classId)?.name)
    .filter(Boolean) as string[];
  const subjects =
    current?.subjects?.length
      ? current.subjects
      : current?.subject
        ? current.subject.split("، ").map((item) => item.trim()).filter(Boolean)
        : [];
  const imageSrc = resolveMediaUrl(current?.imageUrl);
  const isActive = current?.status !== "inactive";

  return (
    <WorkspacePage
      title={current?.name ?? "ملف عضو الكادر"}
      description={current?.staffTypeName || "بيانات عضو الكادر التعليمي."}
      breadcrumbs={[
        { label: "الكادر", href: "/admin/teachers" },
        { label: current?.name ?? "الملف" },
      ]}
      loading={loading && !current}
      loadingMessage="جاري تحميل الملف..."
      actions={
        current ? (
          <Button href={`/admin/teachers/${current.id}/edit`}>
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
        ) : null
      }
    >
      {!current && !loading ? (
        <p className="text-sm text-p-black/70">
          العضو غير موجود. ارجع إلى{" "}
          <Link href="/admin/teachers" prefetch={false} className="font-semibold text-brand-blue hover:underline">
            قائمة الكادر
          </Link>
          .
        </p>
      ) : current ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <span
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold text-white",
                !imageSrc && `bg-gradient-to-br ${current.imageGradient}`
              )}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                teacherInitial(current.name)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-p-black">{current.name}</p>
              {current.nameEn ? (
                <p className="mt-1 text-sm text-p-black/60" dir="ltr">
                  {current.nameEn}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="info">{current.staffTypeName || "—"}</Badge>
                {current.isTeacher ? (
                  <Badge variant={isActive ? "success" : "default"}>
                    {isActive ? "نشط" : "غير نشط"}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <ProfileSection title="البيانات الشخصية">
            <ProfileField label="الاسم بالعربية" value={current.name} />
            <ProfileField label="الاسم بالإنجليزية" value={current.nameEn} dir="ltr" />
            <ProfileField label="التخصص / الوظيفة" value={current.staffTypeName} />
            <ProfileField label="رقم الهوية" value={current.nationalId} dir="ltr" />
            <ProfileField label="تاريخ الميلاد" value={formatProfileDate(current.dateOfBirth)} />
            <ProfileField label="العمر" value={current.age != null ? `${current.age} سنة` : ""} />
            <ProfileField label="الجنس" value={optionLabel(genderOptions, current.gender)} />
            <ProfileField
              label="الحالة الاجتماعية"
              value={optionLabel(maritalStatusOptions, current.maritalStatus)}
            />
            <ProfileField label="تاريخ الالتحاق" value={formatProfileDate(current.joinDate)} />
          </ProfileSection>

          <ProfileSection title="التواصل">
            <ProfileField label="الجوال" value={current.mobile} dir="ltr" />
            <ProfileField label="جوال بديل" value={current.altMobile} dir="ltr" />
            <ProfileField label="اسم المستخدم" value={current.username} dir="ltr" />
            <ProfileField label="العنوان" value={current.address} wide />
          </ProfileSection>

          {current.isTeacher ? (
            <ProfileSection title="التدريس">
              <ProfileField
                label="المواد"
                value={
                  subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {subjects.map((subject) => (
                        <Badge key={subject} variant="info">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    ""
                  )
                }
                wide
              />
              <ProfileField
                label="الفصول المسندة"
                value={
                  classNames.length > 0 ? (
                    <div className="space-y-2">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">
                        <Layers className="h-3.5 w-3.5" />
                        {classNames.length} فصل
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {classNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    ""
                  )
                }
                wide
              />
              <ProfileField label="الخبرة" value={current.experience} wide />
              <ProfileField label="مربي الصف" value={current.homeroomClassName} />
            </ProfileSection>
          ) : null}

          <ProfileSection title="ملاحظات">
            <ProfileField
              label="السيرة / النبذة"
              value={current.bio ? <p className="whitespace-pre-wrap">{current.bio}</p> : ""}
              wide
            />
            <ProfileField
              label="ملاحظات داخلية"
              value={current.notes ? <p className="whitespace-pre-wrap">{current.notes}</p> : ""}
              wide
            />
          </ProfileSection>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
