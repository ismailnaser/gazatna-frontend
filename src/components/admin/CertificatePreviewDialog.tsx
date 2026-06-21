"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Download, X } from "lucide-react";

const CERTIFICATE_WIDTH = 746;

type CertificatePreviewDialogProps = {
  open: boolean;
  title: string;
  html: string | null;
  loading?: boolean;
  downloading?: boolean;
  onClose: () => void;
  onDownload?: () => void;
};

export function CertificatePreviewDialog({
  open,
  title,
  html,
  loading = false,
  downloading = false,
  onClose,
  onDownload,
}: CertificatePreviewDialogProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) return;

    const updateScale = () => {
      const width = viewportRef.current?.clientWidth ?? CERTIFICATE_WIDTH;
      setScale(Math.min(1, Math.max(0.35, (width - 24) / CERTIFICATE_WIDTH)));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [open, html]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-preview-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-4xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <div>
              <h3 id="certificate-preview-title" className="font-bold text-p-black">
                معاينة الشهادة
              </h3>
              <p className="mt-0.5 text-xs text-p-black/55">{title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-p-black/55 hover:bg-neutral-100"
              aria-label="إغلاق المعاينة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={viewportRef} className="min-h-[320px] flex-1 overflow-auto bg-neutral-100 p-4">
            {loading ? (
              <p className="py-16 text-center text-sm text-neutral-500">جاري تحضير المعاينة...</p>
            ) : html ? (
              <div className="mx-auto" style={{ width: CERTIFICATE_WIDTH * scale }}>
                <div
                  style={{
                    width: CERTIFICATE_WIDTH,
                    transform: `scale(${scale})`,
                    transformOrigin: "top right",
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-neutral-500">تعذر عرض الشهادة.</p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-100 px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              إغلاق
            </Button>
            {onDownload ? (
              <Button type="button" onClick={onDownload} disabled={downloading || loading || !html}>
                <Download className="h-4 w-4" />
                {downloading ? "جاري التحميل..." : "تحميل PDF"}
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
