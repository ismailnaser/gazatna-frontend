"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { AdminTeacherAddForm, useAdminStaffTypes } from "@/components/admin/AdminTeacherAddForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import type { AccountCredentials } from "@/types";

export default function AdminNewTeacherPage() {
  const router = useRouter();
  const { staffTypes } = useAdminStaffTypes();
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="إضافة عضو كادر جديد"
        description="أضف أي شخص يعمل في المدرسة: مدير، نائب مدير، معلم، سكرتير…"
        className="mb-6"
      />

      {credentials ? (
        <div className="space-y-5">
          <Alert variant="success">
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/admin/teachers")}>العودة للكادر</Button>
            <Button
              variant="outline"
              onClick={() => {
                setCredentials(null);
                setFormKey((key) => key + 1);
              }}
            >
              إضافة عضو آخر
            </Button>
          </div>
        </div>
      ) : (
        <AdminTeacherAddForm
          key={formKey}
          staffTypes={staffTypes}
          onCancel={() => router.push("/admin/teachers")}
          onCreated={(_, creds) => {
            if (creds) {
              setCredentials(creds);
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }
            router.push("/admin/teachers");
          }}
        />
      )}
    </div>
  );
}
