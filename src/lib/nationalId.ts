export const NATIONAL_ID_LENGTH = 9;

export function normalizeNationalId(value: string): string {
  return value.replace(/\D/g, "").slice(0, NATIONAL_ID_LENGTH);
}

export function isValidNationalId(value: string): boolean {
  return /^\d{9}$/.test(normalizeNationalId(value));
}

export function validateNationalId(
  value: string,
  options: { required?: boolean } = {}
): string | null {
  const { required = false } = options;
  const normalized = normalizeNationalId(value);

  if (!normalized) {
    return required ? "رقم الهوية مطلوب" : null;
  }

  if (normalized.length !== NATIONAL_ID_LENGTH) {
    return `رقم الهوية يجب أن يتكون من ${NATIONAL_ID_LENGTH} أرقام`;
  }

  return null;
}

type NationalIdOwner = { id?: string; nationalId?: string };

export function validateNationalIdUniqueness(
  value: string,
  existing: NationalIdOwner[],
  options: { excludeStudentId?: string } = {}
): string | null {
  const normalized = normalizeNationalId(value);
  if (!normalized) return null;

  const duplicate = existing.some((entry) => {
    if (options.excludeStudentId && entry.id === options.excludeStudentId) {
      return false;
    }
    return normalizeNationalId(entry.nationalId ?? "") === normalized;
  });

  return duplicate ? "رقم الهوية مستخدم مسبقاً لطالب آخر" : null;
}

export function validateStudentNationalId(
  value: string,
  options: {
    required?: boolean;
    existingStudents?: NationalIdOwner[];
    excludeStudentId?: string;
  } = {}
): string | null {
  const formatError = validateNationalId(value, { required: options.required });
  if (formatError) return formatError;

  if (options.existingStudents?.length) {
    return validateNationalIdUniqueness(value, options.existingStudents, {
      excludeStudentId: options.excludeStudentId,
    });
  }

  return null;
}

export const nationalIdInputProps = {
  inputMode: "numeric" as const,
  maxLength: NATIONAL_ID_LENGTH,
  pattern: "[0-9]{9}",
  title: "9 أرقام",
  dir: "ltr" as const,
  onInput: (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const cleaned = normalizeNationalId(input.value);
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
  },
};
