import { formatClassLabel, PAYMENT_STATUS_LABELS } from "@/lib/adminStudents";
import type { AdminStudent } from "@/types";
import * as XLSX from "xlsx";

function formatExportDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function exportStudentsToExcel(students: AdminStudent[]) {
  const rows = students.map((student) => ({
    "اسم الطالب": student.name,
    "رقم الطالب": student.studentNumber ?? "",
    "رقم الهوية": student.nationalId ?? "",
    "الفصل": student.grade,
    "الشعبة": student.section ?? "",
    "الفصل والشعبة": formatClassLabel(student.grade, student.section),
    "اسم المستخدم": student.username ?? "",
    "حالة الدفع": PAYMENT_STATUS_LABELS[student.paymentStatus],
    "إجمالي الرسوم (₪)": student.balance?.total ?? 0,
    "المدفوع (₪)": student.balance?.paid ?? 0,
    "المتبقي (₪)": student.balance?.remaining ?? 0,
    "عدد الوثائق": student.documents.length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 10 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
  XLSX.writeFile(workbook, `سجل-الطلاب_${formatExportDate()}.xlsx`);
}
