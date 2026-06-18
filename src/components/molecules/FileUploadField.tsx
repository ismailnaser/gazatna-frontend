"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { ImagePlus, Paperclip, Upload } from "lucide-react";

export type FileUploadPreset = "image" | "image-pdf" | "documents" | "any";

const PRESETS: Record<
  FileUploadPreset,
  { accept: string; hint: string; buttonText: string; icon: "image" | "upload" }
> = {
  image: {
    accept: "image/*",
    hint: "صور JPG أو PNG من جهازك",
    buttonText: "اضغط لاختيار صورة",
    icon: "image",
  },
  "image-pdf": {
    accept: "image/*,.pdf",
    hint: "صورة أو ملف PDF",
    buttonText: "اضغط لاختيار صورة أو PDF",
    icon: "upload",
  },
  documents: {
    accept: "image/*,.pdf,.doc,.docx,.ppt,.pptx",
    hint: "صورة، PDF، Word، أو PowerPoint",
    buttonText: "اضغط لاختيار ملف",
    icon: "upload",
  },
  any: {
    accept: "",
    hint: "أي نوع ملف من جهازك",
    buttonText: "اضغط لاختيار ملف",
    icon: "upload",
  },
};

type FileUploadFieldProps = {
  label?: string;
  hint?: string;
  preset?: FileUploadPreset;
  buttonText?: string;
  selectedFileName?: string | null;
  selectedCount?: number;
  onChange: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  compact?: boolean;
  className?: string;
  id?: string;
};

export const FileUploadField = forwardRef<HTMLInputElement, FileUploadFieldProps>(
  function FileUploadField(
    {
      label,
      hint,
      preset = "documents",
      buttonText,
      selectedFileName,
      selectedCount,
      onChange,
      multiple = false,
      accept,
      disabled = false,
      required = false,
      name,
      compact = false,
      className,
      id,
    },
    ref
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const presetConfig = PRESETS[preset];
    const resolvedAccept = accept ?? presetConfig.accept;
    const resolvedHint = hint ?? presetConfig.hint;
    const resolvedButtonText = buttonText ?? presetConfig.buttonText;
    const Icon = presetConfig.icon === "image" ? ImagePlus : compact ? Paperclip : Upload;

    const hasSelection =
      Boolean(selectedFileName) || (selectedCount != null && selectedCount > 0);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange(e.target.files);
      e.target.value = "";
    }

    if (compact) {
      return (
        <div className={cn("flex flex-col gap-1.5", className)}>
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-p-black/80">
              {label}
            </label>
          )}
          <label
            htmlFor={inputId}
            className={cn(
              "inline-flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-2.5 text-sm font-semibold transition-colors",
              disabled
                ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400"
                : "border-brand-blue/35 bg-brand-blue/5 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/10"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {resolvedButtonText}
          </label>
          <input
            ref={ref}
            id={inputId}
            type="file"
            name={name}
            accept={resolvedAccept || undefined}
            multiple={multiple}
            disabled={disabled}
            required={required}
            className="sr-only"
            onChange={handleChange}
          />
          {selectedFileName && (
            <p className="text-xs font-medium text-p-green">✓ {selectedFileName}</p>
          )}
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-p-black/80">
            {label}
          </label>
        )}
        <label
          htmlFor={inputId}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors sm:flex-row sm:text-start",
            disabled
              ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400"
              : hasSelection
                ? "border-p-green/40 bg-p-green/5 hover:border-p-green/60 hover:bg-p-green/10"
                : "border-brand-blue/30 bg-brand-blue/5 hover:border-brand-blue hover:bg-brand-blue/10"
          )}
        >
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              disabled
                ? "bg-neutral-100 text-neutral-400"
                : hasSelection
                  ? "bg-p-green/15 text-p-green"
                  : "bg-brand-blue/15 text-brand-blue"
            )}
          >
            <Icon className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-p-black">
              {resolvedButtonText}
            </span>
            <span className="mt-1 block text-xs text-neutral-500">{resolvedHint}</span>
          </span>
        </label>
        <input
          ref={ref}
          id={inputId}
          type="file"
          name={name}
          accept={resolvedAccept || undefined}
          multiple={multiple}
          disabled={disabled}
          required={required}
          className="sr-only"
          onChange={handleChange}
        />
        {selectedFileName && (
          <p className="rounded-xl border border-p-green/20 bg-p-green/5 px-3 py-2 text-sm font-medium text-p-green">
            ✓ الملف المختار: {selectedFileName}
          </p>
        )}
        {!selectedFileName && selectedCount != null && selectedCount > 0 && (
          <p className="rounded-xl border border-p-green/20 bg-p-green/5 px-3 py-2 text-sm font-medium text-p-green">
            ✓ تم اختيار {selectedCount} ملف
          </p>
        )}
      </div>
    );
  }
);
