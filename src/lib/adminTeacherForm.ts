export const TEACHER_GRADIENTS = [
  "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
  "from-[#1a1a1a] to-[#404040]",
] as const;

export function teacherInitial(name: string) {
  return name.replace(/^(د\.|أ\.|م\.)\s*/u, "").trim().charAt(0) || "م";
}
