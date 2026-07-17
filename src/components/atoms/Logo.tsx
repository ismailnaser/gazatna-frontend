import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** Kept for compatibility; always renders the full school logo. */
  variant?: "full" | "icon";
  className?: string;
  href?: string;
  inverted?: boolean;
};

export function Logo({
  className,
  href = "/",
  inverted = false,
}: LogoProps) {
  const filter = inverted ? "brightness-0 invert" : undefined;

  const content = (
    <Image
      src="/images/logo.png"
      alt="مدرسة غزتنا الخاصة"
      width={280}
      height={120}
      unoptimized
      className={cn(
        "h-11 w-auto bg-transparent object-contain sm:h-12 lg:h-[3.25rem]",
        className
      )}
      style={filter ? { filter } : undefined}
      priority
    />
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center bg-transparent">
      {content}
    </Link>
  );
}
