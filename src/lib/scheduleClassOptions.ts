import type { Subject, TeacherProfile } from "@/types/teacher";

export function subjectsForClasses(subjects: Subject[], classIds: string[]): Subject[] {
  if (classIds.length === 0) return [];
  const classIdSet = new Set(classIds);
  return subjects
    .filter((subject) => (subject.classIds ?? []).some((id) => classIdSet.has(id)))
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function teachersForClasses(
  teachers: TeacherProfile[],
  classIds: string[]
): TeacherProfile[] {
  if (classIds.length === 0) return [];
  const classIdSet = new Set(classIds);
  return teachers
    .filter((teacher) => (teacher.classIds ?? []).some((id) => classIdSet.has(id)))
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function teachersForClassesAndSubject(
  teachers: TeacherProfile[],
  subjects: Subject[],
  classIds: string[],
  subjectName: string
): TeacherProfile[] {
  if (!subjectName.trim() || classIds.length === 0) return [];
  const subject = subjects.find((item) => item.name === subjectName);
  if (!subject) return [];
  const classIdSet = new Set(classIds);
  return teachers
    .filter((teacher) => {
      if (!(teacher.subjectIds ?? []).includes(subject.id)) return false;
      return (teacher.classIds ?? []).some((id) => classIdSet.has(id));
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function buildSelectOptions(
  items: Array<{ value: string; label: string }>,
  currentValue: string,
  placeholder: string
) {
  const options = [{ value: "", label: placeholder }, ...items];
  if (currentValue && !options.some((option) => option.value === currentValue)) {
    options.push({ value: currentValue, label: `${currentValue} (غير مرتبط)` });
  }
  return options;
}
