export const TEACHER_IMAGE_GRADIENTS = [
  "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
  "from-[#1a1a1a] to-[#404040]",
] as const;

export function teacherInitial(name: string) {
  return name.replace(/^(د\.|أ\.|م\.)\s*/u, "").trim().charAt(0) || "م";
}

export function pickTeacherGradient(index: number) {
  return TEACHER_IMAGE_GRADIENTS[index % TEACHER_IMAGE_GRADIENTS.length];
}
