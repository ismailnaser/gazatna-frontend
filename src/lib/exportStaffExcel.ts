import { downloadBlob } from "@/lib/downloadBlob";
import { formatExportDate } from "@/lib/pdfExport";
import {
  computeAgeFromBirthDate,
  genderOptions,
  maritalStatusOptions,
} from "@/lib/staffProfile";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import type { WorkSheet } from "xlsx";

const HEADERS = [
  "الاسم بالعربي",
  "الاسم بالإنجليزي",
  "التخصص",
  "رقم الهوية",
  "الجوال",
  "الجوال البديل",
  "الجنس",
  "الحالة الاجتماعية",
  "تاريخ الميلاد",
  "العمر",
  "العنوان",
  "تاريخ الالتحاق",
  "اسم المستخدم",
  "المواد",
  "الفصول",
  "الحالة",
  "الخبرة",
  "ملاحظات",
] as const;

const COLUMN_WIDTHS = [22, 22, 14, 14, 14, 14, 10, 14, 14, 8, 24, 14, 16, 24, 24, 10, 18, 24];
const TEXT_COLUMN_INDEXES = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17]);
const HEADER_ROW_INDEX = 3;
const DATA_START_ROW_INDEX = 4;

const genderLabels = Object.fromEntries(
  genderOptions.filter((option) => option.value).map((option) => [option.value, option.label])
);
const maritalLabels = Object.fromEntries(
  maritalStatusOptions
    .filter((option) => option.value)
    .map((option) => [option.value, option.label])
);

type ExportStaffOptions = {
  assignments: Record<string, string[]>;
  classes: SchoolClass[];
};

function formatArabicExportLabel() {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

function cellRef(row: number, col: number) {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

function markTextColumns(worksheet: WorkSheet, rowCount: number) {
  for (let row = DATA_START_ROW_INDEX; row < rowCount; row += 1) {
    for (const col of TEXT_COLUMN_INDEXES) {
      const ref = cellRef(row, col);
      const cell = worksheet[ref];
      if (!cell) continue;
      worksheet[ref] = { t: "s", v: String(cell.v ?? "") };
    }
  }
}

function staffSubjects(member: TeacherProfile): string {
  if (member.subjects?.length) return member.subjects.join("، ");
  return member.subject?.trim() || "";
}

function staffClasses(
  memberId: string,
  assignments: Record<string, string[]>,
  classes: SchoolClass[]
): string {
  const ids = assignments[memberId] ?? [];
  return classes
    .filter((schoolClass) => ids.includes(schoolClass.id))
    .map((schoolClass) => schoolClass.name)
    .join("، ");
}

function staffStatus(member: TeacherProfile): string {
  if (!member.isTeacher) return "—";
  return member.status === "inactive" ? "غير نشط" : "نشط";
}

function buildWorksheet(staff: TeacherProfile[], options: ExportStaffOptions) {
  const rows: Array<Array<string | number>> = [
    ["سجل الكادر"],
    [`تاريخ التصدير: ${formatArabicExportLabel()} — عدد الأعضاء: ${staff.length}`],
    [],
    [...HEADERS],
    ...staff.map((member) => [
      member.name,
      member.nameEn ?? "",
      member.staffTypeName ?? "",
      member.nationalId ?? "",
      member.mobile ?? "",
      member.altMobile ?? "",
      member.gender ? genderLabels[member.gender] ?? member.gender : "",
      member.maritalStatus ? maritalLabels[member.maritalStatus] ?? member.maritalStatus : "",
      member.dateOfBirth ?? "",
      member.age ?? computeAgeFromBirthDate(member.dateOfBirth ?? "") ?? "",
      member.address ?? "",
      member.joinDate ?? "",
      member.username ?? "",
      member.isTeacher ? staffSubjects(member) : "",
      member.isTeacher ? staffClasses(member.id, options.assignments, options.classes) : "",
      staffStatus(member),
      member.experience ?? "",
      member.notes ?? "",
    ]),
  ];

  return rows;
}

export async function exportStaffToExcel(staff: TeacherProfile[], options: ExportStaffOptions) {
  if (staff.length === 0) {
    throw new Error("لا يوجد أعضاء كادر للتصدير");
  }

  const XLSX = await import("xlsx");
  const rows = buildWorksheet(staff, options);
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const lastRowIndex = rows.length - 1;
  const lastColumnIndex = HEADERS.length - 1;

  markTextColumns(worksheet, rows.length);

  worksheet["!cols"] = COLUMN_WIDTHS.map((width) => ({ wch: width }));
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumnIndex } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumnIndex } },
  ];
  worksheet["!views"] = [
    {
      rightToLeft: true,
      showGridLines: true,
      state: "frozen",
      ySplit: HEADER_ROW_INDEX + 1,
    },
  ];
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: HEADER_ROW_INDEX, c: 0 },
      e: { r: lastRowIndex, c: lastColumnIndex },
    }),
  };

  const workbook = XLSX.utils.book_new();
  workbook.Workbook = {
    Views: [{ RTL: true }],
  };
  XLSX.utils.book_append_sheet(workbook, worksheet, "الكادر");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    bookSST: false,
  });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const stamp = formatExportDate();
  downloadBlob(blob, `سجل-الكادر_${stamp}.xlsx`);
}
