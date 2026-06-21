export const SCHOOL_LOGO_FULL_PATH = "/images/logo.png";

export function formatExportDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getSchoolLogoUrl() {
  if (typeof window === "undefined") return SCHOOL_LOGO_FULL_PATH;
  return `${window.location.origin}${SCHOOL_LOGO_FULL_PATH}`;
}

export async function loadSchoolLogoDataUrl() {
  const response = await fetch(getSchoolLogoUrl());
  if (!response.ok) {
    throw new Error("failed to load school logo");
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("failed to read school logo"));
    reader.readAsDataURL(blob);
  });
}

export function buildPdfBrandedHeaderHtml(options: {
  logoDataUrl: string;
  title: string;
  schoolName?: string;
  lines?: string[];
}) {
  const { logoDataUrl, title, schoolName, lines = [] } = options;
  const schoolLine = schoolName
    ? `<p style="margin:0 0 4px;font-size:12px;color:#666;">${escapeHtml(schoolName)}</p>`
    : "";
  const metaLines = lines
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${escapeHtml(line)}</p>`
    )
    .join("");

  return `
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      <img
        src="${logoDataUrl}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />
      <div style="flex:1;min-width:0;text-align:right;">
        ${schoolLine}
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111111;line-height:1.35;">${escapeHtml(title)}</h1>
        ${metaLines}
      </div>
    </header>
  `;
}

export function buildPdfBrandedFooterHtml(schoolName = "مدرسة غَزتنا") {
  return `
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${escapeHtml(schoolName)}
    </footer>
  `;
}

export function mountPdfElement(innerHtml: string) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = innerHtml;

  const root = wrapper.firstElementChild;
  if (!(root instanceof HTMLElement)) {
    throw new Error("failed to build pdf element");
  }

  root.style.position = "fixed";
  root.style.left = "0";
  root.style.top = "0";
  root.style.zIndex = "2147483647";
  root.style.background = "#ffffff";
  root.style.padding = "24px";
  root.style.boxSizing = "border-box";

  return root;
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

export async function exportHTMLElementToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  document.body.appendChild(element);

  try {
    await waitForImages(element);
    await new Promise((resolve) => setTimeout(resolve, 120));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("empty canvas");
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(filename);
  } finally {
    element.remove();
  }
}
