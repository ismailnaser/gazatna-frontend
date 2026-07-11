export type StaffGender = "male" | "female" | "";
export type StaffMaritalStatus = "single" | "married" | "divorced" | "widowed" | "";

export type StaffProfileFields = {
  staffTypeId: string;
  name: string;
  nameEn: string;
  nationalId: string;
  dateOfBirth: string;
  gender: StaffGender;
  maritalStatus: StaffMaritalStatus;
  mobile: string;
  altMobile: string;
  address: string;
  joinDate: string;
  notes: string;
};

export const emptyStaffProfileFields = (): StaffProfileFields => ({
  staffTypeId: "",
  name: "",
  nameEn: "",
  nationalId: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  mobile: "",
  altMobile: "",
  address: "",
  joinDate: "",
  notes: "",
});

export const genderOptions = [
  { value: "", label: "— اختر —" },
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

export const maritalStatusOptions = [
  { value: "", label: "— اختر —" },
  { value: "single", label: "أعزب/عزباء" },
  { value: "married", label: "متزوج/ة" },
  { value: "divorced", label: "مطلق/ة" },
  { value: "widowed", label: "أرمل/ة" },
];

export function computeAgeFromBirthDate(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function validateNationalId(value: string): string | null {
  const cleaned = value.trim();
  if (!/^\d{9}$/.test(cleaned)) {
    return "رقم الهوية يجب أن يكون 9 أرقام.";
  }
  return null;
}

export function staffFieldsToPayload(fields: StaffProfileFields): Record<string, unknown> {
  return {
    staffTypeId: Number(fields.staffTypeId),
    name: fields.name.trim(),
    nameEn: fields.nameEn.trim(),
    nationalId: fields.nationalId.trim(),
    dateOfBirth: fields.dateOfBirth || null,
    gender: fields.gender || "",
    maritalStatus: fields.maritalStatus || "",
    mobile: fields.mobile.trim(),
    altMobile: fields.altMobile.trim(),
    address: fields.address.trim(),
    joinDate: fields.joinDate || null,
    notes: fields.notes.trim(),
  };
}

export function appendStaffFieldsToFormData(formData: FormData, fields: StaffProfileFields) {
  const payload = staffFieldsToPayload(fields);
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) continue;
    formData.append(key, String(value));
  }
}
