"use client";

import { X } from "lucide-react";
import { Card } from "@/components/atoms/Card";

type FormDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
};

export function FormDialog({
  open,
  title,
  description,
  onClose,
  children,
  maxWidthClass = "max-w-2xl",
}: FormDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`my-4 w-full ${maxWidthClass} max-h-[calc(100vh-2rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden p-0">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-p-black">{title}</h2>
              {description && <p className="mt-1 text-sm text-p-black/60">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-p-black/50 transition-colors hover:bg-neutral-100 hover:text-p-black"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </Card>
      </div>
    </div>
  );
}
