import type { TeacherProfile } from "@/types/teacher";

const SUBJECT_GRADIENTS = [
  "from-brand-blue to-indigo-600",
  "from-p-green to-emerald-600",
  "from-brand-orange to-amber-600",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-p-red",
  "from-cyan-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-blue-700",
] as const;

export function subjectInitial(name: string) {
  const cleaned = name.replace(/^(ال|مادة)\s*/u, "").trim();
  return cleaned.charAt(0) || "م";
}

export function subjectGradient(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % SUBJECT_GRADIENTS.length;
  }
  return SUBJECT_GRADIENTS[hash];
}

export function teacherCountLabel(count: number) {
  if (count === 0) return "لا يوجد معلمون";
  if (count === 1) return "معلم واحد";
  if (count === 2) return "معلمان";
  if (count <= 10) return `${count} معلمين`;
  return `${count} معلم`;
}

export function teachersForSubject(teachers: TeacherProfile[], subjectId: string) {
  return teachers
    .filter((teacher) => teacher.subjectIds?.includes(subjectId))
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function teachersAvailableForSubject(teachers: TeacherProfile[], subjectId: string) {
  return teachers
    .filter((teacher) => !teacher.subjectIds?.includes(subjectId))
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}
