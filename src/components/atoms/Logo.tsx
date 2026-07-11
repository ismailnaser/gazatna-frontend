import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
  href?: string;
  inverted?: boolean;
};

export function Logo({
  variant = "full",
  className,
  href = "/",
  inverted = false,
}: LogoProps) {
  const filter = inverted ? "brightness-0 invert" : undefined;

  const content =
    variant === "icon" ? (
      <Image
        src="/images/logo-icon.png"
        alt="مدرسة غزتنا الخاصة"
        width={56}
        height={56}
        unoptimized
        className={cn("h-10 w-10 object-contain sm:h-11 sm:w-11", className)}
        style={filter ? { filter } : undefined}
        priority
      />
    ) : (
      <Image
        src="/images/logo.png"
        alt="مدرسة غزتنا الخاصة"
        width={280}
        height={120}
        unoptimized
        className={cn("h-11 w-auto object-contain sm:h-12 lg:h-[3.25rem]", className)}
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
