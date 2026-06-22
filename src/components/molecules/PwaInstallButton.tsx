"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

type PwaInstallButtonProps = {
  className?: string;
  compact?: boolean;
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
          className="rounded-lg p-1 text-p-black/45 hover:bg-neutral-100"
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

export function PwaInstallButton({ className, compact = false }: PwaInstallButtonProps) {
  const { canShow, showIosHint, installing, install } = usePwaInstall();
  const [guide, setGuide] = useState<"ios" | "desktop" | null>(null);
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

    if (showIosHint) {
      setGuide("ios");
      return;
    }

    setGuide("desktop");
  }

  const iosSteps = [
    "اضغط زر المشاركة في أسفل أو أعلى المتصفح.",
    "اختر «إضافة إلى الشاشة الرئيسية».",
    "اضغط «إضافة» لتثبيت تطبيق غزتنا.",
  ];

  const desktopSteps = [
    "متصفح Cursor لا يدعم التثبيت المباشر.",
    "انسخ الرابط وافتحه في Chrome أو Edge.",
    "ثم اضغط «تثبيت» مرة أخرى أو من قائمة المتصفح (⋮) → تثبيت التطبيق.",
  ];

  return (
    <div ref={guideRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={installing}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full border border-brand-blue/25 bg-gradient-to-l from-brand-blue/[0.08] to-brand-blue-light/[0.12] px-3 py-2 text-sm font-semibold text-brand-blue shadow-sm transition-all hover:border-brand-blue/40 hover:from-brand-blue/[0.12] hover:to-brand-blue-light/[0.18] hover:shadow-md disabled:opacity-60",
          compact && "px-2.5 py-1.5 text-xs"
        )}
        aria-label="تثبيت التطبيق على الجهاز"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm transition group-hover:scale-105">
          {installing ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </span>
        {!compact ? <span>تثبيت التطبيق</span> : <span className="hidden sm:inline">تثبيت</span>}
        <Smartphone className={cn("h-4 w-4 text-brand-blue/70", compact && "hidden sm:block")} />
      </button>

      {guide === "ios" ? (
        <InstallGuide
          title="تثبيت على iPhone / iPad"
          steps={iosSteps}
          onClose={() => setGuide(null)}
        />
      ) : null}

      {guide === "desktop" ? (
        <InstallGuide
          title="التثبيت غير متاح هنا"
          steps={desktopSteps}
          onClose={() => setGuide(null)}
        />
      ) : null}
    </div>
  );
}
