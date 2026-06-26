import { formatClassLabel } from "@/lib/adminStudents";
import { downloadBlob } from "@/lib/downloadBlob";
import { formatExportDate } from "@/lib/pdfExport";
import type { AdminStudent } from "@/types";
import type { WorkSheet } from "xlsx";

const HEADERS = [
  "رقم الطالب",
  "اسم الطالب",
  "رقم هوية الطالب",
  "الفصل والشعبة",
  "اسم المستخدم",
  "عدد الوثائق",
] as const;

const COLUMN_WIDTHS = [14, 26, 18, 24, 18, 12];
const TEXT_COLUMN_INDEXES = new Set([0, 1, 2, 3, 4]);
const HEADER_ROW_INDEX = 3;
const DATA_START_ROW_INDEX = 4;

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

function buildWorksheet(students: AdminStudent[]) {
  const rows: Array<Array<string | number>> = [
    ["سجل الطلاب"],
    [`تاريخ التصدير: ${formatArabicExportLabel()} — عدد الطلاب: ${students.length}`],
    [],
    [...HEADERS],
    ...students.map((student) => [
      student.studentNumber ?? "",
      student.name,
      student.nationalId ?? "",
      formatClassLabel(student.grade, student.section),
      student.username ?? "",
      student.documents.length,
    ]),
  ];

  return rows;
}

export async function exportStudentsToExcel(students: AdminStudent[]) {
  if (students.length === 0) {
    throw new Error("لا يوجد طلاب للتصدير");
  }

  const XLSX = await import("xlsx");
  const rows = buildWorksheet(students);
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
  XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    bookSST: false,
  });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const stamp = formatExportDate();
  downloadBlob(blob, `سجل-الطلاب_${stamp}.xlsx`);
}
