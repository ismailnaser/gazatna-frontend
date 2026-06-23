import { mountPdfElement } from "@/lib/pdfExport";

const printStyles = `
  body {
    margin: 0;
    padding: 24px;
    font-family: Tahoma, Arial, sans-serif;
    color: #111;
    background: #fff;
  }
  @page {
    margin: 16mm;
  }
`;

export async function printHtmlDocument(title: string, bodyHtml: string) {
  const element = mountPdfElement(`
    <div dir="rtl">
      ${bodyHtml}
    </div>
  `);

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!printWindow) {
    element.remove();
    throw new Error("تعذر فتح نافذة الطباعة");
  }

  printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, "&lt;")}</title>
    <style>${printStyles}</style>
  </head>
  <body>${element.innerHTML}</body>
</html>`);
  printWindow.document.close();

  element.remove();

  printWindow.focus();
  await new Promise<void>((resolve) => {
    printWindow.onload = () => resolve();
    window.setTimeout(() => resolve(), 300);
  });
  printWindow.print();
  printWindow.close();
}

export function buildPrintHeaderHtml(title: string, lines: string[]) {
  return `
    <div style="margin-bottom:16px;border-bottom:1px solid #d4d4d4;padding-bottom:12px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;">${title}</h1>
      ${lines.map((line) => `<p style="margin:0 0 4px;font-size:13px;color:#555;">${line}</p>`).join("")}
    </div>
  `;
}
