"use client";

import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "حذف",
  cancelLabel = "إلغاء",
  loading = false,
  loadingLabel = "جاري الحذف...",
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Card className="p-6">
          <p className="text-base font-bold text-p-black">{title}</p>
          <div className="mt-2 text-sm text-p-black/70">{description}</div>
          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
            >
              {loading ? loadingLabel : confirmLabel}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
