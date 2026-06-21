import {
  buildStudentCertificateHtml,
  type CertificateRenderInput,
} from "@/lib/certificateHtml";
import { exportHTMLElementToPdf, formatExportDate, mountPdfElement } from "@/lib/pdfExport";

export type StudentCertificatePdfInput = CertificateRenderInput;

async function buildStudentCertificateElement(input: StudentCertificatePdfInput) {
  return mountPdfElement(await buildStudentCertificateHtml(input));
}

export async function exportStudentCertificatePdf(input: StudentCertificatePdfInput) {
  const element = await buildStudentCertificateElement(input);
  const safeName = input.certificate.studentName.replace(/[\\/:*?"<>|]/g, "-").trim() || "طالب";
  await exportHTMLElementToPdf(element, `شهادة_علامات_${safeName}_${formatExportDate()}.pdf`);
}
