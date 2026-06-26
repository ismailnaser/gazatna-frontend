"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/adminRoles";
import { mapGrades, mapSchoolClasses } from "@/lib/mapSchoolClass";
import type { Grade, SchoolClass, Subject, TeacherProfile } from "@/types/teacher";

type SchoolState = {
  teachers: TeacherProfile[];
  assignments: Record<string, string[]>;
};

type SchoolContextValue = SchoolState & {
  classes: SchoolClass[];
  grades: Grade[];
  subjects: Subject[];
  currentTeacher: TeacherProfile | null;
  loading: boolean;
  getTeacherClasses: (teacherId: string) => SchoolClass[];
  getTeacherClassesByUserId: (userId: string) => SchoolClass[];
  setTeacherClasses: (teacherId: string, classIds: string[]) => Promise<void>;
  addTeacher: (teacher: Omit<TeacherProfile, "id">, image?: File) => Promise<TeacherProfile>;
  updateTeacher: (id: string, data: Partial<TeacherProfile>, image?: File) => Promise<TeacherProfile>;
  removeTeacher: (id: string) => Promise<void>;
  addClass: (gradeLevel: string, section: string) => Promise<SchoolClass>;
  removeClass: (id: string) => Promise<void>;
  addSubject: (name: string) => Promise<Subject>;
  updateSubject: (id: string, name: string) => Promise<Subject>;
  setSubjectClasses: (id: string, classIds: string[]) => Promise<Subject>;
  removeSubject: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

function buildAssignments(teachers: TeacherProfile[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const t of teachers) {
    map[t.id] = t.classIds ?? [];
  }
  return map;
}

function mapTeacherProfile(raw: Record<string, unknown>): TeacherProfile {
  const teachingClasses = Array.isArray(raw.teachingClasses)
    ? mapSchoolClasses(raw.teachingClasses as unknown[])
    : undefined;

  return {
    ...(raw as TeacherProfile),
    id: String(raw.id),
    userId: raw.userId != null ? String(raw.userId) : undefined,
    classIds: Array.isArray(raw.classIds) ? raw.classIds.map(String) : [],
    subjectIds: Array.isArray(raw.subjectIds) ? raw.subjectIds.map(String) : [],
    teachingClasses,
  };
}

function mapTeachers(rows: unknown[]): TeacherProfile[] {
  return rows.map((row) => mapTeacherProfile(row as Record<string, unknown>));
}

function normalizeSubject(raw: Subject): Subject {
  return {
    ...raw,
    id: String(raw.id),
    teacherCount: Number(raw.teacherCount ?? 0),
    classIds: Array.isArray(raw.classIds) ? raw.classIds.map(String) : [],
  };
}

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SchoolState>({
    teachers: [],
    assignments: {},
  });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    initialLoadDoneRef.current = false;
    setLoading(true);
  }, [user?.id]);

  const refresh = useCallback(async () => {
    const showLoading = !initialLoadDoneRef.current;
    if (!user) {
      try {
        const teachersData = await api.getTeachers();
        const teachers = mapTeachers(teachersData);
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
      } catch {
        setCurrentTeacher(null);
        setState({ teachers: [], assignments: {} });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (showLoading) setLoading(true);
    try {
      if (isAdminRole(user.role)) {
        const [teachersResult, classesResult, subjectsResult, gradesResult] = await Promise.allSettled([
          api.getAdminTeachers(),
          api.getAdminClasses(),
          api.getAdminSubjects(),
          api.getAdminGrades(),
        ]);
        const teachers =
          teachersResult.status === "fulfilled" ? mapTeachers(teachersResult.value as unknown[]) : [];
        const classesData =
          classesResult.status === "fulfilled"
            ? mapSchoolClasses(classesResult.value as unknown[])
            : [];
        const subjectsData =
          subjectsResult.status === "fulfilled"
            ? (subjectsResult.value as Subject[]).map(normalizeSubject)
            : [];
        const gradesData =
          gradesResult.status === "fulfilled" ? mapGrades(gradesResult.value as unknown[]) : [];
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
        setClasses(classesData);
        setGrades(gradesData);
        setSubjects(subjectsData);
      } else if (user.role === "teacher") {
        const [classesResult, profileResult] = await Promise.allSettled([
          api.getTeacherClasses(),
          api.getTeacherProfile(),
        ]);
        const teacher =
          profileResult.status === "fulfilled"
            ? mapTeacherProfile(profileResult.value as Record<string, unknown>)
            : null;
        const classesData =
          classesResult.status === "fulfilled"
            ? mapSchoolClasses(classesResult.value as unknown[])
            : [];
        const resolvedTeacher =
          teacher && !teacher.teachingClasses?.length && classesData.length
            ? { ...teacher, teachingClasses: classesData }
            : teacher;
        setClasses(classesData);
        setCurrentTeacher(resolvedTeacher);
        setState(
          resolvedTeacher
            ? { teachers: [resolvedTeacher], assignments: buildAssignments([resolvedTeacher]) }
            : { teachers: [], assignments: {} }
        );
      } else if (user.role === "parent") {
        setCurrentTeacher(null);
        setState({ teachers: [], assignments: {} });
        setClasses([]);
        setGrades([]);
        setSubjects([]);
      } else {
        const teachersData = await api.getTeachers();
        const teachers = mapTeachers(teachersData);
        setCurrentTeacher(null);
        setState({ teachers, assignments: buildAssignments(teachers) });
      }
    } catch {
      setCurrentTeacher(null);
      setState({ teachers: [], assignments: {} });
      setClasses([]);
      setGrades([]);
      setSubjects([]);
    } finally {
      initialLoadDoneRef.current = true;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getTeacherClasses = useCallback(
    (teacherId: string) => {
      const teacher = state.teachers.find((t) => t.id === teacherId);
      if (teacher?.teachingClasses?.length) {
        return teacher.teachingClasses;
      }
      const ids = state.assignments[teacherId] ?? [];
      return classes.filter((c) => ids.includes(c.id));
    },
    [state.assignments, state.teachers, classes]
  );

  const getTeacherClassesByUserId = useCallback(
    (userId: string) => {
      if (user?.role === "teacher") {
        if (currentTeacher?.teachingClasses?.length) {
          return currentTeacher.teachingClasses;
        }
        return classes;
      }
      const teacher = state.teachers.find((t) => String(t.userId) === String(userId));
      if (!teacher) return [];
      return getTeacherClasses(teacher.id);
    },
    [state.teachers, getTeacherClasses, classes, user, currentTeacher]
  );

  const setTeacherClasses = useCallback(async (teacherId: string, classIds: string[]) => {
    const teacher = state.teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    await api.updateAdminTeacher(teacherId, { classIds: classIds.map(Number) });
    setState((prev) => ({
      ...prev,
      assignments: { ...prev.assignments, [teacherId]: classIds },
      teachers: prev.teachers.map((t) =>
        t.id === teacherId ? { ...t, classIds } : t
      ),
    }));
  }, [state.teachers]);

  const addTeacher = useCallback(async (teacher: Omit<TeacherProfile, "id">, image?: File) => {
    const classIds = (teacher.classIds ?? []).map(Number);
    const base = {
      name: teacher.name,
      experience: teacher.experience,
      bio: teacher.bio,
      imageGradient: teacher.imageGradient,
      classIds,
    };

    let created: TeacherProfile;
    if (image) {
      const formData = new FormData();
      formData.append("name", teacher.name);
      formData.append("experience", teacher.experience);
      formData.append("bio", teacher.bio);
      formData.append("imageGradient", teacher.imageGradient);
      teacher.subjectIds?.forEach((id) => formData.append("subjectIds", id));
      teacher.classIds?.forEach((id) => formData.append("classIds", id));
      formData.append("image", image);
      created = (await api.createAdminTeacher(formData)) as TeacherProfile;
    } else {
      const payload: Record<string, unknown> = { ...base };
      if (teacher.subjectIds?.length) {
        payload.subjectIds = teacher.subjectIds.map(Number);
      }
      created = (await api.createAdminTeacher(payload)) as TeacherProfile;
    }
    setState((prev) => ({
      teachers: [...prev.teachers, created],
      assignments: { ...prev.assignments, [created.id]: created.classIds ?? [] },
    }));
    return created;
  }, []);

  const updateTeacher = useCallback(async (id: string, data: Partial<TeacherProfile>, image?: File) => {
    let updated: TeacherProfile;
    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      updated = (await api.updateAdminTeacher(id, formData)) as TeacherProfile;
    } else {
      const payload: Record<string, unknown> = { ...data };
      if (data.subjectIds) {
        payload.subjectIds = data.subjectIds.map(Number);
        delete payload.subject;
        delete payload.subjects;
      }
      if (data.classIds) {
        payload.classIds = data.classIds.map(Number);
      }
      updated = (await api.updateAdminTeacher(id, payload)) as TeacherProfile;
    }
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      assignments: updated.classIds
        ? { ...prev.assignments, [id]: updated.classIds }
        : prev.assignments,
    }));
    return updated;
  }, []);

  const removeTeacher = useCallback(async (id: string) => {
    await api.deleteAdminTeacher(id);
    setState((prev) => {
      const { [id]: _, ...rest } = prev.assignments;
      return {
        teachers: prev.teachers.filter((t) => t.id !== id),
        assignments: rest,
      };
    });
  }, []);

  const addClass = useCallback(async (gradeLevel: string, section: string) => {
    const created = (await api.createAdminClass({ gradeLevel, section })) as SchoolClass;
    setClasses((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar")));
    return created;
  }, []);

  const removeClass = useCallback(async (id: string) => {
    await api.deleteAdminClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setState((prev) => {
      const assignments = { ...prev.assignments };
      for (const teacherId of Object.keys(assignments)) {
        assignments[teacherId] = assignments[teacherId].filter((cid) => cid !== id);
      }
      return { ...prev, assignments };
    });
  }, []);

  const addSubject = useCallback(async (name: string) => {
    const created = (await api.createAdminSubject({ name })) as Subject;
    setSubjects((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar"))
    );
    return created;
  }, []);

  const updateSubject = useCallback(async (id: string, name: string) => {
    const previous = subjects.find((s) => s.id === id);
    const updated = (await api.updateAdminSubject(id, { name })) as Subject;
    setSubjects((prev) =>
      prev
        .map((s) => (s.id === id ? updated : s))
        .sort((a, b) => a.name.localeCompare(b.name, "ar"))
    );
    if (previous && previous.name !== name) {
      setState((prev) => ({
        ...prev,
        teachers: prev.teachers.map((teacher) => {
          const subjectIds = teacher.subjectIds ?? [];
          if (!subjectIds.includes(id)) return teacher;
          const nextSubjects =
            teacher.subjects?.map((subjectName) =>
              subjectName === previous.name ? name : subjectName
            ) ?? [];
          return {
            ...teacher,
            subjects: nextSubjects,
            subject: nextSubjects.join("، "),
          };
        }),
      }));
    }
    return updated;
  }, [subjects]);

  const setSubjectClasses = useCallback(async (id: string, classIds: string[]) => {
    const updated = (await api.updateAdminSubject(id, {
      classIds: classIds.map(Number),
    })) as Subject;
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === id ? { ...subject, ...updated } : subject))
    );
    return updated;
  }, []);

  const removeSubject = useCallback(async (id: string) => {
    let removedName = "";
    setSubjects((prev) => {
      removedName = prev.find((s) => s.id === id)?.name ?? "";
      return prev;
    });
    await api.deleteAdminSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (removedName) {
      setState((prev) => ({
        ...prev,
        teachers: prev.teachers.map((teacher) => {
          const subjectIds = teacher.subjectIds ?? [];
          if (!subjectIds.includes(id)) return teacher;
          const nextSubjects =
            teacher.subjects?.filter((name) => name !== removedName) ?? [];
          return {
            ...teacher,
            subjectIds: subjectIds.filter((subjectId) => subjectId !== id),
            subjects: nextSubjects,
            subject: nextSubjects.join("، "),
          };
        }),
      }));
    }
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        ...state,
        classes,
        grades,
        subjects,
        currentTeacher,
        loading,
        getTeacherClasses,
        getTeacherClassesByUserId,
        setTeacherClasses,
        addTeacher,
        updateTeacher,
        removeTeacher,
        addClass,
        removeClass,
        addSubject,
        updateSubject,
        setSubjectClasses,
        removeSubject,
        refresh,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within SchoolProvider");
  return ctx;
}
