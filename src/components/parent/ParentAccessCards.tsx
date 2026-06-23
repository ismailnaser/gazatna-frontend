"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { CreditCard, Lock } from "lucide-react";

type ParentAccessBlockedCardProps = {
  message: string;
  studentName?: string;
};

export function ParentAccessBlockedCard({ message, studentName }: ParentAccessBlockedCardProps) {
  return (
    <Card className="mx-auto max-w-lg p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
        <Lock className="h-7 w-7 text-amber-600" />
      </div>
      <h2 className="text-lg font-bold text-p-black">الوصول مقيّد بسبب الرسوم</h2>
      {studentName ? (
        <p className="mt-2 text-sm font-medium text-p-black/70">الطالب: {studentName}</p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-p-black/65">{message}</p>
      <Button href="/parent/fees" className="mt-5 gap-1.5">
        <CreditCard className="h-4 w-4" />
        الذهاب إلى صفحة المالية
      </Button>
      <Link href="/parent/fees" className="mt-3 inline-block text-sm font-semibold text-p-green hover:underline">
        رفع إشعار دفع
      </Link>
    </Card>
  );
}

export function ParentNoStudentCard() {
  return (
    <Card className="text-center text-neutral-500">
      لا يوجد طالب مرتبط بحسابك. تواصل مع الإدارة.
    </Card>
  );
}

export type ParentStudentResponse = {
  accessRestricted?: boolean;
  accessRestrictionReason?: string;
  accessRestrictionMessage?: string;
};

export function isParentFeeRestricted(student: ParentStudentResponse | null | undefined) {
  return Boolean(student?.accessRestricted && student.accessRestrictionReason === "fees");
}
