"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LINE_CLAMP: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

type ExpandableTextProps = {
  children: string;
  maxLines?: number;
  className?: string;
  buttonClassName?: string;
  moreLabel?: string;
  lessLabel?: string;
  stopPropagation?: boolean;
};

export function ExpandableText({
  children,
  maxLines = 3,
  className,
  buttonClassName,
  moreLabel = "عرض المزيد",
  lessLabel = "عرض أقل",
  stopPropagation = false,
}: ExpandableTextProps) {
  const text = children.trim();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    if (expanded) return;
    const element = ref.current;
    if (!element) return;
    setTruncated(element.scrollHeight > element.clientHeight + 1);
  }, [text, maxLines, expanded]);

  if (!text) return null;

  const clampClass = LINE_CLAMP[maxLines] ?? LINE_CLAMP[3];

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpanded((value) => !value);
  }

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          "whitespace-pre-wrap leading-relaxed",
          !expanded && clampClass,
          className
        )}
      >
        {text}
      </p>
      {(truncated || expanded) && (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "mt-1.5 text-sm font-semibold text-brand-blue hover:underline",
            buttonClassName
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
