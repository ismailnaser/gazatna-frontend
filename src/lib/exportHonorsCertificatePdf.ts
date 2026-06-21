import {
  buildHonorsCertificateHtml,
  buildStudentCertificateHtml,
  type CertificateRenderInput,
} from "@/lib/certificateHtml";
import { exportHTMLElementToPdf, formatExportDate, mountPdfElement } from "@/lib/pdfExport";

export type HonorsCertificatePdfInput = CertificateRenderInput;

async function buildHonorsCertificateElement(input: HonorsCertificatePdfInput) {
  return mountPdfElement(await buildHonorsCertificateHtml(input));
}

export async function exportHonorsCertificatePdf(input: HonorsCertificatePdfInput) {
  const element = await buildHonorsCertificateElement(input);
  const safeName = input.certificate.studentName.replace(/[\\/:*?"<>|]/g, "-").trim() || "طالب";
  await exportHTMLElementToPdf(element, `شهادة_تقدير_${safeName}_${formatExportDate()}.pdf`);
}
