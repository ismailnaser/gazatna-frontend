import type { TeacherProfile } from "@/types/teacher";

export type OccupiedPair = {
  teacherId: string;
  teacherName: string;
};

export function buildSubjectClassOccupiedMap(
  teachers: TeacherProfile[],
  subjectName: string,
  excludeTeacherId?: string
): Map<string, OccupiedPair> {
  const map = new Map<string, OccupiedPair>();

  for (const teacher of teachers) {
    if (excludeTeacherId && teacher.id === excludeTeacherId) continue;

    const classIds = teacher.subjectClassIds?.[subjectName] ?? [];
    for (const classId of classIds) {
      map.set(classId, {
        teacherId: teacher.id,
        teacherName: teacher.name,
      });
    }
  }

  return map;
}

export function buildOccupiedPairs(
  teachers: TeacherProfile[],
  excludeTeacherId?: string
): Map<string, OccupiedPair> {
  const map = new Map<string, OccupiedPair>();

  for (const teacher of teachers) {
    if (excludeTeacherId && teacher.id === excludeTeacherId) continue;

    const subjectIds = teacher.subjectIds ?? [];
    const classIds = teacher.classIds ?? [];

    for (const subjectId of subjectIds) {
      for (const classId of classIds) {
        map.set(`${subjectId}:${classId}`, {
          teacherId: teacher.id,
          teacherName: teacher.name,
        });
      }
    }
  }

  return map;
}

export function findClassConflict(
  occupied: Map<string, OccupiedPair>,
  subjectIds: string[],
  classId: string
): OccupiedPair | undefined {
  for (const subjectId of subjectIds) {
    const hit = occupied.get(`${subjectId}:${classId}`);
    if (hit) return hit;
  }
  return undefined;
}

export function findSubjectConflict(
  occupied: Map<string, OccupiedPair>,
  classIds: string[],
  subjectId: string
): OccupiedPair | undefined {
  for (const classId of classIds) {
    const hit = occupied.get(`${subjectId}:${classId}`);
    if (hit) return hit;
  }
  return undefined;
}

export function formatAssignmentConflict(
  subjectName: string,
  className: string,
  teacherName: string
): string {
  return `مادة ${subjectName} في فصل ${className} مسندة بالفعل للمعلم ${teacherName}`;
}

export function findSubjectClassConflicts(
  teachers: TeacherProfile[],
  subjectId: string,
  classIds: string[],
  excludeTeacherId?: string
) {
  const occupied = buildOccupiedPairs(teachers, excludeTeacherId);
  const availableClassIds: string[] = [];
  const conflicts: string[] = [];

  for (const classId of classIds) {
    const hit = occupied.get(`${subjectId}:${classId}`);
    if (hit) {
      conflicts.push(`هذا الفصل مسند بالفعل للمعلم ${hit.teacherName}`);
    } else {
      availableClassIds.push(classId);
    }
  }

  return { availableClassIds, conflicts };
}

export function findAssignmentConflicts(
  teachers: TeacherProfile[],
  subjects: Array<{ id: string; name: string; classIds?: string[] }>,
  classes: Array<{ id: string; name: string }>,
  subjectIds: string[],
  classIds: string[],
  excludeTeacherId?: string
): string[] {
  const occupied = buildOccupiedPairs(teachers, excludeTeacherId);
  const subjectNames = Object.fromEntries(subjects.map((subject) => [subject.id, subject.name]));
  const classNames = Object.fromEntries(classes.map((schoolClass) => [schoolClass.id, schoolClass.name]));
  const messages: string[] = [];

  for (const subjectId of subjectIds) {
    for (const classId of classIds) {
      const hit = occupied.get(`${subjectId}:${classId}`);
      if (!hit) continue;
      messages.push(
        formatAssignmentConflict(
          subjectNames[subjectId] ?? subjectId,
          classNames[classId] ?? classId,
          hit.teacherName
        )
      );
    }
  }

  const eligibilityMessages = findIneligibleClassMessages(subjects, classes, subjectIds, classIds);
  return [...messages, ...eligibilityMessages];
}

export function eligibleClassIdsForSubjects(
  subjects: Array<{ id: string; classIds?: string[] }>,
  subjectIds: string[]
): Set<string> {
  if (subjectIds.length === 0) return new Set();

  const selectedSubjects = subjects.filter((subject) => subjectIds.includes(subject.id));
  if (selectedSubjects.length === 0) return new Set();

  let intersection: Set<string> | null = null;
  for (const subject of selectedSubjects) {
    const ids = new Set(subject.classIds ?? []);
    if (intersection === null) {
      intersection = ids;
      continue;
    }
    intersection = new Set([...intersection].filter((id) => ids.has(id)));
  }

  return intersection ?? new Set();
}

export function findIneligibleClassMessages(
  subjects: Array<{ id: string; name: string; classIds?: string[] }>,
  classes: Array<{ id: string; name: string }>,
  subjectIds: string[],
  classIds: string[]
): string[] {
  const eligible = eligibleClassIdsForSubjects(subjects, subjectIds);
  const classNames = Object.fromEntries(classes.map((schoolClass) => [schoolClass.id, schoolClass.name]));
  const messages: string[] = [];

  for (const classId of classIds) {
    if (eligible.has(classId)) continue;
    const className = classNames[classId] ?? classId;
    const missingSubjects = subjects
      .filter((subject) => subjectIds.includes(subject.id))
      .filter((subject) => !(subject.classIds ?? []).includes(classId))
      .map((subject) => subject.name);
    if (missingSubjects.length > 0) {
      messages.push(
        `مادة ${missingSubjects.join(" و")} غير مسندة لفصل ${className}. عيّن المادة للفصل من صفحة «المواد الدراسية» أولاً.`
      );
    }
  }

  return messages;
}
