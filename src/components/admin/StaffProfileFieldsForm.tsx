"use client";

import { useMemo } from "react";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import {
  computeAgeFromBirthDate,
  genderOptions,
  maritalStatusOptions,
  type StaffProfileFields,
} from "@/lib/staffProfile";
import type { StaffType } from "@/types/teacher";

type StaffProfileFieldsProps = {
  fields: StaffProfileFields;
  staffTypes: StaffType[];
  onChange: (fields: StaffProfileFields) => void;
  nationalIdError?: string;
};

export function StaffProfileFieldsForm({
  fields,
  staffTypes,
  onChange,
  nationalIdError,
}: StaffProfileFieldsProps) {
  const age = useMemo(() => computeAgeFromBirthDate(fields.dateOfBirth), [fields.dateOfBirth]);
  const selectedType = staffTypes.find((type) => type.id === fields.staffTypeId);

  function patch(partial: Partial<StaffProfileFields>) {
    onChange({ ...fields, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="التخصص / الوظيفة في المدرسة"
          name="staffTypeId"
          value={fields.staffTypeId}
          onChange={(e) => patch({ staffTypeId: e.target.value })}
          options={[
            { value: "", label: "— اختر —" },
            ...staffTypes.map((type) => ({ value: type.id, label: type.name })),
          ]}
        />
        <Input
          label="رقم الهوية"
          value={fields.nationalId}
          onChange={(e) => patch({ nationalId: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          inputMode="numeric"
          placeholder="9 أرقام"
          error={nationalIdError}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="الاسم بالعربي"
          value={fields.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
        <Input
          label="الاسم بالإنجليزي"
          value={fields.nameEn}
          onChange={(e) => patch({ nameEn: e.target.value })}
          dir="ltr"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="تاريخ الميلاد"
          type="date"
          value={fields.dateOfBirth}
          onChange={(e) => patch({ dateOfBirth: e.target.value })}
        />
        <Input label="العمر" value={age != null ? String(age) : "—"} readOnly disabled />
        <Select
          label="الجنس"
          name="gender"
          value={fields.gender}
          onChange={(e) => patch({ gender: e.target.value as StaffProfileFields["gender"] })}
          options={genderOptions}
        />
        <Select
          label="الحالة الاجتماعية"
          name="maritalStatus"
          value={fields.maritalStatus}
          onChange={(e) =>
            patch({ maritalStatus: e.target.value as StaffProfileFields["maritalStatus"] })
          }
          options={maritalStatusOptions}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="رقم الجوال"
          value={fields.mobile}
          onChange={(e) => patch({ mobile: e.target.value })}
          dir="ltr"
        />
        <Input
          label="رقم جوال بديل"
          value={fields.altMobile}
          onChange={(e) => patch({ altMobile: e.target.value })}
          dir="ltr"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="مكان السكن"
          value={fields.address}
          onChange={(e) => patch({ address: e.target.value })}
        />
        <Input
          label="تاريخ الالتحاق"
          type="date"
          value={fields.joinDate}
          onChange={(e) => patch({ joinDate: e.target.value })}
        />
      </div>

      <Textarea
        label="ملاحظات"
        value={fields.notes}
        onChange={(e) => patch({ notes: e.target.value })}
        rows={3}
      />

      {selectedType && !selectedType.isTeacher ? (
        <p className="rounded-xl border border-brand-blue/15 bg-brand-blue/5 px-3 py-2 text-sm text-p-black/65">
          هذا النوع لحفظ بيانات العامل في المدرسة فقط — بدون حساب دخول أو إسناد مواد.
        </p>
      ) : null}
    </div>
  );
}
