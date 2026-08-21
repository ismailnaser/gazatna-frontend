"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

type PwaInstallButtonProps = {
  className?: string;
  compact?: boolean;
  /** Round icon on the header edge. */
  iconOnly?: boolean;
};

function InstallGuide({
  title,
  steps,
  onClose,
}: {
  title: string;
  steps: string[];
  onClose: () => void;
}) {
  return (
    <div className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-p-black">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-p-black/70 hover:bg-neutral-100"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ol className="space-y-2 text-xs leading-relaxed text-p-black/70">
        {steps.map((step, index) => (
          <li key={step}>
            {index + 1}. {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PwaInstallButton({
  className,
  compact = false,
  iconOnly = false,
}: PwaInstallButtonProps) {
  const { canShow, showIosHint, installing, install } = usePwaInstall();
  const [guide, setGuide] = useState<"ios" | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guide) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!guideRef.current?.contains(event.target as Node)) {
        setGuide(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [guide]);

  if (!canShow) return null;

  async function handleClick() {
    setGuide(null);
    const installed = await install();
    if (installed) return;

    // Only show guidance when iOS needs the Share sheet steps.
    if (showIosHint) {
      setGuide("ios");
    }
  }

  const iosSteps = [
    "اضغط زر المشاركة في أسفل أو أعلى المتصفح.",
    "اختر «إضافة إلى الشاشة الرئيسية».",
    "اضغط «إضافة» لتثبيت تطبيق غزتنا.",
  ];

  return (
    <div ref={guideRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={installing}
        className={cn(
          "group inline-flex items-center justify-center gap-2 font-extrabold transition disabled:opacity-60",
          iconOnly
            ? "h-9 w-9 rounded-full bg-brand-blue text-white shadow-[-2px_2px_0_0_rgba(66,76,243,0.28)] hover:bg-brand-blue/90"
            : "rounded-full border-2 border-black/5 bg-white px-3 py-2 text-sm text-brand-blue hover:border-brand-blue/25",
          compact && !iconOnly && "px-2.5 py-1.5 text-xs"
        )}
        aria-label="تثبيت التطبيق على الجهاز"
        title="تثبيت التطبيق"
      >
        {installing ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Download className={cn(iconOnly ? "h-4 w-4" : "h-3.5 w-3.5")} />
        )}
        {!iconOnly ? (
          <>
            {!compact ? <span>تثبيت التطبيق</span> : <span className="hidden sm:inline">تثبيت</span>}
            <Smartphone className={cn("h-4 w-4 text-brand-blue/70", compact && "hidden sm:block")} />
          </>
        ) : null}
      </button>

      {guide === "ios" ? (
        <InstallGuide
          title="تثبيت على iPhone / iPad"
          steps={iosSteps}
          onClose={() => setGuide(null)}
        />
      ) : null}
    </div>
  );
}
