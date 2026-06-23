import { formatClassLabel } from "@/lib/adminStudents";
import type { AdminStudent } from "@/types";
import * as XLSX from "xlsx";

function formatExportDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function exportStudentsToExcel(students: AdminStudent[]) {
  const rows = students.map((student) => ({
    "رقم الطالب": student.studentNumber ?? "",
    "اسم الطالب": student.name,
    "رقم هوية الطالب": student.nationalId ?? "",
    "الفصل والشعبة": formatClassLabel(student.grade, student.section),
    "اسم المستخدم": student.username ?? "",
    "عدد الوثائق": student.documents.length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
  XLSX.writeFile(workbook, `سجل-الطلاب_${formatExportDate()}.xlsx`);
}
