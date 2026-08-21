"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { SubjectClassAssigner } from "@/components/admin/SubjectClassAssigner";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { canManageAdminClasses, isAdminRole } from "@/lib/adminRoles";
import { Save } from "lucide-react";

export default function AdminSubjectClassesPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { user } = useAuth();
  const canManageClasses = user && isAdminRole(user.role) && canManageAdminClasses(user.role);
  const { subjects, classes, grades, loading, setSubjectClasses } = useSchool();
  const subject = subjects.find((item) => item.id === id);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (subject) setSelectedClassIds(subject.classIds ?? []);
  }, [subject]);

  const availableClasses = classes;

  async function save() {
    if (!subject) return;
    if (selectedClassIds.length === 0) {
      setError("اختر فصلاً أو شعبة واحدة على الأقل.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setSubjectClasses(subject.id, selectedClassIds);
      router.push(`/admin/subjects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ إسناد الفصول");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspacePage
      title="إسناد للفصول"
      description={subject?.name}
      breadcrumbs={[
        { label: "المواد", href: "/admin/subjects" },
        { label: subject?.name ?? "...", href: `/admin/subjects/${id}` },
        { label: "الفصول" },
      ]}
      loading={loading && !subject}
      loadingMessage="جاري تحميل الفصول..."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <Card>
        {availableClasses.length === 0 ? (
          <p className="text-sm text-p-black/65">
            لا توجد فصول مسجّلة.{" "}
            {canManageClasses ? (
              <Link href="/admin/classes" className="font-semibold text-brand-blue hover:underline">
                أضف فصولاً أولاً
              </Link>
            ) : (
              "تواصل مع الإدارة الكلية."
            )}
          </p>
        ) : (
          <>
            <SubjectClassAssigner
              classes={availableClasses}
              grades={grades}
              selectedClassIds={selectedClassIds}
              onChange={setSelectedClassIds}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" href={`/admin/subjects/${id}`}>
                إلغاء
              </Button>
              <Button onClick={save} disabled={saving || selectedClassIds.length === 0}>
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ الفصول"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </WorkspacePage>
  );
}
